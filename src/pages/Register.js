import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { checkRegisterCode } from '../lib/api';
import { Eye, EyeOff, Lock, User, Sword, Shield, CheckCircle, XCircle, Gamepad2, Terminal } from 'lucide-react';
const Rule = ({ ok, text }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ok ? 'var(--green)' : 'var(--text2)' }, children: [ok ? _jsx(CheckCircle, { size: 12 }) : _jsx(XCircle, { size: 12 }), text] }));
export default function Register() {
    const [step, setStep] = useState(1);
    const [mcUsername, setMcUsername] = useState('');
    const [regCode, setRegCode] = useState('');
    const [codeValid, setCodeValid] = useState(false);
    const [checkingCode, setCheckingCode] = useState(false);
    const [codeErr, setCodeErr] = useState('');
    const [username, setUsername] = useState('');
    const [pw, setPw] = useState('');
    const [c2, setC2] = useState('');
    const [sp, setSp] = useState(false);
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();
    const nav = useNavigate();
    const rules = { len: pw.length >= 8, upper: /[A-Z]/.test(pw), num: /[0-9]/.test(pw), match: pw === c2 && c2.length > 0 };
    const verifyCode = async () => {
        if (!mcUsername.trim() || !regCode.trim())
            return;
        setCheckingCode(true);
        setCodeErr('');
        const ok = await checkRegisterCode(mcUsername.trim(), regCode.trim().toUpperCase());
        setCheckingCode(false);
        if (ok) {
            setCodeValid(true);
            setStep(2);
        }
        else
            setCodeErr('Invalid or expired code. Type /casino register ingame to get a new one.');
    };
    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        if (!rules.match) {
            setErr('Passwords do not match.');
            return;
        }
        setLoading(true);
        const r = await registerUser(username.trim(), pw, mcUsername.trim());
        if (!r.success) {
            setLoading(false);
            setErr(r.error);
            return;
        }
        const l = await loginUser(username.trim(), pw);
        setLoading(false);
        if (l.success) {
            refreshUser();
            nav('/verify');
        }
    };
    return (_jsx("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', zIndex: 1 }, children: _jsxs("div", { className: "afu", style: { width: '100%', maxWidth: 460 }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 28 }, children: [_jsx("div", { className: "float", style: { fontSize: 48, marginBottom: 12 }, children: "\uD83C\uDFB2" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 28, fontWeight: 900, marginBottom: 8 }, children: "Join Dev-SMP Casino" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 13 }, children: "You must be an active player on Dev-SMP to register" })] }), step === 1 ? (_jsxs("div", { className: "card-flat", style: { padding: 30 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.16)', borderRadius: 8, padding: '10px 14px', marginBottom: 22 }, children: [_jsx(Shield, { size: 14, color: "var(--gold)" }), _jsx("span", { style: { fontSize: 12, color: 'var(--gold)' }, children: "Step 1: Prove you are a Dev-SMP player" })] }), _jsxs("h3", { style: { fontSize: 15, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }, children: [_jsx(Gamepad2, { size: 15, color: "var(--gold)" }), "Get your registration code"] }), _jsxs("div", { style: { background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }, children: [_jsxs("div", { style: { display: 'flex', gap: 10, marginBottom: 10 }, children: [_jsx("div", { style: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }, children: "1" }), _jsxs("p", { style: { fontSize: 13, color: 'var(--text2)', paddingTop: 2 }, children: ["Join ", _jsx("strong", { style: { color: 'var(--text1)' }, children: "Dev-SMP" }), " in Minecraft"] })] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginBottom: 10 }, children: [_jsx("div", { style: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }, children: "2" }), _jsxs("div", { style: { paddingTop: 2 }, children: [_jsx("p", { style: { fontSize: 13, color: 'var(--text2)', marginBottom: 6 }, children: "Type this command:" }), _jsxs("div", { style: { background: 'rgba(0,0,0,.4)', borderRadius: 6, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 7 }, children: [_jsx(Terminal, { size: 13, color: "var(--text2)" }), _jsx("code", { style: { fontFamily: 'monospace', color: 'var(--gold)', fontSize: 14 }, children: "/casino register" })] })] })] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("div", { style: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,168,76,.14)', border: '1px solid rgba(201,168,76,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Playfair Display', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }, children: "3" }), _jsx("p", { style: { fontSize: 13, color: 'var(--text2)', paddingTop: 2 }, children: "Enter your MC username and the code below" })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Your Minecraft Username" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Sword, { size: 14, style: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' } }), _jsx("input", { className: "inp inp-icon", type: "text", value: mcUsername, onChange: e => setMcUsername(e.target.value), placeholder: "ExactMCName", required: true, minLength: 3, maxLength: 16 })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Registration Code (from ingame)" }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("input", { className: "inp", value: regCode, onChange: e => setRegCode(e.target.value.toUpperCase()), placeholder: "ABC123", maxLength: 8, onKeyDown: e => e.key === 'Enter' && verifyCode(), style: { fontFamily: 'Playfair Display', fontWeight: 700, letterSpacing: '.15em', textAlign: 'center', fontSize: 18 } }), _jsx("button", { className: "btn btn-gold", onClick: verifyCode, disabled: checkingCode || !mcUsername.trim() || !regCode.trim(), style: { flexShrink: 0, padding: '12px 18px' }, children: checkingCode ? '…' : 'Verify' })] }), codeErr && _jsx("p", { style: { fontSize: 12, color: 'var(--red)', marginTop: 6 }, children: codeErr })] })] }), _jsx("div", { className: "div" }), _jsxs("p", { style: { textAlign: 'center', fontSize: 13, color: 'var(--text2)' }, children: ["Already have an account? ", _jsx(Link, { to: "/login", style: { color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }, children: "Sign in" })] })] })) : (_jsxs("div", { className: "card-flat", style: { padding: 30 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(63,185,80,.07)', border: '1px solid rgba(63,185,80,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }, children: [_jsx(CheckCircle, { size: 14, color: "var(--green)" }), _jsxs("span", { style: { fontSize: 12, color: 'var(--green)' }, children: ["\u2713 Verified as ", mcUsername, " \u2014 Step 2: Create your account"] })] }), _jsxs("form", { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Casino Display Name" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(User, { size: 14, style: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' } }), _jsx("input", { className: "inp inp-icon", type: "text", value: username, onChange: e => setUsername(e.target.value), placeholder: "Your display name", required: true, minLength: 3, maxLength: 20 })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Lock, { size: 14, style: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' } }), _jsx("input", { className: "inp inp-icon", style: { paddingRight: 44 }, type: sp ? 'text' : 'password', value: pw, onChange: e => setPw(e.target.value), placeholder: "Min. 8 characters", required: true }), _jsx("button", { type: "button", onClick: () => setSp(!sp), style: { position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }, children: sp ? _jsx(EyeOff, { size: 14 }) : _jsx(Eye, { size: 14 }) })] }), pw.length > 0 && _jsxs("div", { style: { marginTop: 7, display: 'flex', flexDirection: 'column', gap: 3 }, children: [_jsx(Rule, { ok: rules.len, text: "At least 8 characters" }), _jsx(Rule, { ok: rules.upper, text: "One uppercase letter" }), _jsx(Rule, { ok: rules.num, text: "One number" })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Confirm Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Lock, { size: 14, style: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' } }), _jsx("input", { className: "inp inp-icon", style: { borderColor: c2.length > 0 ? (rules.match ? 'rgba(63,185,80,.4)' : 'rgba(229,83,75,.4)') : undefined }, type: sp ? 'text' : 'password', value: c2, onChange: e => setC2(e.target.value), placeholder: "Repeat password", required: true })] })] }), err && _jsx("div", { className: "afi", style: { background: 'rgba(229,83,75,.08)', border: '1px solid rgba(229,83,75,.25)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: 'var(--red)' }, children: err }), _jsx("button", { type: "submit", className: "btn btn-gold btn-lg", disabled: loading || !Object.values(rules).every(Boolean), style: { marginTop: 4, width: '100%' }, children: loading ? 'Creating…' : 'Create Account & Play' })] })] })), _jsx("p", { style: { textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text3)' }, children: "Your balance is synced from your Vault balance \u00B7 18+ only" })] }) }));
}
