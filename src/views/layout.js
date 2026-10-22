// ====================================================================
// TataDana - Unified Frontend Layout & Theme System
// Style: Modern Indonesian Fintech (Orange + White Theme)
// Font: Plus Jakarta Sans / Inter
// ====================================================================

function getInitials(name) {
  if (!name) return 'TD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function renderLayout({ title, content, user = null, activeNav = '', isAdmin = false, isPublic = false }) {
  const userPlan = user?.plan || 'starter';
  const userName = user?.full_name || 'Pengguna TataDana';
  const userRole = user?.role || 'user';
  const userAvatar = user?.avatar_url || '';
  const userInitials = getInitials(userName);

  return `
<!DOCTYPE html>
<html lang="id" class="${isPublic ? 'scroll-smooth' : 'h-full bg-slate-50'}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} | TataDana</title>
  
  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#fdf2f4',
              100: '#fce7eb',
              200: '#f9d2d9',
              300: '#f4abb9',
              400: '#eb7991',
              500: '#9f1239', // Accent Burgundy
              600: '#800020', // Iconic Burgundy Primary
              700: '#67001a', // Rich Deep Burgundy
              800: '#4c0519', // Darkest Burgundy
              900: '#33000d',
            }
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- Chart.js with Resilient Multi-CDN Fallbacks -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" onerror="this.onerror=null;this.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';"></script>
  <script>
    if (typeof Chart === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/chart.js@4.4.1/dist/chart.umd.js';
      s.onload = () => { if (typeof initDashboardCharts === 'function') initDashboardCharts(); };
      document.head.appendChild(s);
    }
  </script>

  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  </style>
<body class="${isPublic ? 'text-slate-800 antialiased min-h-screen bg-white' : 'h-full text-slate-800 antialiased flex flex-col bg-slate-50'}">

  ${(user && !isPublic) ? `
  <!-- APP SHELL (SIDEBAR + TOPBAR + MAIN) -->
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <!-- Desktop Sidebar (Part 9) -->
    <aside class="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200">
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <a href="/dashboard" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/25">
            TD
          </div>
          <span class="font-bold text-xl tracking-tight text-slate-900">Tata<span class="text-brand-600">Dana</span></span>
        </a>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        <a href="/dashboard" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'dashboard' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="home" class="w-4 h-4 text-brand-600"></i>
          Beranda
        </a>
        <a href="/transactions" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'transactions' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="credit-card" class="w-4 h-4 text-brand-600"></i>
          Transaksi
        </a>
        <a href="/reports" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'reports' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="bar-chart-3" class="w-4 h-4 text-brand-600"></i>
          Laporan
        </a>
        <a href="/budgets" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'budgets' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="target" class="w-4 h-4 text-brand-600"></i>
          Budget
        </a>
        <a href="/wallets" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'wallets' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="wallet" class="w-4 h-4 text-brand-600"></i>
          Dompet (Wallets)
        </a>
        <a href="/settings" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'settings' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="settings" class="w-4 h-4 text-brand-600"></i>
          Pengaturan
        </a>
        <a href="/simulator" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeNav === 'simulator' ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}">
          <i data-lucide="message-square" class="w-4 h-4 text-brand-600"></i>
          Simulasi Bot Telegram
        </a>
        <button onclick="openModal('panduanModal')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-left">
          <i data-lucide="book-open" class="w-4 h-4 text-brand-600"></i>
          Panduan Aplikasi
        </button>
      </nav>

      <!-- Sidebar User Footer -->
      <div class="p-4 border-t border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${userPlan === 'pro' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-slate-100 text-slate-700'}">
            ${userPlan === 'pro' ? '⭐ Paket PRO' : '🌱 Paket Starter'}
          </span>
          <a href="/settings?tab=plan" class="text-xs font-semibold text-brand-600 hover:underline">Kelola</a>
        </div>
        <div class="flex items-center gap-3">
          ${userAvatar ? `
            <img src="${userAvatar}" alt="${userName}" class="w-9 h-9 rounded-full object-cover border border-slate-200"/>
          ` : `
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-rose-700 text-white font-bold text-xs flex items-center justify-center border border-brand-200 shadow-sm">
              ${userInitials}
            </div>
          `}
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">${userName}</p>
            <p class="text-xs text-slate-500 truncate">${user.email || user.phone_number || '-'}</p>
          </div>
          <a href="/api/auth/logout" title="Keluar" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-slate-50">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </a>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Mobile Topbar -->
      <header class="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <a href="/dashboard" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">TD</div>
          <span class="font-bold text-base text-slate-900">Tata<span class="text-brand-600">Dana</span></span>
        </a>
        <div class="flex items-center gap-2">
          <a href="/simulator" class="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <i data-lucide="message-square" class="w-5 h-5 text-brand-600"></i>
          </a>
          <button id="mobileMenuBtn" class="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <i data-lucide="menu" class="w-5 h-5"></i>
          </button>
        </div>
      </header>

      <!-- Mobile Menu Dropdown -->
      <div id="mobileMenu" class="hidden md:hidden bg-white border-b border-slate-200 p-4 space-y-2">
        <a href="/dashboard" class="block py-2 text-sm font-medium text-slate-700">🏠 Beranda</a>
        <a href="/transactions" class="block py-2 text-sm font-medium text-slate-700">💳 Transaksi</a>
        <a href="/reports" class="block py-2 text-sm font-medium text-slate-700">📊 Laporan</a>
        <a href="/budgets" class="block py-2 text-sm font-medium text-slate-700">🎯 Budget</a>
        <a href="/wallets" class="block py-2 text-sm font-medium text-slate-700">👛 Dompet</a>
        <a href="/settings" class="block py-2 text-sm font-medium text-slate-700">⚙️ Pengaturan</a>
        <a href="/simulator" class="block py-2 text-sm font-medium text-slate-700">🤖 Simulator Bot</a>
        <button onclick="openModal('panduanModal')" class="w-full text-left block py-2 text-sm font-medium text-brand-700">📖 Panduan Aplikasi</button>
        <a href="/api/auth/logout" class="block py-2 text-sm font-medium text-red-600">🚪 Keluar</a>
      </div>

      <!-- Main Scrollable Body -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div class="max-w-7xl mx-auto space-y-6">
          ${content}
        </div>
      </main>
    </div>
  </div>
  ` : `
  <!-- PUBLIC / GUEST LAYOUT (Landing & Auth) -->
  <div class="w-full min-h-screen">
    ${content}
  </div>
  `}

  <!-- ============================================================== -->
  <!-- GLOBAL INTERACTIVE PANDUAN PENGGUNAAN APLIKASI (AUTO-POPUP) -->
  <!-- ============================================================== -->
  <div id="panduanModal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
    <div class="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Modal Header (Burgundy Gradient) -->
      <div class="px-6 py-5 bg-gradient-to-r from-brand-900 via-brand-700 to-rose-700 text-white relative">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/20">
              TD
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-rose-100 uppercase tracking-wider mb-1">
                <span>✨ Panduan Interaktif</span>
              </div>
              <h3 class="font-extrabold text-lg sm:text-xl text-white tracking-tight">Tata Cara Penggunaan TataDana</h3>
              <p class="text-xs text-rose-100/90 mt-0.5">Catat keuangan semudah chat Telegram — ikuti 5 langkah panduan berikut:</p>
            </div>
          </div>
          <button onclick="closeModal('panduanModal')" title="Tutup" class="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- 5 Interactive Step Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-4 mt-2 border-t border-white/15">
          <button id="guideTabBtn1" onclick="switchGuideTab(1)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-brand-800 shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap">
            <span>👛 1. Dompet & Budget</span>
          </button>
          <button id="guideTabBtn2" onclick="switchGuideTab(2)" class="px-3 py-1.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-all whitespace-nowrap">
            <span>🤖 2. Sambung Bot</span>
          </button>
          <button id="guideTabBtn3" onclick="switchGuideTab(3)" class="px-3 py-1.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-all whitespace-nowrap">
            <span>💬 3. Cara Chat</span>
          </button>
          <button id="guideTabBtn4" onclick="switchGuideTab(4)" class="px-3 py-1.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-all whitespace-nowrap">
            <span>⚡ 4. Perintah Bot</span>
          </button>
          <button id="guideTabBtn5" onclick="switchGuideTab(5)" class="px-3 py-1.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-all whitespace-nowrap">
            <span>📊 5. Laporan & PDF</span>
          </button>
        </div>
      </div>

      <!-- Modal Body (Panes) -->
      <div class="flex-1 overflow-y-auto p-6 text-slate-700 custom-scrollbar space-y-4">
        
        <!-- PANE 1: DOMPET & BUDGET -->
        <div id="guideTabPane1" class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <i data-lucide="wallet" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-base text-slate-900">Langkah 1: Siapkan Dompet & Batas Budget</h4>
              <p class="text-xs text-slate-500">Kelola rekening finansial Anda dan tetapkan kuota anggaran bulanan</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3 pt-1">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div class="font-bold text-xs text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="layers" class="w-3.5 h-3.5"></i> Multi-Wallet (Banyak Dompet)
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Anda bisa membuat banyak dompet: <b>Cash (Tunai)</b>, <b>BCA</b>, <b>Mandiri</b>, <b>GoPay</b>, hingga <b>OVO</b>. Set 1 dompet sebagai <b>Dompet Utama (Default)</b> untuk pencatatan otomatis dari Telegram.
              </p>
              <a href="/wallets" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline pt-1">
                Buka Menu Dompet →
              </a>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div class="font-bold text-xs text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="target" class="w-3.5 h-3.5"></i> Kuota Anggaran (Budget)
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tentukan batas maksimal belanja per kategori (misal: <i>Makanan Rp1.500.000</i>). Bot Telegram akan otomatis mengirim peringatan saat pemakaian budget menyentuh <b>80%</b> dan <b>100%</b>.
              </p>
              <a href="/budgets" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline pt-1">
                Buka Menu Budget →
              </a>
            </div>
          </div>

          <div class="pt-3 flex justify-end">
            <button onclick="switchGuideTab(2)" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5">
              <span>Lanjut ke Langkah 2: Sambung Bot Telegram</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- PANE 2: SAMBUNG BOT TELEGRAM -->
        <div id="guideTabPane2" class="hidden space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <i data-lucide="bot" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-base text-slate-900">Langkah 2: Hubungkan Bot Telegram ke Akun Anda</h4>
              <p class="text-xs text-slate-500">Hanya perlu 60 detik untuk menghubungkan bot ke TataDana</p>
            </div>
          </div>

          <div class="space-y-2.5 text-xs text-slate-700 leading-relaxed">
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
              <div>
                <p class="font-bold text-slate-900">Buat Bot di @BotFather:</p>
                <p class="text-slate-600">Buka aplikasi Telegram, cari akun <b>@BotFather</b>, lalu kirim <code>/newbot</code>. Beri nama dan username bot (akhiri kata 'bot', contoh: <code>tatadana_keuangan_bot</code>). Salin <b>HTTP API Token</b> yang diberikan.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
              <div>
                <p class="font-bold text-slate-900">Tempel Token & Test Koneksi:</p>
                <p class="text-slate-600">Buka menu <b>Pengaturan -> Tab Telegram Bot</b> di TataDana, tempel token, lalu klik tombol <b>Test Koneksi</b> sampai status 🟢 <b>Terhubung</b>.</p>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
              <div>
                <p class="font-bold text-slate-900">Tekan Start di Telegram:</p>
                <p class="text-slate-600">Buka bot Anda di Telegram dan tekan tombol <code>/start</code>. Akun Telegram Anda kini resmi tersinkronisasi otomatis!</p>
              </div>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-between">
            <button onclick="switchGuideTab(1)" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all">
              ← Kembali
            </button>
            <div class="flex items-center gap-2">
              <a href="/settings?tab=bot" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all">
                Buka Tab Telegram Bot →
              </a>
              <button onclick="switchGuideTab(3)" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5">
                <span>Lanjut ke Langkah 3: Cara Chat</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- PANE 3: CARA CHAT & TRANSAKSI -->
        <div id="guideTabPane3" class="hidden space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <i data-lucide="message-square" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-base text-slate-900">Langkah 3: Cara Mencatat Transaksi Sehari-Hari</h4>
              <p class="text-xs text-slate-500">Tiga cara cerdas mencatat pemasukan dan pengeluaran</p>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Teks Bebas -->
            <div class="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-2">
              <div class="flex items-center gap-2 font-bold text-xs text-brand-800">
                <span class="px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px]">1. Teks Natural</span>
                Ketik seperti chat dengan teman
              </div>
              <div class="grid sm:grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 rounded-xl bg-white border border-brand-200">
                  <span class="text-red-600 font-bold block mb-1">💸 Contoh Pengeluaran:</span>
                  <code class="text-slate-800 bg-slate-50 px-2 py-1 rounded block">"beli bakso 15rb"</code>
                  <code class="text-slate-800 bg-slate-50 px-2 py-1 rounded block mt-1">"kopi susu 25k"</code>
                  <code class="text-slate-800 bg-slate-50 px-2 py-1 rounded block mt-1">"bensin motor 35000"</code>
                </div>
                <div class="p-2.5 rounded-xl bg-white border border-brand-200">
                  <span class="text-emerald-600 font-bold block mb-1">💰 Contoh Pemasukan:</span>
                  <code class="text-slate-800 bg-slate-50 px-2 py-1 rounded block">"gajian 6jt"</code>
                  <code class="text-slate-800 bg-slate-50 px-2 py-1 rounded block mt-1">"fee freelance 1.5jt"</code>
                  <code class="text-slate-800 bg-slate-50 px-2 py-1 rounded block mt-1">"bonus penjualan 500k"</code>
                </div>
              </div>
              <p class="text-[11px] text-slate-500">
                *AI secara otomatis memparsing format Indonesia: <b>rb/ribu</b> (1.000), <b>k</b> (1.000), <b>jt/juta</b> (1.000.000) dan mengkategorikannya dengan akurat.
              </p>
            </div>

            <!-- Voice Note & Struk -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <i data-lucide="mic" class="w-4 h-4 text-brand-600"></i> 2. Pesan Suara (Voice Note)
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Tekan ikon mic di Telegram, ucapkan pengeluaran Anda (maks 60s). Contoh: <i>"Makan siang padang 25 ribu"</i>. AI Speech-to-Text langsung mencatatnya!
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <i data-lucide="camera" class="w-4 h-4 text-brand-600"></i> 3. Foto Struk Belanja (Pro)
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Kirim foto struk belanja supermarket / restoran fisik ke bot. AI Vision OCR otomatis mengekstrak tanggal, total, dan rincian belanjaan.
                </p>
              </div>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-between">
            <button onclick="switchGuideTab(2)" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all">
              ← Kembali
            </button>
            <button onclick="switchGuideTab(4)" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5">
              <span>Lanjut ke Langkah 4: Perintah Bot</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- PANE 4: PERINTAH BOT -->
        <div id="guideTabPane4" class="hidden space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <i data-lucide="terminal" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-base text-slate-900">Langkah 4: Perintah Pintasan Telegram (Command Bot)</h4>
              <p class="text-xs text-slate-500">Ketik perintah cepat di chat untuk mendapatkan rekap keuangan instan</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <code class="px-2 py-1 rounded bg-white border border-slate-200 font-bold text-brand-700 text-xs font-mono">/saldo</code>
              <p class="text-xs text-slate-600 leading-snug">Menampilkan rincian saldo semua dompet (Cash, BCA, e-wallet) dan total akumulasi.</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <code class="px-2 py-1 rounded bg-white border border-slate-200 font-bold text-brand-700 text-xs font-mono">/hari ini</code>
              <p class="text-xs text-slate-600 leading-snug">Rekap pengeluaran & pemasukan yang tercatat khusus hari ini.</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <code class="px-2 py-1 rounded bg-white border border-slate-200 font-bold text-brand-700 text-xs font-mono">/minggu ini</code>
              <p class="text-xs text-slate-600 leading-snug">Rangkuman arus kas pengeluaran dan pemasukan 7 hari terakhir.</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <code class="px-2 py-1 rounded bg-white border border-slate-200 font-bold text-brand-700 text-xs font-mono">/bulan ini</code>
              <p class="text-xs text-slate-600 leading-snug">Rekap pengeluaran bulanan beserta breakdown persentase tiap kategori.</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <code class="px-2 py-1 rounded bg-white border border-slate-200 font-bold text-brand-700 text-xs font-mono">/budget</code>
              <p class="text-xs text-slate-600 leading-snug">Pantau visual progress bar pemakaian kuota anggaran per kategori.</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <code class="px-2 py-1 rounded bg-white border border-slate-200 font-bold text-brand-700 text-xs font-mono">/bantuan</code>
              <p class="text-xs text-slate-600 leading-snug">Daftar lengkap seluruh perintah bot dan bantuan pemakaian.</p>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-between">
            <button onclick="switchGuideTab(3)" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all">
              ← Kembali
            </button>
            <button onclick="switchGuideTab(5)" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5">
              <span>Lanjut ke Langkah 5: Laporan & Export</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- PANE 5: LAPORAN & EXPORT -->
        <div id="guideTabPane5" class="hidden space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-base text-slate-900">Langkah 5: Pantau Grafik & Unduh Laporan (PDF / Excel)</h4>
              <p class="text-xs text-slate-500">Analisis keuangan mendalam dan ekspor pembukuan siap cetak</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-3">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div class="font-bold text-xs text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="pie-chart" class="w-3.5 h-3.5"></i> Dashboard Visual Real-Time
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Pantau 4 kartu ringkasan saldo, pie chart pengeluaran per kategori, bar chart perbandingan 6 bulan, dan tren pengeluaran harian yang otomatis terbarui saat Anda chat di Telegram.
              </p>
              <a href="/dashboard" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline pt-1">
                Buka Beranda Dashboard →
              </a>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div class="font-bold text-xs text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i> Export On-Demand PDF & Excel
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Di halaman Laporan, filter transaksi berdasarkan periode atau dompet, lalu klik <b>Export PDF</b> untuk laporan resmi bernomor dokumen atau <b>Export Excel (.xlsx)</b> untuk spreadsheet pembukuan.
              </p>
              <a href="/reports" class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline pt-1">
                Buka Halaman Laporan →
              </a>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-between border-t border-slate-100">
            <button onclick="switchGuideTab(4)" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all">
              ← Kembali
            </button>
            <button onclick="closeModal('panduanModal')" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-700 hover:from-brand-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2 transform hover:scale-105">
              <span>Mulai Gunakan TataDana Sekarang 🚀</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <label class="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
          <input type="checkbox" id="autoGuideCb" onchange="toggleAutoGuide(this)" class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"/>
          <span>Munculkan tata cara ini otomatis saat membuka aplikasi</span>
        </label>
        <button onclick="closeModal('panduanModal')" class="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-all">
          Tutup Panduan
        </button>
      </div>

    </div>
  </div>

  <!-- FLOATING HELPER BUTTON (QUICK ACCESS IN DASHBOARD ONLY) -->
  ${(user && !isPublic) ? `
  <div class="fixed bottom-6 right-6 z-40">
    <button onclick="openModal('panduanModal')" title="Tata Cara Penggunaan Aplikasi" class="px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-rose-700 hover:from-brand-700 hover:to-rose-800 text-white font-bold text-xs shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-105 transition-all flex items-center gap-2 border border-white/20">
      <i data-lucide="book-open" class="w-4 h-4"></i>
      <span>Tata Cara Aplikasi</span>
    </button>
  </div>
  ` : ''}

  <script>
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
    // Mobile menu toggle
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // Global Modal Functions
    window.openModal = function(id) {
      const m = document.getElementById(id);
      if (m) {
        m.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }
    };
    window.closeModal = function(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('hidden');
    };

    // Guide Tab Switcher
    window.switchGuideTab = function(stepIndex) {
      for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById('guideTabBtn' + i);
        const pane = document.getElementById('guideTabPane' + i);
        if (btn && pane) {
          if (i === stepIndex) {
            btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-brand-800 shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap';
            pane.classList.remove('hidden');
          } else {
            btn.className = 'px-3 py-1.5 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-all whitespace-nowrap';
            pane.classList.add('hidden');
          }
        }
      }
      if (window.lucide) lucide.createIcons();
    };

    // Auto-open Guide Modal on load ONLY when user is logged in (after register / login on dashboard)
    window.addEventListener('DOMContentLoaded', () => {
      const isUserLoggedIn = ${user ? 'true' : 'false'};
      const isPublicPage = ${isPublic ? 'true' : 'false'};
      const urlParams = new URLSearchParams(window.location.search);
      const isWelcome = urlParams.has('welcome') || urlParams.has('guide');

      // Only auto-open if user is logged in and not on public pages
      if (isUserLoggedIn && !isPublicPage) {
        const autoDisabled = localStorage.getItem('tatadana_disable_auto_guide');
        const cb = document.getElementById('autoGuideCb');
        if (cb) {
          cb.checked = (autoDisabled !== 'true');
        }
        if (isWelcome || autoDisabled !== 'true') {
          openModal('panduanModal');
        }
      }
    });

    window.toggleAutoGuide = function(cb) {
      if (cb.checked) {
        localStorage.removeItem('tatadana_disable_auto_guide');
      } else {
        localStorage.setItem('tatadana_disable_auto_guide', 'true');
      }
    };
  </script>
</body>
</html>
  `;
}
