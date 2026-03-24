import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BetInput from '../../components/BetInput';
import { sounds } from '../../lib/sounds';
export default function CoinFlip() {
    const { user, placeBet, resolveBet } = useAuth();
    const [bet, setBet] = useState(10);
    const [chosen, setChosen] = useState('heads');
    const [flipping, setFlipping] = useState(false);
    const [result, setResult] = useState(null);
    const [win, setWin] = useState(null);
    const [history, setHistory] = useState([]);
    const flip = () => {
        if (!user || flipping)
            return;
        if (!placeBet(bet))
            return;
        setFlipping(true);
        setResult(null);
        setWin(null);
        sounds.coin();
        // House edge: 47% win chance instead of 50%
        const r = Math.random() < 0.47 ? chosen : (chosen === 'heads' ? 'tails' : 'heads');
        setTimeout(() => {
            setResult(r);
            setFlipping(false);
            const w = r === chosen;
            setWin(w);
            if (w) {
                sounds.bigWin();
                resolveBet(bet, Math.floor(bet * 1.9), 'Coin Flip');
            }
            else {
                sounds.lose();
                resolveBet(bet, 0, 'Coin Flip');
            }
            setHistory(p => [r, ...p].slice(0, 10));
            setTimeout(() => setWin(null), 2500);
        }, 1800);
    };
    return (_jsxs("div", { className: "gp", style: { maxWidth: 580 }, children: [_jsxs("div", { className: "afu", style: { textAlign: 'center', marginBottom: 28 }, children: [_jsx("div", { style: { fontSize: 52 }, children: "\uD83E\uDE99" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 30, fontWeight: 900, marginTop: 8 }, children: "Coin Flip" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13, marginTop: 4 }, children: "47% win chance \u00B7 Pays 1.9\u00D7 \u00B7 House edge 9%" })] }), _jsxs("div", { className: `afu card ${win === true ? 'win-flash' : win === false ? 'lose-flash' : ''}`, style: { padding: 36, marginBottom: 20, textAlign: 'center' }, children: [_jsxs("div", { style: { display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }, children: [history.map((h, i) => (_jsx("div", { style: { width: 30, height: 30, borderRadius: '50%', background: h === 'heads' ? 'linear-gradient(135deg,var(--gold-d),var(--gold))' : 'linear-gradient(135deg,#333,#666)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: h === 'heads' ? '#1a0e00' : 'white', fontWeight: 700 }, children: h === 'heads' ? 'H' : 'T' }, i))), !history.length && _jsx("span", { style: { fontSize: 12, color: 'var(--text3)' }, children: "No flips yet" })] }), _jsx("div", { style: { width: 140, height: 140, borderRadius: '50%', margin: '0 auto 28px', background: flipping ? 'linear-gradient(135deg,var(--gold-d),var(--gold))' : result === 'heads' ? 'linear-gradient(135deg,var(--gold-d),var(--gold))' : result === 'tails' ? 'linear-gradient(135deg,#2a2a40,#555)' : 'linear-gradient(135deg,var(--gold-d),var(--gold))', border: '4px solid var(--gold)', boxShadow: '0 0 36px rgba(201,168,76,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, animation: flipping ? 'coinSpin 1.8s ease-in-out' : 'none' }, children: flipping ? '🪙' : result === 'heads' ? '👑' : result === 'tails' ? '⭐' : chosen === 'heads' ? '👑' : '⭐' }), win !== null && result && (_jsx("div", { className: "afi", style: { padding: '12px 20px', borderRadius: 10, background: win ? 'rgba(201,168,76,.1)' : 'rgba(229,83,75,.07)', border: `1px solid ${win ? 'rgba(201,168,76,.28)' : 'rgba(229,83,75,.2)'}` }, children: _jsxs("p", { className: "playfair", style: { fontSize: 18, fontWeight: 700, color: win ? 'var(--gold)' : 'var(--red)' }, children: [result.toUpperCase(), " \u2014 ", win ? `+${Math.floor(bet * 1.9).toLocaleString()} coins!` : 'You lose.'] }) })), !flipping && win === null && _jsx("p", { style: { color: 'var(--text2)', fontSize: 14 }, children: "Pick a side and flip!" }), flipping && _jsx("p", { style: { color: 'var(--text2)', fontSize: 14 }, children: "Flipping\u2026" })] }), _jsxs("div", { className: "card-flat", style: { padding: 22 }, children: [_jsx("div", { style: { display: 'flex', gap: 10, marginBottom: 18 }, children: ['heads', 'tails'].map(s => (_jsxs("button", { onClick: () => setChosen(s), disabled: flipping, style: { flex: 1, padding: '18px 14px', borderRadius: 12, border: `2px solid ${chosen === s ? 'var(--gold)' : 'var(--border)'}`, background: chosen === s ? 'rgba(201,168,76,.1)' : 'var(--bg3)', cursor: 'pointer', transition: 'all .18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 32 }, children: s === 'heads' ? '👑' : '⭐' }), _jsx("span", { className: "playfair", style: { fontWeight: 700, fontSize: 13, color: chosen === s ? 'var(--gold)' : 'var(--text2)', textTransform: 'capitalize' }, children: s })] }, s))) }), _jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("label", { style: { fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }, children: "Bet Amount" }), _jsx(BetInput, { value: bet, onChange: setBet, disabled: flipping })] }), _jsx("button", { className: "btn btn-gold btn-lg", onClick: flip, disabled: flipping || (user?.balance ?? 0) < bet, style: { width: '100%', fontSize: 15 }, children: flipping ? '🪙 Flipping…' : 'Flip Coin' })] })] }));
}
