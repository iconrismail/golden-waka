import { motion } from 'framer-motion';

const stats = [
    { number: "500+", label: "Curated Destinations", desc: "Across 90 countries" },
    { number: "24/7", label: "Personal Concierge", desc: "Always at your service" },
    { number: "15", label: "Years of Excellence", desc: "Trusted since 2009" },
    { number: "50K+", label: "Journeys Created", desc: "And counting" },
];

export default function StatsSection() {
    return (
        <section
            className="py-20 px-6"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 text-center">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center"
                    >
                        <p
                            className="font-serif text-5xl md:text-6xl mb-2 leading-none"
                            style={{ color: 'var(--accent)' }}
                        >
                            {stat.number}
                        </p>
                        <p
                            className="font-sans text-sm font-semibold uppercase tracking-widest mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {stat.label}
                        </p>
                        <p
                            className="font-sans text-xs"
                            style={{ color: 'var(--text-subtle)' }}
                        >
                            {stat.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
