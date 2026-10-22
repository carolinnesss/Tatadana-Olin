// ====================================================================
// TataDana - Auth Pages (Login & Register with OTP Phone Verification)
// Part 8: Split layout premium (40% branding panel, 60% form)
// Focus state border glow orange, responsive mobile full screen
// ====================================================================

export function renderLoginPage({ error = null, success = null, message = null, currentUser = null, activeTab = 'user' } = {}) {
  return `
  <div class="min-h-screen flex flex-col md:flex-row bg-white">
    <!-- Kiri (40%): Branding Panel (Hidden on mobile) -->
    <div class="hidden md:flex md:w-5/12 bg-gradient-to-br from-brand-900 via-brand-700 to-rose-700 p-12 flex-col justify-between text-white relative overflow-hidden">
      <div class="relative z-10">
        <a href="/" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-inner">TD</div>
          <span class="font-bold text-2xl tracking-tight">TataDana</span>
        </a>
      </div>

      <div class="relative z-10 space-y-4 max-w-sm">
        <div class="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
          Fintech Personal Assistant
        </div>
        <h2 class="text-4xl font-extrabold leading-tight tracking-tight">
          Keuanganmu.<br/>Terkontrol.
        </h2>
        <p class="text-rose-100 text-sm leading-relaxed">
          Catat pengeluaran semudah kirim pesan Telegram. Semua transaksi otomatis terorganisir rapi di dashboard pribadimu.
        </p>
      </div>

      <div class="relative z-10 text-xs text-rose-200">
        &copy; 2026 TataDana Indonesia. Keamanan data dilindungi Supabase RLS.
      </div>

      <!-- Subtle background ambient shapes -->
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-400/20 blur-3xl pointer-events-none"></div>
    </div>

    <!-- Kanan (60%): Form Panel -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white">
      <div class="w-full max-w-md space-y-7">
        <!-- Mobile Logo -->
        <div class="md:hidden flex items-center gap-2 mb-6">
          <div class="w-8 h-8 rounded-lg bg-brand-600 text-white font-extrabold flex items-center justify-center text-sm">TD</div>
          <span class="font-bold text-xl text-slate-900">Tata<span class="text-brand-600">Dana</span></span>
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
          <p class="text-sm text-slate-500">Pilih tampilan portal untuk masuk ke akun Anda.</p>
        </div>

        <!-- Single Link Portal Tabs: Tampilan Pengguna & Tampilan Admin -->
        <div class="p-1.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-inner">
          <button type="button" id="tabBtnUser" onclick="switchLoginPortal('user')" class="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'admin' ? 'text-slate-600 hover:text-slate-900' : 'bg-white text-brand-700 shadow-sm border border-slate-200/80'}">
            <i data-lucide="user" class="w-4 h-4"></i>
            <span>Tampilan Pengguna</span>
          </button>
          <button type="button" id="tabBtnAdmin" onclick="switchLoginPortal('admin')" class="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'admin' ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md' : 'text-slate-600 hover:text-purple-700'}">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span>Tampilan Admin</span>
          </button>
        </div>

        ${currentUser ? `
        <div class="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-slate-800 flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-rose-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              ${(currentUser.full_name || 'TD').slice(0, 2).toUpperCase()}
            </div>
            <div class="min-w-0">
              <p class="font-bold text-xs text-slate-900 truncate">Login aktif: <span class="text-brand-700 font-extrabold">${currentUser.full_name}</span></p>
              <p class="text-[11px] text-slate-500 truncate">${currentUser.email || currentUser.phone_number}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <a href="/dashboard" class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1">
              <span>Ke Dashboard</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
            <a href="/api/auth/logout" class="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 font-semibold text-xs transition-all">
              Keluar
            </a>
          </div>
        </div>
        ` : ''}

        ${error ? `
        <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
          <i data-lucide="alert-circle" class="w-4 h-4 flex-shrink-0 text-red-600"></i>
          <span>${error}</span>
        </div>
        ` : ''}

        ${success ? `
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <i data-lucide="check-circle" class="w-4 h-4 flex-shrink-0 text-emerald-600"></i>
          <span>${success}</span>
        </div>
        ` : ''}

        ${message ? `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 flex items-start gap-2.5">
          <i data-lucide="clock" class="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5"></i>
          <div>
            <div class="font-bold text-amber-900">Menunggu Persetujuan Superadmin</div>
            <div class="mt-0.5 leading-relaxed">${message}</div>
          </div>
        </div>
        ` : ''}

        <!-- ========================================== -->
        <!-- 1. TAMPILAN PENGGUNA (USER LOGIN PANEL)   -->
        <!-- ========================================== -->
        <div id="panelUserLogin" class="${activeTab === 'admin' ? 'hidden' : 'space-y-6'}">
          <div class="p-3 bg-brand-50/70 border border-brand-100 rounded-xl flex items-center gap-2 text-xs text-brand-900 font-medium">
            <i data-lucide="user-check" class="w-4 h-4 text-brand-600 flex-shrink-0"></i>
            <span>Portal pengguna umum untuk pencatatan transaksi dan bot Telegram.</span>
          </div>

          <!-- Google Instant Login for User -->
          <div>
            <a href="/api/auth/google-login" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm">
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Masuk Cepat dengan Akun Google</span>
            </a>
          </div>

          <div class="relative flex items-center justify-center">
            <div class="border-t border-slate-200 w-full"></div>
            <span class="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider relative">atau via email & no hp</span>
          </div>

          <!-- User Form -->
          <form action="/api/auth/login" method="POST" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email atau Nomor HP</label>
              <input type="text" name="identifier" id="userEmailInput" required placeholder="siti.aminah@example.com atau 08123456789" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all"/>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kata Sandi</label>
                <a href="#" onclick="alert('Silakan gunakan opsi masuk via Google atau hubungi admin.'); return false;" class="text-xs font-semibold text-brand-600 hover:underline">Lupa sandi?</a>
              </div>
              <input type="password" name="password" id="userPasswordInput" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all"/>
            </div>

            <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2">
              <i data-lucide="log-in" class="w-4 h-4"></i> Masuk ke Dashboard Pengguna
            </button>
          </form>

          <p class="text-center text-sm text-slate-600">
            Belum punya akun? <a href="/register" class="font-bold text-brand-600 hover:underline">Daftar sekarang gratis</a>
          </p>

          <!-- Quick Demo User Box -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
            <div class="font-bold text-slate-800 flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i data-lucide="zap" class="w-3.5 h-3.5 text-brand-600"></i> Akun Pengguna Demo:</span>
              <button type="button" onclick="quickFillUser()" class="text-[11px] font-bold text-brand-700 hover:underline">Isi Otomatis</button>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              • <b>budi.santoso@example.com</b> (User • Pro • Ada Transaksi & Grafik Lengkap)<br/>
              • <b>siti.aminah@example.com</b> (User • Starter • Siap Pakai)<br/>
              • Mau akun baru kosong? Silakan klik <a href="/register" class="text-brand-600 font-bold hover:underline">Daftar Akun Baru</a>.
            </p>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- 2. TAMPILAN ADMIN (SUPERADMIN LOGIN PANEL)-->
        <!-- ========================================== -->
        <div id="panelAdminLogin" class="${activeTab === 'admin' ? 'space-y-6' : 'hidden'}">
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs text-purple-900 font-medium">
            <i data-lucide="shield-check" class="w-4 h-4 text-purple-600 flex-shrink-0"></i>
            <span>Portal khusus Superadmin (<span class="font-bold">sandracarolin1004@gmail.com</span>) untuk persetujuan akun & kontrol platform.</span>
          </div>

          <!-- Google Instant Login for Superadmin -->
          <div>
            <a href="/api/admin/google-login" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-purple-300 bg-purple-50/80 hover:bg-purple-100 text-purple-900 font-bold text-sm transition-all shadow-sm">
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Masuk Instan dengan Google (Superadmin)</span>
            </a>
          </div>

          <div class="relative flex items-center justify-center">
            <div class="border-t border-purple-200 w-full"></div>
            <span class="bg-white px-3 text-[11px] font-bold text-purple-600 uppercase tracking-wider relative">atau kredensial sandracarolin1004</span>
          </div>

          <!-- Admin Form -->
          <form action="/api/admin/login" method="POST" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Superadmin</label>
              <input type="text" name="identifier" id="adminEmailInputUnified" required value="sandracarolin1004@gmail.com" placeholder="sandracarolin1004@gmail.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20 transition-all font-sans"/>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kata Sandi Superadmin</label>
                <span class="text-[11px] text-purple-600 font-bold">Default: password123 / admin123</span>
              </div>
              <input type="password" name="password" id="adminPasswordInputUnified" required value="password123" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20 transition-all font-sans"/>
            </div>

            <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4"></i> Masuk ke Admin Dashboard
            </button>
          </form>

          <div class="pt-2 border-t border-slate-100 space-y-2">
            <button type="button" onclick="quickFillSuperadminUnified()" class="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> Masuk Cepat Superadmin (sandracarolin1004@gmail.com)
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <script>
    function switchLoginPortal(portal) {
      const btnUser = document.getElementById('tabBtnUser');
      const btnAdmin = document.getElementById('tabBtnAdmin');
      const panelUser = document.getElementById('panelUserLogin');
      const panelAdmin = document.getElementById('panelAdminLogin');

      if (portal === 'admin') {
        btnAdmin.className = 'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md';
        btnUser.className = 'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-600 hover:text-slate-900';
        panelUser.classList.add('hidden');
        panelAdmin.classList.remove('hidden');
        panelAdmin.classList.add('space-y-6');
      } else {
        btnUser.className = 'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-white text-brand-700 shadow-sm border border-slate-200/80';
        btnAdmin.className = 'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-600 hover:text-purple-700';
        panelAdmin.classList.add('hidden');
        panelUser.classList.remove('hidden');
        panelUser.classList.add('space-y-6');
      }
    }

    function quickFillUser() {
      document.getElementById('userEmailInput').value = 'budi.santoso@example.com';
      document.getElementById('userPasswordInput').value = 'password123';
      document.querySelector('#panelUserLogin form').submit();
    }

    function quickFillSuperadminUnified() {
      document.getElementById('adminEmailInputUnified').value = 'sandracarolin1004@gmail.com';
      document.getElementById('adminPasswordInputUnified').value = 'password123';
      document.querySelector('#panelAdminLogin form').submit();
    }

    (function() {
      try {
        const p = new URLSearchParams(window.location.search);
        if (p.get('tab') === 'admin' || p.get('portal') === 'admin') {
          switchLoginPortal('admin');
        }
      } catch (e) {}
    })();
  </script>
  `;
}

