/**
 * Emotion & Reaction Faces SVG Generators and Pack Configurations
 * Covers all 21 core user requested emotion faces across categories:
 * happy, smile, laugh, sad, cry, angry, bored, love, shock, confused,
 * sleepy, excited, scared, thank-you, sorry, yes, no, good, bad, greeting, celebration
 */

function generateSvg({ bg = 'none', elements = '', defs = '', title = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    ${defs}
  </defs>
  ${elements}
</svg>`;
}

// ----------------------------------------------------
// 1. COFFEE CUP EMOTION SVGS
// ----------------------------------------------------
export const COFFEE_EMOTION_SVGS = {
  'coffee_confused': () => generateSvg({
    defs: `<linearGradient id="c_confused" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#eab308"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <path d="M72 26 Q75 14 84 16 Q88 24 82 28 Q80 32 80 34" stroke="#ca8a04" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="38" r="1.5" fill="#ca8a04"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#a16207" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_confused)" stroke="#a16207" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#78350f" stroke="#a16207" stroke-width="2"/>
        <circle cx="58" cy="74" r="4.5" fill="#451a03"/>
        <ellipse cx="94" cy="72" rx="5" ry="6" fill="#451a03"/>
        <path d="M68 90 Q76 86 84 92" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="114" y="42" font-family="sans-serif" font-weight="900" font-size="22" fill="#d97706">?</text>
      </g>
    `
  }),
  'coffee_scared': () => generateSvg({
    defs: `<linearGradient id="c_scared" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#7dd3fc"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#0284c7" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_scared)" stroke="#0284c7" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#0369a1" stroke="#0284c7" stroke-width="2"/>
        <rect x="62" y="38" width="10" height="10" rx="2" fill="#e0f2fe" opacity="0.8"/>
        <rect x="80" y="40" width="10" height="10" rx="2" fill="#e0f2fe" opacity="0.8"/>
        <circle cx="60" cy="74" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <circle cx="60" cy="74" r="2.5" fill="#0f172a"/>
        <circle cx="92" cy="74" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <circle cx="92" cy="74" r="2.5" fill="#0f172a"/>
        <path d="M66 94 Q76 88 86 94" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M34 60 L38 65 M32 75 L36 80 M116 60 L112 65 M118 75 L114 80" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `
  }),
  'coffee_thankyou': () => generateSvg({
    defs: `<linearGradient id="c_thanks" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#fb923c"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <polygon points="76,14 78,22 86,24 78,26 76,34 74,26 66,24 74,22" fill="#facc15"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#c2410c" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_thanks)" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#78350f" stroke="#c2410c" stroke-width="2"/>
        <path d="M58 74 Q64 68 70 74" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M82 74 Q88 68 94 74" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M68 86 Q76 94 84 86" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="54" cy="82" r="4" fill="#f43f5e" opacity="0.5"/>
        <circle cx="98" cy="82" r="4" fill="#f43f5e" opacity="0.5"/>
        <rect x="46" y="98" width="60" height="18" rx="6" fill="#ffffff" stroke="#c2410c" stroke-width="1.5"/>
        <text x="52" y="111" font-family="sans-serif" font-weight="900" font-size="10" fill="#c2410c">THANKS!</text>
      </g>
    `
  }),
  'coffee_sorry': () => generateSvg({
    defs: `<linearGradient id="c_sorry" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="76" cy="116" rx="48" ry="8" fill="#78350f" opacity="0.8"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_sorry)" stroke="#64748b" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#475569" stroke="#64748b" stroke-width="2"/>
        <circle cx="60" cy="74" r="5" fill="#1e293b"/>
        <circle cx="58" cy="72" r="2" fill="#ffffff"/>
        <circle cx="92" cy="74" r="5" fill="#1e293b"/>
        <circle cx="90" cy="72" r="2" fill="#ffffff"/>
        <path d="M70 90 Q76 84 82 90" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <text x="52" y="104" font-family="sans-serif" font-weight="900" font-size="10" fill="#475569">SORRY!</text>
      </g>
    `
  }),
  'coffee_yes': () => generateSvg({
    defs: `<linearGradient id="c_yes" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="100%" stop-color="#4ade80"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <path d="M70 24 L76 32 L92 14" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_yes)" stroke="#15803d" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#14532d" stroke="#15803d" stroke-width="2"/>
        <path d="M58 72 Q64 66 70 72" stroke="#14532d" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M82 72 Q88 66 94 72" stroke="#14532d" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M68 86 Q76 96 84 86" stroke="#14532d" stroke-width="3" stroke-linecap="round" fill="#16a34a"/>
        <circle cx="118" cy="40" r="14" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
        <path d="M112 40 L116 44 L124 36" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    `
  }),
  'coffee_no': () => generateSvg({
    defs: `<linearGradient id="c_no" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fecaca"/><stop offset="100%" stop-color="#f87171"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <line x1="70" y1="16" x2="86" y2="32" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
        <line x1="86" y1="16" x2="70" y2="32" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#b91c1c" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_no)" stroke="#b91c1c" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#7f1d1d" stroke="#b91c1c" stroke-width="2"/>
        <line x1="56" y1="70" x2="68" y2="76" stroke="#450a0a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="96" y1="70" x2="84" y2="76" stroke="#450a0a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="68" y1="90" x2="84" y2="90" stroke="#450a0a" stroke-width="3" stroke-linecap="round"/>
        <rect x="52" y="98" width="48" height="16" rx="4" fill="#dc2626"/>
        <text x="64" y="110" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff">NOPE</text>
      </g>
    `
  }),
  'coffee_good': () => generateSvg({
    defs: `<linearGradient id="c_good" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#facc15"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <polygon points="120,20 123,27 130,29 124,34 126,41 120,37 114,41 116,34 110,29 117,27" fill="#eab308"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#a16207" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_good)" stroke="#a16207" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#78350f" stroke="#a16207" stroke-width="2"/>
        <path d="M58 72 Q64 66 70 72" stroke="#713f12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="92" cy="72" r="4" fill="#713f12"/>
        <path d="M68 84 Q76 94 84 84" stroke="#713f12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <rect x="54" y="96" width="44" height="16" rx="4" fill="#ca8a04"/>
        <text x="60" y="108" font-family="sans-serif" font-weight="900" font-size="10" fill="#ffffff">GOOD! 👌</text>
      </g>
    `
  }),
  'coffee_bad': () => generateSvg({
    defs: `<linearGradient id="c_bad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#71717a"/><stop offset="100%" stop-color="#3f3f46"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <path d="M72 32 Q66 18 78 12 Q86 20 80 32" fill="#52525b"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#27272a" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_bad)" stroke="#27272a" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#18181b" stroke="#27272a" stroke-width="2"/>
        <line x1="56" y1="70" x2="68" y2="76" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="96" y1="70" x2="84" y2="76" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M70 92 Q76 84 82 92" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M74 94 Q76 102 78 94 Z" fill="#ef4444"/>
        <text x="56" y="110" font-family="sans-serif" font-weight="900" font-size="10" fill="#f87171">BAD 👎</text>
      </g>
    `
  }),
  'coffee_greeting': () => generateSvg({
    defs: `<linearGradient id="c_greet" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#f97316"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <path d="M30 40 Q40 25 35 15" stroke="#ea580c" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="34" cy="14" r="6" fill="#f97316"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#c2410c" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_greet)" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#78350f" stroke="#c2410c" stroke-width="2"/>
        <circle cx="60" cy="72" r="4.5" fill="#431407"/>
        <circle cx="92" cy="72" r="4.5" fill="#431407"/>
        <path d="M68 84 Q76 94 84 84" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="52" cy="78" r="4" fill="#f43f5e" opacity="0.6"/>
        <circle cx="100" cy="78" r="4" fill="#f43f5e" opacity="0.6"/>
        <rect x="52" y="96" width="48" height="16" rx="4" fill="#ea580c"/>
        <text x="56" y="108" font-family="sans-serif" font-weight="900" font-size="10" fill="#ffffff">HELLO! 👋</text>
      </g>
    `
  }),
  'coffee_celebration': () => generateSvg({
    defs: `<linearGradient id="c_celeb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fbcfe8"/><stop offset="100%" stop-color="#ec4899"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <polygon points="65,42 76,14 87,42" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="76" cy="14" r="3.5" fill="#ef4444"/>
        <circle cx="35" cy="30" r="2.5" fill="#38bdf8"/>
        <circle cx="118" cy="30" r="2.5" fill="#4ade80"/>
        <circle cx="125" cy="45" r="2" fill="#facc15"/>
        <circle cx="28" cy="50" r="2" fill="#ec4899"/>
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#be185d" stroke-width="8" stroke-linecap="round"/>
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#c_celeb)" stroke="#be185d" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#831843" stroke="#be185d" stroke-width="2"/>
        <path d="M58 72 L66 76 L58 80" stroke="#831843" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M94 72 L86 76 L94 80" stroke="#831843" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M68 86 Q76 98 84 86 Z" fill="#ffffff" stroke="#831843" stroke-width="2"/>
        <text x="50" y="110" font-family="sans-serif" font-weight="900" font-size="10" fill="#ffffff">YAY! 🎉</text>
      </g>
    `
  })
};

