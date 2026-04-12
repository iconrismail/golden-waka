import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Data ────────────────────────────────────────────────────────────────────

const channels = [
    {
        title: "Call Us",
        value: "+1 (800) 555-1234",
        href: "tel:+18005551234",
        badge: "Instant",
        badgeGreen: true,
        desc: "Speak directly with a concierge",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
            </svg>
        ),
    },
    {
        title: "Email",
        value: "concierge@goldenwaka.com",
        href: "mailto:concierge@goldenwaka.com",
        badge: "~2 hrs",
        badgeGreen: false,
        desc: "Detailed inquiries & documentation",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        ),
    },
    {
        title: "WhatsApp",
        value: "Message Us",
        href: "https://wa.me/18005551234",
        badge: "Fast",
        badgeGreen: true,
        desc: "Quick questions & real-time updates",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
        ),
    },
    {
        title: "Book a Consultation",
        value: "30-min call with a specialist",
        href: "/contact",
        badge: "Recommended",
        badgeGreen: false,
        desc: "Ideal for complex, multi-destination trips",
        isLink: true,
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
        ),
    },
];

const helpCategories = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
        ),
        title: "Booking & Reservations",
        desc: "New bookings, itinerary changes, room upgrades, and special requests.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        title: "Cancellations & Refunds",
        desc: "Cancellation policy, refund timelines, and rescheduling options.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 .5.5v1z" /><path d="M21 13l-3-4H8l-3 4" /><path d="M2 16.5a.5.5 0 0 0 .5.5H6" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" />
            </svg>
        ),
        title: "Private Aviation",
        desc: "Flight arrangements, scheduling changes, and in-flight preferences.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        title: "Villa & Accommodation",
        desc: "Property information, amenities, check-in details, and on-site requests.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h20" /><path d="M5 20V8l7-5 7 5v12" />
            </svg>
        ),
        title: "Yacht & Sailing",
        desc: "Charter details, itinerary planning, crew requirements, and port logistics.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
        title: "Billing & Payments",
        desc: "Invoices, payment methods, receipts, and billing queries.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        title: "In-Destination Concierge",
        desc: "Real-time support while you're travelling — restaurants, transfers, emergencies.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Insurance & Visas",
        desc: "Travel insurance coverage, visa requirements, and documentation support.",
    },
];

const faqs = [
    {
        q: "How far in advance should I book?",
        a: "We recommend booking at least 3–6 months in advance for peak season travel, especially for our most popular destinations like the Maldives, Amalfi Coast, and Kyoto. That said, our concierge team often accommodates last-minute requests with as little as 24–72 hours notice.",
    },
    {
        q: "What is your cancellation policy?",
        a: "Our standard policy allows full refunds for cancellations made 60+ days before arrival. Cancellations within 30–60 days receive a 50% refund. Within 30 days, we work with our property partners to secure the best possible outcome. We always recommend comprehensive travel insurance for all bookings.",
    },
    {
        q: "Do you offer travel insurance?",
        a: "Yes. We partner with leading underwriters to offer comprehensive luxury travel insurance covering medical evacuation, trip cancellation, lost luggage, and more. Our Platinum coverage is recommended for all international travellers.",
    },
    {
        q: "Can you accommodate special dietary requirements?",
        a: "Absolutely. We coordinate all dietary needs — including severe allergies, vegan, kosher, halal, and fully custom preferences — with our villa chefs, hotel restaurants, and all dining reservations made on your behalf.",
    },
    {
        q: "How does 24/7 concierge support work while I'm travelling?",
        a: "Every client receives a dedicated WhatsApp line and direct phone number for their personal travel designer before departure. From flight delays to lost luggage to last-minute changes — we're always reachable, wherever you are in the world.",
    },
    {
        q: "Do you handle visa applications?",
        a: "We provide full visa guidance and can connect you with our specialist visa concierge for complex multi-destination itineraries. For standard applications, we supply all documentation, requirements, and step-by-step instructions.",
    },
    {
        q: "What currencies and payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, Amex), bank transfers, and for our members, cryptocurrency for select bookings. Invoices can be issued in USD, GBP, EUR, AED, or SGD.",
    },
    {
        q: "Can I modify my itinerary after booking?",
        a: "Yes — flexibility is central to how we work. Your travel designer can adjust dates, accommodations, activities, and transport at any stage. Modification fees depend on the supplier and timing, and we'll always advise you before proceeding.",
    },
];

