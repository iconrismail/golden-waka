import { motion } from 'framer-motion';

const cards = [
    {
        title: "The Ocean Villas",
        price: "From $1,200 / Night",
        description: "Overwater sanctuaries with private infinity pools and direct lagoon access.",
        image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop",
        tag: "Most Popular",
        accent: false,
    },
    {
        title: "The Beach Residence",
        price: "From $2,500 / Night",
        description: "Sprawling beachfront estates surrounded by lush tropical gardens and ocean vistas.",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop",
        tag: "Editor's Pick",
        accent: false,
    },
    {
        title: "The Royal Estate",
        price: "Inquire for Pricing",
        description: "The crown jewel of the island. 5 bedrooms, private chef, and full yacht access.",
        image: "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1200&auto=format&fit=crop",
        tag: "Ultra-Luxury",
        accent: true,
    },
];

export default function PricingSection() {
    return (
        <section className="relative z-10 w-full py-24 px-4 md:px-10"
            style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65 }}
                    className="text-center mb-16"
                >
                    <p className="font-sans text-xs tracking-[0.35em] uppercase mb-4"
                        style={{ color: '#d4af37' }}>
                        Our Collection
                    </p>
                    <h2 className="font-serif text-5xl md:text-7xl mb-6"
                        style={{ color: 'var(--text-primary)' }}>
                        Exclusive Stays
                    </h2>
                    <p className="max-w-xl mx-auto font-sans text-base leading-relaxed"
                        style={{ color: 'var(--text-muted)' }}>
                        Discover our curated portfolio of award-winning private residences,
                        each designed for the ultimate escape.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="group relative rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                border: card.accent
                                    ? '1px solid rgba(212,175,55,0.35)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                boxShadow: card.accent
                                    ? '0 0 40px -10px rgba(212,175,55,0.2)'
                                    : 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = card.accent
                                    ? 'rgba(212,175,55,0.6)'
                                    : 'rgba(212,175,55,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = card.accent
                                    ? 'rgba(212,175,55,0.35)'
                                    : 'rgba(255,255,255,0.08)';
                            }}
                        >
                            {/* Image */}
                            <div className="h-64 w-full overflow-hidden shrink-0 relative">
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0"
                                    style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />

                                {/* Tag badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="font-sans text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md"
                                        style={{
                                            backgroundColor: card.accent ? '#d4af37' : 'rgba(0,0,0,0.55)',
                                            color: card.accent ? '#000' : '#fff',
                                            border: card.accent ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                        }}>
                                        {card.tag}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-7 flex-1 flex flex-col">
                                <h3 className="font-serif text-2xl mb-2 leading-snug"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {card.title}
                                </h3>
                                <p className="font-sans text-xs uppercase tracking-widest mb-3"
                                    style={{ color: card.accent ? '#d4af37' : 'rgba(255,255,255,0.45)' }}>
                                    {card.price}
                                </p>
                                <p className="font-sans text-sm leading-relaxed flex-1"
                                    style={{ color: 'var(--text-muted)' }}>
                                    {card.description}
                                </p>

                                {/* CTA row */}
                                <div className="flex items-center justify-between mt-6 pt-5"
                                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                    <span className="font-sans text-xs uppercase tracking-widest transition-colors duration-200"
                                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                                        View Details
                                    </span>
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                                        style={{
                                            border: `1px solid ${card.accent ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.12)'}`,
                                            color: card.accent ? '#d4af37' : 'rgba(255,255,255,0.5)',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = '#d4af37';
                                            e.currentTarget.style.borderColor = '#d4af37';
                                            e.currentTarget.style.color = '#000';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = card.accent ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.12)';
                                            e.currentTarget.style.color = card.accent ? '#d4af37' : 'rgba(255,255,255,0.5)';
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" aria-hidden>
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Gold bottom accent line for ultra-luxury */}
                            {card.accent && (
                                <div className="absolute inset-x-0 bottom-0 h-0.5"
                                    style={{ background: 'linear-gradient(to right, transparent, #d4af37, transparent)' }} />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* View All CTA */}
                <div className="text-center mt-14">
                    <button
                        className="font-sans text-xs uppercase tracking-widest px-10 py-4 rounded-full transition-all duration-300 cursor-pointer"
                        style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#d4af37';
                            e.currentTarget.style.color = '#000';
                            e.currentTarget.style.borderColor = '#d4af37';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d4af37';
                            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                        }}
                    >
                        View All Properties
                    </button>
                </div>
            </div>
        </section>
    );
}
