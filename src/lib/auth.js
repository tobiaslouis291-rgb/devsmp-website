import { getBridgeConfig } from './api';
const SESSION_KEY = 'csn5_session';
function cfg() { return getBridgeConfig(); }
function hdrs(token) {
    const h = { 'Content-Type': 'application/json', 'X-API-Key': cfg().apiKey };
    if (token)
        h['X-Session-Token'] = token;
    return h;
}
function baseUrl() { return cfg().backendUrl || ''; }
export async function hashPassword(pw, salt) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + salt));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
export function generateSalt() {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}
// ── Register ─────────────────────────────────────────────
export async function registerUser(username, pw, mc) {
    if (username.length < 3 || username.length > 20)
        return { success: false, error: 'Username: 3–20 characters.' };
    if (!/^[a-zA-Z0-9_]+$/.test(username))
        return { success: false, error: 'Username: letters/numbers/underscore only.' };
    if (pw.length < 8)
        return { success: false, error: 'Password: min. 8 characters.' };
    if (!/[A-Z]/.test(pw))
        return { success: false, error: 'Password needs an uppercase letter.' };
    if (!/[0-9]/.test(pw))
        return { success: false, error: 'Password needs a number.' };
    const salt = generateSalt();
    const passwordHash = await hashPassword(pw, salt);
    const url = baseUrl();
    if (!url)
        return { success: false, error: 'Backend not configured. Go to Settings and add your backend URL.' };
    try {
        const r = await fetch(`${url}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, passwordHash, salt, mcUsername: mc })
        });
        const d = await r.json();
        if (!r.ok)
            return { success: false, error: d.error || 'Registration failed.' };
        return { success: true };
    }
    catch {
        return { success: false, error: 'Cannot reach backend. Check your internet connection.' };
    }
}
// ── Login ─────────────────────────────────────────────────
export async function loginUser(username, pw) {
    const url = baseUrl();
    if (!url)
        return { success: false, error: 'Backend not configured. Go to Settings first.' };
    // We need the salt first to hash the password the same way
    // So we try login-hash endpoint: send username + passwordHash
    // But we don't know the salt yet... so we use a two-step approach:
    // Step 1: get salt for username
    try {
        const saltR = await fetch(`${url}/api/auth/salt?username=${encodeURIComponent(username)}`);
        if (!saltR.ok)
            return { success: false, error: 'Wrong username or password.' };
        const { salt } = await saltR.json();
        const passwordHash = await hashPassword(pw, salt);
        const r = await fetch(`${url}/api/auth/login-hash`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, passwordHash })
        });
        const d = await r.json();
        if (!r.ok)
            return { success: false, error: d.error || 'Wrong username or password.' };
        // Save session token
        localStorage.setItem(SESSION_KEY, JSON.stringify({ token: d.token, expiresAt: Date.now() + 7 * 86400000 }));
        return { success: true, user: mapUser(d.user) };
    }
    catch {
        return { success: false, error: 'Cannot reach backend.' };
    }
}
function mapUser(u) {
    return {
        id: u.id,
        username: u.username,
        mcUsername: u.mc_username,
        mcVerified: u.mc_verified === 1 || u.mc_verified === true,
        passwordHash: '',
        salt: u.salt || '',
        balance: u.balance || 0,
        createdAt: u.created_at,
        lastLogin: u.last_login,
        totalWon: u.total_won || 0,
        totalLost: u.total_lost || 0,
        gamesPlayed: u.games_played || 0,
        stockPortfolio: u.stock_portfolio || 0,
    };
}
export function getSessionToken() {
    try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!s || s.expiresAt < Date.now()) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s.token;
    }
    catch {
        return null;
    }
}
export async function getCurrentUser() {
    const token = getSessionToken();
    if (!token)
        return null;
    const url = baseUrl();
    if (!url)
        return null;
    try {
        const r = await fetch(`${url}/api/auth/me`, { headers: { 'X-Session-Token': token, 'X-API-Key': cfg().apiKey } });
        if (!r.ok) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return mapUser(await r.json());
    }
    catch {
        return null;
    }
}
export function logout() { localStorage.removeItem(SESSION_KEY); }
export async function updateBalance(userId, balance, totalWon, totalLost, gamesPlayed) {
    const token = getSessionToken();
    if (!token)
        return;
    const url = baseUrl();
    if (!url)
        return;
    try {
        await fetch(`${url}/api/auth/balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Session-Token': token, 'X-API-Key': cfg().apiKey },
            body: JSON.stringify({ balance: Math.max(0, Math.round(balance)), totalWon, totalLost, gamesPlayed })
        });
    }
    catch { }
}
export async function markVerified() {
    const token = getSessionToken();
    if (!token)
        return;
    const url = baseUrl();
    if (!url)
        return;
    try {
        await fetch(`${url}/api/auth/verify-mc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Session-Token': token, 'X-API-Key': cfg().apiKey }
        });
    }
    catch { }
}
export async function pushLiveEvent(username, game, amount, won, multiplier) {
    const url = baseUrl();
    if (!url)
        return;
    try {
        await fetch(`${url}/api/auth/live`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': cfg().apiKey },
            body: JSON.stringify({ username, game, amount, won, multiplier })
        });
    }
    catch { }
}
export async function getLiveEvents() {
    const url = baseUrl();
    if (!url)
        return [];
    try {
        const r = await fetch(`${url}/api/auth/live`, { headers: { 'X-API-Key': cfg().apiKey } });
        return r.ok ? await r.json() : [];
    }
    catch {
        return [];
    }
}
export async function getLeaderboard() {
    const url = baseUrl();
    if (!url)
        return [];
    try {
        const r = await fetch(`${url}/api/auth/leaderboard`, { headers: { 'X-API-Key': cfg().apiKey } });
        return r.ok ? await r.json() : [];
    }
    catch {
        return [];
    }
}