// ----------------------------------------------------
// 2. ANIME EMOTION SVGS
// ----------------------------------------------------
export const ANIME_EMOTION_SVGS = {
  'anime_happy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M56 70 Q64 62 72 70" stroke="#431407" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M88 70 Q96 62 104 70" stroke="#431407" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M66 86 Q80 106 94 86 Z" fill="#ef4444" stroke="#431407" stroke-width="3"/>
        <circle cx="52" cy="82" r="6" fill="#f43f5e" opacity="0.6"/>
        <circle cx="108" cy="82" r="6" fill="#f43f5e" opacity="0.6"/>
        <polygon points="124,38 127,45 134,47 127,49 124,56 121,49 114,47 121,45" fill="#facc15"/>
        <polygon points="36,44 38,50 44,52 38,54 36,60 34,54 28,52 34,50" fill="#facc15"/>
      </g>
    `
  }),
  'anime_smile': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <ellipse cx="62" cy="74" rx="7" ry="9" fill="#1e1b4b"/>
        <circle cx="60" cy="70" r="3" fill="#ffffff"/>
        <ellipse cx="98" cy="74" rx="7" ry="9" fill="#1e1b4b"/>
        <circle cx="96" cy="70" r="3" fill="#ffffff"/>
        <path d="M70 90 Q80 98 90 90" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="54" cy="84" rx="6" ry="4" fill="#fb7185" opacity="0.6"/>
        <ellipse cx="106" cy="84" rx="6" ry="4" fill="#fb7185" opacity="0.6"/>
      </g>
    `
  }),
  'anime_laugh': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M52 68 L64 74 L52 80" stroke="#431407" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M108 68 L96 74 L108 80" stroke="#431407" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M64 84 Q80 110 96 84 Z" fill="#e11d48" stroke="#431407" stroke-width="3"/>
        <ellipse cx="80" cy="98" rx="7" ry="4" fill="#fca5a5"/>
        <path d="M42 66 Q36 60 40 54 Q46 60 42 66 Z" fill="#38bdf8"/>
        <path d="M118 66 Q124 60 120 54 Q114 60 118 66 Z" fill="#38bdf8"/>
      </g>
    `
  }),
  'anime_sad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M54 74 Q62 68 70 72" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M90 72 Q98 68 106 74" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M70 94 Q80 86 90 94" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M54 62 L66 66" stroke="#431407" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M106 62 L94 66" stroke="#431407" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="80" cy="36" rx="20" ry="8" fill="#94a3b8" opacity="0.8"/>
        <path d="M74 44 L72 50 M80 44 L78 52 M86 44 L84 50" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
      </g>
    `
  }),
  'anime_bored': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <line x1="54" y1="74" x2="70" y2="74" stroke="#431407" stroke-width="4" stroke-linecap="round"/>
        <line x1="90" y1="74" x2="106" y2="74" stroke="#431407" stroke-width="4" stroke-linecap="round"/>
        <circle cx="62" cy="78" r="3" fill="#431407"/>
        <circle cx="98" cy="78" r="3" fill="#431407"/>
        <line x1="70" y1="94" x2="90" y2="94" stroke="#431407" stroke-width="3" stroke-linecap="round"/>
        <text x="110" y="45" font-family="sans-serif" font-weight="900" font-size="12" fill="#78716c">MEH...</text>
      </g>
    `
  }),
  'anime_confused': () => generateSvg({
    elements: `
      <g filter="url(#shadow)" transform="rotate(-10 80 80)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Spiral eyes -->
        <circle cx="62" cy="74" r="8" fill="none" stroke="#431407" stroke-width="2.5"/>
        <circle cx="62" cy="74" r="4" fill="none" stroke="#431407" stroke-width="2"/>
        <circle cx="98" cy="74" r="8" fill="none" stroke="#431407" stroke-width="2.5"/>
        <circle cx="98" cy="74" r="4" fill="none" stroke="#431407" stroke-width="2"/>
        <path d="M72 92 Q78 86 84 92 Q90 98 94 92" stroke="#431407" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </g>
      <text x="120" y="44" font-family="sans-serif" font-weight="900" font-size="24" fill="#a855f7">???</text>
    `
  }),
  'anime_sleepy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M54 76 Q62 82 70 76" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M90 76 Q98 82 106 76" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Snot bubble -->
        <ellipse cx="88" cy="82" rx="14" ry="16" fill="#67e8f9" stroke="#0891b2" stroke-width="2" opacity="0.85"/>
        <ellipse cx="84" cy="78" rx="4" ry="5" fill="#ffffff" opacity="0.8"/>
        <text x="115" y="40" font-family="sans-serif" font-weight="900" font-size="18" fill="#6366f1">Z</text>
        <text x="128" y="28" font-family="sans-serif" font-weight="900" font-size="14" fill="#818cf8">z</text>
      </g>
    `
  }),
  'anime_scared': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#e0e7ff" stroke="#4338ca" stroke-width="3"/>
        <!-- Ghost escaping mouth -->
        <path d="M80 94 Q90 70 105 60 Q120 75 110 90 Q95 96 80 94 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="106" cy="70" r="2" fill="#1e1b4b"/>
        <circle cx="112" cy="72" r="2" fill="#1e1b4b"/>
        <!-- Terrified eyes -->
        <ellipse cx="62" cy="74" rx="8" ry="12" fill="#ffffff" stroke="#1e1b4b" stroke-width="2.5"/>
        <circle cx="62" cy="74" r="3" fill="#1e1b4b"/>
        <ellipse cx="98" cy="74" rx="8" ry="12" fill="#ffffff" stroke="#1e1b4b" stroke-width="2.5"/>
        <circle cx="98" cy="74" r="3" fill="#1e1b4b"/>
        <ellipse cx="80" cy="98" rx="10" ry="14" fill="#1e1b4b"/>
        <line x1="40" y1="40" x2="44" y2="48" stroke="#3b82f6" stroke-width="2"/>
        <line x1="48" y1="36" x2="52" y2="46" stroke="#3b82f6" stroke-width="2"/>
      </g>
    `
  }),
  'anime_thankyou': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="72" r="42" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M58 66 Q64 60 70 66" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M90 66 Q96 60 102 66" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M74 80 Q80 86 86 80" stroke="#431407" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="52" cy="74" r="5" fill="#f43f5e" opacity="0.6"/>
        <circle cx="108" cy="74" r="5" fill="#f43f5e" opacity="0.6"/>
        <!-- Hands in prayer -->
        <polygon points="72,118 78,88 88,88 88,118" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <text x="32" y="140" font-family="sans-serif" font-weight="900" font-size="13" fill="#f59e0b">ARIGATO! 🙏</text>
      </g>
    `
  }),
  'anime_sorry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="70" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M56 66 Q64 62 70 68" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M90 68 Q96 62 104 66" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M74 80 Q80 74 86 80" stroke="#431407" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Sweat teardrop -->
        <path d="M112 50 C108 58 110 68 116 70 C122 68 124 58 112 50 Z" fill="#38bdf8"/>
        <!-- Bowing arms -->
        <ellipse cx="80" cy="116" rx="42" ry="16" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <text x="34" y="142" font-family="sans-serif" font-weight="900" font-size="13" fill="#ef4444">GOMEN! 🙇</text>
      </g>
    `
  }),
  'anime_yes': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="70" cy="75" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M52 70 Q58 64 64 70" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="84" cy="70" r="4.5" fill="#431407"/>
        <path d="M60 84 Q70 94 80 84" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="#ef4444"/>
        <!-- Giant Thumbs Up Hand -->
        <circle cx="118" cy="85" r="22" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <rect x="110" y="50" width="16" height="28" rx="8" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <polygon points="135,45 138,52 145,54 139,58 141,65 135,61 129,65 131,58 125,54 132,52" fill="#facc15"/>
        <text x="30" y="140" font-family="sans-serif" font-weight="900" font-size="16" fill="#16a34a">YES! 👍</text>
      </g>
    `
  }),
  'anime_no': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="70" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <line x1="56" y1="62" x2="70" y2="70" stroke="#431407" stroke-width="4" stroke-linecap="round"/>
        <line x1="104" y1="62" x2="90" y2="70" stroke="#431407" stroke-width="4" stroke-linecap="round"/>
        <rect x="70" y="82" width="20" height="8" rx="2" fill="#ffffff" stroke="#431407" stroke-width="2"/>
        <!-- Crossed Arms Big X -->
        <line x1="45" y1="90" x2="115" y2="135" stroke="#dc2626" stroke-width="10" stroke-linecap="round"/>
        <line x1="115" y1="90" x2="45" y2="135" stroke="#dc2626" stroke-width="10" stroke-linecap="round"/>
        <text x="44" y="152" font-family="sans-serif" font-weight="900" font-size="14" fill="#dc2626">DAME! ❌</text>
      </g>
    `
  }),
  'anime_good': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="70" cy="76" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <polygon points="56,66 59,71 65,72 61,76 62,81 56,78 51,81 52,76 47,72 53,71" fill="#facc15"/>
        <circle cx="84" cy="72" r="4" fill="#431407"/>
        <path d="M60 86 Q70 94 80 86" stroke="#431407" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- V peace sign hand -->
        <circle cx="118" cy="90" r="16" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <rect x="108" y="58" width="8" height="24" rx="4" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <rect x="120" y="58" width="8" height="24" rx="4" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <text x="32" y="142" font-family="sans-serif" font-weight="900" font-size="14" fill="#f59e0b">NICE! ✨</text>
      </g>
    `
  }),
  'anime_bad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Forehead dread shadow -->
        <path d="M38 60 Q80 40 122 60 L122 45 Q80 30 38 45 Z" fill="#312e81" opacity="0.6"/>
        <line x1="56" y1="44" x2="56" y2="68" stroke="#312e81" stroke-width="2"/>
        <line x1="68" y1="40" x2="68" y2="70" stroke="#312e81" stroke-width="2"/>
        <line x1="80" y1="38" x2="80" y2="72" stroke="#312e81" stroke-width="2"/>
        <line x1="92" y1="40" x2="92" y2="70" stroke="#312e81" stroke-width="2"/>
        <line x1="104" y1="44" x2="104" y2="68" stroke="#312e81" stroke-width="2"/>
        <circle cx="62" cy="78" r="6" fill="#1e1b4b"/>
        <circle cx="98" cy="78" r="6" fill="#1e1b4b"/>
        <path d="M68 98 Q80 88 92 98" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="44" y="140" font-family="sans-serif" font-weight="900" font-size="13" fill="#6366f1">AWFUL... 👎</text>
      </g>
    `
  }),
  'anime_greeting': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="70" cy="76" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="56" cy="72" r="4.5" fill="#431407"/>
        <circle cx="84" cy="72" r="4.5" fill="#431407"/>
        <path d="M62 86 Q70 96 78 86 Z" fill="#ef4444" stroke="#431407" stroke-width="2"/>
        <circle cx="48" cy="80" r="4" fill="#fb7185"/>
        <circle cx="92" cy="80" r="4" fill="#fb7185"/>
        <!-- Waving hand -->
        <circle cx="120" cy="70" r="14" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <rect x="112" y="48" width="6" height="16" rx="3" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
        <rect x="120" y="45" width="6" height="18" rx="3" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
        <rect x="128" y="48" width="6" height="16" rx="3" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
        <path d="M136 50 Q144 60 136 72" stroke="#ea580c" stroke-width="2" fill="none"/>
        <text x="24" y="142" font-family="sans-serif" font-weight="900" font-size="12" fill="#ea580c">KONNICHIWA! 👋</text>
      </g>
    `
  }),
  'anime_celebration': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="68,44 80,12 92,44" fill="#f43f5e" stroke="#be123c" stroke-width="2"/>
        <circle cx="80" cy="12" r="4" fill="#facc15"/>
        <circle cx="80" cy="82" r="44" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M58 74 L68 80 L58 86" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M102 74 L92 80 L102 86" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M68 94 Q80 114 92 94 Z" fill="#e11d48" stroke="#431407" stroke-width="2.5"/>
        <!-- Confetti -->
        <rect x="30" y="30" width="8" height="4" rx="1" fill="#38bdf8" transform="rotate(20 30 30)"/>
        <rect x="125" y="35" width="8" height="4" rx="1" fill="#4ade80" transform="rotate(-30 125 35)"/>
        <rect x="130" y="70" width="8" height="4" rx="1" fill="#facc15" transform="rotate(45 130 70)"/>
        <rect x="25" y="75" width="8" height="4" rx="1" fill="#c084fc" transform="rotate(-15 25 75)"/>
        <text x="35" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#ec4899">YAY! 🎉</text>
      </g>
    `
  })
};

// ----------------------------------------------------
// 3. REAL CAT EMOTION SVGS
// ----------------------------------------------------
export const CAT_EMOTION_SVGS = {
  'cat_happy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="42,62 38,36 58,52" fill="#fbcfe8"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="118,62 122,36 102,52" fill="#fbcfe8"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <path d="M54 82 Q62 76 70 82" stroke="#7c2d12" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M90 82 Q98 76 106 82" stroke="#7c2d12" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <polygon points="80,92 76,88 84,88" fill="#f43f5e"/>
        <path d="M72 96 Q80 102 88 96" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="50" cy="90" r="5" fill="#f43f5e" opacity="0.5"/>
        <circle cx="110" cy="90" r="5" fill="#f43f5e" opacity="0.5"/>
        <line x1="48" y1="92" x2="24" y2="88" stroke="#7c2d12" stroke-width="2"/>
        <line x1="48" y1="98" x2="24" y2="100" stroke="#7c2d12" stroke-width="2"/>
        <line x1="112" y1="92" x2="136" y2="88" stroke="#7c2d12" stroke-width="2"/>
        <line x1="112" y1="98" x2="136" y2="100" stroke="#7c2d12" stroke-width="2"/>
        <text x="60" y="36" font-family="sans-serif" font-weight="900" font-size="14" fill="#ea580c">PURR~ ✨</text>
      </g>
    `
  }),
  'cat_smile': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <circle cx="62" cy="84" r="5" fill="#7c2d12"/>
        <circle cx="98" cy="84" r="5" fill="#7c2d12"/>
        <circle cx="60" cy="82" r="2" fill="#ffffff"/>
        <circle cx="96" cy="82" r="2" fill="#ffffff"/>
        <polygon points="80,92 76,88 84,88" fill="#f43f5e"/>
        <path d="M74 94 Q80 98 86 94" stroke="#7c2d12" stroke-width="2" fill="none"/>
        <line x1="48" y1="94" x2="26" y2="92" stroke="#7c2d12" stroke-width="2"/>
        <line x1="112" y1="94" x2="134" y2="92" stroke="#7c2d12" stroke-width="2"/>
      </g>
    `
  }),
  'cat_laugh': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <path d="M54 80 L64 85 L54 90" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M106 80 L96 85 L106 90" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M70 96 Q80 110 90 96 Z" fill="#dc2626" stroke="#7c2d12" stroke-width="2"/>
        <circle cx="44" cy="74" r="3" fill="#38bdf8"/>
        <circle cx="116" cy="74" r="3" fill="#38bdf8"/>
        <text x="64" y="38" font-family="sans-serif" font-weight="900" font-size="14" fill="#ea580c">HAHA! 😹</text>
      </g>
    `
  }),
  'cat_sad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="44,70 30,36 60,56" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
        <polygon points="116,70 130,36 100,56" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <ellipse cx="62" cy="84" rx="7" ry="10" fill="#18181b"/>
        <circle cx="60" cy="80" r="3" fill="#ffffff"/>
        <ellipse cx="98" cy="84" rx="7" ry="10" fill="#18181b"/>
        <circle cx="96" cy="80" r="3" fill="#ffffff"/>
        <polygon points="80,94 76,90 84,90" fill="#f43f5e"/>
        <path d="M74 102 Q80 96 86 102" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M60 98 Q58 104 56 108" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
      </g>
    `
  }),
  'cat_cry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M54 82 Q62 76 70 82" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M90 82 Q98 76 106 82" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="80" cy="100" rx="8" ry="10" fill="#431407"/>
        <path d="M58 86 L54 135 Q58 140 62 135 L62 86 Z" fill="#38bdf8" opacity="0.8"/>
        <path d="M102 86 L98 135 Q102 140 106 135 L106 86 Z" fill="#38bdf8" opacity="0.8"/>
        <text x="64" y="36" font-family="sans-serif" font-weight="900" font-size="14" fill="#0284c7">SOB... 😿</text>
      </g>
    `
  }),
  'cat_angry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="42,70 30,30 64,54" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="118,70 130,30 96,54" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#f87171" stroke="#b91c1c" stroke-width="3"/>
        <line x1="52" y1="78" x2="68" y2="84" stroke="#450a0a" stroke-width="4" stroke-linecap="round"/>
        <line x1="108" y1="78" x2="92" y2="84" stroke="#450a0a" stroke-width="4" stroke-linecap="round"/>
        <polygon points="76,96 80,104 84,96" fill="#ffffff" stroke="#450a0a" stroke-width="2"/>
        <polygon points="80,90 76,86 84,86" fill="#dc2626"/>
        <path d="M72 96 Q80 102 88 96" stroke="#450a0a" stroke-width="2.5" fill="none"/>
        <text x="60" y="36" font-family="sans-serif" font-weight="900" font-size="14" fill="#dc2626">HISS! 😾</text>
      </g>
    `
  }),
  'cat_bored': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="95" rx="55" ry="30" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="35,82 25,60 50,78" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <polygon points="125,82 135,60 110,78" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <line x1="55" y1="92" x2="70" y2="92" stroke="#7c2d12" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="90" y1="92" x2="105" y2="92" stroke="#7c2d12" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="80" cy="104" rx="10" ry="12" fill="#78350f"/>
        <text x="110" y="45" font-family="sans-serif" font-weight="900" font-size="14" fill="#c2410c">YAWN~</text>
      </g>
    `
  }),
  'cat_love': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#fbcfe8" stroke="#db2777" stroke-width="3"/>
        <path d="M62 76 C58 70 52 74 52 80 C52 86 62 92 62 92 C62 92 72 86 72 80 C72 74 66 70 62 76 Z" fill="#e11d48"/>
        <path d="M98 76 C94 70 88 74 88 80 C88 86 98 92 98 92 C98 92 108 86 108 80 C108 74 102 70 98 76 Z" fill="#e11d48"/>
        <polygon points="80,94 77,90 83,90" fill="#f43f5e"/>
        <path d="M74 98 Q80 102 86 98" stroke="#be185d" stroke-width="2.5" fill="none"/>
        <text x="64" y="36" font-family="sans-serif" font-weight="900" font-size="14" fill="#e11d48">LOVE 😻</text>
      </g>
    `
  }),
  'cat_shock': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,64 30,22 62,48" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,64 130,22 98,48" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="62" cy="82" r="12" fill="#18181b"/>
        <circle cx="58" cy="78" r="4" fill="#ffffff"/>
        <circle cx="98" cy="82" r="12" fill="#18181b"/>
        <circle cx="94" cy="78" r="4" fill="#ffffff"/>
        <ellipse cx="80" cy="104" rx="8" ry="12" fill="#18181b"/>
        <text x="66" y="34" font-family="sans-serif" font-weight="900" font-size="16" fill="#ea580c">OMG! 🙀</text>
      </g>
    `
  }),
  'cat_confused': () => generateSvg({
    elements: `
      <g filter="url(#shadow)" transform="rotate(-15 80 88)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <circle cx="62" cy="84" r="5" fill="#451a03"/>
        <circle cx="98" cy="84" r="8" fill="#451a03"/>
        <circle cx="95" cy="81" r="2.5" fill="#ffffff"/>
        <polygon points="80,94 77,90 83,90" fill="#f43f5e"/>
        <path d="M74 98 Q80 94 86 98" stroke="#451a03" stroke-width="2" fill="none"/>
      </g>
      <text x="120" y="44" font-family="sans-serif" font-weight="900" font-size="24" fill="#8b5cf6">?</text>
    `
  }),
  'cat_sleepy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="92" rx="48" ry="38" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <polygon points="44,68 36,44 60,60" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <polygon points="116,68 124,44 100,60" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <path d="M58 88 Q66 94 74 88" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M86 88 Q94 94 102 88" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M80 96 Q80 100 84 98" stroke="#7c2d12" stroke-width="2" fill="none"/>
        <text x="110" y="42" font-family="sans-serif" font-weight="900" font-size="18" fill="#6366f1">Zzz</text>
      </g>
    `
  }),
  'cat_excited': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,64 34,20 64,48" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,64 126,20 96,48" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <polygon points="62,72 65,77 71,78 66,82 68,88 62,85 56,88 58,82 53,78 59,77" fill="#facc15"/>
        <polygon points="98,72 101,77 107,78 102,82 104,88 98,85 92,88 94,82 89,78 95,77" fill="#facc15"/>
        <path d="M68 94 Q80 108 92 94 Z" fill="#ef4444" stroke="#7c2d12" stroke-width="2"/>
        <text x="56" y="32" font-family="sans-serif" font-weight="900" font-size="14" fill="#ea580c">POUNCE! ✨</text>
      </g>
    `
  }),
  'cat_scared': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="36,66 22,24 58,48" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="124,66 138,24 102,48" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#e0e7ff" stroke="#4338ca" stroke-width="3"/>
        <circle cx="62" cy="82" r="8" fill="#1e1b4b"/>
        <circle cx="62" cy="82" r="3" fill="#ffffff"/>
        <circle cx="98" cy="82" r="8" fill="#1e1b4b"/>
        <circle cx="98" cy="82" r="3" fill="#ffffff"/>
        <path d="M72 102 Q80 94 88 102" stroke="#1e1b4b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="64" y="36" font-family="sans-serif" font-weight="900" font-size="14" fill="#4338ca">EEK! 🙀</text>
      </g>
    `
  }),
  'cat_thankyou': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,64 34,24 64,50" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,64 126,24 96,50" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="74" rx="42" ry="36" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <path d="M60 70 Q66 64 72 70" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M88 70 Q94 64 100 70" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="70" cy="116" rx="9" ry="14" fill="#ffffff" stroke="#c2410c" stroke-width="2"/>
        <ellipse cx="90" cy="116" rx="9" ry="14" fill="#ffffff" stroke="#c2410c" stroke-width="2"/>
        <text x="36" y="145" font-family="sans-serif" font-weight="900" font-size="12" fill="#c2410c">THANK YOU! 🐾</text>
      </g>
    `
  }),
  'cat_sorry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="44,72 32,48 58,62" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
        <polygon points="116,72 128,48 102,62" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
        <ellipse cx="80" cy="80" rx="42" ry="36" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="62" cy="76" r="10" fill="#18181b"/>
        <circle cx="59" cy="72" r="3.5" fill="#ffffff"/>
        <circle cx="98" cy="76" r="10" fill="#18181b"/>
        <circle cx="95" cy="72" r="3.5" fill="#ffffff"/>
        <path d="M74 94 Q80 88 86 94" stroke="#7c2d12" stroke-width="2" fill="none"/>
        <text x="46" y="135" font-family="sans-serif" font-weight="900" font-size="13" fill="#ea580c">SORRY... 🥺</text>
      </g>
    `
  }),
  'cat_yes': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="70" cy="84" rx="40" ry="36" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <path d="M54 78 Q60 72 66 78" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="86" cy="78" r="4" fill="#7c2d12"/>
        <circle cx="120" cy="86" r="18" fill="#ffffff" stroke="#c2410c" stroke-width="2.5"/>
        <ellipse cx="120" cy="84" rx="6" ry="7" fill="#f472b6"/>
        <circle cx="112" cy="74" r="2.5" fill="#f472b6"/>
        <circle cx="120" cy="72" r="2.5" fill="#f472b6"/>
        <circle cx="128" cy="74" r="2.5" fill="#f472b6"/>
        <text x="34" y="142" font-family="sans-serif" font-weight="900" font-size="14" fill="#16a34a">YES! 🐾👍</text>
      </g>
    `
  }),
  'cat_no': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="78" rx="42" ry="36" fill="#f87171" stroke="#b91c1c" stroke-width="3"/>
        <line x1="56" y1="72" x2="68" y2="78" stroke="#450a0a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="104" y1="72" x2="92" y2="78" stroke="#450a0a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="72" y1="92" x2="88" y2="92" stroke="#450a0a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="114" cy="116" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
        <line x1="104" y1="106" x2="124" y2="126" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
        <line x1="124" y1="106" x2="104" y2="126" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
        <text x="40" y="144" font-family="sans-serif" font-weight="900" font-size="14" fill="#dc2626">NOPE! 😾</text>
      </g>
    `
  }),
  'cat_good': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="80" rx="42" ry="36" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M58 74 Q64 68 70 74" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="94" cy="74" r="4.5" fill="#7c2d12"/>
        <path d="M72 88 Q80 96 88 88" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <text x="24" y="140" font-family="sans-serif" font-weight="900" font-size="14" fill="#f59e0b">PURRFECT! 👌</text>
      </g>
    `
  }),
  'cat_bad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="44,70 30,36 60,56" fill="#71717a" stroke="#3f3f46" stroke-width="2.5"/>
        <polygon points="116,70 130,36 100,56" fill="#71717a" stroke="#3f3f46" stroke-width="2.5"/>
        <ellipse cx="80" cy="84" rx="44" ry="38" fill="#e4e4e7" stroke="#52525b" stroke-width="3"/>
        <line x1="56" y1="74" x2="68" y2="80" stroke="#18181b" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="104" y1="74" x2="92" y2="80" stroke="#18181b" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M70 98 Q80 90 90 98" stroke="#18181b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <text x="44" y="142" font-family="sans-serif" font-weight="900" font-size="14" fill="#dc2626">GRUMPY 👎</text>
      </g>
    `
  }),
  'cat_greeting': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="70" cy="80" rx="40" ry="36" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <circle cx="56" cy="74" r="4.5" fill="#451a03"/>
        <circle cx="84" cy="74" r="4.5" fill="#451a03"/>
        <path d="M62 86 Q70 94 78 86" stroke="#451a03" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Waving paw -->
        <ellipse cx="118" cy="65" rx="10" ry="16" fill="#ffffff" stroke="#c2410c" stroke-width="2"/>
        <ellipse cx="118" cy="62" rx="4" ry="5" fill="#f472b6"/>
        <text x="32" y="142" font-family="sans-serif" font-weight="900" font-size="14" fill="#ea580c">MEOW! 👋</text>
      </g>
    `
  }),
  'cat_celebration': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="70,44 80,12 90,44" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="80" cy="12" r="4" fill="#ef4444"/>
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="80" cy="84" rx="44" ry="38" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <path d="M56 76 L66 82 L56 88" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M104 76 L94 82 L104 88" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M70 94 Q80 108 90 94 Z" fill="#ef4444" stroke="#7c2d12" stroke-width="2"/>
        <circle cx="30" cy="35" r="3" fill="#38bdf8"/>
        <circle cx="128" cy="40" r="3" fill="#ec4899"/>
        <text x="36" y="145" font-family="sans-serif" font-weight="900" font-size="13" fill="#ec4899">PAW-TY! 🎉</text>
      </g>
    `
  })
};

// ----------------------------------------------------
// 4. MEME / REACTION SVGS
// ----------------------------------------------------
export const MEME_EMOTION_SVGS = {
  'meme_happy': () => generateSvg({
    defs: `<linearGradient id="m_happy" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#facc15"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_happy)" stroke="#ca8a04" stroke-width="3"/>
        <ellipse cx="62" cy="70" rx="8" ry="12" fill="#713f12"/>
        <ellipse cx="98" cy="70" rx="8" ry="12" fill="#713f12"/>
        <path d="M52 86 Q80 120 108 86 Z" fill="#ffffff" stroke="#713f12" stroke-width="3"/>
        <line x1="52" y1="88" x2="108" y2="88" stroke="#713f12" stroke-width="2"/>
        <text x="34" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#a16207">SUCH JOY! 😄</text>
      </g>
    `
  }),
  'meme_smile': () => generateSvg({
    defs: `<linearGradient id="m_smile" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#eab308"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_smile)" stroke="#a16207" stroke-width="3"/>
        <circle cx="62" cy="72" r="5" fill="#713f12"/>
        <circle cx="98" cy="72" r="5" fill="#713f12"/>
        <path d="M64 88 Q80 104 96 88" stroke="#713f12" stroke-width="4" stroke-linecap="round" fill="none"/>
        <circle cx="50" cy="82" r="5" fill="#f43f5e" opacity="0.6"/>
        <circle cx="110" cy="82" r="5" fill="#f43f5e" opacity="0.6"/>
      </g>
    `
  }),
  'meme_laugh': () => generateSvg({
    defs: `<linearGradient id="m_laugh" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_laugh)" stroke="#b45309" stroke-width="3"/>
        <path d="M52 68 L64 74 L52 80" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M108 68 L96 74 L108 80" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M60 84 Q80 116 100 84 Z" fill="#991b1b" stroke="#78350f" stroke-width="3"/>
        <ellipse cx="80" cy="102" rx="10" ry="6" fill="#f87171"/>
        <path d="M42 66 Q36 60 40 54 Q46 60 42 66 Z" fill="#38bdf8"/>
        <path d="M118 66 Q124 60 120 54 Q114 60 118 66 Z" fill="#38bdf8"/>
        <text x="44" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#b45309">ROFL! 🤣</text>
      </g>
    `
  }),
  'meme_sad': () => generateSvg({
    defs: `<linearGradient id="m_sad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_sad)" stroke="#1d4ed8" stroke-width="3"/>
        <path d="M52 76 Q62 68 72 74" stroke="#1e293b" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M88 74 Q98 68 108 76" stroke="#1e293b" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M66 98 Q80 84 94 98" stroke="#1e293b" stroke-width="4" stroke-linecap="round" fill="none"/>
        <circle cx="62" cy="82" r="3.5" fill="#38bdf8"/>
        <text x="36" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#1e40af">DEPRESSO 😢</text>
      </g>
    `
  }),
  'meme_angry': () => generateSvg({
    defs: `<linearGradient id="m_angry" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f87171"/><stop offset="100%" stop-color="#dc2626"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_angry)" stroke="#991b1b" stroke-width="3"/>
        <line x1="50" y1="64" x2="72" y2="76" stroke="#450a0a" stroke-width="5" stroke-linecap="round"/>
        <line x1="110" y1="64" x2="88" y2="76" stroke="#450a0a" stroke-width="5" stroke-linecap="round"/>
        <rect x="62" y="88" width="36" height="14" rx="4" fill="#ffffff" stroke="#450a0a" stroke-width="2.5"/>
        <line x1="74" y1="88" x2="74" y2="102" stroke="#450a0a" stroke-width="2"/>
        <line x1="86" y1="88" x2="86" y2="102" stroke="#450a0a" stroke-width="2"/>
        <path d="M30 45 Q20 30 25 20 Q35 30 35 45" fill="#f97316"/>
        <path d="M130 45 Q140 30 135 20 Q125 30 125 45" fill="#f97316"/>
        <text x="44" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#991b1b">RAGE! 😡</text>
      </g>
    `
  }),
  'meme_bored': () => generateSvg({
    defs: `<linearGradient id="m_bored" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_bored)" stroke="#475569" stroke-width="3"/>
        <line x1="52" y1="70" x2="72" y2="70" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        <line x1="88" y1="70" x2="108" y2="70" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="62" cy="74" r="3" fill="#1e293b"/>
        <circle cx="98" cy="74" r="3" fill="#1e293b"/>
        <line x1="68" y1="94" x2="92" y2="94" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
        <text x="40" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#475569">BORED 🥱</text>
      </g>
    `
  }),
  'meme_love': () => generateSvg({
    defs: `<linearGradient id="m_love" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#e11d48"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_love)" stroke="#9f1239" stroke-width="3"/>
        <path d="M62 66 C56 58 48 64 48 72 C48 80 62 88 62 88 C62 88 76 80 76 72 C76 64 68 58 62 66 Z" fill="#ffffff"/>
        <path d="M98 66 C92 58 84 64 84 72 C84 80 98 88 98 88 C98 88 112 80 112 72 C112 64 104 58 98 66 Z" fill="#ffffff"/>
        <path d="M66 96 Q80 108 94 96" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <text x="40" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#be123c">SIMP! 😍</text>
      </g>
    `
  }),
  'meme_confused': () => generateSvg({
    defs: `<linearGradient id="m_confused" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#fdba74"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_confused)" stroke="#ea580c" stroke-width="3"/>
        <circle cx="62" cy="74" r="7" fill="#431407"/>
        <ellipse cx="98" cy="70" rx="5" ry="8" fill="#431407"/>
        <path d="M68 94 Q76 88 84 94 Q92 100 96 94" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="24" y="44" font-family="sans-serif" font-weight="bold" font-size="10" fill="#7c3aed">√x² + y²</text>
        <text x="110" y="44" font-family="sans-serif" font-weight="900" font-size="18" fill="#7c3aed">???</text>
        <text x="22" y="148" font-family="sans-serif" font-weight="900" font-size="12" fill="#ea580c">MATH CONFUSION</text>
      </g>
    `
  }),
  'meme_sleepy': () => generateSvg({
    defs: `<linearGradient id="m_sleep" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c7d2fe"/><stop offset="100%" stop-color="#818cf8"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_sleep)" stroke="#4338ca" stroke-width="3"/>
        <path d="M54 76 Q62 82 70 76" stroke="#1e1b4b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M90 76 Q98 82 106 76" stroke="#1e1b4b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <line x1="72" y1="94" x2="88" y2="94" stroke="#1e1b4b" stroke-width="3" stroke-linecap="round"/>
        <text x="110" y="42" font-family="sans-serif" font-weight="900" font-size="22" fill="#4338ca">ZZZ</text>
        <text x="40" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#3730a3">KNOCKED OUT</text>
      </g>
    `
  }),
  'meme_excited': () => generateSvg({
    defs: `<linearGradient id="m_hype" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_hype)" stroke="#b45309" stroke-width="3"/>
        <circle cx="62" cy="68" r="10" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="62" cy="68" r="4" fill="#78350f"/>
        <circle cx="98" cy="68" r="10" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="98" cy="68" r="4" fill="#78350f"/>
        <ellipse cx="80" cy="96" rx="16" ry="18" fill="#451a03"/>
        <ellipse cx="80" cy="106" rx="10" ry="6" fill="#f87171"/>
        <text x="26" y="148" font-family="sans-serif" font-weight="900" font-size="13" fill="#b45309">LET'S GOOOO! 🤩</text>
      </g>
    `
  }),
  'meme_scared': () => generateSvg({
    defs: `<linearGradient id="m_scared" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient>`,
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="url(#m_scared)" stroke="#1d4ed8" stroke-width="3"/>
        <circle cx="62" cy="70" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <circle cx="62" cy="70" r="2.5" fill="#0f172a"/>
        <circle cx="98" cy="70" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <circle cx="98" cy="70" r="2.5" fill="#0f172a"/>
        <path d="M64 96 Q72 88 80 96 Q88 104 96 96" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M112 50 Q116 65 110 70" stroke="#0284c7" stroke-width="3" fill="none"/>
        <text x="44" y="148" font-family="sans-serif" font-weight="900" font-size="14" fill="#1e40af">PANIC! 😨</text>
      </g>
    `
  }),
  'meme_thankyou': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="72" r="42" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M60 66 Q66 60 72 66" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M88 66 Q94 60 100 66" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M68 82 Q80 92 92 82" stroke="#431407" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="30" y="106" width="100" height="24" rx="6" fill="#15803d" stroke="#166534" stroke-width="2"/>
        <text x="36" y="122" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff">SALUTE & THANKS 🙏</text>
      </g>
    `
  }),
  'meme_sorry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="76" r="42" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="62" cy="72" r="9" fill="#18181b"/>
        <circle cx="60" cy="68" r="3" fill="#ffffff"/>
        <circle cx="98" cy="72" r="9" fill="#18181b"/>
        <circle cx="96" cy="68" r="3" fill="#ffffff"/>
        <path d="M72 90 Q80 84 88 90" stroke="#431407" stroke-width="2.5" fill="none"/>
        <rect x="38" y="112" width="84" height="22" rx="6" fill="#ef4444"/>
        <text x="44" y="127" font-family="sans-serif" font-weight="900" font-size="12" fill="#ffffff">MY BAD! 🥺</text>
      </g>
    `
  }),
  'meme_yes': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="74" r="42" fill="#bbf7d0" stroke="#15803d" stroke-width="3"/>
        <circle cx="62" cy="70" r="4.5" fill="#14532d"/>
        <circle cx="98" cy="70" r="4.5" fill="#14532d"/>
        <path d="M68 84 Q80 96 92 84" stroke="#14532d" stroke-width="3" fill="none"/>
        <circle cx="118" cy="50" r="16" fill="#22c55e" stroke="#ffffff" stroke-width="2.5"/>
        <path d="M110 50 L115 55 L126 44" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <rect x="45" y="110" width="70" height="24" rx="6" fill="#16a34a"/>
        <text x="56" y="126" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff">BASED 👍</text>
      </g>
    `
  }),
  'meme_no': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="74" r="42" fill="#fecaca" stroke="#b91c1c" stroke-width="3"/>
        <line x1="54" y1="64" x2="68" y2="72" stroke="#450a0a" stroke-width="4" stroke-linecap="round"/>
        <line x1="106" y1="64" x2="92" y2="72" stroke="#450a0a" stroke-width="4" stroke-linecap="round"/>
        <line x1="68" y1="88" x2="92" y2="88" stroke="#450a0a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="118" cy="50" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="110" y1="42" x2="126" y2="58" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="126" y1="42" x2="110" y2="58" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        <rect x="42" y="110" width="76" height="24" rx="6" fill="#dc2626"/>
        <text x="52" y="126" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff">NOPE ❌</text>
      </g>
    `
  }),
  'meme_good': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="70" cy="75" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="56" cy="70" r="4" fill="#431407"/>
        <circle cx="84" cy="70" r="4" fill="#431407"/>
        <path d="M60 84 Q70 94 80 84" stroke="#431407" stroke-width="2.5" fill="none"/>
        <rect x="94" y="60" width="46" height="26" rx="6" fill="#e11d48"/>
        <text x="100" y="78" font-family="sans-serif" font-weight="900" font-size="15" fill="#ffffff">100</text>
        <line x1="100" y1="82" x2="134" y2="82" stroke="#ffffff" stroke-width="2"/>
        <text x="24" y="140" font-family="sans-serif" font-weight="900" font-size="13" fill="#ea580c">CHEF'S KISS 👌</text>
      </g>
    `
  }),
  'meme_bad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="75" r="42" fill="#71717a" stroke="#3f3f46" stroke-width="3"/>
        <line x1="56" y1="68" x2="68" y2="74" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="104" y1="68" x2="92" y2="74" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M70 92 Q80 84 90 92" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <rect x="36" y="110" width="88" height="24" rx="6" fill="#27272a"/>
        <text x="46" y="126" font-family="sans-serif" font-weight="900" font-size="12" fill="#f87171">TRASH 👎</text>
      </g>
    `
  }),
  'meme_greeting': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="70" cy="76" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="56" cy="72" r="4.5" fill="#431407"/>
        <circle cx="84" cy="72" r="4.5" fill="#431407"/>
        <path d="M62 86 Q70 96 78 86" stroke="#431407" stroke-width="2.5" fill="none"/>
        <!-- Hand wave -->
        <circle cx="118" cy="65" r="15" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <text x="32" y="142" font-family="sans-serif" font-weight="900" font-size="13" fill="#ea580c">HAYYY! 👋</text>
      </g>
    `
  }),
  'meme_celebration': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="44" fill="#fde047" stroke="#ca8a04" stroke-width="3"/>
        <path d="M58 72 L68 78 L58 84" stroke="#713f12" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M102 72 L92 78 L102 84" stroke="#713f12" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M68 92 Q80 112 92 92 Z" fill="#dc2626" stroke="#713f12" stroke-width="2"/>
        <!-- Champagne bottle -->
        <rect x="110" y="20" width="16" height="40" rx="4" fill="#15803d" transform="rotate(35 110 20)"/>
        <circle cx="125" cy="18" r="4" fill="#fbbf24"/>
        <circle cx="135" cy="10" r="3" fill="#fbbf24"/>
        <circle cx="110" cy="8" r="2.5" fill="#fbbf24"/>
        <text x="36" y="146" font-family="sans-serif" font-weight="900" font-size="14" fill="#ca8a04">VICTORY! 🍾</text>
      </g>
    `
  })
};

