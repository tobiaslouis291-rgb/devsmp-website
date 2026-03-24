import React,{useState}from'react'
import{useAuth}from'../../context/AuthContext'
import BetInput from'../../components/BetInput'
import{sounds}from'../../lib/sounds'
import{RefreshCw}from'lucide-react'

type Suit='♠'|'♥'|'♦'|'♣'
type Card={value:string;suit:Suit;num:number;held:boolean}
type Phase='bet'|'draw'|'result'

const RANKS=[
  {name:'Royal Flush',mult:800,check:(c:Card[])=>isFlush(c)&&isStraight(c)&&c.some(x=>x.value==='A')},
  {name:'Straight Flush',mult:50,check:(c:Card[])=>isFlush(c)&&isStraight(c)},
  {name:'Four of a Kind',mult:25,check:(c:Card[])=>hasN(c,4)},
  {name:'Full House',mult:9,check:(c:Card[])=>hasN(c,3)&&hasPair(c)},
  {name:'Flush',mult:6,check:isFlush},
  {name:'Straight',mult:4,check:(c:Card[])=>isStraight(c)},
  {name:'Three of a Kind',mult:3,check:(c:Card[])=>hasN(c,3)},
  {name:'Two Pair',mult:2,check:hasTwoPair},
  {name:'Jacks or Better',mult:1,check:jacksOrBetter},
]
function vmap(cards:Card[]){const m:Record<string,number>={};cards.forEach(c=>{m[c.value]=(m[c.value]||0)+1});return m}
function hasN(c:Card[],n:number){return Object.values(vmap(c)).includes(n)}
function hasPair(c:Card[]){return Object.values(vmap(c)).filter(v=>v===2).length>=1}
function hasTwoPair(c:Card[]){return Object.values(vmap(c)).filter(v=>v===2).length===2}
function isFlush(c:Card[]){return new Set(c.map(x=>x.suit)).size===1}
function isStraight(c:Card[]){
  const nums=[...new Set(c.map(x=>x.value==='A'?14:x.num))].sort((a,b)=>a-b)
  return nums.length===5&&nums[4]-nums[0]===4
}
function jacksOrBetter(c:Card[]){
  const v=vmap(c);return['J','Q','K','A'].some(h=>v[h]>=2)
}
function evalHand(c:Card[]){for(const r of RANKS)if(r.check(c))return r;return null}

function makeDeck():Card[]{
  const suits:Suit[]=['♠','♥','♦','♣'],vals=['2','3','4','5','6','7','8','9','10','J','Q','K','A'],d:Card[]=[]
  for(const s of suits)for(const v of vals){
    const num=v==='A'?1:['J','Q','K'].includes(v)?10:parseInt(v)
    d.push({value:v,suit:s,num,held:false})
  }
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
  return d
}

