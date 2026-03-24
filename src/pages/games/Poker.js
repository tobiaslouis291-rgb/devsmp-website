import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BetInput from '../../components/BetInput';
import { sounds } from '../../lib/sounds';
import { RefreshCw } from 'lucide-react';
const RANKS = [
    { name: 'Royal Flush', mult: 800, check: (c) => isFlush(c) && isStraight(c) && c.some(x => x.value === 'A') },
    { name: 'Straight Flush', mult: 50, check: (c) => isFlush(c) && isStraight(c) },
    { name: 'Four of a Kind', mult: 25, check: (c) => hasN(c, 4) },
    { name: 'Full House', mult: 9, check: (c) => hasN(c, 3) && hasPair(c) },
    { name: 'Flush', mult: 6, check: isFlush },
    { name: 'Straight', mult: 4, check: (c) => isStraight(c) },
    { name: 'Three of a Kind', mult: 3, check: (c) => hasN(c, 3) },
    { name: 'Two Pair', mult: 2, check: hasTwoPair },
    { name: 'Jacks or Better', mult: 1, check: jacksOrBetter },
];
function vmap(cards) { const m = {}; cards.forEach(c => { m[c.value] = (m[c.value] || 0) + 1; }); return m; }
function hasN(c, n) { return Object.values(vmap(c)).includes(n); }
function hasPair(c) { return Object.values(vmap(c)).filter(v => v === 2).length >= 1; }
function hasTwoPair(c) { return Object.values(vmap(c)).filter(v => v === 2).length === 2; }
function isFlush(c) { return new Set(c.map(x => x.suit)).size === 1; }
function isStraight(c) {
    const nums = [...new Set(c.map(x => x.value === 'A' ? 14 : x.num))].sort((a, b) => a - b);
    return nums.length === 5 && nums[4] - nums[0] === 4;
}
function jacksOrBetter(c) {
    const v = vmap(c);
    return ['J', 'Q', 'K', 'A'].some(h => v[h] >= 2);
}
function evalHand(c) { for (const r of RANKS)
    if (r.check(c))
        return r; return null; }
