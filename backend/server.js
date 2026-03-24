const express=require('express'),cors=require('cors'),crypto=require('crypto')
const Database=require('better-sqlite3')
const app=express(),PORT=process.env.PORT||3001
const API_KEY=process.env.CASINO_API_KEY||'change-this-key'
app.use(cors({origin:'*'}));app.use(express.json())
const auth=(req,res,next)=>req.headers['x-api-key']===API_KEY?next():res.status(401).json({error:'Unauthorized'})

// ── Database setup ───────────────────────────────────────
const db=new Database('/tmp/casino.db')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    mc_username TEXT UNIQUE NOT NULL,
    mc_verified INTEGER DEFAULT 0,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    balance REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_login TEXT NOT NULL,
    total_won REAL DEFAULT 0,
    total_lost REAL DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    stock_portfolio REAL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS live_events (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    game TEXT NOT NULL,
    amount REAL NOT NULL,
    won INTEGER NOT NULL,
    multiplier REAL,
    timestamp INTEGER NOT NULL
  );
`)

// Clean expired sessions periodically
setInterval(()=>{db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())},60000)
setInterval(()=>{db.prepare('DELETE FROM live_events WHERE timestamp < ?').run(Date.now()-86400000)},3600000)

// ── In-memory caches ─────────────────────────────────────
const balCache=new Map()
const pending=new Map()
const verifyCodes=new Map()
const registerCodes=new Map()
const rooms=new Map()
setInterval(()=>{const n=Date.now();for(const[id,r]of rooms)if(n-r.createdAt>600000)rooms.delete(id)},60000)

// ── Health ───────────────────────────────────────────────
app.get('/api/health',(_,res)=>res.json({ok:true,ts:Date.now()}))

// ── Auth endpoints (no X-API-Key needed - called from browser) ──

// Register
app.post('/api/auth/register',(req,res)=>{
  const{username,passwordHash,salt,mcUsername}=req.body
  if(!username||!passwordHash||!salt||!mcUsername)
    return res.status(400).json({error:'Missing fields'})
  if(username.length<3||username.length>20)
    return res.status(400).json({error:'Username: 3–20 characters'})
  if(!/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({error:'Username: letters/numbers/underscore only'})
  const existing=db.prepare('SELECT id FROM users WHERE username=? OR mc_username=?').get(username.toLowerCase(),mcUsername.toLowerCase())
  if(existing) return res.status(409).json({error:'Username or MC account already taken'})
  const id=crypto.randomUUID()
  const now=new Date().toISOString()
  db.prepare('INSERT INTO users (id,username,mc_username,password_hash,salt,balance,created_at,last_login) VALUES (?,?,?,?,?,0,?,?)').run(id,username,mcUsername,passwordHash,salt,now,now)
  res.json({success:true})
})

// Login
app.post('/api/auth/login',(req,res)=>{
  const{username,password}=req.body
  if(!username||!password) return res.status(400).json({error:'Missing fields'})
  const user=db.prepare('SELECT * FROM users WHERE username=?').get(username.toLowerCase())
  if(!user) return res.status(401).json({error:'Wrong username or password'})
  // Client sends the hash directly (computed browser-side)
  // We re-hash with stored salt and compare
  const expectedHash=hashSync(password+user.salt)
  if(expectedHash!==user.password_hash) return res.status(401).json({error:'Wrong username or password'})
  db.prepare('UPDATE users SET last_login=? WHERE id=?').run(new Date().toISOString(),user.id)
  const token=crypto.randomBytes(32).toString('hex')
  const expiresAt=Date.now()+7*86400000
  db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').run(token,user.id,expiresAt)
  const{password_hash,salt,...safeUser}=user
  res.json({success:true,token,user:safeUser})
})


// Get salt for username (needed for client-side hashing)
app.get('/api/auth/salt',(req,res)=>{
  const username=req.query.username
  if(!username) return res.status(400).json({error:'Username required'})
  const user=db.prepare('SELECT salt FROM users WHERE username=?').get(username.toLowerCase())
  if(!user) return res.status(404).json({error:'User not found'})
  res.json({salt:user.salt})
})

// Login with pre-hashed password (from browser Web Crypto)
app.post('/api/auth/login-hash',(req,res)=>{
  const{username,passwordHash}=req.body
  if(!username||!passwordHash) return res.status(400).json({error:'Missing fields'})
  const user=db.prepare('SELECT * FROM users WHERE username=?').get(username.toLowerCase())
  if(!user) return res.status(401).json({error:'Wrong username or password'})
  if(passwordHash!==user.password_hash) return res.status(401).json({error:'Wrong username or password'})
  db.prepare('UPDATE users SET last_login=? WHERE id=?').run(new Date().toISOString(),user.id)
  const token=crypto.randomBytes(32).toString('hex')
  const expiresAt=Date.now()+7*86400000
  db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').run(token,user.id,expiresAt)
  const{password_hash,salt,...safeUser}=user
  res.json({success:true,token,user:{...safeUser,salt:user.salt}})
})

// Get current user (by token)
app.get('/api/auth/me',(req,res)=>{
  const token=req.headers['x-session-token']
  if(!token) return res.status(401).json({error:'No token'})
  const session=db.prepare('SELECT * FROM sessions WHERE token=? AND expires_at>?').get(token,Date.now())
  if(!session) return res.status(401).json({error:'Session expired'})
  const user=db.prepare('SELECT * FROM users WHERE id=?').get(session.user_id)
  if(!user) return res.status(404).json({error:'User not found'})
  // Merge with cached balance if newer
  const cached=balCache.get(user.mc_username.toLowerCase())
  const balance=cached&&cached.balance!==undefined?cached.balance:user.balance
  const{password_hash,salt,...safeUser}=user
  res.json({...safeUser,balance,salt})
})

// Update balance (from game results)
app.post('/api/auth/balance',(req,res)=>{
  const token=req.headers['x-session-token']
  if(!token) return res.status(401).json({error:'No token'})
  const session=db.prepare('SELECT * FROM sessions WHERE token=? AND expires_at>?').get(token,Date.now())
  if(!session) return res.status(401).json({error:'Session expired'})
  const{balance,totalWon,totalLost,gamesPlayed}=req.body
  db.prepare('UPDATE users SET balance=?,total_won=?,total_lost=?,games_played=? WHERE id=?')
    .run(Math.max(0,balance),totalWon,totalLost,gamesPlayed,session.user_id)
  // Queue for plugin
  const user=db.prepare('SELECT * FROM users WHERE id=?').get(session.user_id)
  res.json({success:true})
})

// Mark MC verified
app.post('/api/auth/verify-mc',(req,res)=>{
  const token=req.headers['x-session-token']
  if(!token) return res.status(401).json({error:'No token'})
  const session=db.prepare('SELECT * FROM sessions WHERE token=? AND expires_at>?').get(token,Date.now())
  if(!session) return res.status(401).json({error:'Session expired'})
  db.prepare('UPDATE users SET mc_verified=1 WHERE id=?').run(session.user_id)
  res.json({success:true})
})

// Live events
app.post('/api/auth/live',(req,res)=>{
  const{username,game,amount,won,multiplier}=req.body
  db.prepare('INSERT INTO live_events VALUES (?,?,?,?,?,?,?)').run(crypto.randomUUID(),username,game,amount,won?1:0,multiplier||null,Date.now())
  res.json({ok:true})
})
app.get('/api/auth/live',(req,res)=>{
  const events=db.prepare('SELECT * FROM live_events ORDER BY timestamp DESC LIMIT 50').all()
  res.json(events.map(e=>({...e,won:e.won===1})))
})

// Leaderboard
app.get('/api/auth/leaderboard',(req,res)=>{
  const users=db.prepare('SELECT username,total_won,total_lost,games_played,balance FROM users ORDER BY (total_won-total_lost) DESC LIMIT 100').all()
  res.json(users.map((u,i)=>({...u,profit:u.total_won-u.total_lost,rank:i+1})))
})

// ── MC sync ──────────────────────────────────────────────
app.post('/api/sync/balances',auth,(req,res)=>{
  const{players}=req.body
  if(!Array.isArray(players))return res.status(400).json({error:'Invalid'})
  players.forEach(p=>{
    if(p.name&&typeof p.balance==='number'){
      balCache.set(p.name.toLowerCase(),{balance:p.balance,updatedAt:Date.now()})
      db.prepare('UPDATE users SET balance=? WHERE mc_username=?').run(p.balance,p.name)
    }
  })
  res.json({ok:true,synced:players.length})
})

app.get('/api/sync/pending',auth,(req,res)=>{
  const result=[]
  for(const[name,changes]of pending)result.push({name,changes})
  pending.clear()
  res.json({changes:result})
})

app.get('/api/player/:name',auth,(req,res)=>{
  const cached=balCache.get(req.params.name.toLowerCase())
  if(cached)return res.json({username:req.params.name,balance:cached.balance,online:true})
  const user=db.prepare('SELECT balance FROM users WHERE mc_username=?').get(req.params.name)
  if(user)return res.json({username:req.params.name,balance:user.balance,online:false})
  res.status(404).json({error:'Player not found'})
})

app.post('/api/player/:name/balance',auth,(req,res)=>{
  const{amount,type}=req.body
  const safe=Math.abs(parseFloat(amount));if(isNaN(safe)||safe<=0)return res.status(400).json({error:'Invalid'})
  const key=req.params.name.toLowerCase()
  const cached=balCache.get(key)
  if(cached){
    const newBal=type==='add'?cached.balance+safe:Math.max(0,cached.balance-safe)
    balCache.set(key,{balance:newBal,updatedAt:Date.now()})
    db.prepare('UPDATE users SET balance=? WHERE mc_username=?').run(newBal,req.params.name)
  }
  if(!pending.has(key))pending.set(key,[])
  pending.get(key).push({type,amount:safe})
  res.json({success:true,queued:true})
})

// ── Register & Verify codes ──────────────────────────────
app.post('/api/register/generate',auth,(req,res)=>{
  const{mcUsername}=req.body
  if(!mcUsername)return res.status(400).json({error:'mcUsername required'})
  const code=crypto.randomBytes(3).toString('hex').toUpperCase()
  registerCodes.set(mcUsername.toLowerCase(),{code,expiresAt:Date.now()+600000})
  res.json({code})
})
app.post('/api/register/check',auth,(req,res)=>{
  const{mcUsername,code}=req.body
  if(!mcUsername||!code)return res.status(400).json({error:'Missing fields'})
  const entry=registerCodes.get(mcUsername.toLowerCase())
  if(!entry)return res.json({valid:false,reason:'No pending code. Type /casino register ingame.'})
  if(Date.now()>entry.expiresAt){registerCodes.delete(mcUsername.toLowerCase());return res.json({valid:false,reason:'Code expired'})}
  if(entry.code!==code.toUpperCase())return res.json({valid:false,reason:'Wrong code'})
  registerCodes.delete(mcUsername.toLowerCase())
  res.json({valid:true})
})
app.post('/api/verify/generate',auth,(req,res)=>{
  const{mcUsername}=req.body
  if(!mcUsername)return res.status(400).json({error:'mcUsername required'})
  const code=crypto.randomBytes(3).toString('hex').toUpperCase()
  verifyCodes.set(mcUsername.toLowerCase(),{code,expiresAt:Date.now()+300000})
  res.json({code})
})
app.post('/api/verify/check',auth,(req,res)=>{
  const{mcUsername,code}=req.body
  if(!mcUsername||!code)return res.status(400).json({error:'Missing fields'})
  const entry=verifyCodes.get(mcUsername.toLowerCase())
  if(!entry)return res.json({verified:false,reason:'No pending code'})
  if(Date.now()>entry.expiresAt){verifyCodes.delete(mcUsername.toLowerCase());return res.json({verified:false,reason:'Expired'})}
  if(entry.code!==code.toUpperCase())return res.json({verified:false,reason:'Wrong code'})
  verifyCodes.delete(mcUsername.toLowerCase())
  res.json({verified:true})
})

// ── Lobby ────────────────────────────────────────────────
function resolveRoom(r){
  let result
  if(r.game==='dice'){
    const hr=Math.floor(Math.random()*6)+1,gr=Math.floor(Math.random()*6)+1,tie=hr===gr
    result={winnerId:tie?'tie':hr>gr?r.hostId:r.guestId,winnerName:tie?'Tie':hr>gr?r.hostName:r.guestName,hostRoll:hr,guestRoll:gr,payout:r.bet*2}
  }else{
    const s=['heads','tails'],flip=s[Math.floor(Math.random()*2)],hs=s[Math.floor(Math.random()*2)],gs=hs==='heads'?'tails':'heads'
    const wid=flip===hs?r.hostId:r.guestId
    result={winnerId:wid,winnerName:wid===r.hostId?r.hostName:r.guestName,flip,hostSide:hs,guestSide:gs,payout:r.bet*2}
  }
  r.result=result;r.status='done'
}
app.get('/api/lobby/:game',auth,(req,res)=>res.json([...rooms.values()].filter(r=>r.game===req.params.game&&r.status!=='done')))
app.post('/api/lobby/:game',auth,(req,res)=>{
  const{hostId,hostName,bet}=req.body
  if(!hostId||!hostName||!bet)return res.status(400).json({error:'Missing fields'})
  const r={id:crypto.randomUUID(),game:req.params.game,hostId,hostName,guestId:null,guestName:null,bet:parseInt(bet),status:'waiting',createdAt:Date.now()}
  rooms.set(r.id,r);res.json(r)
})
app.get('/api/lobby/:game/:id',auth,(req,res)=>{const r=rooms.get(req.params.id);r?res.json(r):res.status(404).json({error:'Not found'})})
app.post('/api/lobby/:game/:id/join',auth,(req,res)=>{
  const r=rooms.get(req.params.id)
  if(!r||r.status!=='waiting')return res.status(400).json({error:'Unavailable'})
  const{guestId,guestName}=req.body
  if(!guestId||!guestName||r.hostId===guestId)return res.status(400).json({error:'Invalid'})
  r.guestId=guestId;r.guestName=guestName;r.status='playing'
  setTimeout(()=>resolveRoom(r),900);res.json(r)
})
app.delete('/api/lobby/:game/:id',auth,(req,res)=>{rooms.delete(req.params.id);res.json({ok:true})})

function hashSync(str){
  return crypto.createHash('sha256').update(str).digest('hex')
}

app.listen(PORT,'0.0.0.0',()=>console.log(`Casino Bridge v5 on port ${PORT}`))
