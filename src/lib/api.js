const CFG_KEY = 'csn5_bridge';
export function getBridgeConfig() {
    try {
        return JSON.parse(localStorage.getItem(CFG_KEY) || '{"backendUrl":"","apiKey":"","enabled":false}');
    }
    catch {
        return { backendUrl: '', apiKey: '', enabled: false };
    }
}
export function saveBridgeConfig(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }
function cfg() { return getBridgeConfig(); }
function hdrs() { return { 'Content-Type': 'application/json', 'X-API-Key': cfg().apiKey }; }
export async function getMcBalance(mc) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl)
        return null;
    try {
        const r = await fetch(`${c.backendUrl}/api/player/${encodeURIComponent(mc)}`, { headers: hdrs() });
        if (!r.ok)
            return null;
        return (await r.json()).balance ?? null;
    }
    catch {
        return null;
    }
}
export async function syncBalance(mc, amount, type) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl)
        return true;
    try {
        const r = await fetch(`${c.backendUrl}/api/player/${encodeURIComponent(mc)}/balance`, {
            method: 'POST', headers: hdrs(), body: JSON.stringify({ amount: Math.abs(amount), type })
        });
        return r.ok;
    }
    catch {
        return false;
    }
}
// Register code - player gets this ingame with /casino register
export async function checkRegisterCode(mc, code) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl) {
        const stored = sessionStorage.getItem(`reg_${mc.toLowerCase()}`);
        return stored === code.toUpperCase();
    }
    try {
        const r = await fetch(`${c.backendUrl}/api/register/check`, {
            method: 'POST', headers: hdrs(), body: JSON.stringify({ mcUsername: mc, code })
        });
        return r.ok && (await r.json()).valid === true;
    }
    catch {
        return false;
    }
}
// Verify code
export async function checkVerifyCode(mc, code) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl) {
        const stored = sessionStorage.getItem(`verify_${mc.toLowerCase()}`);
        return stored === code.toUpperCase();
    }
    try {
        const r = await fetch(`${c.backendUrl}/api/verify/check`, {
            method: 'POST', headers: hdrs(), body: JSON.stringify({ mcUsername: mc, code })
        });
        return r.ok && (await r.json()).verified === true;
    }
    catch {
        return false;
    }
}
// Stock API
export async function getStockData() {
    const c = cfg();
    if (!c.enabled || !c.backendUrl)
        return null;
    try {
        const r = await fetch(`${c.backendUrl}/api/stock`, { headers: hdrs() });
        return r.ok ? await r.json() : null;
    }
    catch {
        return null;
    }
}
export async function manipulateStock(direction, amount) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl)
        return false;
    try {
        const r = await fetch(`${c.backendUrl}/api/stock/manipulate`, {
            method: 'POST', headers: hdrs(), body: JSON.stringify({ direction, amount })
        });
        return r.ok;
    }
    catch {
        return false;
    }
}
// Lobby
const ROOMS_KEY = 'csn5_rooms';
function getRooms() { try {
    return JSON.parse(localStorage.getItem(ROOMS_KEY) || '[]');
}
catch {
    return [];
} }
function saveRooms(r) { localStorage.setItem(ROOMS_KEY, JSON.stringify(r)); }
export async function getLobbyRooms(game) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl) {
        const now = Date.now();
        const rooms = getRooms().filter(r => now - r.createdAt < 600000 && r.game === game && r.status !== 'done');
        saveRooms(getRooms().filter(r => now - r.createdAt < 600000));
        return rooms;
    }
    try {
        const r = await fetch(`${c.backendUrl}/api/lobby/${game}`, { headers: hdrs() });
        return r.ok ? await r.json() : [];
    }
    catch {
        return [];
    }
}
export async function createRoom(game, hostId, hostName, bet) {
    const c = cfg();
    const room = { id: crypto.randomUUID(), game: game, hostId, hostName, guestId: null, guestName: null, bet, status: 'waiting', createdAt: Date.now() };
    if (!c.enabled || !c.backendUrl) {
        saveRooms([...getRooms(), room]);
        return room;
    }
    try {
        const r = await fetch(`${c.backendUrl}/api/lobby/${game}`, { method: 'POST', headers: hdrs(), body: JSON.stringify({ hostId, hostName, bet }) });
        return r.ok ? await r.json() : room;
    }
    catch {
        saveRooms([...getRooms(), room]);
        return room;
    }
}
export async function joinRoom(game, roomId, guestId, guestName) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl) {
        const rooms = getRooms();
        const r = rooms.find(r => r.id === roomId);
        if (!r || r.status !== 'waiting' || r.hostId === guestId)
            return null;
        r.guestId = guestId;
        r.guestName = guestName;
        r.status = 'playing';
        saveRooms(rooms);
        setTimeout(() => resolveLocalRoom(roomId), 800);
        return r;
    }
    try {
        const r = await fetch(`${c.backendUrl}/api/lobby/${game}/${roomId}/join`, { method: 'POST', headers: hdrs(), body: JSON.stringify({ guestId, guestName }) });
        return r.ok ? await r.json() : null;
    }
    catch {
        return null;
    }
}
export async function getRoom(game, roomId) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl)
        return getRooms().find(r => r.id === roomId) ?? null;
    try {
        const r = await fetch(`${c.backendUrl}/api/lobby/${game}/${roomId}`, { headers: hdrs() });
        return r.ok ? await r.json() : null;
    }
    catch {
        return null;
    }
}
export async function deleteRoom(game, roomId) {
    const c = cfg();
    if (!c.enabled || !c.backendUrl) {
        saveRooms(getRooms().filter(r => r.id !== roomId));
        return;
    }
    try {
        await fetch(`${c.backendUrl}/api/lobby/${game}/${roomId}`, { method: 'DELETE', headers: hdrs() });
    }
    catch { }
}
function resolveLocalRoom(roomId) {
    const rooms = getRooms();
    const r = rooms.find(r => r.id === roomId);
    if (!r || r.status === 'done' || !r.guestId)
        return;
    let result;
    if (r.game === 'dice') {
        const hr = Math.floor(Math.random() * 6) + 1, gr = Math.floor(Math.random() * 6) + 1, tie = hr === gr;
        result = { winnerId: tie ? 'tie' : hr > gr ? r.hostId : r.guestId, winnerName: tie ? 'Tie' : hr > gr ? r.hostName : r.guestName, hostRoll: hr, guestRoll: gr, payout: r.bet * 2 };
    }
    else {
        const s = ['heads', 'tails'], flip = s[Math.floor(Math.random() * 2)], hs = s[Math.floor(Math.random() * 2)], gs = hs === 'heads' ? 'tails' : 'heads';
        const wid = flip === hs ? r.hostId : r.guestId;
        result = { winnerId: wid, winnerName: wid === r.hostId ? r.hostName : r.guestName, flip, hostSide: hs, guestSide: gs, payout: r.bet * 2 };
    }
    r.result = result;
    r.status = 'done';
    saveRooms(rooms);
}
