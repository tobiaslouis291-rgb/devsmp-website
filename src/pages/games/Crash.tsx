import React,{useState,useRef,useEffect}from'react'
import{useAuth}from'../../context/AuthContext'
import BetInput from'../../components/BetInput'
import{sounds}from'../../lib/sounds'
import{TrendingUp,AlertTriangle}from'lucide-react'

// House edge ~6%: crash at 1.00 happens 6% of time
function genCrash():number{
  const r=Math.random()
  if(r<0.06)return 1.00
  return Math.max(1.01,0.94/(1-r*0.94))
}

export default function Crash(){
  const{user,placeBet,resolveBet}=useAuth()
  const[bet,setBet]=useState(10);const[phase,setPhase]=useState<'idle'|'running'|'crashed'|'cashedout'>('idle')
  const[mult,setMult]=useState(1.00);const[crashAt,setCrashAt]=useState(1.0)
  const[auto,setAuto]=useState(2.0);const[useAuto,setUseAuto]=useState(false)
  const[betPlaced,setBetPlaced]=useState(false)
  const[history,setHistory]=useState<number[]>([1.4,1.01,3.2,1.8,1.01,6.7,1.2])
  const intRef=useRef<any>(null);const multRef=useRef(1.0)
  const phaseRef=useRef<string>('idle');const betRef=useRef(bet)
  useEffect(()=>{betRef.current=bet},[bet])

  const start=()=>{
    if(!user||betPlaced)return
    if(!placeBet(bet))return
    setBetPlaced(true);const cp=genCrash();setCrashAt(cp)
    setTimeout(()=>{
      setPhase('running');phaseRef.current='running';multRef.current=1.0;setMult(1.0)
      const t0=Date.now()
      intRef.current=setInterval(()=>{
        const el=(Date.now()-t0)/1000
        const m=Math.pow(Math.E,0.06*el)
        multRef.current=m;setMult(parseFloat(m.toFixed(2)))
        if(m>=1.5)sounds.tick()
        if(useAuto&&m>=auto){cashout();return}
        if(m>=cp){
          clearInterval(intRef.current);sounds.crash()
          setPhase('crashed');phaseRef.current='crashed'
          setHistory(p=>[parseFloat(cp.toFixed(2)),...p].slice(0,10))
          resolveBet(betRef.current,0,'Crash');setBetPlaced(false)
          setTimeout(()=>{setPhase('idle');phaseRef.current='idle';setMult(1.0)},3500)
        }
      },100)
    },1200)
  }

  const cashout=()=>{
    if(phaseRef.current!=='running'||!betPlaced)return
    clearInterval(intRef.current);const m=multRef.current
    const payout=Math.floor(betRef.current*m)
    sounds.cashout();resolveBet(betRef.current,payout,'Crash',m)
    setPhase('cashedout');phaseRef.current='cashedout';setBetPlaced(false)
    setHistory(p=>[parseFloat(m.toFixed(2)),...p].slice(0,10))
    setTimeout(()=>{setPhase('idle');phaseRef.current='idle';setMult(1.0)},3500)
  }

  const mc=mult>=10?'var(--gold)':mult>=3?'var(--green)':mult>=2?'var(--blue)':'var(--text1)'
  return(
    <div className="gp">
      <div className="afu" style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:52}}>🚀</div>
        <h1 className="tg playfair" style={{fontSize:30,fontWeight:900,marginTop:8}}>Crash</h1>
        <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>Cash out before crash · House edge 6%</p>
      </div>
      <div className={`afu card ${phase==='crashed'?'lose-flash':phase==='cashedout'?'win-flash':''}`}
        style={{marginBottom:20,padding:36,textAlign:'center',minHeight:220,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:12,right:12,display:'flex',gap:5,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:250}}>
          {history.slice(0,5).map((h,i)=>(
            <span key={i} style={{display:'inline-flex',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:700,background:h<2?'rgba(229,83,75,.13)':'rgba(63,185,80,.13)',color:h<2?'var(--red)':'var(--green)',border:`1px solid ${h<2?'rgba(229,83,75,.25)':'rgba(63,185,80,.25)'}`}}>{h.toFixed(2)}×</span>
          ))}
        </div>
        {phase==='running'&&<div style={{fontSize:42,marginBottom:8,animation:'float .4s ease-in-out infinite'}}>🚀</div>}
        {phase==='crashed'&&<div style={{fontSize:42,marginBottom:8}}>💥</div>}
        {phase==='cashedout'&&<div style={{fontSize:42,marginBottom:8}}>💰</div>}
        {phase==='idle'&&<div style={{fontSize:42,marginBottom:8,opacity:.35}}>🚀</div>}
        <div style={{fontFamily:'Playfair Display',fontWeight:900,fontSize:72,color:phase==='crashed'?'var(--red)':phase==='cashedout'?'var(--gold)':mc,transition:'color .3s',lineHeight:1}}>
          {phase==='idle'?'READY':phase==='crashed'?'CRASHED!':`${mult.toFixed(2)}×`}
        </div>
        {phase==='crashed'&&<p style={{color:'var(--red)',fontSize:14,marginTop:8}}>Crashed at {crashAt.toFixed(2)}×</p>}
        {phase==='cashedout'&&<p style={{color:'var(--gold)',fontSize:14,marginTop:8}}>Cashed out! +{Math.floor(bet*mult).toLocaleString()} coins</p>}
      </div>
      <div className="card-flat" style={{padding:22}}>
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',display:'block',marginBottom:8}}>Bet Amount</label><BetInput value={bet} onChange={setBet} disabled={betPlaced}/></div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,background:'var(--bg3)',borderRadius:8,padding:'10px 14px',border:'1px solid var(--border)'}}>
          <input type="checkbox" id="ac" checked={useAuto} onChange={e=>setUseAuto(e.target.checked)} disabled={betPlaced} style={{width:15,height:15,accentColor:'var(--gold)',cursor:'pointer'}}/>
          <label htmlFor="ac" style={{fontSize:13,color:'var(--text2)',cursor:'pointer'}}>Auto cashout at</label>
          <input type="number" value={auto} onChange={e=>setAuto(parseFloat(e.target.value)||2)} min={1.1} step={0.1} disabled={!useAuto||betPlaced}
            style={{width:75,background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:6,padding:'6px 10px',color:'var(--gold)',fontFamily:'Playfair Display',fontWeight:600,fontSize:14,textAlign:'center'}}/>
          <span style={{fontSize:13,color:'var(--text2)'}}>×</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-gold btn-lg" onClick={start} disabled={betPlaced||phase!=='idle'} style={{flex:1,gap:8}}><TrendingUp size={16}/>Bet & Launch</button>
          {phase==='running'&&betPlaced&&(
            <button className="btn btn-green btn-lg pulse-gold" onClick={cashout} style={{flex:1,gap:8}}><AlertTriangle size={16}/>Cash Out {mult.toFixed(2)}×</button>
          )}
        </div>
      </div>
    </div>
  )
}
