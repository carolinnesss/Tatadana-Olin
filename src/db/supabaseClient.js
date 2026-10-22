// ====================================================================
// TataDana - Supabase Database Client & Persistent Storage Adapter
// Implements Supabase client with local JSON fallback & seed data
// ====================================================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', '..', 'data_storage.json');

// Initial seed store
const initialData = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'budi.santoso@example.com',
      phone_number: '+6281234567890',
      phone_verified: true,
      full_name: 'Budi Santoso',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      currency: 'IDR',
      plan: 'pro',
      role: 'user',
      telegram_chat_id: 123456789,
      telegram_username: '@budisantoso_id',
      telegram_bot_token: '',
      telegram_connected: true,
      daily_reminder_enabled: true,
      daily_reminder_frequency: 2,
      reminder_time_1: '20:00:00',
      reminder_time_2: '12:00:00',
      daily_budget_mode: 'auto',
      daily_budget_custom: 100000,
      daily_budget_alert_pct: 80,
      no_spend_target_days: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'siti.aminah@example.com',
      phone_number: '+6289876543210',
      phone_verified: true,
      full_name: 'Siti Aminah',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      currency: 'IDR',
      plan: 'starter',
      role: 'user',
      telegram_chat_id: 987654321,
      telegram_username: '@sitiaminah',
      telegram_bot_token: '',
      telegram_connected: false,
      daily_reminder_enabled: false,
      daily_reminder_frequency: 1,
      reminder_time_1: '20:00:00',
      daily_budget_mode: 'auto',
      daily_budget_custom: 75000,
      daily_budget_alert_pct: 80,
      no_spend_target_days: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000099',
      email: 'sandracarolin1004@gmail.com',
      phone_number: '+6281234567899',
      phone_verified: true,
      full_name: 'Sandra Carolin',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      currency: 'IDR',
      plan: 'pro',
      role: 'superadmin',
      approval_status: 'approved',
      password: 'password123',
      telegram_chat_id: 999888,
      telegram_username: '@sandracarolin',
      telegram_bot_token: '',
      telegram_connected: true,
      daily_reminder_enabled: true,
      daily_reminder_frequency: 1,
      reminder_time_1: '20:00:00',
      daily_budget_mode: 'auto',
      daily_budget_custom: 150000,
      daily_budget_alert_pct: 80,
      no_spend_target_days: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  wallets: [
    {
      id: '11111111-1111-1111-1111-111111111101',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Bank BCA Utama',
      type: 'bank',
      balance: 8750000,
      is_default: true,
      color: '#ea580c',
      icon: 'landmark',
      created_at: new Date().toISOString()
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Dompet Tunai (Cash)',
      type: 'cash',
      balance: 450000,
      is_default: false,
      color: '#16a34a',
      icon: 'wallet',
      created_at: new Date().toISOString()
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'GoPay & OVO',
      type: 'ewallet',
      balance: 320000,
      is_default: false,
      color: '#0284c7',
      icon: 'smartphone',
      created_at: new Date().toISOString()
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Bank Mandiri Bisnis',
      type: 'bank',
      balance: 12500000,
      is_default: false,
      color: '#0d9488',
      icon: 'building',
      created_at: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: '22222222-2222-2222-2222-222222222201',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Makanan & Minuman',
      type: 'expense',
      emoji: '🍜',
      color: '#ea580c',
      monthly_budget: 2500000,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Transportasi',
      type: 'expense',
      emoji: '🚗',
      color: '#0284c7',
      monthly_budget: 800000,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222203',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Tagihan & Utilitas',
      type: 'expense',
      emoji: '🏠',
      color: '#ef4444',
      monthly_budget: 1500000,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222204',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Belanja Kebutuhan',
      type: 'expense',
      emoji: '👕',
      color: '#8b5cf6',
      monthly_budget: 1200000,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222205',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Hiburan & Hobi',
      type: 'expense',
      emoji: '🎮',
      color: '#ec4899',
      monthly_budget: 600000,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222206',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Kesehatan',
      type: 'expense',
      emoji: '💊',
      color: '#10b981',
      monthly_budget: 500000,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222207',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Gaji & Bonus',
      type: 'income',
      emoji: '💰',
      color: '#16a34a',
      monthly_budget: 0,
      is_system: true,
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222208',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Project Freelance',
      type: 'income',
      emoji: '💻',
      color: '#3b82f6',
      monthly_budget: 0,
      is_system: true,
      created_at: new Date().toISOString()
    }
  ],
  transactions: [
    {
      id: '33333333-3333-3333-3333-333333333301',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      category_id: '22222222-2222-2222-2222-222222222207',
      type: 'income',
      amount: 12500000,
      transaction_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      transaction_time: new Date(Date.now() - 12 * 86400000).toISOString(),
      notes: 'Gaji Bulanan PT Maju Bersama',
      source: 'web',
      receipt_items: null,
      created_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333302',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111104',
      category_id: '22222222-2222-2222-2222-222222222208',
      type: 'income',
      amount: 3500000,
      transaction_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      transaction_time: new Date(Date.now() - 5 * 86400000).toISOString(),
      notes: 'DP Project Desain Landing Page',
      source: 'web',
      receipt_items: null,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333303',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      category_id: '22222222-2222-2222-2222-222222222201',
      type: 'expense',
      amount: 45000,
      transaction_date: new Date().toISOString().split('T')[0],
      transaction_time: new Date().toISOString(),
      notes: 'Makan Siang Nasi Padang Sederhana',
      source: 'telegram_text',
      receipt_items: null,
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333304',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111103',
      category_id: '22222222-2222-2222-2222-222222222202',
      type: 'expense',
      amount: 28000,
      transaction_date: new Date().toISOString().split('T')[0],
      transaction_time: new Date().toISOString(),
      notes: 'Gojek ke Stasiun Sudirman',
      source: 'telegram_voice',
      receipt_items: null,
      raw_ai_transcript: 'Gojek ke stasiun sudirman dua puluh delapan ribu',
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333305',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      category_id: '22222222-2222-2222-2222-222222222203',
      type: 'expense',
      amount: 450000,
      transaction_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      transaction_time: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: 'Token Listrik PLN & Internet Indihome',
      source: 'telegram_text',
      receipt_items: null,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333306',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      category_id: '22222222-2222-2222-2222-222222222204',
      type: 'expense',
      amount: 275000,
      transaction_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      transaction_time: new Date(Date.now() - 3 * 86400000).toISOString(),
      notes: 'Belanja Mingguan Indomaret (Struk)',
      source: 'telegram_photo',
      receipt_items: [
        { name: 'Minyak Goreng 2L', price: 38000, qty: 1, category: 'Belanja Kebutuhan' },
        { name: 'Beras Premium 5kg', price: 74000, qty: 1, category: 'Belanja Kebutuhan' },
        { name: 'Telur Ayam 1kg', price: 29000, qty: 1, category: 'Belanja Kebutuhan' },
        { name: 'Kopi & Susu UHT', price: 48000, qty: 2, category: 'Makanan & Minuman' },
        { name: 'Deterjen & Sabun Mandi', price: 86000, qty: 1, category: 'Belanja Kebutuhan' }
      ],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333307',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111102',
      category_id: '22222222-2222-2222-2222-222222222201',
      type: 'expense',
      amount: 18000,
      transaction_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      transaction_time: new Date(Date.now() - 4 * 86400000).toISOString(),
      notes: 'Beli Bakso Urat Pinggir Jalan',
      source: 'telegram_text',
      receipt_items: null,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333308',
      user_id: '00000000-0000-0000-0000-000000000001',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      category_id: '22222222-2222-2222-2222-222222222205',
      type: 'expense',
      amount: 150000,
      transaction_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      transaction_time: new Date(Date.now() - 6 * 86400000).toISOString(),
      notes: 'Nonton Bioskop XXI & Popcorn',
      source: 'telegram_text',
      receipt_items: null,
      created_at: new Date(Date.now() - 6 * 86400000).toISOString()
    }
  ],
  telegram_updates: [],
  ai_providers_config: [
    {
      id: '44444444-4444-4444-4444-444444444401',
      provider_name: 'gemini',
      api_key_encrypted: 'enc_gemini_prod_key_live',
      model_name: 'gemini-1.5-flash',
      is_active: true,
      is_primary: true,
      mode: 'parallel_failover'
    },
    {
      id: '44444444-4444-4444-4444-444444444402',
      provider_name: 'openai',
      api_key_encrypted: 'enc_openai_prod_key_live',
      model_name: 'gpt-4o-mini',
      is_active: true,
      is_primary: false,
      mode: 'parallel_failover'
    },
    {
      id: '44444444-4444-4444-4444-444444444403',
      provider_name: 'deepseek',
      api_key_encrypted: 'enc_deepseek_prod_key_live',
      model_name: 'deepseek-chat',
      is_active: false,
      is_primary: false,
      mode: 'single'
    }
  ],
  ai_call_logs: [
    {
      id: '55555555-5555-5555-5555-555555555501',
      user_id: '00000000-0000-0000-0000-000000000001',
      provider: 'gemini',
      action_type: 'parse_text',
      prompt_tokens: 120,
      response_tokens: 45,
      latency_ms: 320,
      status: 'success',
      created_at: new Date().toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555502',
      user_id: '00000000-0000-0000-0000-000000000001',
      provider: 'gemini',
      action_type: 'parse_receipt',
      prompt_tokens: 450,
      response_tokens: 180,
      latency_ms: 890,
      status: 'success',
      created_at: new Date().toISOString()
    }
  ],
  payments: [
    {
      id: '66666666-6666-6666-6666-666666666601',
      user_id: '00000000-0000-0000-0000-000000000001',
      order_id: 'ORDER-TD-20261013-001',
      plan: 'pro',
      amount: 99000,
      payment_type: 'midtrans',
      status: 'settlement',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ],
  export_history: [
    {
      id: '77777777-7777-7777-7777-777777777701',
      user_id: '00000000-0000-0000-0000-000000000001',
      file_type: 'pdf',
      period_start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      storage_path: 'reports/budi/Laporan_Keuangan_TataDana_30Hari.pdf',
      file_name: 'Laporan_Keuangan_TataDana_30Hari.pdf',
      file_size_kb: 142,
      created_at: new Date().toISOString()
    }
  ],
  admin_audit_logs: [
    {
      id: '88888888-8888-8888-8888-888888888801',
      admin_id: '00000000-0000-0000-0000-000000000001',
      target_user_id: '00000000-0000-0000-0000-000000000002',
      action: 'view_transactions',
      details: { reason: 'Customer support inquiry #4892' },
      created_at: new Date().toISOString()
    }
  ],
  bills: [
    {
      id: '99999999-9999-9999-9999-999999999901',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Listrik PLN Pascabayar',
      amount: 350000,
      due_day: 20,
      category_id: '22222222-2222-2222-2222-222222222203',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      is_paid: false,
      last_paid_date: null,
      auto_reminder: true,
      notes: 'No. Meter: 51234892019',
      created_at: new Date().toISOString()
    },
    {
      id: '99999999-9999-9999-9999-999999999902',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'WiFi Biznet Home 50 Mbps',
      amount: 275000,
      due_day: 10,
      category_id: '22222222-2222-2222-2222-222222222203',
      wallet_id: '11111111-1111-1111-1111-111111111101',
      is_paid: true,
      last_paid_date: '2026-10-09',
      auto_reminder: true,
      notes: 'ID Pelanggan: BZ-98210',
      created_at: new Date().toISOString()
    },
    {
      id: '99999999-9999-9999-9999-999999999903',
      user_id: '00000000-0000-0000-0000-000000000001',
      name: 'Langganan Netflix Premium',
      amount: 186000,
      due_day: 25,
      category_id: '22222222-2222-2222-2222-222222222205',
      wallet_id: '11111111-1111-1111-1111-111111111103',
      is_paid: false,
      last_paid_date: null,
      auto_reminder: true,
      notes: 'Paket 4K UHD 4 Layar',
      created_at: new Date().toISOString()
    }
  ]
};

