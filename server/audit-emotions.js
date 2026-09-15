import { query } from './src/db/database.js';

const tags = [
  'happy', 'smile', 'laugh', 'sad', 'cry', 'angry', 'bored', 'love',
  'shock', 'confused', 'sleepy', 'excited', 'scared', 'thank-you',
  'sorry', 'yes', 'no', 'good', 'bad', 'greeting', 'celebration'
];

async function runAudit() {
  console.log('--- EMOTION TAG AUDIT ---');
  for (const tag of tags) {
    const matching = await query(
      'SELECT s.id, s.name, sp.category FROM stickers s JOIN sticker_packs sp ON sp.id = s.pack_id WHERE LOWER(s.tags) LIKE ? OR LOWER(s.name) LIKE ?',
      ['%' + tag + '%', '%' + tag + '%']
    );
    console.log(tag.padEnd(14) + ' => count: ' + String(matching.length).padStart(2) + ' | categories (' + new Set(matching.map(m => m.category)).size + '): ' + [...new Set(matching.map(m => m.category))].join(', '));
  }
  process.exit(0);
}

runAudit();
