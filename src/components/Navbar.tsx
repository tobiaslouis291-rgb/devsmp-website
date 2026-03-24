import React from'react'
import{Link,useNavigate,useLocation}from'react-router-dom'
import{useAuth}from'../context/AuthContext'
import{Coins,LogOut,Settings,ShieldCheck,ShieldAlert,Trophy,LayoutDashboard,TrendingUp,Home,Users}from'lucide-react'
import{getBridgeConfig}from'../lib/api'

export default function Navbar(){
  const{user,logout}=useAuth()
  const nav=useNavigate();const loc=useLocation()
  const online=getBridgeConfig().enabled
  if(!user)return null
  const links=[
    {to:'/dashboard',icon:<LayoutDashboard size={14}/>,label:'Lobby'},
    {to:'/stock',icon:<TrendingUp size={14}/>,label:'Exchange'},
    {to:'/leaderboard',icon:<Trophy size={14}/>,label:'Leaderboard'},{to:'/team',icon:<Users size={14}/>,label:'Team'},
    {to:'/settings',icon:<Settings size={14}/>,label:'Settings'},
  ]
  return(
    <nav style={{background:'rgba(3,3,10,.97)',borderBottom:'1px solid var(--border)',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 20px rgba(0,0,0,.6)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 20px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
        <Link to="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold-d),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,boxShadow:'0 0 14px var(--gold-glow)'}}>🎰</div>
          <div>
            <span className="tg playfair" style={{fontWeight:700,fontSize:17,letterSpacing:'.04em',display:'block'}}>Dev-SMP Casino</span>
            <span style={{fontSize:9,color:'var(--text3)',letterSpacing:'.08em',textTransform:'uppercase'}}>by Schmesmalo</span>
          </div>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {links.map(l=>(
            <Link key={l.to} to={l.to} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:8,fontSize:12,fontWeight:500,letterSpacing:'.04em',color:loc.pathname===l.to?'var(--gold)':'var(--text2)',background:loc.pathname===l.to?'rgba(201,168,76,.1)':'transparent',transition:'all .18s'}}>
              {l.icon}{l.label}
            </Link>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:user.mcVerified?'var(--green)':'var(--red)'}}>
            {user.mcVerified?<><ShieldCheck size={13}/><span style={{fontWeight:500}}>{user.mcUsername}</span></>:<><ShieldAlert size={13}/><Link to="/verify" style={{color:'var(--red)',textDecoration:'none',fontSize:11,fontWeight:500}}>Verify MC</Link></>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:online?'var(--green)':'var(--text3)'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:online?'var(--green)':'var(--text3)',boxShadow:online?'0 0 5px var(--green)':'none'}}/>
            {online?'MC Live':'Local'}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:7,background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,padding:'7px 13px'}}>
            <Coins size={14} color="var(--gold)"/>
            <span className="playfair" style={{fontWeight:600,fontSize:14,color:'var(--gold)'}}>{user.balance.toLocaleString('de-DE')}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold-d),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display',fontWeight:700,fontSize:13,color:'#1a0e00'}}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span style={{fontSize:13,fontWeight:500}}>{user.username}</span>
          </div>
          <button onClick={()=>{logout();nav('/login')}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text2)',display:'flex',padding:4}}><LogOut size={16}/></button>
        </div>
      </div>
    </nav>
  )
}
