import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BetInput from '../../components/BetInput';
import { sounds } from '../../lib/sounds';
function deck() {
    const suits = ['♠', '♥', '♦', '♣'], vals = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], d = [];
    for (const s of suits)
        for (const v of vals) {
            const num = v === 'A' ? 11 : ['J', 'Q', 'K'].includes(v) ? 10 : parseInt(v);
            d.push({ value: v, suit: s, num, hidden: false });
        }
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
}
function score(cards) {
    let s = 0, a = 0;
    for (const c of cards.filter(c => !c.hidden)) {
        s += c.num;
        if (c.value === 'A')
            a++;
    }
    while (s > 21 && a > 0) {
        s -= 10;
        a--;
    }
    return s;
}
function CardEl({ card, delay = 0 }) {
    const red = card.suit === '♥' || card.suit === '♦';
    return (_jsx("div", { className: `pc${card.hidden ? ' back' : red ? ' red' : ' black'}`, style: { width: 72, height: 104, flexShrink: 0, animationDelay: `${delay}s` }, children: !card.hidden && _jsxs(_Fragment, { children: [_jsxs("div", { style: { position: 'absolute', top: 6, left: 8, fontSize: 13, fontWeight: 900, lineHeight: 1.2 }, children: [card.value, _jsx("br", {}), _jsx("span", { style: { fontSize: 10 }, children: card.suit })] }), _jsx("div", { style: { fontSize: 28 }, children: card.suit }), _jsxs("div", { style: { position: 'absolute', bottom: 6, right: 8, fontSize: 13, fontWeight: 900, lineHeight: 1.2, transform: 'rotate(180deg)' }, children: [card.value, _jsx("br", {}), _jsx("span", { style: { fontSize: 10 }, children: card.suit })] })] }) }));
}
export default function Blackjack() {
    const { user, placeBet, resolveBet } = useAuth();
    const [bet, setBet] = useState(10);
    const [phase, setPhase] = useState('bet');
    const [dk, setDk] = useState([]);
    const [player, setPlayer] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [msg, setMsg] = useState('');
    const [win, setWin] = useState(null);
    const [payout, setPayout] = useState(0);
    const deal = () => {
        if (!placeBet(bet))
            return;
        const d = deck();
        const p = [d.pop(), d.pop()];
        const dl = [d.pop(), { ...d.pop(), hidden: true }];
        setDk(d);
        setPlayer(p);
        setDealer(dl);
        setPhase('playing');
        setMsg('');
        setWin(null);
        sounds.cardDeal();
        setTimeout(() => sounds.cardDeal(), 150);
        setTimeout(() => sounds.cardDeal(), 300);
        setTimeout(() => sounds.cardDeal(), 450);
    };
    const reveal = (d) => d.map(c => ({ ...c, hidden: false }));
    const hit = () => {
        const d = [...dk];
        const card = d.pop();
        sounds.cardDeal();
        const p = [...player, card];
        setDk(d);
        setPlayer(p);
        if (score(p) > 21) {
            sounds.lose();
            resolveBet(bet, 0, 'Blackjack');
            setMsg('Bust! You lose.');
            setWin(false);
            setPayout(0);
            setPhase('result');
            setDealer(reveal(dealer));
        }
    };
    const stand = () => {
        let d = reveal(dealer);
        let dk2 = [...dk];
        while (score(d) < 17) {
            const c = { ...dk2.pop(), hidden: false };
            d.push(c);
            sounds.cardDeal();
        }
        setDealer(d);
        setDk(dk2);
        const ps = score(player), ds = score(d);
        let pay = 0;
        let m = '';
        let w = false;
        if (ds > 21 || ps > ds) {
            pay = Math.floor(bet * 2);
            m = `You win! ${ps} vs ${ds}`;
            w = true;
            sounds.bigWin();
        }
        else if (ps === ds) {
            pay = bet;
            m = `Push! ${ps} vs ${ds}`;
            w = true;
            sounds.coin();
        }
        else {
            m = `Dealer wins. ${ps} vs ${ds}`;
            sounds.lose();
        }
        resolveBet(bet, pay, 'Blackjack');
        setMsg(m);
        setWin(w);
        setPayout(pay);
        setPhase('result');
    };
    const double = () => {
        if (!placeBet(bet))
            return;
        sounds.cardDeal();
        const d = [...dk];
        const card = { ...d.pop(), hidden: false };
        const p = [...player, card];
        setDk(d);
        setPlayer(p);
        if (score(p) > 21) {
            sounds.lose();
            resolveBet(bet * 2, 0, 'Blackjack');
            setMsg('Bust on double!');
            setWin(false);
            setPayout(0);
            setPhase('result');
            setDealer(reveal(dealer));
        }
        else {
            // stand with doubled bet already deducted
            let dd = reveal(dealer);
            let dk2 = [...d];
            while (score(dd) < 17) {
                const c = { ...dk2.pop(), hidden: false };
                dd.push(c);
                sounds.cardDeal();
            }
            setDealer(dd);
            const ps = score(p), ds = score(dd);
            let pay = 0;
            let m = '';
            let w = false;
            if (ds > 21 || ps > ds) {
                pay = Math.floor(bet * 4);
                m = `Double win! ${ps} vs ${ds}`;
                w = true;
                sounds.bigWin();
            }
            else if (ps === ds) {
                pay = bet * 2;
                m = `Push. ${ps} vs ${ds}`;
                w = true;
                sounds.coin();
            }
            else {
                m = `Dealer wins. ${ps} vs ${ds}`;
                sounds.lose();
            }
            resolveBet(bet * 2, pay, 'Blackjack');
            setMsg(m);
            setWin(w);
            setPayout(pay);
            setPhase('result');
        }
    };
    const ps = score(player), ds = score(dealer.filter(c => !c.hidden));
    return (_jsxs("div", { className: "gp", children: [_jsxs("div", { className: "afu", style: { textAlign: 'center', marginBottom: 28 }, children: [_jsx("div", { style: { fontSize: 52 }, children: "\uD83C\uDCCF" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 30, fontWeight: 900, marginTop: 8 }, children: "Blackjack" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13, marginTop: 4 }, children: "Beat the dealer \u2014 House edge ~2%" })] }), _jsxs("div", { className: `afu card felt ${phase === 'result' && win ? 'win-flash' : phase === 'result' && win === false ? 'lose-flash' : ''}`, style: { padding: 28, marginBottom: 20, borderRadius: 20, minHeight: 240, display: 'flex', flexDirection: 'column', gap: 20 }, children: [phase === 'bet' ? (_jsx("div", { style: { textAlign: 'center', padding: '40px 0', color: 'var(--text2)', fontFamily: 'Playfair Display', fontSize: 18 }, children: "Place your bet to begin" })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.09em' }, children: "Dealer" }), phase === 'result' && _jsx("span", { style: { display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(201,168,76,.2)', color: 'var(--gold)' }, children: score(dealer) })] }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: dealer.map((c, i) => _jsx(CardEl, { card: c, delay: i * .1 }, i)) })] }), _jsx("div", { className: "div" }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.09em' }, children: "You" }), _jsx("span", { style: { display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ps > 21 ? 'rgba(229,83,75,.25)' : ps === 21 ? 'rgba(201,168,76,.25)' : 'rgba(63,185,80,.2)', color: ps > 21 ? 'var(--red)' : ps === 21 ? 'var(--gold)' : 'var(--green)' }, children: ps })] }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: player.map((c, i) => _jsx(CardEl, { card: c, delay: i * .1 }, i)) })] })] })), phase === 'result' && msg && (_jsxs("div", { className: `afi`, style: { textAlign: 'center', padding: '12px 20px', borderRadius: 10, background: win ? 'rgba(201,168,76,.12)' : 'rgba(229,83,75,.08)', border: `1px solid ${win ? 'rgba(201,168,76,.3)' : 'rgba(229,83,75,.2)'}` }, children: [_jsx("p", { className: "playfair", style: { fontSize: 18, fontWeight: 700, color: win ? 'var(--gold)' : 'var(--red)' }, children: msg }), payout > 0 && _jsxs("p", { style: { fontSize: 13, color: 'var(--gold-l)', marginTop: 4 }, children: ["+", payout.toLocaleString(), " coins"] })] }))] }), _jsx("div", { className: "card-flat", style: { padding: 22 }, children: phase === 'bet' || phase === 'result' ? (_jsxs(_Fragment, { children: [phase === 'bet' && _jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("label", { style: { fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }, children: "Bet" }), _jsx(BetInput, { value: bet, onChange: setBet })] }), _jsx("button", { className: "btn btn-gold btn-lg", onClick: deal, style: { width: '100%' }, children: phase === 'result' ? 'New Hand' : 'Deal Cards' })] })) : (_jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { className: "btn btn-green btn-lg", onClick: hit, style: { flex: 1 }, children: "Hit" }), _jsx("button", { className: "btn btn-gold-outline btn-lg", onClick: stand, style: { flex: 1 }, children: "Stand" }), _jsx("button", { className: "btn btn-red", onClick: double, disabled: (user?.balance ?? 0) < bet, style: { flex: 1, padding: '14px 10px', fontSize: 12 }, children: "2\u00D7 Double" })] })) })] }));
}
