import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BetInput from '../../components/BetInput';
import { sounds } from '../../lib/sounds';
import { RotateCcw } from 'lucide-react';
// House edge ~8% - lower win chance
const SYMBOLS = [
    { s: '💎', w: 1, mult: 200, name: 'Diamond' },
    { s: '7️⃣', w: 2, mult: 75, name: 'Seven' },
    { s: '🍒', w: 4, mult: 25, name: 'Cherry' },
    { s: '🔔', w: 6, mult: 12, name: 'Bell' },
    { s: '⭐', w: 9, mult: 6, name: 'Star' },
    { s: '🍋', w: 13, mult: 2.5, name: 'Lemon' },
    { s: '🍇', w: 16, mult: 1.8, name: 'Grape' },
    { s: '🎴', w: 20, mult: 1.2, name: 'Card' },
];
const POOL = [];
SYMBOLS.forEach(s => { for (let i = 0; i < s.w; i++)
    POOL.push(s); });
const rnd = () => POOL[Math.floor(Math.random() * POOL.length)];
export default function Slots() {
    const { user, placeBet, resolveBet } = useAuth();
    const [bet, setBet] = useState(10);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState([[rnd(), rnd(), rnd()], [rnd(), rnd(), rnd()], [rnd(), rnd(), rnd()]]);
    const [result, setResult] = useState(null);
    const [reelSpin, setReelSpin] = useState([false, false, false]);
    const spin = () => {
        if (!user || spinning)
            return;
        if (!placeBet(bet))
            return;
        sounds.spin();
        setSpinning(true);
        setResult(null);
        setReelSpin([true, true, true]);
        const final = [[rnd(), rnd(), rnd()], [rnd(), rnd(), rnd()], [rnd(), rnd(), rnd()]];
        [0, 1, 2].forEach(i => {
            setTimeout(() => {
                sounds.tick();
                setReels(prev => { const r = [...prev]; r[i] = final[i]; return r; });
                setReelSpin(prev => { const s = [...prev]; s[i] = false; return s; });
                if (i === 2) {
                    setTimeout(() => {
                        const mid = [final[0][1], final[1][1], final[2][1]];
                        let payout = 0;
                        let msg = '';
                        if (mid[0].s === mid[1].s && mid[1].s === mid[2].s) {
                            payout = Math.floor(bet * mid[0].mult);
                            msg = `JACKPOT! Three ${mid[0].name}s!`;
                            if (mid[0].mult >= 75)
                                sounds.jackpot();
                            else
                                sounds.bigWin();
                        }
                        else if (mid[0].s === mid[1].s || mid[1].s === mid[2].s || mid[0].s === mid[2].s) {
                            payout = Math.floor(bet * 1.8);
                            msg = 'Two of a kind!';
                            sounds.coin();
                        }
                        else {
                            msg = 'No match. Try again.';
                            sounds.lose();
                        }
                        resolveBet(bet, payout, 'Slots');
                        setResult({ win: payout > 0, payout, msg });
                        setSpinning(false);
                    }, 300);
                }
            }, 700 + i * 450);
        });
    };
    return (_jsxs("div", { className: "gp", children: [_jsxs("div", { className: "afu", style: { textAlign: 'center', marginBottom: 28 }, children: [_jsx("div", { style: { fontSize: 52 }, children: "\uD83C\uDFB0" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 30, fontWeight: 900, marginTop: 8 }, children: "Slots" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13, marginTop: 4 }, children: "Match symbols on the payline \u00B7 House edge 8%" })] }), _jsxs("div", { className: "afu card", style: { padding: 28, marginBottom: 20 }, children: [_jsxs("div", { style: { position: 'relative', display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }, children: [_jsx("div", { className: "payline" }), reels.map((reel, ri) => (_jsx("div", { className: "reel-window", style: { width: 90, height: 264, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '8px 0' }, children: reel.map((sym, si) => (_jsx("div", { className: `reel-symbol${reelSpin[ri] ? ' spinning' : ''}`, style: { background: si === 1 ? 'rgba(201,168,76,.06)' : 'transparent', filter: reelSpin[ri] ? 'blur(2px)' : 'none' }, children: reelSpin[ri] ? rnd().s : sym.s }, si))) }, ri)))] }), result && (_jsxs("div", { className: `afi ${result.win ? 'win-flash' : 'lose-flash'}`, style: { textAlign: 'center', padding: '12px 18px', borderRadius: 10, marginBottom: 14, background: result.win ? 'rgba(201,168,76,.08)' : 'rgba(229,83,75,.06)', border: `1px solid ${result.win ? 'rgba(201,168,76,.25)' : 'rgba(229,83,75,.2)'}` }, children: [_jsx("p", { className: "playfair", style: { fontSize: 18, fontWeight: 700, color: result.win ? 'var(--gold)' : 'var(--red)' }, children: result.msg }), result.win && _jsxs("p", { style: { fontSize: 13, color: 'var(--gold-l)', marginTop: 4 }, children: ["+", result.payout.toLocaleString(), " coins"] })] })), _jsxs("details", { children: [_jsx("summary", { style: { fontSize: 12, color: 'var(--text2)', cursor: 'pointer', textAlign: 'center' }, children: "Pay Table" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 10 }, children: SYMBOLS.map(s => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,.3)', borderRadius: 7, padding: '6px 10px' }, children: [_jsx("span", { style: { fontSize: 20 }, children: s.s }), _jsx("span", { style: { fontSize: 12, color: 'var(--text2)', flex: 1 }, children: s.name }), _jsxs("span", { className: "playfair", style: { fontSize: 12, color: 'var(--gold)', fontWeight: 600 }, children: ["\u00D7", s.mult] })] }, s.name))) })] })] }), _jsxs("div", { className: "card-flat", style: { padding: 22 }, children: [_jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("label", { style: { fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }, children: "Bet Amount" }), _jsx(BetInput, { value: bet, onChange: setBet, disabled: spinning })] }), _jsxs("button", { className: "btn btn-gold btn-lg", onClick: spin, disabled: spinning || (user?.balance ?? 0) < bet, style: { width: '100%', gap: 10 }, children: [_jsx(RotateCcw, { size: 16, style: { animation: spinning ? 'spin 0.5s linear infinite' : 'none' } }), spinning ? 'Spinning…' : 'SPIN'] })] })] }));
}
