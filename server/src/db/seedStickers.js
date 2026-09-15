import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run, persistDb } from './database.js';
import { ALL_EMOTION_SVGS } from './emotionStickerSvgs.js';
import { ALL_CATEGORY_EMOTION_SVGS, make22Stickers } from './categoryEmotionSvgs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STICKERS_DIR = path.resolve(__dirname, '../../uploads/stickers');

// Ensure stickers upload folder exists
if (!fs.existsSync(STICKERS_DIR)) {
  fs.mkdirSync(STICKERS_DIR, { recursive: true });
}

/**
 * Helper to write SVG file if not exists
 */
function ensureSvg(filename, svgContent) {
  const filePath = path.join(STICKERS_DIR, filename);
  fs.writeFileSync(filePath, svgContent.trim(), 'utf8');
  return `/uploads/stickers/${filename}`;
}

// ----------------------------------------------------
// SVG GENERATOR TEMPLATES
// ----------------------------------------------------

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

// SVG Builders for each sticker type
const STICKER_SVGS = {
  ...ALL_EMOTION_SVGS,
  ...ALL_CATEGORY_EMOTION_SVGS,
  // --- CUTE COFFEE CUPS ---
  'coffee_happy': () => generateSvg({
    defs: `
      <linearGradient id="happyCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Steam -->
        <path d="M65 32 Q60 22 68 14" stroke="#d97706" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7"/>
        <path d="M80 30 Q75 18 85 10" stroke="#d97706" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>
        <path d="M95 32 Q90 22 98 14" stroke="#d97706" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.7"/>
        <!-- Handle -->
        <path d="M105 55 C128 55 128 95 105 95" fill="none" stroke="#b45309" stroke-width="9" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="38" width="68" height="74" rx="14" fill="url(#happyCupGrad)" stroke="#b45309" stroke-width="3"/>
        <!-- Coffee Top Rim -->
        <ellipse cx="76" cy="40" rx="34" ry="10" fill="#78350f" stroke="#b45309" stroke-width="3"/>
        <ellipse cx="76" cy="40" rx="28" ry="6" fill="#451a03"/>
        <!-- Cheeks -->
        <circle cx="56" cy="80" r="5" fill="#f43f5e" opacity="0.5"/>
        <circle cx="96" cy="80" r="5" fill="#f43f5e" opacity="0.5"/>
        <!-- Happy Eyes -->
        <path d="M56 70 Q62 64 68 70" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M84 70 Q90 64 96 70" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Big Smile -->
        <path d="M68 82 Q76 92 84 82" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="#f43f5e"/>
        <!-- Sparkles -->
        <polygon points="125,30 128,38 136,41 128,44 125,52 122,44 114,41 122,38" fill="#fbbf24"/>
      </g>
    `
  }),
  'coffee_sad': () => generateSvg({
    defs: `
      <linearGradient id="sadCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="100%" stop-color="#60a5fa"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Drooping steam -->
        <path d="M72 32 Q66 22 62 26" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6"/>
        <path d="M84 32 Q88 22 82 26" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6"/>
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#sadCupGrad)" stroke="#2563eb" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#1e3a8a"/>
        <ellipse cx="76" cy="44" rx="28" ry="6" fill="#172554"/>
        <!-- Sad Slanted Eyes -->
        <path d="M54 74 Q62 68 70 72" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M82 72 Q90 68 98 74" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Drooping Frown -->
        <path d="M68 92 Q76 84 84 92" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Teardrop on cheek -->
        <path d="M60 82 C57 82 56 85 58 88 C60 90 63 90 64 88 C66 85 63 82 60 82 Z" fill="#38bdf8"/>
      </g>
    `
  }),
  'coffee_angry': () => generateSvg({
    defs: `
      <linearGradient id="angryCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Angry Fire Steam -->
        <path d="M70 30 Q65 14 74 10 Q80 18 78 30" fill="#f97316"/>
        <path d="M85 32 Q92 15 88 12 Q82 20 84 32" fill="#eab308"/>
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#991b1b" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#angryCupGrad)" stroke="#991b1b" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#450a0a"/>
        <!-- Slanted Angry Eyes -->
        <line x1="52" y1="68" x2="68" y2="76" stroke="#450a0a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="100" y1="68" x2="84" y2="76" stroke="#450a0a" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Gritted Teeth -->
        <rect x="64" y="86" width="24" height="11" rx="3" fill="#ffffff" stroke="#450a0a" stroke-width="2"/>
        <line x1="72" y1="86" x2="72" y2="97" stroke="#450a0a" stroke-width="1.5"/>
        <line x1="80" y1="86" x2="80" y2="97" stroke="#450a0a" stroke-width="1.5"/>
        <!-- Anger Vein Symbol 💢 -->
        <g transform="translate(108, 30) scale(0.6)">
          <path d="M10 0 L10 20 M0 10 L20 10 M5 2 L18 15 M18 2 L5 15" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
        </g>
      </g>
    `
  }),
  'coffee_sleepy': () => generateSvg({
    defs: `
      <linearGradient id="sleepyCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a5b4fc"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#4338ca" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#sleepyCupGrad)" stroke="#4338ca" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#312e81"/>
        <!-- Closed Peaceful Curved Sleep Eyes -->
        <path d="M54 74 Q62 80 70 74" stroke="#1e1b4b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M82 74 Q90 80 98 74" stroke="#1e1b4b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Soft Smile -->
        <path d="M72 88 Q76 92 80 88" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Pink sleeping cheeks -->
        <circle cx="52" cy="80" r="4" fill="#f43f5e" opacity="0.4"/>
        <circle cx="100" cy="80" r="4" fill="#f43f5e" opacity="0.4"/>
        <!-- Floating Zzz -->
        <text x="110" y="38" font-family="sans-serif" font-weight="900" font-size="20" fill="#6366f1">Z</text>
        <text x="124" y="24" font-family="sans-serif" font-weight="900" font-size="14" fill="#818cf8">z</text>
        <text x="134" y="14" font-family="sans-serif" font-weight="900" font-size="10" fill="#a5b4fc">z</text>
      </g>
    `
  }),
  'coffee_excited': () => generateSvg({
    defs: `
      <linearGradient id="excitedCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Energetic Steam -->
        <path d="M68 28 Q64 16 70 8" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M84 28 Q88 16 82 8" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Handle -->
        <path d="M105 55 C128 55 128 95 105 95" fill="none" stroke="#b45309" stroke-width="9" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="38" width="68" height="74" rx="14" fill="url(#excitedCupGrad)" stroke="#b45309" stroke-width="3"/>
        <ellipse cx="76" cy="40" rx="34" ry="10" fill="#78350f" stroke="#b45309" stroke-width="2"/>
        <!-- Star Eyes -->
        <polygon points="62,64 64,69 69,70 65,74 66,79 62,76 58,79 59,74 55,70 60,69" fill="#f43f5e"/>
        <polygon points="90,64 92,69 97,70 93,74 94,79 90,76 86,79 87,74 83,70 88,69" fill="#f43f5e"/>
        <!-- Huge Open Laughing Smile -->
        <path d="M64 82 Q76 102 88 82 Z" fill="#b91c1c" stroke="#78350f" stroke-width="2.5"/>
        <ellipse cx="76" cy="94" rx="6" ry="3" fill="#f87171"/>
        <!-- Sparkling stars around -->
        <polygon points="30,42 32,46 36,47 33,50 34,54 30,52 26,54 27,50 24,47 28,46" fill="#facc15"/>
        <polygon points="128,32 130,36 134,37 131,40 132,44 128,42 124,44 125,40 122,37 126,36" fill="#facc15"/>
      </g>
    `
  }),
  'coffee_love': () => generateSvg({
    defs: `
      <linearGradient id="loveCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f472b6"/>
        <stop offset="100%" stop-color="#ec4899"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#be185d" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#loveCupGrad)" stroke="#be185d" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#78350f"/>
        <ellipse cx="76" cy="44" rx="28" ry="6" fill="#fdf2f8"/>
        <!-- Latte Art Heart on Top -->
        <path d="M76 46 C76 46 70 41 68 43 C66 45 68 48 76 52 C84 48 86 45 84 43 C82 41 76 46 76 46 Z" fill="#ec4899"/>
        <!-- Heart Eyes -->
        <path d="M62 68 C58 64 54 67 54 71 C54 76 62 80 62 80 C62 80 70 76 70 71 C70 67 66 64 62 68 Z" fill="#e11d48"/>
        <path d="M90 68 C86 64 82 67 82 71 C82 76 90 80 90 80 C90 80 98 76 98 71 C98 67 94 64 90 68 Z" fill="#e11d48"/>
        <!-- Sweet Smile -->
        <path d="M72 88 Q76 94 80 88" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="52" cy="82" r="4" fill="#fbcfe8"/>
        <circle cx="100" cy="82" r="4" fill="#fbcfe8"/>
        <!-- Floating Hearts -->
        <path d="M80 18 C70 5 95 5 80 25 C65 5 90 5 80 18 Z" fill="#f43f5e" transform="translate(10, -5) scale(0.6)"/>
        <path d="M80 18 C70 5 95 5 80 25 C65 5 90 5 80 18 Z" fill="#ec4899" transform="translate(-30, 0) scale(0.45)"/>
      </g>
    `
  }),
  'coffee_laughing': () => generateSvg({
    defs: `
      <linearGradient id="laughCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Steam -->
        <path d="M74 30 Q70 18 78 12" stroke="#eab308" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M86 28 Q90 16 84 10" stroke="#eab308" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Handle -->
        <path d="M105 55 C128 55 128 95 105 95" fill="none" stroke="#a16207" stroke-width="9" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="38" width="68" height="74" rx="14" fill="url(#laughCupGrad)" stroke="#a16207" stroke-width="3"/>
        <ellipse cx="76" cy="40" rx="34" ry="10" fill="#78350f" stroke="#a16207" stroke-width="2"/>
        <!-- Squeezed Laughing Eyes > < -->
        <path d="M54 68 L64 74 L54 80" stroke="#713f12" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M98 68 L88 74 L98 80" stroke="#713f12" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Tears of laughter shooting out -->
        <path d="M46 72 Q36 70 38 64 Q44 66 46 72 Z" fill="#38bdf8"/>
        <path d="M106 72 Q116 70 114 64 Q108 66 106 72 Z" fill="#38bdf8"/>
        <!-- Wide Open Guffaw Mouth -->
        <path d="M64 84 Q76 104 88 84 Z" fill="#881337" stroke="#713f12" stroke-width="2.5"/>
        <ellipse cx="76" cy="96" rx="6" ry="3" fill="#f43f5e"/>
      </g>
    `
  }),
  'coffee_bored': () => generateSvg({
    defs: `
      <linearGradient id="boredCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Tiny flat steam -->
        <path d="M76 34 L76 26" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#boredCupGrad)" stroke="#475569" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#334155"/>
        <!-- Unimpressed half-lidded eyes glancing left -->
        <ellipse cx="62" cy="74" rx="8" ry="6" fill="#ffffff"/>
        <circle cx="59" cy="74" r="3.5" fill="#1e293b"/>
        <line x1="54" y1="70" x2="70" y2="70" stroke="#1e293b" stroke-width="2.5"/>
        <ellipse cx="90" cy="74" rx="8" ry="6" fill="#ffffff"/>
        <circle cx="87" cy="74" r="3.5" fill="#1e293b"/>
        <line x1="82" y1="70" x2="98" y2="70" stroke="#1e293b" stroke-width="2.5"/>
        <!-- Flat straight mouth -->
        <line x1="68" y1="90" x2="84" y2="90" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <!-- Speech dots "..." -->
        <circle cx="118" cy="44" r="2.5" fill="#64748b"/>
        <circle cx="125" cy="44" r="2.5" fill="#64748b"/>
        <circle cx="132" cy="44" r="2.5" fill="#64748b"/>
      </g>
    `
  }),
  'coffee_shocked': () => generateSvg({
    defs: `
      <linearGradient id="shockCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6ee7b7"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Splashing droplets -->
        <circle cx="60" cy="22" r="3.5" fill="#047857"/>
        <circle cx="92" cy="20" r="4" fill="#047857"/>
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#047857" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#shockCupGrad)" stroke="#047857" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#064e3b"/>
        <!-- Giant Shocked Round Eyes -->
        <circle cx="62" cy="72" r="10" fill="#ffffff" stroke="#064e3b" stroke-width="2.5"/>
        <circle cx="62" cy="72" r="3" fill="#000000"/>
        <circle cx="90" cy="72" r="10" fill="#ffffff" stroke="#064e3b" stroke-width="2.5"/>
        <circle cx="90" cy="72" r="3" fill="#000000"/>
        <!-- Dropped Oval Mouth "O" -->
        <ellipse cx="76" cy="94" rx="8" ry="12" fill="#064e3b"/>
        <!-- Sweat Drop -->
        <path d="M116 54 C116 54 110 62 116 67 C122 67 124 62 116 54 Z" fill="#38bdf8"/>
        <!-- Exclamation Marks !! -->
        <text x="120" y="36" font-family="sans-serif" font-weight="900" font-size="20" fill="#ef4444">!!</text>
      </g>
    `
  }),
  'coffee_crying': () => generateSvg({
    defs: `
      <linearGradient id="cryCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#cryCupGrad)" stroke="#1d4ed8" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#1e3a8a"/>
        <!-- Crying Eyes Tightly Shut -->
        <path d="M54 70 L66 74" stroke="#172554" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M98 70 L86 74" stroke="#172554" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Trembling Mouth -->
        <path d="M68 94 Q72 90 76 94 Q80 90 84 94" stroke="#172554" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Waterfall Streams of Tears -->
        <path d="M58 74 L54 120" stroke="#60a5fa" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M94 74 L98 120" stroke="#60a5fa" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Tear puddles -->
        <ellipse cx="52" cy="120" rx="10" ry="4" fill="#60a5fa" opacity="0.8"/>
        <ellipse cx="100" cy="120" rx="10" ry="4" fill="#60a5fa" opacity="0.8"/>
      </g>
    `
  }),
  'coffee_goodmorning': () => generateSvg({
    defs: `
      <linearGradient id="morningCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#f97316"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Rising Sun Behind -->
        <circle cx="76" cy="30" r="22" fill="#facc15" stroke="#f59e0b" stroke-width="2"/>
        <line x1="76" y1="4" x2="76" y2="0" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="14" x2="46" y2="10" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <line x1="102" y1="14" x2="106" y2="10" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <!-- Handle -->
        <path d="M105 55 C128 55 128 95 105 95" fill="none" stroke="#c2410c" stroke-width="9" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="38" width="68" height="74" rx="14" fill="url(#morningCupGrad)" stroke="#c2410c" stroke-width="3"/>
        <ellipse cx="76" cy="40" rx="34" ry="10" fill="#78350f" stroke="#c2410c" stroke-width="2"/>
        <!-- Winking Eye (Left Wink, Right Open Sparkle) -->
        <path d="M54 74 Q62 68 70 74" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="90" cy="72" r="4" fill="#431407"/>
        <!-- Cheerful Smile -->
        <path d="M68 84 Q76 94 84 84" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="#ef4444"/>
        <!-- Rosy Cheeks -->
        <circle cx="54" cy="82" r="5" fill="#f43f5e" opacity="0.5"/>
        <circle cx="98" cy="82" r="5" fill="#f43f5e" opacity="0.5"/>
        <!-- "AM" or sunshine badge -->
        <rect x="62" y="98" width="28" height="12" rx="4" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
        <text x="65" y="107" font-family="sans-serif" font-weight="900" font-size="9" fill="#713f12">AM ☀️</text>
      </g>
    `
  }),
  'coffee_goodnight': () => generateSvg({
    defs: `
      <linearGradient id="nightCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Twinkling Stars in Steam -->
        <polygon points="66,16 68,20 72,21 69,24 70,28 66,26 62,28 63,24 60,21 64,20" fill="#facc15"/>
        <polygon points="86,12 87,15 90,16 88,18 89,21 86,19 83,21 84,18 82,16 85,15" fill="#e0e7ff"/>
        <!-- Handle -->
        <path d="M105 58 C126 58 126 92 105 92" fill="none" stroke="#4338ca" stroke-width="8" stroke-linecap="round"/>
        <!-- Mug Body -->
        <rect x="42" y="42" width="68" height="72" rx="14" fill="url(#nightCupGrad)" stroke="#4338ca" stroke-width="3"/>
        <ellipse cx="76" cy="44" rx="34" ry="10" fill="#0f172a"/>
        <!-- Golden Crescent Moon on Mug Face -->
        <path d="M52 68 C52 78 60 84 68 84 C64 84 58 78 58 70 C58 64 62 60 66 58 C58 60 52 64 52 68 Z" fill="#facc15"/>
        <!-- Sleeping Eyes -->
        <path d="M72 74 Q78 80 84 74" stroke="#c7d2fe" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M88 74 Q94 80 100 74" stroke="#c7d2fe" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Peaceful Smile -->
        <path d="M82 86 Q86 90 90 86" stroke="#c7d2fe" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <!-- Soft Nightcap on rim -->
        <path d="M38 46 Q32 30 48 24 Q60 22 56 42 Z" fill="#6366f1" stroke="#4338ca" stroke-width="2"/>
        <circle cx="48" cy="22" r="5" fill="#ffffff"/>
      </g>
    `
  }),

  // --- TEA FRIENDS ---
  'tea_boba_bear': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Cup -->
        <polygon points="50,45 110,45 102,126 58,126" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="80" cy="45" rx="30" ry="8" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
        <!-- Straw -->
        <rect x="75" y="14" width="10" height="40" rx="3" fill="#ec4899" transform="rotate(-8 80 30)"/>
        <!-- Boba Pearls -->
        <circle cx="68" cy="114" r="6" fill="#1f2937"/>
        <circle cx="84" cy="116" r="6.5" fill="#1f2937"/>
        <circle cx="94" cy="112" r="5.5" fill="#1f2937"/>
        <circle cx="76" cy="104" r="6" fill="#1f2937"/>
        <!-- Bear Ears on Dome Lid -->
        <circle cx="56" cy="38" r="8" fill="#b45309"/>
        <circle cx="56" cy="38" r="4" fill="#fef3c7"/>
        <circle cx="104" cy="38" r="8" fill="#b45309"/>
        <circle cx="104" cy="38" r="4" fill="#fef3c7"/>
        <!-- Bear Face on Cup -->
        <circle cx="68" cy="74" r="3.5" fill="#78350f"/>
        <circle cx="92" cy="74" r="3.5" fill="#78350f"/>
        <ellipse cx="80" cy="80" rx="6" ry="4" fill="#fde68a"/>
        <circle cx="80" cy="78" r="2.5" fill="#78350f"/>
        <path d="M78 82 Q80 84 82 82" stroke="#78350f" stroke-width="2" fill="none"/>
        <circle cx="62" cy="78" r="4" fill="#f43f5e" opacity="0.6"/>
        <circle cx="98" cy="78" r="4" fill="#f43f5e" opacity="0.6"/>
      </g>
    `
  }),
  'tea_matcha_cat': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Matcha Bowl -->
        <ellipse cx="80" cy="100" rx="46" ry="18" fill="#84cc16"/>
        <path d="M38 70 C38 115 122 115 122 70 Z" fill="#65a30d" stroke="#3f6212" stroke-width="3"/>
        <ellipse cx="80" cy="70" rx="42" ry="14" fill="#bef264"/>
        <!-- Cat Whiskers on bowl -->
        <line x1="42" y1="88" x2="28" y2="86" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="42" y1="94" x2="28" y2="96" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="118" y1="88" x2="132" y2="86" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="118" y1="94" x2="132" y2="96" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Cat Ears -->
        <polygon points="46,70 54,42 70,64" fill="#84cc16" stroke="#3f6212" stroke-width="2.5"/>
        <polygon points="50,66 56,48 66,62" fill="#fbcfe8"/>
        <polygon points="114,70 106,42 90,64" fill="#84cc16" stroke="#3f6212" stroke-width="2.5"/>
        <polygon points="110,66 104,48 94,62" fill="#fbcfe8"/>
        <!-- Cat Face -->
        <circle cx="68" cy="85" r="3.5" fill="#1e293b"/>
        <circle cx="92" cy="85" r="3.5" fill="#1e293b"/>
        <polygon points="80,90 77,87 83,87" fill="#f43f5e"/>
        <path d="M76 92 Q80 95 84 92" stroke="#1e293b" stroke-width="2" fill="none"/>
        <!-- Zen Sparkle -->
        <circle cx="80" cy="30" r="4" fill="#facc15"/>
      </g>
    `
  }),
  'tea_chai_bunny': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Bunny Ears -->
        <ellipse cx="64" cy="36" rx="8" ry="24" fill="#fde68a" stroke="#d97706" stroke-width="2.5" transform="rotate(-12 64 36)"/>
        <ellipse cx="64" cy="36" rx="4" ry="16" fill="#f472b6" transform="rotate(-12 64 36)"/>
        <ellipse cx="96" cy="36" rx="8" ry="24" fill="#fde68a" stroke="#d97706" stroke-width="2.5" transform="rotate(12 96 36)"/>
        <ellipse cx="96" cy="36" rx="4" ry="16" fill="#f472b6" transform="rotate(12 96 36)"/>
        <!-- Teacup -->
        <rect x="44" y="56" width="72" height="60" rx="16" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
        <ellipse cx="80" cy="56" rx="36" ry="10" fill="#92400e"/>
        <!-- Face -->
        <circle cx="66" cy="82" r="3.5" fill="#451a03"/>
        <circle cx="94" cy="82" r="3.5" fill="#451a03"/>
        <circle cx="80" cy="88" r="3" fill="#f43f5e"/>
        <path d="M76 92 Q80 96 84 92" stroke="#451a03" stroke-width="2" fill="none"/>
        <circle cx="58" cy="88" r="4" fill="#f472b6" opacity="0.6"/>
        <circle cx="102" cy="88" r="4" fill="#f472b6" opacity="0.6"/>
        <!-- Cinnamon stick -->
        <rect x="100" y="40" width="8" height="32" rx="3" fill="#78350f" transform="rotate(25 100 40)"/>
      </g>
    `
  }),
  'tea_honey_lemon': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Glass -->
        <polygon points="46,45 114,45 105,124 55,124" fill="#fef08a" stroke="#eab308" stroke-width="3" opacity="0.95"/>
        <!-- Lemon Slice hanging -->
        <circle cx="48" cy="45" r="18" fill="#facc15" stroke="#ca8a04" stroke-width="2.5"/>
        <circle cx="48" cy="45" r="14" fill="#fef08a"/>
        <path d="M48 31 L48 59 M34 45 L62 45 M38 35 L58 55 M38 55 L58 35" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Honey dipper / drips -->
        <circle cx="88" cy="70" r="4" fill="#ca8a04"/>
        <circle cx="88" cy="82" r="3" fill="#ca8a04"/>
        <!-- Happy Drink Face -->
        <path d="M68 85 Q74 80 80 85" stroke="#713f12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M88 85 Q94 80 100 85" stroke="#713f12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M78 96 Q84 104 90 96" stroke="#713f12" stroke-width="2.5" fill="#f43f5e" stroke-linecap="round"/>
        <!-- Sparkle star -->
        <polygon points="120,55 123,62 130,65 123,68 120,75 117,68 110,65 117,62" fill="#fbbf24"/>
      </g>
    `
  }),

  // --- SWEET BAKERY ---
  'bakery_croissant': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Croissant crescent shape -->
        <path d="M25 90 C30 50 80 40 135 90 C120 75 95 65 80 65 C65 65 40 75 25 90 Z" fill="#d97706" stroke="#92400e" stroke-width="3"/>
        <path d="M45 80 C60 55 100 55 115 80 C100 70 80 70 65 72 C55 74 48 78 45 80 Z" fill="#f59e0b"/>
        <!-- Center belly -->
        <ellipse cx="80" cy="86" rx="26" ry="18" fill="#fbbf24" stroke="#92400e" stroke-width="2.5"/>
        <!-- Face -->
        <circle cx="72" cy="84" r="3" fill="#451a03"/>
        <circle cx="88" cy="84" r="3" fill="#451a03"/>
        <path d="M76 90 Q80 95 84 90" stroke="#451a03" stroke-width="2" fill="none"/>
        <circle cx="66" cy="88" r="3" fill="#f43f5e" opacity="0.6"/>
        <circle cx="94" cy="88" r="3" fill="#f43f5e" opacity="0.6"/>
        <!-- Butter shine -->
        <path d="M72 72 Q80 70 88 72" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
      </g>
    `
  }),
  'bakery_pancake': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Plate -->
        <ellipse cx="80" cy="120" rx="58" ry="12" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <!-- Pancake 3 (bottom) -->
        <ellipse cx="80" cy="106" rx="46" ry="14" fill="#d97706" stroke="#78350f" stroke-width="2"/>
        <!-- Pancake 2 (mid) -->
        <ellipse cx="80" cy="92" rx="44" ry="13" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
        <!-- Pancake 1 (top) -->
        <ellipse cx="80" cy="78" rx="42" ry="13" fill="#fbbf24" stroke="#78350f" stroke-width="2"/>
        <!-- Syrup drip -->
        <path d="M70 78 C70 90 74 95 76 95 C78 95 80 88 85 92 C90 96 92 84 92 78 Z" fill="#b45309"/>
        <!-- Butter Cube -->
        <polygon points="74,58 86,58 92,66 80,66" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <polygon points="74,58 80,66 80,74 74,66" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
        <polygon points="80,66 92,66 92,74 80,74" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Face on top pancake -->
        <circle cx="68" cy="80" r="2.5" fill="#451a03"/>
        <circle cx="92" cy="80" r="2.5" fill="#451a03"/>
        <path d="M77 84 Q80 88 83 84" stroke="#451a03" stroke-width="1.5" fill="none"/>
      </g>
    `
  }),
  'bakery_donut': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Donut Base -->
        <circle cx="80" cy="80" r="46" fill="#d97706" stroke="#78350f" stroke-width="3"/>
        <!-- Frosting Pink -->
        <circle cx="80" cy="80" r="42" fill="#f472b6"/>
        <!-- Center Hole -->
        <circle cx="80" cy="80" r="16" fill="#09090b"/>
        <!-- Sprinkles -->
        <rect x="52" y="58" width="8" height="3" rx="1.5" fill="#38bdf8" transform="rotate(20 52 58)"/>
        <rect x="100" y="58" width="8" height="3" rx="1.5" fill="#facc15" transform="rotate(-30 100 58)"/>
        <rect x="50" y="96" width="8" height="3" rx="1.5" fill="#4ade80" transform="rotate(45 50 96)"/>
        <rect x="102" y="96" width="8" height="3" rx="1.5" fill="#ffffff" transform="rotate(-15 102 96)"/>
        <rect x="76" y="44" width="8" height="3" rx="1.5" fill="#a855f7"/>
        <!-- Wink Face -->
        <path d="M62 76 Q67 72 72 76" stroke="#831843" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="92" cy="74" r="3.5" fill="#831843"/>
        <path d="M78 88 Q82 93 86 88" stroke="#831843" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <circle cx="58" cy="82" r="4" fill="#fb7185"/>
        <circle cx="98" cy="82" r="4" fill="#fb7185"/>
      </g>
    `
  }),
  'bakery_cinnamon': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Cinnamon Roll Bun -->
        <ellipse cx="80" cy="82" rx="46" ry="38" fill="#d97706" stroke="#78350f" stroke-width="3"/>
        <!-- Swirl -->
        <path d="M80 62 C105 62 115 82 105 98 C95 110 65 110 55 95 C45 80 55 60 78 52 C95 48 118 60 120 85" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- White Glaze Icing -->
        <path d="M60 65 Q80 50 100 65 Q90 85 70 80 Z" fill="#ffffff" opacity="0.85"/>
        <!-- Hug arms -->
        <path d="M42 85 C32 80 32 95 44 95" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <path d="M118 85 C128 80 128 95 116 95" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- Face -->
        <circle cx="70" cy="82" r="3" fill="#451a03"/>
        <circle cx="90" cy="82" r="3" fill="#451a03"/>
        <path d="M76 89 Q80 93 84 89" stroke="#451a03" stroke-width="2" fill="none"/>
        <!-- Mini Heart -->
        <path d="M80 30 C76 22 66 25 70 34 C76 40 80 44 80 44 C80 44 84 40 90 34 C94 25 84 22 80 30 Z" fill="#f43f5e"/>
      </g>
    `
  }),

  // --- ANIME EMOTIONS ---
  'anime_cry': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Head -->
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Anime Tears Waterfall -->
        <path d="M58 80 L52 140 Q58 145 64 140 L62 80 Z" fill="#38bdf8" opacity="0.85"/>
        <path d="M98 80 L94 140 Q100 145 106 140 L102 80 Z" fill="#38bdf8" opacity="0.85"/>
        <!-- Closed Crying Eyes -->
        <path d="M52 74 Q60 66 68 74" stroke="#431407" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M92 74 Q100 66 108 74" stroke="#431407" stroke-width="4" stroke-linecap="round" fill="none"/>
        <!-- Open Wailing Mouth -->
        <ellipse cx="80" cy="98" rx="14" ry="18" fill="#991b1b" stroke="#431407" stroke-width="3"/>
        <path d="M72 108 Q80 114 88 108" fill="#f87171"/>
        <!-- Eyebrows in distress -->
        <path d="M54 62 L66 68" stroke="#431407" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 62 L94 68" stroke="#431407" stroke-width="3" stroke-linecap="round"/>
      </g>
    `
  }),
  'anime_blush': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Big Sparkly Eyes -->
        <ellipse cx="62" cy="74" rx="8" ry="12" fill="#1e1b4b"/>
        <circle cx="60" cy="70" r="4" fill="#ffffff"/>
        <circle cx="64" cy="78" r="2" fill="#ffffff"/>
        <ellipse cx="98" cy="74" rx="8" ry="12" fill="#1e1b4b"/>
        <circle cx="96" cy="70" r="4" fill="#ffffff"/>
        <circle cx="100" cy="78" r="2" fill="#ffffff"/>
        <!-- Heavy Blush with diagonal lines -->
        <ellipse cx="56" cy="88" rx="12" ry="7" fill="#f43f5e" opacity="0.6"/>
        <line x1="48" y1="88" x2="54" y2="84" stroke="#be123c" stroke-width="2"/>
        <line x1="54" y1="90" x2="60" y2="86" stroke="#be123c" stroke-width="2"/>
        <ellipse cx="104" cy="88" rx="12" ry="7" fill="#f43f5e" opacity="0.6"/>
        <line x1="96" y1="88" x2="102" y2="84" stroke="#be123c" stroke-width="2"/>
        <line x1="102" y1="90" x2="108" y2="86" stroke="#be123c" stroke-width="2"/>
        <!-- Shy wavy mouth -->
        <path d="M74 92 Q77 88 80 92 Q83 96 86 92" stroke="#431407" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Eyebrows -->
        <path d="M54 62 Q62 58 68 62" stroke="#431407" stroke-width="2.5" fill="none"/>
        <path d="M92 62 Q98 58 106 62" stroke="#431407" stroke-width="2.5" fill="none"/>
      </g>
    `
  }),
  'anime_shock': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
        <!-- Vertical Shadow lines on forehead (anime dread) -->
        <line x1="68" y1="42" x2="68" y2="60" stroke="#3b82f6" stroke-width="2.5"/>
        <line x1="74" y1="40" x2="74" y2="62" stroke="#3b82f6" stroke-width="2.5"/>
        <line x1="80" y1="40" x2="80" y2="62" stroke="#3b82f6" stroke-width="2.5"/>
        <line x1="86" y1="40" x2="86" y2="62" stroke="#3b82f6" stroke-width="2.5"/>
        <line x1="92" y1="42" x2="92" y2="60" stroke="#3b82f6" stroke-width="2.5"/>
        <!-- Blank White Eyes -->
        <circle cx="62" cy="74" r="10" fill="#ffffff" stroke="#1f2937" stroke-width="2.5"/>
        <circle cx="98" cy="74" r="10" fill="#ffffff" stroke="#1f2937" stroke-width="2.5"/>
        <!-- Tiny dots -->
        <circle cx="62" cy="74" r="2.5" fill="#000000"/>
        <circle cx="98" cy="74" r="2.5" fill="#000000"/>
        <!-- Jaw drop mouth -->
        <rect x="72" y="92" width="16" height="26" rx="8" fill="#1e1b4b"/>
        <!-- Sweat droplet -->
        <path d="M116 52 C116 52 110 62 116 68 C122 68 126 62 116 52 Z" fill="#38bdf8"/>
      </g>
    `
  }),
  'anime_fire': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#f87171" stroke="#b91c1c" stroke-width="3"/>
        <!-- Fire Eyes -->
        <path d="M62 76 C55 60 70 58 64 78 Z" fill="#facc15" stroke="#ef4444" stroke-width="2"/>
        <path d="M98 76 C91 60 106 58 100 78 Z" fill="#facc15" stroke="#ef4444" stroke-width="2"/>
        <!-- Sharp Angry Eyebrows -->
        <line x1="50" y1="64" x2="72" y2="74" stroke="#450a0a" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="110" y1="64" x2="88" y2="74" stroke="#450a0a" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Gritting sharp teeth -->
        <path d="M66 94 L94 94 L88 104 L72 104 Z" fill="#ffffff" stroke="#450a0a" stroke-width="2.5"/>
        <line x1="80" y1="94" x2="80" y2="104" stroke="#450a0a" stroke-width="2"/>
        <!-- Fire Aura in background -->
        <path d="M30 65 Q25 45 40 40 Q45 25 65 30" stroke="#f97316" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M130 65 Q135 45 120 40 Q115 25 95 30" stroke="#f97316" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>
    `
  }),
  'anime_sparkle': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Star Eyes -->
        <polygon points="62,60 65,70 75,72 66,77 69,87 62,80 55,87 58,77 49,72 59,70" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <polygon points="98,60 101,70 111,72 102,77 105,87 98,80 91,87 94,77 85,72 95,70" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Open Cheerful Smile -->
        <path d="M68 92 Q80 112 92 92 Z" fill="#e11d48" stroke="#431407" stroke-width="2.5"/>
        <!-- Rosy Cheeks -->
        <circle cx="50" cy="86" r="6" fill="#fb7185"/>
        <circle cx="110" cy="86" r="6" fill="#fb7185"/>
        <!-- Floating Sparkles around head -->
        <polygon points="34,45 36,50 42,51 37,55 39,61 34,57 29,61 31,55 26,51 32,50" fill="#38bdf8"/>
        <polygon points="126,45 128,50 134,51 129,55 131,61 126,57 121,61 123,55 118,51 124,50" fill="#f43f5e"/>
      </g>
    `
  }),
  'anime_sweat': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Awkward forced smile -->
        <circle cx="60" cy="74" r="4" fill="#431407"/>
        <circle cx="100" cy="74" r="4" fill="#431407"/>
        <path d="M68 92 Q80 100 92 92" stroke="#431407" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Giant Anime Sweat Drop on Temple -->
        <path d="M120 40 C110 55 112 68 122 72 C132 68 132 55 120 40 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="2.5"/>
        <circle cx="120" cy="62" r="3" fill="#ffffff" opacity="0.7"/>
        <!-- Slanted worry brows -->
        <path d="M54 66 L66 62" stroke="#431407" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M106 66 L94 62" stroke="#431407" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `
  }),
  'anime_menacing': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Shadowy face -->
        <circle cx="80" cy="80" r="46" fill="#312e81" stroke="#1e1b4b" stroke-width="3"/>
        <!-- Glowing Red Slit Eyes -->
        <path d="M52 74 L70 78" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)"/>
        <path d="M108 74 L90 78" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)"/>
        <!-- Sinister smile -->
        <path d="M66 94 Q80 108 94 94" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Japanese Menacing 'Go Go Go' Kanji / Katakana glyphs -->
        <text x="20" y="45" font-family="sans-serif" font-weight="900" font-size="24" fill="#a855f7">ゴ</text>
        <text x="35" y="30" font-family="sans-serif" font-weight="900" font-size="18" fill="#c084fc">ゴ</text>
        <text x="120" y="45" font-family="sans-serif" font-weight="900" font-size="24" fill="#a855f7">ゴ</text>
        <text x="135" y="30" font-family="sans-serif" font-weight="900" font-size="18" fill="#c084fc">ゴ</text>
      </g>
    `
  }),
  'anime_smirk': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Smug Eyes -->
        <path d="M54 72 Q64 68 70 74" stroke="#431407" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M90 74 Q96 68 106 72" stroke="#431407" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <circle cx="64" cy="74" r="2.5" fill="#431407"/>
        <circle cx="96" cy="74" r="2.5" fill="#431407"/>
        <!-- Diagonal Smirk Mouth -->
        <path d="M72 94 Q88 94 96 84" stroke="#431407" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Raised Eyebrow -->
        <path d="M52 64 L66 60" stroke="#431407" stroke-width="3"/>
        <path d="M92 56 L106 60" stroke="#431407" stroke-width="3"/>
        <!-- Sparkle at corner of smile -->
        <polygon points="102,80 104,85 109,87 104,89 102,94 100,89 95,87 100,85" fill="#fbbf24"/>
      </g>
    `
  }),

  // --- NINJA BUDDIES ---
  'ninja_sneaky': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Hood Head -->
        <circle cx="80" cy="80" r="46" fill="#18181b" stroke="#09090b" stroke-width="3"/>
        <!-- Red Headband -->
        <rect x="36" y="52" width="88" height="14" fill="#dc2626"/>
        <rect x="70" y="54" width="20" height="10" rx="2" fill="#94a3b8"/>
        <!-- Eye Slit Opening -->
        <rect x="46" y="68" width="68" height="24" rx="6" fill="#fed7aa"/>
        <!-- Determined Eyes -->
        <circle cx="62" cy="80" r="4" fill="#09090b"/>
        <circle cx="98" cy="80" r="4" fill="#09090b"/>
        <path d="M54 75 L68 78" stroke="#09090b" stroke-width="2.5"/>
        <path d="M106 75 L92 78" stroke="#09090b" stroke-width="2.5"/>
        <!-- Ribbons fluttering -->
        <path d="M124 58 Q142 50 148 64 Q135 66 124 64" fill="#dc2626"/>
      </g>
    `
  }),
  'ninja_smokebomb': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Smoke Cloud -->
        <circle cx="60" cy="80" r="28" fill="#e4e4e7" stroke="#71717a" stroke-width="2.5"/>
        <circle cx="100" cy="80" r="28" fill="#e4e4e7" stroke="#71717a" stroke-width="2.5"/>
        <circle cx="80" cy="56" r="32" fill="#f4f4f5" stroke="#71717a" stroke-width="2.5"/>
        <circle cx="80" cy="100" r="26" fill="#d4d4d8" stroke="#71717a" stroke-width="2.5"/>
        <!-- Ninja Eyes peeking in smoke -->
        <rect x="62" y="65" width="36" height="14" rx="4" fill="#18181b"/>
        <circle cx="72" cy="72" r="2.5" fill="#fef08a"/>
        <circle cx="88" cy="72" r="2.5" fill="#fef08a"/>
        <!-- Poof sound effect -->
        <text x="56" y="125" font-family="sans-serif" font-weight="900" font-size="18" fill="#7c3aed">POOF!</text>
      </g>
    `
  }),
  'ninja_shuriken': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Spinning Shuriken -->
        <g transform="rotate(45 80 80)">
          <!-- 4 blade star -->
          <polygon points="80,24 88,68 136,80 88,92 80,136 72,92 24,80 72,68" fill="#64748b" stroke="#334155" stroke-width="3"/>
          <polygon points="80,34 85,72 126,80 85,88 80,126 75,88 34,80 75,72" fill="#94a3b8"/>
          <!-- Center hole -->
          <circle cx="80" cy="80" r="8" fill="#0f172a" stroke="#334155" stroke-width="2"/>
        </g>
        <!-- Motion swoosh lines -->
        <path d="M30 40 Q80 15 130 40" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>
        <path d="M130 120 Q80 145 30 120" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>
      </g>
    `
  }),
  'ninja_peace': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Hood -->
        <circle cx="80" cy="80" r="46" fill="#18181b" stroke="#09090b" stroke-width="3"/>
        <rect x="36" y="52" width="88" height="14" fill="#dc2626"/>
        <rect x="46" y="68" width="68" height="24" rx="6" fill="#fed7aa"/>
        <!-- Winking Eyes -->
        <path d="M56 80 Q62 74 68 80" stroke="#09090b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="94" cy="80" r="3.5" fill="#09090b"/>
        <!-- Hand Peace Sign -->
        <circle cx="118" cy="115" r="14" fill="#fed7aa" stroke="#09090b" stroke-width="2.5"/>
        <rect x="108" y="92" width="8" height="22" rx="4" fill="#fed7aa" stroke="#09090b" stroke-width="2"/>
        <rect x="120" y="92" width="8" height="22" rx="4" fill="#fed7aa" stroke="#09090b" stroke-width="2"/>
      </g>
    `
  }),

  // --- CUTE WARRIOR ---
  'warrior_swordpoke': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Helmet Head -->
        <circle cx="70" cy="80" r="40" fill="#94a3b8" stroke="#475569" stroke-width="3"/>
        <rect x="42" y="70" width="56" height="18" rx="4" fill="#1e293b"/>
        <circle cx="56" cy="79" r="3" fill="#facc15"/>
        <circle cx="84" cy="79" r="3" fill="#facc15"/>
        <!-- Plume -->
        <path d="M70 40 Q65 15 80 18 Q75 35 70 40" fill="#ef4444"/>
        <!-- Sword poking forward -->
        <polygon points="90,92 148,82 148,88 90,98" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
        <rect x="86" y="86" width="6" height="18" rx="2" fill="#d97706"/>
        <!-- Poke sparkle -->
        <polygon points="148,85 152,80 157,85 152,90" fill="#facc15"/>
      </g>
    `
  }),
  'warrior_shield': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Warrior behind shield -->
        <circle cx="80" cy="65" r="30" fill="#94a3b8" stroke="#475569" stroke-width="2.5"/>
        <circle cx="72" cy="62" r="3" fill="#facc15"/>
        <circle cx="88" cy="62" r="3" fill="#facc15"/>
        <!-- Big Golden Lion Shield -->
        <path d="M50 70 L110 70 L110 105 Q80 138 50 105 Z" fill="#f59e0b" stroke="#78350f" stroke-width="3.5"/>
        <path d="M56 75 L104 75 L104 102 Q80 130 56 102 Z" fill="#fbbf24"/>
        <!-- Shield Cross / Emblem -->
        <polygon points="80,82 85,92 95,92 87,98 90,108 80,102 70,108 73,98 65,92 75,92" fill="#b91c1c"/>
      </g>
    `
  }),
  'warrior_levelup': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="85" r="36" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <circle cx="68" cy="82" r="3.5" fill="#431407"/>
        <circle cx="92" cy="82" r="3.5" fill="#431407"/>
        <path d="M74 94 Q80 100 86 94" stroke="#431407" stroke-width="2.5" fill="none"/>
        <!-- Horns / Helmet -->
        <path d="M48 65 Q70 48 112 65" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <!-- LEVEL UP Text Banner -->
        <rect x="22" y="24" width="116" height="28" rx="8" fill="#10b981" stroke="#047857" stroke-width="2"/>
        <text x="32" y="44" font-family="sans-serif" font-weight="900" font-size="16" fill="#ffffff">LEVEL UP! 🌟</text>
        <!-- Golden Star Rays -->
        <polygon points="80,5 83,18 96,20 86,28 89,41 80,34 71,41 74,28 64,20 77,18" fill="#facc15" transform="translate(45, 10) scale(0.6)"/>
      </g>
    `
  }),
  'warrior_victory': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Cheerful Face -->
        <path d="M68 76 Q73 70 78 76" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M82 76 Q87 70 92 76" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M72 88 Q80 100 88 88 Z" fill="#ef4444"/>
        <!-- Sword Raised High -->
        <polygon points="120,15 128,60 122,60 114,15" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
        <rect x="110" y="60" width="16" height="6" rx="2" fill="#f59e0b"/>
        <!-- Trophy / Laurel -->
        <text x="32" y="32" font-family="sans-serif" font-weight="900" font-size="20" fill="#facc15">👑 WIN</text>
      </g>
    `
  }),

  // --- REAL CAT ---
  'cat_curious': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Cat Head -->
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <!-- Tabby Stripes -->
        <path d="M80 50 L80 64 M72 52 L74 62 M88 52 L86 62" stroke="#9a3412" stroke-width="3" stroke-linecap="round"/>
        <!-- Ears -->
        <polygon points="40,68 34,26 64,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="42,62 38,36 58,52" fill="#fbcfe8"/>
        <polygon points="120,68 126,26 96,52" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <polygon points="118,62 122,36 102,52" fill="#fbcfe8"/>
        <!-- Big Round Curious Eyes -->
        <circle cx="62" cy="85" r="10" fill="#a3e635" stroke="#4d7c0f" stroke-width="2"/>
        <ellipse cx="62" cy="85" rx="3.5" ry="9" fill="#000000"/>
        <circle cx="59" cy="81" r="2.5" fill="#ffffff"/>
        <circle cx="98" cy="85" r="10" fill="#a3e635" stroke="#4d7c0f" stroke-width="2"/>
        <ellipse cx="98" cy="85" rx="3.5" ry="9" fill="#000000"/>
        <circle cx="95" cy="81" r="2.5" fill="#ffffff"/>
        <!-- Nose & Mouth -->
        <polygon points="80,95 76,91 84,91" fill="#f43f5e"/>
        <path d="M74 98 Q80 102 86 98" stroke="#7c2d12" stroke-width="2" fill="none"/>
        <!-- Whiskers -->
        <line x1="48" y1="94" x2="22" y2="90" stroke="#7c2d12" stroke-width="2"/>
        <line x1="48" y1="99" x2="22" y2="102" stroke="#7c2d12" stroke-width="2"/>
        <line x1="112" y1="94" x2="138" y2="90" stroke="#7c2d12" stroke-width="2"/>
        <line x1="112" y1="99" x2="138" y2="102" stroke="#7c2d12" stroke-width="2"/>
      </g>
    `
  }),
  'cat_loaf': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Bread Loaf Cat Body -->
        <ellipse cx="80" cy="94" rx="55" ry="34" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Calico Patches -->
        <path d="M35 80 Q55 65 60 90 Q40 105 35 80 Z" fill="#ea580c"/>
        <path d="M105 80 Q125 70 128 95 Q115 110 105 80 Z" fill="#27272a"/>
        <!-- Sleeping eyes -->
        <path d="M60 88 Q66 94 72 88" stroke="#431407" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M88 88 Q94 94 100 88" stroke="#431407" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Ears flat -->
        <polygon points="45,72 40,54 58,68" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
        <polygon points="115,72 120,54 102,68" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
        <!-- Little nose -->
        <polygon points="80,94 77,91 83,91" fill="#f43f5e"/>
        <!-- ZZZ -->
        <text x="110" y="45" font-family="sans-serif" font-weight="bold" font-size="16" fill="#f97316">zzz</text>
      </g>
    `
  }),
  'cat_begging': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="72" rx="44" ry="38" fill="#e4e4e7" stroke="#71717a" stroke-width="3"/>
        <polygon points="42,54 36,18 64,42" fill="#e4e4e7" stroke="#71717a" stroke-width="2.5"/>
        <polygon points="118,54 124,18 96,42" fill="#e4e4e7" stroke="#71717a" stroke-width="2.5"/>
        <!-- Glossy Puss in boots begging eyes -->
        <circle cx="62" cy="70" r="13" fill="#18181b"/>
        <circle cx="58" cy="65" r="5" fill="#ffffff"/>
        <circle cx="66" cy="75" r="2.5" fill="#ffffff"/>
        <circle cx="98" cy="70" r="13" fill="#18181b"/>
        <circle cx="94" cy="65" r="5" fill="#ffffff"/>
        <circle cx="102" cy="75" r="2.5" fill="#ffffff"/>
        <!-- Paws Up Together -->
        <ellipse cx="70" cy="115" rx="10" ry="14" fill="#ffffff" stroke="#71717a" stroke-width="2.5"/>
        <ellipse cx="90" cy="115" rx="10" ry="14" fill="#ffffff" stroke="#71717a" stroke-width="2.5"/>
        <!-- Pink paw beans -->
        <ellipse cx="70" cy="114" rx="4" ry="5" fill="#f472b6"/>
        <ellipse cx="90" cy="114" rx="4" ry="5" fill="#f472b6"/>
        <!-- Please sparkle -->
        <text x="64" y="32" font-family="sans-serif" font-weight="900" font-size="13" fill="#f43f5e">PLEASE?</text>
      </g>
    `
  }),
  'cat_box': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Cardboard Box -->
        <polygon points="35,80 125,80 115,130 45,130" fill="#b45309" stroke="#78350f" stroke-width="3"/>
        <!-- Flaps open -->
        <polygon points="35,80 20,65 45,65 50,80" fill="#d97706" stroke="#78350f" stroke-width="2"/>
        <polygon points="125,80 140,65 115,65 110,80" fill="#d97706" stroke="#78350f" stroke-width="2"/>
        <!-- Cat Inside Peeking Out -->
        <ellipse cx="80" cy="72" rx="32" ry="24" fill="#18181b"/>
        <polygon points="56,60 52,38 70,52" fill="#18181b"/>
        <polygon points="104,60 108,38 90,52" fill="#18181b"/>
        <!-- Yellow cat eyes -->
        <ellipse cx="70" cy="70" rx="5" ry="6" fill="#facc15"/>
        <ellipse cx="70" cy="70" rx="2" ry="5" fill="#000000"/>
        <ellipse cx="90" cy="70" rx="5" ry="6" fill="#facc15"/>
        <ellipse cx="90" cy="70" rx="2" ry="5" fill="#000000"/>
        <!-- Front paws gripping box edge -->
        <ellipse cx="64" cy="82" rx="6" ry="5" fill="#ffffff"/>
        <ellipse cx="96" cy="82" rx="6" ry="5" fill="#ffffff"/>
        <text x="60" y="112" font-family="sans-serif" font-weight="bold" font-size="11" fill="#fef3c7">IF IT FITS</text>
      </g>
    `
  }),

  // --- REAL PUPPY ---
  'puppy_eyes': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Golden Pup Head -->
        <ellipse cx="80" cy="82" rx="44" ry="40" fill="#fbbf24" stroke="#b45309" stroke-width="3"/>
        <!-- Floppy Ears -->
        <ellipse cx="36" cy="76" rx="14" ry="28" fill="#d97706" stroke="#92400e" stroke-width="2.5" transform="rotate(15 36 76)"/>
        <ellipse cx="124" cy="76" rx="14" ry="28" fill="#d97706" stroke="#92400e" stroke-width="2.5" transform="rotate(-15 124 76)"/>
        <!-- Big Puppy Eyes -->
        <circle cx="62" cy="78" r="11" fill="#451a03"/>
        <circle cx="58" cy="74" r="4.5" fill="#ffffff"/>
        <circle cx="65" cy="83" r="2" fill="#ffffff"/>
        <circle cx="98" cy="78" r="11" fill="#451a03"/>
        <circle cx="94" cy="74" r="4.5" fill="#ffffff"/>
        <circle cx="101" cy="83" r="2" fill="#ffffff"/>
        <!-- Shiny Nose -->
        <ellipse cx="80" cy="94" rx="7" ry="5" fill="#18181b"/>
        <circle cx="78" cy="92" r="1.5" fill="#ffffff"/>
        <!-- Happy little tongue -->
        <path d="M76 100 Q80 110 84 100" fill="#f43f5e"/>
      </g>
    `
  }),
  'puppy_wag': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="75" cy="80" rx="38" ry="35" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <!-- Ears -->
        <ellipse cx="40" cy="72" rx="10" ry="22" fill="#c2410c" transform="rotate(12 40 72)"/>
        <ellipse cx="110" cy="72" rx="10" ry="22" fill="#c2410c" transform="rotate(-12 110 72)"/>
        <!-- Happy closed curve eyes -->
        <path d="M58 76 Q64 70 70 76" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M80 76 Q86 70 92 76" stroke="#431407" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Wagging Tail with blur lines -->
        <path d="M110 95 Q135 85 140 65" stroke="#ea580c" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M125 55 Q138 60 135 75" stroke="#f97316" stroke-width="2.5" stroke-dasharray="3,3" fill="none"/>
        <!-- Cheerful smile -->
        <path d="M68 88 Q75 98 82 88" stroke="#431407" stroke-width="2.5" fill="#f43f5e"/>
        <!-- Sparkle Heart -->
        <path d="M80 32 C78 26 70 28 72 34 C76 39 80 43 80 43 C80 43 84 39 88 34 C90 28 82 26 80 32 Z" fill="#f43f5e"/>
      </g>
    `
  }),
  'puppy_stick': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="82" rx="42" ry="38" fill="#fde047" stroke="#ca8a04" stroke-width="3"/>
        <ellipse cx="38" cy="76" rx="12" ry="25" fill="#ca8a04"/>
        <ellipse cx="122" cy="76" rx="12" ry="25" fill="#ca8a04"/>
        <!-- Holding Stick in Mouth -->
        <rect x="25" y="88" width="110" height="12" rx="5" fill="#78350f" stroke="#451a03" stroke-width="2" transform="rotate(-6 80 94)"/>
        <!-- Proud Eyes -->
        <circle cx="62" cy="76" r="4" fill="#451a03"/>
        <circle cx="98" cy="76" r="4" fill="#451a03"/>
        <circle cx="80" cy="85" r="5" fill="#18181b"/>
        <!-- Proud Star -->
        <polygon points="80,25 83,32 90,34 85,39 86,47 80,42 74,47 75,39 70,34 77,32" fill="#f59e0b"/>
      </g>
    `
  }),
  'puppy_confusion': () => generateSvg({
    elements: `
      <g filter="url(#shadow)" transform="rotate(-18 80 80)">
        <ellipse cx="80" cy="82" rx="44" ry="40" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <ellipse cx="36" cy="76" rx="14" ry="28" fill="#c2410c"/>
        <ellipse cx="124" cy="76" rx="14" ry="28" fill="#c2410c"/>
        <!-- One eyebrow up, one down -->
        <circle cx="62" cy="76" r="4" fill="#431407"/>
        <circle cx="98" cy="76" r="4" fill="#431407"/>
        <ellipse cx="80" cy="92" rx="6" ry="4" fill="#18181b"/>
      </g>
      <!-- Question mark upright -->
      <text x="120" y="45" font-family="sans-serif" font-weight="900" font-size="28" fill="#8b5cf6">?</text>
    `
  }),

  // --- REAL BUNNY ---
  'bunny_nose': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Long Soft Ears -->
        <ellipse cx="60" cy="38" rx="12" ry="32" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" transform="rotate(-8 60 38)"/>
        <ellipse cx="60" cy="38" rx="6" ry="22" fill="#fbcfe8" transform="rotate(-8 60 38)"/>
        <ellipse cx="100" cy="38" rx="12" ry="32" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" transform="rotate(8 100 38)"/>
        <ellipse cx="100" cy="38" rx="6" ry="22" fill="#fbcfe8" transform="rotate(8 100 38)"/>
        <!-- Round Head -->
        <circle cx="80" cy="94" r="42" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Cute Eyes -->
        <ellipse cx="62" cy="88" rx="5" ry="7" fill="#be185d"/>
        <circle cx="60" cy="85" r="2" fill="#ffffff"/>
        <ellipse cx="98" cy="88" rx="5" ry="7" fill="#be185d"/>
        <circle cx="96" cy="85" r="2" fill="#ffffff"/>
        <!-- Pink Wiggle Nose -->
        <polygon points="80,98 75,93 85,93" fill="#f43f5e"/>
        <!-- Motion lines near nose -->
        <path d="M70 95 Q68 98 70 101" stroke="#f43f5e" stroke-width="1.5" fill="none"/>
        <path d="M90 95 Q92 98 90 101" stroke="#f43f5e" stroke-width="1.5" fill="none"/>
        <!-- Whiskers -->
        <line x1="50" y1="96" x2="30" y2="94" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="50" y1="102" x2="30" y2="105" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="110" y1="96" x2="130" y2="94" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="110" y1="102" x2="130" y2="105" stroke="#94a3b8" stroke-width="1.5"/>
      </g>
    `
  }),
  'bunny_carrot': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="60" cy="38" rx="10" ry="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <ellipse cx="100" cy="38" rx="10" ry="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="80" cy="94" r="40" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Big Juicy Orange Carrot being munched -->
        <polygon points="50,110 115,80 125,92 60,122" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
        <!-- Carrot Green Top -->
        <path d="M120 85 Q135 75 145 80 Q135 88 122 90" fill="#22c55e"/>
        <!-- Chewing cheeks -->
        <circle cx="60" cy="94" r="4" fill="#f472b6" opacity="0.6"/>
        <circle cx="100" cy="94" r="4" fill="#f472b6" opacity="0.6"/>
        <circle cx="65" cy="85" r="3.5" fill="#475569"/>
        <circle cx="95" cy="85" r="3.5" fill="#475569"/>
        <!-- Munch crumbs -->
        <circle cx="54" cy="120" r="2" fill="#f97316"/>
        <circle cx="70" cy="126" r="1.5" fill="#f97316"/>
        <text x="25" y="65" font-family="sans-serif" font-weight="bold" font-size="13" fill="#f97316">NOM!</text>
      </g>
    `
  }),

  // --- PANDA BUDDY ---
  'panda_bamboo': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Ears -->
        <circle cx="45" cy="48" r="16" fill="#18181b"/>
        <circle cx="115" cy="48" r="16" fill="#18181b"/>
        <!-- Head -->
        <ellipse cx="80" cy="88" rx="46" ry="40" fill="#ffffff" stroke="#e4e4e7" stroke-width="3"/>
        <!-- Black Eye Patches -->
        <ellipse cx="60" cy="82" rx="12" ry="15" fill="#18181b" transform="rotate(-15 60 82)"/>
        <circle cx="60" cy="80" r="3" fill="#ffffff"/>
        <ellipse cx="100" cy="82" rx="12" ry="15" fill="#18181b" transform="rotate(15 100 82)"/>
        <circle cx="100" cy="80" r="3" fill="#ffffff"/>
        <!-- Nose -->
        <ellipse cx="80" cy="96" rx="6" ry="4" fill="#18181b"/>
        <!-- Bamboo Stalk -->
        <rect x="25" y="85" width="110" height="8" rx="3" fill="#84cc16" stroke="#4d7c0f" stroke-width="2" transform="rotate(10 80 89)"/>
        <!-- Bamboo Leaf -->
        <path d="M110 85 Q130 75 140 85 Q125 90 110 85 Z" fill="#65a30d"/>
      </g>
    `
  }),
  'panda_roll': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Round Ball Panda -->
        <circle cx="80" cy="80" r="48" fill="#ffffff" stroke="#e4e4e7" stroke-width="3"/>
        <!-- Black limbs in rolling pose -->
        <ellipse cx="50" cy="45" rx="14" ry="10" fill="#18181b" transform="rotate(-30 50 45)"/>
        <ellipse cx="110" cy="45" rx="14" ry="10" fill="#18181b" transform="rotate(30 110 45)"/>
        <ellipse cx="50" cy="115" rx="14" ry="10" fill="#18181b" transform="rotate(30 50 115)"/>
        <ellipse cx="110" cy="115" rx="14" ry="10" fill="#18181b" transform="rotate(-30 110 115)"/>
        <!-- Eye Patches -->
        <ellipse cx="70" cy="74" rx="8" ry="11" fill="#18181b"/>
        <circle cx="70" cy="72" r="2.5" fill="#ffffff"/>
        <ellipse cx="94" cy="74" rx="8" ry="11" fill="#18181b"/>
        <circle cx="94" cy="72" r="2.5" fill="#ffffff"/>
        <!-- Nose & Smile -->
        <circle cx="82" cy="84" r="3.5" fill="#18181b"/>
        <path d="M78 88 Q82 92 86 88" stroke="#18181b" stroke-width="2" fill="none"/>
        <!-- Roll Motion Curved Arrow -->
        <path d="M25 80 A 55 55 0 0 1 80 25" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="4,4"/>
      </g>
    `
  }),

  // --- FUNNY FROG ---
  'frog_siptea': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Frog Head -->
        <ellipse cx="80" cy="88" rx="50" ry="36" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
        <!-- Bulging Frog Eyes on top -->
        <circle cx="50" cy="56" r="18" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
        <circle cx="50" cy="56" r="10" fill="#facc15"/>
        <ellipse cx="50" cy="56" rx="3" ry="8" fill="#000000"/>
        <circle cx="110" cy="56" r="18" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
        <circle cx="110" cy="56" r="10" fill="#facc15"/>
        <ellipse cx="110" cy="56" rx="3" ry="8" fill="#000000"/>
        <!-- Wide straight mouth -->
        <path d="M45 92 Q80 96 115 92" stroke="#365314" stroke-width="3.5" fill="none"/>
        <!-- Teacup being sipped -->
        <rect x="92" y="90" width="28" height="24" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <path d="M120 96 C130 96 130 108 120 108" fill="none" stroke="#64748b" stroke-width="2"/>
        <ellipse cx="106" cy="90" rx="14" ry="4" fill="#78350f"/>
        <!-- Pinky up frog hand -->
        <circle cx="90" cy="102" r="5" fill="#65a30d"/>
        <!-- Text -->
        <text x="30" y="140" font-family="sans-serif" font-weight="bold" font-size="12" fill="#4d7c0f">BUT THAT'S NONE OF MY BIZ</text>
      </g>
    `
  }),
  'frog_scream': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="85" rx="48" ry="42" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
        <circle cx="48" cy="50" r="16" fill="#84cc16" stroke="#4d7c0f" stroke-width="2.5"/>
        <circle cx="112" cy="50" r="16" fill="#84cc16" stroke="#4d7c0f" stroke-width="2.5"/>
        <!-- Tiny panic pupils -->
        <circle cx="48" cy="50" r="4" fill="#000000"/>
        <circle cx="112" cy="50" r="4" fill="#000000"/>
        <!-- Screaming gaping mouth -->
        <ellipse cx="80" cy="96" rx="24" ry="20" fill="#7f1d1d" stroke="#450a0a" stroke-width="3"/>
        <!-- Hands clutching cheeks like The Scream -->
        <ellipse cx="38" cy="88" rx="8" ry="14" fill="#65a30d" stroke="#365314" stroke-width="2"/>
        <ellipse cx="122" cy="88" rx="8" ry="14" fill="#65a30d" stroke="#365314" stroke-width="2"/>
        <text x="45" y="32" font-family="sans-serif" font-weight="900" font-size="20" fill="#ef4444">AAAHHH!</text>
      </g>
    `
  }),
  'frog_facepalm': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="88" rx="50" ry="36" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
        <circle cx="50" cy="56" r="16" fill="#84cc16" stroke="#4d7c0f" stroke-width="2.5"/>
        <circle cx="110" cy="56" r="16" fill="#84cc16" stroke="#4d7c0f" stroke-width="2.5"/>
        <!-- Left eye visible, looking done -->
        <path d="M42 56 L58 56" stroke="#000" stroke-width="3"/>
        <!-- Right hand covering face -->
        <ellipse cx="100" cy="74" rx="20" ry="24" fill="#65a30d" stroke="#365314" stroke-width="3" transform="rotate(-20 100 74)"/>
        <!-- Webbed fingers -->
        <circle cx="90" cy="54" r="4" fill="#65a30d"/>
        <circle cx="102" cy="52" r="4" fill="#65a30d"/>
        <circle cx="114" cy="56" r="4" fill="#65a30d"/>
        <!-- Annoyed mouth line -->
        <line x1="50" y1="96" x2="80" y2="96" stroke="#365314" stroke-width="3"/>
      </g>
    `
  }),

  // --- SLEEPY BEAR ---
  'bear_burrito': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Rolled Blanket Burrito -->
        <ellipse cx="80" cy="90" rx="55" ry="36" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
        <!-- Blanket folds -->
        <path d="M40 80 Q80 110 120 80" fill="none" stroke="#0284c7" stroke-width="3"/>
        <!-- Bear Head peeking out -->
        <ellipse cx="80" cy="65" rx="30" ry="24" fill="#92400e" stroke="#451a03" stroke-width="2.5"/>
        <!-- Bear Ears -->
        <circle cx="58" cy="46" r="8" fill="#92400e"/>
        <circle cx="58" cy="46" r="4" fill="#fde68a"/>
        <circle cx="102" cy="46" r="8" fill="#92400e"/>
        <circle cx="102" cy="46" r="4" fill="#fde68a"/>
        <!-- Snoring sleepy face -->
        <path d="M68 64 Q72 68 76 64" stroke="#fef3c7" stroke-width="2.5" fill="none"/>
        <path d="M84 64 Q88 68 92 64" stroke="#fef3c7" stroke-width="2.5" fill="none"/>
        <ellipse cx="80" cy="72" rx="7" ry="5" fill="#fde68a"/>
        <circle cx="80" cy="70" r="2.5" fill="#451a03"/>
        <!-- SNORE Bubble -->
        <circle cx="115" cy="40" r="8" fill="#bae6fd" opacity="0.8"/>
        <text x="110" y="44" font-family="sans-serif" font-weight="bold" font-size="11" fill="#0369a1">z</text>
      </g>
    `
  }),
  'bear_alarm': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Smashed Alarm Clock -->
        <ellipse cx="80" cy="115" rx="36" ry="12" fill="#ef4444" stroke="#991b1b" stroke-width="2.5"/>
        <!-- Clock face cracked -->
        <ellipse cx="80" cy="115" rx="26" ry="8" fill="#ffffff"/>
        <line x1="72" y1="112" x2="88" y2="118" stroke="#000000" stroke-width="2"/>
        <line x1="80" y1="110" x2="82" y2="120" stroke="#000000" stroke-width="1.5"/>
        <!-- Bear Paw Smashed on top -->
        <ellipse cx="80" cy="95" rx="24" ry="16" fill="#92400e" stroke="#451a03" stroke-width="3"/>
        <!-- Claws / Paw Pads -->
        <circle cx="68" cy="92" r="3.5" fill="#451a03"/>
        <circle cx="76" cy="90" r="3.5" fill="#451a03"/>
        <circle cx="84" cy="90" r="3.5" fill="#451a03"/>
        <circle cx="92" cy="92" r="3.5" fill="#451a03"/>
        <!-- Impact rays -->
        <path d="M48 100 L32 95 M112 100 L128 95 M80 75 L80 60" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <text x="50" y="45" font-family="sans-serif" font-weight="900" font-size="18" fill="#ef4444">SMASH!</text>
      </g>
    `
  }),

  // --- GHOST BUDDY ---
  'ghost_boo': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Ghost Sheet Body -->
        <path d="M40 85 C40 40 120 40 120 85 C120 120 110 135 105 125 C100 115 90 135 80 125 C70 115 60 135 55 125 C50 115 40 120 40 85 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Cute Spooky Eyes -->
        <ellipse cx="65" cy="74" rx="6" ry="8" fill="#1e1b4b"/>
        <circle cx="63" cy="71" r="2.5" fill="#ffffff"/>
        <ellipse cx="95" cy="74" rx="6" ry="8" fill="#1e1b4b"/>
        <circle cx="93" cy="71" r="2.5" fill="#ffffff"/>
        <!-- Open Boo Mouth -->
        <ellipse cx="80" cy="88" rx="7" ry="10" fill="#1e1b4b"/>
        <!-- Cheeks -->
        <circle cx="54" cy="82" r="5" fill="#f472b6" opacity="0.6"/>
        <circle cx="106" cy="82" r="5" fill="#f472b6" opacity="0.6"/>
        <!-- Raised hands -->
        <path d="M38 78 Q22 70 34 62" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M122 78 Q138 70 126 62" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Boo text -->
        <text x="65" y="32" font-family="sans-serif" font-weight="900" font-size="18" fill="#a855f7">BOO! 👻</text>
      </g>
    `
  }),
  'ghost_hug': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Ghost 1 -->
        <path d="M40 85 C40 45 100 45 100 85 C100 120 90 125 80 118 C70 125 55 118 45 122 C40 115 40 105 40 85 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5"/>
        <circle cx="65" cy="72" r="3.5" fill="#1e1b4b"/>
        <circle cx="85" cy="72" r="3.5" fill="#1e1b4b"/>
        <path d="M72 80 Q75 84 78 80" stroke="#1e1b4b" stroke-width="2" fill="none"/>
        <!-- Ghost 2 hugging -->
        <path d="M85 90 C85 58 135 58 135 90 C135 120 125 125 115 118 C105 125 95 118 88 122 Z" fill="#fbcfe8" stroke="#f472b6" stroke-width="2" opacity="0.85"/>
        <circle cx="108" cy="78" r="3" fill="#831843"/>
        <circle cx="122" cy="78" r="3" fill="#831843"/>
        <!-- Hug arms -->
        <path d="M68 85 Q95 85 105 82" stroke="#cbd5e1" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- Heart float -->
        <path d="M80 30 C76 22 66 25 70 34 C76 40 80 44 80 44 C80 44 84 40 90 34 C94 25 84 22 80 30 Z" fill="#ec4899"/>
      </g>
    `
  }),

  // --- TINY ROBOT ---
  'robot_404': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Antenna -->
        <line x1="80" y1="42" x2="80" y2="24" stroke="#64748b" stroke-width="4"/>
        <circle cx="80" cy="22" r="6" fill="#ef4444" filter="url(#glow)"/>
        <!-- Robot Head -->
        <rect x="42" y="42" width="76" height="66" rx="14" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
        <!-- Ears / Bolts -->
        <rect x="34" y="65" width="8" height="18" rx="2" fill="#94a3b8"/>
        <rect x="118" y="65" width="8" height="18" rx="2" fill="#94a3b8"/>
        <!-- Screen Face -->
        <rect x="52" y="54" width="56" height="42" rx="8" fill="#0f172a"/>
        <!-- 404 Text on screen -->
        <text x="56" y="80" font-family="monospace" font-weight="900" font-size="18" fill="#ef4444">404</text>
        <text x="58" y="92" font-family="monospace" font-weight="bold" font-size="8" fill="#38bdf8">ERROR</text>
      </g>
    `
  }),
  'robot_heart': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <line x1="80" y1="42" x2="80" y2="24" stroke="#64748b" stroke-width="4"/>
        <circle cx="80" cy="22" r="6" fill="#ec4899"/>
        <rect x="42" y="42" width="76" height="66" rx="14" fill="#38bdf8" stroke="#0284c7" stroke-width="3"/>
        <rect x="52" y="54" width="56" height="42" rx="8" fill="#0f172a"/>
        <!-- Pixel Heart on screen -->
        <path d="M80 66 C80 66 74 60 70 63 C66 66 70 72 80 80 C90 72 94 66 90 63 C86 60 80 66 80 66 Z" fill="#ec4899" filter="url(#glow)"/>
        <text x="56" y="92" font-family="monospace" font-weight="bold" font-size="8" fill="#4ade80">BEEP BOOP &lt;3</text>
      </g>
    `
  }),

  // --- LOVELY COUPLE & HEART BUDDY ---
  'couple_kiss': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Boy Head -->
        <circle cx="62" cy="75" r="26" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <path d="M42 62 Q62 45 78 62" fill="#451a03"/>
        <!-- Kiss closed eye -->
        <path d="M54 75 Q58 72 62 75" stroke="#431407" stroke-width="2" fill="none"/>
        <!-- Girl Head leaning in -->
        <circle cx="98" cy="85" r="24" fill="#fde68a" stroke="#d97706" stroke-width="2.5"/>
        <path d="M82 72 Q100 55 120 75" fill="#78350f"/>
        <path d="M96 86 Q100 83 104 86" stroke="#431407" stroke-width="2" fill="none"/>
        <circle cx="106" cy="90" r="3" fill="#f43f5e" opacity="0.6"/>
        <!-- Kiss Contact Point Hearts -->
        <path d="M82 60 C80 54 72 56 75 62 C79 67 82 70 82 70 C82 70 85 67 89 62 C92 56 84 54 82 60 Z" fill="#f43f5e"/>
        <path d="M88 45 C86 40 80 42 82 46 C85 50 88 53 88 53 C88 53 91 50 94 46 C96 42 90 40 88 45 Z" fill="#ec4899"/>
      </g>
    `
  }),
  'couple_hands': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Two Hands Interlocking -->
        <path d="M35 110 C45 85 65 80 75 90 C85 100 80 120 70 125 Z" fill="#fed7aa" stroke="#ea580c" stroke-width="3"/>
        <path d="M125 110 C115 85 95 80 85 90 C75 100 80 120 90 125 Z" fill="#fde68a" stroke="#d97706" stroke-width="3"/>
        <!-- Fingers clasped -->
        <rect x="68" y="85" width="24" height="30" rx="8" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
        <!-- Ring on finger -->
        <rect x="74" y="96" width="4" height="8" rx="1" fill="#facc15"/>
        <!-- Floating Red Heart -->
        <path d="M80 40 C76 30 62 34 68 46 C76 56 80 62 80 62 C80 62 84 56 92 46 C98 34 84 30 80 40 Z" fill="#ef4444"/>
        <text x="48" y="145" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ef4444">FOREVER</text>
      </g>
    `
  }),
  'heart_exploding': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Center Big Heart -->
        <path d="M80 46 C72 30 50 36 58 56 C70 72 80 84 80 84 C80 84 90 72 102 56 C110 36 88 30 80 46 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3" filter="url(#glow)"/>
        <!-- Mini flying hearts and bursts -->
        <path d="M35 40 C32 34 22 36 25 44 C30 50 35 54 35 54 C35 54 40 50 45 44 C48 36 38 34 35 40 Z" fill="#f43f5e"/>
        <path d="M125 40 C122 34 112 36 115 44 C120 50 125 54 125 54 C125 54 130 50 135 44 C138 36 128 34 125 40 Z" fill="#f43f5e"/>
        <circle cx="80" cy="18" r="4" fill="#fbbf24"/>
        <circle cx="28" cy="80" r="4" fill="#fbbf24"/>
        <circle cx="132" cy="80" r="4" fill="#fbbf24"/>
        <!-- Sparkle rays -->
        <line x1="80" y1="28" x2="80" y2="38" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
        <line x1="45" y1="65" x2="35" y2="68" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
        <line x1="115" y1="65" x2="125" y2="68" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      </g>
    `
  }),
  'heart_bandage': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Red Heart with jagged crack -->
        <path d="M80 46 C72 30 50 36 58 56 C70 72 80 84 80 84 C80 84 90 72 102 56 C110 36 88 30 80 46 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
        <path d="M80 50 L76 60 L84 66 L78 76" stroke="#450a0a" stroke-width="3" fill="none"/>
        <!-- Bandage over crack -->
        <polygon points="56,66 94,50 102,64 64,80" fill="#fde68a" stroke="#ca8a04" stroke-width="2.5"/>
        <circle cx="78" cy="65" r="2" fill="#ca8a04"/>
        <!-- Sad cute eyes on heart -->
        <circle cx="66" cy="54" r="2.5" fill="#ffffff"/>
        <circle cx="94" cy="54" r="2.5" fill="#ffffff"/>
      </g>
    `
  }),

  // --- PIZZA FRIENDS ---
  'pizza_slicehug': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Pizza Slice -->
        <polygon points="80,126 36,44 124,44" fill="#fbbf24" stroke="#b45309" stroke-width="3"/>
        <!-- Crust -->
        <path d="M34 44 Q80 34 126 44" stroke="#b45309" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- Pepperoni -->
        <circle cx="62" cy="65" r="7" fill="#dc2626"/>
        <circle cx="95" cy="70" r="6.5" fill="#dc2626"/>
        <circle cx="78" cy="95" r="6" fill="#dc2626"/>
        <!-- Cute Face -->
        <circle cx="68" cy="78" r="3" fill="#451a03"/>
        <circle cx="88" cy="78" r="3" fill="#451a03"/>
        <path d="M74 85 Q78 89 82 85" stroke="#451a03" stroke-width="2" fill="none"/>
        <!-- Cheesy hands -->
        <path d="M42 78 Q28 82 34 92" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M118 78 Q132 82 126 92" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none"/>
      </g>
    `
  }),
  'pizza_cheese': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="80,126 36,44 124,44" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
        <path d="M34 44 Q80 34 126 44" stroke="#92400e" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- Stretchy melting cheese string hanging from bottom -->
        <path d="M80 126 Q75 145 80 155 Q85 145 80 126" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="60" cy="70" r="3.5" fill="#713f12"/>
        <circle cx="100" cy="70" r="3.5" fill="#713f12"/>
        <path d="M72 82 Q80 94 88 82" stroke="#713f12" stroke-width="2.5" fill="#dc2626"/>
      </g>
    `
  }),

  // --- RAMEN BUDDY ---
  'ramen_slurp': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Ramen Bowl -->
        <path d="M36 78 C36 125 124 125 124 78 Z" fill="#ef4444" stroke="#991b1b" stroke-width="3.5"/>
        <ellipse cx="80" cy="78" rx="44" ry="14" fill="#fef08a"/>
        <!-- Soup / Curly noodles -->
        <path d="M50 78 Q60 68 70 78 Q80 88 90 78 Q100 68 110 78" stroke="#eab308" stroke-width="4" fill="none"/>
        <!-- Soft boiled egg -->
        <ellipse cx="62" cy="74" rx="8" ry="6" fill="#ffffff"/>
        <circle cx="62" cy="74" r="4" fill="#f97316"/>
        <!-- Chopsticks lifting noodles -->
        <line x1="60" y1="20" x2="110" y2="60" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="65" y1="18" x2="115" y2="58" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M85 45 Q80 60 85 75" stroke="#facc15" stroke-width="3" fill="none"/>
        <!-- Happy Face on Bowl -->
        <circle cx="66" cy="98" r="3" fill="#ffffff"/>
        <circle cx="94" cy="98" r="3" fill="#ffffff"/>
        <path d="M76 106 Q80 110 84 106" stroke="#ffffff" stroke-width="2" fill="none"/>
      </g>
    `
  }),
  'ramen_spicy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Spicy Red Broth Bowl -->
        <path d="M36 78 C36 125 124 125 124 78 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3.5"/>
        <ellipse cx="80" cy="78" rx="44" ry="14" fill="#b91c1c"/>
        <!-- Flames coming from broth -->
        <path d="M60 70 Q55 45 68 40 Q75 55 70 70" fill="#f97316"/>
        <path d="M85 70 Q95 45 88 38 Q80 50 85 70" fill="#eab308"/>
        <!-- Sweating face -->
        <circle cx="66" cy="98" r="3" fill="#ffffff"/>
        <circle cx="94" cy="98" r="3" fill="#ffffff"/>
        <path d="M74 108 Q80 116 86 108" stroke="#ffffff" stroke-width="2.5" fill="#fef08a"/>
        <!-- Sweat drops -->
        <circle cx="118" cy="65" r="3.5" fill="#38bdf8"/>
        <text x="54" y="32" font-family="sans-serif" font-weight="900" font-size="16" fill="#ef4444">SPICY! 🔥</text>
      </g>
    `
  }),

  // --- DONUT FRIEND ---
  'donut_sprinkles': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
        <circle cx="80" cy="80" r="42" fill="#ec4899"/>
        <circle cx="80" cy="80" r="16" fill="#09090b"/>
        <!-- Lots of Sprinkles flying -->
        <circle cx="48" cy="60" r="3" fill="#38bdf8"/>
        <circle cx="112" cy="60" r="3" fill="#facc15"/>
        <circle cx="56" cy="104" r="3" fill="#4ade80"/>
        <circle cx="104" cy="104" r="3" fill="#ffffff"/>
        <circle cx="80" cy="44" r="3" fill="#c084fc"/>
        <circle cx="68" cy="74" r="3.5" fill="#831843"/>
        <circle cx="92" cy="74" r="3.5" fill="#831843"/>
        <path d="M76 86 Q80 92 84 86" stroke="#831843" stroke-width="2.5" fill="none"/>
      </g>
    `
  }),
  'donut_bitten': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
        <circle cx="80" cy="80" r="42" fill="#38bdf8"/>
        <circle cx="80" cy="80" r="16" fill="#09090b"/>
        <!-- Bite mark cutout on top-right -->
        <circle cx="116" cy="52" r="14" fill="#09090b"/>
        <!-- Shocked Eyes -->
        <circle cx="64" cy="78" r="5" fill="#0369a1"/>
        <circle cx="64" cy="78" r="2" fill="#ffffff"/>
        <circle cx="88" cy="86" r="5" fill="#0369a1"/>
        <!-- Ouch mouth -->
        <ellipse cx="76" cy="96" rx="5" ry="7" fill="#0f172a"/>
        <text x="32" y="38" font-family="sans-serif" font-weight="900" font-size="14" fill="#ef4444">MY SPRINKLES!</text>
      </g>
    `
  }),

  // --- GAME BOY & PIXEL MONSTER ---
  'game_controller': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Game Console Body -->
        <rect x="42" y="32" width="76" height="106" rx="14" fill="#06b6d4" stroke="#0891b2" stroke-width="3"/>
        <!-- Screen -->
        <rect x="52" y="44" width="56" height="42" rx="6" fill="#155e75" stroke="#0e7490" stroke-width="2"/>
        <rect x="56" y="48" width="48" height="34" rx="4" fill="#a3e635"/>
        <text x="62" y="70" font-family="monospace" font-weight="900" font-size="13" fill="#1e3a5f">WIN!</text>
        <!-- D-Pad -->
        <rect x="55" y="96" width="18" height="6" rx="2" fill="#18181b"/>
        <rect x="61" y="90" width="6" height="18" rx="2" fill="#18181b"/>
        <!-- A/B Buttons -->
        <circle cx="95" cy="98" r="4.5" fill="#ef4444"/>
        <circle cx="106" cy="92" r="4.5" fill="#facc15"/>
      </g>
    `
  }),
  'game_over': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="30" y="45" width="100" height="70" rx="10" fill="#18181b" stroke="#dc2626" stroke-width="3"/>
        <text x="38" y="76" font-family="monospace" font-weight="900" font-size="15" fill="#ef4444">GAME OVER</text>
        <text x="46" y="96" font-family="monospace" font-weight="bold" font-size="11" fill="#94a3b8">CONTINUE? 9</text>
        <!-- Skull Icon -->
        <circle cx="80" cy="28" r="10" fill="#ffffff"/>
        <rect x="76" y="34" width="8" height="6" fill="#ffffff"/>
        <circle cx="76" cy="28" r="2" fill="#000"/>
        <circle cx="84" cy="28" r="2" fill="#000"/>
      </g>
    `
  }),
  'pixel_slime': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Green Pixel Slime -->
        <path d="M44 95 C44 55 116 55 116 95 C116 115 44 115 44 95 Z" fill="#22c55e" stroke="#15803d" stroke-width="3.5"/>
        <!-- Cute Big Eyes -->
        <circle cx="65" cy="85" r="6" fill="#052e16"/>
        <circle cx="63" cy="83" r="2" fill="#ffffff"/>
        <circle cx="95" cy="85" r="6" fill="#052e16"/>
        <circle cx="93" cy="83" r="2" fill="#ffffff"/>
        <path d="M76 95 Q80 100 84 95" stroke="#052e16" stroke-width="2" fill="none"/>
        <circle cx="56" cy="92" r="3.5" fill="#f43f5e" opacity="0.6"/>
        <circle cx="104" cy="92" r="3.5" fill="#f43f5e" opacity="0.6"/>
        <!-- Antenna sprout -->
        <circle cx="80" cy="52" r="5" fill="#4ade80"/>
      </g>
    `
  }),

  // --- REACTION FACE & MEMES ---
  'meme_facepalm': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="60" cy="74" rx="4" ry="2" fill="#78350f"/>
        <!-- Big slapping hand covering right eye and forehead -->
        <path d="M80 50 C95 40 115 50 110 85 C105 100 90 95 80 90 Z" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
        <circle cx="88" cy="46" r="3.5" fill="#f59e0b"/>
        <circle cx="98" cy="48" r="3.5" fill="#f59e0b"/>
        <circle cx="106" cy="54" r="3.5" fill="#f59e0b"/>
        <!-- Sigh mouth -->
        <path d="M55 94 Q65 90 72 96" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="30" y="35" font-family="sans-serif" font-weight="900" font-size="16" fill="#78350f">*FACEPALM*</text>
      </g>
    `
  }),
  'meme_mindblown': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="95" r="40" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <!-- Big Round Staring Eyes -->
        <circle cx="65" cy="92" r="8" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="65" cy="92" r="3" fill="#000000"/>
        <circle cx="95" cy="92" r="8" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="95" cy="92" r="3" fill="#000000"/>
        <!-- Gaping O mouth -->
        <circle cx="80" cy="112" r="7" fill="#78350f"/>
        <!-- Mushroom cloud / galaxy brain explosion on top -->
        <path d="M45 65 C25 45 40 18 70 25 C80 10 105 15 110 32 C125 25 140 45 115 65 Z" fill="#f97316" stroke="#c2410c" stroke-width="3"/>
        <circle cx="80" cy="40" r="14" fill="#fef08a"/>
        <!-- Spark particles -->
        <circle cx="35" cy="25" r="3" fill="#ef4444"/>
        <circle cx="128" cy="22" r="3" fill="#ef4444"/>
      </g>
    `
  }),
  'meme_eyeroll': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <!-- Eyes looking straight up -->
        <circle cx="62" cy="74" r="11" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="62" cy="67" r="5" fill="#000000"/>
        <circle cx="98" cy="74" r="11" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="98" cy="67" r="5" fill="#000000"/>
        <!-- Flat unimpressed line mouth -->
        <line x1="68" y1="96" x2="92" y2="96" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
        <text x="45" y="30" font-family="sans-serif" font-weight="bold" font-size="14" fill="#92400e">WHATEVER</text>
      </g>
    `
  }),
  'meme_squint': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <!-- Squinting Sus Eyes -->
        <ellipse cx="62" cy="74" rx="10" ry="2.5" fill="#78350f"/>
        <ellipse cx="98" cy="74" rx="10" ry="2.5" fill="#78350f"/>
        <!-- Squint Eyebrows lowered -->
        <path d="M52 66 L72 70" stroke="#78350f" stroke-width="3.5"/>
        <path d="M108 66 L88 70" stroke="#78350f" stroke-width="3.5"/>
        <!-- Wavy suspicious mouth -->
        <path d="M68 94 Q80 90 92 94" stroke="#78350f" stroke-width="3" fill="none"/>
        <text x="60" y="32" font-family="sans-serif" font-weight="900" font-size="16" fill="#dc2626">SUS...</text>
      </g>
    `
  }),
  'meme_crythumbsup': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="75" cy="80" r="42" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <!-- Weeping streaming tear -->
        <path d="M58 78 L54 115 Q58 120 62 115 Z" fill="#38bdf8"/>
        <!-- Strained smile -->
        <circle cx="58" cy="74" r="3.5" fill="#78350f"/>
        <circle cx="92" cy="74" r="3.5" fill="#78350f"/>
        <path d="M64 92 Q75 104 86 92" stroke="#78350f" stroke-width="2.5" fill="none"/>
        <!-- Trembling eyebrows -->
        <path d="M52 66 L64 68" stroke="#78350f" stroke-width="2.5"/>
        <path d="M98 66 L86 68" stroke="#78350f" stroke-width="2.5"/>
        <!-- Thumbs Up Hand -->
        <circle cx="120" cy="98" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/>
        <rect x="114" y="75" width="8" height="20" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <text x="25" y="32" font-family="sans-serif" font-weight="bold" font-size="13" fill="#0284c7">I'M FINE :')</text>
      </g>
    `
  }),
  'meme_popcorn': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Red and White Striped Popcorn Bucket -->
        <polygon points="45,65 115,65 105,130 55,130" fill="#ffffff" stroke="#b91c1c" stroke-width="3"/>
        <polygon points="59,65 73,65 71,130 57,130" fill="#ef4444"/>
        <polygon points="87,65 101,65 99,130 85,130" fill="#ef4444"/>
        <!-- Popcorn Overflowing Kernels on top -->
        <circle cx="55" cy="58" r="10" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="75" cy="52" r="12" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="95" cy="55" r="11" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="80" cy="40" r="10" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="65" cy="45" r="8" fill="#fde047"/>
        <text x="48" y="105" font-family="sans-serif" font-weight="900" font-size="14" fill="#b91c1c">DRAMA</text>
      </g>
    `
  }),
  'meme_shrug': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="70" r="34" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/>
        <circle cx="70" cy="68" r="3" fill="#78350f"/>
        <circle cx="90" cy="68" r="3" fill="#78350f"/>
        <!-- Flat / Smug smile -->
        <path d="M72 82 Q80 84 88 82" stroke="#78350f" stroke-width="2.5" fill="none"/>
        <!-- Shrugging Hands ¯\\_(ツ)_/¯ -->
        <path d="M30 85 L48 95 L60 88" stroke="#d97706" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M130 85 L112 95 L100 88" stroke="#d97706" stroke-width="5" stroke-linecap="round" fill="none"/>
        <circle cx="28" cy="85" r="6" fill="#fbbf24"/>
        <circle cx="132" cy="85" r="6" fill="#fbbf24"/>
        <text x="50" y="125" font-family="sans-serif" font-weight="900" font-size="14" fill="#78350f">IDK LOL</text>
      </g>
    `
  }),

  // --- RAINBOW CUTE CHARACTERS ---
  'rainbow_star': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Rainbow Tail -->
        <path d="M40 120 Q65 95 90 100" stroke="#f43f5e" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M35 126 Q60 101 85 106" stroke="#fbbf24" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M30 132 Q55 107 80 112" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Star Body -->
        <polygon points="90,32 96,52 118,52 100,66 106,86 90,74 74,86 80,66 62,52 84,52" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
        <circle cx="84" cy="60" r="2.5" fill="#451a03"/>
        <circle cx="96" cy="60" r="2.5" fill="#451a03"/>
        <path d="M87 66 Q90 70 93 66" stroke="#451a03" stroke-width="2" fill="none"/>
        <circle cx="78" cy="63" r="3" fill="#f43f5e" opacity="0.6"/>
        <circle cx="102" cy="63" r="3" fill="#f43f5e" opacity="0.6"/>
      </g>
    `
  }),
  'rainbow_cloud': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="80" cy="85" rx="46" ry="28" fill="#e0f2fe" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="60" cy="68" r="22" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="95" cy="64" r="26" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
        <ellipse cx="80" cy="85" rx="44" ry="26" fill="#f0f9ff"/>
        <circle cx="68" cy="78" r="3.5" fill="#0369a1"/>
        <circle cx="92" cy="78" r="3.5" fill="#0369a1"/>
        <path d="M76 86 Q80 90 84 86" stroke="#0369a1" stroke-width="2.5" fill="none"/>
        <circle cx="58" cy="82" r="4" fill="#f472b6" opacity="0.7"/>
        <circle cx="102" cy="82" r="4" fill="#f472b6" opacity="0.7"/>
      </g>
    `
  }),

  // --- AESTHETIC ---
  'aesthetic_moon': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M95 35 C65 35 45 60 45 90 C45 120 70 140 100 135 C75 125 70 90 85 65 C95 48 108 42 115 42 C108 38 102 35 95 35 Z" fill="#c084fc" stroke="#9333ea" stroke-width="3"/>
        <polygon points="115,55 118,63 126,65 118,68 115,76 112,68 104,65 112,63" fill="#fef08a"/>
        <polygon points="50,45 52,50 58,52 52,54 50,60 48,54 42,52 48,50" fill="#fef08a"/>
        <circle cx="70" cy="85" r="2.5" fill="#ffffff"/>
        <circle cx="82" cy="85" r="2.5" fill="#ffffff"/>
        <path d="M74 92 Q76 95 78 92" stroke="#ffffff" stroke-width="1.5" fill="none"/>
      </g>
    `
  }),
  'aesthetic_cassette': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="36" y="52" width="88" height="56" rx="8" fill="#18181b" stroke="#ec4899" stroke-width="3"/>
        <rect x="44" y="60" width="72" height="32" rx="4" fill="#06b6d4"/>
        <circle cx="62" cy="76" r="8" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
        <circle cx="98" cy="76" r="8" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
        <rect x="70" y="72" width="20" height="8" rx="2" fill="#ffffff" opacity="0.6"/>
        <text x="56" y="102" font-family="monospace" font-weight="900" font-size="7" fill="#ec4899">LO-FI VIBES</text>
      </g>
    `
  }),

  // --- SEASONAL ---
  'seasonal_pumpkin': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="76" y="38" width="8" height="16" rx="3" fill="#15803d"/>
        <ellipse cx="80" cy="90" rx="46" ry="36" fill="#ea580c" stroke="#9a3412" stroke-width="3"/>
        <ellipse cx="80" cy="90" rx="28" ry="36" fill="#f97316"/>
        <ellipse cx="80" cy="90" rx="14" ry="36" fill="#fb923c"/>
        <circle cx="68" cy="88" r="3.5" fill="#431407"/>
        <circle cx="92" cy="88" r="3.5" fill="#431407"/>
        <path d="M74 98 Q80 104 86 98" stroke="#431407" stroke-width="2.5" fill="none"/>
        <circle cx="60" cy="92" r="4" fill="#f43f5e" opacity="0.6"/>
        <circle cx="100" cy="92" r="4" fill="#f43f5e" opacity="0.6"/>
      </g>
    `
  }),
  'seasonal_leaf': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 32 L88 56 L112 52 L96 72 L116 88 L90 88 L84 116 L76 116 L70 88 L44 88 L64 72 L48 52 L72 56 Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3"/>
        <line x1="80" y1="56" x2="80" y2="128" stroke="#7f1d1d" stroke-width="3"/>
        <circle cx="74" cy="74" r="2.5" fill="#fef08a"/>
        <circle cx="86" cy="74" r="2.5" fill="#fef08a"/>
        <path d="M77 80 Q80 83 83 80" stroke="#fef08a" stroke-width="1.5" fill="none"/>
      </g>
    `
  }),

  // --- CELEBRATION ---
  'party_popper': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,110 50,125 90,85 75,75" fill="#fbbf24" stroke="#ca8a04" stroke-width="3"/>
        <polygon points="55,95 70,80 80,90 65,105" fill="#ef4444"/>
        <!-- Confetti explosion -->
        <circle cx="95" cy="65" r="4" fill="#38bdf8"/>
        <circle cx="110" cy="50" r="5" fill="#ec4899"/>
        <circle cx="125" cy="65" r="4" fill="#4ade80"/>
        <circle cx="105" cy="80" r="3.5" fill="#facc15"/>
        <circle cx="85" cy="50" r="3" fill="#a855f7"/>
        <!-- Streamers -->
        <path d="M85 70 Q105 45 125 55" stroke="#f43f5e" stroke-width="2.5" fill="none"/>
        <path d="M95 85 Q120 75 130 90" stroke="#3b82f6" stroke-width="2.5" fill="none"/>
      </g>
    `
  }),
  'party_cake': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Candle -->
        <rect x="78" y="38" width="4" height="18" fill="#38bdf8"/>
        <ellipse cx="80" cy="34" rx="3" ry="5" fill="#facc15"/>
        <!-- Cake Slice -->
        <polygon points="45,95 115,65 125,75 55,115" fill="#f472b6" stroke="#db2777" stroke-width="2.5"/>
        <polygon points="45,95 55,115 55,130 45,115" fill="#ec4899"/>
        <polygon points="55,115 125,75 125,90 55,130" fill="#fbcfe8" stroke="#db2777" stroke-width="2"/>
        <circle cx="85" cy="98" r="3" fill="#831843"/>
        <circle cx="102" cy="90" r="3" fill="#831843"/>
        <path d="M90 102 Q94 106 98 102" stroke="#831843" stroke-width="2" fill="none"/>
      </g>
    `
  }),

  // --- EMOTIONAL ---
  'emotional_tissues': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="42" y="70" width="76" height="52" rx="10" fill="#60a5fa" stroke="#1d4ed8" stroke-width="3"/>
        <ellipse cx="80" cy="70" rx="26" ry="8" fill="#3b82f6"/>
        <!-- Tissue sticking out -->
        <path d="M68 70 Q75 42 85 46 Q92 52 88 70 Z" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
        <!-- Face on box -->
        <circle cx="66" cy="92" r="3" fill="#ffffff"/>
        <circle cx="94" cy="92" r="3" fill="#ffffff"/>
        <path d="M76 102 Q80 98 84 102" stroke="#ffffff" stroke-width="2" fill="none"/>
        <!-- Big tear rolling down -->
        <path d="M64 96 C62 104 66 112 64 115" stroke="#93c5fd" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>
    `
  }),
  'emotional_rain': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Storm cloud -->
        <ellipse cx="80" cy="45" rx="36" ry="18" fill="#475569" stroke="#1e293b" stroke-width="2.5"/>
        <line x1="65" y1="62" x2="60" y2="74" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="80" y1="64" x2="75" y2="76" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="95" y1="62" x2="90" y2="74" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Sad face -->
        <circle cx="80" cy="100" r="30" fill="#94a3b8" stroke="#334155" stroke-width="2.5"/>
        <path d="M68 96 L76 96" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M84 96 L92 96" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M74 112 Q80 106 86 112" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>
    `
  }),

  // --- KAWAII ---
  'kawaii_teddy': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Ears -->
        <circle cx="54" cy="54" r="14" fill="#f472b6" stroke="#be185d" stroke-width="2.5"/>
        <circle cx="54" cy="54" r="7" fill="#fbcfe8"/>
        <circle cx="106" cy="54" r="14" fill="#f472b6" stroke="#be185d" stroke-width="2.5"/>
        <circle cx="106" cy="54" r="7" fill="#fbcfe8"/>
        <!-- Head -->
        <circle cx="80" cy="85" r="38" fill="#f472b6" stroke="#be185d" stroke-width="3"/>
        <ellipse cx="80" cy="92" rx="14" ry="10" fill="#ffffff"/>
        <circle cx="68" cy="82" r="3.5" fill="#4c0519"/>
        <circle cx="92" cy="82" r="3.5" fill="#4c0519"/>
        <circle cx="66" cy="80" r="1.5" fill="#ffffff"/>
        <circle cx="90" cy="80" r="1.5" fill="#ffffff"/>
        <polygon points="80,90 77,87 83,87" fill="#be185d"/>
        <path d="M76 93 Q80 96 84 93" stroke="#4c0519" stroke-width="1.5" fill="none"/>
        <circle cx="58" cy="88" r="5" fill="#fb7185" opacity="0.6"/>
        <circle cx="102" cy="88" r="5" fill="#fb7185" opacity="0.6"/>
      </g>
    `
  }),
  'kawaii_dino': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <!-- Back spikes -->
        <polygon points="50,60 40,50 48,70" fill="#f59e0b"/>
        <polygon points="44,75 34,68 44,85" fill="#f59e0b"/>
        <!-- Dino Head & Body -->
        <circle cx="85" cy="80" r="38" fill="#4ade80" stroke="#15803d" stroke-width="3"/>
        <ellipse cx="105" cy="86" rx="16" ry="12" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
        <circle cx="82" cy="74" r="3.5" fill="#052e16"/>
        <circle cx="80" cy="72" r="1.5" fill="#ffffff"/>
        <path d="M102 88 Q108 92 114 88" stroke="#052e16" stroke-width="2" fill="none"/>
        <circle cx="80" cy="82" r="4" fill="#f43f5e" opacity="0.6"/>
      </g>
    `
  }),

  // --- CRAZY / FUN ---
  'crazy_hyped': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#a3e635" stroke="#4d7c0f" stroke-width="3"/>
        <!-- Spiral Hypno Eyes -->
        <circle cx="62" cy="72" r="12" fill="#ffffff" stroke="#15803d" stroke-width="2"/>
        <path d="M62 64 A 8 8 0 1 1 56 74" fill="none" stroke="#15803d" stroke-width="2.5"/>
        <circle cx="98" cy="72" r="12" fill="#ffffff" stroke="#15803d" stroke-width="2"/>
        <path d="M98 64 A 8 8 0 1 1 92 74" fill="none" stroke="#15803d" stroke-width="2.5"/>
        <!-- Screaming open mouth with party horn -->
        <ellipse cx="80" cy="98" rx="16" ry="14" fill="#7f1d1d"/>
        <!-- Horn -->
        <polygon points="80,98 128,105 125,115 80,105" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <text x="35" y="32" font-family="sans-serif" font-weight="900" font-size="16" fill="#65a30d">HYPED!</text>
      </g>
    `
  }),
  'crazy_derp': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
        <!-- Goofy Cross Eyes -->
        <circle cx="62" cy="72" r="10" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="68" cy="72" r="4" fill="#000000"/>
        <circle cx="98" cy="72" r="10" fill="#ffffff" stroke="#78350f" stroke-width="2"/>
        <circle cx="92" cy="72" r="4" fill="#000000"/>
        <!-- Big Wavy Tongue Out -->
        <path d="M65 92 Q80 92 95 92" stroke="#78350f" stroke-width="3"/>
        <path d="M72 92 Q70 120 80 122 Q90 120 88 92" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
        <line x1="80" y1="94" x2="80" y2="114" stroke="#991b1b" stroke-width="1.5"/>
      </g>
    `
  })
};

