import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ── Shared icons ─────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}
function EyeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

// ── Password strength ─────────────────────────────────────────────────────────
function passwordStrength(pwd) {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8)                         score++;
    if (pwd.length >= 12)                        score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd))                       score++;
    if (/[^A-Za-z0-9]/.test(pwd))               score++;
    if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Fair',   color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Good',   color: '#84cc16', width: '75%' };
    return               { label: 'Strong', color: '#22c55e', width: '100%' };
}

// ── Security: unified error messages prevent user enumeration ─────────────────
// auth/user-not-found and auth/wrong-password intentionally return the same
// string so an attacker cannot determine whether an email account exists.
function friendlyError(code) {
    const map = {
        'auth/user-not-found':         'Invalid email or password.',
        'auth/wrong-password':         'Invalid email or password.',
        'auth/invalid-credential':     'Invalid email or password.',
        'auth/email-already-in-use':   'An account with that email already exists.',
        'auth/weak-password':          'Password must be at least 8 characters.',
        'auth/invalid-email':          'Please enter a valid email address.',
        'auth/too-many-requests':      'Too many attempts. Please wait a moment and try again.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
        'auth/popup-closed-by-user':   'Sign-in was cancelled.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}

// ── Email regex used for client-side reset validation ─────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Reusable input with optional password-visibility toggle ───────────────────
function InputField({
    id, label, type, value, onChange, placeholder,
    focused, setFocused, disabled, autoComplete, required,
    showPwd, onTogglePwd,
}) {
    const inputType = type === 'password' && showPwd ? 'text' : type;
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block font-sans text-[10px] uppercase tracking-[0.25em]"
                style={{ color: 'var(--text-subtle)' }}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id} type={inputType} value={value} onChange={onChange}
                    onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
                    placeholder={placeholder} disabled={disabled}
                    autoComplete={autoComplete} required={required}
                    className="w-full rounded-xl px-4 py-3 text-sm font-sans focus:outline-none transition-all duration-200 bg-transparent placeholder:opacity-25 disabled:opacity-40"
                    style={{
                        border: `1px solid ${focused === id ? '#d4af37' : 'var(--border)'}`,
                        color: 'var(--text-primary)',
                        paddingRight: type === 'password' ? '2.75rem' : undefined,
                    }}
                />
                {type === 'password' && onTogglePwd && (
                    <button
                        type="button"
                        onClick={onTogglePwd}
                        tabIndex={-1}
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 cursor-pointer focus:outline-none"
                        style={{ color: 'var(--text-subtle)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                    >
                        {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Gold CTA button ───────────────────────────────────────────────────────────
function GoldButton({ children, disabled, type = 'submit' }) {
    return (
        <button
            type={type}
            disabled={disabled}
            className="w-full py-3.5 rounded-full font-sans font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.backgroundColor = '#fff'; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.backgroundColor = '#d4af37'; }}
        >
            {children}
        </button>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LoginPage() {
    const [tab, setTab]         = useState('signin'); // 'signin' | 'signup'
    const [focused, setFocused] = useState('');
    const [submitting, setSub]  = useState(false);
    const [showPwd, setShowPwd] = useState({});        // { fieldId: bool }

    const [signInForm, setSignIn] = useState({ email: '', password: '' });
    const [signUpForm, setSignUp] = useState({ name: '', email: '', password: '', confirm: '' });
    const [resetMode, setReset]   = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const { currentUser, isAdmin, loading, signIn, signUp, resetPassword } = useAuth();
    const toast    = useToast();
    const navigate = useNavigate();

    // Redirect already-authenticated users to the right destination
    useEffect(() => {
        if (!loading && currentUser) {
            navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        }
    }, [currentUser, isAdmin, loading, navigate]);

    const togglePwd = (id) => setShowPwd(p => ({ ...p, [id]: !p[id] }));

    // ── Sign In ───────────────────────────────────────────────────────────────
    const handleSignIn = async (e) => {
        e.preventDefault();
        if (submitting) return;
        // Security: trim whitespace to prevent failed logins on valid accounts
        const email = signInForm.email.trim();
        if (!email) return;
        setSub(true);
        try {
            const cred = await signIn(email, signInForm.password);
            toast({ title: 'Welcome back', message: 'Signed in successfully.', type: 'success' });
            // Check admin status directly from credential so we can route immediately
            try {
                const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid));
                navigate(adminSnap.exists() ? '/admin' : '/dashboard', { replace: true });
            } catch {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            toast({ title: 'Sign In Failed', message: friendlyError(err.code), type: 'error' });
        } finally {
            setSub(false);
        }
    };

    // ── Sign Up ───────────────────────────────────────────────────────────────
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (submitting) return;
        const email = signUpForm.email.trim();
        const name  = signUpForm.name.trim();

        // Client-side validation before hitting Firebase
        if (!name) {
            toast({ title: 'Name Required', message: 'Please enter your full name.', type: 'error' });
            return;
        }
        if (!EMAIL_RE.test(email)) {
            toast({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'error' });
            return;
        }
        if (signUpForm.password.length < 8) {
            toast({ title: 'Password Too Short', message: 'Password must be at least 8 characters.', type: 'error' });
            return;
        }
        if (signUpForm.password !== signUpForm.confirm) {
            toast({ title: "Passwords Don't Match", message: 'Please re-enter your password.', type: 'error' });
            return;
        }

        setSub(true);
        try {
            await signUp(email, signUpForm.password, name);
            toast({ title: 'Account Created', message: 'Welcome to Golden Waka.', type: 'success' });
            navigate('/dashboard');
        } catch (err) {
            toast({ title: 'Registration Failed', message: friendlyError(err.code), type: 'error' });
        } finally {
            setSub(false);
        }
    };

    // ── Password Reset ────────────────────────────────────────────────────────
    const handleReset = async (e) => {
        e.preventDefault();
        if (submitting) return;
        const email = resetEmail.trim();
        // Validate email format before making the API call
        if (!EMAIL_RE.test(email)) {
            toast({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'error' });
            return;
        }
        setSub(true);
        try {
            await resetPassword(email);
            toast({ title: 'Reset Email Sent', message: 'Check your inbox for a password reset link.', type: 'success' });
            setReset(false);
            setResetEmail('');
        } catch (err) {
            toast({ title: 'Reset Failed', message: friendlyError(err.code), type: 'error' });
        } finally {
            setSub(false);
        }
    };

    const pwdStrength = passwordStrength(signUpForm.password);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ── */}
            <div className="relative h-[45vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2670&auto=format&fit=crop"
                    alt="" aria-hidden
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)' }} />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <motion.p
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="font-sans text-[11px] tracking-[0.4em] uppercase mb-4"
                        style={{ color: '#d4af37' }}
                    >
                        Members Area
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-serif text-4xl md:text-6xl text-white"
                    >
                        {resetMode
                            ? 'Reset your password.'
                            : tab === 'signin' ? 'Welcome back.' : 'Join Golden Waka.'}
                    </motion.h1>
                </div>
            </div>

            {/* ── Form card ── */}
            <div className="max-w-md mx-auto px-6 -mt-8 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.2 }}
                    className="rounded-3xl p-8 md:p-10"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                    }}
                >
                    {/* Tab switcher — hidden in reset mode */}
                    {!resetMode && (
                        <div className="flex mb-8 rounded-xl overflow-hidden"
                            style={{ border: '1px solid var(--border)' }}>
                            {[
                                { key: 'signin', label: 'Sign In' },
                                { key: 'signup', label: 'Create Account' },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className="flex-1 py-2.5 font-sans text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer"
                                    style={{
                                        backgroundColor: tab === t.key ? '#d4af37' : 'transparent',
                                        color: tab === t.key ? '#000' : 'var(--text-muted)',
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Password reset flow ── */}
                    {resetMode ? (
                        <div>
                            <button
                                onClick={() => { setReset(false); setResetEmail(''); }}
                                className="flex items-center gap-2 font-sans text-xs mb-6 transition-colors duration-200 cursor-pointer"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                Back to Sign In
                            </button>
                            <h2 className="font-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                                Forgot your password?
                            </h2>
                            <p className="font-sans text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                                Enter the email linked to your account and we'll send a reset link.
                            </p>
                            <form onSubmit={handleReset} className="space-y-5" noValidate>
                                <InputField
                                    id="reset-email" label="Email Address" type="email"
                                    value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                                    placeholder="your@email.com" focused={focused} setFocused={setFocused}
                                    disabled={submitting} autoComplete="email" required
                                />
                                <GoldButton disabled={submitting}>
                                    {submitting ? <><Spinner /><span>Sending…</span></> : 'Send Reset Link'}
                                </GoldButton>
                            </form>
                        </div>

                    ) : (
                        <AnimatePresence mode="wait">

                            {/* ── Sign In ── */}
                            {tab === 'signin' && (
                                <motion.form
                                    key="signin"
                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    transition={{ duration: 0.25 }}
                                    onSubmit={handleSignIn}
                                    className="space-y-5"
                                    noValidate
                                >
                                    <InputField
                                        id="si-email" label="Email Address" type="email"
                                        value={signInForm.email}
                                        onChange={e => setSignIn(p => ({ ...p, email: e.target.value }))}
                                        placeholder="your@email.com" focused={focused} setFocused={setFocused}
                                        disabled={submitting} autoComplete="email" required
                                    />
                                    <div className="space-y-1.5">
                                        <InputField
                                            id="si-password" label="Password" type="password"
                                            value={signInForm.password}
                                            onChange={e => setSignIn(p => ({ ...p, password: e.target.value }))}
                                            placeholder="••••••••" focused={focused} setFocused={setFocused}
                                            disabled={submitting} autoComplete="current-password" required
                                            showPwd={!!showPwd['si-password']}
                                            onTogglePwd={() => togglePwd('si-password')}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="button" onClick={() => setReset(true)}
                                                className="font-sans text-[11px] transition-colors duration-200 cursor-pointer"
                                                style={{ color: 'var(--text-subtle)' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                    </div>

                                    <GoldButton disabled={submitting}>
                                        {submitting ? <><Spinner /><span>Signing In…</span></> : 'Sign In'}
                                    </GoldButton>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                                        <span className="font-sans text-[10px] uppercase tracking-widest"
                                            style={{ color: 'var(--text-subtle)' }}>or</span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                                    </div>
                                    <p className="font-sans text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                                        New here?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setTab('signup')}
                                            className="font-semibold cursor-pointer transition-colors duration-200"
                                            style={{ color: '#d4af37' }}
                                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                        >
                                            Create a free account
                                        </button>
                                    </p>
                                </motion.form>
                            )}

                            {/* ── Create Account ── */}
                            {tab === 'signup' && (
                                <motion.form
                                    key="signup"
                                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.25 }}
                                    onSubmit={handleSignUp}
                                    className="space-y-5"
                                    noValidate
                                >
                                    <InputField
                                        id="su-name" label="Full Name" type="text"
                                        value={signUpForm.name}
                                        onChange={e => setSignUp(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Your full name" focused={focused} setFocused={setFocused}
                                        disabled={submitting} autoComplete="name" required
                                    />
                                    <InputField
                                        id="su-email" label="Email Address" type="email"
                                        value={signUpForm.email}
                                        onChange={e => setSignUp(p => ({ ...p, email: e.target.value }))}
                                        placeholder="your@email.com" focused={focused} setFocused={setFocused}
                                        disabled={submitting} autoComplete="email" required
                                    />

                                    {/* Password + strength bar */}
                                    <div className="space-y-2">
                                        <InputField
                                            id="su-password" label="Password" type="password"
                                            value={signUpForm.password}
                                            onChange={e => setSignUp(p => ({ ...p, password: e.target.value }))}
                                            placeholder="Min. 8 characters" focused={focused} setFocused={setFocused}
                                            disabled={submitting} autoComplete="new-password" required
                                            showPwd={!!showPwd['su-password']}
                                            onTogglePwd={() => togglePwd('su-password')}
                                        />
                                        {pwdStrength && (
                                            <div>
                                                <div className="h-1 rounded-full overflow-hidden"
                                                    style={{ backgroundColor: 'var(--border)' }}>
                                                    <div
                                                        className="h-full rounded-full transition-all duration-300"
                                                        style={{ width: pwdStrength.width, backgroundColor: pwdStrength.color }}
                                                    />
                                                </div>
                                                <p className="font-sans text-[10px] mt-1 text-right"
                                                    style={{ color: pwdStrength.color }}>
                                                    {pwdStrength.label}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <InputField
                                        id="su-confirm" label="Confirm Password" type="password"
                                        value={signUpForm.confirm}
                                        onChange={e => setSignUp(p => ({ ...p, confirm: e.target.value }))}
                                        placeholder="Repeat your password" focused={focused} setFocused={setFocused}
                                        disabled={submitting} autoComplete="new-password" required
                                        showPwd={!!showPwd['su-confirm']}
                                        onTogglePwd={() => togglePwd('su-confirm')}
                                    />

                                    <GoldButton disabled={submitting}>
                                        {submitting ? <><Spinner /><span>Creating…</span></> : 'Create Account'}
                                    </GoldButton>

                                    <p className="font-sans text-[11px] text-center" style={{ color: 'var(--text-subtle)' }}>
                                        By creating an account you agree to our{' '}
                                        <span className="underline cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                                            Terms &amp; Conditions
                                        </span>
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    )}
                </motion.div>

                {/* Back to home */}
                <p className="text-center mt-6 font-sans text-xs" style={{ color: 'var(--text-subtle)' }}>
                    <Link
                        to="/"
                        className="transition-colors duration-200"
                        onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                    >
                        ← Back to Golden Waka
                    </Link>
                </p>
            </div>
        </div>
    );
}
