const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting Disappearing Messages & View Once Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Login user
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: '@ayan_4821', password: 'password123' })
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Login user ayan');
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Get chats
    const chatsRes = await req('/chats', { headers: authHeaders });
    assert(chatsRes.status === 200 && chatsRes.data.chats.length > 0, 'Fetched chats list');
    const chat = chatsRes.data.chats[0];
    const chatId = chat.id;

    // 3. Update disappearing messages to 10 seconds
    const updateTimerRes = await req(`/chats/${chatId}/disappearing`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        disappearing_enabled: 1,
        disappearing_duration: 10,
        disappearing_unit: '10s'
      })
    });
    assert(updateTimerRes.status === 200 && updateTimerRes.data.success, 'Updated disappearing timer to 10 seconds');
    assert(updateTimerRes.data.disappearing_enabled === true, 'Disappearing enabled is true');
    assert(updateTimerRes.data.disappearing_duration === 10, 'Disappearing duration is 10s');
    assert(updateTimerRes.data.systemMessage && updateTimerRes.data.systemMessage.type === 'system', 'System notification message generated');
    console.log('     System notice:', updateTimerRes.data.systemMessage.content);

    // 4. Send a message in the disappearing chat
    const sendMsgRes = await req('/messages', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        conversation_id: chatId,
        content: 'This message will self-destruct in 10s!',
        type: 'text'
      })
    });
    assert(sendMsgRes.status === 201 && sendMsgRes.data.message, 'Sent message with disappearing timer');
    const sentMsg = sendMsgRes.data.message;
    assert(sentMsg.disappearing_enabled === 1, 'Message has disappearing_enabled = 1');
    assert(sentMsg.disappearing_duration === 10, 'Message has disappearing_duration = 10');
    assert(sentMsg.expires_at !== null, `Message expires_at is set: ${sentMsg.expires_at}`);

    // 5. Verify message is returned in chats/:id/messages
    const messagesRes1 = await req(`/chats/${chatId}/messages`, { headers: authHeaders });
    const foundMsg1 = messagesRes1.data.messages.find(m => m.id === sentMsg.id);
    assert(foundMsg1 !== undefined, 'Message found in chat history while valid');

    // 5b. Send a 1-second expiring message and verify it disappears after 2.5s
    await req(`/chats/${chatId}/disappearing`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ duration: 1, unit: '1s' })
    });
    const shortLivedRes = await req('/messages', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        conversation_id: chatId,
        content: 'This will disappear in 1s!',
        type: 'text'
      })
    });
    const shortMsg = shortLivedRes.data.message;
    assert(shortMsg && shortMsg.id, 'Sent short-lived 1-second message');

    // Wait 2.5 seconds for expiration and cleanup interval
    await new Promise(r => setTimeout(r, 2500));

    const checkExpiredRes = await req(`/chats/${chatId}/messages`, { headers: authHeaders });
    const foundExpired = checkExpiredRes.data.messages.find(m => m.id === shortMsg.id);
    assert(foundExpired === undefined, 'Expired message successfully removed/filtered after timer expiration!');

    // 6. Test View Once message
    const sendViewOnceRes = await req('/messages', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        conversation_id: chatId,
        type: 'image',
        content: '/uploads/images/secret_photo_test.jpg',
        view_once: 1,
        metadata: { filename: 'secret_photo_test.jpg', size: 1024 }
      })
    });
    assert(sendViewOnceRes.status === 201, 'Sent View Once image message');
    const viewOnceMsg = sendViewOnceRes.data.message;
    assert(viewOnceMsg.view_once === 1, 'view_once flag is 1');
    assert(viewOnceMsg.view_once_opened === 0, 'view_once_opened flag is initially 0');

    // 7. Verify GET /api/chats/:id/messages masks the media URL
    const messagesRes2 = await req(`/chats/${chatId}/messages`, { headers: authHeaders });
    const foundViewOnce1 = messagesRes2.data.messages.find(m => m.id === viewOnceMsg.id);
    assert(foundViewOnce1 !== undefined, 'View Once message present in chat history');
    assert(foundViewOnce1.content === '', 'Unopened View Once media content is masked from chat list API');

    // 8. Consume View Once message via POST /api/messages/:id/view-once
    const consumeRes = await req(`/messages/${viewOnceMsg.id}/view-once`, {
      method: 'POST',
      headers: authHeaders
    });
    assert(consumeRes.status === 200 && consumeRes.data.success, 'Successfully opened View Once media');
    assert(consumeRes.data.content === '/uploads/images/secret_photo_test.jpg', 'Correct media URL returned on first open');
    assert(consumeRes.data.view_once_opened === 1, 'Marked view_once_opened = 1');

    // 9. Reopening must be rejected with 410 Gone
    const secondConsumeRes = await req(`/messages/${viewOnceMsg.id}/view-once`, {
      method: 'POST',
      headers: authHeaders
    });
    assert(secondConsumeRes.status === 410, 'Reopening consumed View Once is blocked with 410 Gone');

    // 10. Verify GET /api/chats/:id/messages still masks consumed View Once
    const messagesRes3 = await req(`/chats/${chatId}/messages`, { headers: authHeaders });
    const foundViewOnce2 = messagesRes3.data.messages.find(m => m.id === viewOnceMsg.id);
    assert(foundViewOnce2.content === '', 'Consumed View Once media content remains masked');
    assert(foundViewOnce2.view_once_opened === 1, 'Consumed View Once shows view_once_opened = 1');

    // 11. Test Custom Timer preset (e.g. 45 minutes = 2700s)
    const updateCustomRes = await req(`/chats/${chatId}/disappearing`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        disappearing_enabled: 1,
        disappearing_duration: 2700,
        disappearing_unit: '45m'
      })
    });
    assert(updateCustomRes.status === 200, 'Set custom disappearing timer to 45m (2700s)');
    assert(updateCustomRes.data.disappearing_duration === 2700, 'Custom duration 2700 verified');

    // 12. Turn disappearing timer Off
    const turnOffRes = await req(`/chats/${chatId}/disappearing`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        disappearing_enabled: 0,
        disappearing_duration: 0,
        disappearing_unit: 'off'
      })
    });
    assert(turnOffRes.status === 200, 'Turned disappearing messages Off');
    assert(turnOffRes.data.disappearing_enabled === false, 'Verified disappearing_enabled is false');
    console.log('     Off notice:', turnOffRes.data.systemMessage.content);

  } catch (err) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  }

  console.log(`\nDisappearing & View Once Test Results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
