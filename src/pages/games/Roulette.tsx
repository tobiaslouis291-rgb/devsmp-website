import React,{useState}from'react'
import{useAuth}from'../../context/AuthContext'
import BetInput from'../../components/BetInput'
import{sounds}from'../../lib/sounds'

const REDS=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const nc=(n:number)=>n===0?'green':REDS.includes(n)?'red':'black'
type BetType='number'|'red'|'black'|'odd'|'even'|'1-18'|'19-36'|'dozen1'|'dozen2'|'dozen3'
const MULTS:Record<BetType,number>={number:35,red:1,black:1,odd:1,even:1,'1-18':1,'19-36':1,dozen1:2,dozen2:2,dozen3:2}
interface Bet{type:BetType;value?:number;amount:number;label:string}
function wins(b:Bet,r:number):boolean{
  if(b.type==='number')return b.value===r
  if(b.type==='red')return REDS.includes(r)
  if(b.type==='black')return r!==0&&!REDS.includes(r)
  if(b.type==='odd')return r!==0&&r%2!==0
  if(b.type==='even')return r!==0&&r%2===0
  if(b.type==='1-18')return r>=1&&r<=18
  if(b.type==='19-36')return r>=19&&r<=36
  if(b.type==='dozen1')return r>=1&&r<=12
  if(b.type==='dozen2')return r>=13&&r<=24
  if(b.type==='dozen3')return r>=25&&r<=36
  return false
}

