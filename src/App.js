import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LiveFeed from './components/LiveFeed';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Stock from './pages/Stock';
import { Terms, Privacy, Cookies, Impressum } from './pages/Legal';
import Home from './pages/Home';
import Team from './pages/Team';
import Slots from './pages/games/Slots';
import Blackjack from './pages/games/Blackjack';
import Roulette from './pages/games/Roulette';
import Crash from './pages/games/Crash';
import CoinFlip from './pages/games/CoinFlip';
import Poker from './pages/games/Poker';
import MultiLobby from './pages/games/MultiLobby';
function Guard({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return (_jsx("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 48, animation: 'float 1.5s ease-in-out infinite' }, children: "\uD83C\uDFB0" }), _jsx("p", { className: "playfair", style: { color: 'var(--gold)', marginTop: 14, letterSpacing: '.1em' }, children: "Loading\u2026" })] }) }));
    return user ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login", replace: true });
}
function Public({ children }) {
    const { user } = useAuth();
    return user ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(_Fragment, { children: children });
}
function Shell({ children }) {
    return _jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx(LiveFeed, {}), _jsx("main", { children: children }), _jsx(Footer, {})] });
}
function PublicShell({ children }) {
    return _jsxs(_Fragment, { children: [_jsx("main", { children: children }), _jsx(Footer, {})] });
}
export default function App() {
    return (_jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Public, { children: _jsx(Login, {}) }) }), _jsx(Route, { path: "/register", element: _jsx(Public, { children: _jsx(Register, {}) }) }), _jsx(Route, { path: "/verify", element: _jsx(Guard, { children: _jsx(Verify, {}) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Dashboard, {}) }) }) }), _jsx(Route, { path: "/leaderboard", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Leaderboard, {}) }) }) }), _jsx(Route, { path: "/settings", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Settings, {}) }) }) }), _jsx(Route, { path: "/stock", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Stock, {}) }) }) }), _jsx(Route, { path: "/", element: _jsx(PublicShell, { children: _jsx(Home, {}) }) }), _jsx(Route, { path: "/team", element: _jsx(PublicShell, { children: _jsx(Team, {}) }) }), _jsx(Route, { path: "/terms", element: _jsx(PublicShell, { children: _jsx(Terms, {}) }) }), _jsx(Route, { path: "/privacy", element: _jsx(PublicShell, { children: _jsx(Privacy, {}) }) }), _jsx(Route, { path: "/cookies", element: _jsx(PublicShell, { children: _jsx(Cookies, {}) }) }), _jsx(Route, { path: "/impressum", element: _jsx(PublicShell, { children: _jsx(Impressum, {}) }) }), _jsx(Route, { path: "/games/slots", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Slots, {}) }) }) }), _jsx(Route, { path: "/games/blackjack", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Blackjack, {}) }) }) }), _jsx(Route, { path: "/games/roulette", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Roulette, {}) }) }) }), _jsx(Route, { path: "/games/crash", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Crash, {}) }) }) }), _jsx(Route, { path: "/games/coinflip", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(CoinFlip, {}) }) }) }), _jsx(Route, { path: "/games/poker", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(Poker, {}) }) }) }), _jsx(Route, { path: "/games/lobby/:game", element: _jsx(Guard, { children: _jsx(Shell, { children: _jsx(MultiLobby, {}) }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) }));
}
