import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinations } from '../data/destinations';

// Equirectangular projection: viewBox 0 0 1000 500
// x = (lon + 180) / 360 * 1000
// y = (90 - lat) / 180 * 500
const MAP_PINS = {
    kyoto:     { x: 876, y: 153 },
    amalfi:    { x: 541, y: 137 },
    aspen:     { x: 203, y: 141 },
    mykonos:   { x: 571, y: 146 },
    bali:      { x: 820, y: 274 },
    reykjavik: { x: 439, y: 72  },
};

// Simplified continent outlines in equirectangular projection
const CONTINENTS = [
    // North America
    "M 42,44 L 140,35 L 200,55 L 230,70 L 265,95 L 275,140 L 270,178 L 250,220 L 240,270 L 215,300 L 185,295 L 155,270 L 110,250 L 75,218 L 55,182 L 45,142 Z",
    // South America
    "M 165,242 L 265,238 L 290,268 L 302,338 L 285,418 L 265,465 L 230,475 L 195,460 L 168,415 L 155,360 L 155,310 L 165,270 Z",
    // Europe
    "M 455,72 L 510,68 L 555,80 L 575,100 L 570,130 L 555,155 L 535,172 L 505,178 L 475,170 L 455,148 L 448,118 Z",
    // Africa
    "M 462,148 L 565,145 L 582,185 L 595,230 L 578,310 L 568,375 L 545,430 L 510,455 L 478,455 L 452,410 L 442,345 L 448,262 L 455,200 Z",
    // Asia
    "M 555,65 L 748,50 L 870,55 L 958,72 L 968,100 L 952,155 L 935,200 L 908,250 L 880,305 L 842,345 L 790,360 L 730,340 L 672,315 L 620,290 L 585,270 L 562,235 L 555,185 Z",
    // Australia
    "M 752,295 L 895,282 L 918,308 L 920,372 L 898,420 L 855,442 L 800,448 L 756,428 L 735,390 L 735,348 Z",
    // Greenland
    "M 258,42 L 318,22 L 368,28 L 440,42 L 452,65 L 422,105 L 372,122 L 300,118 L 262,90 Z",
];

// Tooltip position — avoid SVG edges
function getTooltip(x, y) {
    const tw = 130, th = 44;
    const tx = x > 870 ? x - tw - 4 : x < 130 ? x + 4 : x - tw / 2;
    const ty = y < 80 ? y + 14 : y - th - 10;
    return { tx, ty, tw, th };
}

