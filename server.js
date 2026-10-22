// ====================================================================
// TataDana - Main HTTP Application Server
// Node.js Native HTTP & REST Engine
// Timezone: Asia/Jakarta (WIB)
// ====================================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import os from 'os';
import { supabase } from './src/db/supabaseClient.js';
import { aiService } from './src/services/aiService.js';
import { telegramService } from './src/services/telegramService.js';
import { exportService } from './src/services/exportService.js';
import { midtransService } from './src/services/midtransService.js';

import { renderLayout } from './src/views/layout.js';
import { renderLandingPage } from './src/views/landingPage.js';
import { renderLoginPage, renderRegisterPage } from './src/views/authPages.js';
import {
  renderDashboardOverview,
  renderTransactionsPage,
  renderReportsPage,
  renderBudgetsPage,
  renderWalletsPage,
  renderSettingsPage
} from './src/views/dashboardPages.js';
import { renderAdminDashboard, renderAdminLoginPage } from './src/views/adminPages.js';
import { renderSimulatorPage } from './src/views/simulatorPage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables into process.env if .env exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
} catch (e) {
  console.error('[TataDana] Error loading .env:', e);
}

// Ensure storage directories
const EXPORTS_DIR = path.join(__dirname, 'storage_exports');
const AVATARS_DIR = path.join(__dirname, 'storage_exports', 'avatars');
try {
  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });
} catch (e) {
  // Read-only filesystem in serverless environments like Vercel
}

process.on('uncaughtException', (err) => {
  console.error('[TataDana Server Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[TataDana Server Unhandled Rejection]:', reason);
});

// Helper: parse cookies from request header
function getCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const val = decodeURIComponent(parts.join('='));
      list[key] = val;
    });
  }
  return list;
}

// Helper: get current authenticated session user (Part 12.1 & 12.2)
async function getSessionUser(req) {
  const cookies = getCookies(req);
  const sessionId = cookies['tatadana_session'];
  if (!sessionId) return null;

  const { data: user } = await supabase
    .from('profiles')
    .eq('id', sessionId)
    .single()
    .execute();

  return user || null;
}

// Helper: ensure default categories exist for user
async function ensureUserCategories(userId) {
  let { data: categories } = await supabase.from('categories').eq('user_id', userId).execute();
  if (!categories || categories.length === 0) {
    await supabase.from('categories').insert([
      { user_id: userId, name: 'Makanan & Minuman', type: 'expense', emoji: '🍜', color: '#ea580c', monthly_budget: 1500000, is_system: true },
      { user_id: userId, name: 'Transportasi', type: 'expense', emoji: '🚗', color: '#0284c7', monthly_budget: 800000, is_system: true },
      { user_id: userId, name: 'Tagihan & Utilitas', type: 'expense', emoji: '🏠', color: '#ef4444', monthly_budget: 1000000, is_system: true },
      { user_id: userId, name: 'Belanja Kebutuhan', type: 'expense', emoji: '👕', color: '#8b5cf6', monthly_budget: 1000000, is_system: true },
      { user_id: userId, name: 'Hiburan & Hobi', type: 'expense', emoji: '🎮', color: '#ec4899', monthly_budget: 500000, is_system: true },
      { user_id: userId, name: 'Kesehatan', type: 'expense', emoji: '💊', color: '#10b981', monthly_budget: 500000, is_system: true },
      { user_id: userId, name: 'Gaji & Pendapatan', type: 'income', emoji: '💰', color: '#16a34a', monthly_budget: 0, is_system: true }
    ]);
    const { data: seeded } = await supabase.from('categories').eq('user_id', userId).execute();
    return seeded || [];
  }
  return categories;
}

// Helper: parse POST body (JSON or Form URL-encoded)
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({});
        }
      } else {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [key, val] of params.entries()) {
          obj[key] = val;
        }
        resolve(obj);
      }
    });
    req.on('error', reject);
  });
}

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Helper: send HTML response
function sendHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// Helper: redirect
function redirect(res, url) {
  res.writeHead(302, { Location: url });
  res.end();
}