// ----------------------------------------------------
// 5. GAMING (GAME BOY) EMOTION SVGS
// ----------------------------------------------------
export const GAME_EMOTION_SVGS = {
  'game_happy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#10b981" stroke="#047857" stroke-width="4"/>
        <rect x="52" y="56" width="12" height="12" fill="#ffffff"/>
        <rect x="96" y="56" width="12" height="12" fill="#ffffff"/>
        <rect x="60" y="88" width="40" height="10" fill="#ffffff"/>
        <rect x="52" y="80" width="10" height="10" fill="#ffffff"/>
        <rect x="98" y="80" width="10" height="10" fill="#ffffff"/>
        <text x="44" y="142" font-family="monospace" font-weight="900" font-size="13" fill="#047857">WINNER! 🌟</text>
      </g>
    `
  }),
  'game_smile': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="90" rx="46" ry="34" fill="#4ade80" stroke="#15803d" stroke-width="3"/>
        <circle cx="64" cy="84" r="5" fill="#14532d"/>
        <circle cx="96" cy="84" r="5" fill="#14532d"/>
        <path d="M72 96 Q80 102 88 96" stroke="#14532d" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="54" cy="90" r="4" fill="#f472b6"/>
        <circle cx="106" cy="90" r="4" fill="#f472b6"/>
        <text x="44" y="144" font-family="monospace" font-weight="900" font-size="12" fill="#15803d">SLIME SMILE</text>
      </g>
    `
  }),
  'game_laugh': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#8b5cf6" stroke="#6d28d9" stroke-width="4"/>
        <rect x="52" y="56" width="14" height="6" fill="#ffffff"/>
        <rect x="94" y="56" width="14" height="6" fill="#ffffff"/>
        <rect x="58" y="78" width="44" height="20" fill="#ffffff"/>
        <rect x="64" y="82" width="10" height="8" fill="#000000"/>
        <rect x="78" y="82" width="10" height="8" fill="#000000"/>
        <text x="38" y="144" font-family="monospace" font-weight="900" font-size="14" fill="#6d28d9">HA HA HA! 👾</text>
      </g>
    `
  }),
  'game_sad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Pixel Broken Heart -->
        <g transform="translate(42, 38) scale(1.4)">
          <path d="M12 4 L20 4 L28 12 L28 24 L14 36 L12 36 L2 24 L2 12 L10 4 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>
          <polyline points="14,4 12,14 18,20 14,34" stroke="#ffffff" stroke-width="2" fill="none"/>
        </g>
        <text x="44" y="142" font-family="monospace" font-weight="900" font-size="13" fill="#991b1b">HP: 0 (SAD)</text>
      </g>
    `
  }),
  'game_cry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4"/>
        <rect x="52" y="60" width="14" height="6" fill="#ffffff"/>
        <rect x="94" y="60" width="14" height="6" fill="#ffffff"/>
        <!-- Pixel waterfall tears -->
        <rect x="54" y="70" width="10" height="40" fill="#93c5fd"/>
        <rect x="96" y="70" width="10" height="40" fill="#93c5fd"/>
        <rect x="68" y="86" width="24" height="6" fill="#ffffff"/>
        <text x="44" y="144" font-family="monospace" font-weight="900" font-size="12" fill="#1d4ed8">GAME FAIL 😭</text>
      </g>
    `
  }),
  'game_angry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#ef4444" stroke="#b91c1c" stroke-width="4"/>
        <polygon points="48,54 68,64 68,54" fill="#ffffff"/>
        <polygon points="112,54 92,64 92,54" fill="#ffffff"/>
        <rect x="58" y="82" width="44" height="14" fill="#ffffff"/>
        <text x="36" y="144" font-family="monospace" font-weight="900" font-size="13" fill="#b91c1c">RAGE QUIT! 💥</text>
      </g>
    `
  }),
  'game_bored': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#64748b" stroke="#334155" stroke-width="4"/>
        <rect x="54" y="66" width="16" height="4" fill="#ffffff"/>
        <rect x="90" y="66" width="16" height="4" fill="#ffffff"/>
        <rect x="68" y="88" width="24" height="4" fill="#ffffff"/>
        <text x="110" y="36" font-family="monospace" font-weight="900" font-size="14" fill="#94a3b8">zzz</text>
        <text x="48" y="144" font-family="monospace" font-weight="900" font-size="14" fill="#334155">STATUS: AFK</text>
      </g>
    `
  }),
  'game_love': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#ec4899" stroke="#be185d" stroke-width="4"/>
        <!-- 8 bit heart inside -->
        <path d="M64 56 L72 56 L80 64 L88 56 L96 56 L104 64 L104 74 L80 98 L56 74 L56 64 Z" fill="#ffffff"/>
        <text x="50" y="144" font-family="monospace" font-weight="900" font-size="14" fill="#be185d">+1 LIFE 💖</text>
      </g>
    `
  }),
  'game_shock': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#f59e0b" stroke="#b45309" stroke-width="4"/>
        <!-- Giant pixel exclamation -->
        <rect x="72" y="48" width="16" height="34" fill="#ffffff"/>
        <rect x="72" y="90" width="16" height="16" fill="#ffffff"/>
        <text x="42" y="144" font-family="monospace" font-weight="900" font-size="14" fill="#b45309">ALERT! ❗</text>
      </g>
    `
  }),
  'game_confused': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#eab308" stroke="#a16207" stroke-width="4"/>
        <!-- Pixel Question Mark Box -->
        <path d="M66 50 L94 50 L94 66 L82 72 L82 82 L74 82 L74 68 L86 64 L86 58 L66 58 Z" fill="#ffffff"/>
        <rect x="74" y="88" width="10" height="10" fill="#ffffff"/>
        <text x="46" y="144" font-family="monospace" font-weight="900" font-size="14" fill="#a16207">WHAT? [?]</text>
      </g>
    `
  }),
  'game_sleepy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="44" width="88" height="60" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
        <rect x="124" y="64" width="8" height="20" rx="2" fill="#0f172a"/>
        <rect x="44" y="52" width="16" height="44" fill="#ef4444"/>
        <text x="42" y="132" font-family="monospace" font-weight="900" font-size="11" fill="#ef4444">LOW BATTERY</text>
        <text x="48" y="148" font-family="monospace" font-weight="900" font-size="12" fill="#64748b">SLEEP MODE 😴</text>
      </g>
    `
  }),
  'game_excited': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#f97316" stroke="#c2410c" stroke-width="4"/>
        <polygon points="80,48 88,68 110,68 92,80 98,102 80,88 62,102 68,80 50,68 72,68" fill="#facc15"/>
        <text x="36" y="144" font-family="monospace" font-weight="900" font-size="12" fill="#c2410c">COMBO x99! ⚡</text>
      </g>
    `
  }),
  'game_scared': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Retro Arcade Blue Ghost -->
        <path d="M48 96 L48 64 Q48 40 80 40 Q112 40 112 64 L112 96 L100 88 L88 96 L80 88 L72 96 L60 88 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
        <rect x="60" y="60" width="8" height="8" fill="#ffffff"/>
        <rect x="62" y="62" width="4" height="4" fill="#0369a1"/>
        <rect x="88" y="60" width="8" height="8" fill="#ffffff"/>
        <rect x="90" y="62" width="4" height="4" fill="#0369a1"/>
        <polyline points="58,80 66,74 74,80 82,74 90,80 98,74 104,80" stroke="#0369a1" stroke-width="2" fill="none"/>
        <text x="44" y="144" font-family="monospace" font-weight="900" font-size="12" fill="#0284c7">GHOST RUN! 👻</text>
      </g>
    `
  }),
  'game_thankyou': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="25" y="48" width="110" height="54" rx="8" fill="#eab308" stroke="#a16207" stroke-width="3"/>
        <text x="35" y="74" font-family="monospace" font-weight="900" font-size="18" fill="#713f12">GG WP!</text>
        <text x="35" y="92" font-family="monospace" font-weight="900" font-size="12" fill="#713f12">THANKS! 🙏</text>
        <polygon points="120,40 124,46 130,48 125,52 126,58 120,55 114,58 115,52 110,48 116,46" fill="#facc15"/>
      </g>
    `
  }),
  'game_sorry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#475569" stroke="#1e293b" stroke-width="4"/>
        <text x="44" y="74" font-family="monospace" font-weight="900" font-size="16" fill="#f87171">MISS!</text>
        <text x="44" y="96" font-family="monospace" font-weight="900" font-size="13" fill="#cbd5e1">SORRY 🥺</text>
        <text x="44" y="144" font-family="monospace" font-weight="900" font-size="12" fill="#1e293b">RESPAWN...</text>
      </g>
    `
  }),
  'game_yes': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Green Arcade Button -->
        <circle cx="80" cy="74" r="42" fill="#22c55e" stroke="#15803d" stroke-width="4"/>
        <circle cx="80" cy="74" r="34" fill="#16a34a"/>
        <path d="M66 74 L76 84 L94 64" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="42" y="142" font-family="monospace" font-weight="900" font-size="14" fill="#15803d">READY / YES</text>
      </g>
    `
  }),
  'game_no': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="36" width="88" height="88" rx="8" fill="#dc2626" stroke="#991b1b" stroke-width="4"/>
        <line x1="52" y1="52" x2="108" y2="108" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <line x1="108" y1="52" x2="52" y2="108" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <text x="36" y="144" font-family="monospace" font-weight="900" font-size="13" fill="#991b1b">DENIED / NO ❌</text>
      </g>
    `
  }),
  'game_good': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="80,30 115,50 115,95 80,115 45,95 45,50" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
        <text x="68" y="82" font-family="sans-serif" font-weight="900" font-size="34" fill="#78350f">S</text>
        <text x="40" y="144" font-family="monospace" font-weight="900" font-size="13" fill="#ca8a04">RANK: S (GOOD)</text>
      </g>
    `
  }),
  'game_bad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="80,30 115,50 115,95 80,115 45,95 45,50" fill="#64748b" stroke="#334155" stroke-width="4"/>
        <text x="68" y="82" font-family="sans-serif" font-weight="900" font-size="34" fill="#0f172a">F</text>
        <text x="42" y="144" font-family="monospace" font-weight="900" font-size="13" fill="#334155">RANK: F (BAD)</text>
      </g>
    `
  }),
  'game_greeting': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="25" y="44" width="110" height="60" rx="8" fill="#6366f1" stroke="#4338ca" stroke-width="3"/>
        <text x="34" y="70" font-family="monospace" font-weight="900" font-size="14" fill="#ffffff">PLAYER 1</text>
        <text x="34" y="90" font-family="monospace" font-weight="900" font-size="13" fill="#a5b4fc">READY! 👋</text>
        <text x="44" y="142" font-family="monospace" font-weight="900" font-size="12" fill="#4338ca">HELLO GAMER</text>
      </g>
    `
  }),
  'game_celebration': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Trophy -->
        <path d="M56 46 L104 46 L98 84 Q80 100 62 84 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
        <path d="M56 52 C42 52 42 70 58 74" fill="none" stroke="#ca8a04" stroke-width="3.5"/>
        <path d="M104 52 C118 52 118 70 102 74" fill="none" stroke="#ca8a04" stroke-width="3.5"/>
        <rect x="74" y="94" width="12" height="16" fill="#ca8a04"/>
        <rect x="62" y="110" width="36" height="12" rx="2" fill="#78350f"/>
        <text x="36" y="144" font-family="monospace" font-weight="900" font-size="13" fill="#ca8a04">VICTORY! 🏆</text>
      </g>
    `
  })
};

// ----------------------------------------------------
// 6. HEART BUDDY EMOTION SVGS
// ----------------------------------------------------
export const HEART_EMOTION_SVGS = {
  'heart_happy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
        <path d="M60 66 Q66 60 72 66" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M88 66 Q94 60 100 66" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M68 78 Q80 90 92 78 Z" fill="#ffffff"/>
        <polygon points="120,30 123,37 130,39 124,44 126,51 120,47 114,51 116,44 110,39 117,37" fill="#facc15"/>
      </g>
    `
  }),
  'heart_smile': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#fb7185" stroke="#e11d48" stroke-width="3"/>
        <circle cx="64" cy="68" r="4.5" fill="#881337"/>
        <circle cx="96" cy="68" r="4.5" fill="#881337"/>
        <path d="M72 80 Q80 86 88 80" stroke="#881337" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="54" cy="74" r="4" fill="#ffffff" opacity="0.6"/>
        <circle cx="106" cy="74" r="4" fill="#ffffff" opacity="0.6"/>
      </g>
    `
  }),
  'heart_laugh': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
        <path d="M56 64 L66 70 L56 76" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M104 64 L94 70 L104 76" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M68 80 Q80 96 92 80 Z" fill="#ffffff"/>
        <circle cx="44" cy="64" r="3" fill="#38bdf8"/>
        <circle cx="116" cy="64" r="3" fill="#38bdf8"/>
      </g>
    `
  }),
  'heart_sad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#c084fc" stroke="#7e22ce" stroke-width="3"/>
        <path d="M58 70 Q66 64 74 68" stroke="#3b0764" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M86 68 Q94 64 102 70" stroke="#3b0764" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M72 88 Q80 80 88 88" stroke="#3b0764" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </g>
    `
  }),
  'heart_cry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#a5b4fc" stroke="#4338ca" stroke-width="3"/>
        <circle cx="64" cy="68" r="4" fill="#1e1b4b"/>
        <circle cx="96" cy="68" r="4" fill="#1e1b4b"/>
        <path d="M74 86 Q80 80 86 86" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M60 74 L56 110" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
        <path d="M100 74 L104 110" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      </g>
    `
  }),
  'heart_angry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#ef4444" stroke="#991b1b" stroke-width="3"/>
        <line x1="56" y1="62" x2="70" y2="70" stroke="#450a0a" stroke-width="4" stroke-linecap="round"/>
        <line x1="104" y1="62" x2="90" y2="70" stroke="#450a0a" stroke-width="4" stroke-linecap="round"/>
        <rect x="70" y="82" width="20" height="8" rx="2" fill="#ffffff" stroke="#450a0a" stroke-width="2"/>
        <text x="110" y="42" font-family="sans-serif" font-weight="900" font-size="16" fill="#dc2626">💢</text>
      </g>
    `
  }),
  'heart_bored': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#cbd5e1" stroke="#475569" stroke-width="3"/>
        <line x1="58" y1="70" x2="72" y2="70" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="88" y1="70" x2="102" y2="70" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="72" y1="84" x2="88" y2="84" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `
  }),
  'heart_shock': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
        <circle cx="64" cy="68" r="8" fill="#ffffff" stroke="#713f12" stroke-width="2"/>
        <circle cx="64" cy="68" r="3" fill="#713f12"/>
        <circle cx="96" cy="68" r="8" fill="#ffffff" stroke="#713f12" stroke-width="2"/>
        <circle cx="96" cy="68" r="3" fill="#713f12"/>
        <ellipse cx="80" cy="88" rx="6" ry="10" fill="#713f12"/>
      </g>
    `
  }),
  'heart_confused': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#fbcfe8" stroke="#be185d" stroke-width="3"/>
        <circle cx="64" cy="70" r="4" fill="#831843"/>
        <circle cx="96" cy="68" r="6" fill="#831843"/>
        <path d="M74 84 Q80 80 86 84" stroke="#831843" stroke-width="2.5" fill="none"/>
        <text x="110" y="44" font-family="sans-serif" font-weight="900" font-size="22" fill="#be185d">?</text>
      </g>
    `
  }),
  'heart_sleepy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#e0e7ff" stroke="#4338ca" stroke-width="3"/>
        <path d="M60 70 Q66 76 72 70" stroke="#312e81" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M88 70 Q94 76 100 70" stroke="#312e81" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="110" y="38" font-family="sans-serif" font-weight="900" font-size="18" fill="#6366f1">Zzz</text>
      </g>
    `
  }),
  'heart_excited': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
        <polygon points="64,60 66,65 72,66 67,70 69,75 64,72 59,75 61,70 56,66 62,65" fill="#facc15"/>
        <polygon points="96,60 98,65 104,66 99,70 101,75 96,72 91,75 93,70 88,66 94,65" fill="#facc15"/>
        <path d="M70 82 Q80 94 90 82 Z" fill="#ffffff"/>
      </g>
    `
  }),
  'heart_scared': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="3"/>
        <circle cx="64" cy="68" r="6" fill="#0c4a6e"/>
        <circle cx="96" cy="68" r="6" fill="#0c4a6e"/>
        <path d="M72 86 Q80 80 88 86" stroke="#0c4a6e" stroke-width="2.5" fill="none"/>
        <path d="M40 70 L46 76 M38 84 L44 90" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
      </g>
    `
  }),
  'heart_thankyou': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
        <circle cx="64" cy="66" r="4" fill="#ffffff"/>
        <circle cx="96" cy="66" r="4" fill="#ffffff"/>
        <path d="M72 76 Q80 82 88 76" stroke="#ffffff" stroke-width="2" fill="none"/>
        <rect x="42" y="88" width="76" height="22" rx="6" fill="#ffffff" stroke="#be123c" stroke-width="1.5"/>
        <text x="48" y="103" font-family="sans-serif" font-weight="900" font-size="10" fill="#e11d48">THANK YOU 🙏</text>
      </g>
    `
  }),
  'heart_sorry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#fda4af" stroke="#e11d48" stroke-width="3"/>
        <circle cx="64" cy="68" r="8" fill="#18181b"/>
        <circle cx="62" cy="65" r="2.5" fill="#ffffff"/>
        <circle cx="96" cy="68" r="8" fill="#18181b"/>
        <circle cx="94" cy="65" r="2.5" fill="#ffffff"/>
        <path d="M74 84 Q80 80 86 84" stroke="#881337" stroke-width="2" fill="none"/>
        <text x="48" y="142" font-family="sans-serif" font-weight="900" font-size="12" fill="#be123c">SORRY 🥺</text>
      </g>
    `
  }),
  'heart_yes': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="3"/>
        <circle cx="64" cy="68" r="4" fill="#14532d"/>
        <circle cx="96" cy="68" r="4" fill="#14532d"/>
        <path d="M72 78 Q80 86 88 78" stroke="#14532d" stroke-width="2.5" fill="none"/>
        <circle cx="116" cy="46" r="16" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
        <path d="M109 46 L114 51 L123 41" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="56" y="142" font-family="sans-serif" font-weight="900" font-size="14" fill="#16a34a">YES! 💖</text>
      </g>
    `
  }),
  'heart_no': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#fecaca" stroke="#dc2626" stroke-width="3"/>
        <line x1="56" y1="64" x2="68" y2="70" stroke="#450a0a" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="104" y1="64" x2="92" y2="70" stroke="#450a0a" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="116" cy="46" r="16" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
        <line x1="109" y1="39" x2="123" y2="53" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="123" y1="39" x2="109" y2="53" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <text x="56" y="142" font-family="sans-serif" font-weight="900" font-size="14" fill="#dc2626">NOPE 💔</text>
      </g>
    `
  }),
  'heart_good': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="64" cy="68" r="4" fill="#7c2d12"/>
        <circle cx="96" cy="68" r="4" fill="#7c2d12"/>
        <path d="M72 78 Q80 86 88 78" stroke="#7c2d12" stroke-width="2.5" fill="none"/>
        <text x="44" y="142" font-family="sans-serif" font-weight="900" font-size="13" fill="#ea580c">PERFECT 👌</text>
      </g>
    `
  }),
  'heart_bad': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#94a3b8" stroke="#475569" stroke-width="3"/>
        <line x1="58" y1="66" x2="70" y2="72" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
        <line x1="102" y1="66" x2="90" y2="72" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
        <path d="M72 86 Q80 80 88 86" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <text x="54" y="142" font-family="sans-serif" font-weight="900" font-size="13" fill="#475569">BAD 👎</text>
      </g>
    `
  }),
  'heart_greeting': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#f43f5e" stroke="#be123c" stroke-width="3"/>
        <circle cx="64" cy="68" r="4" fill="#ffffff"/>
        <circle cx="96" cy="68" r="4" fill="#ffffff"/>
        <path d="M72 78 Q80 86 88 78" stroke="#ffffff" stroke-width="2" fill="none"/>
        <circle cx="118" cy="46" r="14" fill="#ffffff" stroke="#be123c" stroke-width="2"/>
        <text x="44" y="142" font-family="sans-serif" font-weight="900" font-size="13" fill="#be123c">HELLO! 👋</text>
      </g>
    `
  }),
  'heart_celebration': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="72,35 80,10 88,35" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="80" cy="10" r="3" fill="#ef4444"/>
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#ec4899" stroke="#be185d" stroke-width="3"/>
        <circle cx="64" cy="68" r="4" fill="#ffffff"/>
        <circle cx="96" cy="68" r="4" fill="#ffffff"/>
        <path d="M70 80 Q80 94 90 80 Z" fill="#ffffff"/>
        <circle cx="34" cy="40" r="2.5" fill="#38bdf8"/>
        <circle cx="126" cy="45" r="2.5" fill="#facc15"/>
        <text x="36" y="142" font-family="sans-serif" font-weight="900" font-size="13" fill="#be185d">CELEBRATE! 🎉</text>
      </g>
    `
  })
};

// Combine all emotion SVGs
export const ALL_EMOTION_SVGS = {
  ...COFFEE_EMOTION_SVGS,
  ...ANIME_EMOTION_SVGS,
  ...CAT_EMOTION_SVGS,
  ...MEME_EMOTION_SVGS,
  ...GAME_EMOTION_SVGS,
  ...HEART_EMOTION_SVGS
};