export default function InteractiveMap() {
    const [hovered, setHovered] = useState(null);
    const navigate = useNavigate();

    const dests = destinations
        .map(d => ({ ...d, ...MAP_PINS[d.id] }))
        .filter(d => d.x !== undefined);

    return (
        <section className="py-16 px-6" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <p
                            className="font-sans text-xs tracking-[0.35em] uppercase mb-3"
                            style={{ color: 'var(--accent)' }}
                        >
                            Explore the World
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--text-primary)' }}>
                            Where do you want to go?
                        </h2>
                    </div>
                    <p className="font-sans text-xs uppercase tracking-widest pb-1" style={{ color: 'var(--text-subtle)' }}>
                        Hover to preview · Click to explore
                    </p>
                </div>

                {/* Map — constrained width for a tighter, editorial feel */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        border: '1px solid var(--border)',
                        maxHeight: '340px',
                    }}
                >
                    <svg
                        viewBox="0 0 1000 500"
                        className="w-full block"
                        style={{ display: 'block', maxHeight: '340px' }}
                        role="img"
                        aria-label="Interactive world map with destination pins"
                    >
                        <defs>
                            <linearGradient id="mapGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0a1628" />
                                <stop offset="100%" stopColor="#060d1a" />
                            </linearGradient>
                            <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Background */}
                        <rect width="1000" height="500" fill="url(#mapGrad)" />

                        {/* Grid lines */}
                        {[100, 200, 300, 400].map(y => (
                            <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y}
                                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        ))}
                        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
                            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500"
                                stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        ))}

                        {/* Equator */}
                        <line x1="0" y1="250" x2="1000" y2="250"
                            stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 6" />

                        {/* Continents */}
                        {CONTINENTS.map((d, i) => (
                            <path
                                key={i}
                                d={d}
                                fill="rgba(255,255,255,0.07)"
                                stroke="rgba(255,255,255,0.14)"
                                strokeWidth="0.8"
                            />
                        ))}

                        {/* Destination pins */}
                        {dests.map(dest => {
                            const isHovered = hovered === dest.id;
                            const { tx, ty, tw, th } = getTooltip(dest.x, dest.y);

                            return (
                                <g
                                    key={dest.id}
                                    onClick={() => navigate('/travel', { state: { focusId: dest.id } })}
                                    onMouseEnter={() => setHovered(dest.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Glow halo on hover */}
                                    {isHovered && (
                                        <circle cx={dest.x} cy={dest.y} r="22"
                                            fill="url(#pinGlow)" />
                                    )}

                                    {/* Outer pulse ring — CSS animation via className */}
                                    <circle
                                        cx={dest.x} cy={dest.y} r="10"
                                        fill="none"
                                        stroke="rgba(212,175,55,0.35)"
                                        strokeWidth="1.5"
                                        className="map-pin-pulse"
                                    />

                                    {/* Inner ring */}
                                    <circle
                                        cx={dest.x} cy={dest.y} r="6"
                                        fill="none"
                                        stroke={isHovered ? 'rgba(212,175,55,0.9)' : 'rgba(212,175,55,0.6)'}
                                        strokeWidth="1.5"
                                    />

                                    {/* Center dot */}
                                    <circle
                                        cx={dest.x} cy={dest.y} r="3"
                                        fill={isHovered ? '#ffffff' : '#d4af37'}
                                    />

                                    {/* Tooltip */}
                                    {isHovered && (
                                        <g>
                                            <rect
                                                x={tx} y={ty}
                                                width={tw} height={th}
                                                rx="5"
                                                fill="rgba(5,10,20,0.95)"
                                                stroke="rgba(212,175,55,0.4)"
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={tx + tw / 2} y={ty + 15}
                                                textAnchor="middle"
                                                fill="#f0ece4"
                                                fontSize="8.5"
                                                fontFamily="serif"
                                                fontWeight="600"
                                            >
                                                {dest.title}
                                            </text>
                                            <text
                                                x={tx + tw / 2} y={ty + 30}
                                                textAnchor="middle"
                                                fill="#d4af37"
                                                fontSize="7.5"
                                                fontFamily="monospace"
                                                letterSpacing="1"
                                            >
                                                {dest.price} · {dest.location}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Map usage hint */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-4 mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d4af37' }}>
                                <circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                            </svg>
                        </div>
                        <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--text-primary)' }}>Hover</span> over a pin to preview the destination
                        </span>
                    </div>
                    <div className="hidden sm:block w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d4af37' }}>
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </div>
                        <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--text-primary)' }}>Click</span> any pin to explore that destination
                        </span>
                    </div>
                    <div className="hidden sm:block w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                            {/* Pulse dot to represent the animated pin */}
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d4af37' }} />
                        </div>
                        <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--text-primary)' }}>Pulsing pins</span> mark available destinations
                        </span>
                    </div>
                </div>

                {/* Mobile destination cards fallback */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 md:hidden">
                    {destinations.map(dest => (
                        <button
                            key={dest.id}
                            onClick={() => navigate('/travel', { state: { focusId: dest.id } })}
                            className="text-left p-4 rounded-xl transition-colors duration-200 cursor-pointer"
                            style={{
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-card)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <p className="font-serif text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {dest.title}
                            </p>
                            <p className="font-mono text-xs mt-1" style={{ color: 'var(--accent)' }}>
                                {dest.price}
                            </p>
                        </button>
                    ))}
                </div>

            </div>
        </section>
    );
}
