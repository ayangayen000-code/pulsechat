/**
 * Automated Verification Script for Custom Chat Themes
 */
import http from 'http';

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (data) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
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
  console.log('🎨 Starting Custom Chat Theme Automated Verification...\n');
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
    // 1. Fetch presets
    const presetsRes = await request('http://localhost:5000/api/themes/presets');
    assert(presetsRes.status === 200, 'GET /api/themes/presets returned 200 OK');
    assert(presetsRes.data.categories?.length >= 5, `Presets has ${presetsRes.data.categories?.length} categories`);
    assert(presetsRes.data.presets?.length >= 20, `Presets has ${presetsRes.data.presets?.length} built-in themes`);

    // Verify presence of all 5 required categories
    const catIds = presetsRes.data.categories.map(c => c.id);
    assert(['minimal', 'gradient', 'nature', 'romantic', 'gaming'].every(c => catIds.includes(c)), 'All 5 categories present (Minimal, Gradient, Nature, Romantic, Gaming)');

    // 2. Login as Ayan
    const loginAyan = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
      identifier: '@ayan_4821',
      password: 'password123'
    });
    assert(loginAyan.status === 200 && !!loginAyan.data.token, 'Login as @ayan_4821');
    const ayanToken = loginAyan.data.token;
    const ayanHeaders = { Authorization: `Bearer ${ayanToken}` };

    // 3. Login as Sarah
    const loginSarah = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
      identifier: '@sarah_sky',
      password: 'password123'
    });
    assert(loginSarah.status === 200 && !!loginSarah.data.token, 'Login as @sarah_sky');
    const sarahToken = loginSarah.data.token;
    const sarahHeaders = { Authorization: `Bearer ${sarahToken}` };

    // 4. Create custom theme
    const createThemeRes = await request('http://localhost:5000/api/themes/my', {
      method: 'POST',
      headers: ayanHeaders
    }, {
      name: 'Night Drive',
      category: 'custom',
      background_type: 'image',
      background_image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
      background_blur: 4,
      background_brightness: 80,
      background_opacity: 90,
      overlay_color: '#18181b',
      overlay_opacity: 40,
      sent_bubble_bg: '#6366f1',
      sent_bubble_text: '#ffffff',
      received_bubble_bg: '#27272a',
      received_bubble_text: '#f4f4f5',
      accent_color: '#818cf8',
      input_bg: '#18181b',
      text_color: '#ffffff'
    });
    assert(createThemeRes.status === 201 && createThemeRes.data.theme?.name === 'Night Drive', 'Create custom theme "Night Drive"');
    const customThemeId = createThemeRes.data.theme.id;

    // 5. List custom themes
    const listThemesRes = await request('http://localhost:5000/api/themes/my', { headers: ayanHeaders });
    assert(listThemesRes.status === 200 && listThemesRes.data.themes?.some(t => t.id === customThemeId), 'List "My Themes" contains created theme');

    // 6. Update custom theme
    const updateThemeRes = await request(`http://localhost:5000/api/themes/my/${customThemeId}`, {
      method: 'PUT',
      headers: ayanHeaders
    }, {
      name: 'Night Drive Pro',
      background_blur: 6
    });
    assert(updateThemeRes.status === 200 && updateThemeRes.data.theme?.name === 'Night Drive Pro', 'Update custom theme name to "Night Drive Pro"');

    // 7. Get conversation between Ayan and Sarah
    const chatsRes = await request('http://localhost:5000/api/chats', { headers: ayanHeaders });
    const directChat = chatsRes.data.chats.find(c => c.type === 'direct' && c.other_user?.user_id === '@sarah_sky');
    assert(!!directChat, `Found direct chat with Sarah (ID: ${directChat?.id})`);

    if (directChat) {
      const convId = directChat.id;

      // 8. Apply shared theme ("Both of Us")
      const applyBothRes = await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        method: 'PUT',
        headers: ayanHeaders
      }, {
        themeId: customThemeId,
        themeConfig: updateThemeRes.data.theme,
        scope: 'both'
      });
      assert(applyBothRes.status === 200 && applyBothRes.data.scope === 'both', 'Apply theme to conversation with scope: "both"');

      // 9. Verify Sarah sees the shared theme
      const sarahThemeRes = await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        headers: sarahHeaders
      });
      assert(sarahThemeRes.status === 200 && sarahThemeRes.data.theme?.name === 'Night Drive Pro', 'Friend (@sarah_sky) retrieves synced shared theme');

      // 10. Sarah sets personal override ("only_me")
      const sarahPreset = presetsRes.data.presets.find(p => p.name === 'Sakura');
      const sarahOverrideRes = await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        method: 'PUT',
        headers: sarahHeaders
      }, {
        themeId: sarahPreset.id,
        themeConfig: sarahPreset,
        scope: 'only_me'
      });
      assert(sarahOverrideRes.status === 200 && sarahOverrideRes.data.scope === 'only_me', 'Sarah sets personal override ("only_me") with "Sakura" theme');

      // 11. Verify Sarah now gets "Sakura"
      const sarahAfterOverride = await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        headers: sarahHeaders
      });
      assert(sarahAfterOverride.data.theme?.name === 'Sakura', 'Sarah sees personal override theme ("Sakura")');

      // 12. Verify Ayan still sees "Night Drive Pro"
      const ayanThemeCheck = await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        headers: ayanHeaders
      });
      assert(ayanThemeCheck.data.theme?.name === 'Night Drive Pro', 'Ayan still sees "Night Drive Pro"');

      // 13. Reset conversation theme
      const resetRes = await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        method: 'DELETE',
        headers: ayanHeaders
      });
      assert(resetRes.status === 200, 'Reset conversation theme to default');
      await request(`http://localhost:5000/api/themes/conversation/${convId}`, {
        method: 'DELETE',
        headers: sarahHeaders
      });
    }

    // 14. Delete custom theme
    const deleteThemeRes = await request(`http://localhost:5000/api/themes/my/${customThemeId}`, {
      method: 'DELETE',
      headers: ayanHeaders
    });
    assert(deleteThemeRes.status === 200, 'Delete custom theme from My Themes');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log(`\n📊 Theme Verification Summary: ${passed} Passed, ${failed} Failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