export function renderRegisterPage({ error = null, prefill = {}, currentUser = null } = {}) {
  return `
  <div class="min-h-screen flex flex-col md:flex-row bg-white">
    <!-- Kiri (40%): Branding Panel -->
    <div class="hidden md:flex md:w-5/12 bg-gradient-to-br from-brand-900 via-brand-700 to-rose-700 p-12 flex-col justify-between text-white relative overflow-hidden">
      <div class="relative z-10">
        <a href="/" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-inner">TD</div>
          <span class="font-bold text-2xl tracking-tight">TataDana</span>
        </a>
      </div>

      <div class="relative z-10 space-y-4 max-w-sm">
        <div class="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
          Mulai dalam 60 Detik
        </div>
        <h2 class="text-4xl font-extrabold leading-tight tracking-tight">
          Satu Langkah<br/>Menuju Finansial Sehat.
        </h2>
        <p class="text-rose-100 text-sm leading-relaxed">
          Verifikasi nomor HP Anda untuk menghubungkan akun Telegram secara instan. Tanpa ribet, langsung siap catat transaksi.
        </p>
      </div>

      <div class="relative z-10 text-xs text-rose-200">
        &copy; 2026 TataDana Indonesia. Supabase Auth & RLS Protected.
      </div>

      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-400/20 blur-3xl pointer-events-none"></div>
    </div>

    <!-- Kanan (60%): Form Panel -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white">
      <div class="w-full max-w-md space-y-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Akun Baru</h2>
          <p class="text-sm text-slate-500 mt-2">Daftar sekarang untuk sinkronisasi otomatis bot Telegram kamu.</p>
        </div>

        ${currentUser ? `
        <div class="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-slate-800 flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-rose-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              ${(currentUser.full_name || 'TD').slice(0, 2).toUpperCase()}
            </div>
            <div class="min-w-0">
              <p class="font-bold text-xs text-slate-900 truncate">Login aktif: <span class="text-brand-700 font-extrabold">${currentUser.full_name}</span></p>
              <p class="text-[11px] text-slate-500 truncate">${currentUser.email || currentUser.phone_number}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <a href="/dashboard" class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1">
              <span>Ke Dashboard</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
            <a href="/api/auth/logout" class="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 font-semibold text-xs transition-all">
              Keluar
            </a>
          </div>
        </div>
        ` : ''}

        ${error ? `
        <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
          <i data-lucide="alert-circle" class="w-4 h-4 flex-shrink-0 text-red-600"></i>
          <span>${error}</span>
        </div>
        ` : ''}

        <!-- Google Instant Signup Button -->
        <div>
          <a href="/api/auth/google-login" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm">
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Daftar Instan dengan Akun Google</span>
          </a>
        </div>

        <div class="relative flex items-center justify-center">
          <div class="border-t border-slate-200 w-full"></div>
          <span class="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider relative">atau via formulir pendaftaran</span>
        </div>

        <!-- Step 1: Form Input Data -->
        <form id="regForm" action="/api/auth/register-submit" method="POST" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
            <input type="text" name="full_name" required value="${prefill.full_name || ''}" placeholder="Contoh: Dimas Wahyu" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Alamat Email</label>
            <input type="email" name="email" required value="${prefill.email || ''}" placeholder="dimas@example.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp / HP (Kunci Link Akun Telegram) <span class="text-brand-600">*</span>
            </label>
            <div class="flex gap-2">
              <span class="inline-flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold">+62</span>
              <input type="tel" name="phone_number" required value="${prefill.phone_number || ''}" placeholder="81234567890" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all"/>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Nomor ini akan diverifikasi via OTP dan menjadi pengenal otomatis di bot Telegram.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kata Sandi</label>
            <input type="password" name="password" required placeholder="Minimal 6 karakter" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all"/>
          </div>

          <!-- Step 2: OTP Verification Box -->
          <div class="p-4 bg-orange-50 border border-brand-200 rounded-2xl space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-brand-900 uppercase tracking-wider">
                Kode Verifikasi OTP <span class="text-brand-600">*</span>
              </label>
              <span class="text-[11px] font-bold text-brand-700 bg-orange-100 px-2 py-0.5 rounded-full">Mode Dev: 123456</span>
            </div>
            <input type="text" name="otp_code" required maxlength="6" placeholder="Masukkan 6 digit OTP (cth: 123456)" class="w-full px-4 py-2.5 rounded-xl border border-brand-300 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 bg-white"/>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              Untuk pengujian lokal instan, gunakan kode OTP mock <b>123456</b>. Sistem akan memverifikasi nomor HP kamu secara otomatis.
            </p>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5">
              Daftar & Verifikasi Akun Baru
            </button>
          </div>
        </form>

        <p class="text-center text-sm text-slate-600">
          Sudah punya akun? <a href="/login" class="font-bold text-brand-600 hover:underline">Masuk di sini</a>
        </p>
      </div>
    </div>
  </div>
  `;
}
