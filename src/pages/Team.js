import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2, Check, X } from 'lucide-react';
const DISCORD = 'https://discord.gg/cBpy8N2ynr';
const TEAM_KEY = 'csn5_team';
const OWNER_MC = 'Schmesmalo';
const ROLE_PRESETS = [
    { role: 'Owner', color: '#c9a84c', icon: '👑', description: 'Server owner and founder' },
    { role: 'Co-Owner', color: '#e5534b', icon: '🔥', description: 'Co-owner of Dev-SMP' },
    { role: 'Developer', color: '#58a6ff', icon: '💻', description: 'Developing plugins and features' },
    { role: 'Builder', color: '#3fb950', icon: '🏗️', description: 'Building amazing structures' },
    { role: 'Admin', color: '#bc8cff', icon: '🛡️', description: 'Keeping the server safe' },
    { role: 'Moderator', color: '#e67e22', icon: '⚔️', description: 'Moderating the community' },
    { role: 'Helper', color: '#1abc9c', icon: '🤝', description: 'Helping players' },
];
function getTeam() {
    try {
        return JSON.parse(localStorage.getItem(TEAM_KEY) || 'null') || [
            { id: '1', mcUsername: 'Schmesmalo', displayName: 'Schmesmalo', role: 'Owner', color: '#c9a84c', icon: '👑', description: 'Founder and owner of Dev-SMP. Built this casino.', order: 0 },
        ];
    }
    catch {
        return [];
    }
}
function saveTeam(t) { localStorage.setItem(TEAM_KEY, JSON.stringify(t)); }
export default function Team() {
    const { user } = useAuth();
    const [team, setTeam] = useState(getTeam);
    const [isOwner] = useState(user?.mcUsername === OWNER_MC);
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ mcUsername: '', displayName: '', role: 'Developer', color: '#58a6ff', icon: '💻', description: '' });
    const [editForm, setEditForm] = useState({});
    const addMember = () => {
        if (!form.mcUsername.trim())
            return;
        const member = { id: crypto.randomUUID(), ...form, order: team.length };
        const updated = [...team, member].sort((a, b) => a.order - b.order);
        saveTeam(updated);
        setTeam(updated);
        setForm({ mcUsername: '', displayName: '', role: 'Developer', color: '#58a6ff', icon: '💻', description: '' });
        setShowAdd(false);
    };
    const removeMember = (id) => { const u = team.filter(m => m.id !== id); saveTeam(u); setTeam(u); };
    const startEdit = (m) => { setEditing(m.id); setEditForm({ ...m }); };
    const saveEdit = () => {
        if (!editing)
            return;
        const u = team.map(m => m.id === editing ? { ...m, ...editForm } : m);
        saveTeam(u);
        setTeam(u);
        setEditing(null);
    };
    const applyPreset = (preset) => {
        setForm(f => ({ ...f, role: preset.role, color: preset.color, icon: preset.icon, description: preset.description }));
    };
    // Group by role order
    const roleOrder = ['Owner', 'Co-Owner', 'Developer', 'Builder', 'Admin', 'Moderator', 'Helper'];
    const grouped = roleOrder.reduce((acc, role) => {
        const members = team.filter(m => m.role === role);
        if (members.length > 0)
            acc.push({ role, members });
        return acc;
    }, {});
    const otherRoles = team.filter(m => !roleOrder.includes(m.role));
    return (_jsxs("div", { style: { maxWidth: 1000, margin: '0 auto', padding: '28px 20px', position: 'relative', zIndex: 1 }, children: [_jsxs("div", { className: "afu", style: { marginBottom: 30, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 48, marginBottom: 12 }, children: "\uD83D\uDC65" }), _jsx("h1", { className: "tg playfair", style: { fontSize: 30, fontWeight: 900, marginBottom: 8 }, children: "Server Team" }), _jsx("p", { style: { color: 'var(--text2)', fontSize: 14, marginBottom: 16 }, children: "The people behind Dev-SMP" }), _jsxs("a", { href: DISCORD, target: "_blank", rel: "noopener noreferrer", style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: '#5865f2', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }, children: [_jsx("svg", { width: "16", height: "16", viewBox: "0 0 127.14 96.36", fill: "white", children: _jsx("path", { d: "M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" }) }), "Join our Discord Server"] })] }), isOwner && (_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("button", { className: "btn btn-gold btn-sm", onClick: () => setShowAdd(!showAdd), style: { marginBottom: showAdd ? 12 : 0, gap: 6 }, children: showAdd ? 'Cancel' : '+ Add Team Member' }), showAdd && (_jsxs("div", { className: "card-flat afu", style: { padding: 20 }, children: [_jsx("h3", { style: { fontSize: 14, fontWeight: 600, marginBottom: 14 }, children: "Add Member" }), _jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }, children: ROLE_PRESETS.map(p => (_jsxs("button", { className: "btn btn-sm", onClick: () => applyPreset(p), style: { padding: '5px 12px', background: form.role === p.role ? `${p.color}20` : 'var(--bg3)', border: `1px solid ${form.role === p.role ? p.color : 'var(--border)'}`, color: form.role === p.role ? p.color : 'var(--text2)' }, children: [p.icon, " ", p.role] }, p.role))) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: "MC Username" }), _jsx("input", { className: "inp", placeholder: "MinecraftName", value: form.mcUsername, onChange: e => setForm(f => ({ ...f, mcUsername: e.target.value, displayName: e.target.value })), style: { fontSize: 13 } })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: "Display Name" }), _jsx("input", { className: "inp", placeholder: "Display Name", value: form.displayName, onChange: e => setForm(f => ({ ...f, displayName: e.target.value })), style: { fontSize: 13 } })] })] }), _jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("label", { style: { fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.07em', display: 'block', marginBottom: 5 }, children: "Description" }), _jsx("input", { className: "inp", placeholder: "What do they do?", value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })), style: { fontSize: 13 } })] }), _jsx("button", { className: "btn btn-gold", onClick: addMember, style: { width: '100%', padding: '11px' }, children: "Add to Team" })] }))] })), roleOrder.map(role => {
                const members = team.filter(m => m.role === role);
                if (members.length === 0)
                    return null;
                const preset = ROLE_PRESETS.find(p => p.role === role);
                return (_jsxs("div", { style: { marginBottom: 28 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }, children: [_jsx("span", { style: { fontSize: 20 }, children: preset?.icon || '⭐' }), _jsxs("h2", { className: "playfair", style: { fontSize: 18, fontWeight: 700, color: preset?.color || 'var(--gold)' }, children: [role, "s"] }), _jsx("div", { style: { flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 } }), _jsx("span", { style: { fontSize: 12, color: 'var(--text2)' }, children: members.length })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }, children: members.map(m => (_jsxs("div", { className: "card", style: { padding: 20, position: 'relative', borderColor: `${m.color}25`, transition: 'all .2s' }, onMouseEnter: e => { const el = e.currentTarget; el.style.borderColor = `${m.color}60`; el.style.boxShadow = `0 8px 24px ${m.color}15`; }, onMouseLeave: e => { const el = e.currentTarget; el.style.borderColor = `${m.color}25`; el.style.boxShadow = ''; }, children: [isOwner && (_jsxs("div", { style: { position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: () => startEdit(m), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 3 }, children: _jsx(Edit2, { size: 12 }) }), m.mcUsername !== OWNER_MC && _jsx("button", { onClick: () => removeMember(m.id), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 3 }, children: _jsx(X, { size: 12 }) })] })), editing === m.id ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx("input", { className: "inp", value: editForm.displayName || '', onChange: e => setEditForm(f => ({ ...f, displayName: e.target.value })), style: { fontSize: 13 } }), _jsx("input", { className: "inp", value: editForm.description || '', onChange: e => setEditForm(f => ({ ...f, description: e.target.value })), style: { fontSize: 12 } }), _jsxs("div", { style: { display: 'flex', gap: 6 }, children: [_jsxs("button", { className: "btn btn-green btn-sm", onClick: saveEdit, style: { flex: 1, gap: 4 }, children: [_jsx(Check, { size: 12 }), "Save"] }), _jsxs("button", { className: "btn btn-red btn-sm", onClick: () => setEditing(null), style: { flex: 1, gap: 4 }, children: [_jsx(X, { size: 12 }), "Cancel"] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }, children: [_jsx("div", { style: { width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${m.color}40,${m.color}80)`, border: `2px solid ${m.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }, children: m.icon }), _jsxs("div", { children: [_jsx("p", { style: { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 15, color: 'var(--text1)' }, children: m.displayName }), _jsx("p", { style: { fontSize: 11, color: m.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }, children: m.role })] })] }), _jsx("p", { style: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }, children: m.description }), _jsxs("p", { style: { fontSize: 10, color: 'var(--text3)', marginTop: 8 }, children: ["MC: ", m.mcUsername] })] }))] }, m.id))) })] }, role));
            }), otherRoles.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "playfair", style: { fontSize: 18, fontWeight: 700, marginBottom: 14 }, children: "Other" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }, children: otherRoles.map(m => (_jsxs("div", { className: "card", style: { padding: 20, borderColor: `${m.color}25` }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }, children: [_jsx("div", { style: { width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${m.color}40,${m.color}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }, children: m.icon }), _jsxs("div", { children: [_jsx("p", { style: { fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 14 }, children: m.displayName }), _jsx("p", { style: { fontSize: 10, color: m.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }, children: m.role })] })] }), _jsx("p", { style: { fontSize: 12, color: 'var(--text2)' }, children: m.description })] }, m.id))) })] }))] }));
}
