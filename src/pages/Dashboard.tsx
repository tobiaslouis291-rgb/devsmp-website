import{Link}from'react-router-dom'
import{useAuth}from'../context/AuthContext'
import{Coins,TrendingUp,TrendingDown,Gamepad2,Trophy,Users,ShieldAlert,Zap}from'lucide-react'

const SOLO=[
  {id:'slots',emoji:'🎰',name:'Slots',desc:'Spin the reels',color:'#c9a84c',rtp:'94%',hot:true},
  {id:'blackjack',emoji:'🃏',name:'Blackjack',desc:'Beat the dealer to 21',color:'#58a6ff',rtp:'98%'},
  {id:'roulette',emoji:'🎡',name:'Roulette',desc:'European single zero',color:'#e5534b',rtp:'97%'},
  {id:'crash',emoji:'🚀',name:'Crash',desc:'Cash out before crash',color:'#3fb950',rtp:'96%',hot:true},
  {id:'poker',emoji:'♠️',name:'Video Poker',desc:'Jacks or Better',color:'#e67e22',rtp:'98%'},
  {id:'coinflip',emoji:'🪙',name:'Coin Flip',desc:'50/50 double or nothing',color:'#bc8cff',rtp:'95%'},
]
const MULTI=[
  {id:'lobby/coinflip',emoji:'🪙',name:'Coin Flip Duel',desc:'Challenge a player – winner takes pot',color:'#e5534b'},
  {id:'lobby/dice',emoji:'🎲',name:'Dice Duel',desc:'Highest roll takes the pot',color:'#58a6ff'},
]

export default function Dashboard(){
  const{user}=useAuth(); if(!user) return null
  const profit=user.totalWon-user.totalLost
  const fmt=(n:number)=>n.toLocaleString('de-DE')
  return(
    <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 20px',position:'relative',zIndex:1}}>
      {!user.mcVerified&&(
        <div className="afu afi" style={{background:'rgba(229,83,75,.08)',border:'1px solid rgba(229,83,75,.2)',borderRadius:12,padding:'12px 20px',marginBottom:22,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}><ShieldAlert size={16} color="var(--red)"/><p style={{fontSize:13}}>Minecraft account <strong style={{color:'var(--gold)'}}>{user.mcUsername}</strong> not verified — balance won't sync with server.</p></div>
          <Link to="/verify" className="btn btn-red btn-sm" style={{flexShrink:0}}>Verify Now</Link>
        </div>
      )}

      {/* Stats */}
      <div className="afu card" style={{padding:'22px 26px',marginBottom:28,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,.07),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <p style={{fontSize:11,color:'var(--text2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Welcome back,</p>
            <h1 className="tg playfair" style={{fontSize:26,fontWeight:700}}>{user.username}</h1>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {[
              {icon:<Coins size={14} color="var(--gold)"/>,l:'Balance',v:`${fmt(user.balance)}`,c:'var(--gold)'},
              {icon:<TrendingUp size={14} color="var(--green)"/>,l:'Won',v:`+${fmt(user.totalWon)}`,c:'var(--green)'},
              {icon:<TrendingDown size={14} color="var(--red)"/>,l:'Lost',v:`-${fmt(user.totalLost)}`,c:'var(--red)'},
              {icon:<Gamepad2 size={14} color="var(--text2)"/>,l:'Games',v:String(user.gamesPlayed),c:'var(--text2)'},
            ].map(s=>(
              <div key={s.l} className="stat-card">
                <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3}}>{s.icon}<span style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em'}}>{s.l}</span></div>
                <div className="playfair" style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        {profit!==0&&<div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:7}}>
          <Trophy size={12} color={profit>0?'var(--green)':'var(--red)'}/>
          <span style={{fontSize:12,color:profit>0?'var(--green)':'var(--red)'}}>Net profit: {profit>0?'+':''}{fmt(profit)} coins</span>
        </div>}
      </div>

      {/* PvP */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <Users size={16} color="var(--gold)"/>
        <h2 className="tg playfair" style={{fontSize:17,fontWeight:600}}>Player vs Player</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12,marginBottom:28}}>
        {MULTI.map((g,i)=>(
          <Link to={`/games/${g.id}`} key={g.id} style={{textDecoration:'none',animationDelay:`${i*.06}s`,animationFillMode:'both',opacity:0} as React.CSSProperties} className="afu">
            <div className="card" style={{padding:20,cursor:'pointer',transition:'all .2s',position:'relative',overflow:'hidden'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-4px)';el.style.borderColor=g.color+'50'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='';el.style.borderColor=''}}>
              <div style={{position:'absolute',top:-15,right:-15,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${g.color}12,transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <span style={{fontSize:36}}>{g.emoji}</span>
                <span className="badge-blue" style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',background:'rgba(88,166,255,.12)',color:'var(--blue)',border:'1px solid rgba(88,166,255,.25)'}}>PvP</span>
              </div>
              <h3 className="playfair" style={{fontSize:15,fontWeight:700,marginBottom:4}}>{g.name}</h3>
              <p style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>{g.desc}</p>
              <span style={{fontSize:11,color:g.color,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>PLAY →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Solo */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <Gamepad2 size={16} color="var(--gold)"/>
        <h2 className="tg playfair" style={{fontSize:17,fontWeight:600}}>Solo Games</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
        {SOLO.map((g,i)=>(
          <Link to={`/games/${g.id}`} key={g.id} style={{textDecoration:'none',animationDelay:`${(i+2)*.06}s`,animationFillMode:'both',opacity:0} as React.CSSProperties} className="afu">
            <div className="card" style={{padding:20,cursor:'pointer',transition:'all .2s',position:'relative',overflow:'hidden'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-4px)';el.style.borderColor=g.color+'50'}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='';el.style.borderColor=''}}>
              <div style={{position:'absolute',top:-15,right:-15,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${g.color}12,transparent 70%)`,pointerEvents:'none'}}/>
              {g.hot&&<div style={{position:'absolute',top:12,right:12,display:'flex',alignItems:'center',gap:3,background:'rgba(229,83,75,.15)',border:'1px solid rgba(229,83,75,.3)',borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--red)'}}><Zap size={9}/>HOT</div>}
              <div style={{fontSize:34,marginBottom:12}}>{g.emoji}</div>
              <h3 className="playfair" style={{fontSize:14,fontWeight:700,marginBottom:3}}>{g.name}</h3>
              <p style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>{g.desc}</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span className="badge-gold" style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:20,fontSize:9,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',background:'rgba(201,168,76,.12)',color:'var(--gold)',border:'1px solid rgba(201,168,76,.25)'}}>RTP {g.rtp}</span>
                <span style={{fontSize:11,color:g.color,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>PLAY →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <p style={{textAlign:'center',marginTop:36,fontSize:11,color:'var(--text3)'}}>🔒 Secure · 🪙 Vault Economy · 18+ · Gamble responsibly</p>
    </div>
  )
}
