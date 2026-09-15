// Comprehensive End-to-End Automated Verification Script for PulseChat
import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`[${res.status}] ${data.error || res.statusText}`);
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting PulseChat End-to-End Automated Verification...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('Server Health Check', async () => {
    const res = await request('/health');
    if (res.status !== 'ok' || res.app !== 'PulseChat') throw new Error('Unexpected health response');
  });

  // 2. Demo User Login
  let ayanToken = '';
  let ayanUser = null;
  await test('Login with Demo Account (@ayan_4821)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { identifier: '@ayan_4821', password: 'password123' }
    });
    if (!res.token || !res.user) throw new Error('Missing token or user');
    ayanToken = res.token;
    ayanUser = res.user;
  });

  let sarahToken = '';
  await test('Login with Second Demo Account (@sarah_sky)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { identifier: '@sarah_sky', password: 'password123' }
    });
    if (!res.token || !res.user) throw new Error('Missing token or user');
    sarahToken = res.token;
  });

  // 3. User Profile & Settings
  await test('Fetch Current User Profile & Unread Counts', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (res.user.user_id !== '@ayan_4821') throw new Error('Wrong user returned');
  });

  // 4. User Search by Handle
  await test('Search Users by Handle and Name', async () => {
    const res = await request('/users/search?q=sarah', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!Array.isArray(res.users) || res.users.length === 0) throw new Error('No users found');
    if (!res.users.some(u => u.user_id === '@sarah_sky')) throw new Error('Sarah not in search results');
  });

  // 5. Friends List
  await test('List Friends', async () => {
    const res = await request('/friends', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!Array.isArray(res.friends) || res.friends.length < 2) throw new Error('Expected at least 2 friends');
  });

  // 6. Conversation List
  let targetConvId = '';
  await test('List Conversations (Direct & Groups)', async () => {
    const res = await request('/chats', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!Array.isArray(res.chats) || res.chats.length < 2) throw new Error('Expected conversations list');
    targetConvId = res.chats[0].id;
  });

  // 7. Get Messages in Conversation
  await test('Retrieve Messages in Active Chat', async () => {
    const res = await request(`/chats/${targetConvId}/messages`, {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!Array.isArray(res.messages)) throw new Error('Expected messages array');
  });

  // 8. Send New Message
  let newMsgId = '';
  await test('Send New Real-Time Text Message', async () => {
    const res = await request('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ayanToken}` },
      body: {
        conversation_id: targetConvId,
        type: 'text',
        content: 'Verification automated test message #4821 🚀'
      }
    });
    if (!res.message || !res.message.id) throw new Error('Failed to send message');
    newMsgId = res.message.id;
  });

  // 9. React to Message
  await test('Add Emoji Reaction to Message', async () => {
    const res = await request(`/messages/${newMsgId}/react`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sarahToken}` },
      body: { emoji: '🔥' }
    });
    if (!Array.isArray(res.reactions) || res.reactions.length === 0) throw new Error('Reaction not recorded');
  });

  // 10. Edit Message
  await test('Edit Own Message', async () => {
    const res = await request(`/messages/${newMsgId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ayanToken}` },
      body: { content: 'Verification automated test message #4821 [UPDATED] ✨' }
    });
    if (!res.success) throw new Error('Edit failed');
  });

  // 11. Create Group Chat
  let createdGroupId = '';
  await test('Create New Group Chat with Friends', async () => {
    const res = await request('/groups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ayanToken}` },
      body: {
        name: 'Alpha Innovators',
        description: 'Testing group collaboration platform',
        memberIds: ['usr_sarah', 'usr_marcus']
      }
    });
    if (!res.conversationId) throw new Error('Group creation failed');
    createdGroupId = res.conversationId;
  });

  // 12. Send Sticker in Group
  await test('Send Custom Sticker in Group', async () => {
    const res = await request('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ayanToken}` },
      body: {
        conversation_id: createdGroupId,
        type: 'sticker',
        content: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
        metadata: {
          pack_id: 'pack_cat_vibes',
          pack_name: 'Cat Vibes',
          name: 'Hyped Cat'
        }
      }
    });
    if (!res.message || res.message.type !== 'sticker') throw new Error('Sticker sending failed');
  });

  // 13. Create New Account without phone number
  const uniqueHandle = `@tester_${Math.floor(Math.random() * 8999 + 1000)}`;
  let newUserToken = '';
  await test(`Register New User without Phone Number (${uniqueHandle})`, async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        username: 'Jordan Tester',
        user_id: uniqueHandle,
        password: 'password123',
        bio: 'Automated test explorer'
      }
    });
    if (!res.token || res.user.user_id !== uniqueHandle) throw new Error('Registration failed');
    newUserToken = res.token;
  });

  // 14. Send and Accept Friend Request
  await test('Send Friend Request using Unique User ID', async () => {
    const res = await request('/friends/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: { targetUserId: '@ayan_4821' }
    });
    if (!res.success) throw new Error('Friend request failed');
  });

  await test('Accept Friend Request and Establish Friendship', async () => {
    // Get incoming request ID for Ayan
    const reqs = await request('/friends/requests', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    const found = reqs.requests.find(r => r.user_id === uniqueHandle);
    if (!found) throw new Error('Incoming request not found in recipient queue');

    const acceptRes = await request('/friends/accept', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ayanToken}` },
      body: { requestId: found.request_id }
    });
    if (!acceptRes.success) throw new Error('Accept failed');
  });

  // 15. Notification Center
  await test('Fetch and Mark Notifications as Read', async () => {
    const notifs = await request('/notifications', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!Array.isArray(notifs.notifications)) throw new Error('Expected notifications list');

    const markRes = await request('/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!markRes.success) throw new Error('Mark all read failed');
  });

  // 16. Update Settings
  await test('Update Appearance and Chat Preferences', async () => {
    const res = await request('/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ayanToken}` },
      body: {
        theme: 'dark',
        accent_color: 'indigo',
        enter_to_send: true,
        sound_enabled: true
      }
    });
    if (res.settings.theme !== 'dark' || res.settings.accent_color !== 'indigo') {
      throw new Error('Settings not applied');
    }
  });

  // 17. Storage Stats
  await test('Retrieve Storage Usage Statistics', async () => {
    const res = await request('/settings/storage', {
      headers: { Authorization: `Bearer ${ayanToken}` }
    });
    if (!res.storage || !Array.isArray(res.storage.breakdown)) throw new Error('Invalid storage stats');
  });

  console.log(`\n📊 Verification Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
