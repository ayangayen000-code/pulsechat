const BASE_URL = 'http://localhost:5000/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- Starting Advanced Message Actions & Interaction Tests ---');
  let failures = 0;

  // 1. Authenticate user 1 (Ayan) and user 2 (Sarah)
  console.log('\n[1] Authenticating test users...');
  let user1Token, user2Token, user1, user2;
  try {
    const res1 = await request('POST', '/auth/login', {
      identifier: '@ayan_4821',
      password: 'password123'
    });
    user1Token = res1.data.token;
    user1 = res1.data.user;

    const res2 = await request('POST', '/auth/login', {
      identifier: '@sarah_sky',
      password: 'password123'
    });
    user2Token = res2.data.token;
    user2 = res2.data.user;

    console.log(`✓ User 1 authenticated: ${user1.username} (${user1.id})`);
    console.log(`✓ User 2 authenticated: ${user2.username} (${user2.id})`);
  } catch (err) {
    console.error('Failed to log in test users:', err);
    process.exit(1);
  }

  // 2. Get or create direct chat between user 1 and user 2
  console.log('\n[2] Establishing conversation...');
  let conversationId;
  try {
    const chatRes = await request('POST', '/chats/direct', { targetUserId: user2.id }, user1Token);
    conversationId = chatRes.data.conversationId;
    console.log(`✓ Conversation ID: ${conversationId}`);
  } catch (err) {
    console.error('Failed to create direct chat:', err);
    process.exit(1);
  }

  // 3. Send test messages
  console.log('\n[3] Sending test messages...');
  let msg1, msg2, viewOnceMsg;
  try {
    const m1Res = await request('POST', '/messages', {
      conversation_id: conversationId,
      type: 'text',
      content: 'Hello! This is test message 1'
    }, user1Token);
    msg1 = m1Res.data.message;

    const m2Res = await request('POST', '/messages', {
      conversation_id: conversationId,
      type: 'text',
      content: 'Hello! This is test message 2'
    }, user1Token);
    msg2 = m2Res.data.message;

    const voRes = await request('POST', '/messages', {
      conversation_id: conversationId,
      type: 'image',
      content: 'https://example.com/test.jpg',
      view_once: 1
    }, user1Token);
    viewOnceMsg = voRes.data.message;

    console.log(`✓ Message 1 sent: ${msg1.id}`);
    console.log(`✓ Message 2 sent: ${msg2.id}`);
    console.log(`✓ View Once message sent: ${viewOnceMsg.id}`);
  } catch (err) {
    console.error('Failed to send messages:', err);
    failures++;
  }

  // 4. Test Star / Save Message
  console.log('\n[4] Testing Star / Save Message API...');
  try {
    // User 1 saves msg1
    const saveRes = await request('POST', `/messages/${msg1.id}/save`, null, user1Token);
    console.log(`✓ Saved message 1 response:`, saveRes.data.message);

    // Check list of saved messages
    const listRes = await request('GET', '/messages/saved', null, user1Token);
    const savedIds = (listRes.data.saved_messages || []).map(m => m.message_id || m.id);
    if (savedIds.includes(msg1.id)) {
      console.log(`✓ Message 1 confirmed in saved messages list (${listRes.data.saved_messages.length} total saved)`);
    } else {
      console.error(`✗ Message 1 not found in saved messages list`);
      failures++;
    }

    // View-Once cannot be saved
    const voSaveRes = await request('POST', `/messages/${viewOnceMsg.id}/save`, null, user1Token);
    if (voSaveRes.status === 400) {
      console.log('✓ View-once message correctly blocked from saving (400 Bad Request)');
    } else {
      console.error('✗ View-once message was not blocked from saving, status:', voSaveRes.status);
      failures++;
    }

    // Unsave msg1
    await request('DELETE', `/messages/${msg1.id}/save`, null, user1Token);
    const afterUnsaveRes = await request('GET', '/messages/saved', null, user1Token);
    const afterSavedIds = (afterUnsaveRes.data.saved_messages || []).map(m => m.message_id || m.id);
    if (!afterSavedIds.includes(msg1.id)) {
      console.log(`✓ Message 1 successfully unsaved`);
    } else {
      console.error(`✗ Message 1 still present in saved messages`);
      failures++;
    }
  } catch (err) {
    console.error('Save test error:', err);
    failures++;
  }

  // 5. Test Pin / Unpin Message
  console.log('\n[5] Testing Pin / Unpin Message API...');
  try {
    const pinRes = await request('POST', `/messages/${msg1.id}/pin`, null, user1Token);
    console.log(`✓ Pinned message 1:`, pinRes.data.pin?.id);

    // Verify in GET /api/chats/:id/messages
    const messagesRes = await request('GET', `/chats/${conversationId}/messages`, null, user1Token);
    const pinned = messagesRes.data.pinned_messages || [];
    const isPinnedInList = pinned.some(p => p.message_id === msg1.id);
    if (isPinnedInList) {
      console.log(`✓ Message 1 present in pinned_messages array of conversation`);
    } else {
      console.error(`✗ Message 1 missing from pinned_messages array`);
      failures++;
    }

    // Unpin message
    await request('DELETE', `/messages/${msg1.id}/pin`, null, user1Token);
    const messagesAfterUnpin = await request('GET', `/chats/${conversationId}/messages`, null, user1Token);
    const pinnedAfter = messagesAfterUnpin.data.pinned_messages || [];
    if (!pinnedAfter.some(p => p.message_id === msg1.id)) {
      console.log(`✓ Message 1 successfully unpinned`);
    } else {
      console.error(`✗ Message 1 still pinned`);
      failures++;
    }
  } catch (err) {
    console.error('Pin test error:', err);
    failures++;
  }

  // 6. Test Reactions and Reaction Details
  console.log('\n[6] Testing Reactions and Reaction Details API...');
  try {
    await request('POST', `/messages/${msg1.id}/react`, { emoji: '❤️' }, user1Token);
    await request('POST', `/messages/${msg1.id}/react`, { emoji: '🔥' }, user2Token);

    const rxnRes = await request('GET', `/messages/${msg1.id}/reactions`, null, user1Token);
    console.log(`✓ Reactions fetched: ${rxnRes.data.reactions?.length} reactions found`);
    const emojis = (rxnRes.data.reactions || []).map(r => r.emoji);
    if (emojis.includes('❤️') && emojis.includes('🔥')) {
      console.log(`✓ Both emojis '❤️' and '🔥' verified with user details`);
    } else {
      console.error(`✗ Unexpected reaction emojis:`, emojis);
      failures++;
    }
  } catch (err) {
    console.error('Reactions test error:', err);
    failures++;
  }

  // 7. Test Forward Messages
  console.log('\n[7] Testing Forward Messages API...');
  try {
    const forwardRes = await request('POST', '/messages/forward', {
      message_ids: [msg1.id, msg2.id],
      target_conversation_ids: [conversationId]
    }, user1Token);
    console.log(`✓ Forwarded ${forwardRes.data.forwarded_count} messages`);

    // Verify view-once cannot be forwarded
    const voFwdRes = await request('POST', '/messages/forward', {
      message_ids: [viewOnceMsg.id],
      target_conversation_ids: [conversationId]
    }, user1Token);
    if (voFwdRes.data.forwarded_count === 0) {
      console.log(`✓ View-once message correctly filtered out from forwarding`);
    } else {
      console.error(`✗ View-once message was allowed to forward`);
      failures++;
    }
  } catch (err) {
    console.error('Forward test error:', err);
    failures++;
  }

  // 8. Test Delete for Me vs Delete for Everyone
  console.log('\n[8] Testing Delete for Me & Delete for Everyone...');
  try {
    const delMsg1 = (await request('POST', '/messages', {
      conversation_id: conversationId,
      type: 'text',
      content: 'To be deleted for me only'
    }, user1Token)).data.message;

    const delMsg2 = (await request('POST', '/messages', {
      conversation_id: conversationId,
      type: 'text',
      content: 'To be deleted for everyone'
    }, user1Token)).data.message;

    // User 1 deletes delMsg1 for ME
    await request('DELETE', `/messages/${delMsg1.id}?delete_type=me`, null, user1Token);

    // Verify delMsg1 is NOT visible to User 1
    const u1Messages = (await request('GET', `/chats/${conversationId}/messages`, null, user1Token)).data.messages;
    const u1HasDelMsg1 = u1Messages.some(m => m.id === delMsg1.id);
    if (!u1HasDelMsg1) {
      console.log(`✓ Delete for me: delMsg1 is hidden from User 1`);
    } else {
      console.error(`✗ delMsg1 is still visible to User 1`);
      failures++;
    }

    // Verify delMsg1 IS STILL visible to User 2
    const u2Messages = (await request('GET', `/chats/${conversationId}/messages`, null, user2Token)).data.messages;
    const u2HasDelMsg1 = u2Messages.some(m => m.id === delMsg1.id);
    if (u2HasDelMsg1) {
      console.log(`✓ Delete for me: delMsg1 remains visible to User 2 (soft delete verified)`);
    } else {
      console.error(`✗ delMsg1 was hidden from User 2 as well`);
      failures++;
    }

    // User 1 deletes delMsg2 for EVERYONE
    await request('DELETE', `/messages/${delMsg2.id}?delete_type=everyone`, null, user1Token);

    // Verify delMsg2 is replaced with "This message was deleted" for User 2
    const u2MessagesAfter = (await request('GET', `/chats/${conversationId}/messages`, null, user2Token)).data.messages;
    const u2DelMsg2 = u2MessagesAfter.find(m => m.id === delMsg2.id);
    if (u2DelMsg2 && u2DelMsg2.is_deleted === 1) {
      console.log(`✓ Delete for everyone: delMsg2 is marked deleted for User 2 ("${u2DelMsg2.content}")`);
    } else {
      console.error(`✗ delMsg2 not properly deleted for everyone:`, u2DelMsg2);
      failures++;
    }
  } catch (err) {
    console.error('Delete test error:', err);
    failures++;
  }

  // 9. Test Batch Delete
  console.log('\n[9] Testing Batch Delete API...');
  try {
    const b1 = (await request('POST', '/messages', { conversation_id: conversationId, content: 'Batch 1' }, user1Token)).data.message;
    const b2 = (await request('POST', '/messages', { conversation_id: conversationId, content: 'Batch 2' }, user1Token)).data.message;

    await request('POST', '/messages/batch-delete', {
      message_ids: [b1.id, b2.id],
      delete_type: 'me'
    }, user1Token);

    const msgs = (await request('GET', `/chats/${conversationId}/messages`, null, user1Token)).data.messages;
    const hasAny = msgs.some(m => m.id === b1.id || m.id === b2.id);
    if (!hasAny) {
      console.log(`✓ Batch delete for me succeeded: both messages hidden from User 1`);
    } else {
      console.error(`✗ One or more messages not hidden in batch delete`);
      failures++;
    }
  } catch (err) {
    console.error('Batch delete error:', err);
    failures++;
  }

  console.log(`\n========================================`);
  if (failures === 0) {
    console.log(`🎉 ALL ADVANCED MESSAGE ACTION TESTS PASSED!`);
  } else {
    console.log(`⚠️ ${failures} TEST(S) FAILED`);
  }
  console.log(`========================================\n`);
  process.exit(failures > 0 ? 1 : 0);
}

runTests();
