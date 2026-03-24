import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { User } from '../types'
import { getCurrentUser, logout as doLogout, updateBalance, pushLiveEvent, getSessionToken } from '../lib/auth'
import { getMcBalance, syncBalance, getBridgeConfig } from '../lib/api'

interface AuthCtx {
  user: User|null; loading: boolean
  refreshUser: ()=>Promise<void>; logout: ()=>void
  placeBet: (amount:number)=>boolean
  resolveBet: (bet:number,payout:number,game:string,multiplier?:number)=>void
}
const Ctx = createContext<AuthCtx|null>(null)

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [user, setUser] = useState<User|null>(null)
  const [loading, setLoading] = useState(true)
  const userRef = useRef<User|null>(null)

  const refreshUser = useCallback(async ()=>{
    const u = await getCurrentUser()
    userRef.current = u
    setUser(u)
  },[])

  useEffect(()=>{
    refreshUser().finally(()=>setLoading(false))
  },[refreshUser])

  // Sync MC balance every 5s
  useEffect(()=>{
    if (!user?.mcVerified) return
    let cancelled=false
    const sync=async()=>{
      const bal=await getMcBalance(user.mcUsername)
      if (!cancelled&&bal!=null&&userRef.current) {
        const u = userRef.current
        await updateBalance(u.id, bal, u.totalWon, u.totalLost, u.gamesPlayed)
        await refreshUser()
      }
    }
    sync(); const t=setInterval(sync,5000)
    return ()=>{cancelled=true;clearInterval(t)}
  },[user?.id,user?.mcVerified,user?.mcUsername])

  const logout=useCallback(()=>{ doLogout(); setUser(null); userRef.current=null },[])

  const placeBet=useCallback((amount:number):boolean=>{
    if (!userRef.current||userRef.current.balance<amount) return false
    const u = userRef.current
    const newBalance = u.balance - amount
    const updated = {...u, balance:newBalance}
    userRef.current = updated
    setUser(updated)
    // Persist to backend
    updateBalance(u.id, newBalance, u.totalWon, u.totalLost, u.gamesPlayed)
    if (u.mcVerified) syncBalance(u.mcUsername, amount, 'remove')
    return true
  },[])

  const resolveBet=useCallback((bet:number,payout:number,game:string,multiplier?:number)=>{
    const u = userRef.current; if (!u) return
    const won = payout > bet
    const newBalance = u.balance + payout
    const newWon = won ? u.totalWon + (payout-bet) : u.totalWon
    const newLost = !won ? u.totalLost + (bet-payout) : u.totalLost
    const newGames = u.gamesPlayed + 1
    const updated = {...u, balance:newBalance, totalWon:newWon, totalLost:newLost, gamesPlayed:newGames}
    userRef.current = updated
    setUser(updated)
    // Persist to backend
    updateBalance(u.id, newBalance, newWon, newLost, newGames)
    pushLiveEvent(u.username, game, won?payout-bet:bet, won, multiplier)
    if (won&&u.mcVerified) syncBalance(u.mcUsername, payout, 'add')
  },[])

  return <Ctx.Provider value={{user,loading,refreshUser,logout,placeBet,resolveBet}}>{children}</Ctx.Provider>
}

export function useAuth(){
  const c=useContext(Ctx); if(!c) throw new Error('useAuth outside AuthProvider'); return c
}