// ----------------------------------------------------
// 21 STICKER PACK DEFINITIONS
// ----------------------------------------------------
export const ALL_PACKS_CONFIG = [
  {
    id: 'pack_cute_coffee',
    name: 'Cute Coffee Cups',
    category: '☕ Cute & Cozy',
    description: 'Steaming mugs, cozy sips, and morning smiles to kickstart your conversations.',
    creator_name: 'CozyCraft',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 2410,
    icon_key: 'coffee_happy',
    stickers: [
      { key: 'coffee_happy', name: 'Happy Coffee', tags: 'happy, coffee, smile, cute, warm, joy, morning' },
      { key: 'coffee_sad', name: 'Sad Coffee', tags: 'sad, coffee, frown, down, blue, unhappy, bummer' },
      { key: 'coffee_angry', name: 'Angry Coffee', tags: 'angry, coffee, mad, rage, grump, burn, steam, hot' },
      { key: 'coffee_sleepy', name: 'Sleepy Coffee', tags: 'sleepy, coffee, zzz, tired, nap, cozy, bed, rest' },
      { key: 'coffee_excited', name: 'Excited Coffee', tags: 'excited, coffee, hyper, yay, star, hype, happy, energetic' },
      { key: 'coffee_love', name: 'Love Coffee', tags: 'love, coffee, heart, sweet, latte, romance, kiss, affection' },
      { key: 'coffee_laughing', name: 'Laughing Coffee', tags: 'laughing, coffee, lol, haha, hilarious, giggle, comedy, joy' },
      { key: 'coffee_bored', name: 'Bored Coffee', tags: 'bored, coffee, meh, whatever, dull, waiting, unamused' },
      { key: 'coffee_shocked', name: 'Shocked Coffee', tags: 'shocked, coffee, omg, whoa, surprise, gasp, wow' },
      { key: 'coffee_crying', name: 'Crying Coffee', tags: 'crying, coffee, sob, tears, sad, bawling, emotional, weep' },
      { key: 'coffee_goodmorning', name: 'Good Morning Coffee', tags: 'good morning, coffee, sunrise, morning, wakeup, sun, breakfast' },
      { key: 'coffee_goodnight', name: 'Good Night Coffee', tags: 'good night, coffee, decaf, moon, stars, bedtime, cozy, sleep' },
      { key: 'coffee_confused', name: 'Confused Coffee', tags: 'confused, coffee, question, huh, what, cafe' },
      { key: 'coffee_scared', name: 'Scared Coffee', tags: 'scared, coffee, iced, freeze, shudder, fear' },
      { key: 'coffee_thankyou', name: 'Thank You Coffee', tags: 'thank-you, thanks, grateful, cafe, gratitude, coffee' },
      { key: 'coffee_sorry', name: 'Sorry Coffee', tags: 'sorry, coffee, oops, spill, apologize, forgive' },
      { key: 'coffee_yes', name: 'Yes Coffee', tags: 'yes, coffee, approve, agree, check, ok, thumbsup' },
      { key: 'coffee_no', name: 'No Coffee', tags: 'no, coffee, nope, refuse, decaf, deny' },
      { key: 'coffee_good', name: 'Good Coffee', tags: 'good, coffee, great, delicious, perfect, nice, okay' },
      { key: 'coffee_bad', name: 'Bad Coffee', tags: 'bad, coffee, bitter, awful, dislike, gross, terrible' },
      { key: 'coffee_greeting', name: 'Greeting Coffee', tags: 'greeting, coffee, hello, hi, wave, morning, hey' },
      { key: 'coffee_celebration', name: 'Celebration Coffee', tags: 'celebration, coffee, party, confetti, yay, celebrate, birthday' }
    ]
  },
  {
    id: 'pack_tea_friends',
    name: 'Little Tea Friends',
    category: '☕ Cute & Cozy',
    description: 'Sweet boba bears, matcha cats, and calming herbal infusions for your chats.',
    creator_name: 'BobaStudio',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 1820,
    icon_key: 'tea_happy',
    stickers: [
      ...make22Stickers('tea', 'Boba Bear', 'tea, boba, drink, cute, cozy'),
      { key: 'tea_boba_bear', name: 'Boba Bear', tags: 'boba, bubble tea, bear, sweet, cute, treat' },
      { key: 'tea_matcha_cat', name: 'Matcha Cat', tags: 'matcha, green tea, cat, zen, peaceful, chill' },
      { key: 'tea_chai_bunny', name: 'Chai Bunny', tags: 'chai, spice, bunny, rabbit, warm, cozy' },
      { key: 'tea_honey_lemon', name: 'Honey Lemon Tea', tags: 'honey, lemon, fresh, healing, feel better' }
    ]
  },
  {
    id: 'pack_sweet_bakery',
    name: 'Sweet Bakery',
    category: '☕ Cute & Cozy',
    description: 'Golden croissants, fluffy pancakes, and sprinkled sweet treats fresh out the oven.',
    creator_name: 'SugarPuff',
    is_featured: 0,
    is_popular: 0,
    is_new: 1,
    downloads_count: 940,
    icon_key: 'bakery_happy',
    stickers: [
      ...make22Stickers('bakery', 'Sweet Bakery', 'bakery, croissant, pastry, sweet, cozy'),
      { key: 'bakery_croissant', name: 'Croissant Smile', tags: 'bakery, croissant, bread, happy, breakfast, french' },
      { key: 'bakery_pancake', name: 'Pancake Stack', tags: 'pancake, syrup, brunch, yummy, hungry, butter' },
      { key: 'bakery_donut', name: 'Donut Wink', tags: 'donut, sprinkles, wink, flirty, sweet, pastry' },
      { key: 'bakery_cinnamon', name: 'Cinnamon Roll Hug', tags: 'cinnamon roll, warm, hug, love, sweet, dessert' }
    ]
  },
  {
    id: 'pack_cat_vibes',
    name: 'Cat Vibes',
    category: '☕ Cute & Cozy',
    description: 'Calico kitties, cozy purrs, and playful feline moods.',
    creator_name: 'Elena',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 2150,
    icon_key: 'catvibe_happy',
    stickers: make22Stickers('catvibe', 'Calico Cat', 'cat, calico, kitty, cute, cozy, meow')
  },
  {
    id: 'pack_dev_life',
    name: 'Dev Life',
    category: '☕ Cute & Cozy',
    description: 'Code, coffee, bugs, and Friday deployments for engineers.',
    creator_name: 'Marcus',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 3240,
    icon_key: 'dev_happy',
    stickers: make22Stickers('dev', 'Dev Laptop', 'dev, code, programmer, laptop, tech, coffee')
  },
  {
    id: 'pack_anime_emotions',
    name: 'Anime Emotions',
    category: '🎌 Anime',
    description: 'Dramatic waterfall tears, blazing fury eyes, sparkle gazes, and menacing auras.',
    creator_name: 'ShonenArt',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 5320,
    icon_key: 'anime_sparkle',
    stickers: [
      { key: 'anime_happy', name: 'Anime Happy Joy', tags: 'happy, joy, smile, anime, cheerful, kawaii' },
      { key: 'anime_smile', name: 'Anime Soft Smile', tags: 'smile, friendly, anime, sweet, warm, cheerful' },
      { key: 'anime_laugh', name: 'Anime Laugh ROFL', tags: 'laugh, lol, haha, anime, funny, comedy, rofl' },
      { key: 'anime_sad', name: 'Anime Melancholy Sad', tags: 'sad, depressed, anime, gloomy, sorrow, blue' },
      { key: 'anime_cry', name: 'Anime Waterfall Cry', tags: 'cry, sob, waterfall, anime, dramatic, sad' },
      { key: 'anime_fire', name: 'Angry Fire Eyes', tags: 'angry, rage, fire, fury, anime, mad' },
      { key: 'anime_bored', name: 'Anime Deadpan Bored', tags: 'bored, meh, whatever, anime, unamused, dull' },
      { key: 'anime_blush', name: 'Anime Shy Blush', tags: 'love, blush, shy, cute, anime, flustered' },
      { key: 'anime_shock', name: 'Shocked Face', tags: 'shock, omg, white eyes, anime, disbelief' },
      { key: 'anime_confused', name: 'Anime Confused Spiral', tags: 'confused, spiral, question, anime, huh, what' },
      { key: 'anime_sleepy', name: 'Anime Snot Snore Sleepy', tags: 'sleepy, tired, anime, snore, zzz, nap' },
      { key: 'anime_sparkle', name: 'Sparkle Eyes Excited', tags: 'excited, sparkle, amazed, hype, wow, anime' },
      { key: 'anime_scared', name: 'Anime Terrified Ghost', tags: 'scared, ghost, fear, panic, anime, horror, terrified' },
      { key: 'anime_thankyou', name: 'Anime Bow Thank You', tags: 'thank-you, thanks, arigato, anime, grateful, bow, prayer' },
      { key: 'anime_sorry', name: 'Anime Dogeza Sorry', tags: 'sorry, gomen, anime, apologize, forgive, dogeza' },
      { key: 'anime_yes', name: 'Anime Confident Yes', tags: 'yes, thumbsup, agree, confirm, anime, approve, ok' },
      { key: 'anime_no', name: 'Anime Crossed X No', tags: 'no, reject, anime, refuse, deny, x, stop, dame' },
      { key: 'anime_good', name: 'Anime Peace Sign Good', tags: 'good, peace, great, awesome, anime, perfect, nice' },
      { key: 'anime_bad', name: 'Anime Dread Face Bad', tags: 'bad, awful, dread, failure, anime, terrible, miss' },
      { key: 'anime_greeting', name: 'Anime Wave Greeting', tags: 'greeting, hello, hi, anime, wave, hey, konnichiwa' },
      { key: 'anime_celebration', name: 'Anime Party Celebration', tags: 'celebration, party, anime, congrats, yay, celebrate, win' },
      { key: 'anime_goodmorning', name: 'Anime Good Morning', tags: 'goodmorning, morning, sunrise, wakeup, sun, anime, ohayo' },
      { key: 'anime_goodnight', name: 'Anime Good Night', tags: 'goodnight, night, bedtime, sleep, moon, anime, oyasumi' },
      { key: 'anime_sweat', name: 'Sweat Drop Awkward', tags: 'sweat, awkward, nervous, oops, anime, embarrassed' },
      { key: 'anime_menacing', name: 'Menacing Aura', tags: 'menacing, jojo, evil, shadow, anime, intense' },
      { key: 'anime_smirk', name: 'Evil Smirk', tags: 'smirk, evil, smug, hehe, anime, scheming' }
    ]
  },
  {
    id: 'pack_ninja_buddies',
    name: 'Ninja Buddies',
    category: '🎌 Anime',
    description: 'Stealthy shinobi, smoke escapes, and flying shurikens ready for action.',
    creator_name: 'KageClan',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 1450,
    icon_key: 'ninja_happy',
    stickers: [
      ...make22Stickers('ninja', 'Ninja', 'ninja, shinobi, anime, stealth'),
      { key: 'ninja_sneaky', name: 'Sneaky Ninja', tags: 'ninja, stealth, sneaky, spy, quiet, hide' },
      { key: 'ninja_smokebomb', name: 'Smoke Bomb Escape', tags: 'smoke, poof, vanish, bye, escape, peace out' },
      { key: 'ninja_shuriken', name: 'Shuriken Toss', tags: 'shuriken, weapon, attack, fight, sharp, star' },
      { key: 'ninja_peace', name: 'Ninja Peace Sign', tags: 'peace, victory, cool, ninja, win, salute' }
    ]
  },
  {
    id: 'pack_cute_warrior',
    name: 'Cute Warrior',
    category: '🎌 Anime',
    description: 'Tiny knight champions poking swords, defending friends, and leveling up.',
    creator_name: 'Knightling',
    is_featured: 0,
    is_popular: 0,
    is_new: 1,
    downloads_count: 880,
    icon_key: 'warrior_happy',
    stickers: [
      ...make22Stickers('warrior', 'Cute Warrior', 'warrior, knight, sword, anime, champion'),
      { key: 'warrior_swordpoke', name: 'Sword Poke', tags: 'sword, poke, tease, fight, attack, knight' },
      { key: 'warrior_shield', name: 'Shield Block', tags: 'shield, defend, armor, block, safe, protect' },
      { key: 'warrior_levelup', name: 'Level Up!', tags: 'level up, victory, exp, power, glow, upgrade' },
      { key: 'warrior_victory', name: 'Victory Pose', tags: 'win, victory, champion, cheer, sword, proud' }
    ]
  },
  {
    id: 'pack_real_cat',
    name: 'Real Cat',
    category: '🐱 Animals',
    description: 'Curious stares, cozy loafs, begging paws, and cardboard box fits.',
    creator_name: 'WhiskersLab',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 4890,
    icon_key: 'cat_curious',
    stickers: [
      { key: 'cat_curious', name: 'Curious Cat Stare', tags: 'cat, stare, watch, curious, what, feline' },
      { key: 'cat_happy', name: 'Happy Cat Purr', tags: 'happy, purr, cat, cheerful, joy, feline' },
      { key: 'cat_smile', name: 'Smiling Cat Smirk', tags: 'smile, cat, sweet, cute, grin, feline' },
      { key: 'cat_laugh', name: 'Laughing Cat Giggle', tags: 'laugh, lol, haha, cat, funny, giggling' },
      { key: 'cat_sad', name: 'Sad Teary Cat', tags: 'sad, cat, heartbroken, lonely, teary' },
      { key: 'cat_cry', name: 'Crying Cat Tears', tags: 'cry, sob, cat, weeping, sad, tears' },
      { key: 'cat_angry', name: 'Angry Hissing Cat', tags: 'angry, hiss, mad, cat, rage, spicy' },
      { key: 'cat_bored', name: 'Bored Yawning Cat', tags: 'bored, yawn, cat, sleepy, whatever, lazy' },
      { key: 'cat_love', name: 'Cat In Love Heart Eyes', tags: 'love, heart, cat, affection, romantic, adore' },
      { key: 'cat_shock', name: 'Shocked Cat Gasp', tags: 'shock, gasp, cat, surprised, omg, disbelief' },
      { key: 'cat_confused', name: 'Confused Cat Head Tilt', tags: 'confused, huh, cat, tilted, question, what' },
      { key: 'cat_sleepy', name: 'Sleepy Cat Napping', tags: 'sleepy, sleep, cat, nap, cozy, zzz' },
      { key: 'cat_excited', name: 'Excited Pouncing Cat', tags: 'excited, pounce, cat, hype, play, energy' },
      { key: 'cat_scared', name: 'Scared Spiky Cat', tags: 'scared, spooky, fear, cat, jump, terrified' },
      { key: 'cat_thankyou', name: 'Thank You Cat Paws', tags: 'thank-you, thanks, paws, cat, grateful, bless' },
      { key: 'cat_sorry', name: 'Sorry Guilty Cat', tags: 'sorry, guilt, forgive, cat, oops, apologize' },
      { key: 'cat_yes', name: 'Yes Cat High Paw', tags: 'yes, paw, approve, cat, ok, agree, thumbsup' },
      { key: 'cat_no', name: 'No Cat Paw Swat', tags: 'no, push, swat, cat, refuse, nope, stop' },
      { key: 'cat_good', name: 'Good Purrfect Cat', tags: 'good, tasty, purrfect, cat, great, perfect' },
      { key: 'cat_bad', name: 'Bad Grumpy Cat', tags: 'bad, grumpy, dislike, cat, frown, thumbsdown' },
      { key: 'cat_greeting', name: 'Greeting Paw Wave Cat', tags: 'greeting, wave, hello, cat, hi, meow' },
      { key: 'cat_celebration', name: 'Celebration Party Cat', tags: 'celebration, party, hat, cat, birthday, yay' },
      { key: 'cat_goodmorning', name: 'Cat Good Morning', tags: 'goodmorning, morning, sunrise, wakeup, sun, cat, meow' },
      { key: 'cat_goodnight', name: 'Cat Good Night', tags: 'goodnight, night, bedtime, sleep, moon, cat, purr' },
      { key: 'cat_loaf', name: 'Sleeping Loaf', tags: 'cat, loaf, sleep, cozy, purr, nap' },
      { key: 'cat_begging', name: 'Paws Up Begging', tags: 'cat, beg, please, paws, cute, innocent' },
      { key: 'cat_box', name: 'Cardboard Box Cat', tags: 'cat, box, fits, sits, comfy, hiding' }
    ]
  },
  {
    id: 'pack_real_puppy',
    name: 'Real Puppy',
    category: '🐱 Animals',
    description: 'Floppy ears, puppy dog eyes, wagging tails, and stick fetchers.',
    creator_name: 'BarkPaws',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 3720,
    icon_key: 'puppy_happy',
    stickers: [
      ...make22Stickers('puppy', 'Puppy', 'puppy, dog, cute, pet, bark'),
      { key: 'puppy_eyes', name: 'Puppy Eyes', tags: 'dog, puppy, eyes, please, beg, cute' },
      { key: 'puppy_wag', name: 'Tail Wagging', tags: 'dog, happy, tail, wag, excited, good boy' },
      { key: 'puppy_stick', name: 'Stick Catch', tags: 'dog, stick, fetch, play, proud, trophy' },
      { key: 'puppy_confusion', name: 'Tilted Head Confusion', tags: 'dog, confuse, question, tilted, what, huh' }
    ]
  },
  {
    id: 'pack_real_bunny',
    name: 'Real Bunny',
    category: '🐱 Animals',
    description: 'Soft nose wiggles, ear flops, and crunchy carrots from joyful rabbits.',
    creator_name: 'HopHops',
    is_featured: 0,
    is_popular: 0,
    is_new: 1,
    downloads_count: 1120,
    icon_key: 'bunny_happy',
    stickers: [
      ...make22Stickers('bunny', 'Bunny', 'bunny, rabbit, cute, pet, hops'),
      { key: 'bunny_nose', name: 'Nose Wiggle', tags: 'bunny, rabbit, wiggle, nose, cute, hello' },
      { key: 'bunny_carrot', name: 'Carrot Munch', tags: 'bunny, carrot, nom, munch, food, hungry' }
    ]
  },
  {
    id: 'pack_panda_buddy',
    name: 'Panda Buddy',
    category: '🐱 Animals',
    description: 'Round and clumsy pandas chewing bamboo stalks and rolling in circles.',
    creator_name: 'BambooGrove',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 2650,
    icon_key: 'panda_happy',
    stickers: [
      ...make22Stickers('panda', 'Panda', 'panda, bamboo, animal, cute, bear'),
      { key: 'panda_bamboo', name: 'Bamboo Chew', tags: 'panda, bamboo, nom, food, chill, hungry' },
      { key: 'panda_roll', name: 'Rolling Panda', tags: 'panda, roll, clumsy, tumble, fun, bounce' }
    ]
  },
  {
    id: 'pack_funny_frog',
    name: 'Funny Frog',
    category: '😂 Funny',
    description: 'Sipping tea, dramatic screaming, and the ultimate facepalms.',
    creator_name: 'MemeToad',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 6120,
    icon_key: 'frog_happy',
    stickers: [
      ...make22Stickers('frog', 'Frog', 'frog, funny, meme'),
      { key: 'frog_siptea', name: 'Frog Sip Tea', tags: 'frog, tea, drama, shade, gossip, sipping' },
      { key: 'frog_scream', name: 'Frog Screaming', tags: 'frog, scream, panic, help, ahhh, chaos' },
      { key: 'frog_facepalm', name: 'Frog Facepalm', tags: 'frog, facepalm, dumb, why, smh, done' }
    ]
  },
  {
    id: 'pack_sleepy_bear',
    name: 'Sleepy Bear',
    category: '😂 Funny',
    description: 'Bed burrito snuggles, alarm clock smashing, and refusing to wake up.',
    creator_name: 'HibernationLab',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 2980,
    icon_key: 'bear_happy',
    stickers: [
      ...make22Stickers('bear', 'Sleepy Bear', 'bear, cozy, funny, sleep, snooze'),
      { key: 'bear_burrito', name: 'Bed Burrito', tags: 'bear, blanket, burrito, cozy, warm, sleep' },
      { key: 'bear_alarm', name: 'Alarm Clock Smash', tags: 'bear, alarm, smash, morning, anger, destroy' }
    ]
  },
  {
    id: 'pack_ghost_buddy',
    name: 'Ghost Buddy',
    category: '✨ Fantasy',
    description: 'Spooky little sheets floating around giving ghostly hugs and happy boos.',
    creator_name: 'SpookTales',
    is_featured: 1,
    is_popular: 1,
    is_new: 1,
    downloads_count: 1430,
    icon_key: 'ghost_happy',
    stickers: [
      ...make22Stickers('ghost', 'Ghost', 'ghost, spooky, cute, fantasy'),
      { key: 'ghost_boo', name: 'Friendly Boo', tags: 'ghost, boo, cute, spook, surprise, halloween' },
      { key: 'ghost_hug', name: 'Ghost Hug', tags: 'ghost, hug, love, sweet, floating, warm' }
    ]
  },
  {
    id: 'pack_tiny_robot',
    name: 'Tiny Robot',
    category: '✨ Fantasy',
    description: 'Cute retro androids suffering from 404 brain errors and beeping hearts.',
    creator_name: 'RoboBytes',
    is_featured: 0,
    is_popular: 0,
    is_new: 1,
    downloads_count: 1050,
    icon_key: 'robot_happy',
    stickers: [
      ...make22Stickers('robot', 'Tiny Robot', 'robot, droid, tech, fantasy, beep'),
      { key: 'robot_404', name: 'Error 404 Brain Not Found', tags: 'robot, error, 404, glitch, confusion, tech' },
      { key: 'robot_heart', name: 'Robot Love Heart', tags: 'robot, beep, love, heart, sweet, tech' }
    ]
  },
  {
    id: 'pack_lovely_couple',
    name: 'Lovely Couple',
    category: '💕 Love & Romance',
    description: 'Forehead kisses, hand holding, and heartfelt sweet moments for partners.',
    creator_name: 'Heartstrings',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 3410,
    icon_key: 'couple_happy',
    stickers: [
      ...make22Stickers('couple', 'Lovely Couple', 'couple, love, romance, sweet, hearts'),
      { key: 'couple_kiss', name: 'Forehead Kiss', tags: 'kiss, couple, sweet, love, romantic, care' },
      { key: 'couple_hands', name: 'Holding Hands Forever', tags: 'hands, together, love, forever, bond, couple' }
    ]
  },
  {
    id: 'pack_heart_buddy',
    name: 'Heart Buddy',
    category: '💕 Love & Romance',
    description: 'Exploding with love, healing with bandages, and sending affection across screens.',
    creator_name: 'CupidWorks',
    is_featured: 0,
    is_popular: 1,
    is_new: 0,
    downloads_count: 2890,
    icon_key: 'heart_exploding',
    stickers: [
      { key: 'heart_happy', name: 'Happy Dancing Heart', tags: 'happy, smile, heart, joy, sweet, cheerful' },
      { key: 'heart_smile', name: 'Warm Smiling Heart', tags: 'smile, heart, friendly, tender, cute' },
      { key: 'heart_laugh', name: 'Laughing Joy Heart', tags: 'laugh, haha, heart, funny, joy, lol' },
      { key: 'heart_sad', name: 'Melancholic Sad Heart', tags: 'sad, melancholic, heart, sorrow, lonely' },
      { key: 'heart_cry', name: 'Crying Heart Puddle', tags: 'cry, sob, heart, weeping, pain, tears' },
      { key: 'heart_angry', name: 'Angry Pouting Heart', tags: 'angry, tsundere, mad, pout, heart, rage' },
      { key: 'heart_bored', name: 'Bored Idle Heart', tags: 'bored, dull, heart, whatever, idle' },
      { key: 'heart_exploding', name: 'Heart Exploding Love', tags: 'love, heart, explode, overload, wow, romance' },
      { key: 'heart_shock', name: 'Shocked Heart Zap', tags: 'shock, gasp, surprised, heart, zap, spark' },
      { key: 'heart_confused', name: 'Confused Question Heart', tags: 'confused, question, heart, huh, wonder, what' },
      { key: 'heart_sleepy', name: 'Sleepy Dreaming Heart', tags: 'sleepy, zzz, heart, dream, cozy, nap' },
      { key: 'heart_excited', name: 'Excited Sparkling Heart', tags: 'excited, spark, heart, fireworks, hype' },
      { key: 'heart_scared', name: 'Scared Trembling Heart', tags: 'scared, shiver, fear, heart, spooky' },
      { key: 'heart_thankyou', name: 'Thank You Heart Letter', tags: 'thank-you, thanks, grateful, love, letter, bless' },
      { key: 'heart_sorry', name: 'Sorry Apology Heart', tags: 'sorry, apologize, forgive, flower, heart, oops' },
      { key: 'heart_yes', name: 'Yes Approved Heart', tags: 'yes, agree, true, heart, accept, love, thumbsup' },
      { key: 'heart_no', name: 'No Shield Heart', tags: 'no, deny, boundary, heart, reject, nope' },
      { key: 'heart_good', name: 'Good Perfect Heart', tags: 'good, wonderful, best, heart, nice, perfect' },
      { key: 'heart_bad', name: 'Bad Stormy Heart', tags: 'bad, gloomy, hurts, heart, down, storm' },
      { key: 'heart_greeting', name: 'Greeting Waving Heart', tags: 'greeting, hello, hi, wave, heart, welcome' },
      { key: 'heart_celebration', name: 'Celebration Confetti Heart', tags: 'celebration, party, congrats, celebrate, heart, yay' },
      { key: 'heart_goodmorning', name: 'Heart Good Morning', tags: 'goodmorning, morning, sunrise, wakeup, sun, heart, sweet' },
      { key: 'heart_goodnight', name: 'Heart Good Night', tags: 'goodnight, night, bedtime, sleep, moon, heart, dreams' },
      { key: 'heart_bandage', name: 'Broken Heart Bandage', tags: 'heart, broken, heal, bandage, sad, hurt' }
    ]
  },
  {
    id: 'pack_pizza_friends',
    name: 'Pizza Friends',
    category: '🍔 Food',
    description: 'Melting mozzarella, crispy crusts, and warm cheesy slice hugs.',
    creator_name: 'SliceLife',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 2310,
    icon_key: 'pizza_happy',
    stickers: [
      ...make22Stickers('pizza', 'Pizza', 'pizza, food, yummy'),
      { key: 'pizza_slicehug', name: 'Slice Hug', tags: 'pizza, cheese, hug, friendship, cheesy, food' },
      { key: 'pizza_cheese', name: 'Melting Cheese Smile', tags: 'pizza, melt, cheese, stretch, yummy, delicious' }
    ]
  },
  {
    id: 'pack_ramen_buddy',
    name: 'Ramen Buddy',
    category: '🍔 Food',
    description: 'Slurping curly noodles and spicy hot broth that clears your sinuses.',
    creator_name: 'NoodleCraft',
    is_featured: 0,
    is_popular: 0,
    is_new: 1,
    downloads_count: 1740,
    icon_key: 'ramen_happy',
    stickers: [
      ...make22Stickers('ramen', 'Ramen', 'ramen, noodles, food, yummy, soup'),
      { key: 'ramen_slurp', name: 'Slurping Noodles', tags: 'ramen, slurp, noodles, delicious, soup, food' },
      { key: 'ramen_spicy', name: 'Spicy Hot Soup', tags: 'ramen, spicy, hot, sweat, fire, soup, ramen' }
    ]
  },
  {
    id: 'pack_donut_friend',
    name: 'Donut Friend',
    category: '🍔 Food',
    description: 'Sprinkle confetti showers and shocked bitten pastries full of flavor.',
    creator_name: 'GlazeBakery',
    is_featured: 0,
    is_popular: 0,
    is_new: 0,
    downloads_count: 1200,
    icon_key: 'donut_happy',
    stickers: [
      ...make22Stickers('donut', 'Donut', 'donut, pastry, dessert, sweet, glaze'),
      { key: 'donut_sprinkles', name: 'Sprinkle Shower', tags: 'donut, sprinkles, sweet, dessert, celebration' },
      { key: 'donut_bitten', name: 'Bitten Donut Shock', tags: 'donut, bite, shock, ouch, pastry, funny' }
    ]
  },
  {
    id: 'pack_game_boy',
    name: 'Game Boy',
    category: '🎮 Gaming',
    description: 'Retro handheld consoles, 8-bit game over screens, and victory trophies.',
    creator_name: 'PixelGuild',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 4210,
    icon_key: 'game_controller',
    stickers: [
      { key: 'game_happy', name: 'Pixel Hero Winner', tags: 'happy, pixel, retro, 8bit, win, gaming, joy' },
      { key: 'game_smile', name: 'Slime Happy Smile', tags: 'smile, cute, slime, gaming, friendly, 8bit' },
      { key: 'game_laugh', name: '8-Bit Boss Laugh', tags: 'laugh, lol, haha, boss, 8bit, gaming, haha' },
      { key: 'game_sad', name: '0 HP Broken Heart', tags: 'sad, broken, heart, retro, gaming, hurt, sorrow' },
      { key: 'game_cry', name: 'Pixel Waterfall Cry', tags: 'cry, sob, fail, gaming, 8bit, tears, sad' },
      { key: 'game_angry', name: 'Ragequit Snap', tags: 'angry, ragequit, mad, broken, gaming, salty, rage' },
      { key: 'game_bored', name: 'Player AFK Snooze', tags: 'bored, afk, idle, sleep, gaming, waiting, meh' },
      { key: 'game_love', name: '+1 Extra Life Heart', tags: 'love, heart, 1up, romance, gaming, pixel, life' },
      { key: 'game_shock', name: 'Alert Exclamation Mark', tags: 'shock, alert, caught, metalgear, gaming, exclamation, omg' },
      { key: 'game_confused', name: 'Pixel Question Block', tags: 'confused, question, huh, puzzle, gaming, mystery, what' },
      { key: 'game_sleepy', name: 'Low Battery Sleep Mode', tags: 'sleepy, low battery, recharge, tired, gaming, zzz' },
      { key: 'game_excited', name: 'Combo Bonus x99', tags: 'excited, critical, combo, hype, gaming, bonus, win' },
      { key: 'game_scared', name: 'Arcade Ghost Run', tags: 'scared, ghost, run, danger, gaming, pac, fear' },
      { key: 'game_thankyou', name: 'GG WP Thank You', tags: 'thank-you, gg, wp, respect, gaming, goodgame, thanks' },
      { key: 'game_sorry', name: 'Miss Shot Sorry', tags: 'sorry, miss, mybad, fail, gaming, oops, respawn' },
      { key: 'game_yes', name: 'Press Start Ready Yes', tags: 'yes, start, ok, ready, gaming, accept, approve' },
      { key: 'game_no', name: 'Game Over Denied No', tags: 'no, gameover, deny, lose, gaming, skull, nope' },
      { key: 'game_good', name: 'S-Rank Gold Trophy Good', tags: 'good, srank, perfect, winner, gold, gaming, nice' },
      { key: 'game_bad', name: 'F-Rank Fail Bad', tags: 'bad, fail, frank, loser, gaming, trash, awful' },
      { key: 'game_greeting', name: 'Player 1 Ready Greeting', tags: 'greeting, p1, ready, hello, join, gaming, wave' },
      { key: 'game_celebration', name: 'Championship Trophy Celebration', tags: 'celebration, trophy, win, champion, celebrate, gaming, yay' },
      { key: 'game_goodmorning', name: 'Game Good Morning', tags: 'goodmorning, morning, sunrise, wakeup, sun, gaming, start' },
      { key: 'game_goodnight', name: 'Game Good Night', tags: 'goodnight, night, bedtime, sleep, moon, gaming, save' },
      { key: 'game_controller', name: 'Button Mash Winner', tags: 'game, buttons, mash, controller, win, gamer' },
      { key: 'game_over', name: 'Game Over Screen', tags: 'game over, lose, fail, sad, restart, retro' },
      { key: 'pixel_slime', name: 'Pixel Slime Bounce', tags: 'slime, monster, rpg, cute, pixel, gaming' }
    ]
  },
  {
    id: 'pack_reaction_face',
    name: 'Reaction Face & Meme',
    category: '😎 Meme / Reactions',
    description: 'The definitive collection of facepalms, mind-blowns, suspicious squints, and popcorn munchers.',
    creator_name: 'PulseMemes',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 8940,
    icon_key: 'meme_mindblown',
    stickers: [
      { key: 'meme_happy', name: 'Overjoyed Radiant Grin', tags: 'happy, joy, smile, meme, wow, awesome, cheerful' },
      { key: 'meme_smile', name: 'Wholesome Gentle Smile', tags: 'smile, wholesome, grin, meme, warm, friendly' },
      { key: 'meme_laugh', name: 'ROFL Wheezing Laugh', tags: 'laugh, lol, haha, lmao, wheeze, meme, rofl, comedy' },
      { key: 'meme_sad', name: 'Depresso Rainy Sad', tags: 'sad, gloom, depresso, meme, heartbreak, sorrow, blue' },
      { key: 'meme_crythumbsup', name: "I'm Fine Thumbs Up Cry", tags: 'cry, fine, thumbs up, pain, hide the pain, smile, sob' },
      { key: 'meme_angry', name: 'Table Flip Rage', tags: 'angry, rage, tableflip, furious, mad, meme, fury' },
      { key: 'meme_bored', name: 'Eye Roll Whatever Bored', tags: 'bored, eye roll, whatever, duh, annoyed, idc, unamused' },
      { key: 'meme_love', name: 'Simp Heart Eyes Love', tags: 'love, adore, heart, crush, meme, romantic, simp' },
      { key: 'meme_mindblown', name: 'Mind Blown Explosion Shock', tags: 'shock, mind blown, explosion, galaxy brain, whoa, omg' },
      { key: 'meme_confused', name: 'Math Formula Confusion', tags: 'confused, math, what, huh, meme, calculate, question' },
      { key: 'meme_sleepy', name: 'Knocked Out Sleepy ZZZ', tags: 'sleepy, tired, knockout, meme, exhausted, zzz, nap' },
      { key: 'meme_excited', name: "Let's Gooo Hype Excited", tags: 'excited, hype, letsgo, screaming, meme, amazed, wow' },
      { key: 'meme_scared', name: 'Sweating Panic Scared', tags: 'scared, sweat, panic, terror, horror, meme, fear' },
      { key: 'meme_thankyou', name: 'Respectful Salute Thank You', tags: 'thank-you, thanks, salute, respect, grateful, meme, gratitude' },
      { key: 'meme_sorry', name: 'Puppy Eyes My Bad Sorry', tags: 'sorry, forgive, oops, mybad, regret, meme, apology' },
      { key: 'meme_yes', name: 'Gigachad Nod Yes', tags: 'yes, agree, based, gigachad, approve, meme, nod, thumbsup' },
      { key: 'meme_no', name: 'Big Red Nope No', tags: 'no, nope, denied, reject, cancel, meme, stop' },
      { key: 'meme_good', name: "Chef's Kiss 100 Good", tags: 'good, great, chefs kiss, perfect, 100, meme, awesome' },
      { key: 'meme_bad', name: 'Disgusted Trash Bad', tags: 'bad, trash, dislike, thumbsdown, gross, meme, awful' },
      { key: 'meme_greeting', name: 'Hayyy Wave Greeting', tags: 'greeting, hello, hey, wave, greetings, meme, hi' },
      { key: 'meme_celebration', name: 'Champagne Victory Celebration', tags: 'celebration, party, champagne, winner, victory, meme, yay' },
      { key: 'meme_goodmorning', name: 'Meme Good Morning', tags: 'goodmorning, morning, sunrise, wakeup, sun, meme, chad' },
      { key: 'meme_goodnight', name: 'Meme Good Night', tags: 'goodnight, night, bedtime, sleep, moon, meme' },
      { key: 'meme_facepalm', name: 'Facepalm Sigh', tags: 'facepalm, smh, why, idiot, sigh, done' },
      { key: 'meme_squint', name: 'Suspicious Squint', tags: 'suspicious, squint, doubt, sus, fry, looking' },
      { key: 'meme_popcorn', name: 'Popcorn Drama Munch', tags: 'popcorn, drama, watching, tea, cinema, gossip' },
      { key: 'meme_shrug', name: 'Shrug IDK', tags: 'shrug, idk, whatever, dunno, lol, care' }
    ]
  },
  {
    id: 'pack_rainbow_chibi',
    name: 'Chibi Rainbow Sparkles',
    category: '🌈 Cute Characters',
    description: 'Floating pastel rainbow clouds and twinkling celestial stars full of pure joy.',
    creator_name: 'RainbowStudio',
    is_featured: 1,
    is_popular: 1,
    is_new: 1,
    downloads_count: 3120,
    icon_key: 'cloud_happy',
    stickers: [
      ...make22Stickers('cloud', 'Rainbow Cloud', 'rainbow, cloud, pastel, cute, character'),
      { key: 'rainbow_cloud', name: 'Rainbow Cloud Bliss', tags: 'rainbow, cloud, pastel, happy, cute, dream' },
      { key: 'rainbow_star', name: 'Golden Star Sparkle', tags: 'star, sparkle, gold, cute, shine, magic' }
    ]
  },
  {
    id: 'pack_midnight_aesthetic',
    name: 'Midnight Lofi Aesthetic',
    category: '🌙 Aesthetic',
    description: 'Crescent moons, vaporwave sunsets, and retro lo-fi chill cassette tapes.',
    creator_name: 'LofiChill',
    is_featured: 1,
    is_popular: 1,
    is_new: 1,
    downloads_count: 2840,
    icon_key: 'moon_happy',
    stickers: [
      ...make22Stickers('moon', 'Lofi Moon', 'moon, night, dreamy, aesthetic, lofi, stars'),
      { key: 'aesthetic_moon', name: 'Dreamy Crescent Moon', tags: 'moon, night, dreamy, stars, sleepy, aesthetic' },
      { key: 'aesthetic_cassette', name: 'Retro Chill Cassette', tags: 'cassette, tape, music, retro, vaporwave, aesthetic' }
    ]
  },
  {
    id: 'pack_spooky_autumn',
    name: 'Spooky Autumn Vibes',
    category: '🎃 Seasonal',
    description: 'Glowing jack-o-lanterns and crisp golden maple leaves for cozy spooky seasons.',
    creator_name: 'AutumnHollow',
    is_featured: 1,
    is_popular: 1,
    is_new: 1,
    downloads_count: 1980,
    icon_key: 'pumpkin_happy',
    stickers: [
      ...make22Stickers('pumpkin', 'Pumpkin', 'pumpkin, halloween, spooky, autumn, cute, seasonal'),
      { key: 'seasonal_pumpkin', name: 'Glowing Pumpkin Smile', tags: 'pumpkin, halloween, spooky, autumn, cute, orange' },
      { key: 'seasonal_leaf', name: 'Crisp Maple Leaf', tags: 'leaf, autumn, fall, maple, cozy, seasonal' }
    ]
  },
  {
    id: 'pack_celebration_party',
    name: 'Party Time & Popper',
    category: '🎉 Celebration',
    description: 'Bursting confetti poppers and multi-tier birthday cakes with glowing candles.',
    creator_name: 'FiestaCrew',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 4620,
    icon_key: 'party_happy',
    stickers: [
      ...make22Stickers('party', 'Party Buddy', 'party, celebration, congrats, birthday, popper, yay'),
      { key: 'party_popper', name: 'Party Popper Blast', tags: 'party, popper, confetti, celebrate, congrats, yay' },
      { key: 'party_cake', name: 'Birthday Cake Slice', tags: 'cake, birthday, candle, celebrate, sweet, dessert' }
    ]
  },
  {
    id: 'pack_dramatic_feelings',
    name: 'Dramatic Tears & Feelings',
    category: '😭 Emotional',
    description: 'Endless tissue boxes and sobbing rain clouds for peak emotional rollercoaster moments.',
    creator_name: 'MoodSwings',
    is_featured: 1,
    is_popular: 1,
    is_new: 1,
    downloads_count: 2470,
    icon_key: 'rain_happy',
    stickers: [
      ...make22Stickers('rain', 'Dramatic Cloud', 'cloud, rain, sad, cry, emotional, tears, feelings'),
      { key: 'emotional_tissues', name: 'Tissue Box Sob', tags: 'tissues, cry, sob, sad, tears, emotional' },
      { key: 'emotional_rain', name: 'Melodramatic Rain Cloud', tags: 'cloud, rain, sad, crying, gloom, weather' }
    ]
  },
  {
    id: 'pack_kawaii_plushies',
    name: 'Kawaii Plushie Pals',
    category: '🧸 Kawaii',
    description: 'Blushing teddy bears and huggable green baby dino plushies with button eyes.',
    creator_name: 'PlushieHaven',
    is_featured: 1,
    is_popular: 1,
    is_new: 0,
    downloads_count: 5120,
    icon_key: 'teddy_happy',
    stickers: [
      ...make22Stickers('teddy', 'Teddy Bear', 'teddy, bear, plush, cute, hug, kawaii'),
      { key: 'kawaii_teddy', name: 'Blushing Teddy Bear', tags: 'teddy, bear, plush, cute, hug, kawaii' },
      { key: 'kawaii_dino', name: 'Baby Dino Plush', tags: 'dino, dinosaur, plush, cute, kawaii, roar' }
    ]
  },
  {
    id: 'pack_crazy_energy',
    name: 'Chaotic Energy & Derp',
    category: '🤪 Crazy / Fun',
    description: 'Maximum hyped overdrive and cross-eyed blep derp faces for wild moments.',
    creator_name: 'ChaosRealm',
    is_featured: 1,
    is_popular: 1,
    is_new: 1,
    downloads_count: 3790,
    icon_key: 'crazy_happy',
    stickers: [
      ...make22Stickers('crazy', 'Crazy Derp', 'hyped, screaming, excited, crazy, energy, wild, derp'),
      { key: 'crazy_hyped', name: 'Hyped Energy Overdrive', tags: 'hyped, screaming, excited, crazy, energy, wild' },
      { key: 'crazy_derp', name: 'Cross-eyed Derp Blep', tags: 'derp, blep, goofy, funny, silly, tongue, dumb' }
    ]
  }
];

