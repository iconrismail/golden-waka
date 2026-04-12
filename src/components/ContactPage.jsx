import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

function FormField({ label, htmlFor, children }) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={htmlFor}
                className="font-sans text-[10px] uppercase tracking-[0.22em] block"
                style={{ color: 'var(--text-subtle)' }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}

function StyledInput({ id, name, type = 'text', value, onChange, placeholder, focused, setFocused, disabled, autoComplete, required }) {
    return (
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(name)}
            onBlur={() => setFocused('')}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            required={required}
            className="w-full rounded-xl px-4 py-3 text-sm font-sans focus:outline-none transition-all duration-200 bg-transparent placeholder:opacity-25 disabled:opacity-40"
            style={{
                border: `1px solid ${focused === name ? '#d4af37' : 'var(--border)'}`,
                color: 'var(--text-primary)',
            }}
        />
    );
}

function StyledSelect({ id, name, value, onChange, focused, setFocused, disabled, children }) {
    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(name)}
            onBlur={() => setFocused('')}
            disabled={disabled}
            className="w-full rounded-xl px-4 py-3 text-sm font-sans focus:outline-none transition-all duration-200 cursor-pointer appearance-none disabled:opacity-40"
            style={{
                border: `1px solid ${focused === name ? '#d4af37' : 'var(--border)'}`,
                color: value ? 'var(--text-primary)' : 'var(--text-subtle)',
                backgroundColor: 'var(--bg)',
            }}
        >
            {children}
        </select>
    );
}

const offices = [
    { city: "New York", address: "444 Madison Ave, NY 10022", tz: "EST" },
    { city: "London", address: "45 Grosvenor Sq, Mayfair W1K", tz: "GMT" },
    { city: "Dubai", address: "DIFC, Gate Village, Level 3", tz: "GST" },
    { city: "Singapore", address: "1 Raffles Place, #20-61", tz: "SGT" },
];

const inquiryTypes = [
    { value: "", label: "Select inquiry type" },
    { value: "journey", label: "Plan a Journey" },
    { value: "villa", label: "Villa & Accommodation" },
    { value: "aviation", label: "Private Aviation" },
    { value: "yacht", label: "Yacht Charter" },
    { value: "concierge", label: "Concierge Request" },
    { value: "corporate", label: "Corporate Retreat" },
    { value: "honeymoon", label: "Honeymoon Planning" },
    { value: "wellness", label: "Wellness Retreat" },
    { value: "media", label: "Media & Press" },
    { value: "other", label: "Other" },
];

const contactDetails = [
    {
        label: "Email",
        value: "concierge@goldenwaka.com",
        href: "mailto:concierge@goldenwaka.com",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        ),
    },
    {
        label: "Phone",
        value: "+1 (800) 555-1234",
        href: "tel:+18005551234",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
            </svg>
        ),
    },
    {
        label: "WhatsApp",
        value: "+1 (800) 555-1234",
        href: "https://wa.me/18005551234",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
        ),
    },
];

