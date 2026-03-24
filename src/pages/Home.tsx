import React,{useState,useEffect}from'react'
import{Link}from'react-router-dom'
import{useAuth}from'../context/AuthContext'
import{Megaphone,Users,Star,ChevronRight,BarChart2,MessageCircle,Clock,Pin,CheckCircle}from'lucide-react'

const OWNER='Schmesmalo'
const DISCORD='https://discord.gg/cBpy8N2ynr'
const CONTENT_KEY='csn5_home_content'

interface Announcement{id:string;title:string;body:string;pinned:boolean;type:'news'|'update'|'event'|'warning';createdAt:number}
interface Poll{id:string;question:string;options:{text:string;votes:string[]}[];createdAt:number;endsAt:number|null}

function getContent():{announcements:Announcement[];polls:Poll[]}{
  try{return JSON.parse(localStorage.getItem(CONTENT_KEY)||'null')||{announcements:[
    {id:'1',title:'Welcome to Dev-SMP Casino!',body:'The official Dev-SMP Casino is now live. Register with /casino register ingame to get started. Good luck and have fun!',pinned:true,type:'news',createdAt:Date.now()-86400000},
    {id:'2',title:'Dev-SMP Exchange launched 📈',body:'You can now trade DSMP stocks on the Exchange page! Start with a small investment and grow your portfolio.',pinned:false,type:'update',createdAt:Date.now()-3600000},
  ],polls:[
    {id:'1',question:'What game should we add next?',options:[{text:'Dice (PvP)',votes:[]},{text:'Horse Racing',votes:[]},{text:'Lottery',votes:[]},{text:'Sports Betting',votes:[]}],createdAt:Date.now()-7200000,endsAt:Date.now()+86400000*7},
  ]}}catch{return{announcements:[],polls:[]}}
}
function saveContent(c:any){localStorage.setItem(CONTENT_KEY,JSON.stringify(c))}

const TYPE_COLORS:Record<string,string>={news:'var(--blue)',update:'var(--green)',event:'var(--gold)',warning:'var(--red)'}
const TYPE_LABELS:Record<string,string>={news:'News',update:'Update',event:'Event',warning:'Warning'}