export default function Roulette(){
  const{user,placeBet,resolveBet}=useAuth()
  const[chip,setChip]=useState(10)
  const[bets,setBets]=useState<Bet[]>([])
  const[spinning,setSpinning]=useState(false)
  const[result,setResult]=useState<number|null>(null)
  const[angle,setAngle]=useState(0)
  const[outcome,setOutcome]=useState<{win:boolean;total:number;msg:string}|null>(null)

  const addBet=(type:BetType,label:string,value?:number)=>{
    if(!user||(user.balance??0)<chip)return
    setBets(prev=>{
      const ex=prev.find(b=>b.type===type&&b.value===value)
      if(ex)return prev.map(b=>b.type===type&&b.value===value?{...b,amount:b.amount+chip}:b)
      return[...prev,{type,value,amount:chip,label}]
    })
  }

  const total=bets.reduce((s,b)=>s+b.amount,0)

  const spin=async()=>{
    if(!bets.length||spinning)return
    for(const b of bets)if(!placeBet(b.amount))return
    sounds.roulette();setSpinning(true);setOutcome(null)
    const r=Math.floor(Math.random()*37)
    setAngle(a=>a+1800+(r/37)*360+Math.random()*18)
    setTimeout(()=>{
      setResult(r);setSpinning(false)
      let totalPay=0
      bets.forEach(b=>{if(wins(b,r)){totalPay+=b.amount*(MULTS[b.type]+1)}})
      resolveBet(total,totalPay,'Roulette')
      if(totalPay>0)sounds.bigWin();else sounds.lose()
      setOutcome({win:totalPay>0,total:totalPay,msg:totalPay>0?`Number ${r} — You win!`:`Number ${r} — No win`})
      setBets([])
    },4200)
  }

  const nums=Array.from({length:36},(_,i)=>i+1)

  return(
    <div className="gp">
      <div className="afu" style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:52}}>🎡</div>
        <h1 className="tg playfair" style={{fontSize:30,fontWeight:900,marginTop:8}}>Roulette</h1>
        <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>European single zero — House edge 2.7%</p>
      </div>

      {/* Wheel */}
      <div className="afu card" style={{padding:28,marginBottom:20,textAlign:'center'}}>
        <div style={{position:'relative',display:'inline-flex',marginBottom:20}}>
          <div style={{width:160,height:160,borderRadius:'50%',background:'conic-gradient(from 0deg,#1a5c1a 0deg,#c0392b 9.7deg,#1a1a2e 19.4deg,#c0392b 29.1deg,#1a1a2e 38.8deg,#c0392b 48.5deg,#1a1a2e 58.2deg,#c0392b 67.9deg,#1a1a2e 77.6deg,#c0392b 87.3deg,#1a1a2e 97deg,#c0392b 106.7deg,#1a1a2e 116.4deg,#c0392b 126.1deg,#1a1a2e 135.8deg,#c0392b 145.5deg,#1a1a2e 155.2deg,#c0392b 164.9deg,#1a1a2e 174.6deg,#c0392b 184.3deg,#1a1a2e 194deg,#c0392b 203.7deg,#1a1a2e 213.4deg,#c0392b 223.1deg,#1a1a2e 232.8deg,#c0392b 242.5deg,#1a1a2e 252.2deg,#c0392b 261.9deg,#1a1a2e 271.6deg,#c0392b 281.3deg,#1a1a2e 291deg,#c0392b 300.7deg,#1a1a2e 310.4deg,#c0392b 320.1deg,#1a1a2e 329.8deg,#c0392b 339.5deg,#1a1a2e 349.2deg)',border:'5px solid var(--gold)',boxShadow:'0 0 28px rgba(201,168,76,.35)',transition:'transform 4.2s cubic-bezier(.17,.67,.12,.99)',transform:`rotate(${angle}deg)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'radial-gradient(circle,#1c1c2e,#0a0a18)',border:'3px solid var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display',fontWeight:900,fontSize:18,color:result!==null?(nc(result)==='red'?'var(--red)':nc(result)==='green'?'var(--green)':'var(--text1)'):'var(--text2)'}}>
              {spinning?'?':result!==null?result:'?'}
            </div>
          </div>
        </div>
        {outcome&&(
          <div className={`afi ${outcome.win?'win-flash':'lose-flash'}`}
            style={{padding:'12px 20px',borderRadius:10,background:outcome.win?'rgba(201,168,76,.1)':'rgba(229,83,75,.07)',border:`1px solid ${outcome.win?'rgba(201,168,76,.28)':'rgba(229,83,75,.2)'}`,marginTop:8}}>
            <p className="playfair" style={{fontSize:16,fontWeight:700,color:outcome.win?'var(--gold)':'var(--red)'}}>{outcome.msg}</p>
            {outcome.win&&<p style={{fontSize:13,color:'var(--gold-l)',marginTop:3}}>+{outcome.total.toLocaleString()} coins</p>}
          </div>
        )}
      </div>

      {/* Betting table */}
      <div className="card felt" style={{padding:18,marginBottom:20,borderRadius:16}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:3,marginBottom:10}}>
          <button onClick={()=>addBet('number','0',0)} disabled={spinning}
            style={{gridColumn:'1',background:'#1a5c1a',borderRadius:4,border:'1px solid rgba(255,255,255,.15)',color:'white',fontFamily:'Playfair Display',fontWeight:700,fontSize:11,padding:'7px 3px',cursor:'pointer',outline:bets.find(b=>b.type==='number'&&b.value===0)?'2px solid var(--gold)':'none'}}>0</button>
          {nums.map(n=>(
            <button key={n} onClick={()=>addBet('number',String(n),n)} disabled={spinning}
              style={{background:nc(n)==='red'?'#8b1a1a':'#1a1a2e',borderRadius:4,border:'1px solid rgba(255,255,255,.1)',color:'white',fontFamily:'Playfair Display',fontWeight:700,fontSize:10,padding:'6px 1px',cursor:'pointer',outline:bets.find(b=>b.type==='number'&&b.value===n)?'2px solid var(--gold)':'none'}}>
              {n}
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginBottom:5}}>
          {(['dozen1','dozen2','dozen3']as BetType[]).map((t,i)=>(
            <button key={t} onClick={()=>addBet(t,`${['1st','2nd','3rd'][i]} 12`)} disabled={spinning}
              className="btn btn-gold-outline btn-sm" style={{width:'100%',outline:bets.find(b=>b.type===t)?'1px solid var(--gold)':'none'}}>
              {['1st 12','2nd 12','3rd 12'][i]}
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
          {([['1-18','1-18'],['odd','Odd'],['red','🔴 Red'],['black','⚫ Black'],['even','Even'],['19-36','19-36']]as [BetType,string][]).map(([t,l])=>(
            <button key={t} onClick={()=>addBet(t,l)} disabled={spinning}
              className="btn btn-sm" style={{width:'100%',background:'rgba(0,0,0,.35)',border:'1px solid rgba(255,255,255,.15)',color:'white',outline:bets.find(b=>b.type===t)?'1px solid var(--gold)':'none'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="card-flat" style={{padding:22}}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',display:'block',marginBottom:8}}>Chip Size</label>
          <BetInput value={chip} onChange={setChip} disabled={spinning}/>
        </div>
        {bets.length>0&&(
          <div style={{marginBottom:12,display:'flex',flexWrap:'wrap',gap:5}}>
            {bets.map((b,i)=><span key={i} style={{display:'inline-flex',padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:600,background:'rgba(201,168,76,.12)',color:'var(--gold)',border:'1px solid rgba(201,168,76,.25)'}}>{b.label}: {b.amount}</span>)}
            <button className="btn btn-sm" onClick={()=>setBets([])} disabled={spinning} style={{background:'rgba(229,83,75,.1)',border:'1px solid rgba(229,83,75,.25)',color:'var(--red)',padding:'3px 10px',fontSize:10}}>Clear</button>
          </div>
        )}
        <button className="btn btn-gold btn-lg" onClick={spin} disabled={spinning||!bets.length} style={{width:'100%'}}>
          {spinning?'🎡 Spinning…':`Spin (${total.toLocaleString()} coins)`}
        </button>
      </div>
    </div>
  )
}
