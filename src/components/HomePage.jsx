import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCanvas from './HeroCanvas';
import StatsSection from './StatsSection';
import PricingSection from './PricingSection';
import ServicesSection from './ServicesSection';
import BentoGrid from './BentoGrid';
import AwardsSection from './AwardsSection';
import TestimonialsSection from './TestimonialsSection';
import InteractiveMap from './InteractiveMap';
import NewsletterSection from './NewsletterSection';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
    const containerRef = useRef(null);

    return (
        <main className="w-full" style={{ backgroundColor: 'var(--bg)' }}>
            {/* Hero — 300vh scroll track with sticky canvas */}
            <div ref={containerRef} className="relative h-[300vh]">
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    <HeroCanvas scrollTrackRef={containerRef} />
                </div>
            </div>

            {/* Content sections */}
            <div className="relative z-10" style={{ backgroundColor: 'var(--bg)' }}>
                {/* Trust indicators — first thing after the hero */}
                <StatsSection />

                {/* Featured property collection */}
                <PricingSection />

                {/* What we offer */}
                <ServicesSection />

                {/* Curated destination media grid */}
                <BentoGrid />

                {/* Awards + partners */}
                <AwardsSection />

                {/* Social proof */}
                <TestimonialsSection />

                {/* Interactive world map */}
                <InteractiveMap />

                {/* Members-only newsletter CTA */}
                <NewsletterSection />
            </div>
        </main>
    );
}
