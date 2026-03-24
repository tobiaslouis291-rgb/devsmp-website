import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkVerifyCode } from '../lib/api';
import { markVerified } from '../lib/auth';
import { ShieldCheck, Terminal, AlertCircle, Gamepad2 } from 'lucide-react';
import { getBridgeConfig } from '../lib/api';
export default function Verify() {
    const { user, refreshUser } = useAuth();
    const nav = useNavigate();
    const [code, setCode] = useState('');
    const [err, setErr] = useState('');
    const [checking, setChecking] = useState(false);
    const [success, setSuccess] = useState(false);
    const offline = !getBridgeConfig().enabled;
    useEffect(() => { if (user?.mcVerified)
        nav('/dashboard'); }, [user, nav]);
    if (!user)
        return null;
    // In offline mode, generate a test code on mount
    useEffect(() => {
        if (offline) {
            const c = Math.random().toString(36).substring(2, 8).toUpperCase();
            sessionStorage.setItem(`verify_${user.mcUsername.toLowerCase()}`, c);
        }
    }, []);
    const verify = async () => {
        if (!code.trim())
            return;
        setChecking(true);
        setErr('');
        const ok = await checkVerifyCode(user.mcUsername, code.trim().toUpperCase());
        setChecking(false);
        if (ok) {
            markVerified().then(() => refreshUser());
            setSuccess(true);
            setTimeout(() => nav('/dashboard'), 2500);
        }
        else
            setErr('Invalid or expired code. Get a new one with /casino code in Minecraft.');
    };
    return (_jsx("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', zIndex: 1 }, children: _jsxs("div", { className: "afu", style: { width: '100%', maxWidth: 500 }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 30 }, children: [_jsx("div", { className: "float", style: { fontSize: 48, marginBottom: 12 }, children: "\uD83D\uDEE1\uFE0F" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 26, fontWeight: 900, marginBottom: 8 }, children: "Verify Your Minecraft Account" }), _jsxs("p", { style: { color: 'var(--text2)', fontSize: 13 }, children: ["Prove you own ", _jsx("strong", { style: { color: 'var(--gold)' }, children: user.mcUsername })] })] }), success ? (_jsxs("div", { className: "card-flat afi win-flash", style: { padding: 36, textAlign: 'center' }, children: [_jsx(ShieldCheck, { size: 52, color: "var(--green)", style: { margin: '0 auto 14px' } }), _jsx("h2", { className: "playfair", style: { color: 'var(--green)', fontSize: 22, marginBottom: 8 }, children: "Verified!" }), _jsx("p", { style: { color: 'var(--text2)' }, children: "Your account is now linked. Redirecting\u2026" })] })) : (_jsxs("div", { className: "card-flat", style: { padding: 30 }, children: [offline && (_jsx("div", { style: { background: 'rgba(88,166,255,.08)', border: '1px solid rgba(88,166,255,.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }, children: _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'flex-start' }, children: [_jsx(AlertCircle, { size: 14, color: "var(--blue)", style: { flexShrink: 0, marginTop: 1 } }), _jsxs("p", { style: { fontSize: 12, color: 'var(--blue)', lineHeight: 1.6 }, children: [_jsx("strong", { children: "Dev mode:" }), " MC Bridge not connected. Check the browser console for your test code, or type it from sessionStorage.", _jsx("br", {}), "Production: players type ", _jsx("code", { style: { background: 'rgba(255,255,255,.08)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }, children: "/casino code" }), " in Minecraft to get their code."] })] }) })), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsxs("h3", { style: { fontSize: 14, fontWeight: 600, color: 'var(--text1)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }, children: [_jsx(Gamepad2, { size: 15, color: "var(--gold)" }), " How to get your code"] }), _jsxs("div", { style: { background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }, children: [_jsx("div", { style: { width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }, children: "1" }), _jsxs("p", { style: { fontSize: 13, color: 'var(--text2)', paddingTop: 3 }, children: ["Join ", _jsx("strong", { style: { color: 'var(--text1)' }, children: "Dev-SMP" }), " in Minecraft"] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }, children: [_jsx("div", { style: { width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }, children: "2" }), _jsxs("div", { style: { paddingTop: 3 }, children: [_jsx("p", { style: { fontSize: 13, color: 'var(--text2)', marginBottom: 6 }, children: "Type this command in chat:" }), _jsxs("div", { style: { background: 'rgba(0,0,0,.4)', borderRadius: 6, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(Terminal, { size: 13, color: "var(--text2)" }), _jsx("code", { style: { fontFamily: 'monospace', color: 'var(--gold)', fontSize: 15, letterSpacing: '.05em' }, children: "/casino code" })] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 12 }, children: [_jsx("div", { style: { width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }, children: "3" }), _jsxs("p", { style: { fontSize: 13, color: 'var(--text2)', paddingTop: 3 }, children: ["You'll receive a ", _jsx("strong", { style: { color: 'var(--text1)' }, children: "6-character code" }), " in chat \u2014 enter it below"] })] })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 8 }, children: "Enter your code" }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("input", { className: "inp", value: code, onChange: e => setCode(e.target.value.toUpperCase()), placeholder: "ABC123", maxLength: 8, onKeyDown: e => e.key === 'Enter' && verify(), style: { fontFamily: 'Playfair Display', fontWeight: 700, letterSpacing: '.18em', textAlign: 'center', fontSize: 20 } }), _jsx("button", { className: "btn btn-green", onClick: verify, disabled: checking || !code.trim(), style: { padding: '12px 22px', flexShrink: 0 }, children: checking ? '…' : _jsx(ShieldCheck, { size: 18 }) })] }), err && _jsx("p", { style: { fontSize: 12, color: 'var(--red)', marginTop: 8 }, children: err }), _jsx("p", { style: { fontSize: 11, color: 'var(--text3)', marginTop: 10 }, children: "Codes expire after 5 minutes. Only works if you are online on the server." })] }), _jsx("div", { className: "div" }), _jsx("button", { onClick: () => nav('/dashboard'), className: "btn btn-gold-outline btn-sm", style: { width: '100%' }, children: "Skip for now (limited features)" })] }))] }) }));
}