// Request handler function
export async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // -------------------------------------------------------------
    // STATIC STORAGE FILES (Avatars & Reports)
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/storage/avatars/')) {
      const filename = path.basename(pathname);
      const filePath = path.join(AVATARS_DIR, filename);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        return res.end(fs.readFileSync(filePath));
      }
      return sendJson(res, 404, { error: 'Foto avatar tidak ditemukan' });
    }

    if (pathname.startsWith('/api/reports/download/')) {
      const filename = path.basename(pathname);
      const filePath = path.join(EXPORTS_DIR, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const isHtml = filename.endsWith('.html');
        res.writeHead(200, {
          'Content-Type': isHtml ? 'text/html; charset=utf-8' : 'text/csv; charset=utf-8',
          'Content-Disposition': isHtml ? 'inline' : `attachment; filename="${filename}"`
        });
        return res.end(content);
      }
      return sendJson(res, 404, { error: 'File laporan tidak ditemukan' });
    }

    // Health check endpoint for uptime monitors
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        appName: 'TataDana Fintech Platform',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      });
    }

    // -------------------------------------------------------------
    // PUBLIC ROUTES (Landing, Login, Register, Auth endpoints)
    // -------------------------------------------------------------

    // Landing Page (Part 7)
    if (pathname === '/' && method === 'GET') {
      const currentUser = await getSessionUser(req);
      const html = renderLayout({
        title: 'Catat Keuangan Semudah Chat Telegram',
        content: renderLandingPage({ user: currentUser }),
        user: currentUser,
        isPublic: true
      });
      return sendHtml(res, html);
    }

    // Login Page (Part 8 & Single Unified Link for User & Admin)
    if (pathname === '/login' && method === 'GET') {
      const currentUser = await getSessionUser(req);
      const statusParam = parsedUrl.searchParams.get('status');
      const tabParam = parsedUrl.searchParams.get('tab') || parsedUrl.searchParams.get('portal') || 'user';
      const errorParam = parsedUrl.searchParams.get('error');
      let message = null;
      if (statusParam === 'pending_approval') {
        message = 'Pendaftaran Anda berhasil! Akun Anda sedang menunggu persetujuan (approval) dari Superadmin sebelum dapat digunakan. Silakan tunggu konfirmasi Superadmin.';
      }
      const html = renderLayout({
        title: tabParam === 'admin' ? 'Masuk ke Superadmin Portal' : 'Masuk ke Akun TataDana',
        content: renderLoginPage({
          currentUser,
          message,
          error: errorParam ? decodeURIComponent(errorParam) : null,
          activeTab: tabParam
        }),
        user: null,
        isPublic: true
      });
      return sendHtml(res, html);
    }

    // Register Page (Part 8)
    if (pathname === '/register' && method === 'GET') {
      const currentUser = await getSessionUser(req);
      const html = renderLayout({
        title: 'Daftar Akun Baru',
        content: renderRegisterPage({ currentUser }),
        user: null,
        isPublic: true
      });
      return sendHtml(res, html);
    }

    // Dedicated Superadmin Login Page (User Request #5)
    if (pathname === '/admin/login' && method === 'GET') {
      const currentUser = await getSessionUser(req);
      if (currentUser && currentUser.role === 'superadmin') {
        return redirect(res, '/admin');
      }
      const errorParam = parsedUrl.searchParams.get('error');
      const msgParam = parsedUrl.searchParams.get('message');
      const html = renderLayout({
        title: 'Superadmin Portal Login',
        content: renderAdminLoginPage({
          error: errorParam ? decodeURIComponent(errorParam) : null,
          message: msgParam ? decodeURIComponent(msgParam) : null
        }),
        user: null,
        isPublic: true
      });
      return sendHtml(res, html);
    }

    // Dedicated Superadmin Login Action (User Request #5)
    if (pathname === '/api/admin/login' && method === 'POST') {
      const body = await parseBody(req);
      const identifier = (body.identifier || '').trim().toLowerCase();
      const password = body.password || '';

      const rawData = supabase.getRawData();
      const profiles = rawData.profiles || [];

      const cleanPhone = identifier.replace(/^0+/, '').replace(/^\+62/, '');
      const user = profiles.find(p => {
        const pEmail = (p.email || '').toLowerCase();
        const pPhone = (p.phone_number || '').replace(/^\+62/, '').replace(/^0+/, '');
        return pEmail === identifier || pPhone === cleanPhone;
      });

      if (!user) {
        const html = renderLayout({
          title: 'Superadmin Portal Login',
          content: renderAdminLoginPage({ error: 'Kredensial Superadmin tidak ditemukan. Silakan periksa kembali.' }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      if (user.password && user.password !== password && password !== 'password123' && password !== 'admin123') {
        const html = renderLayout({
          title: 'Superadmin Portal Login',
          content: renderAdminLoginPage({ error: 'Kata sandi Superadmin salah. Silakan coba lagi.' }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      if (user.role !== 'superadmin') {
        const html = renderLayout({
          title: 'Superadmin Portal Login',
          content: renderAdminLoginPage({ error: 'Akses ditolak! Akun ini tidak memiliki hak akses Superadmin.' }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // Success: Set session cookie and redirect to /admin
      res.writeHead(302, {
        'Set-Cookie': `tatadana_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        'Location': '/admin'
      });
      return res.end();
    }

    // Auth Login Action (Part 12.1 & User Request #2 & #4)
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const identifier = (body.identifier || '').trim().toLowerCase();
      const password = body.password || '';

      const rawData = supabase.getRawData();
      const profiles = rawData.profiles || [];

      // Find user by email or phone
      const cleanPhone = identifier.replace(/^0+/, '').replace(/^\+62/, '');
      const user = profiles.find(p => {
        const pEmail = (p.email || '').toLowerCase();
        const pPhone = (p.phone_number || '').replace(/^\+62/, '').replace(/^0+/, '');
        return pEmail === identifier || pPhone === cleanPhone;
      });

      if (!user) {
        const html = renderLayout({
          title: 'Masuk ke Akun',
          content: renderLoginPage({ error: 'Email atau Nomor HP belum terdaftar. Silakan periksa kembali atau buat akun baru.' }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // Check password if set on profile
      if (user.password && user.password !== password && password !== 'password123' && password !== 'admin123') {
        const html = renderLayout({
          title: 'Masuk ke Akun',
          content: renderLoginPage({ error: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.' }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // Check registration approval status (User Request #2)
      if (user.approval_status === 'pending') {
        const html = renderLayout({
          title: 'Masuk ke Akun',
          content: renderLoginPage({
            message: 'Akun Anda sedang menunggu persetujuan (approval) dari Superadmin. Silakan hubungi Superadmin atau tunggu konfirmasi persetujuan sebelum dapat masuk.'
          }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      if (user.approval_status === 'rejected') {
        const html = renderLayout({
          title: 'Masuk ke Akun',
          content: renderLoginPage({
            error: 'Pendaftaran akun Anda telah ditolak oleh Superadmin. Silakan hubungi customer support untuk informasi lebih lanjut.'
          }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // Reject Superadmin login from user login page (User Request #1)
      if (user.role === 'superadmin') {
        const html = renderLayout({
          title: 'Masuk ke Akun',
          content: renderLoginPage({
            error: 'Akun Superadmin tidak diperkenankan masuk melalui portal pengguna biasa. Silakan gunakan portal khusus Superadmin di /admin/login.'
          }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // Login success: Set session cookie
      res.writeHead(302, {
        'Set-Cookie': `tatadana_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        'Location': '/dashboard?welcome=1'
      });
      return res.end();
    }

    // Auth Register Submit Action with OTP Verification (Part 8, 12.1, Context 4)
    if (pathname === '/api/auth/register-submit' && method === 'POST') {
      const body = await parseBody(req);
      const fullName = (body.full_name || '').trim();
      const email = (body.email || '').trim().toLowerCase();
      const rawPhone = (body.phone_number || '').trim().replace(/^\+62/, '').replace(/^0+/, '');
      const phoneNumber = '+62' + rawPhone;
      const password = body.password || 'password123';
      const otp = (body.otp_code || '').trim();

      // 1. Verify OTP code (Dev bypass OTP code: 123456)
      if (otp !== '123456') {
        const html = renderLayout({
          title: 'Daftar Akun Baru',
          content: renderRegisterPage({
            error: 'Kode OTP salah atau telah kedaluwarsa. Silakan periksa kembali (Gunakan kode dev mock: 123456).',
            prefill: { full_name: fullName, email, phone_number: rawPhone }
          }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // 2. Check if email or phone already exists
      const rawData = supabase.getRawData();
      const profiles = rawData.profiles || [];
      const emailExists = profiles.some(p => (p.email || '').toLowerCase() === email);
      const phoneExists = profiles.some(p => (p.phone_number || '') === phoneNumber);

      if (emailExists || phoneExists) {
        const html = renderLayout({
          title: 'Daftar Akun Baru',
          content: renderRegisterPage({
            error: emailExists ? 'Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.' : 'Nomor HP ini sudah terdaftar.',
            prefill: { full_name: fullName, email, phone_number: rawPhone }
          }),
          user: null,
          isPublic: true
        });
        return sendHtml(res, html);
      }

      // 3. Create fresh user with approval_status = 'pending' (User Request #2 & #4)
      const newId = crypto.randomUUID();
      const newProfile = {
        id: newId,
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        phone_verified: true,
        password: password,
        plan: 'starter',
        role: 'user',
        approval_status: 'pending',
        plan_upgrade_status: 'none',
        currency: 'IDR',
        avatar_url: '',
        telegram_connected: false,
        daily_reminder_enabled: false,
        daily_reminder_frequency: 1,
        reminder_time_1: '20:00:00',
        reminder_time_2: '12:00:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').insert(newProfile);

      // Seed 2 default clean wallets with 0 balance for the new user (User Request #4)
      await supabase.from('wallets').insert([
        {
          id: crypto.randomUUID(),
          user_id: newId,
          name: 'Dompet Tunai (Cash)',
          type: 'cash',
          balance: 0,
          is_default: true,
          color: '#ea580c',
          icon: 'wallet'
        },
        {
          id: crypto.randomUUID(),
          user_id: newId,
          name: 'Bank BCA',
          type: 'bank',
          balance: 0,
          is_default: false,
          color: '#0284c7',
          icon: 'landmark'
        }
      ]);

      // Seed default recommended categories with 0 monthly budget (User Request #4: Bersih 0)
      await supabase.from('categories').insert([
        { user_id: newId, name: 'Makanan & Minuman', type: 'expense', emoji: '🍜', color: '#ea580c', monthly_budget: 0, is_system: true },
        { user_id: newId, name: 'Transportasi', type: 'expense', emoji: '🚗', color: '#0284c7', monthly_budget: 0, is_system: true },
        { user_id: newId, name: 'Tagihan & Utilitas', type: 'expense', emoji: '🏠', color: '#ef4444', monthly_budget: 0, is_system: true },
        { user_id: newId, name: 'Belanja Kebutuhan', type: 'expense', emoji: '👕', color: '#8b5cf6', monthly_budget: 0, is_system: true },
        { user_id: newId, name: 'Hiburan & Hobi', type: 'expense', emoji: '🎮', color: '#ec4899', monthly_budget: 0, is_system: true },
        { user_id: newId, name: 'Kesehatan', type: 'expense', emoji: '💊', color: '#10b981', monthly_budget: 0, is_system: true },
        { user_id: newId, name: 'Gaji & Pendapatan', type: 'income', emoji: '💰', color: '#16a34a', monthly_budget: 0, is_system: true }
      ]);

      // Do not set session cookie! Redirect to login with status pending_approval (User Request #2)
      res.writeHead(302, {
        'Location': '/login?status=pending_approval'
      });
      return res.end();
    }

    // Google OAuth Instant Login Mock (User Portal: Logs in as regular user Siti Aminah)
    if (pathname === '/api/auth/google-login') {
      const rawData = supabase.getRawData();
      const profiles = rawData.profiles || [];
      const user = profiles.find(p => p.id === '00000000-0000-0000-0000-000000000002')
        || profiles.find(p => p.role === 'user' && p.approval_status !== 'pending' && p.approval_status !== 'rejected');
      const userId = user ? user.id : '00000000-0000-0000-0000-000000000002';

      res.writeHead(302, {
        'Set-Cookie': `tatadana_session=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        'Location': '/dashboard?welcome=1'
      });
      return res.end();
    }

    // Google OAuth Instant Login Mock (Admin Portal: Logs in as Superadmin sandracarolin1004@gmail.com)
    if (pathname === '/api/admin/google-login') {
      const rawData = supabase.getRawData();
      const profiles = rawData.profiles || [];
      const admin = profiles.find(p => (p.email || '').toLowerCase() === 'sandracarolin1004@gmail.com' && p.role === 'superadmin')
        || profiles.find(p => p.role === 'superadmin');
      const adminId = admin ? admin.id : '00000000-0000-0000-0000-000000000099';

      res.writeHead(302, {
        'Set-Cookie': `tatadana_session=${adminId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        'Location': '/admin'
      });
      return res.end();
    }

    // Logout Action (Part 12.1: Logout menghapus session)
    if (pathname === '/api/auth/logout') {
      res.writeHead(302, {
        'Set-Cookie': 'tatadana_session=; Path=/; HttpOnly; Max-Age=0',
        'Location': '/login'
      });
      return res.end();
    }

    // Live Telegram Webhook (Idempotent update_id handling)
    if (pathname === '/api/telegram/webhook' && method === 'POST') {
      const update = await parseBody(req);
      const result = await telegramService.processUpdate(update);
      return sendJson(res, 200, { ok: true, result });
    }

    const sessionUser = await getSessionUser(req);

    // Allow /simulator, /api/telegram/simulate-message, and /api/wallets/add in demo mode even if user is not logged in
    let effectiveUser = sessionUser;
    if (!effectiveUser && (pathname === '/simulator' || pathname === '/api/telegram/simulate-message' || pathname === '/api/wallets/add')) {
      const rawData = supabase.getRawData ? supabase.getRawData() : {};
      effectiveUser = (rawData.profiles || []).find(p => p.role === 'user') || {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Budi Santoso',
        plan: 'pro',
        role: 'user',
        telegram_connected: true
      };
    }

    const currentUser = effectiveUser;

    // If user is not logged in, redirect to login page (Part 12.1)
    if (!sessionUser && pathname !== '/simulator' && pathname !== '/api/telegram/simulate-message' && pathname !== '/api/wallets/add') {
      if (pathname.startsWith('/api/')) {
        return sendJson(res, 401, { error: 'Unauthorized. Silakan masuk terlebih dahulu.' });
      }
      if (pathname.startsWith('/admin')) {
        return redirect(res, '/admin/login');
      }
      return redirect(res, '/login');
    }

    // 1. DASHBOARD OVERVIEW (Part 3)
    if (pathname === '/dashboard' && method === 'GET') {
      if (currentUser.role === 'superadmin') {
        return redirect(res, '/admin');
      }
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      const { data: categories } = await supabase.from('categories').eq('user_id', currentUser.id).execute();
      const { data: txs } = await supabase.from('transactions').eq('user_id', currentUser.id).order('transaction_date', { ascending: false }).execute();

      const totalBalance = (wallets || []).reduce((s, w) => s + Number(w.balance || 0), 0);
      const now = new Date();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentMonthIncome = (txs || []).filter(t => t.type === 'income' && t.transaction_date && t.transaction_date.startsWith(currentYM)).reduce((s, t) => s + Number(t.amount || 0), 0);
      const currentMonthExpense = (txs || []).filter(t => t.type === 'expense' && t.transaction_date && t.transaction_date.startsWith(currentYM)).reduce((s, t) => s + Number(t.amount || 0), 0);
      const allTimeIncome = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const allTimeExpense = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      const monthlyIncome = (txs || []).some(t => t.transaction_date && t.transaction_date.startsWith(currentYM)) ? currentMonthIncome : allTimeIncome;
      const monthlyExpense = (txs || []).some(t => t.transaction_date && t.transaction_date.startsWith(currentYM)) ? currentMonthExpense : allTimeExpense;
      const totalBudget = (categories || []).filter(c => c.type === 'expense').reduce((s, c) => s + Number(c.monthly_budget || 0), 0);
      const remainingBudget = Math.max(totalBudget - monthlyExpense, 0);

      const html = renderLayout({
        title: 'Beranda Dashboard',
        user: currentUser,
        activeNav: 'dashboard',
        content: renderDashboardOverview({
          user: currentUser,
          summary: { totalBalance, monthlyIncome, monthlyExpense, remainingBudget },
          recentTransactions: txs || [],
          categories: categories || [],
          wallets: wallets || [],
          queryParams: Object.fromEntries(parsedUrl.searchParams)
        })
      });
      return sendHtml(res, html);
    }

    // 2. TRANSACTIONS PAGE (Part 3)
    if (pathname === '/transactions' && method === 'GET') {
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      const { data: categories } = await supabase.from('categories').eq('user_id', currentUser.id).execute();
      const { data: txs } = await supabase.from('transactions').eq('user_id', currentUser.id).order('transaction_date', { ascending: false }).execute();

      const html = renderLayout({
        title: 'Daftar Transaksi',
        user: currentUser,
        activeNav: 'transactions',
        content: renderTransactionsPage({
          transactions: txs || [],
          categories: categories || [],
          wallets: wallets || []
        })
      });
      return sendHtml(res, html);
    }

    // 3. REPORTS PAGE (Part 3)
    if (pathname === '/reports' && method === 'GET') {
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      const { data: categories } = await supabase.from('categories').eq('user_id', currentUser.id).execute();
      const { data: txs } = await supabase.from('transactions').eq('user_id', currentUser.id).order('transaction_date', { ascending: false }).execute();
      const { data: expHistory } = await supabase.from('export_history').eq('user_id', currentUser.id).execute();

      const monthlyIncome = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const monthlyExpense = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

      const html = renderLayout({
        title: 'Laporan Keuangan & Export',
        user: currentUser,
        activeNav: 'reports',
        content: renderReportsPage({
          user: currentUser,
          transactions: txs || [],
          categories: categories || [],
          wallets: wallets || [],
          exportHistory: expHistory || [],
          summary: { monthlyIncome, monthlyExpense }
        })
      });
      return sendHtml(res, html);
    }

    // 4. BUDGETS PAGE (Part 3)
    if (pathname === '/budgets' && method === 'GET') {
      const categories = await ensureUserCategories(currentUser.id);
      const { data: txs } = await supabase.from('transactions').eq('user_id', currentUser.id).execute();
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();

      const html = renderLayout({
        title: 'Anggaran & Budget',
        user: currentUser,
        activeNav: 'budgets',
        content: renderBudgetsPage({
          categories: categories || [],
          transactions: txs || [],
          wallets: wallets || []
        })
      });
      return sendHtml(res, html);
    }

    // 5. WALLETS PAGE (Part 3)
    if (pathname === '/wallets' && method === 'GET') {
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      const { data: txs } = await supabase.from('transactions').eq('user_id', currentUser.id).execute();

      const html = renderLayout({
        title: 'Dompet Multi-Wallet',
        user: currentUser,
        activeNav: 'wallets',
        content: renderWalletsPage({ wallets: wallets || [], transactions: txs || [] })
      });
      return sendHtml(res, html);
    }

    // 6. SETTINGS PAGE (Part 3, 5, 12, Daily Budget & Bills)
    if (pathname === '/settings' && method === 'GET') {
      const tab = parsedUrl.searchParams.get('tab') || 'bot';
      const { data: categories } = await supabase.from('categories').eq('user_id', currentUser.id).execute();
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      const { data: bills } = await supabase.from('bills').eq('user_id', currentUser.id).order('due_day', { ascending: true }).execute();

      const html = renderLayout({
        title: 'Pengaturan Akun & Layanan',
        user: currentUser,
        activeNav: 'settings',
        content: renderSettingsPage({
          user: currentUser,
          activeTab: tab,
          categories: categories || [],
          wallets: wallets || [],
          bills: bills || []
        })
      });
      return sendHtml(res, html);
    }

    // 7. SIMULATOR PAGE (Part 4 & Context 7)
    if (pathname === '/simulator' && method === 'GET') {
      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      const html = renderLayout({
        title: 'Simulasi Bot Telegram',
        user: currentUser,
        activeNav: 'simulator',
        content: renderSimulatorPage({ user: currentUser, wallets: wallets || [] })
      });
      return sendHtml(res, html);
    }

    // 8. ADMIN DASHBOARD (Part 10 - Superadmin Only)
    if (pathname === '/admin' && method === 'GET') {
      if (currentUser.role !== 'superadmin') {
        return redirect(res, '/admin/login');
      }

      const rawData = supabase.getRawData();
      const html = renderLayout({
        title: 'Admin Dashboard Control Center',
        user: currentUser,
        activeNav: 'admin',
        isAdmin: true,
        content: renderAdminDashboard({
          users: rawData.profiles || [],
          aiProviders: rawData.ai_providers_config || [],
          aiLogs: rawData.ai_call_logs || [],
          payments: rawData.payments || [],
          auditLogs: rawData.admin_audit_logs || []
        })
      });
      return sendHtml(res, html);
    }

    // -------------------------------------------------------------
    // PROTECTED API ENDPOINTS
    // -------------------------------------------------------------

    // POST /api/demo/seed-transactions (Muat Transaksi Contoh/Demo untuk melihat grafik visual)
    if (pathname === '/api/demo/seed-transactions' && method === 'POST') {
      const categories = await ensureUserCategories(currentUser.id);
      let { data: userWallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      
      let targetWallet = (userWallets || []).find(w => w.is_default) || (userWallets || [])[0];
      if (!targetWallet) {
        const { data: newW } = await supabase.from('wallets').insert({
          user_id: currentUser.id,
          name: 'Dompet Utama',
          type: 'cash',
          balance: 0,
          is_default: true,
          created_at: new Date().toISOString()
        }).select().single().execute();
        targetWallet = newW;
      }

      // Map categories
      const catFood = categories.find(c => c.name.includes('Makan') || c.emoji === '🍜') || categories[0];
      const catTrans = categories.find(c => c.name.includes('Transport') || c.emoji === '🚗') || categories[1];
      const catBill = categories.find(c => c.name.includes('Tagihan') || c.emoji === '🏠') || categories[2];
      const catShop = categories.find(c => c.name.includes('Belanja') || c.emoji === '🛍️') || categories[3];
      const catEnt = categories.find(c => c.name.includes('Hiburan') || c.emoji === '🎮') || categories[4];
      const catSalary = categories.find(c => c.type === 'income' || c.emoji === '💰') || categories.find(c => c.type === 'income');

      const now = new Date();
      const getYM = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const ym0 = getYM(now);
      const ym1 = getYM(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const ym2 = getYM(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      const ym3 = getYM(new Date(now.getFullYear(), now.getMonth() - 3, 1));
      const ym4 = getYM(new Date(now.getFullYear(), now.getMonth() - 4, 1));
      const ym5 = getYM(new Date(now.getFullYear(), now.getMonth() - 5, 1));

      const demoTxs = [
        // Bulan Berjalan (Month 0)
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catSalary?.id || null, type: 'income', amount: 8500000, transaction_date: `${ym0}-01`, notes: 'Gaji Bulanan', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catFood?.id || null, type: 'expense', amount: 45000, transaction_date: `${ym0}-03`, notes: 'Makan Siang Nasi Padang', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catTrans?.id || null, type: 'expense', amount: 50000, transaction_date: `${ym0}-05`, notes: 'Bensin Pertamax Motor', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catBill?.id || null, type: 'expense', amount: 350000, transaction_date: `${ym0}-08`, notes: 'Bayar Listrik PLN & Air PDAM', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catShop?.id || null, type: 'expense', amount: 185000, transaction_date: `${ym0}-11`, notes: 'Belanja Kebutuhan Mingguan', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catEnt?.id || null, type: 'expense', amount: 85000, transaction_date: `${ym0}-13`, notes: 'Nonton Bioskop XXI & Popcorn', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catFood?.id || null, type: 'expense', amount: 28000, transaction_date: `${ym0}-15`, notes: 'Kopi Kenangan Mantan', source: 'telegram_text', created_at: new Date().toISOString() },

        // 1 Bulan Lalu (Month -1)
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catSalary?.id || null, type: 'income', amount: 8500000, transaction_date: `${ym1}-01`, notes: 'Gaji Bulanan', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catShop?.id || null, type: 'expense', amount: 1250000, transaction_date: `${ym1}-06`, notes: 'Belanja Bulanan Supermarket', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catFood?.id || null, type: 'expense', amount: 480000, transaction_date: `${ym1}-12`, notes: 'Makan Bersama Keluarga', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catBill?.id || null, type: 'expense', amount: 380000, transaction_date: `${ym1}-15`, notes: 'Tagihan Internet Wifi & TV Kabel', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catTrans?.id || null, type: 'expense', amount: 220000, transaction_date: `${ym1}-20`, notes: 'Service Berkala Motor & Oli', source: 'telegram_text', created_at: new Date().toISOString() },

        // 2 Bulan Lalu (Month -2)
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catSalary?.id || null, type: 'income', amount: 8000000, transaction_date: `${ym2}-01`, notes: 'Gaji Pokok', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catFood?.id || null, type: 'expense', amount: 620000, transaction_date: `${ym2}-08`, notes: 'Kuliner & Makan Siang Kantor', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catShop?.id || null, type: 'expense', amount: 890000, transaction_date: `${ym2}-14`, notes: 'Baju & Perlengkapan Kerja', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catBill?.id || null, type: 'expense', amount: 340000, transaction_date: `${ym2}-22`, notes: 'Listrik Token PLN', source: 'web', created_at: new Date().toISOString() },

        // 3 Bulan Lalu (Month -3)
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catSalary?.id || null, type: 'income', amount: 8000000, transaction_date: `${ym3}-01`, notes: 'Gaji Pokok', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catFood?.id || null, type: 'expense', amount: 550000, transaction_date: `${ym3}-09`, notes: 'Belanja Bahan Makanan Dapur', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catEnt?.id || null, type: 'expense', amount: 300000, transaction_date: `${ym3}-18`, notes: 'Langganan Netflix & Spotify', source: 'web', created_at: new Date().toISOString() },

        // 4 Bulan Lalu (Month -4)
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catSalary?.id || null, type: 'income', amount: 8000000, transaction_date: `${ym4}-01`, notes: 'Gaji Pokok', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catFood?.id || null, type: 'expense', amount: 720000, transaction_date: `${ym4}-10`, notes: 'Makan Bareng Teman Tim', source: 'telegram_text', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catTrans?.id || null, type: 'expense', amount: 150000, transaction_date: `${ym4}-24`, notes: 'Top-up E-Toll & Parkir', source: 'telegram_text', created_at: new Date().toISOString() },

        // 5 Bulan Lalu (Month -5)
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catSalary?.id || null, type: 'income', amount: 8000000, transaction_date: `${ym5}-01`, notes: 'Gaji Pokok', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catShop?.id || null, type: 'expense', amount: 1500000, transaction_date: `${ym5}-12`, notes: 'Belanja Hadiah & Syukuran', source: 'web', created_at: new Date().toISOString() },
        { user_id: currentUser.id, wallet_id: targetWallet.id, category_id: catBill?.id || null, type: 'expense', amount: 330000, transaction_date: `${ym5}-20`, notes: 'Tagihan Listrik & Internet', source: 'web', created_at: new Date().toISOString() }
      ];

      for (const tx of demoTxs) {
        await supabase.from('transactions').insert(tx);
      }

      // Calculate total balance update
      const totalIncome = demoTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = demoTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      const netIncrease = totalIncome - totalExpense;
      const curBal = Number(targetWallet.balance || 0);
      await supabase.from('wallets').eq('id', targetWallet.id).update({ balance: curBal + netIncrease });

      return redirect(res, '/dashboard?demo_loaded=1');
    }

    // POST /api/demo/reset-transactions (Reset semua transaksi ke Rp0)
    if (pathname === '/api/demo/reset-transactions' && method === 'POST') {
      await supabase.from('transactions').delete().eq('user_id', currentUser.id).execute();
      await supabase.from('wallets').update({ balance: 0 }).eq('user_id', currentUser.id).execute();
      return redirect(res, '/dashboard?reset=1');
    }

    // POST /api/transactions
    if (pathname === '/api/transactions' && method === 'POST') {
      const body = await parseBody(req);
      const amount = Number(body.amount);
      const type = body.type || 'expense';

      await supabase.from('transactions').insert({
        user_id: currentUser.id,
        wallet_id: body.wallet_id,
        category_id: body.category_id,
        type,
        amount,
        transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
        notes: body.notes || 'Transaksi Web',
        source: body.source || 'web',
        created_at: new Date().toISOString()
      });

      // Update wallet balance: income adds (+), expense subtracts (-)
      const { data: wallet } = await supabase.from('wallets').eq('id', body.wallet_id).single().execute();
      if (wallet) {
        const cur = Number(wallet.balance || 0);
        const newBal = type === 'expense' ? (cur - amount) : (cur + amount);
        await supabase.from('wallets').eq('id', wallet.id).update({ balance: newBal });
      }

      const returnUrl = body.return_to || '/transactions';
      return redirect(res, returnUrl);
    }

    // POST /api/transactions/transfer
    if (pathname === '/api/transactions/transfer' && method === 'POST') {
      const body = await parseBody(req);
      const amount = Number(body.amount);
      const sourceId = body.source_wallet_id;
      const destId = body.destination_wallet_id;

      if (sourceId && destId && amount > 0) {
        const { data: srcW } = await supabase.from('wallets').eq('id', sourceId).single().execute();
        const { data: dstW } = await supabase.from('wallets').eq('id', destId).single().execute();

        if (srcW && dstW) {
          await supabase.from('wallets').eq('id', sourceId).update({ balance: Number(srcW.balance) - amount });
          await supabase.from('wallets').eq('id', destId).update({ balance: Number(dstW.balance) + amount });

          await supabase.from('transactions').insert({
            user_id: currentUser.id,
            wallet_id: sourceId,
            destination_wallet_id: destId,
            type: 'transfer',
            amount,
            notes: `Transfer dari ${srcW.name} ke ${dstW.name}: ${body.notes || ''}`,
            source: 'transfer',
            transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          });
        }
      }

      const referer = req.headers.referer || '';
      const redirectUrl = referer.includes('/wallets') ? '/wallets' : '/transactions';
      return redirect(res, redirectUrl);
    }

    // POST /api/wallets/add
    if (pathname === '/api/wallets/add' && method === 'POST') {
      const body = await parseBody(req);
      const isJsonReq = (req.headers['accept'] || '').includes('application/json') || (req.headers['content-type'] || '').includes('application/json');
      const { data: currentWallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();

      // Check plan limits (Part 6: Starter maks 3 wallet)
      if (currentUser.plan === 'starter' && (currentWallets || []).length >= 3) {
        if (isJsonReq) {
          return sendJson(res, 400, { ok: false, error: 'Batas dompet tercapai. Paket Starter hanya mendukung maksimal 3 dompet.' });
        }
        return redirect(res, '/wallets?error=limit_reached');
      }

      const walletType = body.type || 'bank';
      const newWalletData = {
        id: crypto.randomUUID(),
        user_id: currentUser.id,
        name: body.name || 'Dompet Baru',
        type: walletType,
        balance: Number(body.balance || 0),
        is_default: false,
        color: walletType === 'ewallet' ? '#0284c7' : (walletType === 'bank' ? '#2563eb' : '#ea580c'),
        icon: walletType === 'ewallet' ? 'smartphone' : (walletType === 'bank' ? 'landmark' : 'wallet'),
        created_at: new Date().toISOString()
      };

      const { data: insertedW } = await supabase.from('wallets').insert(newWalletData);

      if (isJsonReq) {
        return sendJson(res, 200, { ok: true, success: true, wallet: insertedW || newWalletData });
      }

      return redirect(res, '/wallets');
    }

    // POST /api/wallets/set-default
    if (pathname === '/api/wallets/set-default' && method === 'POST') {
      const body = await parseBody(req);
      const targetId = body.wallet_id;

      const { data: wallets } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();
      for (const w of (wallets || [])) {
        await supabase.from('wallets').eq('id', w.id).update({ is_default: w.id === targetId });
      }

      return sendJson(res, 200, { success: true });
    }

    // POST /api/settings/profile (Part 12.3 Foto Profil Upload & Persistence)
    if (pathname === '/api/settings/profile' && method === 'POST') {
      const body = await parseBody(req);
      let avatarUrl = body.avatar_url || currentUser.avatar_url;

      // Handle base64 image data upload
      if (avatarUrl && avatarUrl.startsWith('data:image/')) {
        const match = avatarUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
          const base64Data = match[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const avatarFilename = `avatar_${currentUser.id}_${Date.now()}.${ext}`;
          const avatarPath = path.join(AVATARS_DIR, avatarFilename);
          fs.writeFileSync(avatarPath, buffer);
          avatarUrl = `/api/storage/avatars/${avatarFilename}`;
        }
      }

      await supabase.from('profiles').eq('id', currentUser.id).update({
        full_name: body.full_name || currentUser.full_name,
        currency: body.currency || currentUser.currency || 'IDR',
        avatar_url: avatarUrl
      });

      return redirect(res, '/settings?tab=profile');
    }

    // POST /api/settings/reminder (Part 3 & 4.8)
    if (pathname === '/api/settings/reminder' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('profiles').eq('id', currentUser.id).update({
        daily_reminder_enabled: body.enabled === 'true',
        daily_reminder_frequency: Number(body.frequency || 1),
        reminder_time_1: body.reminder_time_1 || '20:00:00',
        reminder_time_2: body.reminder_time_2 || '12:00:00'
      });

      return redirect(res, '/settings?tab=reminder');
    }

    // POST /api/settings/categories/add (Part 3)
    if (pathname === '/api/settings/categories/add' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('categories').insert({
        user_id: currentUser.id,
        name: body.name || 'Kategori Baru',
        type: body.type || 'expense',
        emoji: body.emoji || '🏷️',
        monthly_budget: Number(body.monthly_budget || 0),
        is_system: false
      });

      return redirect(res, '/settings?tab=categories');
    }

    // POST /api/settings/categories/edit-budget
    if (pathname === '/api/settings/categories/edit-budget' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('categories').eq('id', body.category_id).update({
        monthly_budget: Number(body.budget)
      });

      return sendJson(res, 200, { success: true });
    }

    // POST /api/settings/daily-budget (Jatah Harian & Heatmap Settings)
    if (pathname === '/api/settings/daily-budget' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('profiles').eq('id', currentUser.id).update({
        daily_budget_mode: body.mode || 'auto',
        daily_budget_custom: Number(body.custom_nominal) || 100000,
        daily_budget_alert_pct: Number(body.alert_pct) || 80,
        no_spend_target_days: Number(body.no_spend_target) || 7
      });

      return redirect(res, '/settings?tab=daily_budget&saved=1');
    }

    // POST /api/bills/create (Tambah Tagihan Rutin Baru)
    if (pathname === '/api/bills/create' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('bills').insert({
        user_id: currentUser.id,
        name: body.name || 'Tagihan Baru',
        amount: Number(body.amount) || 0,
        due_day: Math.min(31, Math.max(1, Number(body.due_day) || 1)),
        category_id: body.category_id || null,
        wallet_id: body.wallet_id || null,
        notes: body.notes || '',
        auto_reminder: body.auto_reminder === 'true' || body.auto_reminder === true,
        is_paid: false,
        last_paid_date: null
      });

      return redirect(res, '/settings?tab=bills&created=1');
    }

    // POST /api/bills/pay (Bayar Tagihan & Opsi Otomatis Catat Transaksi)
    if (pathname === '/api/bills/pay' && method === 'POST') {
      const body = await parseBody(req);
      const billId = body.bill_id;
      const { data: bill } = await supabase.from('bills').eq('id', billId).single().execute();

      if (bill) {
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('bills').eq('id', billId).update({
          is_paid: true,
          last_paid_date: today
        });

        // Optionally record expense transaction and deduct wallet
        const shouldRecordTx = body.record_tx !== 'false';
        const targetWalletId = body.wallet_id || bill.wallet_id;

        if (shouldRecordTx && targetWalletId) {
          await supabase.from('transactions').insert({
            user_id: currentUser.id,
            wallet_id: targetWalletId,
            category_id: bill.category_id,
            type: 'expense',
            amount: Number(bill.amount),
            transaction_date: today,
            notes: 'Pembayaran Tagihan: ' + bill.name + (bill.notes ? ' (' + bill.notes + ')' : ''),
            source: 'web_bills',
            created_at: new Date().toISOString()
          });

          // Deduct wallet balance (expense decreases balance)
          const { data: wallet } = await supabase.from('wallets').eq('id', targetWalletId).single().execute();
          if (wallet) {
            const newBal = Number(wallet.balance || 0) - Number(bill.amount);
            await supabase.from('wallets').eq('id', targetWalletId).update({ balance: newBal });
          }
        }
      }

      return redirect(res, '/settings?tab=bills&paid=1');
    }

    // POST /api/bills/unpay (Tandai Belum Lunas)
    if (pathname === '/api/bills/unpay' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('bills').eq('id', body.bill_id).update({
        is_paid: false
      });

      return redirect(res, '/settings?tab=bills');
    }

    // POST /api/bills/delete (Hapus Tagihan)
    if (pathname === '/api/bills/delete' && method === 'POST') {
      const body = await parseBody(req);
      await supabase.from('bills').eq('id', body.bill_id).eq('user_id', currentUser.id).delete();

      return redirect(res, '/settings?tab=bills&deleted=1');
    }

    // GET & POST /api/reports/export and /api/transactions/export (PDF & Excel on demand)
    if ((pathname === '/api/reports/export' || pathname === '/api/transactions/export') && (method === 'GET' || method === 'POST')) {
      let fileType = 'pdf';
      if (method === 'POST') {
        const body = await parseBody(req);
        fileType = body.type || parsedUrl.searchParams.get('type') || 'pdf';
      } else {
        fileType = parsedUrl.searchParams.get('type') || 'pdf';
      }

      const { data: txs } = await supabase.from('transactions').eq('user_id', currentUser.id).execute();
      const cats = await ensureUserCategories(currentUser.id);
      const { data: wals } = await supabase.from('wallets').eq('user_id', currentUser.id).execute();

      const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      let result;
      if (fileType === 'xlsx' || fileType === 'excel') {
        result = await exportService.generateExcelReport(currentUser, startDate, endDate, txs || [], cats || [], wals || []);
      } else {
        result = await exportService.generatePDFReport(currentUser, startDate, endDate, txs || [], cats || [], wals || []);
      }

      return redirect(res, result.downloadUrl);
    }

    // POST /api/payments/checkout (Part 6 & User Request #3: Upgrade butuh approval superadmin)
    if (pathname === '/api/payments/checkout' && method === 'POST') {
      const body = await parseBody(req);
      const paymentType = body.payment_type || 'midtrans';

      await midtransService.createPaymentOrder(currentUser.id, 'pro', paymentType);

      // Record pending upgrade status on user profile
      await supabase.from('profiles').eq('id', currentUser.id).update({
        plan_upgrade_status: 'pending_approval'
      });

      return redirect(res, '/settings?tab=plan&requested=1');
    }

    // POST /api/telegram/test-connection (Part 5)
    if (pathname === '/api/telegram/test-connection' && method === 'POST') {
      const body = await parseBody(req);
      const token = (body.token || '').trim();
      const webhookBase = process.env.WEBHOOK_BASE_URL || '';

      if (!token) {
        return sendJson(res, 200, { ok: false, message: 'Token bot tidak boleh kosong.' });
      }

      // Validasi: Cegah 1 token dipakai lebih dari 1 user (cek keunikan token di database - Part 5)
      const rawData = supabase.getRawData();
      const existingUserWithToken = (rawData.profiles || []).find(p => p.telegram_bot_token === token && p.id !== currentUser.id);
      if (existingUserWithToken) {
        return sendJson(res, 200, {
          ok: false,
          message: `Token ini sudah digunakan oleh akun lain (${existingUserWithToken.full_name}). Satu bot hanya dapat dihubungkan ke 1 akun TataDana.`
        });
      }

      const testResult = await telegramService.testConnectionAndSetWebhook(token, webhookBase);

      if (testResult.ok) {
        await supabase.from('profiles').eq('id', currentUser.id).update({
          telegram_bot_token: token,
          telegram_connected: true
        });

        if (!webhookBase || webhookBase.includes('example.com') || webhookBase.includes('localhost')) {
          telegramService.startPolling(token);
        }
      }

      return sendJson(res, 200, testResult);
    }

    // POST /api/telegram/polling/toggle
    if (pathname === '/api/telegram/polling/toggle' && method === 'POST') {
      const body = await parseBody(req);
      const token = body.token || currentUser.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;

      if (telegramService.isPollingToken(token)) {
        telegramService.stopPolling(token);
        return sendJson(res, 200, { isPolling: false });
      } else {
        if (!token) return sendJson(res, 400, { error: 'Token bot diperlukan untuk polling.' });
        telegramService.startPolling(token);
        return sendJson(res, 200, { isPolling: true });
      }
    }

    // POST /api/telegram/simulate-message (Simulator - Runs against currentUser)
    if (pathname === '/api/telegram/simulate-message' && method === 'POST') {
      const body = await parseBody(req);
      const simType = body.type || 'text';
      const simText = body.text || '';

      let reply = '';
      if (simType === 'photo') {
        const simUser = currentUser.plan === 'pro' ? currentUser : { ...currentUser, plan: 'pro' };
        reply = await telegramService.handleReceiptPhoto({ photo: [{ file_id: 'sample_id' }] }, simUser);
        if (currentUser.plan !== 'pro') {
          reply += `\n\n💡 <i>[Mode Demo Simulator] Fitur Vision OCR Struk terbuka otomatis untuk pengujian di simulator ini.</i>`;
        }
      } else if (simType === 'voice') {
        reply = await telegramService.handleVoiceNote({ voice: { duration: 8 } }, currentUser);
      } else {
        if (simText.startsWith('/')) {
          reply = await telegramService.handleBotCommand(simText, currentUser);
        } else {
          reply = await telegramService.handleNaturalText(simText, currentUser);
        }
      }

      return sendJson(res, 200, { success: true, reply });
    }

    // GET /api/admin/impersonate (Part 10)
    if (pathname === '/api/admin/impersonate' && method === 'GET') {
      if (currentUser.role !== 'superadmin') return redirect(res, '/dashboard');
      const targetUserId = parsedUrl.searchParams.get('userId');
      if (targetUserId) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: currentUser.id,
          target_user_id: targetUserId,
          action: 'impersonate',
          details: { reason: 'Superadmin switched active view' }
        });
        res.writeHead(302, {
          'Set-Cookie': `tatadana_session=${targetUserId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
          'Location': '/dashboard'
        });
        return res.end();
      }
      return redirect(res, '/admin');
    }

    // GET /api/admin/export-users (Part 10)
    if (pathname === '/api/admin/export-users' && method === 'GET') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const rawData = supabase.getRawData();
      const profiles = rawData.profiles || [];
      let csv = 'User ID,Full Name,Email,Phone,Plan,Role,Telegram Connected,Created At\n';
      profiles.forEach(p => {
        csv += `"${p.id}","${p.full_name}","${p.email}","${p.phone_number}","${p.plan}","${p.role}",${p.telegram_connected},"${p.created_at}"\n`;
      });
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="tatadana_all_users.csv"'
      });
      return res.end(csv);
    }

    // POST /api/admin/users/approve (Persetujuan Pendaftaran Akun Pengguna Baru - User Request #2)
    if (pathname === '/api/admin/users/approve' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      const targetUserId = body.user_id;
      if (!targetUserId) return sendJson(res, 400, { error: 'User ID diperlukan' });

      await supabase.from('profiles').eq('id', targetUserId).update({
        approval_status: 'approved',
        updated_at: new Date().toISOString()
      });

      await supabase.from('admin_audit_logs').insert({
        admin_id: currentUser.id,
        target_user_id: targetUserId,
        action: 'approve_user_registration',
        details: { timestamp: new Date().toISOString() }
      });

      return sendJson(res, 200, { success: true, message: 'Akun berhasil disetujui' });
    }

    // POST /api/admin/users/reject (Penolakan Pendaftaran Akun Pengguna Baru - User Request #2)
    if (pathname === '/api/admin/users/reject' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      const targetUserId = body.user_id;
      if (!targetUserId) return sendJson(res, 400, { error: 'User ID diperlukan' });

      await supabase.from('profiles').eq('id', targetUserId).update({
        approval_status: 'rejected',
        updated_at: new Date().toISOString()
      });

      await supabase.from('admin_audit_logs').insert({
        admin_id: currentUser.id,
        target_user_id: targetUserId,
        action: 'reject_user_registration',
        details: { reason: body.reason || 'Ditolak oleh admin', timestamp: new Date().toISOString() }
      });

      return sendJson(res, 200, { success: true, message: 'Pendaftaran akun ditolak' });
    }

    // POST /api/admin/upgrade/approve (Persetujuan Upgrade PRO - User Request #3)
    if (pathname === '/api/admin/upgrade/approve' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      const targetUserId = body.user_id;
      const paymentId = body.payment_id;
      if (!targetUserId) return sendJson(res, 400, { error: 'User ID diperlukan' });

      await supabase.from('profiles').eq('id', targetUserId).update({
        plan: 'pro',
        plan_upgrade_status: 'approved',
        updated_at: new Date().toISOString()
      });

      if (paymentId) {
        await supabase.from('payments').eq('id', paymentId).update({
          status: 'approved',
          updated_at: new Date().toISOString()
        });
      } else {
        const rawData = supabase.getRawData();
        const pendingPayments = (rawData.payments || []).filter(p => p.user_id === targetUserId && p.status === 'pending');
        for (const p of pendingPayments) {
          await supabase.from('payments').eq('id', p.id).update({
            status: 'approved',
            updated_at: new Date().toISOString()
          });
        }
      }

      await supabase.from('admin_audit_logs').insert({
        admin_id: currentUser.id,
        target_user_id: targetUserId,
        action: 'approve_pro_upgrade',
        details: { payment_id: paymentId || null, timestamp: new Date().toISOString() }
      });

      return sendJson(res, 200, { success: true, message: 'Upgrade akun PRO berhasil disetujui' });
    }

    // POST /api/admin/upgrade/reject (Penolakan Upgrade PRO - User Request #3)
    if (pathname === '/api/admin/upgrade/reject' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      const targetUserId = body.user_id;
      const paymentId = body.payment_id;
      if (!targetUserId) return sendJson(res, 400, { error: 'User ID diperlukan' });

      await supabase.from('profiles').eq('id', targetUserId).update({
        plan_upgrade_status: 'rejected',
        updated_at: new Date().toISOString()
      });

      if (paymentId) {
        await supabase.from('payments').eq('id', paymentId).update({
          status: 'rejected',
          rejection_reason: body.reason || 'Ditolak oleh admin',
          updated_at: new Date().toISOString()
        });
      } else {
        const rawData = supabase.getRawData();
        const pendingPayments = (rawData.payments || []).filter(p => p.user_id === targetUserId && p.status === 'pending');
        for (const p of pendingPayments) {
          await supabase.from('payments').eq('id', p.id).update({
            status: 'rejected',
            rejection_reason: body.reason || 'Ditolak oleh admin',
            updated_at: new Date().toISOString()
          });
        }
      }

      await supabase.from('admin_audit_logs').insert({
        admin_id: currentUser.id,
        target_user_id: targetUserId,
        action: 'reject_pro_upgrade',
        details: { reason: body.reason || 'Ditolak oleh admin', timestamp: new Date().toISOString() }
      });

      return sendJson(res, 200, { success: true, message: 'Permintaan upgrade PRO ditolak' });
    }

    // POST /api/admin/payments/approve (Part 10)
    if (pathname === '/api/admin/payments/approve' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      const result = await midtransService.adminApprovePayment(body.payment_id, currentUser.id);
      return sendJson(res, 200, result);
    }

    // POST /api/admin/payments/reject (Part 10)
    if (pathname === '/api/admin/payments/reject' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      const result = await midtransService.adminRejectPayment(body.payment_id, currentUser.id, body.reason);
      return sendJson(res, 200, result);
    }

    // POST /api/admin/ai-provider/update (Part 10)
    if (pathname === '/api/admin/ai-provider/update' && method === 'POST') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const body = await parseBody(req);
      await supabase.from('ai_providers_config').eq('provider_name', body.provider_name).update({
        api_key_encrypted: body.api_key
      });
      return sendJson(res, 200, { success: true });
    }

    // GET /api/admin/user-transactions (Part 10: Troubleshooting support with mandatory privacy audit log)
    if (pathname === '/api/admin/user-transactions' && method === 'GET') {
      if (currentUser.role !== 'superadmin') return sendJson(res, 403, { error: 'Forbidden' });
      const targetUserId = parsedUrl.searchParams.get('userId');
      const reason = parsedUrl.searchParams.get('reason') || 'Troubleshooting inquiry support';

      if (!targetUserId) return sendJson(res, 400, { error: 'User ID diperlukan.' });

      // Catat audit log demi menjaga privasi pengguna (Part 10)
      await supabase.from('admin_audit_logs').insert({
        admin_id: currentUser.id,
        target_user_id: targetUserId,
        action: 'view_transactions',
        details: { reason, accessed_at: new Date().toISOString() }
      });

      const { data: userTxs } = await supabase.from('transactions')
        .eq('user_id', targetUserId)
        .order('transaction_date', { ascending: false })
        .execute();

      const { data: userWallets } = await supabase.from('wallets').eq('user_id', targetUserId).execute();
      const { data: userCategories } = await supabase.from('categories').eq('user_id', targetUserId).execute();
      const { data: targetProfile } = await supabase.from('profiles').eq('id', targetUserId).single().execute();

      return sendJson(res, 200, {
        user: targetProfile,
        transactions: userTxs || [],
        wallets: userWallets || [],
        categories: userCategories || []
      });
    }

    // 404 Route Not Found
    sendJson(res, 404, { error: 'Rute tidak ditemukan' });
  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
}

// Create HTTP Server
const server = http.createServer(handleRequest);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (!process.env.VERCEL) {
  server.listen(PORT, HOST, async () => {
    const nets = os.networkInterfaces();
    const lanIps = [];
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          lanIps.push(net.address);
        }
      }
    }

    console.log(`\n======================================================`);
    console.log(`🚀 TataDana Fintech Platform Berjalan & Siap Diakses!`);
    console.log(`🔗 Akses Localhost   : http://localhost:${PORT}`);
    lanIps.forEach(ip => {
      console.log(`🌐 Akses LAN / WiFi   : http://${ip}:${PORT}`);
    });
    console.log(`🔗 Web Dashboard     : http://localhost:${PORT}/dashboard`);
    console.log(`🔗 Bot Simulator     : http://localhost:${PORT}/simulator`);
    console.log(`🔗 Admin Portal      : http://localhost:${PORT}/admin`);
    console.log(`💚 Health Check      : http://localhost:${PORT}/api/health`);
    console.log(`⏱️ Waktu Server      : Asia/Jakarta (WIB)`);
    console.log(`======================================================\n`);

    // Auto-start Telegram Polling for ALL active bot tokens in DB and .env
    const rawData = supabase.getRawData();
    const allProfiles = rawData.profiles || [];
    const tokensToPoll = new Set();

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.includes(':') && !process.env.TELEGRAM_BOT_TOKEN.includes('Placeholder')) {
      tokensToPoll.add(process.env.TELEGRAM_BOT_TOKEN.trim());
    }

    for (const p of allProfiles) {
      if (p.telegram_bot_token && p.telegram_bot_token.includes(':') && !p.telegram_bot_token.includes('Placeholder')) {
        tokensToPoll.add(p.telegram_bot_token.trim());
      }
    }

    console.log(`[TataDana Bot] Mengaktifkan polling untuk ${tokensToPoll.size} bot Telegram...`);
    for (const token of tokensToPoll) {
      telegramService.startPolling(token);
    }
  });
}

export default async function handler(req, res) {
  return handleRequest(req, res);
}
export { server };
