import { motion } from 'framer-motion';

const services = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M22 16.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 .5.5v1z" />
                <path d="M21 13l-3-4H8l-3 4" />
                <path d="M2 16.5a.5.5 0 0 0 .5.5H6" />
                <circle cx="7" cy="17" r="1" />
                <circle cx="17" cy="17" r="1" />
            </svg>
        ),
        title: "Private Aviation",
        description: "Seamless private jet and helicopter transfers to any destination, globally arranged end-to-end.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        title: "Elite Villa Collection",
        description: "Over 500 handpicked private residences across 60 countries — each vetted for supreme quality.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M2 20h20" />
                <path d="M5 20V8l7-5 7 5v12" />
                <path d="M22 9l-3-2" />
                <path d="M2 9l3-2" />
                <rect x="9" y="14" width="6" height="6" />
            </svg>
        ),
        title: "Yacht & Sailing",
        description: "Charter exclusive superyachts for open-ocean freedom. From day sails to full Mediterranean crossings.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
        title: "24/7 Concierge",
        description: "Your personal travel advisor — available around the clock to handle every detail before and during your trip.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: "Cultural Immersion",
        description: "Private access to heritage sites, local masters, and once-in-a-lifetime cultural experiences worldwide.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        title: "Gourmet & Dining",
        description: "Michelin-starred chefs, private dining rooms, and bespoke culinary journeys in any corner of the world.",
    },
];

export default function ServicesSection() {
    return (
        <section className="py-28 px-6" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <p
                            className="font-sans text-xs tracking-[0.35em] uppercase mb-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            What We Offer
                        </p>
                        <h2
                            className="font-serif text-5xl md:text-6xl leading-tight"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Luxury,<br />Reimagined
                        </h2>
                    </div>
                    <p
                        className="font-sans text-sm leading-relaxed max-w-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Every service we offer is built around one principle — removing friction so you can be fully present in the moment.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
                    style={{ backgroundColor: 'var(--border)' }}
                >
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="group p-8 md:p-10 transition-all duration-500 cursor-default"
                            style={{ backgroundColor: 'var(--bg)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
                        >
                            {/* Icon */}
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300"
                                style={{
                                    backgroundColor: 'rgba(212,175,55,0.08)',
                                    color: 'var(--accent)',
                                    border: '1px solid rgba(212,175,55,0.15)',
                                }}
                            >
                                {service.icon}
                            </div>

                            <h3
                                className="font-serif text-xl mb-3"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {service.title}
                            </h3>
                            <p
                                className="font-sans text-sm leading-relaxed"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {service.description}
                            </p>

                            {/* Hover underline arrow */}
                            <div className="flex items-center gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span
                                    className="font-sans text-xs uppercase tracking-widest"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    Learn more
                                </span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