// Memory cache & persistence
let dbData = initialData;

// Load persisted data if exists
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      dbData = JSON.parse(content);

      // Auto migrate new collections if missing in persisted storage
      let changed = false;
      if (!dbData.bills || dbData.bills.length === 0) {
        dbData.bills = initialData.bills;
        changed = true;
      }

      // Auto migrate daily budget fields to profiles if missing
      (dbData.profiles || []).forEach(p => {
        if (!p.daily_budget_mode) {
          p.daily_budget_mode = 'auto';
          p.daily_budget_custom = 100000;
          p.daily_budget_alert_pct = 80;
          p.no_spend_target_days = 7;
          changed = true;
        }
      });

      // Ensure Budi Santoso has role 'user'
      (dbData.profiles || []).forEach(p => {
        if ((p.email || '').toLowerCase() === 'budi.santoso@example.com' && p.role !== 'user') {
          p.role = 'user';
          changed = true;
        }
      });

      // Ensure Sandra Carolin Superadmin exists
      const sandraExists = (dbData.profiles || []).some(p => (p.email || '').toLowerCase() === 'sandracarolin1004@gmail.com');
      if (!sandraExists) {
        dbData.profiles.push({
          id: '00000000-0000-0000-0000-000000000099',
          email: 'sandracarolin1004@gmail.com',
          phone_number: '+6281234567899',
          phone_verified: true,
          full_name: 'Sandra Carolin',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          currency: 'IDR',
          plan: 'pro',
          role: 'superadmin',
          approval_status: 'approved',
          password: 'password123',
          telegram_chat_id: 999888,
          telegram_username: '@sandracarolin',
          telegram_bot_token: '',
          telegram_connected: true,
          daily_reminder_enabled: true,
          daily_reminder_frequency: 1,
          reminder_time_1: '20:00:00',
          daily_budget_mode: 'auto',
          daily_budget_custom: 150000,
          daily_budget_alert_pct: 80,
          no_spend_target_days: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        changed = true;
      }

      // Ensure Sandra Carolin has role 'superadmin' and approval_status 'approved'
      (dbData.profiles || []).forEach(p => {
        if ((p.email || '').toLowerCase() === 'sandracarolin1004@gmail.com') {
          if (p.role !== 'superadmin') {
            p.role = 'superadmin';
            changed = true;
          }
          if (p.approval_status !== 'approved') {
            p.approval_status = 'approved';
            changed = true;
          }
        }
      });

      if (changed) {
        saveData();
      }
    } else {
      saveData();
    }
  } catch (err) {
    console.error('Failed reading data file, using default data:', err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving data file:', err);
  }
}