const responseTimes = [
    { channel: "Phone", time: "Immediate", icon: "📞" },
    { channel: "WhatsApp", time: "Under 15 min", icon: "💬" },
    { channel: "Email", time: "Within 2 hrs", icon: "✉️" },
    { channel: "Consultation", time: "Same-day booking", icon: "📅" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ q, a, isOpen, onToggle }) {
    return (
        <div
            className="border-b cursor-pointer"
            style={{ borderColor: 'var(--border)' }}
            onClick={onToggle}
        >
            <div className="flex items-center justify-between py-5 gap-4">
                <p className="font-sans text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>
                    {q}
                </p>
                <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                        border: '1px solid var(--border)',
                        color: isOpen ? '#d4af37' : 'var(--text-muted)',
                        borderColor: isOpen ? '#d4af37' : 'var(--border)',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p className="font-sans text-sm leading-relaxed pb-5" style={{ color: 'var(--text-muted)' }}>
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SupportPage() {
    const [openFaq, setOpenFaq] = useState(null);

    const toggle = (i) => setOpenFaq(prev => prev === i ? null : i);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ── */}
            <div className="relative h-[52vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1557992260-ec58e38d363c?q=80&w=2574&auto=format&fit=crop"
                    alt="Golden Waka Support"
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)' }}
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)' }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        className="font-sans text-[11px] tracking-[0.4em] uppercase mb-5"
                        style={{ color: '#d4af37' }}
                    >
                        Support Centre
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="font-serif text-5xl md:text-7xl text-white leading-tight mb-5"
                    >
                        How can we<br />help you?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="font-sans text-sm"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                        Our concierge team is available 24 hours a day, 7 days a week.
                    </motion.p>
                </div>
            </div>

            {/* ── Quick Contact Channels ── */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                <div className="text-center mb-12">
                    <p className="font-sans text-[11px] uppercase tracking-[0.35em] mb-3" style={{ color: 'var(--accent)' }}>
                        Reach Us
                    </p>
                    <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
                        Contact Channels
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {channels.map((ch, i) => {
                        const inner = (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: i * 0.1 }}
                                className="group p-6 rounded-2xl h-full flex flex-col transition-all duration-300"
                                style={{
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg-card)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                                    e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.04)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                                }}
                            >
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                    style={{
                                        backgroundColor: 'rgba(212,175,55,0.08)',
                                        color: '#d4af37',
                                        border: '1px solid rgba(212,175,55,0.15)',
                                    }}
                                >
                                    {ch.icon}
                                </div>

                                {/* Badge */}
                                <span
                                    className="font-sans text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full self-start mb-4"
                                    style={{
                                        backgroundColor: ch.badgeGreen ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)',
                                        color: ch.badgeGreen ? '#22c55e' : '#d4af37',
                                    }}
                                >
                                    {ch.badge}
                                </span>

                                <p className="font-serif text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {ch.title}
                                </p>
                                <p className="font-sans text-xs mb-3 flex-1" style={{ color: 'var(--text-muted)' }}>
                                    {ch.desc}
                                </p>
                                <p
                                    className="font-sans text-xs font-semibold transition-colors duration-200 group-hover:underline"
                                    style={{ color: '#d4af37' }}
                                >
                                    {ch.value} →
                                </p>
                            </motion.div>
                        );

                        return ch.isLink
                            ? <Link key={i} to={ch.href} className="block">{inner}</Link>
                            : <a key={i} href={ch.href} className="block">{inner}</a>;
                    })}
                </div>

                {/* Response time strip */}
                <div
                    className="mt-10 rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                    {responseTimes.map((r, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-xl">{r.icon}</span>
                            <div>
                                <p className="font-sans text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {r.channel}
                                </p>
                                <p className="font-sans text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                    {r.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Help Categories ── */}
            <section
                className="py-20 px-6 md:px-12"
                style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="font-sans text-[11px] uppercase tracking-[0.35em] mb-3" style={{ color: 'var(--accent)' }}>
                            Browse Topics
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
                            Help Categories
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {helpCategories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="group flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-250"
                                style={{
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--bg)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }}
                            >
                                <div
                                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-250"
                                    style={{
                                        backgroundColor: 'rgba(212,175,55,0.07)',
                                        color: '#d4af37',
                                        border: '1px solid rgba(212,175,55,0.12)',
                                    }}
                                >
                                    {cat.icon}
                                </div>
                                <div>
                                    <p className="font-sans text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {cat.title}
                                    </p>
                                    <p className="font-sans text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                                        {cat.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="font-sans text-[11px] uppercase tracking-[0.35em] mb-3" style={{ color: 'var(--accent)' }}>
                            FAQ
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
                            Common Questions
                        </h2>
                    </div>

                    <div>
                        {faqs.map((faq, i) => (
                            <FaqItem
                                key={i}
                                q={faq.q}
                                a={faq.a}
                                isOpen={openFaq === i}
                                onToggle={() => toggle(i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section
                className="py-20 px-6 text-center"
                style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65 }}
                >
                    <p className="font-sans text-[11px] uppercase tracking-[0.35em] mb-4" style={{ color: 'var(--accent)' }}>
                        Still Need Help?
                    </p>
                    <h3 className="font-serif text-4xl md:text-5xl mb-6" style={{ color: 'var(--text-primary)' }}>
                        We're always here.
                    </h3>
                    <p className="font-sans text-sm max-w-md mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
                        Can't find what you're looking for? Our team is one message away — day or night.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/contact"
                            className="px-10 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-widest transition-all duration-200 cursor-pointer"
                            style={{ backgroundColor: '#d4af37', color: '#000' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#d4af37'}
                        >
                            Send a Message
                        </Link>
                        <a
                            href="tel:+18005551234"
                            className="px-10 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-widest transition-all duration-200 cursor-pointer"
                            style={{
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#d4af37';
                                e.currentTarget.style.color = '#d4af37';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                        >
                            Call Us Now
                        </a>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
