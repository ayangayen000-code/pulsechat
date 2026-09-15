import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Sticker Store & Sticker Pack API tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Login as Ayan
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { identifier: '@ayan_4821', password: 'password123' }
    );

    assert(loginRes.status === 200 && loginRes.data.token, 'Login as demo user successful');
    const token = loginRes.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // 2. GET /api/stickers/categories
    const catRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/categories',
      method: 'GET',
      headers: authHeaders
    });
    assert(catRes.status === 200 && Array.isArray(catRes.data.categories), 'GET /categories returns category list');
    assert(catRes.data.categories.length === 16, `Has all 16 required categories (found ${catRes.data.categories.length})`);
    const coffeeCat = catRes.data.categories.find((c) => c.name.includes('Cute & Cozy'));
    assert(coffeeCat && coffeeCat.count >= 3, 'Cute & Cozy category has multiple packs');

    // 3. GET /api/stickers/store
    const storeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/store',
      method: 'GET',
      headers: authHeaders
    });
    assert(storeRes.status === 200 && Array.isArray(storeRes.data.packs), 'GET /store returns packs array');
    assert(storeRes.data.packs.length >= 21, `Store has 21+ sticker packs (found ${storeRes.data.packs.length})`);
    assert(Array.isArray(storeRes.data.featured) && storeRes.data.featured.length > 0, 'Store returns featured hero packs');

    // Check preview stickers attached
    const firstPack = storeRes.data.packs[0];
    assert(firstPack.stickers && firstPack.stickers.length > 0, 'Packs have preview stickers attached');

    // 4. GET /api/stickers/store?tab=popular
    const popRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/store?tab=popular',
      method: 'GET',
      headers: authHeaders
    });
    assert(popRes.status === 200 && popRes.data.packs.every((p) => p.is_popular === 1), 'Store tab=popular filters correctly');

    // 5. GET /api/stickers/store?q=coffee
    const searchStoreRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/store?q=coffee',
      method: 'GET',
      headers: authHeaders
    });
    assert(searchStoreRes.status === 200 && searchStoreRes.data.packs.length > 0, 'Store search q=coffee returns matching packs');

    // 6. GET /api/stickers/packs/:id
    const packDetailRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/packs/pack_cute_coffee',
      method: 'GET',
      headers: authHeaders
    });
    assert(packDetailRes.status === 200 && packDetailRes.data.pack.id === 'pack_cute_coffee', 'GET pack details by ID');
    assert(packDetailRes.data.stickers.length >= 12, `Cute Coffee Cups has full sticker set (found ${packDetailRes.data.stickers.length})`);

    // 7. GET /api/stickers/my
    const myPacksRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/my',
      method: 'GET',
      headers: authHeaders
    });
    assert(myPacksRes.status === 200 && Array.isArray(myPacksRes.data.packs), 'GET /my returns user sticker packs');
    assert(myPacksRes.data.packs.length >= 4, `User has starter packs installed (found ${myPacksRes.data.packs.length})`);

    // 8. POST /api/stickers/my/:packId - install Anime Emotions
    const installRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/my/pack_anime_emotions',
      method: 'POST',
      headers: authHeaders
    });
    assert(installRes.status === 200 && installRes.data.is_installed === true, 'Successfully added pack to user library');

    // Verify it is in /my
    const myPacksAfterAdd = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/my',
      method: 'GET',
      headers: authHeaders
    });
    const foundAnime = myPacksAfterAdd.data.packs.find((p) => p.id === 'pack_anime_emotions');
    assert(!!foundAnime, 'Newly added pack appears in /my library');

    // 9. DELETE /api/stickers/my/:packId - remove pack
    const uninstallRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/my/pack_anime_emotions',
      method: 'DELETE',
      headers: authHeaders
    });
    assert(uninstallRes.status === 200 && uninstallRes.data.is_installed === false, 'Successfully removed pack from library');

    // 10. PUT /api/stickers/my/reorder
    const myPacksToReorder = myPacksAfterAdd.data.packs.filter((p) => p.id !== 'pack_anime_emotions').map((p) => p.id);
    const reversedOrder = [...myPacksToReorder].reverse();
    const reorderRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/stickers/my/reorder',
        method: 'PUT',
        headers: authHeaders
      },
      { packIds: reversedOrder }
    );
    assert(reorderRes.status === 200 && reorderRes.data.success, 'Reordered installed packs');

    // 11. GET /api/stickers/recent and POST /api/stickers/recent
    const postRecent = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/stickers/recent',
        method: 'POST',
        headers: authHeaders
      },
      { stickerId: 'pack_cute_coffee_coffee_love' }
    );
    assert(postRecent.status === 200 && postRecent.data.success, 'Recorded recent sticker');

    const getRecents = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/recent',
      method: 'GET',
      headers: authHeaders
    });
    assert(getRecents.status === 200 && Array.isArray(getRecents.data.recent), 'GET /recent returns recents list');
    assert(getRecents.data.recent[0].id === 'pack_cute_coffee_coffee_love', 'Most recently used sticker appears first');

    // 12. POST /api/stickers/favorite and GET /api/stickers/favorites
    const toggleFav = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/stickers/favorite',
        method: 'POST',
        headers: authHeaders
      },
      { stickerId: 'pack_cute_coffee_coffee_heart' }
    );
    assert(toggleFav.status === 200, 'Toggled favorite sticker');

    const getFavs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/favorites',
      method: 'GET',
      headers: authHeaders
    });
    assert(getFavs.status === 200 && Array.isArray(getFavs.data.favorites), 'GET /favorites returns array');

    // 13. GET /api/stickers/search?q=happy
    const searchStkRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/search?q=happy',
      method: 'GET',
      headers: authHeaders
    });
    assert(searchStkRes.status === 200 && Array.isArray(searchStkRes.data.stickers), 'GET /search returns matching stickers');
    assert(searchStkRes.data.stickers.length > 0, `Search found stickers matching 'happy' (found ${searchStkRes.data.stickers.length})`);

    // 14. GET /api/stickers/emotions
    const emotionsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/emotions',
      method: 'GET',
      headers: authHeaders
    });
    assert(emotionsRes.status === 200 && Array.isArray(emotionsRes.data.emotions), 'GET /emotions returns emotions array');
    assert(emotionsRes.data.emotions.length >= 22, `All 22+ reaction emotions returned (found ${emotionsRes.data.emotions.length})`);
    assert(emotionsRes.data.emotions.every(e => e.count >= 14), 'Every reaction emotion has at least 14 stickers across categories');

    // 15. Search for emotions: thank you, confused, good morning, good night
    const searchThanksRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/search?q=thank%20you',
      method: 'GET',
      headers: authHeaders
    });
    assert(searchThanksRes.status === 200 && searchThanksRes.data.stickers.length >= 14, `Search 'thank you' returns ${searchThanksRes.data?.stickers?.length} stickers`);

    const searchConfusedRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/search?q=confused',
      method: 'GET',
      headers: authHeaders
    });
    assert(searchConfusedRes.status === 200 && searchConfusedRes.data.stickers.length >= 14, `Search 'confused' returns ${searchConfusedRes.data?.stickers?.length} stickers`);

    const searchMorningRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/search?q=good%20morning',
      method: 'GET',
      headers: authHeaders
    });
    assert(searchMorningRes.status === 200 && searchMorningRes.data.stickers.length >= 14, `Search 'good morning' returns ${searchMorningRes.data?.stickers?.length} stickers`);

    const searchNightRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/stickers/search?q=good%20night',
      method: 'GET',
      headers: authHeaders
    });
    assert(searchNightRes.status === 200 && searchNightRes.data.stickers.length >= 14, `Search 'good night' returns ${searchNightRes.data?.stickers?.length} stickers`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\nSticker API Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