loadData();

// Supabase Table Query Builder Emulator
export class SupabaseQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.orderConfig = null;
    this.limitCount = null;
    this.singleMode = false;
  }

  select(fields = '*') {
    this.selectedFields = fields;
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column, value) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  gte(column, value) {
    this.filters.push((row) => row[column] >= value);
    return this;
  }

  lte(column, value) {
    this.filters.push((row) => row[column] <= value);
    return this;
  }

  ilike(column, pattern) {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.filters.push((row) => regex.test(row[column] || ''));
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderConfig = { column, ascending };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = true;
    return this;
  }

  async execute() {
    loadData();
    let rows = dbData[this.tableName] || [];

    for (const filter of this.filters) {
      rows = rows.filter(filter);
    }

    if (this.orderConfig) {
      const { column, ascending } = this.orderConfig;
      rows = [...rows].sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    if (this.singleMode) {
      return { data: rows[0] || null, error: null };
    }

    return { data: rows, error: null };
  }

  async insert(recordOrRecords) {
    loadData();
    const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
    const inserted = records.map((record) => {
      const newRecord = {
        id: record.id || crypto.randomUUID(),
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
        ...record
      };
      if (!dbData[this.tableName]) dbData[this.tableName] = [];
      dbData[this.tableName].push(newRecord);
      return newRecord;
    });

    saveData();
    return { data: Array.isArray(recordOrRecords) ? inserted : inserted[0], error: null };
  }

  async update(updates) {
    loadData();
    let rows = dbData[this.tableName] || [];
    const updated = [];

    for (let i = 0; i < rows.length; i++) {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(rows[i])) {
          matches = false;
          break;
        }
      }

      if (matches) {
        rows[i] = {
          ...rows[i],
          ...updates,
          updated_at: new Date().toISOString()
        };
        updated.push(rows[i]);
      }
    }

    saveData();
    return { data: updated, error: null };
  }

  async delete() {
    loadData();
    const initialLen = (dbData[this.tableName] || []).length;
    dbData[this.tableName] = (dbData[this.tableName] || []).filter((row) => {
      for (const filter of this.filters) {
        if (filter(row)) return false; // delete matching
      }
      return true;
    });

    saveData();
    return { data: { count: initialLen - dbData[this.tableName].length }, error: null };
  }
}

// Database client facade
export const supabase = {
  from(tableName) {
    return new SupabaseQueryBuilder(tableName);
  },
  getRawData() {
    loadData();
    return dbData;
  },
  resetToDefault() {
    dbData = JSON.parse(JSON.stringify(initialData));
    saveData();
  }
};
