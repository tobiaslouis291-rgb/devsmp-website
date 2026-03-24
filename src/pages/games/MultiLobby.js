import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLobbyRooms, createRoom, joinRoom, getRoom, deleteRoom } from '../../lib/api';
import BetInput from '../../components/BetInput';
import { sounds } from '../../lib/sounds';
import { Users, Plus, RefreshCw, Trash2, Clock, Swords } from 'lucide-react';
const INFO = {
    coinflip: { name: 'Coin Flip Duel', emoji: '🪙', desc: 'Host picks heads or tails — winner takes the pot' },
    dice: { name: 'Dice Duel', emoji: '🎲', desc: 'Both roll a die — highest number wins the pot' },
};
export default function MultiLobby() {
    const { game } = useParams();
    const { user, placeBet, resolveBet, refreshUser } = useAuth();
    const nav = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [myRoom, setMyRoom] = useState(null);
    const [bet, setBet] = useState(50);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(null);
    const [result, setResult] = useState(null);
    const ginfo = INFO[game] ?? INFO.dice;
    const refresh = useCallback(async () => {
        const list = await getLobbyRooms(game);
        setRooms(list.filter(r => r.hostId !== user?.id));
        if (myRoom && myRoom.status !== 'done') {
            const up = await getRoom(game, myRoom.id);
            if (up) {
                setMyRoom(up);
                if (up.status === 'done' && up.result) {
                    sounds.versus();
                    const won = up.result.winnerId === user?.id;
                    const tie = up.result.winnerId === 'tie';
                    if (won) {
                        sounds.bigWin();
                        resolveBet(up.bet, up.result.payout, 'Coin Flip Duel');
                    }
                    else if (tie) {
                        resolveBet(up.bet, up.bet, 'Coin Flip Duel');
                        sounds.coin();
                    }
                    else {
                        resolveBet(up.bet, 0, 'Coin Flip Duel');
                        sounds.lose();
                    }
                    setResult(up);
                }
            }
        }
    }, [game, myRoom, user?.id]);
    useEffect(() => {
        refresh();
        const t = setInterval(refresh, 2000);
        return () => clearInterval(t);
    }, [refresh]);
    const handleCreate = async () => {
        if (!user || creating)
            return;
        if (!placeBet(bet))
            return;
        setCreating(true);
        const r = await createRoom(game, user.id, user.username, bet);
        setMyRoom(r);
        setCreating(false);
        sounds.click();
    };
    const handleJoin = async (room) => {
        if (!user || joining)
            return;
        if (!placeBet(room.bet))
            return;
        setJoining(room.id);
        const up = await joinRoom(game, room.id, user.id, user.username);
        setJoining(null);
        if (up) {
            setMyRoom(up);
            sounds.versus();
        }
    };
    const handleCancel = async () => {
        if (!myRoom)
            return;
        await deleteRoom(game, myRoom.id);
        if (myRoom.status === 'waiting')
            resolveBet(myRoom.bet, myRoom.bet, 'Coin Flip Duel');
        setMyRoom(null);
        setResult(null);
    };
    const age = (ts) => { const s = Math.floor((Date.now() - ts) / 1000); return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`; };
    const isWinner = result?.result?.winnerId === user?.id;
    const isTie = result?.result?.winnerId === 'tie';
    return (_jsxs("div", { className: "gp", children: [_jsxs("div", { className: "afu", style: { textAlign: 'center', marginBottom: 28 }, children: [_jsx("div", { style: { fontSize: 52 }, children: ginfo.emoji }), _jsx("h1", { className: "tg playfair", style: { fontSize: 30, fontWeight: 900, marginTop: 8 }, children: ginfo.name }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13, marginTop: 4 }, children: ginfo.desc }), _jsx("div", { style: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(88,166,255,.12)', color: 'var(--blue)', border: '1px solid rgba(88,166,255,.25)', marginTop: 8, letterSpacing: '.06em', textTransform: 'uppercase' }, children: "Live PvP \u00B7 2s polling" })] }), result && result.result && (_jsxs("div", { className: `afu card ${isWinner ? 'win-flash' : isTie ? '' : 'lose-flash'}`, style: { padding: 32, marginBottom: 24, textAlign: 'center', borderColor: isWinner ? 'rgba(201,168,76,.4)' : isTie ? 'rgba(88,166,255,.3)' : 'rgba(229,83,75,.3)' }, children: [_jsx("div", { style: { fontSize: 52, marginBottom: 12 }, children: isWinner ? '🏆' : isTie ? '🤝' : '💀' }), _jsx("h2", { className: "playfair", style: { fontSize: 26, fontWeight: 900, color: isWinner ? 'var(--gold)' : isTie ? 'var(--blue)' : 'var(--red)', marginBottom: 10 }, children: isTie ? 'Tie — Refunded!' : isWinner ? 'You Won!' : 'You Lost!' }), game === 'dice' && result.result.hostRoll != null && (_jsx("div", { style: { display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 16 }, children: [{ name: result.hostName, roll: result.result.hostRoll, id: result.hostId }, { name: result.guestName, roll: result.result.guestRoll, id: result.guestId }].map(p => (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 36, marginBottom: 4 }, children: "\uD83C\uDFB2" }), _jsx("p", { style: { fontSize: 12, color: 'var(--text2)', marginBottom: 4 }, children: p.name }), _jsx("p", { className: "playfair", style: { fontSize: 28, fontWeight: 900, color: result.result.winnerId === p.id ? 'var(--gold)' : 'var(--text2)' }, children: p.roll })] }, p.id))) })), game === 'coinflip' && result.result.flip && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: { fontSize: 48 }, children: result.result.flip === 'heads' ? '👑' : '⭐' }), _jsxs("p", { style: { color: 'var(--text2)', fontSize: 13, marginTop: 6, textTransform: 'capitalize' }, children: ["Landed: ", _jsx("strong", { style: { color: 'var(--gold)' }, children: result.result.flip })] }), _jsxs("p", { style: { fontSize: 12, color: 'var(--text2)', marginTop: 3 }, children: [result.hostName, ": ", result.result.hostSide, " \u00B7 ", result.guestName, ": ", result.result.guestSide] })] })), isWinner && _jsxs("p", { className: "playfair", style: { color: 'var(--gold)', fontSize: 18, fontWeight: 700 }, children: ["+", result.result.payout.toLocaleString(), " coins"] }), _jsx("button", { className: "btn btn-gold", onClick: () => { setResult(null); setMyRoom(null); }, style: { marginTop: 20 }, children: "Play Again" })] })), myRoom && myRoom.status !== 'done' && !result && (_jsxs("div", { className: "card-flat pulse-gold", style: { padding: 22, marginBottom: 22 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, children: [_jsx("h3", { className: "playfair", style: { fontSize: 15, fontWeight: 600, color: 'var(--gold)' }, children: "Your Room" }), _jsx("span", { style: { display: 'inline-flex', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: myRoom.status === 'waiting' ? 'rgba(201,168,76,.12)' : 'rgba(88,166,255,.12)', color: myRoom.status === 'waiting' ? 'var(--gold)' : 'var(--blue)', border: `1px solid ${myRoom.status === 'waiting' ? 'rgba(201,168,76,.25)' : 'rgba(88,166,255,.25)'}` }, children: myRoom.status === 'waiting' ? '⏳ Waiting for opponent…' : '⚔️ Game in progress' })] }), _jsxs("div", { style: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }, children: "Bet" }), _jsxs("p", { className: "playfair", style: { color: 'var(--gold)', fontWeight: 700 }, children: [myRoom.bet.toLocaleString(), " coins"] })] }), _jsxs("div", { children: [_jsx("p", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }, children: "Pot" }), _jsxs("p", { className: "playfair", style: { color: 'var(--gold)', fontWeight: 700 }, children: [(myRoom.bet * (myRoom.guestId ? 2 : 1)).toLocaleString(), " coins"] })] }), myRoom.guestName && _jsxs("div", { children: [_jsx("p", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }, children: "Opponent" }), _jsx("p", { style: { fontWeight: 600 }, children: myRoom.guestName })] })] }), myRoom.status === 'waiting' && _jsxs("button", { className: "btn btn-red btn-sm", onClick: handleCancel, style: { gap: 6 }, children: [_jsx(Trash2, { size: 12 }), "Cancel & Refund"] })] })), !myRoom && !result && (_jsxs("div", { className: "card-flat", style: { padding: 22, marginBottom: 22 }, children: [_jsxs("h3", { style: { fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }, children: [_jsx(Plus, { size: 15, color: "var(--gold)" }), " Create a Room"] }), _jsx(BetInput, { value: bet, onChange: setBet, min: 10, disabled: creating }), _jsxs("button", { className: "btn btn-gold btn-lg", onClick: handleCreate, disabled: creating || (user?.balance ?? 0) < bet, style: { marginTop: 14, width: '100%', gap: 8 }, children: [_jsx(Swords, { size: 15 }), " ", creating ? 'Creating…' : `Create Room (${bet.toLocaleString()} coins)`] })] })), !myRoom && !result && (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, children: [_jsxs("h3", { style: { fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }, children: [_jsx(Users, { size: 15, color: "var(--gold)" }), " Open Rooms"] }), _jsxs("button", { className: "btn btn-gold-outline btn-sm", onClick: refresh, style: { gap: 5 }, children: [_jsx(RefreshCw, { size: 11 }), "Refresh"] })] }), rooms.length === 0 ? (_jsxs("div", { className: "card-flat", style: { padding: 36, textAlign: 'center' }, children: [_jsx(Clock, { size: 30, color: "var(--text2)", style: { margin: '0 auto 12px' } }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 14 }, children: "No open rooms \u2014 create one and wait for a challenger!" })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: rooms.map(r => (_jsxs("div", { className: "room-card", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-d),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 14, color: '#1a0e00' }, children: r.hostName.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("p", { style: { fontWeight: 600, fontSize: 14 }, children: r.hostName }), _jsx("p", { style: { fontSize: 11, color: 'var(--text2)' }, children: age(r.createdAt) })] })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("p", { className: "playfair", style: { fontSize: 18, fontWeight: 700, color: 'var(--gold)' }, children: r.bet.toLocaleString() }), _jsx("p", { style: { fontSize: 10, color: 'var(--text2)' }, children: "coins each" })] }), _jsxs("button", { className: "btn btn-gold btn-sm", onClick: () => handleJoin(r), disabled: !!joining || (user?.balance ?? 0) < r.bet, style: { gap: 5 }, children: [_jsx(Swords, { size: 12 }), "Join"] })] }, r.id))) }))] }))] }));
}