/**
 * Main seeding function
 */
export async function seedStickersLibrary() {
  console.log('🎨 Generating sticker SVG assets and seeding Sticker Store...');
  const now = new Date().toISOString();

  // 1. Generate all SVGs
  const stickerUrls = {};
  for (const [key, genFn] of Object.entries(STICKER_SVGS)) {
    const filename = `${key}.svg`;
    stickerUrls[key] = ensureSvg(filename, genFn());
  }

  // 2. Insert or update packs
  for (const pack of ALL_PACKS_CONFIG) {
    const iconUrl = stickerUrls[pack.icon_key] || stickerUrls[pack.stickers[0].key];

    const existingPack = await queryOne('SELECT id FROM sticker_packs WHERE id = ?', [pack.id]);
    if (!existingPack) {
      await run(
        `INSERT INTO sticker_packs (
          id, name, description, category, cover_image, icon_url, creator_name,
          is_system, is_featured, is_popular, is_new, downloads_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
        [
          pack.id,
          pack.name,
          pack.description,
          pack.category,
          iconUrl,
          iconUrl,
          pack.creator_name,
          pack.is_featured,
          pack.is_popular,
          pack.is_new,
          pack.downloads_count,
          now,
          now
        ]
      );
    } else {
      await run(
        `UPDATE sticker_packs SET
          name = ?, description = ?, category = ?, cover_image = ?, icon_url = ?,
          creator_name = ?, is_featured = ?, is_popular = ?, is_new = ?, downloads_count = ?, updated_at = ?
         WHERE id = ?`,
        [
          pack.name,
          pack.description,
          pack.category,
          iconUrl,
          iconUrl,
          pack.creator_name,
          pack.is_featured,
          pack.is_popular,
          pack.is_new,
          pack.downloads_count,
          now,
          pack.id
        ]
      );
    }

    // Insert stickers for this pack
    for (let i = 0; i < pack.stickers.length; i++) {
      const s = pack.stickers[i];
      const sId = `${pack.id}_${s.key}`;
      const imgUrl = stickerUrls[s.key];

      const existingSticker = await queryOne('SELECT id FROM stickers WHERE id = ?', [sId]);
      if (!existingSticker) {
        await run(
          `INSERT INTO stickers (id, pack_id, image_url, name, tags, animated, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
          [sId, pack.id, imgUrl, s.name, s.tags, i, now]
        );
      } else {
        await run(
          `UPDATE stickers SET image_url = ?, name = ?, tags = ?, sort_order = ? WHERE id = ?`,
          [imgUrl, s.name, s.tags, i, sId]
        );
      }
    }

    // Clean up any old stickers for this pack that are no longer in config
    const currentKeys = pack.stickers.map((s) => `${pack.id}_${s.key}`);
    const placeholders = currentKeys.map(() => '?').join(',');
    await run(`DELETE FROM stickers WHERE pack_id = ? AND id NOT IN (${placeholders})`, [pack.id, ...currentKeys]);
  }

  // 3. Auto-install default 4 starter packs for existing users if they have none
  const defaultStarterPacks = [
    'pack_cute_coffee',
    'pack_real_cat',
    'pack_reaction_face',
    'pack_funny_frog'
  ];

  const users = await query('SELECT id FROM users');
  for (const u of users) {
    const installed = await query('SELECT COUNT(*) as count FROM user_sticker_packs WHERE user_id = ?', [u.id]);
    if (!installed[0] || installed[0].count === 0) {
      for (let idx = 0; idx < defaultStarterPacks.length; idx++) {
        const pId = defaultStarterPacks[idx];
        await run(
          `INSERT OR IGNORE INTO user_sticker_packs (id, user_id, pack_id, sort_order, added_at)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), u.id, pId, idx, now]
        );
      }
    }
  }

  // 4. Seed a few recents and favorites for 'usr_ayan' so the composer is full and lively
  const ayanUser = await queryOne('SELECT id FROM users WHERE id = ?', ['usr_ayan']);
  if (ayanUser) {
    const demoRecents = [
      'pack_reaction_face_meme_mindblown',
      'pack_cute_coffee_coffee_happy',
      'pack_real_cat_cat_curious',
      'pack_funny_frog_frog_siptea'
    ];
    for (const stId of demoRecents) {
      const stk = await queryOne('SELECT id FROM stickers WHERE id = ?', [stId]);
      if (stk) {
        await run(
          `INSERT OR IGNORE INTO recent_stickers (id, user_id, sticker_id, last_used_at)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), 'usr_ayan', stk.id, now]
        );
        await run(
          `INSERT OR IGNORE INTO favorite_stickers (id, user_id, sticker_id, created_at)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), 'usr_ayan', stk.id, now]
        );
      }
    }
  }

  persistDb();
  console.log(`✅ Successfully seeded 28 sticker packs and SVGs into library!`);
}