function CardEl({card,onClick,phase}:{card:Card;onClick?:()=>void;phase:Phase}){
  const red=card.suit==='♥'||card.suit==='♦'
  return(
    <div onClick={onClick}
      style={{width:72,height:104,background:'#f8f8f6',borderRadius:8,border:`2px solid ${card.held?'var(--gold)':'#ccc'}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:phase==='draw'?'pointer':'default',position:'relative',boxShadow:card.held?'0 0 14px rgba(201,168,76,.45)':'0 4px 12px rgba(0,0,0,.5)',transition:'all .18s',transform:card.held?'translateY(-10px)':'none',animation:'cardSlide .3s ease both',color:red?'#c0392b':'#1a1a2e'}}>
      {card.held&&<div style={{position:'absolute',top:-22,left:'50%',transform:'translateX(-50%)',fontSize:9,fontFamily:'Inter',fontWeight:700,color:'var(--gold)',letterSpacing:'.1em',textTransform:'uppercase'}}>HOLD</div>}
      <div style={{position:'absolute',top:5,left:7,fontSize:13,fontWeight:900,lineHeight:1.2}}>{card.value}<br/><span style={{fontSize:10}}>{card.suit}</span></div>
      <div style={{fontSize:26}}>{card.suit}</div>
    </div>
  )
}

export default function Poker(){
  const{user,placeBet,resolveBet}=useAuth()
  const[bet,setBet]=useState(10);const[phase,setPhase]=useState<Phase>('bet')
  const[hand,setHand]=useState<Card[]>([]);const[dk,setDk]=useState<Card[]>([])
  const[handResult,setHandResult]=useState<typeof RANKS[0]|null>(null);const[payout,setPayout]=useState(0)

  const deal=()=>{
    if(!placeBet(bet))return
    const d=makeDeck()
    const h=[d.pop()!,d.pop()!,d.pop()!,d.pop()!,d.pop()!].map(c=>({...c,held:false}))
    sounds.cardDeal();setTimeout(()=>sounds.cardDeal(),120);setTimeout(()=>sounds.cardDeal(),240);setTimeout(()=>sounds.cardDeal(),360);setTimeout(()=>sounds.cardDeal(),480)
    setHand(h);setDk(d);setPhase('draw');setHandResult(null)
  }

  const toggle=(i:number)=>setHand(prev=>prev.map((c,idx)=>idx===i?{...c,held:!c.held}:c))

  const draw=()=>{
    const d=[...dk]
    const newHand=hand.map(c=>c.held?c:{...d.pop()!,held:false})
    sounds.cardDeal();setHand(newHand);setDk(d)
    const r=evalHand(newHand);setHandResult(r)
    const pay=r?bet*r.mult:0;setPayout(pay)
    resolveBet(bet,pay,'Video Poker')
    if(pay>=bet*25)sounds.jackpot()
    else if(pay>0)sounds.bigWin()
    else sounds.lose()
    setPhase('result')
  }

  return(
    <div className="gp">
      <div className="afu" style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:52}}>♠️</div>
        <h1 className="tg playfair" style={{fontSize:30,fontWeight:900,marginTop:8}}>Video Poker</h1>
        <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>Jacks or Better — House edge ~2%</p>
      </div>

      <div className={`afu card felt ${phase==='result'&&handResult?'win-flash':phase==='result'&&!handResult?'lose-flash':''}`}
        style={{padding:28,marginBottom:20,borderRadius:20,minHeight:200,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:18}}>
        {hand.length>0?(
          <>
            {phase==='draw'&&<p style={{fontSize:11,color:'rgba(255,255,255,.4)',letterSpacing:'.09em',textTransform:'uppercase'}}>Tap cards to hold</p>}
            <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',marginTop:phase==='draw'?8:0}}>
              {hand.map((c,i)=><CardEl key={i} card={c} onClick={()=>phase==='draw'?toggle(i):undefined} phase={phase}/>)}
            </div>
          </>
        ):(
          <p style={{color:'var(--text2)',fontFamily:'Playfair Display',fontSize:17,opacity:.6}}>Deal to start</p>
        )}
        {phase==='result'&&(
          <div className="afi" style={{width:'100%',textAlign:'center',padding:'12px 20px',borderRadius:10,background:handResult?'rgba(201,168,76,.1)':'rgba(229,83,75,.07)',border:`1px solid ${handResult?'rgba(201,168,76,.28)':'rgba(229,83,75,.2)'}`}}>
            <p className="playfair" style={{fontSize:18,fontWeight:700,color:handResult?'var(--gold)':'var(--red)'}}>
              {handResult?`${handResult.name} — ×${handResult.mult}`:'No winning hand'}
            </p>
            {payout>0&&<p style={{fontSize:13,color:'var(--gold-l)',marginTop:3}}>+{payout.toLocaleString()} coins</p>}
          </div>
        )}
      </div>

      {/* Pay table */}
      <div className="card-flat" style={{padding:18,marginBottom:16}}>
        <p style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>Pay Table</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'4px 14px'}}>
          {RANKS.map(r=>(
            <React.Fragment key={r.name}>
              <span style={{fontSize:12,color:handResult?.name===r.name?'var(--gold)':'var(--text2)',fontWeight:handResult?.name===r.name?600:400}}>{r.name}</span>
              <span className="playfair" style={{fontSize:12,color:'var(--gold)',fontWeight:600,textAlign:'right'}}>×{r.mult}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card-flat" style={{padding:22}}>
        {(phase==='bet'||phase==='result')&&<div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',display:'block',marginBottom:8}}>Bet</label><BetInput value={bet} onChange={setBet}/></div>}
        {phase==='draw'?(
          <button className="btn btn-gold btn-lg" onClick={draw} style={{width:'100%',gap:10}}>
            <RefreshCw size={16}/> Draw Cards
          </button>
        ):(
          <button className="btn btn-gold btn-lg" onClick={deal} style={{width:'100%'}}>
            {phase==='result'?'New Hand':'Deal'}
          </button>
        )}
      </div>
    </div>
  )
}
