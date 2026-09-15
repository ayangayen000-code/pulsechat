import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run, persistDb } from './database.js';

export async function seedDatabase() {
  const existingUsers = await query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0] && existingUsers[0].count > 0) {
    // Already seeded
    return;
  }

  console.log('🌱 Seeding initial demo data...');

  const passwordHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();
  const past = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

  // Create Users
  const users = [
    {
      id: 'usr_ayan',
      user_id: '@ayan_4821',
      username: 'Ayan Gayen',
      password_hash: passwordHash,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Building modern apps & exploring new horizons 🚀',
      status: 'online',
      last_seen: now,
      created_at: past(10000)
    },
    {
      id: 'usr_sarah',
      user_id: '@sarah_sky',
      username: 'Sarah Jenkins',
      password_hash: passwordHash,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Design lead & coffee enthusiast ☕✨',
      status: 'online',
      last_seen: now,
      created_at: past(9000)
    },
    {
      id: 'usr_marcus',
      user_id: '@marcus_dev',
      username: 'Marcus Vance',
      password_hash: passwordHash,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Full stack engineer & open-source contributor 💻',
      status: 'online',
      last_seen: past(15),
      created_at: past(8500)
    },
    {
      id: 'usr_elena',
      user_id: '@elena_art',
      username: 'Elena Rostova',
      password_hash: passwordHash,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Digital artist & 3D animator 🎨',
      status: 'away',
      last_seen: past(45),
      created_at: past(8000)
    },
    {
      id: 'usr_alex',
      user_id: '@alex_gaming',
      username: 'Alex Rivera',
      password_hash: passwordHash,
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'Speedrunner & indie game creator 🎮🕹️',
      status: 'offline',
      last_seen: past(120),
      created_at: past(7000)
    }
  ];

  for (const u of users) {
    await run(
      `INSERT INTO users (id, user_id, username, password_hash, avatar_url, bio, status, last_seen, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.user_id, u.username, u.password_hash, u.avatar_url, u.bio, u.status, u.last_seen, u.created_at]
    );

    // Initial settings for each user
    await run(
      `INSERT INTO user_settings (user_id, theme, accent_color, enter_to_send, sound_enabled, desktop_notifications)
       VALUES (?, 'dark', 'indigo', 1, 1, 1)`,
      [u.id]
    );
  }

  // Friends for Ayan
  const friendships = [
    { u1: 'usr_ayan', u2: 'usr_sarah' },
    { u1: 'usr_ayan', u2: 'usr_marcus' },
    { u1: 'usr_ayan', u2: 'usr_elena' },
    { u1: 'usr_sarah', u2: 'usr_marcus' }
  ];

  for (const f of friendships) {
    await run(
      `INSERT INTO friends (id, user_id_1, user_id_2, status, created_at) VALUES (?, ?, ?, 'accepted', ?)`,
      [uuidv4(), f.u1, f.u2, past(5000)]
    );
  }

  // Incoming friend request from Alex to Ayan
  await run(
    `INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at) VALUES (?, ?, ?, 'pending', ?)`,
    ['req_alex_ayan', 'usr_alex', 'usr_ayan', past(60)]
  );

  // Notification for incoming friend request
  await run(
    `INSERT INTO notifications (id, user_id, sender_id, type, title, content, data, is_read, created_at)
     VALUES (?, ?, ?, 'friend_request', 'New Friend Request', 'Alex Rivera (@alex_gaming) sent you a friend request', ?, 0, ?)`,
    [uuidv4(), 'usr_ayan', 'usr_alex', JSON.stringify({ requestId: 'req_alex_ayan', senderId: 'usr_alex' }), past(60)]
  );

  // 1-to-1 Conversation: Ayan & Sarah
  const convSarahId = 'conv_ayan_sarah';
  await run(
    `INSERT INTO conversations (id, type, name, avatar_url, description, created_by, created_at, updated_at)
     VALUES (?, 'direct', '', '', '', 'usr_ayan', ?, ?)`,
    [convSarahId, past(300), past(2)]
  );

  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, is_pinned, joined_at) VALUES (?, ?, ?, 'member', 1, ?)`,
    [uuidv4(), convSarahId, 'usr_ayan', past(300)]);
  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, is_pinned, joined_at) VALUES (?, ?, ?, 'member', 0, ?)`,
    [uuidv4(), convSarahId, 'usr_sarah', past(300)]);

  const sarahMessages = [
    {
      id: 'msg_s1',
      sender_id: 'usr_sarah',
      type: 'text',
      content: 'Hey Ayan! How is the new messaging platform architecture coming along? 🎨',
      time: past(180)
    },
    {
      id: 'msg_s2',
      sender_id: 'usr_ayan',
      type: 'text',
      content: 'Hey Sarah! It’s looking fantastic! Real-time WebSockets, audio waveforms, custom stickers, and zero phone numbers required ✨',
      time: past(120)
    },
    {
      id: 'msg_s3',
      sender_id: 'usr_sarah',
      type: 'text',
      content: 'That sounds incredible! I just finished the new design system components. Check this preview out:',
      time: past(60)
    },
    {
      id: 'msg_s4',
      sender_id: 'usr_sarah',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      metadata: JSON.stringify({ filename: 'ui_mockup_preview.png', width: 1200, height: 800, filesize: '420 KB' }),
      time: past(55)
    },
    {
      id: 'msg_s5',
      sender_id: 'usr_ayan',
      type: 'voice',
      content: 'voice_note_sample.mp3',
      metadata: JSON.stringify({
        duration: 8.4,
        waveforms: [20, 35, 60, 45, 80, 95, 70, 50, 65, 85, 90, 75, 55, 40, 60, 30, 25, 45, 65, 80, 50, 35, 20]
      }),
      time: past(30)
    },
    {
      id: 'msg_s6',
      sender_id: 'usr_sarah',
      type: 'text',
      content: 'The voice clarity is super crisp! Can’t wait for everyone in our circle to hop on! 🔥',
      time: past(2)
    }
  ];

  for (const m of sarahMessages) {
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.id, convSarahId, m.sender_id, m.type, m.content, m.metadata || null, m.time]
    );
  }

  // Add reactions to Sarah's message
  await run(
    `INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
     VALUES (?, ?, ?, '❤️', ?)`,
    [uuidv4(), 'msg_s6', 'usr_ayan', past(1)]
  );
  await run(
    `INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
     VALUES (?, ?, ?, '🔥', ?)`,
    [uuidv4(), 'msg_s2', 'usr_sarah', past(100)]
  );

  // 1-to-1 Conversation: Ayan & Marcus
  const convMarcusId = 'conv_ayan_marcus';
  await run(
    `INSERT INTO conversations (id, type, name, avatar_url, description, created_by, created_at, updated_at)
     VALUES (?, 'direct', '', '', '', 'usr_ayan', ?, ?)`,
    [convMarcusId, past(500), past(40)]
  );

  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`,
    [uuidv4(), convMarcusId, 'usr_ayan', past(500)]);
  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`,
    [uuidv4(), convMarcusId, 'usr_marcus', past(500)]);

  const marcusMessages = [
    {
      id: 'msg_m1',
      sender_id: 'usr_marcus',
      type: 'text',
      content: 'Hey Ayan, I checked the SQLite database schema and real-time event pipeline. Everything looks very solid!',
      time: past(150)
    },
    {
      id: 'msg_m2',
      sender_id: 'usr_marcus',
      type: 'file',
      content: '/specs/system_architecture.pdf',
      metadata: JSON.stringify({ filename: 'AetherChat_Architecture_Spec.pdf', filesize: '1.8 MB', mimeType: 'application/pdf' }),
      time: past(120)
    },
    {
      id: 'msg_m3',
      sender_id: 'usr_ayan',
      type: 'text',
      content: 'Thanks Marcus! Just verified multi-device responsive sync and push alerts.',
      time: past(40)
    }
  ];

  for (const m of marcusMessages) {
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.id, convMarcusId, m.sender_id, m.type, m.content, m.metadata || null, m.time]
    );
  }

  // Group Conversation: "Squad Core"
  const convGroupId = 'conv_squad_core';
  await run(
    `INSERT INTO conversations (id, type, name, avatar_url, description, created_by, pinned_message_id, created_at, updated_at)
     VALUES (?, 'group', 'Squad Core', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80', 'The inner circle hangout & innovation lab ✨', 'usr_ayan', 'msg_g1', ?, ?)`,
    [convGroupId, past(1000), past(10)]
  );

  // Add members to Squad Core
  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, is_pinned, joined_at) VALUES (?, ?, ?, 'owner', 1, ?)`,
    [uuidv4(), convGroupId, 'usr_ayan', past(1000)]);
  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'admin', ?)`,
    [uuidv4(), convGroupId, 'usr_sarah', past(1000)]);
  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`,
    [uuidv4(), convGroupId, 'usr_marcus', past(950)]);
  await run(`INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, 'member', ?)`,
    [uuidv4(), convGroupId, 'usr_elena', past(900)]);

  const groupMessages = [
    {
      id: 'msg_g1',
      sender_id: 'usr_ayan',
      type: 'text',
      content: '🎉 Welcome to Squad Core! Pinned announcement: We test our custom stickers and voice notes today!',
      time: past(600)
    },
    {
      id: 'msg_g2',
      sender_id: 'usr_elena',
      type: 'text',
      content: 'I created a set of brand new stickers for us! Let me upload them to our sticker pack 🎨🐱',
      time: past(300)
    },
    {
      id: 'msg_g3',
      sender_id: 'usr_sarah',
      type: 'text',
      content: '@elena_art YES please! We need the cute cat reactions ASAP 😻',
      time: past(180)
    },
    {
      id: 'msg_g4',
      sender_id: 'usr_elena',
      type: 'sticker',
      content: 'pack_cats_01',
      metadata: JSON.stringify({ pack_id: 'pack_cat_vibes', pack_name: 'Cat Vibes', name: 'Hyped Cat', sticker_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80' }),
      time: past(10)
    }
  ];

  for (const m of groupMessages) {
    await run(
      `INSERT INTO messages (id, conversation_id, sender_id, type, content, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.id, convGroupId, m.sender_id, m.type, m.content, m.metadata || null, m.time]
    );
  }

  // Seed Sticker Packs
  const packs = [
    {
      id: 'pack_cat_vibes',
      name: 'Cat Vibes',
      creator_id: 'usr_elena',
      icon_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&auto=format&fit=crop&q=80',
      is_system: 1,
      stickers: [
        { name: 'Hyped Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80' },
        { name: 'Cozy Sleep', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&auto=format&fit=crop&q=80' },
        { name: 'Curious Peek', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80' },
        { name: 'Grumpy Mood', url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=200&auto=format&fit=crop&q=80' }
      ]
    },
    {
      id: 'pack_dev_life',
      name: 'Dev Life',
      creator_id: 'usr_marcus',
      icon_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&auto=format&fit=crop&q=80',
      is_system: 1,
      stickers: [
        { name: 'Deploy on Friday', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80' },
        { name: 'It Works On My Machine', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&auto=format&fit=crop&q=80' },
        { name: 'Coffee Refuel', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80' },
        { name: 'Bug Hunting', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80' }
      ]
    }
  ];

  for (const p of packs) {
    await run(
      `INSERT INTO sticker_packs (id, name, creator_id, icon_url, is_system, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.creator_id, p.icon_url, p.is_system, past(2000)]
    );

    for (const s of p.stickers) {
      await run(
        `INSERT INTO stickers (id, pack_id, image_url, name, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), p.id, s.url, s.name, past(2000)]
      );
    }
  }

  persistDb();
  console.log('✅ Demo database seeded successfully!');
}
