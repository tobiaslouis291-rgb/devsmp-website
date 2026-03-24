import React,{useState}from'react'
import{useAuth}from'../../context/AuthContext'
import BetInput from'../../components/BetInput'
import{sounds}from'../../lib/sounds'
type Side='heads'|'tails'
export default function CoinFlip(){
  const{user,placeBet,resolveBet}=useAuth()
  const[bet,setBet]=useState(10);const[chosen,setChosen]=useState<Side>('heads')
  const[flipping,setFlipping]=useState(false);const[result,setResult]=useState<Side|null>(null)
  const[win,setWin]=useState<boolean|null>(null);const[history,setHistory]=useState<Side[]>([])
  const flip=()=>{
    if(!user||flipping)return
    if(!placeBet(bet))return
    setFlipping(true);setResult(null);setWin(null);sounds.coin()
    // House edge: 47% win chance instead of 50%
    const r:Side=Math.random()<0.47?chosen:(chosen==='heads'?'tails':'heads')
    setTimeout(()=>{
      setResult(r);setFlipping(false)
      const w=r===chosen;setWin(w)
      if(w){sounds.bigWin();resolveBet(bet,Math.floor(bet*1.9),'Coin Flip')}
      else{sounds.lose();resolveBet(bet,0,'Coin Flip')}
      setHistory(p=>[r,...p].slice(0,10))
      setTimeout(()=>setWin(null),2500)
    },1800)
  }
  return(
    <div className="gp" style={{maxWidth:580}}>
      <div className="afu" style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:52}}>🪙</div>
        <h1 className="tg playfair" style={{fontSize:30,fontWeight:900,marginTop:8}}>Coin Flip</h1>
        <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>47% win chance · Pays 1.9× · House edge 9%</p>
      </div>
      <div className={`afu card ${win===true?'win-flash':win===false?'lose-flash':''}`} style={{padding:36,marginBottom:20,textAlign:'center'}}>
        <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:28,flexWrap:'wrap'}}>
          {history.map((h,i)=>(
            <div key={i} style={{width:30,height:30,borderRadius:'50%',background:h==='heads'?'linear-gradient(135deg,var(--gold-d),var(--gold))':'linear-gradient(135deg,#333,#666)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:h==='heads'?'#1a0e00':'white',fontWeight:700}}>
              {h==='heads'?'H':'T'}
            </div>
          ))}
          {!history.length&&<span style={{fontSize:12,color:'var(--text3)'}}>No flips yet</span>}
        </div>
        <div style={{width:140,height:140,borderRadius:'50%',margin:'0 auto 28px',background:flipping?'linear-gradient(135deg,var(--gold-d),var(--gold))':result==='heads'?'linear-gradient(135deg,var(--gold-d),var(--gold))':result==='tails'?'linear-gradient(135deg,#2a2a40,#555)':'linear-gradient(135deg,var(--gold-d),var(--gold))',border:'4px solid var(--gold)',boxShadow:'0 0 36px rgba(201,168,76,.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,animation:flipping?'coinSpin 1.8s ease-in-out':'none'}}>
          {flipping?'🪙':result==='heads'?'👑':result==='tails'?'⭐':chosen==='heads'?'👑':'⭐'}
        </div>
        {win!==null&&result&&(
          <div className="afi" style={{padding:'12px 20px',borderRadius:10,background:win?'rgba(201,168,76,.1)':'rgba(229,83,75,.07)',border:`1px solid ${win?'rgba(201,168,76,.28)':'rgba(229,83,75,.2)'}`}}>
            <p className="playfair" style={{fontSize:18,fontWeight:700,color:win?'var(--gold)':'var(--red)'}}>
              {result.toUpperCase()} — {win?`+${Math.floor(bet*1.9).toLocaleString()} coins!`:'You lose.'}
            </p>
          </div>
        )}
        {!flipping&&win===null&&<p style={{color:'var(--text2)',fontSize:14}}>Pick a side and flip!</p>}
        {flipping&&<p style={{color:'var(--text2)',fontSize:14}}>Flipping…</p>}
      </div>
      <div className="card-flat" style={{padding:22}}>
        <div style={{display:'flex',gap:10,marginBottom:18}}>
          {(['heads','tails']as Side[]).map(s=>(
            <button key={s} onClick={()=>setChosen(s)} disabled={flipping}
              style={{flex:1,padding:'18px 14px',borderRadius:12,border:`2px solid ${chosen===s?'var(--gold)':'var(--border)'}`,background:chosen===s?'rgba(201,168,76,.1)':'var(--bg3)',cursor:'pointer',transition:'all .18s',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              <span style={{fontSize:32}}>{s==='heads'?'👑':'⭐'}</span>
              <span className="playfair" style={{fontWeight:700,fontSize:13,color:chosen===s?'var(--gold)':'var(--text2)',textTransform:'capitalize'}}>{s}</span>
            </button>
          ))}
        </div>
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',display:'block',marginBottom:8}}>Bet Amount</label><BetInput value={bet} onChange={setBet} disabled={flipping}/></div>
        <button className="btn btn-gold btn-lg" onClick={flip} disabled={flipping||(user?.balance??0)<bet} style={{width:'100%',fontSize:15}}>
          {flipping?'🪙 Flipping…':'Flip Coin'}
        </button>
      </div>
    </div>
  )
}