export default function ContactPage() {
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', guests: '', message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setTimeout(() => {
            toast({
                title: 'Inquiry Received',
                message: 'Your personal travel designer will be in touch within 2 hours.',
                type: 'success',
            });
            setFormData({ name: '', email: '', phone: '', subject: '', guests: '', message: '' });
            setSubmitting(false);
        }, 700);
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ── */}
            <div className="relative h-[60vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop"
                    alt="Contact Golden Waka"
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)' }}
                />

                {/* Decorative gold line */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5), transparent)' }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        className="font-sans text-[11px] tracking-[0.4em] uppercase mb-5"
                        style={{ color: '#d4af37' }}
                    >
                        Get in Touch
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="font-serif text-5xl md:text-7xl text-white leading-tight mb-5"
                    >
                        Let's plan your<br />perfect journey.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="font-sans text-sm max-w-sm"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                        A personal travel designer responds within 2 hours.
                    </motion.p>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 xl:gap-20">

                    {/* ── Left Panel ── */}
                    <motion.aside
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="lg:col-span-2 space-y-12"
                    >
                        {/* Intro text */}
                        <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            Whether you're envisioning a secluded island retreat, a safari, or a bespoke honeymoon — our team of dedicated travel designers is here to make it extraordinary, from first call to final farewell.
                        </p>

                        {/* Contact channels */}
                        <div className="space-y-6">
                            {contactDetails.map((item, i) => (
                                <div key={i}>
                                    <p
                                        className="font-sans text-[10px] uppercase tracking-[0.28em] mb-2"
                                        style={{ color: 'var(--text-subtle)' }}
                                    >
                                        {item.label}
                                    </p>
                                    <a
                                        href={item.href}
                                        className="flex items-center gap-2.5 font-sans text-base font-light transition-colors duration-200"
                                        style={{ color: 'var(--text-muted)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >
                                        <span style={{ color: '#d4af37' }}>{item.icon}</span>
                                        {item.value}
                                    </a>
                                </div>
                            ))}
                        </div>

                        {/* Office Locations */}
                        <div>
                            <p
                                className="font-sans text-[10px] uppercase tracking-[0.28em] mb-5"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                Our Offices
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {offices.map((o, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
                                        className="p-4 rounded-2xl"
                                        style={{
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--bg-card)',
                                        }}
                                    >
                                        <p className="font-serif text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {o.city}
                                        </p>
                                        <p className="font-sans text-xs leading-snug mb-2" style={{ color: 'var(--text-subtle)' }}>
                                            {o.address}
                                        </p>
                                        <span
                                            className="font-sans text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#d4af37' }}
                                        >
                                            {o.tz}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Availability badge */}
                        <div
                            className="flex items-start gap-4 p-5 rounded-2xl"
                            style={{
                                backgroundColor: 'rgba(212,175,55,0.05)',
                                border: '1px solid rgba(212,175,55,0.18)',
                            }}
                        >
                            <div className="shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            <div>
                                <p className="font-sans text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Concierge Online · 24/7
                                </p>
                                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Our team is available around the clock, every day of the year.
                                </p>
                            </div>
                        </div>
                    </motion.aside>

                    {/* ── Right: Form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="lg:col-span-3"
                    >
                        <div
                            className="p-8 md:p-12 rounded-3xl"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                            }}
                        >
                            <h2 className="font-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                                Tell us about your trip
                            </h2>
                            <p className="font-sans text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                                The more detail you share, the better we can tailor your experience.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Contact form" noValidate>

                                {/* Row 1: Name + Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <FormField label="Full Name" htmlFor="cp-name">
                                        <StyledInput
                                            id="cp-name" name="name" type="text"
                                            value={formData.name} onChange={handleChange}
                                            placeholder="Your full name"
                                            focused={focused} setFocused={setFocused}
                                            disabled={submitting} autoComplete="name" required
                                        />
                                    </FormField>
                                    <FormField label="Email Address" htmlFor="cp-email">
                                        <StyledInput
                                            id="cp-email" name="email" type="email"
                                            value={formData.email} onChange={handleChange}
                                            placeholder="your@email.com"
                                            focused={focused} setFocused={setFocused}
                                            disabled={submitting} autoComplete="email" required
                                        />
                                    </FormField>
                                </div>

                                {/* Row 2: Phone + Guests */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <FormField label="Phone (Optional)" htmlFor="cp-phone">
                                        <StyledInput
                                            id="cp-phone" name="phone" type="tel"
                                            value={formData.phone} onChange={handleChange}
                                            placeholder="+1 (000) 000-0000"
                                            focused={focused} setFocused={setFocused}
                                            disabled={submitting} autoComplete="tel"
                                        />
                                    </FormField>
                                    <FormField label="Number of Guests" htmlFor="cp-guests">
                                        <StyledSelect
                                            id="cp-guests" name="guests"
                                            value={formData.guests} onChange={handleChange}
                                            focused={focused} setFocused={setFocused}
                                            disabled={submitting}
                                        >
                                            <option value="">Select</option>
                                            <option value="1">Solo (1)</option>
                                            <option value="2">Couple (2)</option>
                                            <option value="3-5">Small Group (3–5)</option>
                                            <option value="6-10">Group (6–10)</option>
                                            <option value="10+">Large Group (10+)</option>
                                        </StyledSelect>
                                    </FormField>
                                </div>

                                {/* Row 3: Inquiry type */}
                                <FormField label="Inquiry Type" htmlFor="cp-subject">
                                    <StyledSelect
                                        id="cp-subject" name="subject"
                                        value={formData.subject} onChange={handleChange}
                                        focused={focused} setFocused={setFocused}
                                        disabled={submitting}
                                    >
                                        {inquiryTypes.map(t => (
                                            <option key={t.value} value={t.value} className="bg-[#0c0c0c]">
                                                {t.label}
                                            </option>
                                        ))}
                                    </StyledSelect>
                                </FormField>

                                {/* Row 4: Message */}
                                <FormField label="Your Message" htmlFor="cp-message">
                                    <textarea
                                        id="cp-message"
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('message')}
                                        onBlur={() => setFocused('')}
                                        rows={5}
                                        placeholder="Describe your dream trip — destination, dates, budget, any special requests…"
                                        disabled={submitting}
                                        className="w-full resize-none rounded-xl px-4 py-3 text-sm font-sans focus:outline-none transition-all duration-200 bg-transparent placeholder:opacity-25 disabled:opacity-40"
                                        style={{
                                            border: `1px solid ${focused === 'message' ? '#d4af37' : 'var(--border)'}`,
                                            color: 'var(--text-primary)',
                                        }}
                                    />
                                </FormField>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 rounded-full font-sans font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                    style={{ backgroundColor: '#d4af37', color: '#000' }}
                                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#fff'; }}
                                    onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#d4af37'; }}
                                >
                                    {submitting ? <><Spinner /><span>Sending…</span></> : 'Send Inquiry'}
                                </button>

                                <p className="text-center font-sans text-[11px] pt-1" style={{ color: 'var(--text-subtle)' }}>
                                    We typically respond within 2 hours · All enquiries are strictly confidential
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Bottom CTA strip ── */}
            <div
                className="py-14 px-6 text-center"
                style={{ borderTop: '1px solid var(--border)' }}
            >
                <p className="font-sans text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--text-subtle)' }}>
                    Prefer to talk right now?
                </p>
                <a
                    href="tel:+18005551234"
                    className="font-serif text-3xl md:text-4xl transition-colors duration-200"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                    +1 (800) 555-1234
                </a>
                <p className="font-sans text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
                    Available 24 hours · 7 days a week
                </p>
            </div>
        </div>
    );
}