export default function Home(){
  const{user}=useAuth()
  const[content,setContent]=useState(getContent)
  const[isOwner]=useState(user?.mcUsername===OWNER)

  // Admin: new announcement
  const[showAnnForm,setShowAnnForm]=useState(false)
  const[annForm,setAnnForm]=useState({title:'',body:'',type:'news' as 'news'|'update'|'event'|'warning',pinned:false})

  // Admin: new poll
  const[showPollForm,setShowPollForm]=useState(false)
  const[pollForm,setPollForm]=useState({question:'',options:['','',''],days:'7'})

  const addAnnouncement=()=>{
    if(!annForm.title.trim()||!annForm.body.trim())return
    const ann:Announcement={id:crypto.randomUUID(),title:annForm.title,body:annForm.body,type:annForm.type,pinned:annForm.pinned,createdAt:Date.now()}
    const updated={...content,announcements:[ann,...content.announcements]}
    saveContent(updated);setContent(updated)
    setAnnForm({title:'',body:'',type:'news',pinned:false});setShowAnnForm(false)
  }

  const addPoll=()=>{
    if(!pollForm.question.trim())return
    const opts=pollForm.options.filter(o=>o.trim()).map(text=>({text,votes:[] as string[]}))
    if(opts.length<2)return
    const poll:Poll={id:crypto.randomUUID(),question:pollForm.question,options:opts,createdAt:Date.now(),endsAt:parseInt(pollForm.days)>0?Date.now()+parseInt(pollForm.days)*86400000:null}
    const updated={...content,polls:[poll,...content.polls]}
    saveContent(updated);setContent(updated)
    setPollForm({question:'',options:['','',''],days:'7'});setShowPollForm(false)
  }

  const vote=(pollId:string,optIdx:number)=>{
    if(!user)return
    const updated={...content,polls:content.polls.map(p=>{
      if(p.id!==pollId)return p
      // Remove previous vote
      const opts=p.options.map(o=>({...o,votes:o.votes.filter(v=>v!==user.id)}))
      opts[optIdx].votes.push(user.id)
      return{...p,options:opts}
    })}
    saveContent(updated);setContent(updated)
  }

  const deleteAnn=(id:string)=>{
    const updated={...content,announcements:content.announcements.filter(a=>a.id!==id)}
    saveContent(updated);setContent(updated)
  }
  const deletePoll=(id:string)=>{
    const updated={...content,polls:content.polls.filter(p=>p.id!==id)}
    saveContent(updated);setContent(updated)
  }

  const pinned=content.announcements.filter(a=>a.pinned)
  const rest=content.announcements.filter(a=>!a.pinned)
  const timeAgo=(ts:number)=>{const s=Math.floor((Date.now()-ts)/1000);if(s<60)return`${s}s ago`;if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`}

  return(
    <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 20px',position:'relative',zIndex:1}}>

      {/* Hero banner */}
      <div className="afu card" style={{padding:'32px 36px',marginBottom:28,background:'linear-gradient(135deg,var(--bg2),var(--bg3))',borderColor:'rgba(201,168,76,.25)',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap'}}>
        <div style={{position:'absolute',top:-60,right:-60,width:240,height:240,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,.08),transparent 70%)',pointerEvents:'none'}}/>
        <div>
          <p style={{fontSize:11,color:'var(--text2)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:8}}>Welcome to</p>
          <h1 className="tg playfair" style={{fontSize:36,fontWeight:900,marginBottom:8}}>Dev-SMP Casino</h1>
          <p style={{color:'var(--text2)',fontSize:15,marginBottom:16,maxWidth:480}}>The official casino of Dev-SMP. Register with your Minecraft account and play with real in-game currency.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {!user&&<Link to="/register" className="btn btn-gold btn-lg" style={{gap:7}}><Star size={15}/>Register Now</Link>}
            {user&&<Link to="/dashboard" className="btn btn-gold btn-lg" style={{gap:7}}><ChevronRight size={15}/>Go to Lobby</Link>}
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="btn btn-gold-outline" style={{padding:'12px 22px',gap:8,display:'inline-flex',alignItems:'center',textDecoration:'none'}}>
              <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="var(--gold)"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
              Join Discord
            </a>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,flexShrink:0}}>
          {[{emoji:'🎰',label:'6 Casino Games'},{emoji:'⚔️',label:'PvP Duels'},{emoji:'📈',label:'Stock Exchange'},{emoji:'🪙',label:'Vault Economy'}].map(s=>(
            <div key={s.label} style={{background:'rgba(0,0,0,.3)',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:22}}>{s.emoji}</span>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text1)'}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20,alignItems:'start'}}>
        {/* Left: Announcements */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <h2 style={{fontSize:16,fontWeight:600,display:'flex',alignItems:'center',gap:8}}><Megaphone size={16} color="var(--gold)"/><span className="tg playfair">Announcements</span></h2>
            {isOwner&&<button className="btn btn-gold btn-sm" onClick={()=>setShowAnnForm(!showAnnForm)} style={{gap:5}}>+ Post</button>}
          </div>

          {/* Admin: new announcement form */}
          {isOwner&&showAnnForm&&(
            <div className="card-flat afu" style={{padding:20,marginBottom:14}}>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <input className="inp" placeholder="Title" value={annForm.title} onChange={e=>setAnnForm(a=>({...a,title:e.target.value}))}/>
                <textarea className="inp" placeholder="Content…" value={annForm.body} onChange={e=>setAnnForm(a=>({...a,body:e.target.value}))} style={{minHeight:80,resize:'vertical'}}/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {(['news','update','event','warning']as const).map(t=>(
                    <button key={t} className="btn btn-sm" onClick={()=>setAnnForm(a=>({...a,type:t}))}
                      style={{padding:'5px 12px',background:annForm.type===t?`${TYPE_COLORS[t]}22`:'var(--bg3)',border:`1px solid ${annForm.type===t?TYPE_COLORS[t]:'var(--border)'}`,color:annForm.type===t?TYPE_COLORS[t]:'var(--text2)',textTransform:'capitalize'}}>
                      {t}
                    </button>
                  ))}
                  <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--text2)',cursor:'pointer'}}>
                    <input type="checkbox" checked={annForm.pinned} onChange={e=>setAnnForm(a=>({...a,pinned:e.target.checked}))} style={{accentColor:'var(--gold)'}}/>
                    Pin
                  </label>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-gold" onClick={addAnnouncement} style={{flex:1,padding:'10px'}}>Post</button>
                  <button className="btn btn-gold-outline btn-sm" onClick={()=>setShowAnnForm(false)} style={{padding:'10px 16px'}}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Pinned */}
          {pinned.map(a=>(
            <div key={a.id} className="card afu" style={{padding:20,marginBottom:12,borderColor:'rgba(201,168,76,.3)',position:'relative'}}>
              <div style={{position:'absolute',top:12,right:12,display:'flex',alignItems:'center',gap:6}}>
                <Pin size={12} color="var(--gold)"/>
                {isOwner&&<button onClick={()=>deleteAnn(a.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16,lineHeight:1}}>×</button>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${TYPE_COLORS[a.type]}20`,color:TYPE_COLORS[a.type],border:`1px solid ${TYPE_COLORS[a.type]}40`,textTransform:'uppercase',letterSpacing:'.06em'}}>{TYPE_LABELS[a.type]}</span>
                <span style={{fontSize:11,color:'var(--text2)',display:'flex',alignItems:'center',gap:4}}><Clock size={10}/>{timeAgo(a.createdAt)}</span>
              </div>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,fontFamily:'Playfair Display'}}>{a.title}</h3>
              <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.7}}>{a.body}</p>
            </div>
          ))}

          {/* Rest */}
          {rest.map(a=>(
            <div key={a.id} className="card-flat afu" style={{padding:18,marginBottom:10,position:'relative'}}>
              {isOwner&&<button onClick={()=>deleteAnn(a.id)} style={{position:'absolute',top:10,right:10,background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16}}>×</button>}
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${TYPE_COLORS[a.type]}20`,color:TYPE_COLORS[a.type],border:`1px solid ${TYPE_COLORS[a.type]}40`,textTransform:'uppercase',letterSpacing:'.06em'}}>{TYPE_LABELS[a.type]}</span>
                <span style={{fontSize:11,color:'var(--text2)',display:'flex',alignItems:'center',gap:4}}><Clock size={10}/>{timeAgo(a.createdAt)}</span>
              </div>
              <h3 style={{fontSize:15,fontWeight:600,marginBottom:5,fontFamily:'Playfair Display'}}>{a.title}</h3>
              <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>{a.body}</p>
            </div>
          ))}
        </div>

        {/* Right: Polls + Discord + Quick links */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Discord */}
          <a href={DISCORD} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
            <div className="card afu" style={{padding:18,borderColor:'rgba(88,101,242,.4)',background:'rgba(88,101,242,.06)',display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}>
              <div style={{width:44,height:44,borderRadius:12,background:'#5865f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="white"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
              </div>
              <div>
                <p style={{fontWeight:600,fontSize:14,color:'#8ea0f5',marginBottom:2}}>Join our Discord</p>
                <p style={{fontSize:12,color:'var(--text2)'}}>discord.gg/cBpy8N2ynr</p>
              </div>
            </div>
          </a>

          {/* Polls */}
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <h2 style={{fontSize:15,fontWeight:600,display:'flex',alignItems:'center',gap:7}}><BarChart2 size={15} color="var(--gold)"/>Community Polls</h2>
              {isOwner&&<button className="btn btn-gold btn-sm" onClick={()=>setShowPollForm(!showPollForm)} style={{gap:4,fontSize:10}}>+ Poll</button>}
            </div>

            {isOwner&&showPollForm&&(
              <div className="card-flat afu" style={{padding:16,marginBottom:10}}>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <input className="inp" placeholder="Question" value={pollForm.question} onChange={e=>setPollForm(p=>({...p,question:e.target.value}))} style={{fontSize:13}}/>
                  {pollForm.options.map((o,i)=>(
                    <input key={i} className="inp" placeholder={`Option ${i+1}`} value={o} onChange={e=>{const opts=[...pollForm.options];opts[i]=e.target.value;setPollForm(p=>({...p,options:opts}))}} style={{fontSize:13}}/>
                  ))}
                  <button className="btn btn-sm btn-gold-outline" onClick={()=>setPollForm(p=>({...p,options:[...p.options,'']}))} style={{fontSize:11,padding:'6px'}}>+ Option</button>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input className="inp" type="number" placeholder="Days (0=no end)" value={pollForm.days} onChange={e=>setPollForm(p=>({...p,days:e.target.value}))} style={{width:120,fontSize:13}}/>
                    <button className="btn btn-gold btn-sm" onClick={addPoll} style={{flex:1,padding:'9px'}}>Create</button>
                  </div>
                </div>
              </div>
            )}

            {content.polls.map(poll=>{
              const totalVotes=poll.options.reduce((s,o)=>s+o.votes.length,0)
              const userVote=poll.options.findIndex(o=>user&&o.votes.includes(user.id))
              const ended=poll.endsAt&&Date.now()>poll.endsAt
              return(
                <div key={poll.id} className="card-flat" style={{padding:16,marginBottom:10,position:'relative'}}>
                  {isOwner&&<button onClick={()=>deletePoll(poll.id)} style={{position:'absolute',top:8,right:8,background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:14}}>×</button>}
                  <p style={{fontSize:13,fontWeight:600,marginBottom:10,paddingRight:20}}>{poll.question}</p>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {poll.options.map((o,i)=>{
                      const pct=totalVotes>0?Math.round(o.votes.length/totalVotes*100):0
                      const isVoted=userVote===i
                      return(
                        <button key={i} onClick={()=>!ended&&vote(poll.id,i)} disabled={!!ended}
                          style={{width:'100%',background:'transparent',border:'none',cursor:ended?'default':'pointer',padding:0,textAlign:'left'}}>
                          <div style={{position:'relative',background:'var(--bg3)',borderRadius:7,padding:'8px 12px',overflow:'hidden',border:`1px solid ${isVoted?'rgba(201,168,76,.4)':'var(--border)'}`,transition:'border-color .2s'}}>
                            <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${pct}%`,background:isVoted?'rgba(201,168,76,.12)':'rgba(255,255,255,.04)',transition:'width .5s ease'}}/>
                            <div style={{position:'relative',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <span style={{fontSize:12,color:isVoted?'var(--gold)':'var(--text1)',fontWeight:isVoted?600:400,display:'flex',alignItems:'center',gap:5}}>
                                {isVoted&&<CheckCircle size={11} color="var(--gold)"/>}{o.text}
                              </span>
                              <span style={{fontSize:11,color:'var(--text2)',fontWeight:600}}>{pct}% · {o.votes.length}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <p style={{fontSize:10,color:'var(--text3)',marginTop:8,display:'flex',alignItems:'center',gap:4}}>
                    <Clock size={9}/>{totalVotes} votes · {ended?'Ended':poll.endsAt?`Ends ${new Date(poll.endsAt).toLocaleDateString()}`:' No end date'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Quick links */}
          <div className="card-flat" style={{padding:16}}>
            <h3 style={{fontSize:13,fontWeight:600,marginBottom:12,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Quick Links</h3>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[
                {to:'/dashboard',emoji:'🎰',label:'Casino Lobby'},
                {to:'/stock',emoji:'📈',label:'Exchange'},
                {to:'/leaderboard',emoji:'🏆',label:'Leaderboard'},
                {to:'/team',emoji:'👥',label:'Server Team'},
              ].map(l=>(
                <Link key={l.to} to={l.to} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,background:'var(--bg3)',border:'1px solid var(--border)',transition:'border-color .18s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--border2)')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                  <span style={{fontSize:18}}>{l.emoji}</span>
                  <span style={{fontSize:13,fontWeight:500,color:'var(--text1)'}}>{l.label}</span>
                  <ChevronRight size={14} color="var(--text3)" style={{marginLeft:'auto'}}/>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
