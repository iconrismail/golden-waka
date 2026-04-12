import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ icon, label }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
                {icon}
            </div>
            <span className="font-sans text-[10px] uppercase tracking-[0.28em] font-semibold"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {label}
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
        </div>
    );
}

// ─── Labelled field wrapper ───────────────────────────────────────────────────
function Field({ id, label, required, children }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block font-sans text-[11px] uppercase tracking-[0.18em]"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                {label}{required && <span style={{ color: '#d4af37' }} aria-hidden> *</span>}
            </label>
            {children}
        </div>
    );
}

// ─── "What's included" checklist item ────────────────────────────────────────
function CheckItem({ text }) {
    return (
        <div className="flex items-center gap-2.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="7" stroke="#d4af37" strokeWidth="1.2" />
                <path d="M5 8l2 2 4-4" stroke="#d4af37" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</span>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ReservationForm({ destination, onClose }) {
    const toast = useToast();
    const { currentUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState(null);

    const [fields, setFields] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        departure: '', returnDate: '', guests: '2 Guests',
        tripType: '', accommodation: '', budget: '', requests: '',
    });

    const displayInfo = destination || {
        title: 'Bespoke Journey',
        location: 'Your Choice of Destination',
        price: 'Tailored to You',
        image: 'https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=1200&auto=format&fit=crop',
    };

    const today = new Date().toISOString().split('T')[0];

    const set = (e) => setFields(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        // Client-side required-field validation
        if (!fields.firstName.trim() || !fields.lastName.trim()) {
            toast({ title: 'Name Required', message: 'Please enter your first and last name.', type: 'error' });
            return;
        }
        if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
            toast({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'error' });
            return;
        }
        if (!fields.departure) {
            toast({ title: 'Date Required', message: 'Please select a departure date.', type: 'error' });
            return;
        }

        setSubmitting(true);

        const payload = {
            // Guest details
            firstName:    fields.firstName.trim(),
            lastName:     fields.lastName.trim(),
            email:        fields.email.trim(),
            phone:        fields.phone.trim(),
            // Journey details
            departure:    fields.departure,
            returnDate:   fields.returnDate,
            guests:       fields.guests,
            tripType:     fields.tripType,
            // Preferences
            accommodation: fields.accommodation,
            budget:        fields.budget,
            requests:      fields.requests.trim(),
            // Destination info (from card or generic)
            destination:        displayInfo.title,
            destinationLocation: displayInfo.location || '',
            destinationImage:   displayInfo.image,
            destinationPrice:   displayInfo.price || '',
            // Metadata
            status:    'Pending',
            userId:    currentUser?.uid || null,
            createdAt: serverTimestamp(),
        };

        try {
            // Create a shared doc reference so both writes share the same ID.
            // This allows admin status updates to sync back to the user's subcollection.
            const sharedRef = doc(collection(db, 'reservations'));
            await setDoc(sharedRef, payload);

            // Mirror to user's personal subcollection using the same ID
            if (currentUser) {
                await setDoc(
                    doc(db, 'users', currentUser.uid, 'reservations', sharedRef.id),
                    payload
                );
            }

            toast({
                title: 'Reservation Requested',
                message: `We'll confirm your ${displayInfo.title} booking within 24 hours.`,
                type: 'success',
            });
            onClose();
        } catch (err) {
            console.error('Reservation write failed:', err?.code, err?.message, err);
            const msg = err?.code === 'permission-denied'
                ? 'Permission denied. Please make sure you are signed in and try again.'
                : err?.code === 'unavailable'
                ? 'Network error. Check your connection and try again.'
                : `Could not send your reservation. (${err?.code || 'unknown error'})`;
            toast({
                title: 'Submission Failed',
                message: msg,
                type: 'error',
            });
            setSubmitting(false);
        }
    };

    // Shared input style — gold border when focused
    const inputStyle = (name) => ({
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: focused === name
            ? '1px solid #d4af37'
            : '1px solid rgba(255,255,255,0.12)',
        boxShadow: focused === name ? '0 0 0 3px rgba(212,175,55,0.1)' : 'none',
        borderRadius: '10px',
        padding: '11px 14px',
        color: '#fff',
        fontSize: '14px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        opacity: submitting ? 0.45 : 1,
    });

    const selectStyle = (name) => ({
        ...inputStyle(name),
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
    });

    const commonProps = (name) => ({
        id: `rf-${name}`,
        name,
        value: fields[name],
        onChange: set,
        onFocus: () => setFocused(name),
        onBlur: () => setFocused(null),
        disabled: submitting,
        style: inputStyle(name),
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rf-title"
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.94, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.94, y: 16, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                style={{
                    backgroundColor: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                }}
            >

                {/* ── Hero image header ─────────────────────────────────────── */}
                <div className="relative h-44 shrink-0">
                    <img
                        src={displayInfo.image}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, rgba(13,13,13,0.25) 0%, rgba(13,13,13,1) 100%)' }} />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        aria-label="Close reservation form"
                        className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Title overlay */}
                    <div className="absolute bottom-5 left-7">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-px w-5" style={{ backgroundColor: '#d4af37' }} />
                            <span className="font-sans text-[9px] uppercase tracking-[0.45em]"
                                style={{ color: '#d4af37' }}>
                                Reservation Request
                            </span>
                        </div>
                        <h2 id="rf-title" className="font-serif text-2xl text-white leading-tight">
                            {displayInfo.title}
                        </h2>
                        {displayInfo.price && (
                            <p className="font-sans text-[11px] uppercase tracking-[0.2em] mt-0.5"
                                style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {displayInfo.price}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── What's included strip ─────────────────────────────────── */}
                <div className="px-7 py-4 flex flex-wrap gap-x-5 gap-y-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <CheckItem text="Personal concierge" />
                    <CheckItem text="Custom itinerary" />
                    <CheckItem text="Private transfers" />
                    <CheckItem text="VIP dining access" />
                    <CheckItem text="24/7 trip support" />
                    <CheckItem text="Carbon offset" />
                </div>

                {/* ── Form ─────────────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="px-7 py-7 space-y-8" noValidate>

                    {/* — Section 1: Personal Details — */}
                    <div>
                        <SectionHead label="Personal Details"
                            icon={
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth="1.8" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field id="rf-firstName" label="First Name" required>
                                <input type="text" autoComplete="given-name"
                                    placeholder="James" required {...commonProps('firstName')} />
                            </Field>
                            <Field id="rf-lastName" label="Last Name" required>
                                <input type="text" autoComplete="family-name"
                                    placeholder="Whitmore" required {...commonProps('lastName')} />
                            </Field>
                            <Field id="rf-email" label="Email Address" required>
                                <input type="email" autoComplete="email"
                                    placeholder="james@example.com" required {...commonProps('email')} />
                            </Field>
                            <Field id="rf-phone" label="Phone Number">
                                <input type="tel" autoComplete="tel"
                                    placeholder="+1 (800) 000-0000" {...commonProps('phone')} />
                            </Field>
                        </div>
                    </div>

                    {/* — Section 2: Journey Details — */}
                    <div>
                        <SectionHead label="Journey Details"
                            icon={
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth="1.8" aria-hidden>
                                    <circle cx="12" cy="12" r="10" />
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field id="rf-departure" label="Departure Date" required>
                                <input type="date" min={today}
                                    required {...commonProps('departure')} />
                            </Field>
                            <Field id="rf-return" label="Return Date">
                                <input type="date" min={fields.departure || today}
                                    {...commonProps('returnDate')} />
                            </Field>
                            <Field id="rf-guests" label="Guests">
                                <select style={selectStyle('guests')}
                                    id="rf-guests" name="guests" value={fields.guests}
                                    onChange={set}
                                    onFocus={() => setFocused('guests')}
                                    onBlur={() => setFocused(null)}
                                    disabled={submitting}>
                                    {['1 Guest', '2 Guests', '3–4 Guests', '5–8 Guests', '9+ Guests'].map(o => (
                                        <option key={o} style={{ backgroundColor: '#111', color: '#fff' }}>{o}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field id="rf-tripType" label="Trip Type">
                                <select style={selectStyle('tripType')}
                                    id="rf-tripType" name="tripType" value={fields.tripType}
                                    onChange={set}
                                    onFocus={() => setFocused('tripType')}
                                    onBlur={() => setFocused(null)}
                                    disabled={submitting}>
                                    <option value="" style={{ backgroundColor: '#111', color: '#888' }}>Select occasion…</option>
                                    {['Honeymoon & Romance', 'Anniversary', 'Family Vacation', 'Solo Adventure', 'Corporate Retreat', 'Group Travel', 'Adventure & Expedition'].map(o => (
                                        <option key={o} style={{ backgroundColor: '#111', color: '#fff' }}>{o}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* — Section 3: Preferences — */}
                    <div>
                        <SectionHead label="Preferences"
                            icon={
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth="1.8" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <Field id="rf-accommodation" label="Accommodation Style">
                                <select style={selectStyle('accommodation')}
                                    id="rf-accommodation" name="accommodation" value={fields.accommodation}
                                    onChange={set}
                                    onFocus={() => setFocused('accommodation')}
                                    onBlur={() => setFocused(null)}
                                    disabled={submitting}>
                                    <option value="" style={{ backgroundColor: '#111', color: '#888' }}>Select preference…</option>
                                    {['Private Villa', 'Luxury Resort', 'Boutique Hotel', 'Overwater Bungalow', 'Safari Lodge', 'Ski Chalet', 'Yacht Charter'].map(o => (
                                        <option key={o} style={{ backgroundColor: '#111', color: '#fff' }}>{o}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field id="rf-budget" label="Budget (per person)">
                                <select style={selectStyle('budget')}
                                    id="rf-budget" name="budget" value={fields.budget}
                                    onChange={set}
                                    onFocus={() => setFocused('budget')}
                                    onBlur={() => setFocused(null)}
                                    disabled={submitting}>
                                    <option value="" style={{ backgroundColor: '#111', color: '#888' }}>Select range…</option>
                                    {['$3,000 – $5,000', '$5,000 – $10,000', '$10,000 – $20,000', '$20,000 – $50,000', '$50,000+'].map(o => (
                                        <option key={o} style={{ backgroundColor: '#111', color: '#fff' }}>{o}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field id="rf-requests" label="Special Requests & Notes">
                            <textarea
                                id="rf-requests" name="requests" rows={3}
                                value={fields.requests} onChange={set}
                                onFocus={() => setFocused('requests')}
                                onBlur={() => setFocused(null)}
                                disabled={submitting}
                                placeholder="Dietary requirements, celebrations, accessibility needs, dream experiences…"
                                style={{ ...inputStyle('requests'), resize: 'none', display: 'block' }}
                            />
                        </Field>
                    </div>

                    {/* ── Promise strip ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { symbol: '◆', text: 'Free cancellation\n48 hrs before' },
                            { symbol: '◈', text: 'Best rate\nguaranteed' },
                            { symbol: '✦', text: 'No booking\nfees — ever' },
                        ].map(({ symbol, text }) => (
                            <div key={symbol}
                                className="flex flex-col items-center text-center gap-1.5 py-3 px-2 rounded-xl"
                                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <span className="text-sm" style={{ color: '#d4af37' }}>{symbol}</span>
                                <span className="font-sans text-[10px] leading-snug whitespace-pre-line"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}>{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Submit ── */}
                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-[0.18em] cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#d4af37', color: '#000' }}
                            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#fff'; }}
                            onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#d4af37'; }}
                        >
                            {submitting ? (
                                <><Spinner /><span>Submitting…</span></>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth="2" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send Reservation Request
                                </>
                            )}
                        </button>

                        {/* Trust footer */}
                        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4">
                            {[
                                { label: '256-bit SSL Secure', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
                                { label: 'No Payment Now', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                                { label: 'Reply within 24 hrs', icon: <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg> },
                            ].map(({ label, icon }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.15em]"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
