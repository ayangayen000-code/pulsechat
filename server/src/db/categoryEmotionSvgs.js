/**
 * Category-specific 22 Reaction Face SVG Generators
 * Covers all 22 core reaction faces matching Cute Coffee Cups:
 * happy, sad, angry, sleepy, excited, love, laugh, bored, shock, cry,
 * goodmorning, goodnight, confused, scared, thankyou, sorry, yes, no,
 * good, bad, greeting, celebration
 */

function generateSvg({ bg = 'none', elements = '', defs = '' }) {
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
// SHARED EXPRESSION RENDERER HELPERS
// ----------------------------------------------------
function getExpressionElements(type, cx = 80, cy = 80) {
  switch (type) {
    case 'happy':
      return `
        <circle cx="${cx - 16}" cy="${cy}" r="3.5" fill="#f43f5e" opacity="0.6"/>
        <circle cx="${cx + 16}" cy="${cy}" r="3.5" fill="#f43f5e" opacity="0.6"/>
        <path d="M${cx - 14} ${cy - 8} Q${cx - 8} ${cy - 14} ${cx - 2} ${cy - 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 8} Q${cx + 8} ${cy - 14} ${cx + 14} ${cy - 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 9} ${cy} Q${cx} ${cy + 10} ${cx + 9} ${cy}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="#f43f5e"/>
        <polygon points="${cx + 24},${cy - 24} ${cx + 26},${cy - 18} ${cx + 32},${cy - 16} ${cx + 26},${cy - 14} ${cx + 24},${cy - 8} ${cx + 22},${cy - 14} ${cx + 16},${cy - 16} ${cx + 22},${cy - 18}" fill="#facc15"/>
      `;
    case 'sad':
      return `
        <path d="M${cx - 14} ${cy - 6} Q${cx - 8} ${cy - 10} ${cx - 2} ${cy - 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 8} Q${cx + 8} ${cy - 10} ${cx + 14} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="${cx - 8}" cy="${cy - 2}" r="3.5" fill="#1e293b"/>
        <circle cx="${cx + 8}" cy="${cy - 2}" r="3.5" fill="#1e293b"/>
        <path d="M${cx - 8} ${cy + 8} Q${cx} ${cy + 2} ${cx + 8} ${cy + 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 12} ${cy + 4} C${cx - 15} ${cy + 4} ${cx - 16} ${cy + 7} ${cx - 14} ${cy + 10} C${cx - 12} ${cy + 12} ${cx - 9} ${cy + 12} ${cx - 8} ${cy + 10} C${cx - 6} ${cy + 7} ${cx - 9} ${cy + 4} ${cx - 12} ${cy + 4} Z" fill="#38bdf8"/>
      `;
    case 'angry':
      return `
        <line x1="${cx - 14}" y1="${cy - 12}" x2="${cx - 2}" y2="${cy - 6}" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="${cx + 14}" y1="${cy - 12}" x2="${cx + 2}" y2="${cy - 6}" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="${cx - 8}" cy="${cy - 2}" r="3" fill="#1e293b"/>
        <circle cx="${cx + 8}" cy="${cy - 2}" r="3" fill="#1e293b"/>
        <path d="M${cx - 8} ${cy + 7} L${cx - 4} ${cy + 5} L${cx} ${cy + 7} L${cx + 4} ${cy + 5} L${cx + 8} ${cy + 7}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 20} ${cy - 22} L${cx + 28} ${cy - 22} M${cx + 24} ${cy - 26} L${cx + 24} ${cy - 18} M${cx + 21} ${cy - 25} L${cx + 27} ${cy - 19}" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
      `;
    case 'sleepy':
      return `
        <path d="M${cx - 14} ${cy - 4} Q${cx - 8} ${cy} ${cx - 2} ${cy - 4}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 4} Q${cx + 8} ${cy} ${cx + 14} ${cy - 4}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="${cx}" cy="${cy + 5}" rx="3" ry="2" fill="#1e293b"/>
        <text x="${cx + 16}" y="${cy - 12}" font-family="sans-serif" font-weight="900" font-size="11" fill="#8b5cf6">Z</text>
        <text x="${cx + 22}" y="${cy - 20}" font-family="sans-serif" font-weight="900" font-size="14" fill="#a855f7">Z</text>
        <text x="${cx + 30}" y="${cy - 28}" font-family="sans-serif" font-weight="900" font-size="18" fill="#c084fc">z</text>
      `;
    case 'excited':
      return `
        <polygon points="${cx - 8},${cy - 14} ${cx - 6},${cy - 8} ${cx},${cy - 7} ${cx - 5},${cy - 4} ${cx - 7},${cy + 2} ${cx - 10},${cy - 3} ${cx - 15},${cy - 2} ${cx - 11},${cy - 7} ${cx - 13},${cy - 12} ${cx - 8},${cy - 9}" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
        <polygon points="${cx + 8},${cy - 14} ${cx + 10},${cy - 8} ${cx + 16},${cy - 7} ${cx + 11},${cy - 4} ${cx + 9},${cy + 2} ${cx + 6},${cy - 3} ${cx + 1},${cy - 2} ${cx + 5},${cy - 7} ${cx + 3},${cy - 12} ${cx + 8},${cy - 9}" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
        <ellipse cx="${cx}" cy="${cy + 7}" rx="8" ry="6" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
        <circle cx="${cx - 18}" cy="${cy}" r="4" fill="#f43f5e" opacity="0.6"/>
        <circle cx="${cx + 18}" cy="${cy}" r="4" fill="#f43f5e" opacity="0.6"/>
        <circle cx="${cx + 24}" cy="${cy - 22}" r="3" fill="#f59e0b"/>
        <circle cx="${cx - 24}" cy="${cy - 22}" r="2" fill="#3b82f6"/>
      `;
    case 'love':
      return `
        <path d="M${cx - 12} ${cy - 12} C${cx - 18} ${cy - 18} ${cx - 24} ${cy - 10} ${cx - 12} ${cy - 2} C${cx} ${cy - 10} ${cx - 6} ${cy - 18} ${cx - 12} ${cy - 12} Z" fill="#ef4444"/>
        <path d="M${cx + 12} ${cy - 12} C${cx + 6} ${cy - 18} ${cx} ${cy - 10} ${cx + 12} ${cy - 2} C${cx + 24} ${cy - 10} ${cx + 18} ${cy - 18} ${cx + 12} ${cy - 12} Z" fill="#ef4444"/>
        <path d="M${cx - 6} ${cy + 5} Q${cx} ${cy + 12} ${cx + 6} ${cy + 5}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="${cx - 16}" cy="${cy + 3}" r="3.5" fill="#f43f5e" opacity="0.6"/>
        <circle cx="${cx + 16}" cy="${cy + 3}" r="3.5" fill="#f43f5e" opacity="0.6"/>
      `;
    case 'laugh':
      return `
        <path d="M${cx - 14} ${cy - 6} L${cx - 8} ${cy - 10} L${cx - 2} ${cy - 6}" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 6} L${cx + 8} ${cy - 10} L${cx + 14} ${cy - 6}" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 10} ${cy + 2} Q${cx} ${cy + 16} ${cx + 10} ${cy + 2} Z" fill="#f43f5e" stroke="#1e293b" stroke-width="2.5"/>
        <path d="M${cx - 18} ${cy - 2} Q${cx - 24} ${cy} ${cx - 22} ${cy + 5} Q${cx - 18} ${cy + 4} ${cx - 18} ${cy - 2} Z" fill="#38bdf8"/>
        <path d="M${cx + 18} ${cy - 2} Q${cx + 24} ${cy} ${cx + 22} ${cy + 5} Q${cx + 18} ${cy + 4} ${cx + 18} ${cy - 2} Z" fill="#38bdf8"/>
      `;
    case 'bored':
      return `
        <line x1="${cx - 14}" y1="${cy - 6}" x2="${cx - 2}" y2="${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${cx - 10}" cy="${cy - 3}" r="2.5" fill="#1e293b"/>
        <line x1="${cx + 2}" y1="${cy - 6}" x2="${cx + 14}" y2="${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${cx + 6}" cy="${cy - 3}" r="2.5" fill="#1e293b"/>
        <line x1="${cx - 7}" y1="${cy + 6}" x2="${cx + 7}" y2="${cy + 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <text x="${cx + 18}" y="${cy - 14}" font-family="sans-serif" font-weight="900" font-size="12" fill="#64748b">...</text>
      `;
    case 'shock':
      return `
        <circle cx="${cx - 9}" cy="${cy - 6}" r="6" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <circle cx="${cx - 9}" cy="${cy - 6}" r="2" fill="#1e293b"/>
        <circle cx="${cx + 9}" cy="${cy - 6}" r="6" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <circle cx="${cx + 9}" cy="${cy - 6}" r="2" fill="#1e293b"/>
        <ellipse cx="${cx}" cy="${cy + 8}" rx="6" ry="9" fill="#0f172a"/>
        <text x="${cx + 18}" y="${cy - 18}" font-family="sans-serif" font-weight="900" font-size="18" fill="#ef4444">!!</text>
      `;
    case 'cry':
      return `
        <circle cx="${cx - 8}" cy="${cy - 4}" r="3" fill="#1e293b"/>
        <circle cx="${cx + 8}" cy="${cy - 4}" r="3" fill="#1e293b"/>
        <path d="M${cx - 8} ${cy + 10} Q${cx} ${cy + 4} ${cx + 8} ${cy + 10}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 10} ${cy - 2} Q${cx - 14} ${cy + 14} ${cx - 12} ${cy + 24}" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 10} ${cy - 2} Q${cx + 14} ${cy + 14} ${cx + 12} ${cy + 24}" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" fill="none"/>
      `;
    case 'goodmorning':
      return `
        <circle cx="${cx}" cy="${cy - 28}" r="12" fill="#facc15" stroke="#eab308" stroke-width="2"/>
        <line x1="${cx}" y1="${cy - 44}" x2="${cx}" y2="${cy - 41}" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${cx - 14}" y1="${cy - 36}" x2="${cx - 11}" y2="${cy - 34}" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${cx + 14}" y1="${cy - 36}" x2="${cx + 11}" y2="${cy - 34}" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M${cx - 14} ${cy - 8} Q${cx - 8} ${cy - 14} ${cx - 2} ${cy - 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="${cx + 8}" cy="${cy - 8}" r="3.5" fill="#1e293b"/>
        <path d="M${cx - 7} ${cy + 2} Q${cx} ${cy + 8} ${cx + 7} ${cy + 2}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <rect x="${cx - 26}" y="${cy + 18}" width="52" height="14" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#a16207" text-anchor="middle">MORNING ☀️</text>
      `;
    case 'goodnight':
      return `
        <path d="M${cx + 20} ${cy - 36} A 10 10 0 1 0 ${cx + 24} ${cy - 20} A 8 8 0 0 1 ${cx + 20} ${cy - 36} Z" fill="#facc15"/>
        <path d="M${cx - 14} ${cy - 4} Q${cx - 8} ${cy} ${cx - 2} ${cy - 4}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 4} Q${cx + 8} ${cy} ${cx + 14} ${cy - 4}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 5} ${cy + 4} Q${cx} ${cy + 7} ${cx + 5} ${cy + 4}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <polygon points="${cx - 18},${cy - 28} ${cx - 16},${cy - 24} ${cx - 12},${cy - 23} ${cx - 15},${cy - 21} ${cx - 14},${cy - 17} ${cx - 18},${cy - 20} ${cx - 22},${cy - 17} ${cx - 21},${cy - 21} ${cx - 24},${cy - 23} ${cx - 20},${cy - 24}" fill="#facc15"/>
        <rect x="${cx - 24}" y="${cy + 18}" width="48" height="14" rx="5" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#c7d2fe" text-anchor="middle">NIGHT 🌙</text>
      `;
    case 'confused':
      return `
        <circle cx="${cx - 9}" cy="${cy - 6}" r="3" fill="#1e293b"/>
        <circle cx="${cx + 9}" cy="${cy - 4}" r="5" fill="#1e293b"/>
        <path d="M${cx - 7} ${cy + 6} Q${cx} ${cy + 2} ${cx + 7} ${cy + 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="${cx + 16}" y="${cy - 18}" font-family="sans-serif" font-weight="900" font-size="20" fill="#f59e0b">?</text>
      `;
    case 'scared':
      return `
        <circle cx="${cx - 9}" cy="${cy - 6}" r="6" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <circle cx="${cx - 9}" cy="${cy - 6}" r="2" fill="#1e293b"/>
        <circle cx="${cx + 9}" cy="${cy - 6}" r="6" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <circle cx="${cx + 9}" cy="${cy - 6}" r="2" fill="#1e293b"/>
        <path d="M${cx - 9} ${cy + 8} Q${cx} ${cy + 4} ${cx + 9} ${cy + 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 24} ${cy - 14} L${cx - 20} ${cy - 10} M${cx - 26} ${cy} L${cx - 22} ${cy + 4} M${cx + 24} ${cy - 14} L${cx + 20} ${cy - 10} M${cx + 26} ${cy} L${cx + 22} ${cy + 4}" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      `;
    case 'thankyou':
      return `
        <path d="M${cx - 14} ${cy - 8} Q${cx - 8} ${cy - 14} ${cx - 2} ${cy - 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 8} Q${cx + 8} ${cy - 14} ${cx + 14} ${cy - 8}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 6} ${cy + 2} Q${cx} ${cy + 7} ${cx + 6} ${cy + 2}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="${cx - 26}" y="${cy + 18}" width="52" height="15" rx="5" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#b45309" text-anchor="middle">THANKS! 🙏</text>
      `;
    case 'sorry':
      return `
        <circle cx="${cx - 8}" cy="${cy - 4}" r="4.5" fill="#1e293b"/>
        <circle cx="${cx - 9}" cy="${cy - 6}" r="1.5" fill="#ffffff"/>
        <circle cx="${cx + 8}" cy="${cy - 4}" r="4.5" fill="#1e293b"/>
        <circle cx="${cx + 7}" cy="${cy - 6}" r="1.5" fill="#ffffff"/>
        <path d="M${cx - 6} ${cy + 6} Q${cx} ${cy + 2} ${cx + 6} ${cy + 6}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="${cx - 24}" y="${cy + 18}" width="48" height="15" rx="5" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#475569" text-anchor="middle">SORRY! 🥺</text>
      `;
    case 'yes':
      return `
        <path d="M${cx - 12} ${cy - 6} Q${cx - 6} ${cy - 12} ${cx} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 6} Q${cx + 8} ${cy - 12} ${cx + 14} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 7} ${cy + 2} Q${cx} ${cy + 8} ${cx + 7} ${cy + 2}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="${cx + 22}" cy="${cy + 16}" r="13" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
        <path d="M${cx + 17} ${cy + 16} L${cx + 20} ${cy + 20} L${cx + 27} ${cy + 12}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      `;
    case 'no':
      return `
        <line x1="${cx - 12}" y1="${cy - 10}" x2="${cx - 2}" y2="${cy - 4}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <line x1="${cx + 12}" y1="${cy - 10}" x2="${cx + 2}" y2="${cy - 4}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <line x1="${cx - 8}" y1="${cy + 6}" x2="${cx + 8}" y2="${cy + 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${cx + 22}" cy="${cy + 16}" r="13" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
        <line x1="${cx + 17}" y1="${cy + 11}" x2="${cx + 27}" y2="${cy + 21}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${cx + 27}" y1="${cy + 11}" x2="${cx + 17}" y2="${cy + 21}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      `;
    case 'good':
      return `
        <path d="M${cx - 12} ${cy - 6} Q${cx - 6} ${cy - 12} ${cx} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 6} Q${cx + 8} ${cy - 12} ${cx + 14} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx - 6} ${cy + 2} Q${cx} ${cy + 7} ${cx + 6} ${cy + 2}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="${cx - 26}" y="${cy + 18}" width="52" height="15" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#a16207" text-anchor="middle">GOOD! 👌</text>
      `;
    case 'bad':
      return `
        <circle cx="${cx - 8}" cy="${cy - 4}" r="3" fill="#1e293b"/>
        <circle cx="${cx + 8}" cy="${cy - 4}" r="3" fill="#1e293b"/>
        <path d="M${cx - 8} ${cy + 6} Q${cx} ${cy + 2} ${cx + 8} ${cy + 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <rect x="${cx - 22}" y="${cy + 18}" width="44" height="15" rx="5" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#334155" text-anchor="middle">BAD! 👎</text>
      `;
    case 'greeting':
      return `
        <path d="M${cx - 12} ${cy - 6} Q${cx - 6} ${cy - 12} ${cx} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="${cx + 8}" cy="${cy - 6}" r="3" fill="#1e293b"/>
        <path d="M${cx - 6} ${cy + 2} Q${cx} ${cy + 8} ${cx + 6} ${cy + 2}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="${cx - 24}" y="${cy + 18}" width="48" height="15" rx="5" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
        <text x="${cx}" y="${cy + 29}" font-family="sans-serif" font-weight="900" font-size="9" fill="#4338ca" text-anchor="middle">HELLO! 👋</text>
      `;
    case 'celebration':
      return `
        <polygon points="${cx - 8},${cy - 28} ${cx},${cy - 48} ${cx + 8},${cy - 28}" fill="#ec4899" stroke="#be185d" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy - 48}" r="3" fill="#facc15"/>
        <path d="M${cx - 14} ${cy - 6} Q${cx - 8} ${cy - 12} ${cx - 2} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M${cx + 2} ${cy - 6} Q${cx + 8} ${cy - 12} ${cx + 14} ${cy - 6}" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="${cx}" cy="${cy + 4}" rx="8" ry="5" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
        <circle cx="${cx - 24}" cy="${cy - 30}" r="2.5" fill="#facc15"/>
        <circle cx="${cx + 24}" cy="${cy - 30}" r="2.5" fill="#38bdf8"/>
        <circle cx="${cx - 28}" cy="${cy - 10}" r="2" fill="#ec4899"/>
        <circle cx="${cx + 28}" cy="${cy - 10}" r="2" fill="#22c55e"/>
      `;
    default:
      return '';
  }
}

// ----------------------------------------------------
// 1. FUNNY FROG (22 REACTION FACES)
// ----------------------------------------------------
function makeFrogSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="frogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Frog Body & Big Eyes Top -->
        <circle cx="56" cy="52" r="16" fill="url(#frogGrad)" stroke="#15803d" stroke-width="3"/>
        <circle cx="104" cy="52" r="16" fill="url(#frogGrad)" stroke="#15803d" stroke-width="3"/>
        <ellipse cx="80" cy="85" rx="54" ry="42" fill="url(#frogGrad)" stroke="#15803d" stroke-width="3.5"/>
        <ellipse cx="80" cy="98" rx="34" ry="24" fill="#bbf7d0" opacity="0.8"/>
        ${getExpressionElements(emotion, 80, 78)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 2. CHIBI RAINBOW CLOUD (22 REACTION FACES)
// ----------------------------------------------------
function makeCloudSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f0f9ff"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Rainbow arch behind -->
        <path d="M30 110 A 55 55 0 0 1 130 110" stroke="#f43f5e" stroke-width="4" fill="none" opacity="0.4"/>
        <path d="M34 110 A 50 50 0 0 1 126 110" stroke="#facc15" stroke-width="4" fill="none" opacity="0.4"/>
        <path d="M38 110 A 45 45 0 0 1 122 110" stroke="#38bdf8" stroke-width="4" fill="none" opacity="0.4"/>
        <!-- Fluffy Cloud Body -->
        <circle cx="56" cy="80" r="24" fill="url(#cloudGrad)" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="104" cy="80" r="24" fill="url(#cloudGrad)" stroke="#38bdf8" stroke-width="2.5"/>
        <circle cx="80" cy="65" r="28" fill="url(#cloudGrad)" stroke="#38bdf8" stroke-width="2.5"/>
        <rect x="52" y="78" width="56" height="28" rx="14" fill="url(#cloudGrad)"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 3. PIZZA FRIENDS (22 REACTION FACES)
// ----------------------------------------------------
function makePizzaSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="cheeseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
      <linearGradient id="crustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Pizza Slice -->
        <path d="M32 45 Q80 32 128 45 L80 135 Z" fill="url(#cheeseGrad)" stroke="#ca8a04" stroke-width="3"/>
        <!-- Crust top -->
        <path d="M30 46 Q80 30 130 46 Q80 20 30 46 Z" fill="url(#crustGrad)" stroke="#78350f" stroke-width="2"/>
        <!-- Pepperonis -->
        <circle cx="58" cy="62" r="8" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <circle cx="102" cy="62" r="8" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        <circle cx="80" cy="112" r="7" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
        ${getExpressionElements(emotion, 80, 84)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 4. GHOST BUDDY (22 REACTION FACES)
// ----------------------------------------------------
function makeGhostSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#e0e7ff"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Ghost Sheet with Wavy Hem -->
        <path d="M40 85 C40 45 120 45 120 85 L120 120 Q110 112 100 120 Q90 112 80 120 Q70 112 60 120 Q50 112 40 120 Z" fill="url(#ghostGrad)" stroke="#a5b4fc" stroke-width="3"/>
        <!-- Little floating ghostly hands -->
        <ellipse cx="36" cy="88" rx="8" ry="5" fill="#ffffff" stroke="#a5b4fc" stroke-width="2"/>
        <ellipse cx="124" cy="88" rx="8" ry="5" fill="#ffffff" stroke="#a5b4fc" stroke-width="2"/>
        ${getExpressionElements(emotion, 80, 78)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 5. MIDNIGHT LOFI MOON (22 REACTION FACES)
// ----------------------------------------------------
function makeMoonSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#facc15"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Glowing Crescent Moon -->
        <path d="M96 28 C60 28 32 60 32 96 C32 132 60 144 96 144 C72 130 64 88 88 56 C96 46 102 38 96 28 Z" fill="url(#moonGrad)" stroke="#ca8a04" stroke-width="3"/>
        ${getExpressionElements(emotion, 66, 88)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 6. SPOOKY AUTUMN PUMPKIN (22 REACTION FACES)
// ----------------------------------------------------
function makePumpkinSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="pumpkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb923c"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Stem -->
        <rect x="74" y="28" width="12" height="20" rx="4" fill="#15803d" stroke="#14532d" stroke-width="2" transform="rotate(-6 80 38)"/>
        <!-- Pumpkin Ribs & Body -->
        <ellipse cx="50" cy="86" rx="28" ry="38" fill="url(#pumpkinGrad)" stroke="#c2410c" stroke-width="2.5"/>
        <ellipse cx="110" cy="86" rx="28" ry="38" fill="url(#pumpkinGrad)" stroke="#c2410c" stroke-width="2.5"/>
        <ellipse cx="80" cy="88" rx="34" ry="42" fill="url(#pumpkinGrad)" stroke="#c2410c" stroke-width="3"/>
        ${getExpressionElements(emotion, 80, 84)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 7. PARTY BUDDY (22 REACTION FACES)
// ----------------------------------------------------
function makePartySvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="partyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f472b6"/>
        <stop offset="100%" stop-color="#ec4899"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Party Popper Cone / Mascot Body -->
        <circle cx="80" cy="82" r="44" fill="url(#partyGrad)" stroke="#be185d" stroke-width="3"/>
        <!-- Confetti Burst around -->
        <polygon points="76,32 80,18 84,32" fill="#facc15"/>
        <circle cx="34" cy="48" r="4" fill="#38bdf8"/>
        <circle cx="126" cy="48" r="4" fill="#4ade80"/>
        <rect x="36" y="112" width="8" height="8" fill="#facc15" transform="rotate(25 40 116)"/>
        <rect x="116" y="112" width="8" height="8" fill="#a855f7" transform="rotate(-25 120 116)"/>
        ${getExpressionElements(emotion, 80, 82)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 8. DRAMATIC TEARS & RAIN (22 REACTION FACES)
// ----------------------------------------------------
function makeRainSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="rainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Storm Cloud Body -->
        <circle cx="56" cy="74" r="22" fill="url(#rainGrad)" stroke="#334155" stroke-width="2.5"/>
        <circle cx="104" cy="74" r="22" fill="url(#rainGrad)" stroke="#334155" stroke-width="2.5"/>
        <circle cx="80" cy="62" r="28" fill="url(#rainGrad)" stroke="#334155" stroke-width="2.5"/>
        <rect x="52" y="70" width="56" height="28" rx="12" fill="url(#rainGrad)"/>
        <!-- Droplets -->
        <ellipse cx="60" cy="116" rx="4" ry="8" fill="#38bdf8"/>
        <ellipse cx="80" cy="122" rx="4" ry="8" fill="#38bdf8"/>
        <ellipse cx="100" cy="116" rx="4" ry="8" fill="#38bdf8"/>
        ${getExpressionElements(emotion, 80, 74)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 9. KAWAII TEDDY BEAR (22 REACTION FACES)
// ----------------------------------------------------
function makeTeddySvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="bearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fcd34d"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Ears -->
        <circle cx="46" cy="50" r="16" fill="url(#bearGrad)" stroke="#b45309" stroke-width="3"/>
        <circle cx="46" cy="50" r="8" fill="#fecdd3"/>
        <circle cx="114" cy="50" r="16" fill="url(#bearGrad)" stroke="#b45309" stroke-width="3"/>
        <circle cx="114" cy="50" r="8" fill="#fecdd3"/>
        <!-- Head -->
        <circle cx="80" cy="85" r="44" fill="url(#bearGrad)" stroke="#b45309" stroke-width="3.5"/>
        <!-- Cream Muzzle -->
        <ellipse cx="80" cy="94" rx="16" ry="12" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
        <polygon points="76,89 84,89 80,94" fill="#78350f"/>
        ${getExpressionElements(emotion, 80, 78)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 10. CHAOTIC ENERGY & DERP (22 REACTION FACES)
// ----------------------------------------------------
function makeCrazySvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="derpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <!-- Chaotic Blob Head -->
        <path d="M42 65 C35 30 75 25 95 38 C120 30 135 60 128 90 C138 120 105 138 80 132 C55 138 25 115 32 85 Z" fill="url(#derpGrad)" stroke="#ca8a04" stroke-width="3.5"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

// ----------------------------------------------------
// EMOTIONS LIST
// ----------------------------------------------------
export const REACTION_EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'sleepy',
  'excited',
  'love',
  'laugh',
  'bored',
  'shock',
  'cry',
  'goodmorning',
  'goodnight',
  'confused',
  'scared',
  'thankyou',
  'sorry',
  'yes',
  'no',
  'good',
  'bad',
  'greeting',
  'celebration'
];

// Helper to build 22 stickers map for a prefix
function buildCharacterPack(prefix, makerFn) {
  const pack = {};
  for (const em of REACTION_EMOTIONS) {
    pack[`${prefix}_${em}`] = () => makerFn(em);
  }
  return pack;
}

export const FROG_EMOTION_SVGS = buildCharacterPack('frog', makeFrogSvg);
export const CLOUD_EMOTION_SVGS = buildCharacterPack('cloud', makeCloudSvg);
export const PIZZA_EMOTION_SVGS = buildCharacterPack('pizza', makePizzaSvg);
export const GHOST_EMOTION_SVGS = buildCharacterPack('ghost', makeGhostSvg);
export const MOON_EMOTION_SVGS = buildCharacterPack('moon', makeMoonSvg);
export const PUMPKIN_EMOTION_SVGS = buildCharacterPack('pumpkin', makePumpkinSvg);
export const PARTY_EMOTION_SVGS = buildCharacterPack('party', makePartySvg);
export const RAIN_EMOTION_SVGS = buildCharacterPack('rain', makeRainSvg);
export const TEDDY_EMOTION_SVGS = buildCharacterPack('teddy', makeTeddySvg);
export const CRAZY_EMOTION_SVGS = buildCharacterPack('crazy', makeCrazySvg);

// Additional morning/night faces for existing packs
export const EXTRA_EXISTING_PACK_SVGS = {
  // Anime
  'anime_goodmorning': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="38" r="14" fill="#facc15" stroke="#eab308" stroke-width="2"/>
        <circle cx="80" cy="85" r="42" fill="#fbcfe8" stroke="#db2777" stroke-width="3"/>
        <path d="M52 50 C60 40 100 40 108 50 C108 50 118 68 116 80 L112 70 L102 60 L92 72 L80 58 L68 72 L58 60 L48 70 L44 80 Z" fill="#9333ea"/>
        <path d="M62 82 Q70 76 78 82" stroke="#4a044e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <circle cx="94" cy="82" r="4.5" fill="#4a044e"/>
        <path d="M72 94 Q80 102 88 94" stroke="#4a044e" stroke-width="3" stroke-linecap="round" fill="#f43f5e"/>
        <rect x="52" y="106" width="56" height="15" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="80" y="117" font-family="sans-serif" font-weight="900" font-size="9" fill="#a16207" text-anchor="middle">OHAYO! ☀️</text>
      </g>
    `
  }),
  'anime_goodnight': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M106 32 C92 32 80 44 80 58 C80 72 92 84 106 84 C98 78 94 68 98 56 Z" fill="#facc15"/>
        <circle cx="80" cy="85" r="42" fill="#e0e7ff" stroke="#4338ca" stroke-width="3"/>
        <path d="M52 50 C60 40 100 40 108 50 C108 50 118 68 116 80 L112 70 L102 60 L92 72 L80 58 L68 72 L58 60 L48 70 L44 80 Z" fill="#312e81"/>
        <path d="M62 84 Q70 90 78 84" stroke="#1e1b4b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M86 84 Q94 90 102 84" stroke="#1e1b4b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <ellipse cx="80" cy="94" rx="3" ry="2" fill="#1e1b4b"/>
        <rect x="50" y="106" width="60" height="15" rx="5" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
        <text x="80" y="117" font-family="sans-serif" font-weight="900" font-size="9" fill="#c7d2fe" text-anchor="middle">OYASUMI 🌙</text>
      </g>
    `
  }),
  // Cat
  'cat_goodmorning': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="46,45 60,70 40,70" fill="#fed7aa" stroke="#c2410c" stroke-width="2.5"/>
        <polygon points="114,45 100,70 120,70" fill="#fed7aa" stroke="#c2410c" stroke-width="2.5"/>
        <ellipse cx="80" cy="86" rx="42" ry="36" fill="#fed7aa" stroke="#c2410c" stroke-width="3"/>
        <path d="M62 82 Q70 76 78 82" stroke="#7c2d12" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="94" cy="82" r="3.5" fill="#7c2d12"/>
        <ellipse cx="80" cy="90" rx="3" ry="2" fill="#f43f5e"/>
        <path d="M76 94 Q80 102 84 94" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" fill="#f43f5e"/>
        <line x1="42" y1="88" x2="62" y2="88" stroke="#7c2d12" stroke-width="2"/>
        <line x1="118" y1="88" x2="98" y2="88" stroke="#7c2d12" stroke-width="2"/>
        <rect x="52" y="108" width="56" height="15" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="80" y="119" font-family="sans-serif" font-weight="900" font-size="9" fill="#a16207" text-anchor="middle">MEOW-NING ☀️</text>
      </g>
    `
  }),
  'cat_goodnight': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <polygon points="46,45 60,70 40,70" fill="#cbd5e1" stroke="#475569" stroke-width="2.5"/>
        <polygon points="114,45 100,70 120,70" fill="#cbd5e1" stroke="#475569" stroke-width="2.5"/>
        <ellipse cx="80" cy="86" rx="42" ry="36" fill="#cbd5e1" stroke="#475569" stroke-width="3"/>
        <path d="M62 84 Q70 88 78 84" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M84 84 Q92 88 100 84" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="80" cy="90" rx="3" ry="2" fill="#1e293b"/>
        <text x="100" y="58" font-family="sans-serif" font-weight="900" font-size="12" fill="#6366f1">zZ</text>
        <rect x="52" y="108" width="56" height="15" rx="5" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
        <text x="80" y="119" font-family="sans-serif" font-weight="900" font-size="9" fill="#c7d2fe" text-anchor="middle">PURR NIGHT 🌙</text>
      </g>
    `
  }),
  // Heart
  'heart_goodmorning': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="28" r="12" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#fb7185" stroke="#e11d48" stroke-width="3"/>
        <path d="M62 68 Q68 62 74 68" stroke="#881337" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="94" cy="68" r="3.5" fill="#881337"/>
        <path d="M72 78 Q80 84 88 78" stroke="#881337" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="52" y="96" width="56" height="14" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="80" y="107" font-family="sans-serif" font-weight="900" font-size="9" fill="#a16207" text-anchor="middle">SUNSHINE ☀️</text>
      </g>
    `
  }),
  'heart_goodnight': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M106 32 C92 32 80 44 80 58 C80 72 92 84 106 84 C98 78 94 68 98 56 Z" fill="#facc15"/>
        <path d="M80 50 C65 25 30 35 30 65 C30 95 80 125 80 125 C80 125 130 95 130 65 C130 35 95 25 80 50 Z" fill="#818cf8" stroke="#4f46e5" stroke-width="3"/>
        <path d="M62 70 Q68 74 74 70" stroke="#312e81" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M86 70 Q92 74 98 70" stroke="#312e81" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="100" y="58" font-family="sans-serif" font-weight="900" font-size="12" fill="#facc15">zZ</text>
        <rect x="52" y="96" width="56" height="14" rx="5" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
        <text x="80" y="107" font-family="sans-serif" font-weight="900" font-size="9" fill="#c7d2fe" text-anchor="middle">SWEET DREAMS 🌙</text>
      </g>
    `
  }),
  // Meme
  'meme_goodmorning': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#fde047" stroke="#ca8a04" stroke-width="3"/>
        <!-- Sunglasses -->
        <path d="M50 68 L72 68 L68 84 L54 84 Z" fill="#000000"/>
        <path d="M88 68 L110 68 L106 84 L92 84 Z" fill="#000000"/>
        <line x1="72" y1="72" x2="88" y2="72" stroke="#000000" stroke-width="4"/>
        <!-- Big Smirk -->
        <path d="M68 96 Q80 108 94 94" stroke="#713f12" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <rect x="52" y="112" width="56" height="16" rx="5" fill="#ffffff" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="80" y="124" font-family="sans-serif" font-weight="900" font-size="9" fill="#a16207" text-anchor="middle">CHAD MORNING ☀️</text>
      </g>
    `
  }),
  'meme_goodnight': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="46" fill="#94a3b8" stroke="#475569" stroke-width="3"/>
        <line x1="56" y1="74" x2="72" y2="74" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
        <line x1="88" y1="74" x2="104" y2="74" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
        <line x1="68" y1="94" x2="92" y2="94" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
        <text x="100" y="58" font-family="sans-serif" font-weight="900" font-size="14" fill="#38bdf8">zZz</text>
        <rect x="52" y="112" width="56" height="16" rx="5" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
        <text x="80" y="124" font-family="sans-serif" font-weight="900" font-size="9" fill="#94a3b8" text-anchor="middle">GOOD NIGHT 🌙</text>
      </g>
    `
  }),
  // Game
  'game_goodmorning': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="42" y="44" width="76" height="72" rx="10" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
        <rect x="52" y="52" width="56" height="34" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
        <text x="80" y="74" font-family="monospace" font-weight="900" font-size="11" fill="#b45309" text-anchor="middle">STAGE 1</text>
        <circle cx="64" cy="100" r="4" fill="#ef4444"/>
        <circle cx="96" cy="100" r="4" fill="#22c55e"/>
        <rect x="48" y="108" width="64" height="15" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="80" y="119" font-family="monospace" font-weight="900" font-size="8" fill="#60a5fa" text-anchor="middle">START ☀️</text>
      </g>
    `
  }),
  'game_goodnight': () => generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <rect x="42" y="44" width="76" height="72" rx="10" fill="#475569" stroke="#1e293b" stroke-width="3"/>
        <rect x="52" y="52" width="56" height="34" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
        <text x="80" y="74" font-family="monospace" font-weight="900" font-size="10" fill="#38bdf8" text-anchor="middle">SLEEP 🌙</text>
        <circle cx="64" cy="100" r="4" fill="#64748b"/>
        <circle cx="96" cy="100" r="4" fill="#64748b"/>
        <rect x="48" y="108" width="64" height="15" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
        <text x="80" y="119" font-family="monospace" font-weight="900" font-size="8" fill="#94a3b8" text-anchor="middle">SAVED zZ</text>
      </g>
    `
  })
};