function makeDeck() {
    const suits = ['♠', '♥', '♦', '♣'], vals = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], d = [];
    for (const s of suits)
        for (const v of vals) {
            const num = v === 'A' ? 1 : ['J', 'Q', 'K'].includes(v) ? 10 : parseInt(v);
            d.push({ value: v, suit: s, num, held: false });
        }
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
}
function CardEl({ card, onClick, phase }) {
    const red = card.suit === '♥' || card.suit === '♦';
    return (_jsxs("div", { onClick: onClick, style: { width: 72, height: 104, background: '#f8f8f6', borderRadius: 8, border: `2px solid ${card.held ? 'var(--gold)' : '#ccc'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: phase === 'draw' ? 'pointer' : 'default', position: 'relative', boxShadow: card.held ? '0 0 14px rgba(201,168,76,.45)' : '0 4px 12px rgba(0,0,0,.5)', transition: 'all .18s', transform: card.held ? 'translateY(-10px)' : 'none', animation: 'cardSlide .3s ease both', color: red ? '#c0392b' : '#1a1a2e' }, children: [card.held && _jsx("div", { style: { position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontFamily: 'Inter', fontWeight: 700, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase' }, children: "HOLD" }), _jsxs("div", { style: { position: 'absolute', top: 5, left: 7, fontSize: 13, fontWeight: 900, lineHeight: 1.2 }, children: [card.value, _jsx("br", {}), _jsx("span", { style: { fontSize: 10 }, children: card.suit })] }), _jsx("div", { style: { fontSize: 26 }, children: card.suit })] }));
}
export default function Poker() {
    const { user, placeBet, resolveBet } = useAuth();
    const [bet, setBet] = useState(10);
    const [phase, setPhase] = useState('bet');
    const [hand, setHand] = useState([]);
    const [dk, setDk] = useState([]);
    const [handResult, setHandResult] = useState(null);
    const [payout, setPayout] = useState(0);
    const deal = () => {
        if (!placeBet(bet))
            return;
        const d = makeDeck();
        const h = [d.pop(), d.pop(), d.pop(), d.pop(), d.pop()].map(c => ({ ...c, held: false }));
        sounds.cardDeal();
        setTimeout(() => sounds.cardDeal(), 120);
        setTimeout(() => sounds.cardDeal(), 240);
        setTimeout(() => sounds.cardDeal(), 360);
        setTimeout(() => sounds.cardDeal(), 480);
        setHand(h);
        setDk(d);
        setPhase('draw');
        setHandResult(null);
    };
    const toggle = (i) => setHand(prev => prev.map((c, idx) => idx === i ? { ...c, held: !c.held } : c));
    const draw = () => {
        const d = [...dk];
        const newHand = hand.map(c => c.held ? c : { ...d.pop(), held: false });
        sounds.cardDeal();
        setHand(newHand);
        setDk(d);
        const r = evalHand(newHand);
        setHandResult(r);
        const pay = r ? bet * r.mult : 0;
        setPayout(pay);
        resolveBet(bet, pay, 'Video Poker');
        if (pay >= bet * 25)
            sounds.jackpot();
        else if (pay > 0)
            sounds.bigWin();
        else
            sounds.lose();
        setPhase('result');
    };
    return (_jsxs("div", { className: "gp", children: [_jsxs("div", { className: "afu", style: { textAlign: 'center', marginBottom: 28 }, children: [_jsx("div", { style: { fontSize: 52 }, children: "\u2660\uFE0F" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 30, fontWeight: 900, marginTop: 8 }, children: "Video Poker" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13, marginTop: 4 }, children: "Jacks or Better \u2014 House edge ~2%" })] }), _jsxs("div", { className: `afu card felt ${phase === 'result' && handResult ? 'win-flash' : phase === 'result' && !handResult ? 'lose-flash' : ''}`, style: { padding: 28, marginBottom: 20, borderRadius: 20, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }, children: [hand.length > 0 ? (_jsxs(_Fragment, { children: [phase === 'draw' && _jsx("p", { style: { fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.09em', textTransform: 'uppercase' }, children: "Tap cards to hold" }), _jsx("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: phase === 'draw' ? 8 : 0 }, children: hand.map((c, i) => _jsx(CardEl, { card: c, onClick: () => phase === 'draw' ? toggle(i) : undefined, phase: phase }, i)) })] })) : (_jsx("p", { style: { color: 'var(--text2)', fontFamily: 'Playfair Display', fontSize: 17, opacity: .6 }, children: "Deal to start" })), phase === 'result' && (_jsxs("div", { className: "afi", style: { width: '100%', textAlign: 'center', padding: '12px 20px', borderRadius: 10, background: handResult ? 'rgba(201,168,76,.1)' : 'rgba(229,83,75,.07)', border: `1px solid ${handResult ? 'rgba(201,168,76,.28)' : 'rgba(229,83,75,.2)'}` }, children: [_jsx("p", { className: "playfair", style: { fontSize: 18, fontWeight: 700, color: handResult ? 'var(--gold)' : 'var(--red)' }, children: handResult ? `${handResult.name} — ×${handResult.mult}` : 'No winning hand' }), payout > 0 && _jsxs("p", { style: { fontSize: 13, color: 'var(--gold-l)', marginTop: 3 }, children: ["+", payout.toLocaleString(), " coins"] })] }))] }), _jsxs("div", { className: "card-flat", style: { padding: 18, marginBottom: 16 }, children: [_jsx("p", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }, children: "Pay Table" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 14px' }, children: RANKS.map(r => (_jsxs(React.Fragment, { children: [_jsx("span", { style: { fontSize: 12, color: handResult?.name === r.name ? 'var(--gold)' : 'var(--text2)', fontWeight: handResult?.name === r.name ? 600 : 400 }, children: r.name }), _jsxs("span", { className: "playfair", style: { fontSize: 12, color: 'var(--gold)', fontWeight: 600, textAlign: 'right' }, children: ["\u00D7", r.mult] })] }, r.name))) })] }), _jsxs("div", { className: "card-flat", style: { padding: 22 }, children: [(phase === 'bet' || phase === 'result') && _jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("label", { style: { fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }, children: "Bet" }), _jsx(BetInput, { value: bet, onChange: setBet })] }), phase === 'draw' ? (_jsxs("button", { className: "btn btn-gold btn-lg", onClick: draw, style: { width: '100%', gap: 10 }, children: [_jsx(RefreshCw, { size: 16 }), " Draw Cards"] })) : (_jsx("button", { className: "btn btn-gold btn-lg", onClick: deal, style: { width: '100%' }, children: phase === 'result' ? 'New Hand' : 'Deal' }))] })] }));
}
