import React,{useState,useEffect,useCallback}from'react'
import{useParams,useNavigate}from'react-router-dom'
import{useAuth}from'../../context/AuthContext'
import{getLobbyRooms,createRoom,joinRoom,getRoom,deleteRoom}from'../../lib/api'
import type{LobbyRoom}from'../../types'
import BetInput from'../../components/BetInput'
import{sounds}from'../../lib/sounds'
import{Users,Plus,RefreshCw,Trash2,Clock,Swords,Trophy}from'lucide-react'

const INFO:Record<string,{name:string;emoji:string;desc:string}>={
  coinflip:{name:'Coin Flip Duel',emoji:'🪙',desc:'Host picks heads or tails — winner takes the pot'},
  dice:{name:'Dice Duel',emoji:'🎲',desc:'Both roll a die — highest number wins the pot'},
}

export default function MultiLobby(){
  const{game}=useParams<{game:string}>()
  const{user,placeBet,resolveBet,refreshUser}=useAuth()
  const nav=useNavigate()
  const[rooms,setRooms]=useState<LobbyRoom[]>([])
  const[myRoom,setMyRoom]=useState<LobbyRoom|null>(null)
  const[bet,setBet]=useState(50)
  const[creating,setCreating]=useState(false)
  const[joining,setJoining]=useState<string|null>(null)
  const[result,setResult]=useState<LobbyRoom|null>(null)
  const ginfo=INFO[game!]??INFO.dice

  const refresh=useCallback(async()=>{
    const list=await getLobbyRooms(game!)
    setRooms(list.filter(r=>r.hostId!==user?.id))
    if(myRoom&&myRoom.status!=='done'){
      const up=await getRoom(game!,myRoom.id)
      if(up){
        setMyRoom(up)
        if(up.status==='done'&&up.result){
          sounds.versus()
          const won=up.result.winnerId===user?.id
          const tie=up.result.winnerId==='tie'
          if(won){sounds.bigWin();resolveBet(up.bet,up.result.payout,'Coin Flip Duel')}
          else if(tie){resolveBet(up.bet,up.bet,'Coin Flip Duel');sounds.coin()}
          else{resolveBet(up.bet,0,'Coin Flip Duel');sounds.lose()}
          setResult(up)
        }
      }
    }
  },[game,myRoom,user?.id])

  useEffect(()=>{
    refresh()
    const t=setInterval(refresh,2000)
    return()=>clearInterval(t)
  },[refresh])

  const handleCreate=async()=>{
    if(!user||creating)return
    if(!placeBet(bet))return
    setCreating(true)
    const r=await createRoom(game!,user.id,user.username,bet)
    setMyRoom(r);setCreating(false);sounds.click()
  }

  const handleJoin=async(room:LobbyRoom)=>{
    if(!user||joining)return
    if(!placeBet(room.bet))return
    setJoining(room.id)
    const up=await joinRoom(game!,room.id,user.id,user.username)
    setJoining(null)
    if(up){setMyRoom(up);sounds.versus()}
  }

  const handleCancel=async()=>{
    if(!myRoom)return
    await deleteRoom(game!,myRoom.id)
    if(myRoom.status==='waiting')resolveBet(myRoom.bet,myRoom.bet,'Coin Flip Duel')
    setMyRoom(null);setResult(null)
  }

  const age=(ts:number)=>{const s=Math.floor((Date.now()-ts)/1000);return s<60?`${s}s ago`:`${Math.floor(s/60)}m ago`}

  const isWinner=result?.result?.winnerId===user?.id
  const isTie=result?.result?.winnerId==='tie'

  return(
    <div className="gp">
      <div className="afu" style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:52}}>{ginfo.emoji}</div>
        <h1 className="tg playfair" style={{fontSize:30,fontWeight:900,marginTop:8}}>{ginfo.name}</h1>
        <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>{ginfo.desc}</p>
        <div style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:600,background:'rgba(88,166,255,.12)',color:'var(--blue)',border:'1px solid rgba(88,166,255,.25)',marginTop:8,letterSpacing:'.06em',textTransform:'uppercase'}}>Live PvP · 2s polling</div>
      </div>

      {/* Result */}
      {result&&result.result&&(
        <div className={`afu card ${isWinner?'win-flash':isTie?'':'lose-flash'}`}
          style={{padding:32,marginBottom:24,textAlign:'center',borderColor:isWinner?'rgba(201,168,76,.4)':isTie?'rgba(88,166,255,.3)':'rgba(229,83,75,.3)'}}>
          <div style={{fontSize:52,marginBottom:12}}>{isWinner?'🏆':isTie?'🤝':'💀'}</div>
          <h2 className="playfair" style={{fontSize:26,fontWeight:900,color:isWinner?'var(--gold)':isTie?'var(--blue)':'var(--red)',marginBottom:10}}>
            {isTie?'Tie — Refunded!':isWinner?'You Won!':'You Lost!'}
          </h2>
          {game==='dice'&&result.result.hostRoll!=null&&(
            <div style={{display:'flex',justifyContent:'center',gap:32,marginBottom:16}}>
              {[{name:result.hostName,roll:result.result.hostRoll,id:result.hostId},{name:result.guestName!,roll:result.result.guestRoll!,id:result.guestId!}].map(p=>(
                <div key={p.id} style={{textAlign:'center'}}>
                  <div style={{fontSize:36,marginBottom:4}}>🎲</div>
                  <p style={{fontSize:12,color:'var(--text2)',marginBottom:4}}>{p.name}</p>
                  <p className="playfair" style={{fontSize:28,fontWeight:900,color:result.result!.winnerId===p.id?'var(--gold)':'var(--text2)'}}>{p.roll}</p>
                </div>
              ))}
            </div>
          )}
          {game==='coinflip'&&result.result.flip&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:48}}>{result.result.flip==='heads'?'👑':'⭐'}</div>
              <p style={{color:'var(--text2)',fontSize:13,marginTop:6,textTransform:'capitalize'}}>Landed: <strong style={{color:'var(--gold)'}}>{result.result.flip}</strong></p>
              <p style={{fontSize:12,color:'var(--text2)',marginTop:3}}>{result.hostName}: {result.result.hostSide} · {result.guestName}: {result.result.guestSide}</p>
            </div>
          )}
          {isWinner&&<p className="playfair" style={{color:'var(--gold)',fontSize:18,fontWeight:700}}>+{result.result.payout.toLocaleString()} coins</p>}
          <button className="btn btn-gold" onClick={()=>{setResult(null);setMyRoom(null)}} style={{marginTop:20}}>Play Again</button>
        </div>
      )}

      {/* My room */}
      {myRoom&&myRoom.status!=='done'&&!result&&(
        <div className="card-flat pulse-gold" style={{padding:22,marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <h3 className="playfair" style={{fontSize:15,fontWeight:600,color:'var(--gold)'}}>Your Room</h3>
            <span style={{display:'inline-flex',padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:600,background:myRoom.status==='waiting'?'rgba(201,168,76,.12)':'rgba(88,166,255,.12)',color:myRoom.status==='waiting'?'var(--gold)':'var(--blue)',border:`1px solid ${myRoom.status==='waiting'?'rgba(201,168,76,.25)':'rgba(88,166,255,.25)'}`}}>
              {myRoom.status==='waiting'?'⏳ Waiting for opponent…':'⚔️ Game in progress'}
            </span>
          </div>
          <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:12}}>
            <div><p style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>Bet</p><p className="playfair" style={{color:'var(--gold)',fontWeight:700}}>{myRoom.bet.toLocaleString()} coins</p></div>
            <div><p style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>Pot</p><p className="playfair" style={{color:'var(--gold)',fontWeight:700}}>{(myRoom.bet*(myRoom.guestId?2:1)).toLocaleString()} coins</p></div>
            {myRoom.guestName&&<div><p style={{fontSize:10,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>Opponent</p><p style={{fontWeight:600}}>{myRoom.guestName}</p></div>}
          </div>
          {myRoom.status==='waiting'&&<button className="btn btn-red btn-sm" onClick={handleCancel} style={{gap:6}}><Trash2 size={12}/>Cancel & Refund</button>}
        </div>
      )}

      {/* Create */}
      {!myRoom&&!result&&(
        <div className="card-flat" style={{padding:22,marginBottom:22}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,display:'flex',alignItems:'center',gap:7}}>
            <Plus size={15} color="var(--gold)"/> Create a Room
          </h3>
          <BetInput value={bet} onChange={setBet} min={10} disabled={creating}/>
          <button className="btn btn-gold btn-lg" onClick={handleCreate} disabled={creating||(user?.balance??0)<bet} style={{marginTop:14,width:'100%',gap:8}}>
            <Swords size={15}/> {creating?'Creating…':`Create Room (${bet.toLocaleString()} coins)`}
          </button>
        </div>
      )}

      {/* Lobby */}
      {!myRoom&&!result&&(
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:600,display:'flex',alignItems:'center',gap:7}}>
              <Users size={15} color="var(--gold)"/> Open Rooms
            </h3>
            <button className="btn btn-gold-outline btn-sm" onClick={refresh} style={{gap:5}}><RefreshCw size={11}/>Refresh</button>
          </div>
          {rooms.length===0?(
            <div className="card-flat" style={{padding:36,textAlign:'center'}}>
              <Clock size={30} color="var(--text2)" style={{margin:'0 auto 12px'}}/>
              <p style={{color:'var(--text2)',fontSize:14}}>No open rooms — create one and wait for a challenger!</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {rooms.map(r=>(
                <div key={r.id} className="room-card">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold-d),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display',fontWeight:700,fontSize:14,color:'#1a0e00'}}>{r.hostName.charAt(0).toUpperCase()}</div>
                    <div>
                      <p style={{fontWeight:600,fontSize:14}}>{r.hostName}</p>
                      <p style={{fontSize:11,color:'var(--text2)'}}>{age(r.createdAt)}</p>
                    </div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <p className="playfair" style={{fontSize:18,fontWeight:700,color:'var(--gold)'}}>{r.bet.toLocaleString()}</p>
                    <p style={{fontSize:10,color:'var(--text2)'}}>coins each</p>
                  </div>
                  <button className="btn btn-gold btn-sm" onClick={()=>handleJoin(r)} disabled={!!joining||(user?.balance??0)<r.bet} style={{gap:5}}>
                    <Swords size={12}/>Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
