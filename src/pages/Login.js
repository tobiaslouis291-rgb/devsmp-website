import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
export default function Login() {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [sp, setSp] = useState(false);
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();
    const nav = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        const r = await loginUser(u.trim(), p);
        setLoading(false);
        if (r.success) {
            refreshUser();
            nav('/dashboard');
        }
        else
            setErr(r.error);
    };
    return (_jsx("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', zIndex: 1 }, children: _jsxs("div", { className: "afu", style: { width: '100%', maxWidth: 400 }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 36 }, children: [_jsx("div", { className: "float", style: { fontSize: 54, marginBottom: 14 }, children: "\uD83C\uDFB0" }), _jsx("h1", { className: "shimmer-text playfair", style: { fontSize: 30, fontWeight: 900, marginBottom: 7 }, children: "Dev-SMP Casino" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }, children: "By Schmesmalo \u00B7 Fortune Favors the Bold" })] }), _jsxs("div", { className: "card-flat", style: { padding: 32 }, children: [_jsx("h2", { className: "playfair", style: { fontSize: 19, fontWeight: 600, marginBottom: 26, textAlign: 'center' }, children: "Welcome Back" }), _jsxs("form", { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Username" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(User, { size: 15, style: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' } }), _jsx("input", { className: "inp inp-icon", type: "text", value: u, onChange: e => setU(e.target.value), placeholder: "Your casino username", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.09em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 7 }, children: "Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx(Lock, { size: 15, style: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' } }), _jsx("input", { className: "inp inp-icon", style: { paddingRight: 44 }, type: sp ? 'text' : 'password', value: p, onChange: e => setP(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true }), _jsx("button", { type: "button", onClick: () => setSp(!sp), style: { position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }, children: sp ? _jsx(EyeOff, { size: 15 }) : _jsx(Eye, { size: 15 }) })] })] }), err && _jsx("div", { className: "afi", style: { background: 'rgba(229,83,75,.08)', border: '1px solid rgba(229,83,75,.25)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: 'var(--red)' }, children: err }), _jsx("button", { type: "submit", className: "btn btn-gold btn-lg", disabled: loading, style: { marginTop: 6, width: '100%' }, children: loading ? 'Signing in…' : 'Enter the Casino' })] }), _jsx("div", { className: "div" }), _jsxs("p", { style: { textAlign: 'center', fontSize: 13, color: 'var(--text2)' }, children: ["No account? ", _jsx(Link, { to: "/register", style: { color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }, children: "Register" })] })] }), _jsx("div", { style: { display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }, children: ['/terms', '/privacy', '/impressum'].map(p => (_jsx(Link, { to: p, style: { fontSize: 11, color: 'var(--text3)', textDecoration: 'none', textTransform: 'capitalize' }, children: p.slice(1) }, p))) })] }) }));
}
