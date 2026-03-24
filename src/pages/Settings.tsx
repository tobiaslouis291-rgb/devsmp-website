import React,{useState}from'react'
import{useAuth}from'../context/AuthContext'
import{getBridgeConfig,saveBridgeConfig}from'../lib/api'
import{Shield,Server,Save,CheckCircle,ShieldCheck,ShieldAlert}from'lucide-react'
import{Link}from'react-router-dom'
export default function Settings(){
  const{user}=useAuth();const[cfg,setCfg]=useState(getBridgeConfig);const[saved,setSaved]=useState(false)
  const save=()=>{saveBridgeConfig(cfg);setSaved(true);setTimeout(()=>setSaved(false),2500)}
  if(!user)return null
  return(
    <div className="gp" style={{maxWidth:700}}>
      <div className="afu" style={{marginBottom:28}}>
        <h1 className="tg playfair" style={{fontSize:26,fontWeight:900}}>Settings</h1>
        <p style={{color:'var(--text2)',marginTop:5}}>Minecraft connection & account info</p>
      </div>
      {/* MC Status */}
      <div className="afu card" style={{padding:24,marginBottom:18}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          {user.mcVerified?<ShieldCheck size={18} color="var(--green)"/>:<ShieldAlert size={18} color="var(--red)"/>}
          <h2 className="playfair" style={{fontSize:16,fontWeight:600}}>Minecraft Account</h2>
          <span style={{marginLeft:'auto',display:'inline-flex',padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:600,background:user.mcVerified?'rgba(63,185,80,.12)':'rgba(229,83,75,.12)',color:user.mcVerified?'var(--green)':'var(--red)',border:`1px solid ${user.mcVerified?'rgba(63,185,80,.25)':'rgba(229,83,75,.25)'}`}}>
            {user.mcVerified?'✓ Verified':'✗ Unverified'}
          </span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 16px'}}>
            <p style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:3}}>Linked Account</p>
            <p className="playfair" style={{fontSize:16,fontWeight:700,color:'var(--gold)'}}>{user.mcUsername}</p>
          </div>
          {!user.mcVerified&&<Link to="/verify" className="btn btn-red" style={{padding:'10px 20px',gap:7}}><ShieldAlert size={14}/>Verify Now</Link>}
        </div>
        <p style={{fontSize:12,color:'var(--text2)',marginTop:10,lineHeight:1.6}}>
          {user.mcVerified?'✓ Verified. Balance syncs automatically when MC Bridge is enabled.':'⚠ Type /casino code in Minecraft, then enter the code on the Verify page.'}
        </p>
      </div>
      {/* Bridge config */}
      <div className="afu card" style={{padding:24,marginBottom:18}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <Server size={18} color="var(--gold)"/>
          <h2 className="playfair" style={{fontSize:16,fontWeight:600}}>MC Server Bridge</h2>
          <span style={{marginLeft:'auto',display:'inline-flex',padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:600,background:cfg.enabled?'rgba(63,185,80,.12)':'rgba(229,83,75,.12)',color:cfg.enabled?'var(--green)':'var(--red)',border:`1px solid ${cfg.enabled?'rgba(63,185,80,.25)':'rgba(229,83,75,.25)'}`}}>
            {cfg.enabled?'Enabled':'Disabled'}
          </span>
        </div>
        <div style={{background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.15)',borderRadius:8,padding:'11px 14px',marginBottom:18,fontSize:13,color:'var(--text2)',lineHeight:1.7}}>
          <strong style={{color:'var(--gold)'}}>How it works:</strong> Install CasinoBridge.jar on your Spigot server. Players type <code style={{background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4,fontFamily:'monospace'}}>/casino code</code> in-game to get a verification code — no codes on the website.
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',marginBottom:7}}>Backend URL</label>
            <input className="inp" value={cfg.backendUrl} onChange={e=>setCfg(c=>({...c,backendUrl:e.target.value}))} placeholder="https://casino-bridge.up.railway.app"/>
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',marginBottom:7}}>API Key</label>
            <input className="inp" value={cfg.apiKey} onChange={e=>setCfg(c=>({...c,apiKey:e.target.value}))} placeholder="your-secret-key" type="password"/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:12,background:'var(--bg3)',borderRadius:8,padding:'12px 14px',border:'1px solid var(--border)',cursor:'pointer'}}>
            <input type="checkbox" checked={cfg.enabled} onChange={e=>setCfg(c=>({...c,enabled:e.target.checked}))} style={{width:16,height:16,accentColor:'var(--gold)',cursor:'pointer'}}/>
            <div><p style={{fontWeight:600,fontSize:14}}>Enable MC Bridge</p><p style={{fontSize:12,color:'var(--text2)'}}>Disabled = local balances only</p></div>
          </label>
          <button className="btn btn-gold" onClick={save} style={{padding:'11px 22px',alignSelf:'flex-start',gap:7}}>
            {saved?<><CheckCircle size={14}/>Saved!</>:<><Save size={14}/>Save Settings</>}
          </button>
        </div>
      </div>
      {/* Setup guide */}
      <div className="card" style={{padding:24,marginBottom:18}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}><Shield size={18} color="var(--gold)"/><h2 className="playfair" style={{fontSize:16,fontWeight:600}}>Setup Guide</h2></div>
        <ol style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10}}>
          {['Copy CasinoBridge.jar (from ZIP → minecraft-plugin/) to your server /plugins/ folder','Install Vault + EssentialsX (or any economy plugin)','Start server → edit plugins/CasinoBridge/config.yml: set api-key and backend-url','cd backend && npm install && CASINO_API_KEY=yourkey node server.js','Enter backend URL + API key above → Enable → Save','Players type /casino code in-game to get their 6-char verification code'].map((s,i)=>(
            <li key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:'rgba(201,168,76,.13)',border:'1px solid rgba(201,168,76,.26)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontFamily:'Playfair Display',fontWeight:700,color:'var(--gold)',flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:13,color:'var(--text2)',paddingTop:2}}>{s}</span>
            </li>
          ))}
        </ol>
      </div>
      {/* Account */}
      <div className="card" style={{padding:24}}>
        <h2 className="playfair" style={{fontSize:16,fontWeight:600,marginBottom:14}}>Account Info</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          {[['Username',user.username],['MC Account',user.mcUsername],['Member Since',new Date(user.createdAt).toLocaleDateString('de-DE')],['Games Played',String(user.gamesPlayed)],['Total Won',`${user.totalWon.toLocaleString()} coins`],['Balance',`${user.balance.toLocaleString()} coins`]].map(([l,v])=>(
            <div key={l} style={{background:'var(--bg1)',borderRadius:8,padding:'10px 14px'}}>
              <p style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>{l}</p>
              <p style={{fontSize:13,fontWeight:600}}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
