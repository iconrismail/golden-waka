import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReservationForm from './ReservationForm';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [showReserve, setShowReserve] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { currentUser, signOut, isAdmin } = useAuth();

    // Derive user initials for the avatar
    const userInitials = (() => {
        if (!currentUser) return '';
        if (currentUser.displayName) {
            const parts = currentUser.displayName.trim().split(' ');
            return parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : parts[0].slice(0, 2).toUpperCase();
        }
        return currentUser.email ? currentUser.email[0].toUpperCase() : 'U';
    })();

    // passive: true — performance improvement per skill guidelines
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const navItems = [
        { name: 'Home',    path: '/'        },
        { name: 'About',   path: '/about'   },
        { name: 'Dates',   path: '/dates'   },
        { name: 'Travel',  path: '/travel'  },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Contact', path: '/contact' },
        { name: 'Support', path: '/support' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* ── Floating pill navbar ─────────────────────────────────── */}
            <header
                className={classNames(
                    // Base — skill: z-50 for fixed nav, transition 150-300ms
                    'fixed top-4 left-1/2 -translate-x-1/2 z-50',
                    'transition-all duration-300 ease-out',
                    'rounded-full flex items-center justify-between',
                    '-webkit-backdrop-filter backdrop-blur-md border border-white/10',
                    {
                        'w-[95%] max-w-7xl py-4 px-8 bg-black/20': !scrolled,
                        'w-[80%] max-w-5xl py-3 px-6 bg-black/55 shadow-lg shadow-black/25': scrolled,
                    }
                )}
            >
                {/* Logo + Desktop nav */}
                <div className="flex items-center gap-10">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded-sm"
                        aria-label="Golden Waka — Home"
                    >
                        <img
                            src="/images/logo.png"
                            alt=""
                            aria-hidden="true"
                            className="h-7 w-auto object-contain shrink-0 opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                        />
                        {/* Stacked two-line brand mark */}
                        <div className="flex flex-col leading-none gap-[3px]">
                            <span
                                className="font-sans font-light text-[8.5px] tracking-[0.45em] uppercase"
                                style={{ color: '#d4af37' }}
                            >
                                Golden
                            </span>
                            <span
                                className="font-serif text-[15px] tracking-[0.06em] text-white font-normal"
                            >
                                Waka
                            </span>
                        </div>
                    </Link>

                    {/* Desktop nav — skill: cursor-pointer, transition-colors 200ms */}
                    <nav className="hidden lg:flex gap-8 font-sans" aria-label="Main navigation">
                        {navItems.map(item => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={classNames(
                                    'uppercase tracking-wide text-xs relative transition-colors duration-200 cursor-pointer',
                                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm',
                                    isActive(item.path)
                                        ? 'text-white font-semibold'
                                        : 'text-white/65 hover:text-white'
                                )}
                            >
                                {item.name}
                                {/* skill: active indicator uses brand-gold, not plain white */}
                                {isActive(item.path) && (
                                    <motion.span
                                        layoutId="nav-active-line"
                                        className="absolute -bottom-1 left-0 w-full h-px bg-brand-gold"
                                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    {/* Theme toggle — skill: SVG icon, cursor-pointer, focus-visible */}
                    <motion.button
                        onClick={toggleTheme}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="w-8 h-8 flex items-center justify-center text-white/55 hover:text-white transition-colors duration-200 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                        aria-label={theme === 'dark' ? 'Switch to navy theme' : 'Switch to dark theme'}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {theme === 'dark' ? (
                                // Moon → click to go navy
                                <motion.svg
                                    key="moon"
                                    initial={{ rotate: -30, opacity: 0 }}
                                    animate={{ rotate: 0,   opacity: 1 }}
                                    exit={{    rotate:  30, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-4 h-4"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </motion.svg>
                            ) : (
                                // Sun → click to go dark
                                <motion.svg
                                    key="sun"
                                    initial={{ rotate: 30,  opacity: 0 }}
                                    animate={{ rotate: 0,   opacity: 1 }}
                                    exit={{    rotate: -30, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-4 h-4"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
                                >
                                    <circle cx="12" cy="12" r="5" />
                                    <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                </motion.svg>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Auth controls */}
                    {currentUser ? (
                        <div className="hidden md:flex items-center gap-3">
                            {/* Admin link — only visible to admins */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm"
                                    aria-label="Admin portal"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#d4af37' }}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    <span className="text-xs font-semibold" style={{ color: '#d4af37' }}>Admin</span>
                                </Link>
                            )}
                            {/* User avatar → goes to dashboard */}
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-full"
                                aria-label="Go to your dashboard"
                            >
                                <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-colors duration-200 group-hover:opacity-80"
                                    style={{ backgroundColor: '#d4af37', color: '#000' }}
                                >
                                    {userInitials}
                                </span>
                                <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-colors duration-200">
                                    Dashboard
                                </span>
                            </Link>
                            {/* Sign out */}
                            <button
                                onClick={() => signOut()}
                                className="text-white/40 hover:text-white/70 text-xs transition-colors duration-200 cursor-pointer focus-visible:outline-none"
                                aria-label="Sign out"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="hidden md:block text-white/75 hover:text-white text-sm font-semibold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-sm"
                        >
                            Login
                        </Link>
                    )}

                    {/* Reserve — skill: NO scale transform, use color transition only */}
                    <button
                        onClick={() => setShowReserve(true)}
                        className="hidden sm:flex items-center bg-white text-black px-6 py-2 rounded-full font-sans text-sm font-semibold transition-colors duration-200 hover:bg-brand-gold hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-1 focus-visible:ring-offset-black/50"
                    >
                        Reserve
                    </button>

                    {/* Hamburger — skill: aria-label, aria-expanded, cursor-pointer */}
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-full"
                    >
                        <motion.span
                            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="block w-6 h-px bg-white origin-center"
                        />
                        <motion.span
                            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.2 }}
                            className="block w-6 h-px bg-white origin-center"
                        />
                        <motion.span
                            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="block w-6 h-px bg-white origin-center"
                        />
                    </button>
                </div>
            </header>

            {/* ── Mobile full-screen menu ───────────────────────────────── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        // skill: theme-aware background instead of hardcoded #0a0a0a
                        className="fixed inset-0 z-40 backdrop-blur-xl flex flex-col lg:hidden"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 96%, transparent)' }}
                    >
                        {/* Ambient glow */}
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                            }}
                        />

                        {/* Nav links */}
                        <nav
                            className="flex flex-col items-center justify-center flex-1 gap-2 px-8"
                            aria-label="Mobile navigation"
                        >
                            {navItems.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ delay: i * 0.055 + 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <Link
                                        to={item.path}
                                        className={classNames(
                                            'block font-serif text-5xl sm:text-6xl tracking-wide py-2 text-center transition-colors duration-200 cursor-pointer focus-visible:outline-none',
                                            isActive(item.path)
                                                ? 'text-brand-gold'
                                                : 'text-white/65 hover:text-white'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Bottom bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.48, duration: 0.4 }}
                            className="flex items-center justify-between px-8 py-8 border-t border-white/10"
                        >
                            {currentUser ? (
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-9 h-9 rounded-full flex items-center justify-center font-sans text-xs font-bold shrink-0"
                                        style={{ backgroundColor: '#d4af37', color: '#000' }}
                                    >
                                        {userInitials}
                                    </span>
                                    <div className="flex flex-col gap-0.5">
                                        <Link
                                            to="/dashboard"
                                            className="font-sans text-sm font-semibold text-white cursor-pointer"
                                        >
                                            Dashboard
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="font-sans text-xs font-semibold cursor-pointer"
                                                style={{ color: '#d4af37' }}
                                            >
                                                Admin Portal
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { setMenuOpen(false); signOut(); }}
                                            className="font-sans text-xs text-white/40 hover:text-white/70 transition-colors text-left cursor-pointer"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="font-sans text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                            <button
                                onClick={() => { setMenuOpen(false); setShowReserve(true); }}
                                className="bg-brand-gold text-black px-6 py-3 rounded-full font-sans text-sm font-bold hover:bg-white transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                            >
                                Reserve
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Reservation modal ────────────────────────────────────── */}
            <AnimatePresence>
                {showReserve && <ReservationForm onClose={() => setShowReserve(false)} />}
            </AnimatePresence>
        </>
    );
}
