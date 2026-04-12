import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function NewsletterSection() {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || submitting) return;
        setSubmitting(true);
        setTimeout(() => {
            toast({
                title: 'Welcome to the Inner Circle',
                message: "You'll receive exclusive rates and early access to our rarest destinations.",
                type: 'success',
            });
            setEmail('');
            setSubmitting(false);
        }, 800);
    };

    return (
        <section
            className="py-32 px-6 relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
            {/* Ambient glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />

            <div className="max-w-3xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true, margin: '-80px' }}
                >
                    {/* Eyebrow */}
                    <p
                        className="font-sans text-sm tracking-[0.3em] uppercase mb-6"
                        style={{ color: 'var(--accent)' }}
                    >
                        Members Only
                    </p>

                    {/* Headline */}
                    <h2
                        className="font-serif text-5xl md:text-7xl leading-tight mb-6"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Join the<br />Inner Circle
                    </h2>

                    {/* Subtext */}
                    <p
                        className="font-sans text-lg leading-relaxed mb-12"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        First access to rare destinations, private members' rates,
                        <br className="hidden sm:block" />
                        and invitations to exclusive events around the world.
                    </p>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="your@email.com"
                            className="flex-1 bg-transparent rounded-full px-6 py-4 text-sm font-sans focus:outline-none transition-colors duration-200"
                            style={{
                                border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                                color: 'var(--text-primary)',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-widest transition-all duration-300 whitespace-nowrap cursor-pointer"
                            style={{
                                backgroundColor: submitting ? 'rgba(212,175,55,0.6)' : 'var(--accent)',
                                color: '#000000',
                            }}
                            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
                            onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
                        >
                            {submitting ? 'Joining…' : 'Join Now'}
                        </button>
                    </form>

                    {/* Fine print */}
                    <p
                        className="text-xs mt-6 font-sans uppercase tracking-wider"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        No spam. Unsubscribe at any time.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
