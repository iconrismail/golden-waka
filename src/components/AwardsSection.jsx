import { motion } from 'framer-motion';

const awards = [
    {
        org: "Condé Nast Traveller",
        title: "Gold List",
        year: "2024",
        category: "World's Best Travel Specialists",
    },
    {
        org: "Travel + Leisure",
        title: "World's Best",
        year: "2024",
        category: "Luxury Travel Agency",
    },
    {
        org: "Forbes Travel Guide",
        title: "Five-Star Rated",
        year: "2024",
        category: "Excellence in Hospitality",
    },
    {
        org: "National Geographic",
        title: "Top 100 Experiences",
        year: "2023",
        category: "Curated World Journeys",
    },
];

const partners = [
    "Four Seasons",
    "Aman Resorts",
    "Rosewood Hotels",
    "Six Senses",
    "Belmond",
    "One&Only",
    "Emirates",
    "NetJets",
];

export default function AwardsSection() {
    return (
        <section
            className="py-24 px-6 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p
                        className="font-sans text-xs tracking-[0.35em] uppercase mb-4"
                        style={{ color: 'var(--accent)' }}
                    >
                        Recognition & Trust
                    </p>
                    <h2
                        className="font-serif text-4xl md:text-5xl"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Award-Winning Excellence
                    </h2>
                </div>

                {/* Awards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                    {awards.map((award, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="p-6 rounded-2xl text-center"
                            style={{
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-card)',
                            }}
                        >
                            {/* Gold star */}
                            <div className="flex justify-center mb-4">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="#d4af37">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <p
                                className="font-serif text-lg mb-1 leading-tight"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {award.title}
                            </p>
                            <p
                                className="font-sans text-xs uppercase tracking-widest mb-2"
                                style={{ color: 'var(--accent)' }}
                            >
                                {award.org} · {award.year}
                            </p>
                            <p
                                className="font-sans text-xs leading-relaxed"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                {award.category}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Partners Strip */}
                <div
                    className="pt-10"
                    style={{ borderTop: '1px solid var(--border)' }}
                >
                    <p
                        className="text-center font-sans text-xs uppercase tracking-[0.3em] mb-8"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        Trusted Partners &amp; Affiliations
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
                        {partners.map((partner, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="font-serif text-base md:text-lg tracking-wide"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                {partner}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
