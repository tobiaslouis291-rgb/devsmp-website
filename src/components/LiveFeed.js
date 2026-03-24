import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getLiveEvents } from '../lib/auth';
const GAME_EMOJIS = {
    Slots: '🎰', Blackjack: '🃏', Roulette: '🎡', Crash: '🚀', 'Coin Flip': '🪙', 'Video Poker': '♠️', 'Coin Flip Duel': '🪙', 'Dice Duel': '🎲', 'Dev-SMP Stock': '📈'
};
export default function LiveFeed() {
    const [events, setEvents] = useState([]);
    useEffect(() => {
        getLiveEvents().then(setEvents);
        const t = setInterval(() => getLiveEvents().then(setEvents), 5000);
        return () => clearInterval(t);
    }, []);
    if (events.length === 0)
        return null;
    const items = [...events, ...events];
    return (_jsxs("div", { style: { background: 'rgba(0,0,0,.5)', borderBottom: '1px solid var(--border)', height: 34, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative', zIndex: 99 }, children: [_jsxs("div", { style: { flexShrink: 0, padding: '0 14px', borderRight: '1px solid var(--border)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', textTransform: 'uppercase', whiteSpace: 'nowrap' }, children: ["Live", _jsx("span", { style: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', marginLeft: 6, boxShadow: '0 0 6px var(--green)' } })] }), _jsx("div", { style: { overflow: 'hidden', width: '100%' }, children: _jsx("div", { style: { display: 'inline-flex', animation: 'ticker 55s linear infinite' }, children: items.map((e, i) => (_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 28px', whiteSpace: 'nowrap', fontSize: 12, color: e.won ? 'var(--green)' : 'var(--red)' }, children: [_jsx("span", { style: { fontSize: 14 }, children: GAME_EMOJIS[e.game] || '🎮' }), _jsx("span", { style: { color: 'var(--text2)', fontWeight: 500 }, children: e.username }), _jsx("span", { style: { fontWeight: 600 }, children: e.won ? `won +${e.amount.toLocaleString()}` : `lost ${e.amount.toLocaleString()}` }), _jsxs("span", { style: { color: 'var(--text2)' }, children: ["on ", e.game] }), e.multiplier && _jsxs("span", { style: { color: 'var(--gold)', fontWeight: 700 }, children: [parseFloat(e.multiplier).toFixed(2), "\u00D7"] }), _jsx("span", { style: { color: 'var(--text3)', marginLeft: 4 }, children: "\u00B7" })] }, i))) }) })] }));
}
