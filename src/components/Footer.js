import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export default function Footer() {
    return (_jsx("footer", { style: { borderTop: '1px solid var(--border)', padding: '24px 20px', marginTop: 40, position: 'relative', zIndex: 1 }, children: _jsxs("div", { style: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }, children: [_jsxs("div", { children: [_jsx("p", { className: "playfair", style: { fontSize: 14, fontWeight: 600, color: 'var(--gold)', marginBottom: 4 }, children: "Dev-SMP Casino" }), _jsx("p", { style: { fontSize: 11, color: 'var(--text3)' }, children: "\u00A9 2026 Schmesmalo \u00B7 All rights reserved \u00B7 18+ only \u00B7 For entertainment purposes only" })] }), _jsx("div", { style: { display: 'flex', gap: 16, flexWrap: 'wrap' }, children: [
                        { to: '/terms', label: 'Terms' },
                        { to: '/privacy', label: 'Privacy' },
                        { to: '/cookies', label: 'Cookies' },
                        { to: '/impressum', label: 'Impressum' },
                    ].map(l => (_jsx(Link, { to: l.to, style: { fontSize: 12, color: 'var(--text2)', textDecoration: 'none', transition: 'color .18s' }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--gold)'), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text2)'), children: l.label }, l.to))) })] }) }));
}
