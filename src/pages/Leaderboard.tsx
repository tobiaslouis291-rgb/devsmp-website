import React,{useState,useEffect}from'react'
import{getLeaderboard}from'../lib/auth'
import{useAuth}from'../context/AuthContext'
import{Trophy}from'lucide-react'

export default function Leaderboard(){
  const{user}=useAuth()
  const[data,setData]=useState<any[]>([])
  useEffect(()=>{
    getLeaderboard().then(setData)
    const t=setInterval(()=>getLeaderboard().then(setData),10000)
    return()=>clearInterval(t)
  },[])
  const medals=['🥇','🥈','🥉']
  const fmt=(n:number)=>n.toLocaleString('de-DE')
  return(
    <div className="gp" style={{maxWidth:900}}>
      <div className="afu" style={{marginBottom:28}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
          <Trophy size={24} color="var(--gold)"/>
          <h1 className="tg playfair" style={{fontSize:28,fontWeight:900}}>Leaderboard</h1>
        </div>
        <p style={{color:'var(--text2)',fontSize:14}}>Top players ranked by total profit · Updates every 10s</p>
      </div>
      {data.length===0?(
        <div className="card-flat" style={{padding:48,textAlign:'center'}}>
          <Trophy size={40} color="var(--text2)" style={{margin:'0 auto 14px'}}/>
          <p style={{color:'var(--text2)',fontSize:15}}>No players yet. Be the first to play!</p>
        </div>
      ):(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'40px 1fr 110px 110px 90px',gap:8,padding:'8px 16px',marginBottom:6}}>
            {['#','Player','Profit','Won','Games'].map(h=>(
              <span key={h} style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--text2)'}}>{h}</span>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {data.map((p,i)=>{
              const isMe=p.username===user?.username
              return(
                <div key={p.username} className={`lb-row afu ${i===0?'top1':i===1?'top2':i===2?'top3':''}`}
                  style={{animationDelay:`${i*.04}s`,animationFillMode:'both',opacity:0,border:isMe?'1px solid rgba(201,168,76,.4)':undefined,background:isMe?'rgba(201,168,76,.08)':undefined} as React.CSSProperties}>
                  <div style={{fontSize:18,textAlign:'center'}}>{i<3?medals[i]:<span style={{fontSize:13,color:'var(--text2)',fontWeight:600}}>#{i+1}</span>}</div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold-d),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontFamily:'Playfair Display',fontWeight:700,color:'#1a0e00',flexShrink:0}}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{fontSize:14,fontWeight:600,color:isMe?'var(--gold)':'var(--text1)'}}>{p.username}{isMe&&<span style={{fontSize:9,padding:'1px 6px',borderRadius:10,background:'rgba(201,168,76,.15)',color:'var(--gold)',marginLeft:6}}>YOU</span>}</p>
                      <p style={{fontSize:11,color:'var(--text2)'}}>{p.games_played} games</p>
                    </div>
                  </div>
                  <div>
                    <p style={{fontSize:14,fontWeight:700,fontFamily:'Playfair Display',color:p.profit>=0?'var(--green)':'var(--red)'}}>
                      {p.profit>=0?'+':''}{fmt(p.profit)}
                    </p>
                    <p style={{fontSize:10,color:'var(--text2)'}}>coins</p>
                  </div>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:'var(--green)'}}>+{fmt(p.total_won)}</p>
                    <p style={{fontSize:10,color:'var(--text2)'}}>won</p>
                  </div>
                  <div>
                    <p style={{fontSize:13,fontWeight:600,color:'var(--gold)'}}>{fmt(p.balance)}</p>
                    <p style={{fontSize:10,color:'var(--text2)'}}>balance</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
