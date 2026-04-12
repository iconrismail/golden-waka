import { Link } from 'react-router-dom';

const InstagramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const navColumns = [
    {
        heading: "Destinations",
        links: [
            { label: "The Maldives", to: "/travel" },
            { label: "Amalfi Coast", to: "/travel" },
            { label: "Kyoto, Japan", to: "/travel" },
            { label: "Santorini", to: "/travel" },
            { label: "Bali, Indonesia", to: "/travel" },
            { label: "Aspen, Colorado", to: "/travel" },
        ],
    },
    {
        heading: "Experiences",
        links: [
            { label: "Private Aviation", to: "/services" },
            { label: "Villa Stays", to: "/services" },
            { label: "Yacht Charters", to: "/services" },
            { label: "Concierge", to: "/services" },
            { label: "Gourmet Dining", to: "/services" },
            { label: "Wellness Retreats", to: "/services" },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "About Us", to: "/about" },
            { label: "Journal", to: "/journal" },
            { label: "Careers", to: "/careers" },
            { label: "Press", to: "/press" },
            { label: "Sustainability", to: "/sustainability" },
            { label: "Contact Us", to: "/contact" },
        ],
    },
];

const certifications = [
    { symbol: "★", label: "Condé Nast Gold List 2024" },
    { symbol: "◆", label: "Travel + Leisure World's Best" },
    { symbol: "◈", label: "Forbes Five-Star Rated" },
    { symbol: "✦", label: "IATA Certified Agency" },
];

export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#050505', borderTop: '1px solid rgba(255,255,255,0.07)' }}>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">

                {/* Top Grid: Brand + Nav Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-10 mb-16">

                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-3 mb-5">
                            <img
                                src="/images/logo.png"
                                alt="Golden Waka"
                                className="h-10 w-auto object-contain"
                            />
                            <span
                                className="font-serif text-xl tracking-wide text-white"
                                style={{ letterSpacing: '0.04em' }}
                            >
                                Golden Waka
                            </span>
                        </div>

                        <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Crafting extraordinary journeys for discerning travellers since 2009. Every detail, perfectly curated.
                        </p>

                        {/* Contact info */}
                        <div className="space-y-2 mb-8">
                            <a
                                href="tel:+18005551234"
                                className="flex items-center gap-2 font-sans text-xs transition-colors duration-200"
                                style={{ color: 'rgba(255,255,255,0.45)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 6 6l.38-.38a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
                                </svg>
                                +1 (800) 555-1234
                            </a>
                            <a
                                href="mailto:concierge@goldenwaka.com"
                                className="flex items-center gap-2 font-sans text-xs transition-colors duration-200"
                                style={{ color: 'rgba(255,255,255,0.45)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                concierge@goldenwaka.com
                            </a>
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {[
                                { Icon: InstagramIcon, label: "Instagram" },
                                { Icon: LinkedInIcon, label: "LinkedIn" },
                                { Icon: TwitterIcon, label: "X / Twitter" },
                                { Icon: FacebookIcon, label: "Facebook" },
                            ].map(({ Icon, label }) => (
                                <button
                                    key={label}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                                    style={{
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: 'rgba(255,255,255,0.45)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#d4af37';
                                        e.currentTarget.style.color = '#d4af37';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                    }}
                                >
                                    <Icon />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nav Columns */}
                    {navColumns.map((col) => (
                        <div key={col.heading}>
                            <h4
                                className="font-sans font-semibold text-[10px] uppercase tracking-[0.22em] mb-7"
                                style={{ color: 'rgba(255,255,255,0.3)' }}
                            >
                                {col.heading}
                            </h4>
                            <ul className="space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="font-sans text-sm transition-colors duration-200"
                                            style={{ color: 'rgba(255,255,255,0.6)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ── Certifications / Awards Strip ── */}
                <div
                    className="py-8 flex flex-wrap items-center justify-between gap-5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                    {certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-lg" style={{ color: '#d4af37' }}>{cert.symbol}</span>
                            <span
                                className="font-sans text-[11px] uppercase tracking-[0.18em]"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                            >
                                {cert.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Bottom Bar ── */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-8">

                    {/* Copyright */}
                    <p
                        className="font-sans text-[11px] uppercase tracking-widest"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                    >
                        © 2026 Golden Waka. All rights reserved.
                    </p>

                    {/* Legal Links */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        {["Privacy Policy", "Terms & Conditions", "Cookie Policy", "Sitemap"].map((item) => (
                            <span
                                key={item}
                                className="font-sans text-[11px] uppercase tracking-widest cursor-pointer transition-colors duration-200"
                                style={{ color: 'rgba(255,255,255,0.25)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span
                            className="font-sans text-[9px] uppercase tracking-widest mr-1"
                            style={{ color: 'rgba(255,255,255,0.2)' }}
                        >
                            Pay with
                        </span>
                        {["VISA", "MC", "AMEX", "PAYPAL"].map((method) => (
                            <div
                                key={method}
                                className="px-2.5 py-1 rounded text-[9px] font-bold tracking-wider"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.4)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                {method}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
