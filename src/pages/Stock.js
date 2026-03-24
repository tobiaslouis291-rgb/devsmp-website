import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Lock } from 'lucide-react';
const OWNER = 'Schmesmalo';
const STOCK_KEY = 'csn5_stock_v2';
const TICKER = 'DSMP';
const STARTING_PRICE = 50000;
const BASE_VOL = 800;
function getStock() {
    try {
        const s = JSON.parse(localStorage.getItem(STOCK_KEY) || 'null');
        if (s?.price)
            return s;
    }
    catch { }
    const now = Date.now();
    const candles = [];
    let p = STARTING_PRICE;
    for (let i = 48; i >= 0; i--) {
        const o = p;
        const change = (Math.random() - .48) * BASE_VOL;
        p = Math.max(1000, p + change);
        candles.push({ time: now - i * 10000, open: o, high: Math.max(o, p) + Math.random() * 200, low: Math.max(1000, Math.min(o, p) - Math.random() * 200), close: p, volume: Math.floor(Math.random() * 500 + 50) });
    }
    return { price: p, candles, trades: [], owned: 0, avgBuyPrice: 0, orders: [], _manip: 0 };
}
function saveStock(s) { localStorage.setItem(STOCK_KEY, JSON.stringify(s)); }
function fmt(n) { if (n >= 1e6)
    return (n / 1e6).toFixed(2) + 'M'; if (n >= 1000)
    return (n / 1000).toFixed(1) + 'k'; return Math.round(n).toString(); }
