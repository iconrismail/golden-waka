import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auth, storage } from '../firebase';

// ── Inline icons ──────────────────────────────────────────────────────────────
function SpinnerIcon() {
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

// ── Password field with show/hide toggle ──────────────────────────────────────
function PwdField({ id, label, value, onChange, autoComplete, placeholder, showPwd, onToggle, disabled }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block font-sans text-[10px] uppercase tracking-[0.25em]"
                style={{ color: 'var(--text-subtle)' }}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={showPwd ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    placeholder={placeholder || '••••••••'}
                    disabled={disabled}
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-sans bg-transparent focus:outline-none transition-all duration-200 placeholder:opacity-25 disabled:opacity-40"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e  => e.currentTarget.style.borderColor = '#d4af37'}
                    onBlur={e   => e.currentTarget.style.borderColor = 'var(--border)'}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    tabIndex={-1}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 cursor-pointer focus:outline-none"
                    style={{ color: 'var(--text-subtle)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                >
                    {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
        </div>
    );
}

// ── Gold submit button ────────────────────────────────────────────────────────
function GoldButton({ children, disabled }) {
    return (
        <button
            type="submit"
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

// ── Friendly password-change error messages ───────────────────────────────────
function pwdError(code) {
    const map = {
        'auth/wrong-password':          'Current password is incorrect.',
        'auth/invalid-credential':      'Current password is incorrect.',
        'auth/requires-recent-login':   'Session expired. Sign out and sign back in, then try again.',
        'auth/weak-password':           'New password is too weak.',
        'auth/too-many-requests':       'Too many attempts. Please wait and try again.',
        'auth/network-request-failed':  'Network error. Check your connection.',
    };
    return map[code] || 'Could not update password. Please try again.';
}

// ── User initials helper ──────────────────────────────────────────────────────
function getInitials(user) {
    const name = user?.displayName || user?.email?.split('@')[0] || '';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase() || '?';
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfileSettingsModal({ onClose, onProfileUpdated }) {
    const { currentUser } = useAuth();
    const toast = useToast();

    const [tab,    setTab]    = useState('profile'); // 'profile' | 'password'
    const [saving, setSaving] = useState(false);

    // Profile tab state
    const [displayName,   setDisplayName]   = useState(currentUser?.displayName || '');
    const [photoFile,     setPhotoFile]     = useState(null);
    const [photoPreview,  setPhotoPreview]  = useState(currentUser?.photoURL || null);
    const [removePhoto,   setRemovePhoto]   = useState(false);
    const fileInputRef = useRef();

    // Password tab state
    const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
    const [showPwd, setShowPwd] = useState({});
    const togglePwd = (id) => setShowPwd(p => ({ ...p, [id]: !p[id] }));
    const pwdStrength = passwordStrength(pwdForm.newPwd);

    // ── Photo selection ───────────────────────────────────────────────────────
    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input value so the same file can be re-selected after removal
        e.target.value = '';

        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid File', message: 'Please select an image (JPG, PNG, or WebP).', type: 'error' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'File Too Large', message: 'Profile photo must be under 5 MB.', type: 'error' });
            return;
        }
        setPhotoFile(file);
        setRemovePhoto(false);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setRemovePhoto(true);
    };

    // ── Save profile ──────────────────────────────────────────────────────────
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (saving) return;
        const trimmedName = displayName.trim();
        if (!trimmedName) {
            toast({ title: 'Name Required', message: 'Display name cannot be empty.', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            let newPhotoURL = currentUser.photoURL;

            if (removePhoto) {
                newPhotoURL = null;
            } else if (photoFile) {
                // Upload to Firebase Storage at a fixed path per user (overwrites previous)
                const photoRef = storageRef(storage, `profile-pictures/${currentUser.uid}`);
                const snapshot = await uploadBytes(photoRef, photoFile);
                newPhotoURL = await getDownloadURL(snapshot.ref);
            }

            await updateProfile(auth.currentUser, {
                displayName: trimmedName,
                photoURL:    newPhotoURL ?? null,
            });

            // Notify the dashboard so it re-renders immediately
            onProfileUpdated({ displayName: trimmedName, photoURL: newPhotoURL ?? null });
            toast({ title: 'Profile Saved', message: 'Your profile has been updated.', type: 'success' });
            onClose();
        } catch (err) {
            console.error('Profile update error:', err);
            // Storage not enabled yet — fall back to name-only update
            if (err.code === 'storage/unknown' || err.message?.includes('storage')) {
                try {
                    await updateProfile(auth.currentUser, { displayName: trimmedName });
                    onProfileUpdated({ displayName: trimmedName, photoURL: currentUser.photoURL });
                    toast({
                        title: 'Name Saved',
                        message: 'Display name updated. Enable Firebase Storage to save photos.',
                        type: 'success',
                    });
                    onClose();
                    return;
                } catch { /* fall through to generic error */ }
            }
            toast({ title: 'Update Failed', message: 'Could not save your profile. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // ── Change password ───────────────────────────────────────────────────────
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (saving) return;
        if (!pwdForm.current) {
            toast({ title: 'Current Password Required', message: 'Enter your current password to continue.', type: 'error' });
            return;
        }
        if (pwdForm.newPwd.length < 8) {
            toast({ title: 'Password Too Short', message: 'New password must be at least 8 characters.', type: 'error' });
            return;
        }
        if (pwdForm.newPwd !== pwdForm.confirm) {
            toast({ title: "Passwords Don't Match", message: 'Please re-enter your new password.', type: 'error' });
            return;
        }
        if (pwdForm.current === pwdForm.newPwd) {
            toast({ title: 'Same Password', message: 'New password must be different from your current one.', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            // Re-authenticate — required by Firebase before sensitive operations
            const credential = EmailAuthProvider.credential(currentUser.email, pwdForm.current);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, pwdForm.newPwd);

            toast({ title: 'Password Changed', message: 'Your password has been updated successfully.', type: 'success' });
            setPwdForm({ current: '', newPwd: '', confirm: '' });
            onClose();
        } catch (err) {
            console.error('Password change error:', err);
            toast({ title: 'Password Change Failed', message: pwdError(err.code), type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const initials = getInitials(currentUser);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ps-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1,    y: 0,  opacity: 1 }}
                exit={{    scale: 0.95, y: 16, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                }}
            >
                {/* ── Modal header ── */}
                <div className="flex items-center justify-between px-7 pt-6 pb-5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <p className="font-sans text-[10px] uppercase tracking-[0.35em] mb-1"
                            style={{ color: '#d4af37' }}>
                            Account
                        </p>
                        <h2 id="ps-title" className="font-serif text-2xl"
                            style={{ color: 'var(--text-primary)' }}>
                            Profile Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close settings"
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)';
                            e.currentTarget.style.color = 'rgb(239,68,68)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Tab bar ── */}
                <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
                    {[
                        { key: 'profile',  label: 'Profile' },
                        { key: 'password', label: 'Password' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className="flex-1 py-3 font-sans text-xs uppercase tracking-widest transition-colors duration-200 cursor-pointer relative"
                            style={{ color: tab === t.key ? '#d4af37' : 'var(--text-muted)' }}
                        >
                            {t.label}
                            {tab === t.key && (
                                <motion.div
                                    layoutId="ps-tab-indicator"
                                    className="absolute bottom-0 left-6 right-6 h-px"
                                    style={{ backgroundColor: '#d4af37' }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab content ── */}
                <div className="px-7 py-7">
                    <AnimatePresence mode="wait">

                        {/* ── Profile tab ── */}
                        {tab === 'profile' && (
                            <motion.form
                                key="profile-tab"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSaveProfile}
                                className="space-y-6"
                                noValidate
                            >
                                {/* Avatar picker */}
                                <div className="flex flex-col items-center gap-3">
                                    {/* Avatar circle */}
                                    <div className="relative group">
                                        <div
                                            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center font-serif text-3xl select-none"
                                            style={{ backgroundColor: '#d4af37', color: '#000', flexShrink: 0 }}
                                        >
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{initials}</span>
                                            )}
                                        </div>

                                        {/* Camera overlay button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            aria-label="Upload profile photo"
                                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
                                            style={{
                                                backgroundColor: '#d4af37',
                                                color: '#000',
                                                border: '2.5px solid var(--bg-card)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#d4af37'}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2" aria-hidden>
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePhotoSelect}
                                    />

                                    {/* Upload / remove controls */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="font-sans text-xs uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
                                            style={{ border: '1px solid rgba(212,175,55,0.35)', color: '#d4af37' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = '#d4af37';
                                                e.currentTarget.style.color = '#000';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#d4af37';
                                            }}
                                        >
                                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="font-sans text-xs uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-subtle)' }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                                                    e.currentTarget.style.color = 'rgb(239,68,68)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = 'var(--border)';
                                                    e.currentTarget.style.color = 'var(--text-subtle)';
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <p className="font-sans text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                                        JPG, PNG or WebP · Max 5 MB
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="h-px" style={{ backgroundColor: 'var(--border)' }} />

                                {/* Display name */}
                                <div className="space-y-2">
                                    <label htmlFor="ps-name"
                                        className="block font-sans text-[10px] uppercase tracking-[0.25em]"
                                        style={{ color: 'var(--text-subtle)' }}>
                                        Display Name
                                    </label>
                                    <input
                                        id="ps-name"
                                        type="text"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        autoComplete="name"
                                        placeholder="Your full name"
                                        disabled={saving}
                                        className="w-full rounded-xl px-4 py-3 text-sm font-sans bg-transparent focus:outline-none transition-all duration-200 placeholder:opacity-25 disabled:opacity-40"
                                        style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                        onFocus={e => e.currentTarget.style.borderColor = '#d4af37'}
                                        onBlur={e  => e.currentTarget.style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                {/* Email (read-only — Firebase requires re-auth + verification to change) */}
                                <div className="space-y-2">
                                    <label className="block font-sans text-[10px] uppercase tracking-[0.25em]"
                                        style={{ color: 'var(--text-subtle)' }}>
                                        Email Address
                                    </label>
                                    <div className="flex items-center gap-3 w-full rounded-xl px-4 py-3"
                                        style={{ border: '1px solid var(--border)', opacity: 0.55 }}>
                                        <p className="font-sans text-sm flex-1 truncate"
                                            style={{ color: 'var(--text-muted)' }}>
                                            {currentUser?.email}
                                        </p>
                                        <span
                                            className="font-sans text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0"
                                            style={{
                                                backgroundColor: 'rgba(212,175,55,0.1)',
                                                color: '#d4af37',
                                                border: '1px solid rgba(212,175,55,0.2)',
                                            }}
                                        >
                                            Verified
                                        </span>
                                    </div>
                                </div>

                                {/* Member ID */}
                                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                                    <span className="font-sans text-[10px] uppercase tracking-widest"
                                        style={{ color: 'var(--text-subtle)' }}>Member ID</span>
                                    <span className="font-mono text-xs"
                                        style={{ color: '#d4af37' }}>
                                        GW-{currentUser?.uid?.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>

                                <GoldButton disabled={saving}>
                                    {saving
                                        ? <><SpinnerIcon /><span>Saving…</span></>
                                        : 'Save Profile'}
                                </GoldButton>
                            </motion.form>
                        )}

                        {/* ── Password tab ── */}
                        {tab === 'password' && (
                            <motion.form
                                key="password-tab"
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleChangePassword}
                                className="space-y-5"
                                noValidate
                            >
                                <p className="font-sans text-sm leading-relaxed"
                                    style={{ color: 'var(--text-muted)' }}>
                                    Confirm your identity with your current password, then choose a new one.
                                </p>

                                <PwdField
                                    id="ps-current"
                                    label="Current Password"
                                    value={pwdForm.current}
                                    onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))}
                                    autoComplete="current-password"
                                    showPwd={!!showPwd['ps-current']}
                                    onToggle={() => togglePwd('ps-current')}
                                    disabled={saving}
                                />

                                {/* New password + strength bar */}
                                <div className="space-y-2">
                                    <PwdField
                                        id="ps-new"
                                        label="New Password"
                                        value={pwdForm.newPwd}
                                        onChange={e => setPwdForm(p => ({ ...p, newPwd: e.target.value }))}
                                        autoComplete="new-password"
                                        placeholder="Min. 8 characters"
                                        showPwd={!!showPwd['ps-new']}
                                        onToggle={() => togglePwd('ps-new')}
                                        disabled={saving}
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

                                <PwdField
                                    id="ps-confirm"
                                    label="Confirm New Password"
                                    value={pwdForm.confirm}
                                    onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                                    autoComplete="new-password"
                                    placeholder="Repeat your new password"
                                    showPwd={!!showPwd['ps-confirm']}
                                    onToggle={() => togglePwd('ps-confirm')}
                                    disabled={saving}
                                />

                                {/* Visual match indicator */}
                                {pwdForm.confirm && (
                                    <p className="font-sans text-[11px] flex items-center gap-1.5"
                                        style={{
                                            color: pwdForm.newPwd === pwdForm.confirm
                                                ? '#22c55e' : '#ef4444',
                                        }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5" aria-hidden>
                                            {pwdForm.newPwd === pwdForm.confirm
                                                ? <path d="M20 6L9 17l-5-5" />
                                                : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                            }
                                        </svg>
                                        {pwdForm.newPwd === pwdForm.confirm ? 'Passwords match' : 'Passwords do not match'}
                                    </p>
                                )}

                                <GoldButton disabled={saving}>
                                    {saving
                                        ? <><SpinnerIcon /><span>Updating…</span></>
                                        : 'Change Password'}
                                </GoldButton>

                                <p className="font-sans text-[11px] text-center" style={{ color: 'var(--text-subtle)' }}>
                                    Alternatively,{' '}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="underline cursor-pointer transition-colors duration-150"
                                        style={{ color: '#d4af37' }}
                                    >
                                        use Forgot Password
                                    </button>
                                    {' '}on the login page for a reset link.
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
