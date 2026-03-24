import React,{useState,FormEvent}from'react'
import{Link,useNavigate}from'react-router-dom'
import{loginUser}from'../lib/auth'
import{useAuth}from'../context/AuthContext'
import{Eye,EyeOff,Lock,User}from'lucide-react'
export default function Login(){
  const[u,setU]=useState('');const[p,setP]=useState('');const[sp,setSp]=useState(false)
  const[err,setErr]=useState('');const[loading,setLoading]=useState(false)
  const{refreshUser}=useAuth();const nav=useNavigate()
  const submit=async(e:FormEvent)=>{
    e.preventDefault();setErr('');setLoading(true)
    const r=await loginUser(u.trim(),p);setLoading(false)
    if(r.success){refreshUser();nav('/dashboard')}else setErr(r.error!)
  }
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',zIndex:1}}>
      <div className="afu" style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <div className="float" style={{fontSize:54,marginBottom:14}}>🎰</div>
          <h1 className="shimmer-text playfair" style={{fontSize:30,fontWeight:900,marginBottom:7}}>Dev-SMP Casino</h1>
          <p style={{color:'var(--text2)',fontSize:11,letterSpacing:'.08em',textTransform:'uppercase'}}>By Schmesmalo · Fortune Favors the Bold</p>
        </div>
        <div className="card-flat" style={{padding:32}}>
          <h2 className="playfair" style={{fontSize:19,fontWeight:600,marginBottom:26,textAlign:'center'}}>Welcome Back</h2>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',marginBottom:7}}>Username</label>
              <div style={{position:'relative'}}><User size={15} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'var(--text2)'}}/><input className="inp inp-icon" type="text" value={u} onChange={e=>setU(e.target.value)} placeholder="Your casino username" required/></div>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,letterSpacing:'.09em',color:'var(--text2)',textTransform:'uppercase',marginBottom:7}}>Password</label>
              <div style={{position:'relative'}}><Lock size={15} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'var(--text2)'}}/><input className="inp inp-icon" style={{paddingRight:44}} type={sp?'text':'password'} value={p} onChange={e=>setP(e.target.value)} placeholder="••••••••" required/><button type="button" onClick={()=>setSp(!sp)} style={{position:'absolute',right:11,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text2)'}}>{sp?<EyeOff size={15}/>:<Eye size={15}/>}</button></div>
            </div>
            {err&&<div className="afi" style={{background:'rgba(229,83,75,.08)',border:'1px solid rgba(229,83,75,.25)',borderRadius:8,padding:'9px 14px',fontSize:13,color:'var(--red)'}}>{err}</div>}
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{marginTop:6,width:'100%'}}>{loading?'Signing in…':'Enter the Casino'}</button>
          </form>
          <div className="div"/>
          <p style={{textAlign:'center',fontSize:13,color:'var(--text2)'}}>No account? <Link to="/register" style={{color:'var(--gold)',textDecoration:'none',fontWeight:600}}>Register</Link></p>
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:16,flexWrap:'wrap'}}>
          {['/terms','/privacy','/impressum'].map(p=>(
            <Link key={p} to={p} style={{fontSize:11,color:'var(--text3)',textDecoration:'none',textTransform:'capitalize'}}>{p.slice(1)}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