function fmtFull(n) { return Math.round(n).toLocaleString('de-DE'); }
export default function Stock() {
    const { user, placeBet, resolveBet } = useAuth();
    const [stock, setStock] = useState(getStock);
    const [tab, setTab] = useState('chart');
    const [buyAmt, setBuyAmt] = useState(1);
    const [sellAmt, setSellAmt] = useState(1);
    const [msg, setMsg] = useState('');
    const [msgWin, setMsgWin] = useState(true);
    const [strength, setStrength] = useState(3);
    const [newOrd, setNewOrd] = useState({ type: 'stop-loss', price: '', shares: '' });
    const canvasRef = useRef(null);
    const isOwner = user?.mcUsername === OWNER;
    const showMsg = (m, w) => { setMsg(m); setMsgWin(w); setTimeout(() => setMsg(''), 4000); };
    useEffect(() => {
        const tick = () => {
            setStock((prev) => {
                const last = prev.candles[prev.candles.length - 1];
                const open = last?.close ?? STARTING_PRICE;
                const trend = (STARTING_PRICE - open) * 0.005;
                const rand = (Math.random() - .48) * BASE_VOL;
                const close = Math.max(1000, open + rand + trend + (prev._manip || 0));
                const high = Math.max(open, close) + Math.random() * 300;
                const low = Math.max(1000, Math.min(open, close) - Math.random() * 300);
                const candles = [...prev.candles, { time: Date.now(), open, high, low, close, volume: Math.floor(Math.random() * 500 + 50) }].slice(-200);
                const updated = { ...prev, price: close, candles, _manip: 0 };
                // Check orders
                const orders = updated.orders.map((o) => {
                    if (!o.active)
                        return o;
                    if (o.type === 'stop-loss' && close <= o.price) {
                        showMsg('Stop-Loss triggered! Shares sold.', false);
                        return { ...o, active: false };
                    }
                    if (o.type === 'take-profit' && close >= o.price) {
                        showMsg('Take-Profit hit! 🎉 Shares sold.', true);
                        return { ...o, active: false };
                    }
                    return o;
                });
                const final = { ...updated, orders };
                saveStock(final);
                return final;
            });
        };
        const t = setInterval(tick, 10000);
        return () => clearInterval(t);
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        const candles = stock.candles.slice(-60);
        if (candles.length < 2)
            return;
        const prices = candles.flatMap((c) => [c.high, c.low]);
        const minP = Math.min(...prices), maxP = Math.max(...prices), range = maxP - minP || 1;
        const pad = { top: 30, bottom: 40, left: 10, right: 75 };
        const cW = (W - pad.left - pad.right) / candles.length;
        const yS = (p) => pad.top + (maxP - p) / range * (H - pad.top - pad.bottom);
        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + i * (H - pad.top - pad.bottom) / 4;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
            ctx.fillStyle = 'rgba(150,130,100,.7)';
            ctx.font = '10px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(fmt(maxP - i * range / 4), W - pad.right + 5, y + 3);
        }
        // Candles
        candles.forEach((c, i) => {
            const x = pad.left + i * cW + cW * .1, cw = cW * .8, isG = c.close >= c.open, col = isG ? '#3fb950' : '#e5534b';
            ctx.strokeStyle = col;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + cw / 2, yS(c.high));
            ctx.lineTo(x + cw / 2, yS(c.low));
            ctx.stroke();
            ctx.fillStyle = col;
            const bt = yS(Math.max(c.open, c.close)), bh = Math.max(1, Math.abs(yS(c.open) - yS(c.close)));
            ctx.fillRect(x, bt, cw, bh);
        });
        // Price line
        const curY = yS(stock.price);
        ctx.strokeStyle = 'rgba(201,168,76,.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad.left, curY);
        ctx.lineTo(W - pad.right, curY);
        ctx.stroke();
        ctx.setLineDash([]);
        // Time labels
        ctx.fillStyle = 'rgba(150,130,100,.6)';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        [0, Math.floor(candles.length / 2), candles.length - 1].forEach(i => {
            if (candles[i]) {
                const d = new Date(candles[i].time);
                ctx.fillText(d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'), pad.left + i * cW + cW / 2, H - 5);
            }
        });
    }, [stock]);
    const buy = () => {
        if (!user)
            return;
        const cost = Math.round(buyAmt * stock.price);
        if (!placeBet(cost)) {
            showMsg('Not enough coins!', false);
            return;
        }
        const newOwned = stock.owned + buyAmt;
        const newAvg = (stock.avgBuyPrice * stock.owned + cost) / newOwned;
        const trade = { time: Date.now(), price: stock.price, amount: buyAmt, type: 'buy' };
        const updated = { ...stock, owned: newOwned, avgBuyPrice: newAvg, trades: [trade, ...stock.trades].slice(0, 100) };
        saveStock(updated);
        setStock(updated);
        showMsg(`Bought ${buyAmt} share${buyAmt > 1 ? 's' : ''} · Cost: ${fmtFull(cost)} coins`, true);
    };
    const sell = () => {
        if (!user || stock.owned < sellAmt) {
            showMsg('Not enough shares!', false);
            return;
        }
        const revenue = Math.round(sellAmt * stock.price);
        const profit = Math.round(sellAmt * (stock.price - stock.avgBuyPrice));
        resolveBet(Math.round(sellAmt * stock.avgBuyPrice), revenue, 'Dev-SMP Stock');
        const newOwned = stock.owned - sellAmt;
        const trade = { time: Date.now(), price: stock.price, amount: sellAmt, type: 'sell' };
        const updated = { ...stock, owned: newOwned, avgBuyPrice: newOwned === 0 ? 0 : stock.avgBuyPrice, trades: [trade, ...stock.trades].slice(0, 100) };
        saveStock(updated);
        setStock(updated);
        showMsg(`Sold ${sellAmt} share${sellAmt > 1 ? 's' : ''} · Revenue: ${fmtFull(revenue)} · P&L: ${profit >= 0 ? '+' : ''}${fmtFull(profit)}`, profit >= 0);
    };
    const addOrder = () => {
        const price = parseFloat(newOrd.price), shares = parseInt(newOrd.shares);
        if (!price || !shares || shares < 1) {
            showMsg('Invalid order!', false);
            return;
        }
        const order = { id: crypto.randomUUID(), type: newOrd.type, price, shares, active: true };
        const updated = { ...stock, orders: [...stock.orders, order] };
        saveStock(updated);
        setStock(updated);
        showMsg(`Order set: ${newOrd.type} @ ${fmtFull(price)}`, true);
        setNewOrd({ type: 'stop-loss', price: '', shares: '' });
    };
    const cancelOrder = (id) => {
        const updated = { ...stock, orders: stock.orders.filter((o) => o.id !== id) };
        saveStock(updated);
        setStock(updated);
    };
    const doManip = (dir) => {
        const s = dir === 'up' ? BASE_VOL * strength : -BASE_VOL * strength;
        setStock((prev) => { const u = { ...prev, _manip: s }; saveStock(u); return u; });
        showMsg(dir === 'up' ? `🚀 Pumped ×${strength}!` : `💣 Dumped ×${strength}!`, dir === 'up');
    };
    const priceChange = stock.candles.length > 1 ? stock.price - stock.candles[0].open : 0;
    const pctChange = stock.candles.length > 1 ? (priceChange / stock.candles[0].open) * 100 : 0;
    const portfolioValue = stock.owned * stock.price;
    const portfolioProfit = stock.owned > 0 ? portfolioValue - stock.avgBuyPrice * stock.owned : 0;
    const high24 = stock.candles.length ? Math.max(...stock.candles.map((c) => c.high)) : stock.price;
    const low24 = stock.candles.length ? Math.min(...stock.candles.map((c) => c.low)) : stock.price;
    const vol24 = stock.candles.reduce((s, c) => s + c.volume, 0);
    return (_jsxs("div", { className: "gp", style: { maxWidth: 1100 }, children: [_jsxs("div", { className: "afu", style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }, children: [_jsx("span", { style: { display: 'inline-flex', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(201,168,76,.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,.25)', letterSpacing: '.08em' }, children: TICKER }), _jsx("h1", { className: "tg playfair", style: { fontSize: 22, fontWeight: 900 }, children: "Dev-SMP Exchange" }), _jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)' }, children: [_jsx("span", { style: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' } }), "LIVE"] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }, children: [_jsx("span", { className: "playfair", style: { fontSize: 40, fontWeight: 900, color: priceChange >= 0 ? 'var(--green)' : 'var(--red)' }, children: fmtFull(stock.price) }), _jsxs("span", { style: { fontSize: 16, fontWeight: 600, color: priceChange >= 0 ? 'var(--green)' : 'var(--red)' }, children: [priceChange >= 0 ? '+' : '', fmtFull(priceChange), " (", pctChange >= 0 ? '+' : '', pctChange.toFixed(2), "%)"] })] }), _jsx("div", { style: { display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }, children: [{ l: '24h High', v: fmtFull(high24), c: 'var(--green)' }, { l: '24h Low', v: fmtFull(low24), c: 'var(--red)' }, { l: 'Volume', v: vol24.toLocaleString(), c: 'var(--text2)' }, { l: 'Market Cap', v: fmt(stock.price * 10000), c: 'var(--gold)' }].map(s => (_jsxs("div", { children: [_jsx("p", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }, children: s.l }), _jsx("p", { className: "playfair", style: { fontSize: 14, fontWeight: 600, color: s.c }, children: s.v })] }, s.l))) })] }), stock.owned > 0 && (_jsxs("div", { className: "card-flat", style: { padding: '14px 20px', minWidth: 200 }, children: [_jsx("p", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }, children: "Your Position" }), [['Shares', String(stock.owned), 'var(--text1)'], ['Avg. Price', fmtFull(stock.avgBuyPrice), 'var(--text1)'], ['Value', fmtFull(portfolioValue), 'var(--gold)'], ['P&L', (portfolioProfit >= 0 ? '+' : '') + fmtFull(portfolioProfit), portfolioProfit >= 0 ? 'var(--green)' : 'var(--red)']].map(([l, v, c]) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }, children: [_jsx("span", { style: { fontSize: 12, color: 'var(--text2)' }, children: l }), _jsx("span", { className: "playfair", style: { fontSize: 12, fontWeight: 600, color: c }, children: v })] }, l)))] }))] }), msg && (_jsx("div", { className: `afi card-flat ${msgWin ? 'win-flash' : 'lose-flash'}`, style: { padding: '10px 16px', marginBottom: 14, borderColor: msgWin ? 'rgba(63,185,80,.3)' : 'rgba(229,83,75,.3)' }, children: _jsx("p", { style: { fontSize: 13, fontWeight: 600, color: msgWin ? 'var(--green)' : 'var(--red)' }, children: msg }) })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx("div", { style: { display: 'flex', gap: 6 }, children: [['chart', 'Chart'], ['orders', 'Orders'], ['history', 'History']].map(([id, label]) => (_jsx("button", { onClick: () => setTab(id), className: "btn btn-sm", style: { padding: '7px 14px', background: tab === id ? 'rgba(201,168,76,.13)' : 'var(--bg3)', border: `1px solid ${tab === id ? 'var(--gold)' : 'var(--border)'}`, color: tab === id ? 'var(--gold)' : 'var(--text2)' }, children: label }, id))) }), tab === 'chart' && (_jsx("div", { className: "card-flat", style: { padding: 0, overflow: 'hidden' }, children: _jsx("canvas", { ref: canvasRef, width: 700, height: 300, style: { width: '100%', height: 300, display: 'block' } }) })), tab === 'orders' && (_jsxs("div", { className: "card-flat", style: { padding: 20 }, children: [_jsx("h3", { style: { fontSize: 14, fontWeight: 600, marginBottom: 14 }, children: "Active Orders" }), stock.orders.filter((o) => o.active).length === 0 ? (_jsx("p", { style: { color: 'var(--text2)', fontSize: 13, marginBottom: 14 }, children: "No active orders" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }, children: stock.orders.filter((o) => o.active).map((o) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }, children: [_jsxs("div", { children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: o.type === 'take-profit' ? 'var(--green)' : o.type === 'stop-loss' ? 'var(--red)' : 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.06em' }, children: o.type }), _jsxs("p", { style: { fontSize: 13, marginTop: 2 }, children: [o.shares, " shares @ ", _jsx("span", { className: "playfair", style: { fontWeight: 600 }, children: fmtFull(o.price) })] })] }), _jsx("button", { className: "btn btn-red btn-sm", onClick: () => cancelOrder(o.id), style: { padding: '5px 10px', fontSize: 10 }, children: "Cancel" })] }, o.id))) })), _jsx("div", { className: "div" }), _jsx("h3", { style: { fontSize: 14, fontWeight: 600, marginBottom: 12 }, children: "New Order" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsx("div", { style: { display: 'flex', gap: 5, flexWrap: 'wrap' }, children: ['stop-loss', 'take-profit', 'auto-buy'].map(t => (_jsx("button", { className: "btn btn-sm", onClick: () => setNewOrd(o => ({ ...o, type: t })), style: { padding: '6px 10px', fontSize: 10, background: newOrd.type === t ? 'rgba(201,168,76,.12)' : 'var(--bg3)', border: `1px solid ${newOrd.type === t ? 'var(--gold)' : 'var(--border)'}`, color: newOrd.type === t ? 'var(--gold)' : 'var(--text2)' }, children: t === 'stop-loss' ? 'Stop-Loss' : t === 'take-profit' ? 'Take-Profit' : 'Auto-Buy' }, t))) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: newOrd.type === 'stop-loss' ? 'Sell below' : newOrd.type === 'take-profit' ? 'Sell above' : 'Buy below' }), _jsx("input", { className: "inp", type: "number", value: newOrd.price, onChange: e => setNewOrd(o => ({ ...o, price: e.target.value })), placeholder: fmtFull(stock.price), style: { fontFamily: 'Playfair Display', fontWeight: 600 } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: "Shares" }), _jsx("input", { className: "inp", type: "number", value: newOrd.shares, onChange: e => setNewOrd(o => ({ ...o, shares: e.target.value })), placeholder: "1", min: 1, style: { fontFamily: 'Playfair Display', fontWeight: 600 } })] })] }), _jsx("button", { className: "btn btn-gold", onClick: addOrder, style: { width: '100%', padding: '11px' }, children: "Set Order" })] })] })), tab === 'history' && (_jsxs("div", { className: "card-flat", style: { padding: 20 }, children: [_jsx("h3", { style: { fontSize: 14, fontWeight: 600, marginBottom: 14 }, children: "Trade History" }), stock.trades.length === 0 ? (_jsx("p", { style: { color: 'var(--text2)', fontSize: 13 }, children: "No trades yet" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: stock.trades.slice(0, 20).map((t, i) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 7, borderLeft: `3px solid ${t.type === 'buy' ? 'var(--green)' : 'var(--red)'}` }, children: [_jsxs("div", { children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: t.type === 'buy' ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase' }, children: t.type }), _jsx("p", { style: { fontSize: 11, color: 'var(--text2)', marginTop: 1 }, children: new Date(t.time).toLocaleTimeString() })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("p", { className: "playfair", style: { fontSize: 13, fontWeight: 600 }, children: [t.amount, " shares"] }), _jsxs("p", { style: { fontSize: 11, color: 'var(--text2)' }, children: [fmtFull(t.price), " each"] })] })] }, i))) }))] }))] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { className: "card-flat", style: { padding: 18 }, children: [_jsxs("h3", { style: { fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx(TrendingUp, { size: 14 }), "Buy ", TICKER] }), _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: "Shares" }), _jsx("input", { type: "number", className: "inp", value: buyAmt, onChange: e => setBuyAmt(Math.max(1, parseInt(e.target.value) || 1)), min: 1, style: { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17, textAlign: 'center' } })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, color: 'var(--text2)' }, children: [_jsx("span", { children: "Cost" }), _jsx("span", { className: "playfair", style: { color: 'var(--text1)', fontWeight: 600 }, children: fmtFull(Math.round(buyAmt * stock.price)) })] }), _jsx("div", { style: { display: 'flex', gap: 5, marginBottom: 10 }, children: [1, 5, 10, 50].map(n => (_jsx("button", { className: "btn btn-sm", onClick: () => setBuyAmt(n), style: { flex: 1, padding: '5px 2px', fontSize: 11, background: buyAmt === n ? 'rgba(63,185,80,.13)' : 'var(--bg3)', border: `1px solid ${buyAmt === n ? 'var(--green)' : 'var(--border)'}`, color: buyAmt === n ? 'var(--green)' : 'var(--text2)' }, children: n }, n))) }), _jsxs("button", { className: "btn btn-green", onClick: buy, disabled: !user || Math.round(buyAmt * stock.price) > (user?.balance || 0), style: { width: '100%', padding: '12px' }, children: ["Buy ", buyAmt, " Share", buyAmt > 1 ? 's' : ''] }), _jsxs("p", { style: { fontSize: 10, color: 'var(--text2)', marginTop: 6, textAlign: 'center' }, children: ["Balance: ", fmtFull(user?.balance || 0), " coins"] })] }), _jsxs("div", { className: "card-flat", style: { padding: 18 }, children: [_jsxs("h3", { style: { fontSize: 13, fontWeight: 700, color: 'var(--red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx(TrendingDown, { size: 14 }), "Sell ", TICKER] }), _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: "Shares" }), _jsx("input", { type: "number", className: "inp", value: sellAmt, onChange: e => setSellAmt(Math.max(1, parseInt(e.target.value) || 1)), min: 1, max: stock.owned, style: { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 17, textAlign: 'center' } })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, color: 'var(--text2)' }, children: [_jsx("span", { children: "Revenue" }), _jsx("span", { className: "playfair", style: { color: 'var(--text1)', fontWeight: 600 }, children: fmtFull(Math.round(sellAmt * stock.price)) })] }), _jsxs("div", { style: { display: 'flex', gap: 5, marginBottom: 10 }, children: [[1, 5, 10].map(n => (_jsx("button", { className: "btn btn-sm", onClick: () => setSellAmt(n), style: { flex: 1, padding: '5px 2px', fontSize: 11, background: sellAmt === n ? 'rgba(229,83,75,.13)' : 'var(--bg3)', border: `1px solid ${sellAmt === n ? 'var(--red)' : 'var(--border)'}`, color: sellAmt === n ? 'var(--red)' : 'var(--text2)' }, children: n }, n))), _jsx("button", { className: "btn btn-sm", onClick: () => setSellAmt(stock.owned), style: { flex: 1, padding: '5px 2px', fontSize: 11, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)' }, children: "All" })] }), _jsxs("button", { className: "btn btn-red", onClick: sell, disabled: !user || sellAmt > stock.owned || stock.owned === 0, style: { width: '100%', padding: '12px' }, children: ["Sell ", sellAmt, " Share", sellAmt > 1 ? 's' : ''] }), _jsxs("p", { style: { fontSize: 10, color: 'var(--text2)', marginTop: 6, textAlign: 'center' }, children: ["You own: ", stock.owned, " shares"] })] }), isOwner && (_jsxs("div", { className: "card-flat", style: { padding: 18, border: '1px solid rgba(201,168,76,.28)' }, children: [_jsxs("h3", { style: { fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx(Lock, { size: 13 }), "Market Control", _jsx("span", { style: { fontSize: 9, color: 'var(--text3)', fontWeight: 400, marginLeft: 4 }, children: "(private)" })] }), _jsxs("div", { style: { marginBottom: 10 }, children: [_jsxs("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: ["Strength \u00D7", strength] }), _jsx("input", { type: "range", min: 1, max: 10, value: strength, onChange: e => setStrength(parseInt(e.target.value)), style: { width: '100%', accentColor: 'var(--gold)' } })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsxs("button", { className: "btn btn-green btn-sm", onClick: () => doManip('up'), style: { flex: 1, gap: 5 }, children: [_jsx(TrendingUp, { size: 12 }), "Pump"] }), _jsxs("button", { className: "btn btn-red btn-sm", onClick: () => doManip('down'), style: { flex: 1, gap: 5 }, children: [_jsx(TrendingDown, { size: 12 }), "Dump"] })] })] }))] })] }), _jsx("p", { style: { textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text3)' }, children: "Dev-SMP Exchange \u00B7 Entertainment only \u00B7 Not financial advice \u00B7 Owned by Schmesmalo" })] }));
}
