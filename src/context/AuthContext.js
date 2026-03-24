import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentUser, logout as doLogout, updateBalance, pushLiveEvent } from '../lib/auth';
import { getMcBalance, syncBalance } from '../lib/api';
const Ctx = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const userRef = useRef(null);
    const refreshUser = useCallback(async () => {
        const u = await getCurrentUser();
        userRef.current = u;
        setUser(u);
    }, []);
    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);
    // Sync MC balance every 5s
    useEffect(() => {
        if (!user?.mcVerified)
            return;
        let cancelled = false;
        const sync = async () => {
            const bal = await getMcBalance(user.mcUsername);
            if (!cancelled && bal != null && userRef.current) {
                const u = userRef.current;
                await updateBalance(u.id, bal, u.totalWon, u.totalLost, u.gamesPlayed);
                await refreshUser();
            }
        };
        sync();
        const t = setInterval(sync, 5000);
        return () => { cancelled = true; clearInterval(t); };
    }, [user?.id, user?.mcVerified, user?.mcUsername]);
    const logout = useCallback(() => { doLogout(); setUser(null); userRef.current = null; }, []);
    const placeBet = useCallback((amount) => {
        if (!userRef.current || userRef.current.balance < amount)
            return false;
        const u = userRef.current;
        const newBalance = u.balance - amount;
        const updated = { ...u, balance: newBalance };
        userRef.current = updated;
        setUser(updated);
        // Persist to backend
        updateBalance(u.id, newBalance, u.totalWon, u.totalLost, u.gamesPlayed);
        if (u.mcVerified)
            syncBalance(u.mcUsername, amount, 'remove');
        return true;
    }, []);
    const resolveBet = useCallback((bet, payout, game, multiplier) => {
        const u = userRef.current;
        if (!u)
            return;
        const won = payout > bet;
        const newBalance = u.balance + payout;
        const newWon = won ? u.totalWon + (payout - bet) : u.totalWon;
        const newLost = !won ? u.totalLost + (bet - payout) : u.totalLost;
        const newGames = u.gamesPlayed + 1;
        const updated = { ...u, balance: newBalance, totalWon: newWon, totalLost: newLost, gamesPlayed: newGames };
        userRef.current = updated;
        setUser(updated);
        // Persist to backend
        updateBalance(u.id, newBalance, newWon, newLost, newGames);
        pushLiveEvent(u.username, game, won ? payout - bet : bet, won, multiplier);
        if (won && u.mcVerified)
            syncBalance(u.mcUsername, payout, 'add');
    }, []);
    return _jsx(Ctx.Provider, { value: { user, loading, refreshUser, logout, placeBet, resolveBet }, children: children });
}
export function useAuth() {
    const c = useContext(Ctx);
    if (!c)
        throw new Error('useAuth outside AuthProvider');
    return c;
}