// ----------------------------------------------------
// 11. BOBA TEA FRIENDS (22 REACTION FACES)
// ----------------------------------------------------
function makeTeaSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="teaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffedd5"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <line x1="88" y1="12" x2="74" y2="48" stroke="#c084fc" stroke-width="8" stroke-linecap="round"/>
        <path d="M42 45 Q80 20 118 45 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
        <path d="M46 45 L52 125 Q52 135 64 135 L96 135 Q108 135 108 125 L114 45 Z" fill="url(#teaGrad)" stroke="#ca8a04" stroke-width="3"/>
        <circle cx="62" cy="122" r="5" fill="#451a03"/>
        <circle cx="74" cy="124" r="5" fill="#451a03"/>
        <circle cx="86" cy="122" r="5" fill="#451a03"/>
        <circle cx="98" cy="123" r="5" fill="#451a03"/>
        <circle cx="68" cy="113" r="5" fill="#451a03"/>
        <circle cx="80" cy="114" r="5" fill="#451a03"/>
        <circle cx="92" cy="113" r="5" fill="#451a03"/>
        ${getExpressionElements(emotion, 80, 78)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 12. SWEET CROISSANT BAKERY (22 REACTION FACES)
// ----------------------------------------------------
function makeBakerySvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="croissantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <path d="M26 102 C30 48 65 34 80 34 C95 34 130 48 134 102 C118 90 105 76 80 76 C55 76 42 90 26 102 Z" fill="url(#croissantGrad)" stroke="#b45309" stroke-width="3"/>
        <path d="M52 48 Q80 40 108 48" stroke="#92400e" stroke-width="2" fill="none"/>
        <path d="M60 62 Q80 56 100 62" stroke="#92400e" stroke-width="2" fill="none"/>
        ${getExpressionElements(emotion, 80, 68)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 13. DEV LIFE LAPTOP (22 REACTION FACES)
// ----------------------------------------------------
function makeDevSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="devScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <rect x="30" y="32" width="100" height="74" rx="8" fill="#334155" stroke="#1e293b" stroke-width="3"/>
        <rect x="36" y="38" width="88" height="62" rx="4" fill="url(#devScreenGrad)" stroke="#38bdf8" stroke-width="1.5"/>
        <path d="M18 114 L142 114 L132 126 L28 126 Z" fill="#475569" stroke="#1e293b" stroke-width="2"/>
        <rect x="64" y="116" width="32" height="6" rx="2" fill="#64748b"/>
        ${getExpressionElements(emotion, 80, 68)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 14. CAT VIBES CALICO (22 REACTION FACES)
// ----------------------------------------------------
function makeCatVibeSvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="calicoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="100%" stop-color="#fef3c7"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <polygon points="40,36 62,68 34,68" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
        <polygon points="120,36 98,68 126,68" fill="#475569" stroke="#1e293b" stroke-width="2.5"/>
        <circle cx="80" cy="85" r="45" fill="url(#calicoGrad)" stroke="#d97706" stroke-width="3"/>
        <path d="M35 78 C35 60 55 58 55 75 Z" fill="#f97316" opacity="0.6"/>
        <line x1="32" y1="84" x2="18" y2="80" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
        <line x1="32" y1="90" x2="16" y2="92" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
        <line x1="128" y1="84" x2="142" y2="80" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
        <line x1="128" y1="90" x2="144" y2="92" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
        ${getExpressionElements(emotion, 80, 82)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 15. CHIBI NINJA BUDDIES (22 REACTION FACES)
// ----------------------------------------------------
function makeNinjaSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M120 62 L142 55 L135 68 L145 80 L125 72" fill="#ef4444"/>
        <circle cx="80" cy="82" r="44" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
        <rect x="36" y="52" width="88" height="18" rx="4" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
        <rect x="42" y="70" width="76" height="24" rx="6" fill="#fde047"/>
        ${getExpressionElements(emotion, 80, 82)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 16. CUTE WARRIOR (22 REACTION FACES)
// ----------------------------------------------------
function makeWarriorSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M72 45 C72 16 88 12 88 45 Z" fill="#ef4444"/>
        <path d="M38 82 C38 42 122 42 122 82 L122 112 C122 122 38 122 38 112 Z" fill="#94a3b8" stroke="#475569" stroke-width="3"/>
        <rect x="36" y="68" width="88" height="20" rx="4" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 17. REAL PUPPY (22 REACTION FACES)
// ----------------------------------------------------
function makePuppySvg(emotion) {
  return generateSvg({
    defs: `
      <linearGradient id="puppyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    `,
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="36" cy="76" rx="14" ry="32" fill="#b45309" stroke="#78350f" stroke-width="2.5"/>
        <ellipse cx="124" cy="76" rx="14" ry="32" fill="#b45309" stroke="#78350f" stroke-width="2.5"/>
        <circle cx="80" cy="85" r="44" fill="url(#puppyGrad)" stroke="#d97706" stroke-width="3"/>
        <ellipse cx="80" cy="94" rx="18" ry="14" fill="#fef3c7"/>
        <ellipse cx="80" cy="88" rx="5" ry="3.5" fill="#1e293b"/>
        ${getExpressionElements(emotion, 80, 78)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 18. PANDA BUDDY (22 REACTION FACES)
// ----------------------------------------------------
function makePandaSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="44" cy="46" r="16" fill="#0f172a"/>
        <circle cx="116" cy="46" r="16" fill="#0f172a"/>
        <circle cx="80" cy="85" r="45" fill="#ffffff" stroke="#0f172a" stroke-width="3.5"/>
        <ellipse cx="58" cy="76" rx="13" ry="10" fill="#0f172a" transform="rotate(-15 58 76)"/>
        <ellipse cx="102" cy="76" rx="13" ry="10" fill="#0f172a" transform="rotate(15 102 76)"/>
        <ellipse cx="80" cy="92" rx="4" ry="3" fill="#0f172a"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 19. REAL BUNNY (22 REACTION FACES)
// ----------------------------------------------------
function makeBunnySvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <ellipse cx="58" cy="42" rx="12" ry="34" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
        <ellipse cx="58" cy="44" rx="6" ry="24" fill="#fbcfe8"/>
        <ellipse cx="102" cy="42" rx="12" ry="34" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
        <ellipse cx="102" cy="44" rx="6" ry="24" fill="#fbcfe8"/>
        <circle cx="80" cy="90" r="42" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <polygon points="76,92 84,92 80,96" fill="#f43f5e"/>
        ${getExpressionElements(emotion, 80, 82)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 20. SLEEPY BEAR (22 REACTION FACES)
// ----------------------------------------------------
function makeBearSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="48" cy="50" r="15" fill="#92400e"/>
        <circle cx="112" cy="50" r="15" fill="#92400e"/>
        <circle cx="80" cy="76" r="42" fill="#b45309" stroke="#78350f" stroke-width="3"/>
        <ellipse cx="80" cy="85" rx="16" ry="12" fill="#fed7aa"/>
        <path d="M30 95 Q80 82 130 95 L124 135 L36 135 Z" fill="#06b6d4" stroke="#0891b2" stroke-width="3"/>
        ${getExpressionElements(emotion, 80, 70)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 21. LOVELY COUPLE (22 REACTION FACES)
// ----------------------------------------------------
function makeCoupleSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <path d="M80 18 C75 8 60 10 60 20 C60 30 80 38 80 38 C80 38 100 30 100 20 C100 10 85 8 80 18 Z" fill="#ec4899"/>
        <circle cx="80" cy="82" r="45" fill="#ffe4e6" stroke="#f43f5e" stroke-width="3"/>
        <circle cx="80" cy="82" r="38" fill="#ffffff" opacity="0.6"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 22. RAMEN BUDDY (22 REACTION FACES)
// ----------------------------------------------------
function makeRamenSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <line x1="40" y1="36" x2="120" y2="64" stroke="#b45309" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="80" cy="72" rx="52" ry="18" fill="#fde047" stroke="#ca8a04" stroke-width="2.5"/>
        <circle cx="95" cy="70" r="8" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5"/>
        <circle cx="95" cy="70" r="5" fill="#f59e0b"/>
        <path d="M28 72 Q32 125 80 128 Q128 125 132 72 Z" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
        <rect x="62" y="126" width="36" height="8" rx="3" fill="#991b1b"/>
        ${getExpressionElements(emotion, 80, 92)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 23. DONUT FRIEND (22 REACTION FACES)
// ----------------------------------------------------
function makeDonutSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <circle cx="80" cy="80" r="48" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
        <path d="M80 34 C106 34 126 54 126 80 C126 106 106 126 80 126 C54 126 34 106 34 80 C34 54 54 34 80 34 Z" fill="#f472b6"/>
        <circle cx="80" cy="80" r="18" fill="#ffffff" stroke="#d97706" stroke-width="2.5"/>
        <rect x="48" y="52" width="6" height="3" rx="1.5" fill="#38bdf8" transform="rotate(30 48 52)"/>
        <rect x="106" y="52" width="6" height="3" rx="1.5" fill="#facc15" transform="rotate(-30 106 52)"/>
        <rect x="50" y="104" width="6" height="3" rx="1.5" fill="#4ade80" transform="rotate(-20 50 104)"/>
        <rect x="104" y="104" width="6" height="3" rx="1.5" fill="#c084fc" transform="rotate(20 104 104)"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

// ----------------------------------------------------
// 24. TINY ROBOT (22 REACTION FACES)
// ----------------------------------------------------
function makeRobotSvg(emotion) {
  return generateSvg({
    elements: `
      <g filter="url(#shadow)">
        <line x1="80" y1="20" x2="80" y2="40" stroke="#0891b2" stroke-width="3.5"/>
        <circle cx="80" cy="18" r="6" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <rect x="28" y="68" width="8" height="18" rx="3" fill="#facc15"/>
        <rect x="124" y="68" width="8" height="18" rx="3" fill="#facc15"/>
        <rect x="36" y="40" width="88" height="80" rx="14" fill="#06b6d4" stroke="#0891b2" stroke-width="3.5"/>
        <rect x="44" y="50" width="72" height="60" rx="8" fill="#0f172a" stroke="#67e8f9" stroke-width="2"/>
        ${getExpressionElements(emotion, 80, 80)}
      </g>
    `
  });
}

export const TEA_EMOTION_SVGS = buildCharacterPack('tea', makeTeaSvg);
export const BAKERY_EMOTION_SVGS = buildCharacterPack('bakery', makeBakerySvg);
export const DEV_EMOTION_SVGS = buildCharacterPack('dev', makeDevSvg);
export const CATVIBE_EMOTION_SVGS = buildCharacterPack('catvibe', makeCatVibeSvg);
export const NINJA_EMOTION_SVGS = buildCharacterPack('ninja', makeNinjaSvg);
export const WARRIOR_EMOTION_SVGS = buildCharacterPack('warrior', makeWarriorSvg);
export const PUPPY_EMOTION_SVGS = buildCharacterPack('puppy', makePuppySvg);
export const PANDA_EMOTION_SVGS = buildCharacterPack('panda', makePandaSvg);
export const BUNNY_EMOTION_SVGS = buildCharacterPack('bunny', makeBunnySvg);
export const BEAR_EMOTION_SVGS = buildCharacterPack('bear', makeBearSvg);
export const COUPLE_EMOTION_SVGS = buildCharacterPack('couple', makeCoupleSvg);
export const RAMEN_EMOTION_SVGS = buildCharacterPack('ramen', makeRamenSvg);
export const DONUT_EMOTION_SVGS = buildCharacterPack('donut', makeDonutSvg);
export const ROBOT_EMOTION_SVGS = buildCharacterPack('robot', makeRobotSvg);

// Combine all category emotion SVGs
export const ALL_CATEGORY_EMOTION_SVGS = {
  ...FROG_EMOTION_SVGS,
  ...CLOUD_EMOTION_SVGS,
  ...PIZZA_EMOTION_SVGS,
  ...GHOST_EMOTION_SVGS,
  ...MOON_EMOTION_SVGS,
  ...PUMPKIN_EMOTION_SVGS,
  ...PARTY_EMOTION_SVGS,
  ...RAIN_EMOTION_SVGS,
  ...TEDDY_EMOTION_SVGS,
  ...CRAZY_EMOTION_SVGS,
  ...EXTRA_EXISTING_PACK_SVGS,
  ...TEA_EMOTION_SVGS,
  ...BAKERY_EMOTION_SVGS,
  ...DEV_EMOTION_SVGS,
  ...CATVIBE_EMOTION_SVGS,
  ...NINJA_EMOTION_SVGS,
  ...WARRIOR_EMOTION_SVGS,
  ...PUPPY_EMOTION_SVGS,
  ...PANDA_EMOTION_SVGS,
  ...BUNNY_EMOTION_SVGS,
  ...BEAR_EMOTION_SVGS,
  ...COUPLE_EMOTION_SVGS,
  ...RAMEN_EMOTION_SVGS,
  ...DONUT_EMOTION_SVGS,
  ...ROBOT_EMOTION_SVGS
};

export function make22Stickers(pref, charName, baseTag) {
  return [
    { key: `${pref}_happy`, name: `${charName} Happy`, tags: `happy, smile, joy, cheerful, ${baseTag}` },
    { key: `${pref}_sad`, name: `${charName} Sad`, tags: `sad, blue, sorrow, frown, gloom, ${baseTag}` },
    { key: `${pref}_angry`, name: `${charName} Angry`, tags: `angry, mad, rage, furious, grump, ${baseTag}` },
    { key: `${pref}_sleepy`, name: `${charName} Sleepy`, tags: `sleepy, zzz, nap, tired, rest, ${baseTag}` },
    { key: `${pref}_excited`, name: `${charName} Excited`, tags: `excited, star, hype, yay, energetic, ${baseTag}` },
    { key: `${pref}_love`, name: `${charName} Love`, tags: `love, heart, romance, sweet, adore, ${baseTag}` },
    { key: `${pref}_laugh`, name: `${charName} Laughing`, tags: `laugh, lol, haha, comedy, hilarious, ${baseTag}` },
    { key: `${pref}_bored`, name: `${charName} Bored`, tags: `bored, whatever, idle, meh, unamused, ${baseTag}` },
    { key: `${pref}_shock`, name: `${charName} Shocked`, tags: `shock, omg, surprise, gasp, disbelief, ${baseTag}` },
    { key: `${pref}_cry`, name: `${charName} Crying`, tags: `cry, tears, sob, sad, bawling, ${baseTag}` },
    { key: `${pref}_goodmorning`, name: `${charName} Good Morning`, tags: `goodmorning, morning, sunrise, wakeup, sun, ${baseTag}` },
    { key: `${pref}_goodnight`, name: `${charName} Good Night`, tags: `goodnight, night, bedtime, sleep, moon, ${baseTag}` },
    { key: `${pref}_confused`, name: `${charName} Confused`, tags: `confused, question, huh, what, puzzle, ${baseTag}` },
    { key: `${pref}_scared`, name: `${charName} Scared`, tags: `scared, fear, freeze, panic, terror, ${baseTag}` },
    { key: `${pref}_thankyou`, name: `${charName} Thank You`, tags: `thank-you, thanks, grateful, gratitude, bless, ${baseTag}` },
    { key: `${pref}_sorry`, name: `${charName} Sorry`, tags: `sorry, apologize, forgive, mybad, oops, ${baseTag}` },
    { key: `${pref}_yes`, name: `${charName} Yes`, tags: `yes, agree, approve, check, ok, thumbsup, ${baseTag}` },
    { key: `${pref}_no`, name: `${charName} No`, tags: `no, deny, refuse, stop, nope, reject, ${baseTag}` },
    { key: `${pref}_good`, name: `${charName} Good`, tags: `good, great, perfect, nice, awesome, ${baseTag}` },
    { key: `${pref}_bad`, name: `${charName} Bad`, tags: `bad, dislike, terrible, gross, awful, ${baseTag}` },
    { key: `${pref}_greeting`, name: `${charName} Greeting`, tags: `greeting, hello, hi, wave, hey, welcome, ${baseTag}` },
    { key: `${pref}_celebration`, name: `${charName} Celebration`, tags: `celebration, party, confetti, yay, celebrate, birthday, ${baseTag}` }
  ];
}

