// ====================================================================
// TataDana - Landing Page (Part 7)
// Theme: Modern Orange & White Fintech, 100% Indonesian Language
// Contains all 15 required sections in exact sequence
// ====================================================================

export function renderLandingPage({ user = null } = {}) {
  return `
  <!-- 1. NAVBAR (Sticky) -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-500/25">
          TD
        </div>
        <span class="font-bold text-2xl tracking-tight text-slate-900">Tata<span class="text-brand-600">Dana</span></span>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#fitur" class="hover:text-brand-600 transition-colors">Fitur</a>
        <a href="#demo" class="hover:text-brand-600 transition-colors">Cara Kerja</a>
        <a href="#pricing" class="hover:text-brand-600 transition-colors">Harga</a>
        <button onclick="openModal('panduanModal')" class="hover:text-brand-600 transition-colors text-brand-700 font-bold flex items-center gap-1.5">
          <i data-lucide="book-open" class="w-4 h-4"></i>
          <span>Tata Cara</span>
        </button>
        <a href="#testimoni" class="hover:text-brand-600 transition-colors">Testimoni</a>
        <a href="#faq" class="hover:text-brand-600 transition-colors">FAQ</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="/login" class="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">Masuk</a>
        ${user ? `
          <a href="/dashboard" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center gap-2">
            <span>Buka Dashboard</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
          <a href="/api/auth/logout" class="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Keluar</a>
        ` : `
          <a href="/register" class="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all">
            Coba Gratis
          </a>
        `}
      </div>
    </div>
  </header>

  <!-- 2 & 3 & 4. HERO SECTION (Pre-headline badge, Headline, Sub-headline, CTAs) -->
  <section class="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center">
      <!-- 2. Pre-headline badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
        <span>✨ Catat keuangan langsung dari Telegram</span>
      </div>

      <!-- 3. Headline (H1) with gradient -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
        Gaji habis sebelum akhir bulan? Sudah saatnya kamu tahu <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-rose-600">ke mana uangmu pergi.</span>
      </h1>

      <!-- 4. Sub-headline -->
      <p class="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed mb-10">
        TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.
      </p>

      <!-- 6. CTA buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <a href="${user ? '/dashboard' : '/register'}" class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5">
          ${user ? 'Buka Dashboard Saya →' : 'Mulai Gratis Sekarang'}
        </a>
        <button onclick="openModal('panduanModal')" class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
          <i data-lucide="book-open" class="w-4 h-4 text-brand-600"></i>
          <span>Tata Cara Penggunaan →</span>
        </button>
      </div>

      <!-- 5. Hero Section Video Placeholder -->
      <div class="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900">
        <!-- TODO: Ganti video placeholder ini dengan file video demo produk resmi setelah recording selesai -->
        <div class="aspect-video flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-slate-900 via-slate-800 to-rose-950 text-white">
          <div class="w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 mb-4 cursor-pointer hover:scale-105 transition-transform">
            <i data-lucide="play" class="w-7 h-7 ml-1"></i>
          </div>
          <span class="text-xs uppercase tracking-widest text-brand-300 font-semibold mb-1">Demo Produk 60 Detik</span>
          <h3 class="text-xl sm:text-2xl font-bold">Lihat Betapa Mudahnya Catat Keuangan via Telegram</h3>
          <p class="text-slate-400 text-sm max-w-md mt-2">Ketik "beli bakso 15rb" atau kirim foto struk belanja — transaksi langsung rapi di dashboard.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 7 & 8. PROBLEM AWARE & TRANSITION SOLUTION SECTION -->
  <section class="py-20 bg-slate-50 border-y border-slate-200/80">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <span class="text-xs font-bold text-red-500 uppercase tracking-wider">Masalah Nyata Kita Sehari-hari</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2">Kenapa mengelola keuangan terasa sangat berat?</h2>
      </div>

      <!-- 7. 3 Bullet Points Masalah User -->
      <div class="grid md:grid-cols-3 gap-6 mb-16">
        <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5 font-bold text-xl">📱</div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">"Buka aplikasi keuangan? Nanti dulu deh..."</h3>
          <p class="text-sm text-slate-600 leading-relaxed">
            Aplikasi keuangan biasa terlalu ribet. Harus buka app, pilih menu, input kategori, pilih tanggal. Akhirnya malas dan terbengkalai.
          </p>
        </div>

        <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5 font-bold text-xl">💸</div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">"Kok uang habis ya? Padahal kayak tidak beli apa-apa"</h3>
          <p class="text-sm text-slate-600 leading-relaxed">
            Jajan kopi 25rb, parkir 5rb, jajan cilok 10rb. Pengeluaran kecil tak tercatat yang diam-diam menguras gaji sebelum tanggal gajian berikutnya.
          </p>
        </div>

        <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-orange-50 text-brand-600 flex items-center justify-center mb-5 font-bold text-xl">🎯</div>
          <h3 class="font-bold text-lg text-slate-900 mb-2">"Udah niat bikin budget, tapi seminggu lupa"</h3>
          <p class="text-sm text-slate-600 leading-relaxed">
            Bikin excel budget di awal bulan, tapi tidak pernah dicek lagi. Budget tanpa pemantauan otomatis sama saja tidak ada budget sama sekali.
          </p>
        </div>
      </div>

      <!-- 8. Solusi Transisi -->
      <div class="bg-gradient-to-r from-brand-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl shadow-brand-500/20">
        <span class="text-xs uppercase tracking-widest text-orange-200 font-bold">Solusi dari Masalah Ini</span>
        <h3 class="text-2xl sm:text-3xl font-extrabold mt-2 mb-4">
          Bagaimana kalau mencatat keuangan semudah kirim pesan ke teman?
        </h3>
        <p class="text-orange-100 max-w-2xl mx-auto text-base sm:text-lg mb-6">
          Tanpa install aplikasi berat baru, tanpa ribet buka formulir. Cukup buka Telegram yang sudah ada di HP-mu setiap hari.
        </p>
        <span class="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-sm tracking-wide">
          Introducing TataDana ⚡
        </span>
      </div>
    </div>
  </section>

  <!-- 9. INTERACTIVE DASHBOARD PREVIEW (Chat Telegram Asli + Dashboard Live) -->
  <section id="demo" class="py-24 bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Pengalaman Interaktif</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
          Lihat betapa rapinya bot dan dashboard TataDana
        </h2>
        <p class="text-slate-600 mt-3">
          Simulasi interaktif langsung di bawah ini. Chat bot memproses bahasa natural, dan dashboard langsung memperbarui data secara real-time.
        </p>
      </div>

      <div class="grid lg:grid-cols-12 gap-8 items-start">
        <!-- Telegram Chat Mockup (5 cols) -->
        <div class="lg:col-span-5 bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800">
          <!-- Chat Header -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-800 px-2">
            <div class="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">TD</div>
            <div>
              <div class="font-bold text-white text-sm">TataDana Bot ⚡</div>
              <div class="text-xs text-emerald-400">bot aktif • via @tatadana_bot</div>
            </div>
          </div>

          <!-- Chat Messages Body -->
          <div class="py-4 space-y-4 text-xs font-mono">
            <!-- User message -->
            <div class="flex justify-end">
              <div class="bg-brand-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none max-w-[80%] font-sans">
                beli bakso urat 15rb
              </div>
            </div>

            <!-- Bot Reply with exact Part 4.4 format -->
            <div class="flex justify-start">
              <div class="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[90%] border border-slate-700/60 leading-relaxed font-sans">
                <div class="text-slate-400 text-[11px] mb-1">📅 Selasa, 13 Okt 2026 — 14:30 WIB</div>
                <div class="text-emerald-400 font-bold mb-1.5">💸 Pengeluaran tercatat!</div>
                <div>├ Nominal : <b>Rp15.000</b></div>
                <div>├ Kategori : 🍜 Makanan & Minuman</div>
                <div>├ Dompet : 👛 Bank BCA Utama</div>
                <div>├ Catatan : Beli bakso urat</div>
                <div>└ Saldo : Rp8.735.000</div>
                <div class="mt-2.5 pt-2 border-t border-slate-700">
                  <div class="text-orange-300 font-semibold mb-1">📊 Budget Makanan bulan ini:</div>
                  <div class="text-amber-400">[██████░░░░] 60% — sisa Rp1.000.000</div>
                  <div class="text-slate-400 italic text-[11px] mt-1">✨ Pengeluaran masih dalam batas aman. Bagus sekali!</div>
                </div>
              </div>
            </div>

            <!-- User voice note simulation -->
            <div class="flex justify-end">
              <div class="bg-brand-600 text-white px-3.5 py-2 rounded-2xl rounded-tr-none font-sans flex items-center gap-2">
                <i data-lucide="mic" class="w-4 h-4"></i>
                <span>Pesan Suara (0:08)</span>
              </div>
            </div>

            <!-- Bot response with transcript -->
            <div class="flex justify-start">
              <div class="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[90%] border border-slate-700/60 leading-relaxed font-sans">
                <div class="text-amber-300 mb-1.5">🎙️ <b>Transkrip:</b> <i>"Gojek ke stasiun dua puluh delapan ribu"</i></div>
                <div class="text-emerald-400 font-bold mb-1">💸 Pengeluaran tercatat!</div>
                <div>├ Nominal : <b>Rp28.000</b></div>
                <div>├ Kategori : 🚗 Transportasi</div>
                <div>├ Dompet : 👛 GoPay & OVO</div>
                <div>└ Saldo : Rp292.000</div>
              </div>
            </div>
          </div>

          <div class="pt-2 px-1">
            <a href="/simulator" class="block w-full py-2.5 text-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
              Buka Simulator Bot Lengkap →
            </a>
          </div>
        </div>

        <!-- Dashboard Live Preview (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 class="font-bold text-slate-900 text-lg">Dashboard Ringkasan</h3>
              <p class="text-xs text-slate-500">Real-time tersinkronisasi dengan Telegram</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              🟢 Terhubung Telegram
            </span>
          </div>

          <!-- 4 Stats Cards Preview -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div class="bg-orange-50/70 p-3 rounded-xl border border-orange-100">
              <div class="text-[11px] font-semibold text-slate-500">Total Saldo</div>
              <div class="text-sm sm:text-base font-extrabold text-brand-700">Rp22.020.000</div>
            </div>
            <div class="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <div class="text-[11px] font-semibold text-slate-500">Pemasukan</div>
              <div class="text-sm sm:text-base font-extrabold text-emerald-700">+Rp16.000.000</div>
            </div>
            <div class="bg-red-50/70 p-3 rounded-xl border border-red-100">
              <div class="text-[11px] font-semibold text-slate-500">Pengeluaran</div>
              <div class="text-sm sm:text-base font-extrabold text-red-700">-Rp1.061.000</div>
            </div>
            <div class="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
              <div class="text-[11px] font-semibold text-slate-500">Sisa Budget</div>
              <div class="text-sm sm:text-base font-extrabold text-amber-800">Rp5.539.000</div>
            </div>
          </div>

          <!-- Dummy Chart / Progress Bars -->
          <div class="space-y-3">
            <div class="text-xs font-bold text-slate-700">Pemakaian Budget Terkini:</div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>🍜 Makanan & Minuman</span>
                <span class="font-semibold text-brand-600">60% (Rp1.500.000 / Rp2.500.000)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-brand-600 h-2 rounded-full" style="width: 60%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>🚗 Transportasi</span>
                <span class="font-semibold text-amber-600">35% (Rp280.000 / Rp800.000)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 35%"></div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span class="text-xs text-slate-500">Semua data tersimpan otomatis di Supabase Postgres</span>
            <a href="/dashboard" class="text-xs font-bold text-brand-600 hover:underline">Buka Dashboard Penuh →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 10. FITUR SECTION (3 Fitur Alternating Layout) -->
  <section id="fitur" class="py-24 bg-slate-50 border-t border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-24">
      <!-- Fitur 1: Catat via Telegram -->
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div class="w-12 h-12 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold text-xl mb-4">
            <i data-lucide="send" class="w-6 h-6"></i>
          </div>
          <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Fitur Inti #1</span>
          <h3 class="text-3xl font-extrabold text-slate-900 mt-2 mb-4">Catat via Telegram — Teks, Foto Struk, & Voice Note</h3>
          <p class="text-slate-600 leading-relaxed mb-6">
            Cukup ketik kalimat natural seperti "makan padang 25rb" atau rekam voice note saat di jalan. Untuk paket Pro, cukup foto struk belanja — AI Vision kami akan otomatis mendeteksi nama barang, harga per item, hingga total belanja.
          </p>
          <ul class="space-y-3 text-sm text-slate-700">
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Mendukung format Indonesia: 15rb, 1.5jt, 500k, 25ribu
            </li>
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              OCR Struk Belanja memecah item otomatis
            </li>
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Voice note langsung ditranskrip akurat dalam bahasa Indonesia
            </li>
          </ul>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
          <img src="https://images.unsplash.com/photo-1554415707-9e49016a693c?w=700" alt="Receipt OCR Scanner" class="rounded-2xl object-cover w-full h-72 shadow-inner"/>
          <div class="mt-4 p-3 bg-orange-50 rounded-xl text-xs text-brand-900 font-semibold flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-brand-600"></i>
            AI Vision otomatis mengenali 5 item struk belanja dalam 0.8 detik!
          </div>
        </div>
      </div>

      <!-- Fitur 2: Laporan & Export Otomatis (Alternating) -->
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="order-2 md:order-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
          <div class="border border-slate-100 rounded-2xl p-4 bg-slate-50/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 text-sm">📊 Laporan Keuangan 30 Hari</span>
              <span class="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">PDF / Excel</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div class="text-slate-500">Total Pemasukan: <b class="text-emerald-600">Rp16.000.000</b></div>
              <div class="text-slate-500">Total Pengeluaran: <b class="text-red-600">Rp1.061.000</b></div>
              <div class="text-slate-500">Net Surplus: <b class="text-brand-600">+Rp14.939.000</b></div>
            </div>
            <div class="flex gap-2">
              <a href="/reports" class="flex-1 text-center py-2 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-sm">
                Unduh PDF Resmi
              </a>
              <a href="/reports" class="flex-1 text-center py-2 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold">
                Export .XLSX
              </a>
            </div>
          </div>
        </div>
        <div class="order-1 md:order-2">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
            <i data-lucide="file-spreadsheet" class="w-6 h-6"></i>
          </div>
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fitur Inti #2</span>
          <h3 class="text-3xl font-extrabold text-slate-900 mt-2 mb-4">Laporan Real-Time & Export On-Demand</h3>
          <p class="text-slate-600 leading-relaxed mb-6">
            Semua transaksi dari Telegram langsung terakumulasi rapi di halaman Laporan native dashboard. Urutkan, cari berdasarkan catatan, dan download laporan siap cetak ke format PDF dan spreadsheet Excel (.xlsx) kapan saja.
          </p>
          <ul class="space-y-3 text-sm text-slate-700">
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Tersimpan aman di Supabase Storage dengan link privat
            </li>
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Filter periode kustom, dompet, dan kategori pengeluaran
            </li>
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Riwayat export tersimpan, unduh ulang tanpa hitung ulang
            </li>
          </ul>
        </div>
      </div>

      <!-- Fitur 3: AI Financial Advisor -->
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div class="w-12 h-12 rounded-xl bg-amber-100 text-brand-700 flex items-center justify-center font-bold text-xl mb-4">
            <i data-lucide="bot" class="w-6 h-6"></i>
          </div>
          <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Fitur Inti #3</span>
          <h3 class="text-3xl font-extrabold text-slate-900 mt-2 mb-4">AI Financial Advisor — Peringatan Proaktif</h3>
          <p class="text-slate-600 leading-relaxed mb-6">
            Bukan sekadar mencatat, TataDana bertindak layaknya konsultan keuangan pribadi. Begitu ada kategori yang melonjak >50% atau pengeluaran mendekati 80% pemasukan, AI langsung memberikan saran personal yang actionable.
          </p>
          <ul class="space-y-3 text-sm text-slate-700">
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Aktif otomatis tanpa perlu mengetik command khusus
            </li>
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Deteksi dini pengeluaran impulsif bernilai besar
            </li>
            <li class="flex items-center gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
              Didukung model Gemini 1.5/2.0 Flash dengan multi-provider failover
            </li>
          </ul>
        </div>
        <div class="bg-gradient-to-tr from-slate-900 to-orange-950 p-6 rounded-3xl text-white shadow-xl border border-orange-900/40">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center font-bold">🤖</div>
            <div>
              <div class="font-bold text-sm">Financial Advisor TataDana</div>
              <div class="text-[11px] text-orange-300">Deteksi Anomali Pengeluaran</div>
            </div>
          </div>
          <div class="bg-slate-950/60 p-4 rounded-2xl border border-orange-800/50 text-xs leading-relaxed space-y-2">
            <p>Hei Budi! Pengeluaran kategori <b>🍜 Makanan & Minuman</b> minggu ini naik <b>58%</b> dibanding minggu lalu.</p>
            <p class="text-amber-300">💡 <b>Saran:</b> Alokasikan sisa Rp1.000.000 untuk 14 hari ke depan dengan batas maksimal Rp70.000/hari agar tidak defisit di akhir bulan.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 11. TESTIMONI (Masonry Grid Placeholder) -->
  <section id="testimoni" class="py-24 bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Cerita Pengguna</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2">Mereka yang sudah pegang kendali keuangannya</h2>
        <p class="text-slate-500 text-xs mt-2 italic">// TODO: Ganti dengan testimoni dari beta user asli setelah fase beta tester diluncurkan</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" class="w-10 h-10 rounded-full object-cover" alt="Rizky"/>
            <div>
              <h4 class="font-bold text-sm text-slate-900">Rizky Pratama</h4>
              <p class="text-xs text-slate-500">Software Engineer, 26 th</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            "Dulu selalu malas buka app keuangan karena formulirnya panjang. Sekarang tinggal ketik di Telegram pas lagi makan siang, beres. Akhir bulan kaget saldo tabungan nambah!"
          </p>
        </div>

        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" class="w-10 h-10 rounded-full object-cover" alt="Sarah"/>
            <div>
              <h4 class="font-bold text-sm text-slate-900">Sarah Anggraini</h4>
              <p class="text-xs text-slate-500">Freelance Copywriter, 24 th</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            "Fitur OCR struknya gila sih. Tiap abis belanja bulanan tinggal jepret foto struk, semua barang dan kategori langsung keinput rapi tanpa harus ketik satu-satu."
          </p>
        </div>

        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" class="w-10 h-10 rounded-full object-cover" alt="Dimas"/>
            <div>
              <h4 class="font-bold text-sm text-slate-900">Dimas Setiawan</h4>
              <p class="text-xs text-slate-500">Karyawan Swasta, 30 th</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            "Reminder Telegram jam 8 malam sangat ngebantu membiasakan diri. Dulu gaji UMK selalu amblas di minggu ketiga, sekarang selalu ada sisa buat investasi."
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- 12. PRICING SECTION (Starter vs Pro) -->
  <section id="pricing" class="py-24 bg-slate-50 border-t border-slate-200">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Investasi Terbaik</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2">Pilih paket yang cocok untukmu</h2>
        <p class="text-slate-600 mt-2">Harga transparan, pembayaran mudah via QRIS, GoPay, BCA, atau Midtrans.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-8 items-stretch">
        <!-- Starter Plan -->
        <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 mb-4">
              Paket Starter
            </div>
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-4xl font-extrabold text-slate-900">Rp49.000</span>
              <span class="text-slate-500 text-sm">/bulan</span>
            </div>
            <p class="text-sm text-slate-600 mb-6">Cocok untuk pemula yang ingin mulai disiplin mencatat transaksi harian.</p>

            <ul class="space-y-3 text-sm text-slate-700 pb-8 border-b border-slate-100">
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i>
                Catat transaksi via teks Telegram
              </li>
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i>
                Dashboard web lengkap & interaktif
              </li>
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i>
                Maksimal 50 transaksi / bulan
              </li>
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i>
                Maksimal 3 dompet (wallets)
              </li>
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-emerald-500"></i>
                Maksimal 5 kategori budget
              </li>
              <li class="flex items-center gap-2.5 text-slate-400">
                <i data-lucide="x" class="w-4 h-4 text-slate-300"></i>
                Tidak ada input foto struk AI OCR
              </li>
              <li class="flex items-center gap-2.5 text-slate-400">
                <i data-lucide="x" class="w-4 h-4 text-slate-300"></i>
                Tidak ada AI Financial Advisor
              </li>
              <li class="flex items-center gap-2.5 text-slate-400">
                <i data-lucide="x" class="w-4 h-4 text-slate-300"></i>
                Tanpa export PDF & Excel lanjutan
              </li>
            </ul>
          </div>

          <div class="pt-6">
            <a href="/register?plan=starter" class="block w-full py-3.5 text-center font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Pilih Starter
            </a>
          </div>
        </div>

        <!-- Pro Plan (Recommended) -->
        <div class="bg-white rounded-3xl p-8 border-2 border-brand-600 shadow-2xl relative flex flex-col justify-between">
          <div class="absolute -top-4 right-8 bg-gradient-to-r from-brand-600 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            Paling Populer & Hemat
          </div>

          <div>
            <div class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-brand-800 mb-4">
              Paket PRO (Lifetime)
            </div>
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-4xl font-extrabold text-slate-900">Rp99.000</span>
              <span class="text-brand-600 font-bold text-sm">Sekali Bayar</span>
            </div>
            <p class="text-sm text-slate-600 mb-6">Akses seumur hidup semua fitur premium tanpa biaya langganan bulanan!</p>

            <ul class="space-y-3 text-sm text-slate-700 pb-8 border-b border-slate-100">
              <li class="flex items-center gap-2.5 font-semibold text-slate-900">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                Semua fitur paket Starter
              </li>
              <li class="flex items-center gap-2.5 font-semibold text-slate-900">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                <b>Unlimited transaksi</b> tanpa batas kuota
              </li>
              <li class="flex items-center gap-2.5 font-semibold text-slate-900">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                <b>Unlimited dompet & kategori</b>
              </li>
              <li class="flex items-center gap-2.5 font-semibold text-brand-700">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                📸 Input via foto struk AI OCR otomatis
              </li>
              <li class="flex items-center gap-2.5 font-semibold text-brand-700">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                🤖 AI Financial Advisor aktif
              </li>
              <li class="flex items-center gap-2.5 font-semibold text-brand-700">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                📊 Export unlimited PDF & Excel on-demand
              </li>
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                ⏰ Pengingat harian custom (hingga 2x/hari)
              </li>
              <li class="flex items-center gap-2.5">
                <i data-lucide="check" class="w-4 h-4 text-brand-600"></i>
                ⭐ Prioritas support
              </li>
            </ul>
          </div>

          <div class="pt-6">
            <a href="/register?plan=pro" class="block w-full py-4 text-center font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/25 rounded-xl transition-all transform hover:-translate-y-0.5">
              Ambil Pro Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 13. FAQ SECTION (Minimal 7 Pertanyaan) -->
  <section id="faq" class="py-24 bg-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-16">
        <span class="text-xs font-bold text-brand-600 uppercase tracking-wider">Tanya Jawab</span>
        <h2 class="text-3xl font-extrabold text-slate-900 mt-2">Pertanyaan yang Sering Diajukan</h2>
      </div>

      <div class="space-y-4">
        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Apakah bisa pakai foto struk di paket Starter?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            Tidak. Fitur ekstraksi foto struk menggunakan AI Vision (OCR) secara eksklusif tersedia untuk pengguna paket Pro karena membutuhkan komputasi AI tingkat lanjut. Starter hanya mendukung pencatatan teks dan voice note.
          </p>
        </details>

        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Bagaimana keamanan data transaksi saya di TataDana?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            Data Anda 100% tersimpan di database Supabase (Postgres) dengan proteksi Row Level Security (RLS) dan enkripsi tingkat enterprise. Token bot dan kredensial sensitif disimpan terenkripsi. Tidak ada pihak ketiga yang dapat mengakses catatan Anda.
          </p>
        </details>

        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Apakah 1 bot Telegram digunakan bersama atau 1 bot per user?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            TataDana menggunakan 1 bot resmi bersama yang otomatis mengenali Anda dari ID Telegram dan nomor HP yang telah diverifikasi saat mendaftar. Anda juga memiliki opsi menyambungkan bot pribadi dari @BotFather di halaman Pengaturan.
          </p>
        </details>

        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Format kalimat apa saja yang bisa dipahami oleh bot?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            Bot memahami bahasa natural Indonesia sehari-hari seperti "beli bakso 15rb", "kopi susu 25k", "gajian 5jt", "bayar listrik 350ribu", atau "isi bensin pertamax 50rb". Format nominal seperti "rb", "jt", "k", maupun desimal ditangani secara otomatis.
          </p>
        </details>

        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Bagaimana cara kerja Voice Note di Telegram?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            Anda cukup mengirim rekaman suara (Voice Note) maksimal 60 detik ke bot. AI kami akan mentranskrip ucapan Anda ke teks bahasa Indonesia, mengekstrak nominal dan kategori, lalu membalas dengan konfirmasi lengkap beserta kutipan transkripnya.
          </p>
        </details>

        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Apakah bisa mencatat banyak dompet sekaligus?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            Tentu saja! Anda bisa membuat multi-wallet seperti Tunai, BCA, Mandiri, GoPay, dan OVO. Anda dapat memilih 1 wallet utama sebagai default untuk pencatatan cepat via Telegram, serta melakukan transfer saldo antar dompet lewat web dashboard.
          </p>
        </details>

        <details class="group bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <summary class="font-bold text-slate-900 cursor-pointer flex justify-between items-center">
            Metode pembayaran apa saja yang didukung untuk upgrade ke Pro?
            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p class="text-sm text-slate-600 mt-3 leading-relaxed">
            Kami mendukung pembayaran otomatis instan via Midtrans (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BRI/BNI) serta opsi transfer manual dengan verifikasi persetujuan admin.
          </p>
        </details>
      </div>
    </div>
  </section>

  <!-- 14. FINAL CTA -->
  <section class="py-20 bg-gradient-to-r from-brand-900 via-brand-700 to-rose-900 text-white text-center">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <h2 class="text-3xl sm:text-4xl font-extrabold mb-4">Mulai kendalikan keuanganmu hari ini</h2>
      <p class="text-rose-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
        Bergabunglah bersama ribuan pengguna yang berhenti khawatir ke mana uang mereka pergi setiap akhir bulan.
      </p>
      <a href="${user ? '/dashboard' : '/register'}" class="inline-block px-9 py-4 rounded-xl text-base font-bold bg-white text-brand-700 hover:bg-slate-100 shadow-xl transition-all transform hover:-translate-y-0.5">
        ${user ? 'Buka Dashboard Saya →' : 'Coba TataDana Gratis Sekarang →'}
      </a>
    </div>
  </section>

  <!-- 15. FOOTER (4 Kolom) -->
  <footer class="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
      <!-- Kolom 1: Logo & Tagline -->
      <div class="col-span-2 md:col-span-1 space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-brand-600 text-white font-extrabold flex items-center justify-center text-sm">TD</div>
          <span class="font-bold text-xl text-white">Tata<span class="text-brand-400">Dana</span></span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          Catat keuangan semudah chat — langsung dari Telegram kamu. Membantu masyarakat Indonesia mencapai kebebasan finansial.
        </p>
        <div class="flex items-center gap-3 text-slate-400">
          <a href="#" class="hover:text-white"><i data-lucide="twitter" class="w-4 h-4"></i></a>
          <a href="#" class="hover:text-white"><i data-lucide="instagram" class="w-4 h-4"></i></a>
          <a href="#" class="hover:text-white"><i data-lucide="send" class="w-4 h-4"></i></a>
        </div>
      </div>

      <!-- Kolom 2: Produk -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Produk</h4>
        <ul class="space-y-2 text-xs">
          <li><a href="#fitur" class="hover:text-white">Fitur Bot Telegram</a></li>
          <li><a href="#demo" class="hover:text-white">Dashboard Keuangan</a></li>
          <li><a href="#fitur" class="hover:text-white">AI OCR Struk Belanja</a></li>
          <li><a href="#pricing" class="hover:text-white">Harga & Paket</a></li>
          <li><a href="/simulator" class="hover:text-white">Simulasi Interaktif</a></li>
        </ul>
      </div>

      <!-- Kolom 3: Perusahaan -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Perusahaan</h4>
        <ul class="space-y-2 text-xs">
          <li><a href="#" class="hover:text-white">Tentang Kami</a></li>
          <li><a href="#" class="hover:text-white">Blog Literasi Finansial</a></li>
          <li><a href="#" class="hover:text-white">Karir</a></li>
          <li><a href="#" class="hover:text-white">Mitra & Afiliasi</a></li>
        </ul>
      </div>

      <!-- Kolom 4: Legal & Kontak -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Legal</h4>
        <ul class="space-y-2 text-xs">
          <li><a href="#" class="hover:text-white">Kebijakan Privasi (/privacy)</a></li>
          <li><a href="#" class="hover:text-white">Syarat Ketentuan (/terms)</a></li>
          <li><a href="#" class="hover:text-white">Keamanan Data Supabase</a></li>
          <li><a href="#" class="hover:text-white">Kontak Support</a></li>
        </ul>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
      &copy; 2026 TataDana Indonesia. Hak Cipta Dilindungi Undang-Undang. Waktu Sistem: WIB (Asia/Jakarta).
    </div>
  </footer>
  `;
}
