import { useAuth } from '../context/AuthContext'
import { Minus, Plus } from 'lucide-react'
interface Props{value:number;onChange:(v:number)=>void;min?:number;max?:number;disabled?:boolean}
export default function BetInput({value,onChange,min=1,max,disabled}:Props){
  const{user}=useAuth()
  const maxBet=max??(user?.balance??1000)
  const set=(v:number)=>onChange(Math.min(Math.max(min,Math.round(v)),maxBet))
  return(
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <button className="btn btn-gold-outline btn-sm" onClick={()=>set(value-10)} disabled={disabled||value<=min} style={{padding:'8px 11px',flexShrink:0}}><Minus size={13}/></button>
        <div style={{flex:1,position:'relative'}}>
          <input type="number" className="inp" value={value} onChange={e=>set(Number(e.target.value))} min={min} max={maxBet} disabled={disabled}
            style={{textAlign:'center',fontFamily:'Playfair Display',fontWeight:600,fontSize:17,color:'var(--gold)',paddingRight:42}}/>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:10,color:'var(--text2)',letterSpacing:'.05em'}}>COINS</span>
        </div>
        <button className="btn btn-gold-outline btn-sm" onClick={()=>set(value+10)} disabled={disabled||value>=maxBet} style={{padding:'8px 11px',flexShrink:0}}><Plus size={13}/></button>
      </div>
      <div style={{display:'flex',gap:5}}>
        {[10,50,100,500,1000].map(p=>(
          <button key={p} className="btn btn-sm" onClick={()=>set(p)} disabled={disabled||p>maxBet}
            style={{flex:1,padding:'5px 2px',background:value===p?'rgba(201,168,76,.13)':'var(--bg3)',border:`1px solid ${value===p?'var(--gold)':'var(--border)'}`,color:value===p?'var(--gold)':'var(--text2)',fontSize:11,fontWeight:600}}>{p>=1000?'1k':p}</button>
        ))}
        <button className="btn btn-sm" onClick={()=>set(Math.floor(maxBet/2))} disabled={disabled} style={{flex:1,padding:'5px 2px',background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:11}}>½</button>
        <button className="btn btn-sm" onClick={()=>set(maxBet)} disabled={disabled} style={{flex:1,padding:'5px 2px',background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:11}}>Max</button>
      </div>
    </div>
  )
}
