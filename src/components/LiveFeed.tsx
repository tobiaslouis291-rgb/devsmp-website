import React,{useState,useEffect}from'react'
import{getLiveEvents}from'../lib/auth'

const GAME_EMOJIS:Record<string,string>={
  Slots:'🎰',Blackjack:'🃏',Roulette:'🎡',Crash:'🚀','Coin Flip':'🪙','Video Poker':'♠️','Coin Flip Duel':'🪙','Dice Duel':'🎲','Dev-SMP Stock':'📈'
}

export default function LiveFeed(){
  const[events,setEvents]=useState<any[]>([])
  useEffect(()=>{
    getLiveEvents().then(setEvents)
    const t=setInterval(()=>getLiveEvents().then(setEvents),5000)
    return()=>clearInterval(t)
  },[])
  if(events.length===0)return null
  const items=[...events,...events]
  return(
    <div style={{background:'rgba(0,0,0,.5)',borderBottom:'1px solid var(--border)',height:34,display:'flex',alignItems:'center',overflow:'hidden',position:'relative',zIndex:99}}>
      <div style={{flexShrink:0,padding:'0 14px',borderRight:'1px solid var(--border)',fontSize:10,fontWeight:700,letterSpacing:'.12em',color:'var(--gold)',textTransform:'uppercase',whiteSpace:'nowrap'}}>
        Live
        <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'var(--green)',marginLeft:6,boxShadow:'0 0 6px var(--green)'}}/>
      </div>
      <div style={{overflow:'hidden',width:'100%'}}>
        <div style={{display:'inline-flex',animation:'ticker 55s linear infinite'}}>
          {items.map((e,i)=>(
            <span key={i} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'0 28px',whiteSpace:'nowrap',fontSize:12,color:e.won?'var(--green)':'var(--red)'}}>
              <span style={{fontSize:14}}>{GAME_EMOJIS[e.game]||'🎮'}</span>
              <span style={{color:'var(--text2)',fontWeight:500}}>{e.username}</span>
              <span style={{fontWeight:600}}>{e.won?`won +${e.amount.toLocaleString()}`:`lost ${e.amount.toLocaleString()}`}</span>
              <span style={{color:'var(--text2)'}}>on {e.game}</span>
              {e.multiplier&&<span style={{color:'var(--gold)',fontWeight:700}}>{parseFloat(e.multiplier).toFixed(2)}×</span>}
              <span style={{color:'var(--text3)',marginLeft:4}}>·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
