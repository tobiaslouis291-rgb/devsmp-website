import{useState,useEffect}from'react'
import{useNavigate}from'react-router-dom'
import{useAuth}from'../context/AuthContext'
import{checkVerifyCode}from'../lib/api'
import{markVerified}from'../lib/auth'
import{ShieldCheck,Terminal,AlertCircle,Gamepad2}from'lucide-react'
import{getBridgeConfig}from'../lib/api'

export default function Verify(){
  const{user,refreshUser}=useAuth();const nav=useNavigate()
  const[code,setCode]=useState('');const[err,setErr]=useState('')
  const[checking,setChecking]=useState(false);const[success,setSuccess]=useState(false)
  const offline=!getBridgeConfig().enabled
  useEffect(()=>{if(user?.mcVerified)nav('/dashboard')},[user,nav])
  if(!user)return null

  // In offline mode, generate a test code on mount
  useEffect(()=>{
    if(offline){
      const c=Math.random().toString(36).substring(2,8).toUpperCase()
      sessionStorage.setItem(`verify_${user.mcUsername.toLowerCase()}`,c)
    }
  },[])

  const verify=async()=>{
    if(!code.trim())return
    setChecking(true);setErr('')
    const ok=await checkVerifyCode(user.mcUsername,code.trim().toUpperCase())
    setChecking(false)
    if(ok){markVerified().then(()=>refreshUser());setSuccess(true);setTimeout(()=>nav('/dashboard'),2500)}
    else setErr('Invalid or expired code. Get a new one with /casino code in Minecraft.')
  }

  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',zIndex:1}}>
      <div className="afu" style={{width:'100%',maxWidth:500}}>
        <div style={{textAlign:'center',marginBottom:30}}>
          <div className="float" style={{fontSize:48,marginBottom:12}}>🛡️</div>
          <h1 className="tg playfair" style={{fontSize:26,fontWeight:900,marginBottom:8}}>Verify Your Minecraft Account</h1>
          <p style={{color:'var(--text2)',fontSize:13}}>Prove you own <strong style={{color:'var(--gold)'}}>{user.mcUsername}</strong></p>
        </div>

        {success?(
          <div className="card-flat afi win-flash" style={{padding:36,textAlign:'center'}}>
            <ShieldCheck size={52} color="var(--green)" style={{margin:'0 auto 14px'}}/>
            <h2 className="playfair" style={{color:'var(--green)',fontSize:22,marginBottom:8}}>Verified!</h2>
            <p style={{color:'var(--text2)'}}>Your account is now linked. Redirecting…</p>
          </div>
        ):(
          <div className="card-flat" style={{padding:30}}>
            {offline&&(
              <div style={{background:'rgba(88,166,255,.08)',border:'1px solid rgba(88,166,255,.2)',borderRadius:8,padding:'12px 16px',marginBottom:20}}>
                <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                  <AlertCircle size={14} color="var(--blue)" style={{flexShrink:0,marginTop:1}}/>
                  <p style={{fontSize:12,color:'var(--blue)',lineHeight:1.6}}>
                    <strong>Dev mode:</strong> MC Bridge not connected. Check the browser console for your test code, or type it from sessionStorage.<br/>
                    Production: players type <code style={{background:'rgba(255,255,255,.08)',padding:'1px 5px',borderRadius:4,fontFamily:'monospace'}}>/casino code</code> in Minecraft to get their code.
                  </p>
                </div>
              </div>
            )}

            {/* HOW IT WORKS */}
            <div style={{marginBottom:24}}>
              <h3 style={{fontSize:14,fontWeight:600,color:'var(--text1)',marginBottom:14,display:'flex',alignItems:'center',gap:7}}>
                <Gamepad2 size={15} color="var(--gold)"/> How to get your code
              </h3>
              <div style={{background:'var(--bg1)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:'rgba(201,168,76,.14)',border:'1px solid rgba(201,168,76,.28)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:'Playfair Display',fontWeight:700,color:'var(--gold)',flexShrink:0}}>1</div>
                  <p style={{fontSize:13,color:'var(--text2)',paddingTop:3}}>Join <strong style={{color:'var(--text1)'}}>Dev-SMP</strong> in Minecraft</p>
                </div>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:'rgba(201,168,76,.14)',border:'1px solid rgba(201,168,76,.28)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:'Playfair Display',fontWeight:700,color:'var(--gold)',flexShrink:0}}>2</div>
                  <div style={{paddingTop:3}}>
                    <p style={{fontSize:13,color:'var(--text2)',marginBottom:6}}>Type this command in chat:</p>
                    <div style={{background:'rgba(0,0,0,.4)',borderRadius:6,padding:'8px 14px',display:'flex',alignItems:'center',gap:8}}>
                      <Terminal size={13} color="var(--text2)"/>
                      <code style={{fontFamily:'monospace',color:'var(--gold)',fontSize:15,letterSpacing:'.05em'}}>/casino code</code>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:'rgba(201,168,76,.14)',border:'1px solid rgba(201,168,76,.28)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontFamily:'Playfair Display',fontWeight:700,color:'var(--gold)',flexShrink:0}}>3</div>
                  <p style={{fontSize:13,color:'var(--text2)',paddingTop:3}}>You'll receive a <strong style={{color:'var(--text1)'}}>6-character code</strong> in chat — enter it below</p>
                </div>
              </div>
            </div>

            {/* CODE INPUT */}
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',marginBottom:8}}>Enter your code</label>
              <div style={{display:'flex',gap:10}}>
                <input className="inp" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ABC123"
                  maxLength={8} onKeyDown={e=>e.key==='Enter'&&verify()}
                  style={{fontFamily:'Playfair Display',fontWeight:700,letterSpacing:'.18em',textAlign:'center',fontSize:20}}/>
                <button className="btn btn-green" onClick={verify} disabled={checking||!code.trim()} style={{padding:'12px 22px',flexShrink:0}}>
                  {checking?'…':<ShieldCheck size={18}/>}
                </button>
              </div>
              {err&&<p style={{fontSize:12,color:'var(--red)',marginTop:8}}>{err}</p>}
              <p style={{fontSize:11,color:'var(--text3)',marginTop:10}}>Codes expire after 5 minutes. Only works if you are online on the server.</p>
            </div>

            <div className="div"/>
            <button onClick={()=>nav('/dashboard')} className="btn btn-gold-outline btn-sm" style={{width:'100%'}}>
              Skip for now (limited features)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
