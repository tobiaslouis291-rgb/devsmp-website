import React from 'react'
import{Routes,Route,Navigate}from'react-router-dom'
import{AuthProvider,useAuth}from'./context/AuthContext'
import Navbar from'./components/Navbar'
import LiveFeed from'./components/LiveFeed'
import Footer from'./components/Footer'
import Login from'./pages/Login'
import Register from'./pages/Register'
import Verify from'./pages/Verify'
import Dashboard from'./pages/Dashboard'
import Leaderboard from'./pages/Leaderboard'
import Settings from'./pages/Settings'
import Stock from'./pages/Stock'
import{Terms,Privacy,Cookies,Impressum}from'./pages/Legal'
import Home from'./pages/Home'
import Team from'./pages/Team'
import Slots from'./pages/games/Slots'
import Blackjack from'./pages/games/Blackjack'
import Roulette from'./pages/games/Roulette'
import Crash from'./pages/games/Crash'
import CoinFlip from'./pages/games/CoinFlip'
import Poker from'./pages/games/Poker'
import MultiLobby from'./pages/games/MultiLobby'

function Guard({children}:{children:React.ReactNode}){
  const{user,loading}=useAuth()
  if(loading)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,animation:'float 1.5s ease-in-out infinite'}}>🎰</div>
        <p className="playfair" style={{color:'var(--gold)',marginTop:14,letterSpacing:'.1em'}}>Loading…</p>
      </div>
    </div>
  )
  return user?<>{children}</>:<Navigate to="/login" replace/>
}
function Public({children}:{children:React.ReactNode}){
  const{user}=useAuth()
  return user?<Navigate to="/dashboard" replace/>:<>{children}</>
}
function Shell({children}:{children:React.ReactNode}){
  return<><Navbar/><LiveFeed/><main>{children}</main><Footer/></>
}
function PublicShell({children}:{children:React.ReactNode}){
  return<><main>{children}</main><Footer/></>
}
export default function App(){
  return(
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Public><Login/></Public>}/>
        <Route path="/register" element={<Public><Register/></Public>}/>
        <Route path="/verify" element={<Guard><Verify/></Guard>}/>
        <Route path="/dashboard" element={<Guard><Shell><Dashboard/></Shell></Guard>}/>
        <Route path="/leaderboard" element={<Guard><Shell><Leaderboard/></Shell></Guard>}/>
        <Route path="/settings" element={<Guard><Shell><Settings/></Shell></Guard>}/>
        <Route path="/stock" element={<Guard><Shell><Stock/></Shell></Guard>}/>
        <Route path="/" element={<PublicShell><Home/></PublicShell>}/>
        <Route path="/team" element={<PublicShell><Team/></PublicShell>}/>
        <Route path="/terms" element={<PublicShell><Terms/></PublicShell>}/>
        <Route path="/privacy" element={<PublicShell><Privacy/></PublicShell>}/>
        <Route path="/cookies" element={<PublicShell><Cookies/></PublicShell>}/>
        <Route path="/impressum" element={<PublicShell><Impressum/></PublicShell>}/>
        <Route path="/games/slots" element={<Guard><Shell><Slots/></Shell></Guard>}/>
        <Route path="/games/blackjack" element={<Guard><Shell><Blackjack/></Shell></Guard>}/>
        <Route path="/games/roulette" element={<Guard><Shell><Roulette/></Shell></Guard>}/>
        <Route path="/games/crash" element={<Guard><Shell><Crash/></Shell></Guard>}/>
        <Route path="/games/coinflip" element={<Guard><Shell><CoinFlip/></Shell></Guard>}/>
        <Route path="/games/poker" element={<Guard><Shell><Poker/></Shell></Guard>}/>
        <Route path="/games/lobby/:game" element={<Guard><Shell><MultiLobby/></Shell></Guard>}/>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
    </AuthProvider>
  )
}
