// ====================================================================
// TataDana - User Dashboard Pages (Part 3 & Part 9 & Part 12)
// Overview, Transaksi, Laporan, Budget, Wallets, Settings
// Premium Indonesian Fintech Orange + White Theme
// ====================================================================

function getInitials(name) {
  if (!name) return 'TD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper: Format Indonesian full date with Tanggal, Bulan, Tahun
export function formatIndoFullDate(dateStr) {
  if (!dateStr) return '-';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const year = m[1];
    const monthName = months[parseInt(m[2], 10) - 1] || m[2];
    const day = parseInt(m[3], 10);
    return `${day} ${monthName} ${year}`;
  }
  return dateStr;
}

// Helper: Format transaction source with icon and badge
export function formatSourceInfo(source) {
  if (!source) {
    return { label: 'Web Dashboard', icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
  const s = String(source).toLowerCase();
  if (s === 'web' || s === 'web_manual') {
    return { label: 'Web Dashboard', icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
  if (s === 'telegram_text') {
    return { label: 'Telegram (Teks)', icon: '📱', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
  }
  if (s === 'telegram_voice') {
    return { label: 'Telegram (Voice Note)', icon: '🎙️', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  }
  if (s === 'telegram_photo') {
    return { label: 'Telegram (Foto Struk)', icon: '🧾', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (s.startsWith('telegram')) {
    return { label: 'Telegram Bot', icon: '🤖', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
  }
  if (s === 'simulator') {
    return { label: 'Simulator Bot', icon: '🤖', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  if (s === 'transfer') {
    return { label: 'Transfer Dompet', icon: '⇄', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  return { label: source.replace('_', ' ').toUpperCase(), icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
}

// --------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW
// --------------------------------------------------------------------
export function renderDashboardOverview({ user, summary, recentTransactions, categories, wallets, queryParams = {} }) {
  const { totalBalance, monthlyIncome, monthlyExpense, remainingBudget } = summary;
  const isStarter = user.plan === 'starter';
  const hasTransactions = (recentTransactions || []).length > 0;

  // Compute category spending for pie chart
  const expenseCategories = (categories || []).filter(c => c.type === 'expense');
  const catNames = [];
  const catAmounts = [];
  const catColors = ['#800020', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#8b5cf6', '#0d9488', '#0284c7'];

  expenseCategories.forEach((c, idx) => {
    const spent = (recentTransactions || [])
      .filter(t => t.category_id === c.id && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    if (spent > 0) {
      catNames.push(`${c.emoji} ${c.name}`);
      catAmounts.push(spent);
    }
  });

  // Category breakdown list items for visual display
  const totalCatExpenses = catAmounts.reduce((a, b) => a + b, 0);
  const categoryBreakdownRows = expenseCategories.map((c, idx) => {
    const spent = (recentTransactions || [])
      .filter(t => t.category_id === c.id && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const pct = totalCatExpenses > 0 ? ((spent / totalCatExpenses) * 100).toFixed(1) : '0';
    const color = catColors[idx % catColors.length];
    return {
      id: c.id,
      name: c.name,
      emoji: c.emoji || '🏷️',
      spent,
      pct,
      color
    };
  });

  const categoryBreakdownHtml = totalCatExpenses > 0
    ? categoryBreakdownRows
        .filter(r => r.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .map(r => `
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
            <div class="flex items-center justify-between text-xs font-semibold mb-1.5">
              <div class="flex items-center gap-2 truncate">
                <span class="text-base">${r.emoji}</span>
                <span class="font-bold text-slate-800 truncate">${r.name}</span>
              </div>
              <div class="text-right shrink-0">
                <span class="font-extrabold text-slate-900">Rp${r.spent.toLocaleString('id-ID')}</span>
                <span class="text-[10px] text-slate-400 font-bold ml-1">(${r.pct}%)</span>
              </div>
            </div>
            <div class="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
              <div class="h-1.5 rounded-full transition-all duration-500" style="width: ${r.pct}%; background-color: ${r.color};"></div>
            </div>
          </div>
        `).join('')
    : `
      <div class="space-y-1.5 mb-2.5">
        ${categoryBreakdownRows.map(r => `
          <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
            <div class="flex items-center justify-between text-xs font-semibold mb-1.5">
              <div class="flex items-center gap-2 truncate">
                <span class="text-base">${r.emoji}</span>
                <span class="font-bold text-slate-700 truncate">${r.name}</span>
              </div>
              <div class="text-right shrink-0">
                <span class="font-bold text-slate-400">Rp0</span>
                <span class="text-[10px] text-slate-400 font-bold ml-1">(0%)</span>
              </div>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="h-1.5 rounded-full" style="width: 0%; background-color: ${r.color};"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div class="flex items-start gap-2">
          <span class="text-base shrink-0">💡</span>
          <span class="text-[11px] leading-relaxed">
            Akun ini belum memiliki transaksi pengeluaran. Diagram donat dan daftar rincian akan terisi otomatis setelah kamu mencatat transaksi atau memuat transaksi contoh di bawah.
          </span>
        </div>
        <form method="POST" action="/api/demo/seed-transactions" class="pt-1">
          <button type="submit" class="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all">
            <span>✨</span> Muat Transaksi Contoh (Demo)
          </button>
        </form>
      </div>
    `;

  // Dynamic 6-month Cashflow data from database transactions (Part 12.2)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const chartLabels = [];
  const chartIncomeData = [];
  const chartExpenseData = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    chartLabels.push(monthNames[d.getMonth()]);
    const mIncome = (recentTransactions || [])
      .filter(t => t.transaction_date && t.transaction_date.startsWith(ym) && t.type === 'income')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const mExpense = (recentTransactions || [])
      .filter(t => t.transaction_date && t.transaction_date.startsWith(ym) && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    chartIncomeData.push(mIncome);
    chartExpenseData.push(mExpense);
  }

  // Checklist status
  const defaultWallet = (wallets || []).find(w => w.is_default);
  const budgetCount = expenseCategories.filter(c => Number(c.monthly_budget) > 0).length;
  let checklistCompleted = 0;
  if (user.telegram_connected) checklistCompleted++;
  if (defaultWallet) checklistCompleted++;
  if (budgetCount > 0) checklistCompleted++;

  const formattedBalance = totalBalance < 0
    ? `-Rp${Math.abs(totalBalance).toLocaleString('id-ID')}`
    : `Rp${Number(totalBalance || 0).toLocaleString('id-ID')}`;

  return `
  <!-- Top Greeting & Action Buttons -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Selamat Datang, ${user.full_name || 'Kawan'} 👋
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Ringkasan keuangan dan status bot Telegram kamu per ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} (WIB).
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      ${hasTransactions ? `
      <form method="POST" action="/api/demo/reset-transactions" onsubmit="return confirm('Kosongkan semua data transaksi akun ini kembali ke Rp0 bersih?');" class="inline">
        <button type="submit" class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 flex items-center gap-1.5 transition-all">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Reset Rp0
        </button>
      </form>
      ` : `
      <form method="POST" action="/api/demo/seed-transactions" class="inline">
        <button type="submit" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 flex items-center gap-1.5 transition-all shadow-sm">
          <span>✨</span> Muat Data Demo
        </button>
      </form>
      `}
      <button onclick="openModal('addTxModal')" class="px-4 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all">
        <i data-lucide="plus" class="w-4 h-4"></i> Catat Transaksi
      </button>
      <a href="/simulator" class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
        <i data-lucide="bot" class="w-4 h-4 text-brand-600"></i> Tes Bot Chat
      </a>
    </div>
  </div>

  ${queryParams?.demo_loaded === '1' ? `
  <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-800 text-xs shadow-sm">
    <div class="flex items-center gap-2.5">
      <span class="text-xl">🎉</span>
      <div>
        <strong class="font-bold">Transaksi Contoh Berhasil Dimuat!</strong>
        <p class="text-emerald-700 mt-0.5">Grafik arus kas 6 bulan dan rincian pengeluaran per kategori kini telah aktif terisi data.</p>
      </div>
    </div>
    <a href="/dashboard" class="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-50 text-[11px]">Tutup</a>
  </div>
  ` : ''}

  ${queryParams?.reset === '1' ? `
  <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-blue-800 text-xs shadow-sm">
    <div class="flex items-center gap-2.5">
      <span class="text-xl">🧹</span>
      <div>
        <strong class="font-bold">Akun Kembali Bersih!</strong>
        <p class="text-blue-700 mt-0.5">Semua data transaksi telah dihapus dan saldo kembali ke Rp0 bersih.</p>
      </div>
    </div>
    <a href="/dashboard" class="px-3 py-1.5 rounded-xl bg-white border border-blue-300 font-bold text-blue-800 hover:bg-blue-50 text-[11px]">Tutup</a>
  </div>
  ` : ''}

  ${!hasTransactions ? `
  <div class="bg-gradient-to-r from-amber-50 via-orange-50 to-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
    <div class="flex items-start gap-3.5">
      <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-amber-500/20">
        💡
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h4 class="font-extrabold text-slate-900 text-sm">Akun Baru Bersih (Belum Ada Catatan Transaksi)</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Saldo Rp0</span>
        </div>
        <p class="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
          Grafik <strong>Arus Kas 6 Bulan</strong> dan diagram <strong>Pengeluaran per Kategori</strong> membutuhkan catatan transaksi untuk divisualisasikan. Kamu bisa mencatat transaksi baru melalui tombol atau bot Telegram, atau klik tombol di bawah untuk langsung mencoba data transaksi contoh (demo).
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
      <form method="POST" action="/api/demo/seed-transactions" class="w-full sm:w-auto">
        <button type="submit" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-1.5 transition-all">
          <span>✨</span> Muat Transaksi Contoh (Demo)
        </button>
      </form>
    </div>
  </div>
  ` : ''}

  <!-- Onboarding Checklist (Part 3 & Part 12.5a) -->
  <div class="bg-gradient-to-r from-slate-900 via-orange-950 to-brand-950 rounded-2xl p-6 text-white shadow-lg border border-orange-900/40 relative overflow-hidden">
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs uppercase tracking-wider text-orange-200 font-bold">Onboarding Checklist</span>
        <span class="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-orange-200 border border-white/10">
          ${checklistCompleted} dari 3 Selesai
        </span>
      </div>
      <h3 class="text-lg font-bold mb-4">Langkah Menghubungkan TataDana ke Akunmu:</h3>

      <div class="grid sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <div class="w-7 h-7 rounded-full ${user.telegram_connected ? 'bg-emerald-500' : 'bg-white/20'} text-white flex items-center justify-center font-bold">
            ${user.telegram_connected ? '✓' : '1'}
          </div>
          <div>
            <div class="font-bold">1. Hubungkan Telegram</div>
            <div class="text-orange-200 text-[11px]">
              ${user.telegram_connected ? '🟢 Sudah Terhubung' : '<a href="/settings?tab=bot" class="underline font-bold text-amber-300">Input token bot →</a>'}
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <div class="w-7 h-7 rounded-full ${defaultWallet ? 'bg-emerald-500' : 'bg-white/20'} text-white flex items-center justify-center font-bold">
            ${defaultWallet ? '✓' : '2'}
          </div>
          <div>
            <div class="font-bold">2. Set Dompet Default</div>
            <div class="text-orange-200 text-[11px]">
              ${defaultWallet ? `${defaultWallet.name}` : '<a href="/wallets" class="underline font-bold text-amber-300">Pilih dompet bot →</a>'}
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-3">
          <div class="w-7 h-7 rounded-full ${budgetCount > 0 ? 'bg-emerald-500' : 'bg-white/20'} text-white flex items-center justify-center font-bold">
            ${budgetCount > 0 ? '✓' : '3'}
          </div>
          <div>
            <div class="font-bold">3. Atur Batas Budget</div>
            <div class="text-orange-200 text-[11px]">
              ${budgetCount > 0 ? `${budgetCount} Kategori Terpasang` : '<a href="/budgets" class="underline font-bold text-amber-300">Atur budget bulanan →</a>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PERIODE TRANSAKSI FILTER BAR (User Request) -->
  <div class="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold custom-scrollbar pb-1 sm:pb-0">
      <span class="text-slate-500 font-bold uppercase text-[11px] mr-1 flex items-center gap-1.5 whitespace-nowrap">
        <i data-lucide="calendar" class="w-4 h-4 text-brand-600"></i> Filter Periode:
      </span>
      <button type="button" onclick="selectOverviewPeriod('today')" id="dPeriodBtn-today" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        Hari Ini
      </button>
      <button type="button" onclick="selectOverviewPeriod('yesterday')" id="dPeriodBtn-yesterday" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        Kemarin
      </button>
      <button type="button" onclick="selectOverviewPeriod('7days')" id="dPeriodBtn-7days" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        7 Hari
      </button>
      <button type="button" onclick="selectOverviewPeriod('30days')" id="dPeriodBtn-30days" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        30 Hari
      </button>
      <button type="button" onclick="selectOverviewPeriod('this_month')" id="dPeriodBtn-this_month" class="d-period-btn px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold border border-brand-600 shadow-sm transition-all text-xs whitespace-nowrap">
        Bulan Ini
      </button>
      <button type="button" onclick="selectOverviewPeriod('last_month')" id="dPeriodBtn-last_month" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        Bulan Lalu
      </button>
      <button type="button" onclick="selectOverviewPeriod('this_year')" id="dPeriodBtn-this_year" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        Tahun Ini
      </button>
      <button type="button" onclick="selectOverviewPeriod('all')" id="dPeriodBtn-all" class="d-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap">
        Semua
      </button>
    </div>
    <div id="overviewPeriodBadge" class="text-xs text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl whitespace-nowrap self-start sm:self-center">
      Bulan Ini • Waktu WIB
    </div>
  </div>

  <!-- 4 STATS CARDS (Part 3 & Dynamic Period Updates) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Saldo Total -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
      <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
        <span>Saldo Total</span>
        <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <i data-lucide="wallet" class="w-4 h-4"></i>
        </div>
      </div>
      <div class="text-2xl font-black ${totalBalance < 0 ? 'text-red-600' : 'text-slate-900'}">
        ${formattedBalance}
      </div>
      <div class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
        <span class="text-brand-600 font-semibold flex items-center">
          <i data-lucide="layers" class="w-3.5 h-3.5 mr-1"></i> ${(wallets || []).length} Dompet
        </span>
        <span>tersinkron</span>
      </div>
    </div>

    <!-- Pemasukan Periode -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
      <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
        <span id="dCardTitleIncome">Pemasukan Bulan Ini</span>
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <i data-lucide="trending-up" class="w-4 h-4"></i>
        </div>
      </div>
      <div id="dCardValIncome" class="text-2xl font-black text-emerald-600">
        +Rp${Number(monthlyIncome || 0).toLocaleString('id-ID')}
      </div>
      <div id="dCardSubtitleIncome" class="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
        <span>🟢 Uang Masuk (+Bertambah)</span>
      </div>
    </div>

    <!-- Pengeluaran Periode -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
      <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
        <span id="dCardTitleExpense">Pengeluaran Bulan Ini</span>
        <div class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <i data-lucide="trending-down" class="w-4 h-4"></i>
        </div>
      </div>
      <div id="dCardValExpense" class="text-2xl font-black text-red-600">
        -Rp${Number(monthlyExpense || 0).toLocaleString('id-ID')}
      </div>
      <div id="dCardSubtitleExpense" class="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
        <span>🔴 Uang Keluar (-Berkurang)</span>
      </div>
    </div>

    <!-- Net Cashflow / Budget Tersisa -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
      <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
        <span id="dCardTitleNet">Net Cashflow Bulan Ini</span>
        <div class="w-8 h-8 rounded-lg bg-amber-50 text-brand-600 flex items-center justify-center">
          <i data-lucide="target" class="w-4 h-4"></i>
        </div>
      </div>
      <div id="dCardValNet" class="text-2xl font-black text-brand-600">
        ${(monthlyIncome - monthlyExpense) >= 0 ? '+' : '-'}Rp${Math.abs(monthlyIncome - monthlyExpense).toLocaleString('id-ID')}
      </div>
      <div id="dCardSubtitleNet" class="text-xs text-brand-700 font-semibold mt-2">
        🎯 Budget Tersisa: Rp${Number(remainingBudget || 0).toLocaleString('id-ID')}
      </div>
    </div>
  </div>

  <!-- CHARTS SECTION (Part 3: Pie Chart, Bar Chart 6 Bulan, Trend Line) -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Chart 1: Bar Chart Pemasukan vs Pengeluaran 6 Bulan -->
    <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Arus Kas 6 Bulan Terakhir</h3>
            <p class="text-xs text-slate-500">Perbandingan total pemasukan dan pengeluaran per bulan</p>
          </div>
          <span class="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
            WIB Timezone
          </span>
        </div>
        <div class="w-full h-64 relative block">
          <canvas id="cashflowBarChart"></canvas>
          <div id="cashflowBarEmptyMsg" style="${(chartIncomeData.some(v => v > 0) || chartExpenseData.some(v => v > 0)) ? 'display: none;' : 'display: flex;'}" class="${(chartIncomeData.some(v => v > 0) || chartExpenseData.some(v => v > 0)) ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center text-center text-xs text-slate-400 bg-white/85 backdrop-blur-[2px] rounded-xl p-4 z-10">
            <div class="w-12 h-12 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center mb-2 text-2xl shadow-xs border border-orange-100">
              📊
            </div>
            <span class="font-bold text-slate-800 text-sm">Belum Ada Riwayat Transaksi 6 Bulan Terakhir</span>
            <span class="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">Grafik batang pemasukan vs pengeluaran akan otomatis terbentuk saat kamu mencatat transaksi.</span>
            <div class="flex items-center gap-2 mt-3 pointer-events-auto">
              <button type="button" onclick="openModal('addTxModal')" class="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm">
                + Catat Transaksi
              </button>
              <form method="POST" action="/api/demo/seed-transactions" class="inline">
                <button type="submit" class="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200">
                  ✨ Muat Data Demo
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5 font-medium"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Pemasukan (+)</span>
          <span class="flex items-center gap-1.5 font-medium"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Pengeluaran (-)</span>
        </div>
        <a href="/transactions" class="font-bold text-brand-600 hover:underline">Lihat Semua Transaksi →</a>
      </div>
    </div>

    <!-- Chart 2: Pie Chart Pengeluaran per Kategori -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Pengeluaran per Kategori</h3>
            <p class="text-xs text-slate-500">Distribusi alokasi dana periode ini</p>
          </div>
          <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            ${expenseCategories.length} Kategori
          </span>
        </div>

        <div class="h-48 relative flex items-center justify-center my-2">
          <canvas id="categoryPieChart"></canvas>
          <div id="categoryPieEmptyMsg" class="${catAmounts.length > 0 ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center text-center text-xs text-slate-400 pointer-events-none p-3">
            <span class="text-2xl mb-1">🍩</span>
            <span class="font-bold text-slate-700 text-xs">Belum Ada Pengeluaran</span>
            <span class="text-[10px] text-slate-400 mt-0.5">Saldo Rp0 • Menunggu Transaksi</span>
          </div>
        </div>

        <!-- Category Breakdown List (Always Visible & Dynamically Updated) -->
        <div class="mt-4 pt-3 border-t border-slate-100">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Rincian per Kategori</span>
            <span id="categoryBreakdownTotalBadge" class="text-[11px] font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
              Total: Rp${Number(monthlyExpense || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div id="categoryBreakdownList" class="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            ${categoryBreakdownHtml}
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-100 text-center flex items-center justify-between">
        <a href="/budgets" class="text-xs font-bold text-brand-600 hover:underline">Kelola Budget Kategori →</a>
        <button type="button" onclick="openModal('addTxModal')" class="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Catat Baru
        </button>
      </div>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- KALENDER JATAH HARIAN & HEATMAP KEUANGAN (User Request) -->
  <!-- ============================================================== -->
  <div id="dailyAllowanceCalendarSection" class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xl">📅</span>
          <h3 class="font-extrabold text-slate-900 text-lg">Kalender Jatah Harian & Heatmap Keuangan</h3>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            Realtime WIB
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Pantau batas pengeluaran harian, hari bebas belanja (no-spend days), dan visualisasi intensitas pengeluaran bulanan.
        </p>
      </div>

      <!-- Controls: View Mode & Custom Target -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
          <button type="button" onclick="switchCalView('calendar')" id="btnCalViewCalendar" class="px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-900 transition-all flex items-center gap-1.5">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-brand-600"></i> Kalender
          </button>
          <button type="button" onclick="switchCalView('heatmap')" id="btnCalViewHeatmap" class="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5">
            <i data-lucide="grid" class="w-3.5 h-3.5 text-emerald-600"></i> Heatmap
          </button>
        </div>
        <a href="/settings?tab=daily_budget" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors">
          <i data-lucide="sliders" class="w-3.5 h-3.5"></i> Atur Jatah di Pengaturan
        </a>
      </div>
    </div>

    <!-- 4 Mini KPI Cards for Daily Allowance -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target Jatah Harian</span>
        <div id="kpiDailyTarget" class="text-lg font-black text-slate-900 mt-0.5">Rp0</div>
        <span class="text-[10px] text-slate-400">Total budget ÷ hari bulan</span>
      </div>
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pengeluaran Hari Ini</span>
        <div id="kpiTodaySpent" class="text-lg font-black text-slate-900 mt-0.5">Rp0</div>
        <span id="kpiTodayStatus" class="text-[10px] font-bold text-emerald-600">Status Jatah</span>
      </div>
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">No-Spend Days</span>
        <div id="kpiNoSpendDays" class="text-lg font-black text-emerald-600 mt-0.5">0 Hari</div>
        <span class="text-[10px] text-slate-400">Hari tanpa pengeluaran</span>
      </div>
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rata-rata Real Harian</span>
        <div id="kpiRealAvgDaily" class="text-lg font-black text-slate-900 mt-0.5">Rp0</div>
        <span class="text-[10px] text-slate-400">Realisasi bulan ini</span>
      </div>
    </div>

    <!-- Month Navigation Bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button type="button" onclick="changeCalendarMonth(-1)" class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
        <span id="calCurrentMonthTitle" class="font-extrabold text-base text-slate-900 min-w-[140px] text-center">
          Oktober 2026
        </span>
        <button type="button" onclick="changeCalendarMonth(1)" class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button type="button" onclick="resetCalendarToCurrentMonth()" class="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors">
          Hari Ini
        </button>
      </div>
    </div>

    <!-- VIEW 1: KALENDER BULANAN (Grid 7 Kolom) -->
    <div id="calendarGridViewContainer">
      <!-- Days of week Header -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div class="py-1">Sen</div>
        <div class="py-1">Sel</div>
        <div class="py-1">Rab</div>
        <div class="py-1">Kam</div>
        <div class="py-1">Jum</div>
        <div class="py-1 text-rose-500">Sab</div>
        <div class="py-1 text-rose-500">Min</div>
      </div>

      <!-- Calendar Day Cells Grid -->
      <div id="calendarCellsGrid" class="grid grid-cols-7 gap-1.5 sm:gap-2 text-xs">
        <!-- Injected via JavaScript -->
      </div>

      <!-- Calendar Legend -->
      <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span> Rp0 (No-Spend)
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-emerald-100 border border-emerald-400"></span> Hemat (&lt;80%)
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-amber-100 border border-amber-400"></span> Sesuai Jatah (80-100%)
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded bg-rose-100 border border-rose-400"></span> Over Jatah (&gt;100%)
          </span>
        </div>
        <span class="text-slate-400 italic">💡 Klik tanggal untuk melihat rincian transaksi harian</span>
      </div>
    </div>

    <!-- VIEW 2: HEATMAP STRIP VIEW -->
    <div id="calendarHeatmapViewContainer" class="hidden">
      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
          <span>Heatmap Intensitas Pengeluaran Harian</span>
          <span id="heatmapMonthBadge" class="text-slate-500 font-normal">Oktober 2026</span>
        </div>
        <div id="heatmapStripGrid" class="flex flex-wrap gap-2">
          <!-- Injected via JS -->
        </div>
        <div class="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div class="flex items-center gap-2">
            <span>Kurang Intens</span>
            <span class="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></span>
            <span class="w-3.5 h-3.5 rounded bg-emerald-200 border border-emerald-300"></span>
            <span class="w-3.5 h-3.5 rounded bg-emerald-400 border border-emerald-500"></span>
            <span class="w-3.5 h-3.5 rounded bg-amber-300 border border-amber-400"></span>
            <span class="w-3.5 h-3.5 rounded bg-rose-400 border border-rose-500"></span>
            <span>Sangat Boros</span>
          </div>
          <span class="text-slate-400 italic">Hover / klik pada kotak untuk rincian</span>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL DETAIL TRANSAKSI TANGGAL KALENDER -->
  <div id="calendarDayModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in duration-150">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 id="calModalDateTitle" class="font-extrabold text-slate-900 text-base">Rincian Transaksi</h3>
          <p id="calModalSubTitle" class="text-xs text-slate-500 mt-0.5">Daftar transaksi dan evaluasi jatah harian</p>
        </div>
        <button onclick="closeModal('calendarDayModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Allowance Comparison Bar in Modal -->
      <div id="calModalAllowanceBox" class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <!-- Injected via JS -->
      </div>

      <!-- Transaction Items List -->
      <div class="space-y-2">
        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaksi pada Hari Ini:</div>
        <div id="calModalTxList" class="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs custom-scrollbar">
          <!-- Injected via JS -->
        </div>
      </div>

      <div class="pt-2 flex justify-between items-center border-t border-slate-100">
        <button onclick="openModal('addTxModal')" class="px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1.5 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Catat Transaksi Baru
        </button>
        <button onclick="closeModal('calendarDayModal')" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors">
          Tutup
        </button>
      </div>
    </div>
  </div>

  <!-- LIST 10 TRANSAKSI TERBARU (Part 3 & Dynamic Period Filtering) -->
  <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 id="recentTxSectionTitle" class="font-bold text-slate-900 text-base">10 Transaksi Terbaru</h3>
        <p id="recentTxSectionSubtitle" class="text-xs text-slate-500">Tersinkronisasi otomatis dari Telegram Bot dan Web</p>
      </div>
      <a href="/transactions" class="text-xs font-bold text-brand-600 hover:underline">Lihat Semua Transaksi →</a>
    </div>

    <div id="recentTxContainerWrapper">
      ${hasTransactions ? `
      <div id="recentTxList" class="divide-y divide-slate-100">
        ${recentTransactions.slice(0, 10).map(t => {
          const isIncome = t.type === 'income';
          const isTransfer = t.type === 'transfer';
          const cat = (categories || []).find(c => c.id === t.category_id);
          const wal = (wallets || []).find(w => w.id === t.wallet_id);
          const srcInfo = formatSourceInfo(t.source);

          let iconBg = isIncome ? 'bg-emerald-50 text-emerald-600' : isTransfer ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600';
          let amountPrefix = isIncome ? '+' : isTransfer ? '⇄ ' : '-';
          let amountColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-red-600';
          let typeBadge = isIncome
            ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 +Pemasukan</span>'
            : isTransfer
              ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">⇄ Transfer</span>'
              : '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">🔴 -Pengeluaran</span>';

          return `
            <div class="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center font-bold text-base">
                  ${cat?.emoji || (isTransfer ? '⇄' : '🏷️')}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-slate-900">${t.notes || 'Transaksi Tanpa Catatan'}</span>
                    ${typeBadge}
                  </div>
                  <div class="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                    <span class="font-bold text-slate-700 flex items-center gap-1">
                      <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i>
                      <span>${formatIndoFullDate(t.transaction_date)}</span>
                    </span>
                    <span>•</span>
                    <span>👛 ${wal?.name || 'Dompet'}</span>
                    <span>•</span>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${srcInfo.badge} border">
                      <span>${srcInfo.icon}</span>
                      <span>Sumber: ${srcInfo.label}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-sm font-black ${amountColor} text-right">
                ${amountPrefix}Rp${Number(t.amount).toLocaleString('id-ID')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ` : `
      <!-- Empty State Onboarding Illustration (Part 3 & Part 12.1) -->
      <div class="p-12 text-center space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
          💸
        </div>
        <div class="max-w-sm mx-auto">
          <h4 class="font-bold text-slate-900 text-base">Belum Ada Transaksi Tercatat</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Mulai catat transaksi pertamamu sekarang! Bisa lewat tombol di bawah, atau kirim chat ke bot Telegram kamu.
          </p>
        </div>
        <div class="flex justify-center gap-3 pt-2">
          <button onclick="openModal('addTxModal')" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20">
            + Catat Transaksi Pertama
          </button>
          <a href="/simulator" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">
            Simulasikan Chat Bot
          </a>
        </div>
      </div>
      `}
    </div>
  </div>

  ${renderTransactionModal({ categories, wallets })}

  <script>
    // Global references for dynamic reactive filtering & calendar
    window.allDashboardTxs = ${JSON.stringify(recentTransactions || [])};
    window.allDashboardCats = ${JSON.stringify(categories || [])};
    window.allDashboardWals = ${JSON.stringify(wallets || [])};
    window.dashboardTotalBudget = ${JSON.stringify(expenseCategories.reduce((s, c) => s + Number(c.monthly_budget || 0), 0))};
    window.userProfileDailyBudget = {
      mode: '${user.daily_budget_mode || 'auto'}',
      custom: ${Number(user.daily_budget_custom || 100000)}
    };

    const monthNamesIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    function getLocalDateString(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    // Initialize Charts for Cashflow & Category Expenses
    let cashflowBarChartInstance = null;
    let categoryPieChartInstance = null;
    let chartRetryAttempts = 0;

    function renderNativeCanvasFallbackCharts() {
      // 1. Draw Native Canvas Bar Chart (Cashflow 6 Bulan)
      const barCanvas = document.getElementById('cashflowBarChart');
      if (barCanvas) {
        const ctx = barCanvas.getContext('2d');
        if (ctx) {
          const rect = barCanvas.parentElement ? barCanvas.parentElement.getBoundingClientRect() : { width: 500 };
          const w = Math.max(320, Math.floor(rect.width || 500));
          const h = 240;
          barCanvas.width = w;
          barCanvas.height = h;
          barCanvas.style.width = '100%';
          barCanvas.style.height = '100%';

          ctx.clearRect(0, 0, w, h);
          const labels = ${JSON.stringify(chartLabels)};
          const inc = ${JSON.stringify(chartIncomeData)};
          const exp = ${JSON.stringify(chartExpenseData)};
          const maxVal = Math.max(...inc, ...exp, 100000);
          const count = labels.length || 6;
          const slotW = (w - 60) / count;
          const barW = Math.max(8, Math.min(22, slotW / 3));

          // Base horizontal line
          const baseY = h - 45;
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(30, baseY);
          ctx.lineTo(w - 20, baseY);
          ctx.stroke();

          // Grid lines
          ctx.strokeStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(30, baseY - 70);
          ctx.lineTo(w - 20, baseY - 70);
          ctx.moveTo(30, baseY - 140);
          ctx.lineTo(w - 20, baseY - 140);
          ctx.stroke();

          labels.forEach((lbl, i) => {
            const centerX = 35 + i * slotW + slotW / 2;
            const incVal = inc[i] || 0;
            const expVal = exp[i] || 0;
            const hInc = Math.max(incVal > 0 ? 4 : 0, Math.round((incVal / maxVal) * 135));
            const hExp = Math.max(expVal > 0 ? 4 : 0, Math.round((expVal / maxVal) * 135));

            // Income bar (emerald)
            ctx.fillStyle = '#10b981';
            ctx.fillRect(centerX - barW - 2, baseY - hInc, barW, hInc);

            // Expense bar (rose)
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(centerX + 2, baseY - hExp, barW, hExp);

            // Month Label
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(lbl, centerX, baseY + 18);
          });
        }
      }

      // 2. Draw Native Canvas Doughnut Chart (Pengeluaran per Kategori)
      const pieCanvas = document.getElementById('categoryPieChart');
      if (pieCanvas) {
        const ctx = pieCanvas.getContext('2d');
        if (ctx) {
          const rect = pieCanvas.parentElement ? pieCanvas.parentElement.getBoundingClientRect() : { width: 190 };
          const size = Math.min(Math.floor(rect.width || 190), 190);
          pieCanvas.width = size;
          pieCanvas.height = size;
          ctx.clearRect(0, 0, size, size);

          const cx = size / 2;
          const cy = size / 2;
          const rOuter = size * 0.42;
          const rInner = size * 0.28;

          const amounts = ${JSON.stringify(catAmounts)};
          const colors = ${JSON.stringify(catColors.slice(0, catAmounts.length))};
          const total = amounts.reduce((a, b) => a + b, 0);

          if (total > 0) {
            let startAngle = -0.5 * Math.PI;
            amounts.forEach((amt, i) => {
              const slice = (amt / total) * 2 * Math.PI;
              const endAngle = startAngle + slice;
              ctx.beginPath();
              ctx.arc(cx, cy, rOuter, startAngle, endAngle);
              ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
              ctx.closePath();
              ctx.fillStyle = colors[i % colors.length];
              ctx.fill();
              startAngle = endAngle;
            });
          } else {
            ctx.beginPath();
            ctx.arc(cx, cy, rOuter, 0, 2 * Math.PI);
            ctx.arc(cx, cy, rInner, 2 * Math.PI, 0, true);
            ctx.closePath();
            ctx.fillStyle = '#e2e8f0';
            ctx.fill();
          }
        }
      }
    }

    function initDashboardCharts() {
      if (typeof Chart === 'undefined') {
        chartRetryAttempts++;
        if (chartRetryAttempts < 8) {
          setTimeout(initDashboardCharts, 250);
          return;
        }
        renderNativeCanvasFallbackCharts();
        return;
      }

      // 1. Bar Chart (Cashflow 6 Months)
      const ctxBar = document.getElementById('cashflowBarChart');
      if (ctxBar) {
        if (cashflowBarChartInstance) {
          try { cashflowBarChartInstance.destroy(); } catch (e) {}
          cashflowBarChartInstance = null;
        }
        try {
          cashflowBarChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(chartLabels)},
              datasets: [
                {
                  label: 'Pemasukan (+)',
                  data: ${JSON.stringify(chartIncomeData)},
                  backgroundColor: '#10b981',
                  borderRadius: 6
                },
                {
                  label: 'Pengeluaran (-)',
                  data: ${JSON.stringify(chartExpenseData)},
                  backgroundColor: '#e11d48',
                  borderRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 300 },
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.dataset.label || '';
                      const val = Number(context.raw || 0);
                      return label + ': Rp' + val.toLocaleString('id-ID');
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMax: 100000,
                  ticks: {
                    callback: (val) => {
                      if (val === 0) return 'Rp0';
                      if (Math.abs(val) >= 1000000) return 'Rp' + (val / 1000000) + 'jt';
                      if (Math.abs(val) >= 1000) return 'Rp' + (val / 1000) + 'rb';
                      return 'Rp' + val;
                    }
                  }
                }
              }
            }
          });
        } catch (chartErr) {
          console.warn('Chart.js render failed, falling back to native canvas:', chartErr);
          renderNativeCanvasFallbackCharts();
        }
      }

      // 2. Pie Chart (Category Expenses)
      const ctxPie = document.getElementById('categoryPieChart');
      if (ctxPie && !categoryPieChartInstance) {
        const initialNames = ${JSON.stringify(catNames)};
        const initialAmounts = ${JSON.stringify(catAmounts)};
        const initialColors = ${JSON.stringify(catColors.slice(0, catAmounts.length))};
        const hasData = initialAmounts.length > 0;

        categoryPieChartInstance = new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: hasData ? initialNames : ['Belum Ada Pengeluaran'],
            datasets: [{
              data: hasData ? initialAmounts : [1],
              backgroundColor: hasData ? initialColors : ['#e2e8f0'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'bottom',
                display: hasData,
                labels: { boxWidth: 10, font: { size: 10 } }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    if (label === 'Belum Ada Pengeluaran') return 'Belum ada pengeluaran';
                    const val = Number(context.raw || 0);
                    return label + ': Rp' + val.toLocaleString('id-ID');
                  }
                }
              }
            }
          }
        });
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDashboardCharts);
    } else {
      initDashboardCharts();
    }

    function formatIndoFullDateJS(dateStr) {
      if (!dateStr) return '-';
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const year = m[1];
        const monthName = months[parseInt(m[2], 10) - 1] || m[2];
        const day = parseInt(m[3], 10);
        return day + ' ' + monthName + ' ' + year;
      }
      return dateStr;
    }

    function formatSourceInfoJS(source) {
      if (!source) return { label: 'Web Dashboard', icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
      const s = String(source).toLowerCase();
      if (s === 'web' || s === 'web_manual') return { label: 'Web Dashboard', icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
      if (s === 'telegram_text') return { label: 'Telegram (Teks)', icon: '📱', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
      if (s === 'telegram_voice') return { label: 'Telegram (Voice Note)', icon: '🎙️', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      if (s === 'telegram_photo') return { label: 'Telegram (Foto Struk)', icon: '🧾', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      if (s.startsWith('telegram')) return { label: 'Telegram Bot', icon: '🤖', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
      if (s === 'simulator') return { label: 'Simulator Bot', icon: '🤖', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
      if (s === 'transfer') return { label: 'Transfer Dompet', icon: '⇄', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
      return { label: source.replace('_', ' ').toUpperCase(), icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
    }

    // -------------------------------------------------------------
    // PERIODE TRANSAKSI FILTERING ENGINE (User Request)
    // Hari Ini, Kemarin, 7 Hari, 30 Hari, Bulan Ini, Bulan Lalu, Tahun Ini
    // -------------------------------------------------------------
    function selectOverviewPeriod(periodKey) {
      document.querySelectorAll('.d-period-btn').forEach(btn => {
        btn.className = 'd-period-btn px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap';
      });

      const activeBtn = document.getElementById('dPeriodBtn-' + periodKey);
      if (activeBtn) {
        activeBtn.className = 'd-period-btn px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold border border-brand-600 shadow-sm transition-all text-xs whitespace-nowrap';
      }

      const now = new Date();
      let start = null;
      let end = null;
      let label = 'Semua Waktu';

      if (periodKey === 'today') {
        start = getLocalDateString(now);
        end = start;
        label = 'Hari Ini (' + now.getDate() + ' ' + monthNamesIndo[now.getMonth()] + ')';
      } else if (periodKey === 'yesterday') {
        const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        start = getLocalDateString(y);
        end = start;
        label = 'Kemarin (' + y.getDate() + ' ' + monthNamesIndo[y.getMonth()] + ')';
      } else if (periodKey === '7days') {
        const d7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        start = getLocalDateString(d7);
        end = getLocalDateString(now);
        label = '7 Hari Terakhir';
      } else if (periodKey === '30days') {
        const d30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        start = getLocalDateString(d30);
        end = getLocalDateString(now);
        label = '30 Hari Terakhir';
      } else if (periodKey === 'this_month') {
        const sm = new Date(now.getFullYear(), now.getMonth(), 1);
        const em = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = getLocalDateString(sm);
        end = getLocalDateString(em);
        label = 'Bulan Ini (' + monthNamesIndo[now.getMonth()] + ' ' + now.getFullYear() + ')';
      } else if (periodKey === 'last_month') {
        const spm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const epm = new Date(now.getFullYear(), now.getMonth(), 0);
        start = getLocalDateString(spm);
        end = getLocalDateString(epm);
        label = 'Bulan Lalu (' + monthNamesIndo[spm.getMonth()] + ' ' + spm.getFullYear() + ')';
      } else if (periodKey === 'this_year') {
        const sy = new Date(now.getFullYear(), 0, 1);
        const ey = new Date(now.getFullYear(), 11, 31);
        start = getLocalDateString(sy);
        end = getLocalDateString(ey);
        label = 'Tahun Ini (' + now.getFullYear() + ')';
      }

      const badge = document.getElementById('overviewPeriodBadge');
      if (badge) badge.innerText = label + ' • Waktu WIB';

      // Filter transactions
      const txs = window.allDashboardTxs || [];
      const filtered = txs.filter(t => {
        if (!t.transaction_date) return false;
        if (start && t.transaction_date < start) return false;
        if (end && t.transaction_date > end) return false;
        return true;
      });

      // Recalculate totals
      const pIn = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const pOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      const net = pIn - pOut;

      // Update card UI
      const tInEl = document.getElementById('dCardTitleIncome');
      const vInEl = document.getElementById('dCardValIncome');
      if (tInEl) tInEl.innerText = 'Pemasukan ' + label;
      if (vInEl) vInEl.innerText = '+Rp' + pIn.toLocaleString('id-ID');

      const tOutEl = document.getElementById('dCardTitleExpense');
      const vOutEl = document.getElementById('dCardValExpense');
      if (tOutEl) tOutEl.innerText = 'Pengeluaran ' + label;
      if (vOutEl) vOutEl.innerText = '-Rp' + pOut.toLocaleString('id-ID');

      const tNetEl = document.getElementById('dCardTitleNet');
      const vNetEl = document.getElementById('dCardValNet');
      if (tNetEl) tNetEl.innerText = 'Net Cashflow ' + label;
      if (vNetEl) {
        vNetEl.innerText = (net >= 0 ? '+' : '-') + 'Rp' + Math.abs(net).toLocaleString('id-ID');
        vNetEl.className = 'text-2xl font-black ' + (net >= 0 ? 'text-emerald-600' : 'text-red-600');
      }

      // Update Recent Transactions List
      const titleEl = document.getElementById('recentTxSectionTitle');
      const subEl = document.getElementById('recentTxSectionSubtitle');
      if (titleEl) titleEl.innerText = 'Transaksi Periode: ' + label;
      if (subEl) subEl.innerText = 'Ditemukan ' + filtered.length + ' transaksi pada periode ini';

      const listWrapper = document.getElementById('recentTxContainerWrapper');
      if (listWrapper) {
        if (filtered.length === 0) {
          listWrapper.innerHTML = '<div class="p-8 text-center text-xs text-slate-400">Tidak ada transaksi yang tercatat pada periode ' + label + '.</div>';
        } else {
          const rowsHtml = filtered.slice(0, 10).map(t => {
            const isIncome = t.type === 'income';
            const isTransfer = t.type === 'transfer';
            const cat = (window.allDashboardCats || []).find(c => c.id === t.category_id);
            const wal = (window.allDashboardWals || []).find(w => w.id === t.wallet_id);

            const src = formatSourceInfoJS(t.source);

            let iconBg = isIncome ? 'bg-emerald-50 text-emerald-600' : isTransfer ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600';
            let amountPrefix = isIncome ? '+' : isTransfer ? '⇄ ' : '-';
            let amountColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-red-600';
            let typeBadge = isIncome
              ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 +Pemasukan</span>'
              : isTransfer
                ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">⇄ Transfer</span>'
                : '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">🔴 -Pengeluaran</span>';

            return '<div class="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">' +
              '<div class="flex items-center gap-3">' +
                '<div class="w-10 h-10 rounded-xl ' + iconBg + ' flex items-center justify-center font-bold text-base">' +
                  (cat?.emoji || (isTransfer ? '⇄' : '🏷️')) +
                '</div>' +
                '<div>' +
                  '<div class="flex items-center gap-2">' +
                    '<span class="text-sm font-bold text-slate-900">' + (t.notes || 'Transaksi Tanpa Catatan') + '</span>' +
                    typeBadge +
                  '</div>' +
                  '<div class="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">' +
                    '<span class="font-bold text-slate-700 flex items-center gap-1">' +
                      '📅 ' + formatIndoFullDateJS(t.transaction_date) +
                    '</span>' +
                    '<span>•</span>' +
                    '<span>👛 ' + (wal?.name || 'Dompet') + '</span>' +
                    '<span>•</span>' +
                    '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ' + src.badge + '">' +
                      src.icon + ' Sumber: ' + src.label +
                    '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="text-sm font-black ' + amountColor + ' text-right">' +
                amountPrefix + 'Rp' + Number(t.amount).toLocaleString('id-ID') +
              '</div>' +
            '</div>';
          }).join('');
          listWrapper.innerHTML = '<div class="divide-y divide-slate-100">' + rowsHtml + '</div>';
        }
      }

      // Update pie chart
      const catMap = {};
      const catEmojiMap = {};
      filtered.filter(t => t.type === 'expense').forEach(t => {
        const c = (window.allDashboardCats || []).find(cat => cat.id === t.category_id);
        const name = c ? c.name : 'Lainnya';
        const emoji = c ? (c.emoji || '🏷️') : '🏷️';
        catMap[name] = (catMap[name] || 0) + Number(t.amount || 0);
        catEmojiMap[name] = emoji;
      });

      const newLabels = Object.keys(catMap).map(k => (catEmojiMap[k] || '🏷️') + ' ' + k);
      const newAmounts = Object.values(catMap);
      const emptyMsg = document.getElementById('categoryPieEmptyMsg');

      if (categoryPieChartInstance) {
        if (newAmounts.length > 0) {
          if (emptyMsg) emptyMsg.classList.add('hidden');
          categoryPieChartInstance.data.labels = newLabels;
          categoryPieChartInstance.data.datasets[0].data = newAmounts;
          categoryPieChartInstance.data.datasets[0].backgroundColor = [
            '#800020', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#8b5cf6', '#0d9488', '#0284c7'
          ].slice(0, newAmounts.length);
          categoryPieChartInstance.options.plugins.legend.display = true;
        } else {
          if (emptyMsg) emptyMsg.classList.remove('hidden');
          categoryPieChartInstance.data.labels = ['Belum Ada Pengeluaran'];
          categoryPieChartInstance.data.datasets[0].data = [1];
          categoryPieChartInstance.data.datasets[0].backgroundColor = ['#e2e8f0'];
          categoryPieChartInstance.options.plugins.legend.display = false;
        }
        categoryPieChartInstance.update();
      }

      // Update Category Breakdown List
      const bdListEl = document.getElementById('categoryBreakdownList');
      const bdTotalEl = document.getElementById('categoryBreakdownTotalBadge');
      if (bdTotalEl) {
        bdTotalEl.innerText = 'Total: Rp' + pOut.toLocaleString('id-ID');
      }

      if (bdListEl) {
        if (pOut > 0) {
          const catColors = ['#800020', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#8b5cf6', '#0d9488', '#0284c7'];
          const sortedCats = Object.keys(catMap).map((k, idx) => {
            const amt = catMap[k];
            const pct = ((amt / pOut) * 100).toFixed(1);
            return {
              name: k,
              emoji: catEmojiMap[k] || '🏷️',
              amount: amt,
              pct: pct,
              color: catColors[idx % catColors.length]
            };
          }).sort((a, b) => b.amount - a.amount);

          const bdHtml = sortedCats.map(c => {
            return '<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">' +
              '<div class="flex items-center justify-between text-xs font-semibold mb-1.5">' +
                '<div class="flex items-center gap-2 truncate">' +
                  '<span class="text-base">' + c.emoji + '</span>' +
                  '<span class="font-bold text-slate-800 truncate">' + c.name + '</span>' +
                '</div>' +
                '<div class="text-right shrink-0">' +
                  '<span class="font-extrabold text-slate-900">Rp' + c.amount.toLocaleString('id-ID') + '</span>' +
                  '<span class="text-[10px] text-slate-400 font-bold ml-1">(' + c.pct + '%)</span>' +
                '</div>' +
              '</div>' +
              '<div class="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">' +
                '<div class="h-1.5 rounded-full transition-all duration-500" style="width: ' + c.pct + '%; background-color: ' + c.color + ';"></div>' +
              '</div>' +
            '</div>';
          }).join('');
          bdListEl.innerHTML = bdHtml;
        } else {
          const expCats = (window.allDashboardCats || []).filter(c => c.type === 'expense');
          const catColors = ['#800020', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#8b5cf6', '#0d9488', '#0284c7'];
          const emptyCatsHtml = expCats.map((c, idx) => {
            const color = catColors[idx % catColors.length];
            return '<div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">' +
              '<div class="flex items-center justify-between text-xs font-semibold mb-1.5">' +
                '<div class="flex items-center gap-2 truncate">' +
                  '<span class="text-base">' + (c.emoji || '🏷️') + '</span>' +
                  '<span class="font-bold text-slate-700 truncate">' + c.name + '</span>' +
                '</div>' +
                '<div class="text-right shrink-0">' +
                  '<span class="font-bold text-slate-400">Rp0</span>' +
                  '<span class="text-[10px] text-slate-400 font-bold ml-1">(0%)</span>' +
                '</div>' +
              '</div>' +
              '<div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">' +
                '<div class="h-1.5 rounded-full" style="width: 0%; background-color: ' + color + ';"></div>' +
              '</div>' +
            '</div>';
          }).join('');

          const hasAnyTx = (window.allDashboardTxs || []).length > 0;
          const demoBtnHtml = !hasAnyTx
            ? '<form method="POST" action="/api/demo/seed-transactions" class="pt-1">' +
                '<button type="submit" class="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all">' +
                  '<span>✨</span> Muat Transaksi Contoh (Demo)' +
                '</button>' +
              '</form>'
            : '';

          bdListEl.innerHTML = '<div class="space-y-1.5 mb-2.5">' + emptyCatsHtml + '</div>' +
            '<div class="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">' +
              '<div class="flex items-start gap-2">' +
                '<span class="text-base shrink-0">💡</span>' +
                '<span class="text-[11px] leading-relaxed">' +
                  (hasAnyTx
                    ? 'Tidak ada pengeluaran pada periode <strong>' + label + '</strong>. Pilih filter periode lain atau catat transaksi baru.'
                    : 'Akun ini belum memiliki transaksi pengeluaran. Diagram donat dan daftar rincian akan terisi otomatis setelah kamu mencatat transaksi atau memuat transaksi contoh.') +
                '</span>' +
              '</div>' +
              demoBtnHtml +
            '</div>';
        }
      }

      // Ensure Cashflow Bar Chart & empty message stay in sync
      const cfEmptyMsg = document.getElementById('cashflowBarEmptyMsg');
      if (cfEmptyMsg) {
        const hasTxs = (window.allDashboardTxs || []).length > 0;
        cfEmptyMsg.style.display = hasTxs ? 'none' : 'flex';
        if (hasTxs) {
          cfEmptyMsg.classList.add('hidden');
        } else {
          cfEmptyMsg.classList.remove('hidden');
        }
      }
      if (cashflowBarChartInstance && typeof cashflowBarChartInstance.resize === 'function') {
        try {
          cashflowBarChartInstance.resize();
          if (typeof cashflowBarChartInstance.update === 'function') {
            cashflowBarChartInstance.update();
          }
        } catch (e) {}
      }
    }

    // -------------------------------------------------------------
    // KALENDER JATAH HARIAN & HEATMAP KEUANGAN ENGINE (User Request)
    // -------------------------------------------------------------
    let calYear = new Date().getFullYear();
    let calMonth = new Date().getMonth(); // 0-indexed

    function getDailyTargetAllowance(totalDays) {
      if (window.userProfileDailyBudget && window.userProfileDailyBudget.mode === 'manual' && Number(window.userProfileDailyBudget.custom) > 0) {
        return Number(window.userProfileDailyBudget.custom);
      }
      const custom = localStorage.getItem('tatadana_custom_daily_target');
      if (custom && Number(custom) > 0) return Number(custom);
      const totalBudget = window.dashboardTotalBudget || 0;
      if (totalBudget > 0) return Math.round(totalBudget / totalDays);
      return 100000; // default Rp100.000/hari
    }

    function promptSetDailyBudget() {
      const days = new Date(calYear, calMonth + 1, 0).getDate();
      const current = getDailyTargetAllowance(days);
      const input = prompt('Masukkan target jatah pengeluaran harian baru (Rp):', current);
      if (input !== null && input.trim() !== '') {
        const num = parseInt(input.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) {
          localStorage.setItem('tatadana_custom_daily_target', num);
          renderCalendarMonth();
        }
      }
    }

    function switchCalView(mode) {
      const calView = document.getElementById('calendarGridViewContainer');
      const heatView = document.getElementById('calendarHeatmapViewContainer');
      const btnCal = document.getElementById('btnCalViewCalendar');
      const btnHeat = document.getElementById('btnCalViewHeatmap');

      if (mode === 'calendar') {
        calView?.classList.remove('hidden');
        heatView?.classList.add('hidden');
        btnCal.className = 'px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-900 transition-all flex items-center gap-1.5';
        btnHeat.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';
      } else {
        calView?.classList.add('hidden');
        heatView?.classList.remove('hidden');
        btnCal.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';
        btnHeat.className = 'px-3 py-1.5 rounded-lg bg-white shadow-sm text-slate-900 transition-all flex items-center gap-1.5';
      }
    }

    function changeCalendarMonth(delta) {
      calMonth += delta;
      if (calMonth < 0) {
        calMonth = 11;
        calYear -= 1;
      } else if (calMonth > 11) {
        calMonth = 0;
        calYear += 1;
      }
      renderCalendarMonth();
    }

    function resetCalendarToCurrentMonth() {
      const now = new Date();
      calYear = now.getFullYear();
      calMonth = now.getMonth();
      renderCalendarMonth();
    }

    function renderCalendarMonth() {
      const now = new Date();
      const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
      const dailyTarget = getDailyTargetAllowance(totalDays);
      const ymStr = calYear + '-' + String(calMonth + 1).padStart(2, '0');
      const todayStr = getLocalDateString(now);

      // Month Title Display
      const titleEl = document.getElementById('calCurrentMonthTitle');
      if (titleEl) titleEl.innerText = monthNamesIndo[calMonth] + ' ' + calYear;
      const heatBadge = document.getElementById('heatmapMonthBadge');
      if (heatBadge) heatBadge.innerText = monthNamesIndo[calMonth] + ' ' + calYear;

      // Filter transactions for this month
      const allTxs = window.allDashboardTxs || [];
      const monthTxs = allTxs.filter(t => t.transaction_date && t.transaction_date.startsWith(ymStr));
      const monthExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

      const isCurrentMonth = (calYear === now.getFullYear() && calMonth === now.getMonth());
      const elapsedDays = isCurrentMonth ? now.getDate() : totalDays;

      // Calculate today's spent
      const todaySpent = allTxs.filter(t => t.transaction_date === todayStr && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      const sisaToday = dailyTarget - todaySpent;

      // Calculate No-Spend days in this month
      let noSpendCount = 0;
      for (let d = 1; d <= elapsedDays; d++) {
        const dStr = ymStr + '-' + String(d).padStart(2, '0');
        const dayExp = monthTxs.filter(t => t.transaction_date === dStr && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
        if (dayExp === 0) noSpendCount++;
      }

      const realAvgDaily = Math.round(monthExpense / Math.max(elapsedDays, 1));

      // Update KPI Cards
      const kpiDailyTarget = document.getElementById('kpiDailyTarget');
      if (kpiDailyTarget) kpiDailyTarget.innerText = 'Rp' + dailyTarget.toLocaleString('id-ID');

      const kpiTodaySpent = document.getElementById('kpiTodaySpent');
      if (kpiTodaySpent) kpiTodaySpent.innerText = 'Rp' + todaySpent.toLocaleString('id-ID');

      const kpiTodayStatus = document.getElementById('kpiTodayStatus');
      if (kpiTodayStatus) {
        if (sisaToday >= 0) {
          kpiTodayStatus.innerText = 'Sisa Jatah: +Rp' + sisaToday.toLocaleString('id-ID') + ' (🟢 Hemat)';
          kpiTodayStatus.className = 'text-[10px] font-bold text-emerald-600';
        } else {
          kpiTodayStatus.innerText = 'Over: -Rp' + Math.abs(sisaToday).toLocaleString('id-ID') + ' (🔴 Melebihi)';
          kpiTodayStatus.className = 'text-[10px] font-bold text-rose-600';
        }
      }

      const kpiNoSpendDays = document.getElementById('kpiNoSpendDays');
      if (kpiNoSpendDays) kpiNoSpendDays.innerText = noSpendCount + ' Hari';

      const kpiRealAvgDaily = document.getElementById('kpiRealAvgDaily');
      if (kpiRealAvgDaily) kpiRealAvgDaily.innerText = 'Rp' + realAvgDaily.toLocaleString('id-ID');

      // ---------------------------------------------------------
      // RENDER CALENDAR GRID CELLS
      // ---------------------------------------------------------
      const gridContainer = document.getElementById('calendarCellsGrid');
      if (gridContainer) {
        let cellsHtml = '';

        // Offset Monday = 0
        const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
        const offset = (firstDayOfWeek + 6) % 7;

        for (let i = 0; i < offset; i++) {
          cellsHtml += '<div class="min-h-[85px] sm:min-h-[95px] p-2 rounded-xl bg-slate-50/30 border border-transparent opacity-30"></div>';
        }

        for (let d = 1; d <= totalDays; d++) {
          const dStr = ymStr + '-' + String(d).padStart(2, '0');
          const dayTxs = monthTxs.filter(t => t.transaction_date === dStr);
          const dayExp = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
          const dayInc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
          const isToday = (dStr === todayStr);

          const pct = Math.round((dayExp / dailyTarget) * 100);

          let cellBg = 'bg-white border-slate-200 hover:border-slate-300';
          let statusBadge = '<span class="text-[9px] text-slate-400 font-medium">Rp0 (Bebas)</span>';

          if (dayExp === 0) {
            cellBg = 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 text-slate-600';
            statusBadge = '<span class="inline-flex items-center text-[9px] text-slate-500 font-semibold">🎉 No-Spend</span>';
          } else if (pct <= 80) {
            cellBg = 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 text-emerald-950';
            statusBadge = '<span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">🟢 Hemat (' + pct + '%)</span>';
          } else if (pct <= 100) {
            cellBg = 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 text-amber-950';
            statusBadge = '<span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">🟡 Sesuai (' + pct + '%)</span>';
          } else {
            cellBg = 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-rose-950';
            statusBadge = '<span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">🔴 Over (' + pct + '%)</span>';
          }

          if (isToday) {
            cellBg += ' ring-2 ring-brand-600 shadow-md';
          }

          cellsHtml += '<div onclick="openCalendarDayDetail(\'' + dStr + '\')" class="min-h-[85px] sm:min-h-[95px] p-2 rounded-xl border ' + cellBg + ' flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm select-none">' +
            '<div class="flex items-center justify-between">' +
              '<span class="font-extrabold text-xs ' + (isToday ? 'bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-slate-800') + '">' + d + '</span>' +
              (isToday ? '<span class="text-[9px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Hari Ini</span>' : '') +
            '</div>' +
            '<div class="my-1 space-y-0.5">' +
              (dayExp > 0 ? '<div class="text-[11px] font-black text-red-600">-Rp' + dayExp.toLocaleString('id-ID') + '</div>' : '') +
              (dayInc > 0 ? '<div class="text-[10px] font-black text-emerald-600">+Rp' + dayInc.toLocaleString('id-ID') + '</div>' : '') +
            '</div>' +
            '<div>' + statusBadge + '</div>' +
          '</div>';
        }

        gridContainer.innerHTML = cellsHtml;
      }

      // ---------------------------------------------------------
      // RENDER HEATMAP STRIP VIEW
      // ---------------------------------------------------------
      const heatmapContainer = document.getElementById('heatmapStripGrid');
      if (heatmapContainer) {
        let heatHtml = '';
        for (let d = 1; d <= totalDays; d++) {
          const dStr = ymStr + '-' + String(d).padStart(2, '0');
          const dayTxs = monthTxs.filter(t => t.transaction_date === dStr);
          const dayExp = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
          const pct = Math.round((dayExp / dailyTarget) * 100);

          let tileColor = 'bg-slate-200 border-slate-300';
          if (dayExp === 0) tileColor = 'bg-slate-100 border-slate-200';
          else if (pct <= 50) tileColor = 'bg-emerald-200 border-emerald-300';
          else if (pct <= 100) tileColor = 'bg-emerald-400 border-emerald-500 text-white';
          else if (pct <= 150) tileColor = 'bg-amber-300 border-amber-400';
          else tileColor = 'bg-rose-400 border-rose-500 text-white';

          heatHtml += '<div onclick="openCalendarDayDetail(\'' + dStr + '\')" title="Tgl ' + d + ': Rp' + dayExp.toLocaleString('id-ID') + ' (' + pct + '% jatah)" class="w-8 h-8 rounded-lg border ' + tileColor + ' flex items-center justify-center font-bold text-[10px] cursor-pointer hover:scale-110 transition-transform shadow-xs">' +
            d +
          '</div>';
        }
        heatmapContainer.innerHTML = heatHtml;
      }

      if (window.lucide) lucide.createIcons();
    }

    // Modal Detail Hari
    function openCalendarDayDetail(dateStr) {
      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);

      const dateObj = new Date(y, m, d);
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const formattedTitle = dayNames[dateObj.getDay()] + ', ' + d + ' ' + monthNamesIndo[m] + ' ' + y;

      const titleEl = document.getElementById('calModalDateTitle');
      if (titleEl) titleEl.innerText = formattedTitle;

      const totalDays = new Date(y, m + 1, 0).getDate();
      const dailyTarget = getDailyTargetAllowance(totalDays);

      const allTxs = window.allDashboardTxs || [];
      const dayTxs = allTxs.filter(t => t.transaction_date === dateStr);
      const dayExp = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      const dayInc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const diff = dailyTarget - dayExp;

      const allowBox = document.getElementById('calModalAllowanceBox');
      if (allowBox) {
        let statusBadge = diff >= 0
          ? '<span class="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-full text-xs">🟢 Hemat (+Rp' + diff.toLocaleString('id-ID') + ' di bawah jatah)</span>'
          : '<span class="text-rose-700 font-bold bg-rose-100 px-2.5 py-1 rounded-full text-xs">🔴 Over (-Rp' + Math.abs(diff).toLocaleString('id-ID') + ' melebihi jatah)</span>';

        allowBox.innerHTML = '<div class="flex items-center justify-between pb-2 border-b border-slate-200">' +
          '<span class="font-bold text-slate-700">Target Jatah Harian:</span>' +
          '<span class="font-black text-slate-900">Rp' + dailyTarget.toLocaleString('id-ID') + '</span>' +
        '</div>' +
        '<div class="flex items-center justify-between pb-2 border-b border-slate-200">' +
          '<span class="font-bold text-slate-700">Realisasi Pengeluaran:</span>' +
          '<span class="font-black text-red-600">-Rp' + dayExp.toLocaleString('id-ID') + '</span>' +
        '</div>' +
        (dayInc > 0 ? '<div class="flex items-center justify-between pb-2 border-b border-slate-200"><span class="font-bold text-slate-700">Pemasukan Diterima:</span><span class="font-black text-emerald-600">+Rp' + dayInc.toLocaleString('id-ID') + '</span></div>' : '') +
        '<div class="flex items-center justify-between pt-1">' +
          '<span class="font-bold text-slate-700">Evaluasi Jatah:</span>' +
          statusBadge +
        '</div>';
      }

      const txList = document.getElementById('calModalTxList');
      if (txList) {
        if (dayTxs.length === 0) {
          txList.innerHTML = '<div class="py-6 text-center text-slate-500 space-y-1">' +
            '<div class="text-2xl">🎉</div>' +
            '<div class="font-bold text-slate-800">Hari Bebas Pengeluaran!</div>' +
            '<div class="text-[11px] text-slate-400">Tidak ada transaksi yang tercatat pada tanggal ini. Pertahankan kebiasaan hematmu!</div>' +
          '</div>';
        } else {
          txList.innerHTML = dayTxs.map(t => {
            const isInc = t.type === 'income';
            const isTrans = t.type === 'transfer';
            const cat = (window.allDashboardCats || []).find(c => c.id === t.category_id);
            const wal = (window.allDashboardWals || []).find(w => w.id === t.wallet_id);
            const src = formatSourceInfoJS(t.source);
            const dateFormatted = formatIndoFullDateJS(t.transaction_date || dateStr);

            const amtColor = isInc ? 'text-emerald-600' : isTrans ? 'text-blue-600' : 'text-red-600';
            const prefix = isInc ? '+' : isTrans ? '⇄ ' : '-';

            return '<div class="py-2.5 flex items-center justify-between">' +
              '<div class="flex items-center gap-2.5">' +
                '<span class="text-lg">' + (cat?.emoji || (isTrans ? '⇄' : '🏷️')) + '</span>' +
                '<div>' +
                  '<div class="font-bold text-slate-900">' + (t.notes || 'Transaksi') + '</div>' +
                  '<div class="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">' +
                    '<span>📅 ' + dateFormatted + '</span>' +
                    '<span>•</span>' +
                    '<span>👛 ' + (wal?.name || 'Dompet') + '</span>' +
                    '<span>•</span>' +
                    '<span>' + (cat?.name || 'Umum') + '</span>' +
                    '<span>•</span>' +
                    '<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ' + src.badge + '">' +
                      src.icon + ' ' + src.label +
                    '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="font-black ' + amtColor + ' text-right">' +
                prefix + 'Rp' + Number(t.amount).toLocaleString('id-ID') +
              '</div>' +
            '</div>';
          }).join('');
        }
      }

      openModal('calendarDayModal');
    }

    // Initialize calendar on load
    setTimeout(renderCalendarMonth, 50);
  </script>
  `;
}

// --------------------------------------------------------------------
// 2. TRANSACTIONS PAGE (Full Table, Add Transaction, Transfer Antar Wallet)
// --------------------------------------------------------------------
export function renderTransactionsPage({ transactions, categories, wallets }) {
  const hasTx = (transactions || []).length > 0;

  return `
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">💳 Transaksi Keuangan</h1>
      <p class="text-sm text-slate-500 mt-1">Kelola seluruh pemasukan, pengeluaran, dan transfer antar dompet.</p>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <button onclick="openModal('addTxModal')" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all">
        <i data-lucide="plus" class="w-4 h-4"></i> Catat Transaksi Baru
      </button>
      <button onclick="openModal('transferModal')" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
        <i data-lucide="arrow-left-right" class="w-4 h-4 text-brand-600"></i> Transfer Dompet
      </button>
      <a href="/api/transactions/export?type=pdf" target="_blank" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-all" title="Export Seluruh Transaksi ke PDF Siap Cetak">
        <i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i> 📄 Export PDF
      </a>
      <a href="/api/transactions/export?type=xlsx" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 shadow-sm transition-all" title="Export Seluruh Transaksi ke Excel (.xlsx / CSV)">
        <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i> 📊 Export Excel (.xlsx)
      </a>
    </div>
  </div>

  <!-- PERIODE TRANSAKSI FILTER PILLS (User Request) -->
  <div class="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-4">
    <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold custom-scrollbar pb-1 sm:pb-0">
      <span class="text-slate-500 font-bold uppercase text-[11px] mr-1 flex items-center gap-1.5 whitespace-nowrap">
        <i data-lucide="calendar" class="w-4 h-4 text-brand-600"></i> Periode:
      </span>
      <button type="button" onclick="selectTxPeriod('all')" id="txPill-all" class="tx-period-pill px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold border border-brand-600 shadow-sm transition-all whitespace-nowrap">
        Semua
      </button>
      <button type="button" onclick="selectTxPeriod('today')" id="txPill-today" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        Hari Ini
      </button>
      <button type="button" onclick="selectTxPeriod('yesterday')" id="txPill-yesterday" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        Kemarin
      </button>
      <button type="button" onclick="selectTxPeriod('7days')" id="txPill-7days" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        7 Hari
      </button>
      <button type="button" onclick="selectTxPeriod('30days')" id="txPill-30days" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        30 Hari
      </button>
      <button type="button" onclick="selectTxPeriod('this_month')" id="txPill-this_month" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        Bulan Ini
      </button>
      <button type="button" onclick="selectTxPeriod('last_month')" id="txPill-last_month" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        Bulan Lalu
      </button>
      <button type="button" onclick="selectTxPeriod('this_year')" id="txPill-this_year" class="tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
        Tahun Ini
      </button>
    </div>
    <div id="txPeriodSummaryPill" class="text-xs text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl whitespace-nowrap">
      Semua Periode Transaksi
    </div>
  </div>

  <!-- Transactions Table Container -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-slate-700">Jenis:</span>
          <select id="txTypeFilterSelect" onchange="filterTransactions()" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs">
            <option value="all">Semua Transaksi (${(transactions || []).length})</option>
            <option value="expense">Pengeluaran Saja</option>
            <option value="income">Pemasukan Saja</option>
            <option value="transfer">Transfer Antar Dompet</option>
          </select>
        </div>
        <div class="flex items-center gap-1.5">
          <input type="text" id="txNotesSearchInput" placeholder="Cari catatan transaksi..." oninput="filterTransactions()" class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-48 sm:w-60 focus:outline-none focus:border-brand-600"/>
        </div>
      </div>
      <div id="txCountBadge" class="text-xs text-slate-500 font-semibold">
        Menampilkan ${(transactions || []).length} transaksi • Waktu WIB
      </div>
    </div>

    ${hasTx ? `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs" id="transactionsMainTable">
        <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
          <tr>
            <th class="px-6 py-3.5">Tanggal (Tgl, Bln, Thn)</th>
            <th class="px-6 py-3.5">Kategori / Dompet</th>
            <th class="px-6 py-3.5">Catatan</th>
            <th class="px-6 py-3.5">Sumber Transaksi</th>
            <th class="px-6 py-3.5 text-right">Nominal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100" id="txTableBody">
          ${transactions.map(t => {
            const isIncome = t.type === 'income';
            const isTransfer = t.type === 'transfer';
            const cat = (categories || []).find(c => c.id === t.category_id);
            const wal = (wallets || []).find(w => w.id === t.wallet_id);
            const dstWal = (wallets || []).find(w => w.id === t.destination_wallet_id);
            const srcInfo = formatSourceInfo(t.source);

            let amountColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-red-600';
            let prefix = isIncome ? '+' : isTransfer ? '⇄ ' : '-';
            let typeBadge = isIncome
              ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 +Pemasukan</span>'
              : isTransfer
                ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">⇄ Transfer</span>'
                : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">🔴 -Pengeluaran</span>';

            return `
              <tr class="tx-row hover:bg-slate-50/80 transition-colors" data-type="${t.type}" data-date="${t.transaction_date || ''}" data-amount="${t.amount || 0}" data-notes="${(t.notes || '').toLowerCase()}">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-brand-600"></i>
                    <span>${formatIndoFullDate(t.transaction_date)}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
                    ${t.transaction_date || '-'}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>${cat?.emoji || (isTransfer ? '⇄' : '🏷️')}</span>
                    <span>${cat?.name || (isTransfer ? 'Transfer Saldo' : 'Umum')}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>👛 ${wal?.name || 'Dompet'} ${dstWal ? `➔ ${dstWal.name}` : ''}</span>
                    ${typeBadge}
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-700">
                  <div class="font-medium">${t.notes || '-'}</div>
                  ${t.receipt_items && t.receipt_items.length > 0 ? `
                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 mt-1">
                      📸 Struk: ${t.receipt_items.length} item
                    </span>
                  ` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${srcInfo.badge} border shadow-xs">
                    <span>${srcInfo.icon}</span>
                    <span>Sumber: ${srcInfo.label}</span>
                  </span>
                </td>
                <td class="px-6 py-4 text-right font-black whitespace-nowrap text-sm ${amountColor}">
                  ${prefix}Rp${Number(t.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="p-12 text-center space-y-3">
      <div class="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto text-xl">💳</div>
      <h4 class="font-bold text-slate-900 text-sm">Belum Ada Transaksi</h4>
      <p class="text-xs text-slate-500">Catat transaksi pertama untuk mulai melihat riwayat arus kasmu.</p>
      <button onclick="openModal('addTxModal')" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">
        + Catat Transaksi
      </button>
    </div>
    `}
  </div>

  ${renderTransactionModal({ categories, wallets })}
  ${renderTransferModal({ wallets })}

  <script>
    let currentSelectedTxPeriod = 'all';

    function getLocalDateStringHelper(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    function selectTxPeriod(periodKey) {
      currentSelectedTxPeriod = periodKey;
      document.querySelectorAll('.tx-period-pill').forEach(btn => {
        btn.className = 'tx-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold whitespace-nowrap';
      });

      const activeBtn = document.getElementById('txPill-' + periodKey);
      if (activeBtn) {
        activeBtn.className = 'tx-period-pill px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold border border-brand-600 shadow-sm transition-all text-xs whitespace-nowrap';
      }

      filterTransactions();
    }

    function filterTransactions() {
      const type = document.getElementById('txTypeFilterSelect')?.value || 'all';
      const search = (document.getElementById('txNotesSearchInput')?.value || '').toLowerCase().trim();
      const rows = document.querySelectorAll('.tx-row');

      const now = new Date();
      let start = null;
      let end = null;
      let periodLabel = 'Semua Periode';

      if (currentSelectedTxPeriod === 'today') {
        start = getLocalDateStringHelper(now);
        end = start;
        periodLabel = 'Hari Ini (' + start + ')';
      } else if (currentSelectedTxPeriod === 'yesterday') {
        const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        start = getLocalDateStringHelper(y);
        end = start;
        periodLabel = 'Kemarin (' + start + ')';
      } else if (currentSelectedTxPeriod === '7days') {
        const d7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        start = getLocalDateStringHelper(d7);
        end = getLocalDateStringHelper(now);
        periodLabel = '7 Hari Terakhir';
      } else if (currentSelectedTxPeriod === '30days') {
        const d30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        start = getLocalDateStringHelper(d30);
        end = getLocalDateStringHelper(now);
        periodLabel = '30 Hari Terakhir';
      } else if (currentSelectedTxPeriod === 'this_month') {
        const sm = new Date(now.getFullYear(), now.getMonth(), 1);
        const em = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = getLocalDateStringHelper(sm);
        end = getLocalDateStringHelper(em);
        periodLabel = 'Bulan Ini (' + (now.getMonth() + 1) + '/' + now.getFullYear() + ')';
      } else if (currentSelectedTxPeriod === 'last_month') {
        const spm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const epm = new Date(now.getFullYear(), now.getMonth(), 0);
        start = getLocalDateStringHelper(spm);
        end = getLocalDateStringHelper(epm);
        periodLabel = 'Bulan Lalu (' + (spm.getMonth() + 1) + '/' + spm.getFullYear() + ')';
      } else if (currentSelectedTxPeriod === 'this_year') {
        const sy = new Date(now.getFullYear(), 0, 1);
        const ey = new Date(now.getFullYear(), 11, 31);
        start = getLocalDateStringHelper(sy);
        end = getLocalDateStringHelper(ey);
        periodLabel = 'Tahun Ini (' + now.getFullYear() + ')';
      }

      let visibleCount = 0;
      let totalVisibleIncome = 0;
      let totalVisibleExpense = 0;

      rows.forEach(r => {
        const rowType = r.getAttribute('data-type');
        const rowDate = r.getAttribute('data-date') || '';
        const rowNotes = r.getAttribute('data-notes') || '';
        const rowAmount = Number(r.getAttribute('data-amount') || 0);

        const matchesType = (type === 'all' || rowType === type);
        const matchesSearch = (!search || rowNotes.includes(search));
        const matchesDate = (!start || rowDate >= start) && (!end || rowDate <= end);

        if (matchesType && matchesSearch && matchesDate) {
          r.style.display = '';
          visibleCount++;
          if (rowType === 'income') totalVisibleIncome += rowAmount;
          if (rowType === 'expense') totalVisibleExpense += rowAmount;
        } else {
          r.style.display = 'none';
        }
      });

      const badge = document.getElementById('txCountBadge');
      if (badge) {
        badge.innerText = 'Menampilkan ' + visibleCount + ' transaksi • Waktu WIB';
      }

      const sumPill = document.getElementById('txPeriodSummaryPill');
      if (sumPill) {
        sumPill.innerHTML = periodLabel + ' • <span class="text-emerald-700">+Rp' + totalVisibleIncome.toLocaleString('id-ID') + '</span> / <span class="text-red-700">-Rp' + totalVisibleExpense.toLocaleString('id-ID') + '</span>';
      }
    }

    function filterTxType(val) {
      const sel = document.getElementById('txTypeFilterSelect');
      if (sel) sel.value = val;
      filterTransactions();
    }
  </script>
  `;
}

// --------------------------------------------------------------------
// 3. REPORTS PAGE (Summary, Filter & Search, Sorting, Export on Demand)
// --------------------------------------------------------------------
export function renderReportsPage({ user, transactions, categories, wallets, exportHistory, summary }) {
  const isPro = user.plan === 'pro';

  // Calculate Top 5 Expense Categories
  const catSpending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = categories.find(c => c.id === t.category_id);
    const catName = cat ? `${cat.emoji} ${cat.name}` : 'Umum';
    catSpending[catName] = (catSpending[catName] || 0) + Number(t.amount);
  });

  const top5Expenses = Object.entries(catSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Net Cashflow calculation (Surplus vs Defisit)
  const repIncome = Number(summary?.monthlyIncome ?? summary?.totalIncome ?? 0);
  const repExpense = Number(summary?.monthlyExpense ?? summary?.totalExpense ?? 0);
  const repTotalFlow = repIncome + repExpense;
  const repIncomePct = repTotalFlow > 0 ? Math.round((repIncome / repTotalFlow) * 100) : 50;
  const repExpensePct = repTotalFlow > 0 ? (100 - repIncomePct) : 50;

  const netCashflow = repIncome - repExpense;
  const isNetPositive = netCashflow >= 0;
  const netColor = isNetPositive ? 'text-emerald-600' : 'text-red-600';
  const netSign = isNetPositive ? '+' : '-';
  const netFormatted = `${netSign}Rp${Math.abs(netCashflow).toLocaleString('id-ID')}`;
  const netBadge = isNetPositive ? '🟢 Surplus (+Kas Bertambah)' : '🔴 Defisit (-Defisit Kas)';

  return `
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">📊 Laporan Keuangan Native</h1>
      <p class="text-sm text-slate-500 mt-1">Laporan terpadu lengkap dengan filter, sorting, dan export instan ke PDF/Excel.</p>
    </div>

    <!-- On-Demand Export Buttons (Part 3 & Part 6) -->
    <div class="flex items-center gap-2 flex-wrap">
      <form action="/api/reports/export" method="POST" class="inline">
        <input type="hidden" name="type" value="pdf"/>
        <button type="submit" class="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all" title="Export Laporan Lengkap ke PDF Siap Cetak">
          <i data-lucide="file-text" class="w-4 h-4"></i> 📄 Export PDF Resmi
        </button>
      </form>
      <form action="/api/reports/export" method="POST" class="inline">
        <input type="hidden" name="type" value="xlsx"/>
        <button type="submit" class="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all" title="Export Laporan Lengkap ke Excel (.xlsx / CSV)">
          <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> 📊 Export Excel (.xlsx)
        </button>
      </form>
    </div>
  </div>

  <!-- Summary Cards for Period (Part 3 & Dynamic Period Updates) -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
      <div id="repSummaryIncome" class="text-2xl font-black text-emerald-600 mt-1">+Rp${repIncome.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold text-emerald-700 mt-1">🟢 Uang Masuk (+Bertambah)</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
      <div id="repSummaryExpense" class="text-2xl font-black text-red-600 mt-1">-Rp${repExpense.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold text-red-700 mt-1">🔴 Uang Keluar (-Berkurang)</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cashflow</span>
      <div id="repSummaryNet" class="text-2xl font-black ${netColor} mt-1">${netFormatted}</div>
      <div id="repSummaryNetBadge" class="text-[11px] font-bold ${isNetPositive ? 'text-emerald-700' : 'text-red-700'} mt-1">${netBadge}</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi</span>
      <div id="repSummaryTxCount" class="text-2xl font-black text-slate-900 mt-1">${transactions.length} tx</div>
      <div class="text-[11px] text-slate-500 mt-1">Tercatat di sistem</div>
    </div>
  </div>

  <!-- VISUALISASI GRAFIK ARUS KAS / CASHFLOW RATIO BAR -->
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <div>
        <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>📈</span> Rasio Visual Arus Kas (Pemasukan vs Pengeluaran)
        </h3>
        <p class="text-xs text-slate-500">Perbandingan proporsi arus kas masuk dan arus kas keluar pada periode aktif</p>
      </div>
      <div id="repCashflowHealthBadge" class="text-xs font-bold px-3 py-1 rounded-full ${isNetPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}">
        ${isNetPositive ? '✅ Arus Kas Sehat (Surplus)' : '⚠️ Arus Kas Waspada (Defisit)'}
      </div>
    </div>
    
    <!-- Cashflow Visual Bar -->
    <div class="w-full bg-slate-100 rounded-full h-5 overflow-hidden flex shadow-inner mb-3">
      <div id="repCashflowBarInc" class="bg-emerald-500 h-full text-[10px] font-black text-white flex items-center justify-center transition-all duration-300" style="width: ${repTotalFlow > 0 ? repIncomePct : 50}%;">
        ${repTotalFlow > 0 && repIncomePct > 10 ? repIncomePct + '%' : ''}
      </div>
      <div id="repCashflowBarExp" class="bg-rose-500 h-full text-[10px] font-black text-white flex items-center justify-center transition-all duration-300" style="width: ${repTotalFlow > 0 ? repExpensePct : 50}%;">
        ${repTotalFlow > 0 && repExpensePct > 10 ? repExpensePct + '%' : ''}
      </div>
    </div>

    <!-- Details Labels -->
    <div class="flex items-center justify-between text-xs text-slate-600">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
        <span>Pemasukan: <strong id="repBarIncLabel" class="text-emerald-700 font-bold">Rp${repIncome.toLocaleString('id-ID')} (${repTotalFlow > 0 ? repIncomePct : 0}%)</strong></span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
        <span>Pengeluaran: <strong id="repBarExpLabel" class="text-red-700 font-bold">Rp${repExpense.toLocaleString('id-ID')} (${repTotalFlow > 0 ? repExpensePct : 0}%)</strong></span>
      </div>
    </div>
  </div>

  <!-- TOP 5 KATEGORI PENGELUARAN (Part 3) -->
  ${top5Expenses.length > 0 ? `
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
    <h3 class="font-bold text-slate-900 text-sm mb-3">🔥 Top 5 Kategori Pengeluaran Terbesar</h3>
    <div class="grid sm:grid-cols-5 gap-3">
      ${top5Expenses.map(([name, amount], idx) => `
        <div class="p-3 bg-brand-50/60 border border-orange-100 rounded-xl">
          <div class="text-xs text-slate-500 font-semibold truncate">#${idx + 1} ${name}</div>
          <div class="text-sm font-extrabold text-slate-900 mt-1">Rp${Number(amount).toLocaleString('id-ID')}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- EXPANDABLE RECEIPT TRANSACTIONS TABLE (Part 3 - Native Filter, Sort, Pagination, Expandable Receipt) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
    <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="font-bold text-slate-900 text-base">Rincian Transaksi Lengkap (Bisa Di-Expand untuk Struk Multi-Item)</h3>
        <p class="text-xs text-slate-500">Klik item untuk melihat rincian belanjaan struk OCR. Klik kolom untuk mengurutkan (sort).</p>
      </div>
      <div id="repCountBadge" class="text-xs text-slate-500 font-semibold">
        Menampilkan ${transactions.length} Data Transaksi
      </div>
    </div>

    <!-- PERIODE CEPAT FILTER PILLS (Reports Page) -->
    <div class="px-5 py-3 bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
        <span class="text-slate-500 font-bold uppercase text-[11px] mr-1 flex items-center gap-1 whitespace-nowrap">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-brand-600"></i> Periode:
        </span>
        <button type="button" onclick="selectReportPeriod('all')" id="repPill-all" class="rep-period-pill px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold border border-brand-600 shadow-sm transition-all whitespace-nowrap">
          Semua
        </button>
        <button type="button" onclick="selectReportPeriod('today')" id="repPill-today" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          Hari Ini
        </button>
        <button type="button" onclick="selectReportPeriod('yesterday')" id="repPill-yesterday" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          Kemarin
        </button>
        <button type="button" onclick="selectReportPeriod('7days')" id="repPill-7days" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          7 Hari
        </button>
        <button type="button" onclick="selectReportPeriod('30days')" id="repPill-30days" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          30 Hari
        </button>
        <button type="button" onclick="selectReportPeriod('this_month')" id="repPill-this_month" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          Bulan Ini
        </button>
        <button type="button" onclick="selectReportPeriod('last_month')" id="repPill-last_month" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          Bulan Lalu
        </button>
        <button type="button" onclick="selectReportPeriod('this_year')" id="repPill-this_year" class="rep-period-pill px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all whitespace-nowrap">
          Tahun Ini
        </button>
      </div>
      <div id="repPeriodLabelBadge" class="text-xs text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1 rounded-xl whitespace-nowrap">
        Semua Waktu Laporan
      </div>
    </div>

    <!-- FILTER & SEARCH TOOLBAR (Part 3) -->
    <div class="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
      <div>
        <label class="block font-bold text-slate-600 mb-1">Cari Catatan</label>
        <input type="text" id="repSearchInput" placeholder="Cari catatan..." oninput="applyReportFilters()" class="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"/>
      </div>
      <div>
        <label class="block font-bold text-slate-600 mb-1">Kategori</label>
        <select id="repCatFilterSelect" onchange="applyReportFilters()" class="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600">
          <option value="all">Semua Kategori</option>
          ${categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block font-bold text-slate-600 mb-1">Dompet</label>
        <select id="repWalletFilterSelect" onchange="applyReportFilters()" class="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600">
          <option value="all">Semua Dompet</option>
          ${wallets.map(w => `<option value="${w.id}">👛 ${w.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block font-bold text-slate-600 mb-1">Jenis Transaksi</label>
        <select id="repTypeFilterSelect" onchange="applyReportFilters()" class="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600">
          <option value="all">Semua Jenis</option>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="block font-bold text-slate-600 mb-1">Dari Tanggal</label>
          <input type="date" id="repStartDateInput" onchange="applyReportFilters()" class="w-full px-2.5 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"/>
        </div>
        <button onclick="resetReportFilters()" title="Reset Filter" class="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs h-[35px]">
          Reset
        </button>
      </div>
    </div>

    ${transactions.length > 0 ? `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs" id="reportsMainTable">
        <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 select-none">
          <tr>
            <th onclick="sortReportTable('date')" class="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors">
              Tanggal (Tgl, Bln, Thn) <span id="sortIconDate" class="text-[10px]">↕</span>
            </th>
            <th onclick="sortReportTable('cat')" class="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors">
              Kategori <span id="sortIconCat" class="text-[10px]">↕</span>
            </th>
            <th onclick="sortReportTable('wallet')" class="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors">
              Dompet <span id="sortIconWallet" class="text-[10px]">↕</span>
            </th>
            <th class="px-6 py-3.5">Catatan & Rincian Struk</th>
            <th class="px-6 py-3.5">Sumber Transaksi</th>
            <th onclick="sortReportTable('amount')" class="px-6 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors">
              Nominal <span id="sortIconAmount" class="text-[10px]">↕</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100" id="reportsTableBody">
          ${transactions.map(t => {
            const isIncome = t.type === 'income';
            const isTransfer = t.type === 'transfer';
            const cat = categories.find(c => c.id === t.category_id);
            const wal = wallets.find(w => w.id === t.wallet_id);
            const srcInfo = formatSourceInfo(t.source);
            const hasItems = t.receipt_items && t.receipt_items.length > 0;
            const prefix = isIncome ? '+' : isTransfer ? '⇄ ' : '-';
            const amountColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-red-600';
            const typeBadge = isIncome
              ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1.5">🟢 +Pemasukan</span>'
              : isTransfer
                ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 ml-1.5">⇄ Transfer</span>'
                : '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 ml-1.5">🔴 -Pengeluaran</span>';

            return `
              <tr class="rep-row hover:bg-slate-50/70 transition-colors"
                  data-date="${t.transaction_date}"
                  data-type="${t.type}"
                  data-cat="${t.category_id || ''}"
                  data-catname="${(cat?.name || '').toLowerCase()}"
                  data-wallet="${t.wallet_id || ''}"
                  data-walletname="${(wal?.name || '').toLowerCase()}"
                  data-amount="${t.amount}"
                  data-notes="${(t.notes || '').toLowerCase()}">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-brand-600"></i>
                    <span>${formatIndoFullDate(t.transaction_date)}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5 font-mono">
                    ${t.transaction_date || '-'}
                  </div>
                </td>
                <td class="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                  <div class="flex items-center">
                    <span>${cat?.emoji || (isTransfer ? '⇄' : '🏷️')} ${cat?.name || (isTransfer ? 'Transfer Saldo' : 'Umum')}</span>
                    ${typeBadge}
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-600 whitespace-nowrap">👛 ${wal?.name || '-'}</td>
                <td class="px-6 py-4 text-slate-700">
                  <div class="font-medium text-slate-900">${t.notes || '-'}</div>
                  ${hasItems ? `
                    <details class="mt-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <summary class="cursor-pointer font-bold text-brand-600 flex items-center gap-1.5 select-none hover:underline">
                        <i data-lucide="receipt" class="w-3.5 h-3.5"></i>
                        Lihat Rincian ${t.receipt_items.length} Item Struk Belanja
                      </summary>
                      <div class="mt-2 space-y-1.5 pt-2 border-t border-slate-200/80 text-[11px]">
                        ${t.receipt_items.map(item => `
                          <div class="flex justify-between items-center text-slate-600">
                            <span>• ${item.name} (${item.qty}x)</span>
                            <span class="font-semibold text-slate-900">Rp${Number(item.price).toLocaleString('id-ID')}</span>
                          </div>
                        `).join('')}
                      </div>
                    </details>
                  ` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${srcInfo.badge} border shadow-xs">
                    <span>${srcInfo.icon}</span>
                    <span>Sumber: ${srcInfo.label}</span>
                  </span>
                </td>
                <td class="px-6 py-4 font-black text-right whitespace-nowrap text-sm ${amountColor}">
                  ${prefix}Rp${Number(t.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- PAGINATION CONTROLS (Part 3) -->
    <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
      <div id="repPageInfo" class="text-slate-500 font-medium">
        Halaman 1 dari 1
      </div>
      <div class="flex items-center gap-2">
        <button id="repPrevBtn" onclick="prevReportPage()" class="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          « Sebelumnya
        </button>
        <button id="repNextBtn" onclick="nextReportPage()" class="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          Berikutnya »
        </button>
      </div>
    </div>
    ` : `
    <div class="p-12 text-center text-slate-500 text-xs">
      Belum ada data transaksi yang dapat ditampilkan pada laporan ini.
    </div>
    `}
  </div>

  <script>
    let currentRepPage = 1;
    const repPageSize = 10;
    let currentSortCol = 'date';
    let currentSortAsc = false;
    let filteredReportRows = [];
    let currentSelectedRepPeriod = 'all';

    function getRepLocalDateString(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    function selectReportPeriod(periodKey) {
      currentSelectedRepPeriod = periodKey;

      // Update pills styling
      document.querySelectorAll('.rep-period-pill').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'font-bold', 'border-brand-600', 'shadow-sm');
        btn.classList.add('border-slate-200', 'text-slate-700');
      });

      const activeBtn = document.getElementById('repPill-' + periodKey);
      if (activeBtn) {
        activeBtn.classList.remove('border-slate-200', 'text-slate-700');
        activeBtn.classList.add('bg-brand-600', 'text-white', 'font-bold', 'border-brand-600', 'shadow-sm');
      }

      applyReportFilters();
    }

    function applyReportFilters() {
      const search = (document.getElementById('repSearchInput')?.value || '').toLowerCase().trim();
      const cat = document.getElementById('repCatFilterSelect')?.value || 'all';
      const wallet = document.getElementById('repWalletFilterSelect')?.value || 'all';
      const type = document.getElementById('repTypeFilterSelect')?.value || 'all';
      const startDate = document.getElementById('repStartDateInput')?.value || '';

      const now = new Date();
      let pStart = '';
      let pEnd = '';
      let periodLabel = 'Semua Waktu Laporan';

      if (currentSelectedRepPeriod === 'today') {
        pStart = getRepLocalDateString(now);
        pEnd = pStart;
        periodLabel = 'Hari Ini (' + pStart + ')';
      } else if (currentSelectedRepPeriod === 'yesterday') {
        const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        pStart = getRepLocalDateString(y);
        pEnd = pStart;
        periodLabel = 'Kemarin (' + pStart + ')';
      } else if (currentSelectedRepPeriod === '7days') {
        const d7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        pStart = getRepLocalDateString(d7);
        pEnd = getRepLocalDateString(now);
        periodLabel = '7 Hari Terakhir';
      } else if (currentSelectedRepPeriod === '30days') {
        const d30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        pStart = getRepLocalDateString(d30);
        pEnd = getRepLocalDateString(now);
        periodLabel = '30 Hari Terakhir';
      } else if (currentSelectedRepPeriod === 'this_month') {
        const sm = new Date(now.getFullYear(), now.getMonth(), 1);
        const em = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        pStart = getRepLocalDateString(sm);
        pEnd = getRepLocalDateString(em);
        periodLabel = 'Bulan Ini (' + (now.getMonth() + 1) + '/' + now.getFullYear() + ')';
      } else if (currentSelectedRepPeriod === 'last_month') {
        const spm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const epm = new Date(now.getFullYear(), now.getMonth(), 0);
        pStart = getRepLocalDateString(spm);
        pEnd = getRepLocalDateString(epm);
        periodLabel = 'Bulan Lalu (' + (spm.getMonth() + 1) + '/' + spm.getFullYear() + ')';
      } else if (currentSelectedRepPeriod === 'this_year') {
        const sy = new Date(now.getFullYear(), 0, 1);
        const ey = new Date(now.getFullYear(), 11, 31);
        pStart = getRepLocalDateString(sy);
        pEnd = getRepLocalDateString(ey);
        periodLabel = 'Tahun Ini (' + now.getFullYear() + ')';
      }

      const pBadge = document.getElementById('repPeriodLabelBadge');
      if (pBadge) {
        pBadge.innerText = periodLabel;
      }

      const allRows = Array.from(document.querySelectorAll('.rep-row'));
      let totalFilteredIncome = 0;
      let totalFilteredExpense = 0;

      filteredReportRows = allRows.filter(r => {
        const rNotes = (r.getAttribute('data-notes') || '').toLowerCase();
        const rCat = r.getAttribute('data-cat') || '';
        const rWallet = r.getAttribute('data-wallet') || '';
        const rType = r.getAttribute('data-type') || '';
        const rDate = r.getAttribute('data-date') || '';
        const rAmount = Number(r.getAttribute('data-amount') || 0);

        const matchSearch = (!search || rNotes.includes(search));
        const matchCat = (cat === 'all' || rCat === cat);
        const matchWallet = (wallet === 'all' || rWallet === wallet);
        const matchType = (type === 'all' || rType === type);
        const matchStartDateInput = (!startDate || rDate >= startDate);
        const matchPeriodDate = (!pStart || rDate >= pStart) && (!pEnd || rDate <= pEnd);

        const matched = matchSearch && matchCat && matchWallet && matchType && matchStartDateInput && matchPeriodDate;
        if (matched) {
          if (rType === 'income') totalFilteredIncome += rAmount;
          if (rType === 'expense') totalFilteredExpense += rAmount;
        }
        return matched;
      });

      // Update 4 Summary KPI Cards
      const incEl = document.getElementById('repSummaryIncome');
      if (incEl) incEl.innerText = '+Rp' + totalFilteredIncome.toLocaleString('id-ID');

      const expEl = document.getElementById('repSummaryExpense');
      if (expEl) expEl.innerText = '-Rp' + totalFilteredExpense.toLocaleString('id-ID');

      const netCashflow = totalFilteredIncome - totalFilteredExpense;
      const isPositive = netCashflow >= 0;
      const netEl = document.getElementById('repSummaryNet');
      if (netEl) {
        netEl.className = 'text-2xl font-black mt-1 ' + (isPositive ? 'text-emerald-600' : 'text-red-600');
        netEl.innerText = (isPositive ? '+' : '-') + 'Rp' + Math.abs(netCashflow).toLocaleString('id-ID');
      }

      const netBadgeEl = document.getElementById('repSummaryNetBadge');
      if (netBadgeEl) {
        netBadgeEl.className = 'text-[11px] font-bold mt-1 ' + (isPositive ? 'text-emerald-700' : 'text-red-700');
        netBadgeEl.innerText = isPositive ? '🟢 Surplus (+Kas Bertambah)' : '🔴 Defisit (-Defisit Kas)';
      }

      const countEl = document.getElementById('repSummaryTxCount');
      if (countEl) countEl.innerText = filteredReportRows.length + ' tx';

      // Update Arus Kas Visual Ratio Bar
      const totalFlow = totalFilteredIncome + totalFilteredExpense;
      const incPct = totalFlow > 0 ? Math.round((totalFilteredIncome / totalFlow) * 100) : 50;
      const expPct = totalFlow > 0 ? (100 - incPct) : 50;

      const barInc = document.getElementById('repCashflowBarInc');
      const barExp = document.getElementById('repCashflowBarExp');
      const barIncLbl = document.getElementById('repBarIncLabel');
      const barExpLbl = document.getElementById('repBarExpLabel');
      const healthBadge = document.getElementById('repCashflowHealthBadge');

      if (barInc) {
        barInc.style.width = (totalFlow > 0 ? incPct : 50) + '%';
        barInc.innerText = totalFlow > 0 && incPct > 10 ? incPct + '%' : '';
      }
      if (barExp) {
        barExp.style.width = (totalFlow > 0 ? expPct : 50) + '%';
        barExp.innerText = totalFlow > 0 && expPct > 10 ? expPct + '%' : '';
      }
      if (barIncLbl) {
        barIncLbl.innerText = 'Rp' + totalFilteredIncome.toLocaleString('id-ID') + ' (' + (totalFlow > 0 ? incPct : 0) + '%)';
      }
      if (barExpLbl) {
        barExpLbl.innerText = 'Rp' + totalFilteredExpense.toLocaleString('id-ID') + ' (' + (totalFlow > 0 ? expPct : 0) + '%)';
      }
      if (healthBadge) {
        healthBadge.className = 'text-xs font-bold px-3 py-1 rounded-full ' + (isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200');
        healthBadge.innerText = isPositive ? '✅ Arus Kas Sehat (Surplus)' : '⚠️ Arus Kas Waspada (Defisit)';
      }

      // Update badge
      const badge = document.getElementById('repCountBadge');
      if (badge) {
        badge.innerText = 'Menampilkan ' + filteredReportRows.length + ' Data Transaksi (' + periodLabel + ')';
      }

      currentRepPage = 1;
      renderReportTablePage();
    }

    function renderReportTablePage() {
      const allRows = Array.from(document.querySelectorAll('.rep-row'));
      allRows.forEach(r => r.style.display = 'none');

      const totalPages = Math.max(1, Math.ceil(filteredReportRows.length / repPageSize));
      if (currentRepPage > totalPages) currentRepPage = totalPages;

      const startIdx = (currentRepPage - 1) * repPageSize;
      const endIdx = startIdx + repPageSize;
      const pageRows = filteredReportRows.slice(startIdx, endIdx);

      pageRows.forEach(r => r.style.display = '');

      const info = document.getElementById('repPageInfo');
      if (info) {
        info.innerText = 'Halaman ' + currentRepPage + ' dari ' + totalPages + ' (' + filteredReportRows.length + ' transaksi)';
      }

      const prevBtn = document.getElementById('repPrevBtn');
      const nextBtn = document.getElementById('repNextBtn');
      if (prevBtn) prevBtn.disabled = (currentRepPage <= 1);
      if (nextBtn) nextBtn.disabled = (currentRepPage >= totalPages);
    }

    function prevReportPage() {
      if (currentRepPage > 1) {
        currentRepPage--;
        renderReportTablePage();
      }
    }

    function nextReportPage() {
      const totalPages = Math.ceil(filteredReportRows.length / repPageSize);
      if (currentRepPage < totalPages) {
        currentRepPage++;
        renderReportTablePage();
      }
    }

    function sortReportTable(col) {
      if (currentSortCol === col) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortCol = col;
        currentSortAsc = true;
      }

      const tbody = document.getElementById('reportsTableBody');
      if (!tbody) return;

      const rows = Array.from(document.querySelectorAll('.rep-row'));
      rows.sort((a, b) => {
        let valA, valB;
        if (col === 'date') {
          valA = a.getAttribute('data-date');
          valB = b.getAttribute('data-date');
        } else if (col === 'cat') {
          valA = a.getAttribute('data-catname');
          valB = b.getAttribute('data-catname');
        } else if (col === 'wallet') {
          valA = a.getAttribute('data-walletname');
          valB = b.getAttribute('data-walletname');
        } else if (col === 'amount') {
          valA = Number(a.getAttribute('data-amount') || 0);
          valB = Number(b.getAttribute('data-amount') || 0);
        }

        if (valA < valB) return currentSortAsc ? -1 : 1;
        if (valA > valB) return currentSortAsc ? 1 : -1;
        return 0;
      });

      rows.forEach(r => tbody.appendChild(r));
      applyReportFilters();
    }

    function resetReportFilters() {
      currentSelectedRepPeriod = 'all';
      document.querySelectorAll('.rep-period-pill').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'font-bold', 'border-brand-600', 'shadow-sm');
        btn.classList.add('border-slate-200', 'text-slate-700');
      });
      const allBtn = document.getElementById('repPill-all');
      if (allBtn) {
        allBtn.classList.remove('border-slate-200', 'text-slate-700');
        allBtn.classList.add('bg-brand-600', 'text-white', 'font-bold', 'border-brand-600', 'shadow-sm');
      }

      const s = document.getElementById('repSearchInput'); if (s) s.value = '';
      const c = document.getElementById('repCatFilterSelect'); if (c) c.value = 'all';
      const w = document.getElementById('repWalletFilterSelect'); if (w) w.value = 'all';
      const t = document.getElementById('repTypeFilterSelect'); if (t) t.value = 'all';
      const d = document.getElementById('repStartDateInput'); if (d) d.value = '';
      applyReportFilters();
    }

    // Initial setup on page load
    setTimeout(applyReportFilters, 50);
  </script>

  <!-- RIWAYAT EXPORT TERSIMPAN (Part 3) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-bold text-slate-900 text-base">Riwayat Export Laporan Tersimpan</h3>
        <p class="text-xs text-slate-500">File tersimpan di Supabase Storage, dapat didownload ulang kapan saja tanpa generate ulang.</p>
      </div>
    </div>

    ${(exportHistory || []).length > 0 ? `
    <div class="divide-y divide-slate-100 text-xs">
      ${exportHistory.map(exp => `
        <div class="py-3.5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg ${exp.file_type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center font-bold">
              ${exp.file_type.toUpperCase()}
            </div>
            <div>
              <div class="font-bold text-slate-900">${exp.file_name}</div>
              <div class="text-slate-500">Periode ${exp.period_start} s/d ${exp.period_end} • ${exp.file_size_kb} KB</div>
            </div>
          </div>
          <a href="/api/reports/download/${exp.file_name}" class="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center gap-1.5 transition-colors">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Unduh Ulang
          </a>
        </div>
      `).join('')}
    </div>
    ` : `
    <div class="py-8 text-center text-xs text-slate-400">
      Belum ada riwayat export laporan. Klik tombol 'Export PDF' atau 'Export Excel' di atas untuk mengenerate laporan resmi.
    </div>
    `}
  </div>
  `;
}

// --------------------------------------------------------------------
// 4. BUDGETS PAGE (Budget per Kategori & Progress Bar █)
// --------------------------------------------------------------------
export function renderBudgetsPage({ categories = [], transactions = [], wallets = [] }) {
  const expenseCats = (categories || []).filter(c => c.type === 'expense');

  // KPI calculations
  const totalBudget = expenseCats.reduce((sum, c) => sum + (Number(c.monthly_budget) || 1000000), 0);
  const totalSpent = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalRemaining = Math.max(totalBudget - totalSpent, 0);
  const totalPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
  const totalExpenseTxsCount = (transactions || []).filter(t => t.type === 'expense').length;

  return `
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">🎯 Anggaran & Budget</h1>
      <p class="text-sm text-slate-500 mt-1">Pantau batas pengeluaran bulanan, rincian setiap item pengeluaran (makanan, minuman, dll), dan export transaksi resmi.</p>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <button onclick="openModal('addTxModal')" class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all">
        <i data-lucide="plus" class="w-4 h-4"></i> + Catat Item Pengeluaran
      </button>
      <a href="/api/transactions/export?type=pdf" target="_blank" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-all" title="Export Transaksi ke PDF Siap Cetak">
        <i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i> 📄 Export PDF
      </a>
      <a href="/api/transactions/export?type=xlsx" class="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 shadow-sm transition-all" title="Export Transaksi ke Excel (.xlsx / CSV)">
        <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i> 📊 Export Excel (.xlsx)
      </a>
    </div>
  </div>

  <!-- KPI SUMMARY CARDS -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Anggaran Bulanan</span>
      <div class="text-2xl font-black text-slate-900 mt-1">Rp${totalBudget.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold text-slate-500 mt-1">Batas alokasi bulanan</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Realisasi Pengeluaran</span>
      <div class="text-2xl font-black text-red-600 mt-1">-Rp${totalSpent.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold text-red-700 mt-1">${totalPct}% Terpakai</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisa Anggaran</span>
      <div class="text-2xl font-black ${totalRemaining > 0 ? 'text-emerald-600' : 'text-red-600'} mt-1">Rp${totalRemaining.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold ${totalRemaining > 0 ? 'text-emerald-700' : 'text-red-700'} mt-1">${totalRemaining > 0 ? '🟢 Alokasi Masih Aman' : '🔴 Anggaran Habis/Defisit'}</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaksi Pengeluaran</span>
      <div class="text-2xl font-black text-brand-600 mt-1">${totalExpenseTxsCount} tx</div>
      <div class="text-[11px] text-slate-500 mt-1">Item tercatat</div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    ${expenseCats.map(cat => {
      const catTxs = (transactions || [])
        .filter(t => t.category_id === cat.id && t.type === 'expense')
        .sort((a, b) => new Date(b.transaction_date || b.created_at) - new Date(a.transaction_date || a.created_at));
      const spent = catTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const budget = Number(cat.monthly_budget) || 1000000;
      const pct = Math.min(Math.round((spent / budget) * 100), 100);
      const remaining = Math.max(budget - spent, 0);

      let statusBadge = 'bg-brand-100 text-brand-800';
      if (pct >= 100) statusBadge = 'bg-red-100 text-red-800';
      else if (pct >= 80) statusBadge = 'bg-amber-100 text-amber-800';

      return `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-3xl">${cat.emoji}</span>
                <div>
                  <h3 class="font-bold text-slate-900 text-base">${cat.name}</h3>
                  <p class="text-xs text-slate-500">Batas: Rp${Number(budget).toLocaleString('id-ID')}/bulan</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge}">
                ${pct}% Terpakai
              </span>
            </div>

            <!-- Visual Bar (Part 3) -->
            <div class="mt-4">
              <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div class="h-3 rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-brand-600'}" style="width: ${pct}%"></div>
              </div>
              <div class="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                <span>Terpakai: Rp${spent.toLocaleString('id-ID')}</span>
                <span>Sisa: Rp${remaining.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
              <span class="text-slate-400">🔔 Alert Telegram di 80% & 100%</span>
              <div class="flex items-center gap-2">
                <button onclick="openAddTxForCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1 transition-all">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> + Tambah Item
                </button>
                <button onclick="editBudgetPrompt('${cat.id}', '${cat.name.replace(/'/g, "\\'")}', ${budget})" class="font-bold text-slate-500 hover:text-slate-800 text-xs hover:underline">
                  Ubah Budget
                </button>
              </div>
            </div>

            <!-- ITEM RINCIAN PENGELUARAN (User Request) -->
            <div class="mt-4 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <i data-lucide="receipt" class="w-3.5 h-3.5 text-brand-600"></i>
                  Rincian Item Pengeluaran (${catTxs.length} item):
                </span>
                <span class="text-xs font-bold text-slate-500">Total: Rp${spent.toLocaleString('id-ID')}</span>
              </div>

              ${catTxs.length > 0 ? `
              <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                ${catTxs.map(t => {
                  const wal = (wallets || []).find(w => w.id === t.wallet_id);
                  const srcInfo = formatSourceInfo(t.source);
                  const hasReceipt = t.receipt_items && t.receipt_items.length > 0;

                  return `
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="font-bold text-slate-900 text-xs truncate">
                            ${t.notes || cat.name}
                          </div>
                          <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                            <span class="flex items-center gap-1 font-medium text-slate-700">
                              <i data-lucide="calendar" class="w-3 h-3 text-brand-600"></i>
                              ${formatIndoFullDate(t.transaction_date)}
                            </span>
                            <span>•</span>
                            <span>👛 ${wal?.name || 'Dompet Utama'}</span>
                            <span>•</span>
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${srcInfo.badge}">
                              ${srcInfo.icon} ${srcInfo.label}
                            </span>
                          </div>
                        </div>
                        <div class="text-right flex-shrink-0">
                          <div class="font-black text-red-600 text-xs">
                            -Rp${Number(t.amount).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      ${hasReceipt ? `
                        <div class="mt-2 pt-2 border-t border-slate-200/70 text-[11px]">
                          <div class="font-semibold text-slate-600 mb-1">Rincian Item Struk Belanja:</div>
                          <div class="space-y-1 pl-2 border-l-2 border-brand-300">
                            ${t.receipt_items.map(ri => `
                              <div class="flex justify-between items-center text-slate-600">
                                <span>• ${ri.name} (${ri.qty}x)</span>
                                <span class="font-semibold text-slate-900">Rp${Number(ri.price).toLocaleString('id-ID')}</span>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
              ` : `
              <div class="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Belum ada item pengeluaran untuk kategori ${cat.name}.
                <div class="mt-2">
                  <button onclick="openAddTxForCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all">
                    <i data-lucide="plus" class="w-3 h-3"></i> Catat Pengeluaran ${cat.name}
                  </button>
                </div>
              </div>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('')}
  </div>

  ${renderTransactionModal({ categories, wallets })}

  <script>
    function openAddTxForCategory(catId, catName) {
      const modal = document.getElementById('addTxModal');
      if (!modal) return;
      const returnInput = modal.querySelector('input[name="return_to"]');
      if (returnInput) returnInput.value = '/budgets';
      const catSelect = modal.querySelector('select[name="category_id"]');
      if (catSelect && catId) catSelect.value = catId;
      const expRadio = modal.querySelector('input[name="type"][value="expense"]');
      if (expRadio) expRadio.checked = true;
      const notesInput = modal.querySelector('input[name="notes"]');
      if (notesInput) {
        const isFood = (catName || '').toLowerCase().includes('makan') || (catName || '').toLowerCase().includes('minum');
        notesInput.placeholder = isFood ? 'Contoh: Beli Nasi Padang & Es Teh' : 'Contoh: Pengeluaran ' + (catName || '');
      }
      openModal('addTxModal');
    }

    function editBudgetPrompt(catId, catName, currentBudget) {
      const val = prompt('Masukkan nominal budget bulanan baru untuk ' + catName + ' (Rp):', currentBudget);
      if (val !== null && val.trim() !== '') {
        const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) {
          fetch('/api/settings/categories/edit-budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_id: catId, budget: num })
          }).then(() => window.location.reload());
        }
      }
    }
  </script>
  `;
}

// --------------------------------------------------------------------
// 5. WALLETS PAGE (Multi-Wallet, Add Wallet, Set Default)
// --------------------------------------------------------------------
export function renderWalletsPage({ wallets, transactions = [] }) {
  const totalBalance = (wallets || []).reduce((s, w) => s + Number(w.balance || 0), 0);
  const totalIncome = (transactions || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = (transactions || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

  return `
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">👛 Dompet (Multi-Wallet)</h1>
      <p class="text-sm text-slate-500 mt-1">Kelola saldo rekening bank, e-wallet, dan dompet tunai.</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button onclick="openModal('transferModal')" class="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all">
        <i data-lucide="arrow-left-right" class="w-4 h-4"></i> ⇄ Transfer Saldo Antar Dompet
      </button>
      <button onclick="openModal('addWalletModal')" class="px-4 py-2.5 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all">
        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Dompet Baru
      </button>
    </div>
  </div>

  <!-- Wallet Summary Row -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Seluruh Saldo</span>
      <div class="text-2xl font-black ${totalBalance < 0 ? 'text-red-600' : 'text-slate-900'} mt-1">
        ${totalBalance < 0 ? `-Rp${Math.abs(totalBalance).toLocaleString('id-ID')}` : `Rp${totalBalance.toLocaleString('id-ID')}`}
      </div>
      <div class="text-[11px] text-slate-500 mt-1">Akumulasi seluruh dompet</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemasukan Masuk</span>
      <div class="text-2xl font-black text-emerald-600 mt-1">+Rp${totalIncome.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold text-emerald-700 mt-1">🟢 Uang Bertambah (+)</div>
    </div>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran Keluar</span>
      <div class="text-2xl font-black text-red-600 mt-1">-Rp${totalExpense.toLocaleString('id-ID')}</div>
      <div class="text-[11px] font-bold text-red-700 mt-1">🔴 Uang Berkurang (-)</div>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    ${wallets.map(w => {
      const wIncome = (transactions || []).filter(t => t.wallet_id === w.id && t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
      const wExpense = (transactions || []).filter(t => t.wallet_id === w.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
      const bal = Number(w.balance || 0);
      const balColor = bal < 0 ? 'text-red-600' : 'text-slate-900';
      const balFormatted = bal < 0 ? `-Rp${Math.abs(bal).toLocaleString('id-ID')}` : `Rp${bal.toLocaleString('id-ID')}`;

      return `
        <div class="bg-white p-6 rounded-2xl border ${w.is_default ? 'border-2 border-brand-600 shadow-md ring-4 ring-brand-500/10' : 'border-slate-200 shadow-sm'} space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <i data-lucide="${w.icon || 'wallet'}" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-base">${w.name}</h3>
                <p class="text-xs text-slate-500 uppercase tracking-wider">${w.type}</p>
              </div>
            </div>
            ${w.is_default ? '<span class="text-xs bg-brand-100 text-brand-800 font-bold px-2.5 py-1 rounded-full">Default Bot</span>' : ''}
          </div>

          <div>
            <div class="text-xs font-semibold text-slate-500">Saldo Dompet Saat Ini</div>
            <div class="text-2xl font-black ${balColor} mt-0.5">${balFormatted}</div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span class="text-emerald-600 font-bold">+Rp${wIncome.toLocaleString('id-ID')} masuk</span>
              <span class="text-red-600 font-bold">-Rp${wExpense.toLocaleString('id-ID')} keluar</span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            ${w.is_default
              ? '<span class="text-emerald-600 font-bold flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Digunakan untuk Telegram</span>'
              : `<button onclick="setDefaultWallet('${w.id}')" class="font-bold text-brand-600 hover:underline">Jadikan Default Bot</button>`
            }
            <button onclick="openTransferWithSource('${w.id}')" class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 transition-colors">
              <i data-lucide="arrow-left-right" class="w-3 h-3"></i> Transfer / Top Up
            </button>
          </div>
        </div>
      `;
    }).join('')}
  </div>

  ${renderAddWalletModal()}
  ${renderTransferModal({ wallets })}

  <script>
    function setDefaultWallet(walletId) {
      fetch('/api/wallets/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_id: walletId })
      }).then(() => window.location.reload());
    }

    function openTransferWithSource(sourceWalletId) {
      const srcSel = document.querySelector('#transferModal select[name="source_wallet_id"]');
      if (srcSel) {
        srcSel.value = sourceWalletId;
      }
      openModal('transferModal');
    }
  </script>
  `;
}

// --------------------------------------------------------------------
// 6. SETTINGS PAGE (Part 3, 5, 12, Daily Budget & Bills)
// --------------------------------------------------------------------
export function renderSettingsPage({ user, activeTab = 'bot', categories = [], wallets = [], bills = [] }) {
  const userInitials = getInitials(user.full_name);
  const isPro = user.plan === 'pro';

  return `
  <div class="mb-6">
    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">⚙️ Pengaturan Akun & Layanan</h1>
    <p class="text-sm text-slate-500 mt-1">Konfigurasi profil, foto, integrasi bot Telegram, jatah harian, tagihan rutin, pengingat, dan kategori.</p>
  </div>

  <!-- Settings Tabs Navigation (Part 3, Daily Budget & Bills) -->
  <div class="flex gap-2 border-b border-slate-200 pb-px mb-6 overflow-x-auto text-sm font-semibold">
    <a href="/settings?tab=bot" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'bot' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      🤖 Telegram Bot
    </a>
    <a href="/settings?tab=daily_budget" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'daily_budget' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      🎯 Jatah Harian
    </a>
    <a href="/settings?tab=bills" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'bills' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      🧾 Kelola Tagihan
    </a>
    <a href="/settings?tab=profile" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'profile' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      👤 Profil & Foto
    </a>
    <a href="/settings?tab=reminder" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'reminder' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      ⏰ Reminder Harian
    </a>
    <a href="/settings?tab=categories" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'categories' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      🏷️ Kategori Custom
    </a>
    <a href="/settings?tab=plan" class="px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${activeTab === 'plan' ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'} whitespace-nowrap">
      ⭐ Paket Langganan
    </a>
  </div>

  <!-- TAB 1: TELEGRAM BOT (Part 5 Detail Teknis Wajib) -->
  ${activeTab === 'bot' ? `
  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">Konfigurasi Token Bot Telegram</h3>
        <p class="text-xs text-slate-500 mt-0.5">Sambungkan bot Telegram pribadimu agar webhook otomatis terpasang.</p>
      </div>
      <div id="connectionStatusBadge">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.telegram_connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}">
          ${user.telegram_connected ? '🟢 Terhubung' : '🔴 Tidak Terhubung'}
        </span>
      </div>
    </div>

    <!-- Panduan Step-by-Step @BotFather (Part 5) -->
    <div class="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-5 text-xs text-brand-900 space-y-2">
      <div class="font-bold text-sm text-brand-900 flex items-center gap-2">
        <i data-lucide="help-circle" class="w-4 h-4 text-brand-600"></i> Panduan Membuat Bot di Telegram:
      </div>
      <ol class="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
        <li>Buka aplikasi Telegram dan cari bot resmi <b>@BotFather</b>.</li>
        <li>Ketik perintah <code>/newbot</code> lalu beri nama bot kamu (misal: <i>CatatKeuanganBot</i>).</li>
        <li>Beri username unik berakhiran bot (misal: <i>tatadana_keuangan_bot</i>).</li>
        <li>Copy token HTTP API yang diberikan oleh BotFather (panjang ~46 karakter).</li>
        <li>Paste token di bawah ini lalu klik tombol <b>Test Koneksi & Pasang Webhook</b>.</li>
        <li>Buka bot kamu di Telegram, tekan <b>/start</b>, dan ketik perintah <code>/link ${user.phone_number || '08xxxx'}</code> untuk menautkan akunmu!</li>
      </ol>
    </div>

    <!-- Form Input Token -->
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Token API Bot Telegram</label>
        <div class="flex flex-wrap sm:flex-nowrap gap-3">
          <input type="text" id="botTokenInput" placeholder="Contoh: 7123456789:AAHfkjhsdfjkshdf..." value="${user.telegram_bot_token || ''}" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 font-mono"/>
          <button id="testConnectionBtn" onclick="handleTestConnection()" class="px-5 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 text-xs sm:text-sm whitespace-nowrap">
            Test Koneksi
          </button>
          <a href="/simulator" target="_blank" class="px-4 py-3 rounded-xl font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-xs sm:text-sm whitespace-nowrap inline-flex items-center gap-1.5 transition">
            🤖 Tes Chat Bot (Live)
          </a>
        </div>
        <p class="text-[11px] text-slate-500 mt-1.5">
          Backend akan memanggil <code>getMe</code> dan memasang <code>setWebhook</code> ke server TataDana secara otomatis.
        </p>
      </div>

      <!-- Result Box -->
      <div id="testResultBox" class="hidden p-4 rounded-xl text-xs font-medium"></div>

      <!-- Local Polling Toggle -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div class="font-bold text-sm text-slate-900">Mode Polling Lokal (Pengujian Offline)</div>
          <div class="text-xs text-slate-500">Jalankan background long polling saat develop tanpa perlu domain publik.</div>
        </div>
        <button onclick="togglePolling()" id="pollingToggleBtn" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800">
          ▶️ Jalankan Polling Lokal
        </button>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- TAB: JATAH HARIAN (User Request) -->
  ${activeTab === 'daily_budget' ? `
  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">🎯 Pengaturan Target Jatah Harian & Heatmap</h3>
        <p class="text-xs text-slate-500 mt-0.5">Atur alokasi belanja harian, ambang batas peringatan pemborosan, dan target hari bebas belanja (No-Spend Days).</p>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-brand-800">
        WIB Asia/Jakarta
      </span>
    </div>

    <!-- Live Calculation Preview Card -->
    ${(() => {
      const totalBudget = categories.filter(c => c.type === 'expense').reduce((s, c) => s + Number(c.monthly_budget || 0), 0) || 3000000;
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const autoAllowance = Math.round(totalBudget / daysInMonth);
      const isManual = user.daily_budget_mode === 'manual';
      const activeAllowance = isManual ? (Number(user.daily_budget_custom) || 100000) : autoAllowance;

      return `
      <div class="bg-gradient-to-br from-brand-50 to-orange-50/40 p-5 rounded-2xl border border-orange-200/80 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="calculator" class="w-4 h-4 text-brand-600"></i> Kalkulasi Jatah Harian Berjalan (${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })})
          </span>
          <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${isManual ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
            Mode Aktif: ${isManual ? '✏️ Manual Tetap' : '⚡ Otomatis (Budget/Hari)'}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div class="bg-white p-3.5 rounded-xl border border-orange-100 shadow-2xs">
            <div class="text-[11px] font-semibold text-slate-500">Total Budget Bulanan</div>
            <div class="text-base font-extrabold text-slate-900 mt-0.5">Rp${totalBudget.toLocaleString('id-ID')}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Dari ${categories.filter(c => c.type === 'expense').length} kategori pengeluaran</div>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-orange-100 shadow-2xs">
            <div class="text-[11px] font-semibold text-slate-500">Jumlah Hari Bulan Ini</div>
            <div class="text-base font-extrabold text-slate-900 mt-0.5">${daysInMonth} Hari</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Hari ke-${now.getDate()} berjalan</div>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-brand-300 shadow-sm ring-2 ring-brand-500/10">
            <div class="text-[11px] font-bold text-brand-700">Jatah Harian Berlaku</div>
            <div class="text-lg font-black text-brand-600 mt-0.5">Rp${activeAllowance.toLocaleString('id-ID')}</div>
            <div class="text-[10px] text-brand-600 font-semibold mt-0.5">/ hari kalender</div>
          </div>
        </div>
      </div>
      `;
    })()}

    <!-- Settings Form -->
    <form action="/api/settings/daily-budget" method="POST" class="space-y-5">
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Metode Perhitungan Jatah Harian</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/40 transition-all shadow-2xs">
            <input type="radio" name="mode" value="auto" ${user.daily_budget_mode !== 'manual' ? 'checked' : ''} onchange="toggleManualDailyInput(false)" class="mt-0.5 text-brand-600 focus:ring-brand-500"/>
            <div>
              <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                ⚡ Otomatis Dinamis (Rekomendasi)
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Jatah otomatis dihitung dari <b>Total Anggaran Bulanan</b> dibagi jumlah hari bulan berjalan. Jika kamu mengubah budget kategori, jatah harian otomatis ikut menyesuaikan.
              </div>
            </div>
          </label>

          <label class="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3 cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/40 transition-all shadow-2xs">
            <input type="radio" name="mode" value="manual" ${user.daily_budget_mode === 'manual' ? 'checked' : ''} onchange="toggleManualDailyInput(true)" class="mt-0.5 text-brand-600 focus:ring-brand-500"/>
            <div>
              <div class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                ✏️ Manual Tetap (Fixed Target)
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Tentukan sendiri batas jatah belanja harian tetap (misal Rp100.000/hari) tanpa terikat pada total anggaran bulanan kategori.
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Manual Input Nominal -->
      <div id="manualDailyBudgetSection" class="${user.daily_budget_mode === 'manual' ? '' : 'hidden'} space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Target Nominal Jatah Harian Manual (Rp)</label>
        <div class="relative">
          <span class="absolute left-4 top-3 text-sm font-bold text-slate-400">Rp</span>
          <input type="number" name="custom_nominal" value="${user.daily_budget_custom || 100000}" placeholder="Contoh: 100000" class="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-600"/>
        </div>
        <p class="text-[11px] text-slate-400">Nominal ini akan menjadi batas garis merah di Kalender Keuangan dan notifikasi Telegram bot.</p>
      </div>

      <!-- Threshold and No Spend Targets -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ambang Peringatan Pengeluaran (Alert)</label>
          <select name="alert_pct" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-600 bg-white">
            <option value="70" ${Number(user.daily_budget_alert_pct) === 70 ? 'selected' : ''}>🟡 70% dari Jatah Harian (Disiplin Ketat)</option>
            <option value="80" ${!user.daily_budget_alert_pct || Number(user.daily_budget_alert_pct) === 80 ? 'selected' : ''}>🟡 80% dari Jatah Harian (Standar Rekomendasi)</option>
            <option value="90" ${Number(user.daily_budget_alert_pct) === 90 ? 'selected' : ''}>🟡 90% dari Jatah Harian (Toleran)</option>
            <option value="100" ${Number(user.daily_budget_alert_pct) === 100 ? 'selected' : ''}>🔴 100% dari Jatah Harian (Hanya Saat Over Jatah)</option>
          </select>
          <p class="text-[11px] text-slate-400 mt-1">Bot akan memberikan indikator kuning jika belanja harian menyentuh batas ini.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Hari Bebas Belanja (No-Spend)</label>
          <div class="relative">
            <input type="number" name="no_spend_target" min="0" max="31" value="${user.no_spend_target_days || 7}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-600 bg-white"/>
            <span class="absolute right-4 top-2.5 text-xs text-slate-500 font-bold">Hari / Bulan</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Target jumlah hari tanpa pengeluaran sama sekali (Rp0) untuk membangun disiplin menabung.</p>
        </div>
      </div>

      <!-- Integration info -->
      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div class="font-bold text-slate-800 flex items-center gap-1.5">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i> Terintegrasi Otomatis dengan Fitur:
        </div>
        <ul class="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
          <li><b>Kalender Jatah Harian di Beranda:</b> Mengubah warna tanggal (⚪ Bebas Belanja, 🟢 Hemat, 🟡 Sesuai, 🔴 Over Jatah).</li>
          <li><b>Heatmap Aktivitas Belanja:</b> Menentukan skala intensitas warna per tanggal.</li>
          <li><b>Perintah Telegram <code>/jatah</code>:</b> Menampilkan target jatah, pemakaian hari ini, dan sisa jatah harian.</li>
        </ul>
      </div>

      <div class="pt-2">
        <button type="submit" class="w-full py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2">
          <i data-lucide="save" class="w-4 h-4"></i> Simpan Pengaturan Jatah Harian
        </button>
      </div>
    </form>
  </div>
  ` : ''}

  <!-- TAB: KELOLA TAGIHAN (User Request) -->
  ${activeTab === 'bills' ? `
  <div class="space-y-6 max-w-4xl">
    <!-- Header & Action Button -->
    <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 class="font-bold text-slate-900 text-lg">🧾 Manajemen Tagihan & Pengeluaran Rutin</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola tagihan bulanan (listrik, internet, sewa kost, langganan streaming, air, BPJS) agar tidak lewat jatuh tempo.</p>
        </div>
        <button type="button" onclick="openModal('addBillModal')" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> Tambah Tagihan Baru
        </button>
      </div>

      <!-- 4 KPI Tagihan Cards -->
      ${(() => {
        const totalAmount = (bills || []).reduce((s, b) => s + Number(b.amount || 0), 0);
        const paidBills = (bills || []).filter(b => b.is_paid);
        const paidAmount = paidBills.reduce((s, b) => s + Number(b.amount || 0), 0);
        const unpaidBills = (bills || []).filter(b => !b.is_paid);
        const unpaidAmount = unpaidBills.reduce((s, b) => s + Number(b.amount || 0), 0);

        // Find nearest due bill
        const now = new Date();
        const currentDay = now.getDate();
        const sortedUnpaid = [...unpaidBills].sort((a, b) => {
          const diffA = (a.due_day >= currentDay) ? (a.due_day - currentDay) : (a.due_day + 31 - currentDay);
          const diffB = (b.due_day >= currentDay) ? (b.due_day - currentDay) : (b.due_day + 31 - currentDay);
          return diffA - diffB;
        });
        const nearestBill = sortedUnpaid[0];

        return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-slate-500 text-xs font-semibold">Total Tagihan Bulanan</div>
            <div class="text-xl font-black text-slate-900 mt-1">Rp${totalAmount.toLocaleString('id-ID')}</div>
            <div class="text-[11px] text-slate-500 mt-1">${(bills || []).length} tagihan rutin terdaftar</div>
          </div>
          <div class="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div class="text-emerald-700 text-xs font-semibold">Sudah Lunas Bulan Ini</div>
            <div class="text-xl font-black text-emerald-600 mt-1">Rp${paidAmount.toLocaleString('id-ID')}</div>
            <div class="text-[11px] text-emerald-700 font-bold mt-1">🟢 ${paidBills.length} tagihan terbayar</div>
          </div>
          <div class="p-4 rounded-xl bg-red-50/60 border border-red-200">
            <div class="text-red-700 text-xs font-semibold">Menunggu Pembayaran</div>
            <div class="text-xl font-black text-red-600 mt-1">Rp${unpaidAmount.toLocaleString('id-ID')}</div>
            <div class="text-[11px] text-red-700 font-bold mt-1">🔴 ${unpaidBills.length} tagihan belum dibayar</div>
          </div>
          <div class="p-4 rounded-xl bg-brand-50/60 border border-orange-200">
            <div class="text-brand-800 text-xs font-semibold">Jatuh Tempo Terdekat</div>
            <div class="text-sm font-extrabold text-brand-900 mt-1 truncate">${nearestBill ? nearestBill.name : 'Semua Lunas 🎉'}</div>
            <div class="text-[11px] text-brand-700 mt-1">${nearestBill ? 'Tgl ' + nearestBill.due_day + ' per bulan • Rp' + Number(nearestBill.amount).toLocaleString('id-ID') : 'Tidak ada tunggakan'}</div>
          </div>
        </div>
        `;
      })()}

      <!-- Daftar Tagihan List -->
      <div class="pt-2">
        <h4 class="font-bold text-slate-800 text-sm mb-3">Daftar Tagihan & Langganan Aktif</h4>
        ${(bills || []).length === 0 ? `
          <div class="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <div class="w-12 h-12 rounded-full bg-orange-100 text-brand-600 mx-auto flex items-center justify-center font-bold text-xl">
              🧾
            </div>
            <div class="font-bold text-slate-800 text-sm">Belum Ada Tagihan Terdaftar</div>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Tambahkan tagihan rutinmu seperti Listrik PLN, WiFi, Kost, BPJS, atau Netflix agar keuanganmu terpantau rapi.
            </p>
            <button onclick="openModal('addBillModal')" class="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i> Tambah Tagihan Pertama
            </button>
          </div>
        ` : `
          <div class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            ${bills.map(bill => {
              const cat = categories.find(c => c.id === bill.category_id);
              const wal = wallets.find(w => w.id === bill.wallet_id);
              const isPaid = bill.is_paid;

              return `
              <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors ${isPaid ? 'bg-slate-50/40 opacity-80' : 'bg-white'}">
                <div class="flex items-start gap-3.5">
                  <div class="w-11 h-11 rounded-2xl ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-brand-700'} flex items-center justify-center text-xl shrink-0 font-bold">
                    ${cat?.emoji || '🧾'}
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-extrabold text-slate-900 text-sm">${bill.name}</span>
                      ${isPaid
                        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Lunas Bulan Ini</span>'
                        : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">🔴 Belum Bayar</span>'
                      }
                      ${bill.auto_reminder ? '<span class="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">🔔 Reminder Aktif</span>' : ''}
                    </div>

                    <div class="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-y-1 gap-x-3">
                      <span>📅 Jatuh tempo: <b>Setiap tanggal ${bill.due_day}</b></span>
                      <span>👛 Sumber: <b>${wal?.name || 'Dompet Utama'}</b></span>
                      ${bill.notes ? `<span class="text-slate-400 italic">"${bill.notes}"</span>` : ''}
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div class="text-right">
                    <div class="text-base font-black ${isPaid ? 'text-slate-700' : 'text-slate-900'}">
                      Rp${Number(bill.amount).toLocaleString('id-ID')}
                    </div>
                    <div class="text-[10px] text-slate-400">per bulan</div>
                  </div>

                  <div class="flex items-center gap-2">
                    ${!isPaid ? `
                      <button type="button" onclick="openPayBillModal('${bill.id}', '${bill.name.replace(/'/g, "\\'")}', ${bill.amount}, '${bill.wallet_id || ''}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i> Bayar
                      </button>
                    ` : `
                      <form action="/api/bills/unpay" method="POST" class="inline">
                        <input type="hidden" name="bill_id" value="${bill.id}"/>
                        <button type="submit" title="Tandai belum dibayar" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors">
                          Batalkan
                        </button>
                      </form>
                    `}

                    <form action="/api/bills/delete" method="POST" class="inline" onsubmit="return confirm('Hapus tagihan ${bill.name}?');">
                      <input type="hidden" name="bill_id" value="${bill.id}"/>
                      <button type="submit" title="Hapus tagihan" class="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  </div>

  ${renderAddBillModal({ categories, wallets })}
  ${renderPayBillModal({ wallets })}
  ` : ''}

  <!-- TAB 2: PROFIL & FOTO UPLOAD (Part 12.3 Detail Teknis Wajib) -->
  ${activeTab === 'profile' ? `
  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
    <div>
      <h3 class="font-bold text-slate-900 text-lg">Profil Pengguna & Avatar</h3>
      <p class="text-xs text-slate-500">Upload foto profil (JPG/PNG/WebP, maks 2 MB) dan atur preferensi akun.</p>
    </div>

    <!-- Avatar Upload with Live Preview -->
    <div class="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div class="relative">
        <div id="avatarPreviewContainer">
          ${user.avatar_url ? `
            <img id="avatarImagePreview" src="${user.avatar_url}" alt="${user.full_name}" class="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-sm"/>
          ` : `
            <div id="avatarInitialPreview" class="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-rose-700 text-white font-black text-2xl flex items-center justify-center border-2 border-brand-200 shadow-sm">
              ${userInitials}
            </div>
          `}
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700">Pilih Foto Profil Baru:</label>
        <input type="file" id="avatarFileInput" accept="image/png,image/jpeg,image/webp" onchange="previewAndUploadAvatar(this)" class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"/>
        <p class="text-[11px] text-slate-400">Format: JPG, PNG, atau WebP. Ukuran maksimal 2 MB.</p>
      </div>
    </div>

    <!-- Profile Form -->
    <form action="/api/settings/profile" method="POST" class="space-y-4">
      <input type="hidden" name="avatar_url" id="avatarUrlHiddenInput" value="${user.avatar_url || ''}"/>
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
        <input type="text" name="full_name" required value="${user.full_name || ''}" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20"/>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Alamat Email</label>
        <input type="email" disabled value="${user.email || '-'}" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm"/>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Nomor HP (Kunci Link Telegram)
        </label>
        <div class="flex items-center gap-2">
          <input type="text" disabled value="${user.phone_number || '-'}" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-mono"/>
          <span class="px-3 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            ✓ Terverifikasi
          </span>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mata Uang Default</label>
        <select name="currency" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
          <option value="IDR" ${user.currency === 'IDR' ? 'selected' : ''}>IDR - Rupiah Indonesia (Rp)</option>
          <option value="USD" ${user.currency === 'USD' ? 'selected' : ''}>USD - US Dollar ($)</option>
          <option value="SGD" ${user.currency === 'SGD' ? 'selected' : ''}>SGD - Singapore Dollar (S$)</option>
        </select>
      </div>

      <div class="pt-2">
        <button type="submit" class="w-full py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all">
          Simpan Perubahan Profil
        </button>
      </div>
    </form>
  </div>
  ` : ''}

  <!-- TAB 3: REMINDER HARIAN (Part 3 & Part 4.8) -->
  ${activeTab === 'reminder' ? `
  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
    <div>
      <h3 class="font-bold text-slate-900 text-lg">⏰ Pengingat Catat Keuangan Harian</h3>
      <p class="text-xs text-slate-500">Notifikasi otomatis dikirim via Telegram (maksimal 2x per hari sesuai kebijakan produk).</p>
    </div>

    <!-- Preview Pesan Reminder (Part 4.8) -->
    <div class="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
      <div class="text-[11px] font-bold text-orange-400 uppercase tracking-widest">Preview Pesan di Telegram:</div>
      <div class="font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">
⏰ <b>Reminder Keuangan!</b>
Jangan lupa catat pengeluaran hari ini ya 📝
Pencatatan rutin = keuangan lebih terkontrol 💪
Ketik transaksimu sekarang!
      </div>
    </div>

    <form action="/api/settings/reminder" method="POST" class="space-y-5">
      <!-- Toggle ON/OFF -->
      <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <div class="font-bold text-slate-900 text-sm">Status Reminder</div>
          <div class="text-xs text-slate-500">Aktifkan pengingat rutin ke chat Telegram pribadimu</div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="enabled" value="true" ${user.daily_reminder_enabled ? 'checked' : ''} class="sr-only peer">
          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
        </label>
      </div>

      <!-- Frequency -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Frekuensi Reminder</label>
        <div class="grid grid-cols-2 gap-3">
          <label class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2 cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50">
            <input type="radio" name="frequency" value="1" ${user.daily_reminder_frequency === 1 ? 'checked' : ''} class="text-brand-600 focus:ring-brand-500"/>
            <span class="text-xs font-bold text-slate-900">1x Sehari (Malam)</span>
          </label>
          <label class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2 cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50">
            <input type="radio" name="frequency" value="2" ${user.daily_reminder_frequency === 2 ? 'checked' : ''} class="text-brand-600 focus:ring-brand-500"/>
            <span class="text-xs font-bold text-slate-900">2x Sehari (Siang & Malam)</span>
          </label>
        </div>
      </div>

      <!-- Jam Reminder -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jam Reminder 1 (WIB)</label>
          <input type="time" name="reminder_time_1" value="${user.reminder_time_1 || '20:00'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jam Reminder 2 (WIB)</label>
          <input type="time" name="reminder_time_2" value="${user.reminder_time_2 || '12:00'}" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"/>
        </div>
      </div>

      <div class="pt-2">
        <button type="submit" class="w-full py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all">
          Simpan Pengaturan Reminder
        </button>
      </div>
    </form>
  </div>
  ` : ''}

  <!-- TAB 4: KATEGORI CUSTOM (Part 3) -->
  ${activeTab === 'categories' ? `
  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">🏷️ Kelola Kategori Transaksi</h3>
        <p class="text-xs text-slate-500">Tambah atau sesuaikan kategori pengeluaran dan pemasukan dengan emoji pilihan.</p>
      </div>
      <button onclick="openModal('addCategoryModal')" class="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5">
        <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah Kategori
      </button>
    </div>

    <div class="divide-y divide-slate-100 text-xs">
      ${categories.map(c => `
        <div class="py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${c.emoji}</span>
            <div>
              <div class="font-bold text-slate-900 text-sm">${c.name}</div>
              <div class="text-slate-500">
                ${c.type === 'expense' ? `Budget Bulanan: Rp${Number(c.monthly_budget || 0).toLocaleString('id-ID')}` : 'Kategori Pemasukan'}
              </div>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.type === 'expense' ? 'bg-brand-100 text-brand-800' : 'bg-emerald-100 text-emerald-800'}">
            ${c.type.toUpperCase()}
          </span>
        </div>
      `).join('')}
    </div>
  </div>
  ${renderAddCategoryModal()}
  ` : ''}

  <!-- TAB 5: SUBSCRIPTION PLAN (Part 6) -->
  ${activeTab === 'plan' ? `
  <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl">
    <div>
      <h3 class="font-bold text-slate-900 text-lg">⭐ Paket Langganan TataDana</h3>
      <p class="text-xs text-slate-500">Pilih paket yang sesuai dengan kebutuhan pengelolaan keuangan pribadimu.</p>
    </div>

    ${user.plan_upgrade_status === 'pending_approval' ? `
    <div class="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5 mb-2">
      <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 font-bold text-lg">⏳</div>
      <div>
        <h4 class="font-extrabold text-sm text-amber-900">Permintaan Upgrade PRO Menunggu Persetujuan Superadmin</h4>
        <p class="text-xs text-amber-800 mt-1 leading-relaxed">
          Permintaan upgrade ke <b>TataDana PRO Lifetime</b> Anda telah tersambung ke antrean Superadmin. Superadmin akan meninjau pembayaran Anda sebelum paket PRO diaktifkan. Silakan tunggu konfirmasi Superadmin.
        </p>
      </div>
    </div>
    ` : ''}

    ${user.plan_upgrade_status === 'rejected' ? `
    <div class="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3.5 mb-2">
      <div class="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 flex-shrink-0 font-bold text-lg">✕</div>
      <div>
        <h4 class="font-extrabold text-sm text-rose-900">Permintaan Upgrade PRO Ditolak</h4>
        <p class="text-xs text-rose-800 mt-1 leading-relaxed">
          Permintaan upgrade Anda sebelumnya belum dapat disetujui oleh Superadmin. Silakan periksa kembali atau ajukan pembayaran baru.
        </p>
      </div>
    </div>
    ` : ''}

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Starter -->
      <div class="p-6 rounded-2xl border ${!isPro ? 'border-2 border-brand-600 bg-brand-50/20' : 'border-slate-200'} space-y-4">
        <div class="flex justify-between items-center">
          <span class="font-bold text-base text-slate-900">Paket Starter</span>
          ${!isPro ? '<span class="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">Paket Aktif</span>' : ''}
        </div>
        <div class="text-2xl font-black text-slate-900">Rp49.000<span class="text-xs text-slate-500 font-normal">/bulan</span></div>
        <ul class="text-xs space-y-2 text-slate-600">
          <li>✓ Catat transaksi via teks Telegram</li>
          <li>✓ Maksimal 50 transaksi / bulan</li>
          <li>✓ Maksimal 3 dompet & 5 budget</li>
          <li class="text-slate-400">✗ Tanpa input foto struk OCR</li>
          <li class="text-slate-400">✗ Tanpa AI Financial Advisor</li>
        </ul>
      </div>

      <!-- Pro -->
      <div class="p-6 rounded-2xl border ${isPro ? 'border-2 border-brand-600 bg-brand-50/20 shadow-md' : 'border-slate-200'} space-y-4 relative">
        <div class="flex justify-between items-center">
          <span class="font-bold text-base text-slate-900">TataDana PRO (Lifetime)</span>
          ${isPro ? '<span class="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">Paket Aktif</span>' : '<span class="text-xs font-bold text-white bg-brand-600 px-2.5 py-1 rounded-full">Hemat & Populer</span>'}
        </div>
        <div class="text-2xl font-black text-slate-900">Rp99.000<span class="text-xs text-brand-600 font-bold ml-1">Sekali Bayar</span></div>
        <ul class="text-xs space-y-2 text-slate-700 font-medium">
          <li>✓ <b>Unlimited</b> transaksi tanpa kuota</li>
          <li>✓ <b>Unlimited</b> dompet & kategori budget</li>
          <li>✓ 📸 <b>Input foto struk belanja dengan AI Vision OCR</b></li>
          <li>✓ 🤖 <b>AI Financial Advisor aktif otomatis</b></li>
          <li>✓ 📊 <b>Export unlimited PDF & Excel on-demand</b></li>
          <li>✓ Pengingat harian custom (hingga 2x/hari)</li>
        </ul>

        ${!isPro ? `
          ${user.plan_upgrade_status === 'pending_approval' ? `
            <button disabled class="w-full py-3.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2">
              <i data-lucide="clock" class="w-4 h-4"></i> Menunggu Persetujuan Superadmin
            </button>
          ` : `
            <button onclick="openModal('upgradeModal')" class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all">
              Upgrade ke PRO Sekarang (Rp99.000)
            </button>
          `}
        ` : `
          <div class="text-center p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            ✓ Akun Anda Sudah Berstatus PRO Lifetime!
          </div>
        `}
      </div>
    </div>
  </div>
  ${renderUpgradeModal()}
  ` : ''}

  <script>
    // Preview avatar upload
    function previewAndUploadAvatar(input) {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran file foto maksimal 2 MB!');
          input.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
          const container = document.getElementById('avatarPreviewContainer');
          container.innerHTML = '<img id="avatarImagePreview" src="' + e.target.result + '" class="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-sm"/>';
          document.getElementById('avatarUrlHiddenInput').value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    async function handleTestConnection() {
      const token = document.getElementById('botTokenInput').value.trim();
      const statusBadge = document.getElementById('connectionStatusBadge');
      const resultBox = document.getElementById('testResultBox');
      const testBtn = document.getElementById('testConnectionBtn');

      if (!token) {
        alert('Mohon masukkan token bot terlebih dahulu!');
        return;
      }

      statusBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">⏳ Testing...</span>';
      testBtn.disabled = true;
      testBtn.innerText = 'Menguji...';

      try {
        const res = await fetch('/api/telegram/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();

        resultBox.classList.remove('hidden');
        if (data.ok) {
          statusBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">🟢 Terhubung</span>';
          resultBox.className = 'p-4 rounded-xl text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-900';
          resultBox.innerHTML = '<b>Koneksi Sukses!</b> Bot: @' + data.bot.username + ' (' + data.bot.first_name + '). Status Webhook: ' + data.webhookStatus + '<div class="mt-2.5 pt-2 border-t border-emerald-200"><a href="/simulator" target="_blank" class="inline-flex items-center gap-1.5 font-bold text-brand-700 hover:text-brand-800 underline">🤖 Buka Tes Chat Bot Telegram &rarr;</a></div>';
        } else {
          statusBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">🔴 Tidak Terhubung</span>';
          resultBox.className = 'p-4 rounded-xl text-xs font-medium bg-red-50 border border-red-200 text-red-900';
          resultBox.innerHTML = '<b>Koneksi Gagal:</b> ' + (data.message || 'Token tidak valid menurut Telegram API.') + '<div class="mt-2.5 pt-2 border-t border-red-200 text-[11px] text-slate-600">Tetap ingin menguji fitur bot? Buka <a href="/simulator" target="_blank" class="font-bold text-brand-700 underline">Simulator Chat Bot Live</a> untuk simulasi instan tanpa token.</div>';
        }
      } catch (err) {
        statusBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">🔴 Error</span>';
        resultBox.className = 'p-4 rounded-xl text-xs font-medium bg-red-50 border border-red-200 text-red-900';
        resultBox.innerText = 'Terjadi kesalahan sistem: ' + err.message;
      } finally {
        testBtn.disabled = false;
        testBtn.innerText = 'Test Koneksi';
      }
    }

    async function togglePolling() {
      const btn = document.getElementById('pollingToggleBtn');
      const token = document.getElementById('botTokenInput').value.trim();
      const res = await fetch('/api/telegram/polling/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.isPolling) {
        btn.innerText = '⏹️ Hentikan Polling';
        btn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800';
      } else {
        btn.innerText = '▶️ Jalankan Polling Lokal';
        btn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800';
      }
    }

    function toggleManualDailyInput(isManual) {
      const el = document.getElementById('manualDailyBudgetSection');
      if (el) {
        if (isManual) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    }

    function openPayBillModal(billId, billName, amount, walletId) {
      const idInput = document.getElementById('payBillIdInput');
      const nameDisp = document.getElementById('payBillNameDisplay');
      const amtDisp = document.getElementById('payBillAmountDisplay');
      const walSel = document.getElementById('payBillWalletSelect');

      if (idInput) idInput.value = billId;
      if (nameDisp) nameDisp.innerText = billName;
      if (amtDisp) amtDisp.innerText = 'Rp' + Number(amount).toLocaleString('id-ID');
      if (walSel && walletId) walSel.value = walletId;

      openModal('payBillModal');
    }
  </script>
  `;
}

// --------------------------------------------------------------------
// MODAL COMPONENTS (Add Transaction, Transfer, Add Wallet, Upgrade)
// --------------------------------------------------------------------

function renderTransactionModal({ categories, wallets }) {
  return `
  <div id="addTxModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-150">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-900 text-lg">Catat Transaksi Manual</h3>
        <button onclick="closeModal('addTxModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form action="/api/transactions" method="POST" class="space-y-4">
        <input type="hidden" name="return_to" value=""/>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jenis Transaksi</label>
          <div class="grid grid-cols-2 gap-2">
            <label class="p-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer has-[:checked]:border-red-600 has-[:checked]:bg-red-50/50 has-[:checked]:text-red-700">
              <input type="radio" name="type" value="expense" checked class="sr-only"/>
              🔴 Pengeluaran (- Uang Berkurang)
            </label>
            <label class="p-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/50 has-[:checked]:text-emerald-700">
              <input type="radio" name="type" value="income" class="sr-only"/>
              🟢 Pemasukan (+ Uang Bertambah)
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Transaksi (Tgl, Bln, Thn)</label>
          <input type="date" name="transaction_date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-600 bg-white"/>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nominal (Rp)</label>
          <input type="number" name="amount" required placeholder="Contoh: 25000" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20"/>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Dompet (Wallet)</label>
          <select name="wallet_id" required class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
            ${(wallets || []).map(w => `<option value="${w.id}">👛 ${w.name} (Saldo: Rp${Number(w.balance || 0).toLocaleString('id-ID')})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kategori Transaksi</label>
          <select name="category_id" required class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
            <optgroup label="💸 Kategori Pengeluaran (Uang Keluar)">
              ${(categories || []).filter(c => c.type === 'expense').map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('')}
            </optgroup>
            <optgroup label="💰 Kategori Pemasukan (Uang Masuk - Gajian, dll)">
              ${(categories || []).filter(c => c.type === 'income').map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('')}
            </optgroup>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Catatan Transaksi</label>
          <input type="text" name="notes" placeholder="Contoh: Nasi Goreng Spesial" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20"/>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all">
            Simpan Transaksi
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

function renderTransferModal({ wallets }) {
  return `
  <div id="transferModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-900 text-lg">Transfer Saldo Antar Dompet</h3>
        <button onclick="closeModal('transferModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form action="/api/transactions/transfer" method="POST" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Dari Dompet Asal</label>
          <select name="source_wallet_id" required class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
            ${(wallets || []).map(w => `<option value="${w.id}">👛 ${w.name} (Saldo: Rp${Number(w.balance || 0).toLocaleString('id-ID')})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ke Dompet Tujuan</label>
          <select name="destination_wallet_id" required class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
            ${(wallets || []).map((w, idx) => `<option value="${w.id}" ${idx === 1 ? 'selected' : ''}>👛 ${w.name}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Transfer (Tgl, Bln, Thn)</label>
          <input type="date" name="transaction_date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-600 bg-white"/>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nominal Transfer (Rp)</label>
          <input type="number" name="amount" required placeholder="Contoh: 100000" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:border-brand-600"/>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Catatan Transfer</label>
          <input type="text" name="notes" placeholder="Contoh: Top up e-wallet dari BCA" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600"/>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all">
            Kirim Transfer Saldo
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

function renderAddWalletModal() {
  return `
  <div id="addWalletModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-900 text-lg">Tambah Dompet Baru</h3>
        <button onclick="closeModal('addWalletModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form action="/api/wallets/add" method="POST" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Dompet</label>
          <input type="text" name="name" required placeholder="Contoh: Bank Mandiri / ShopeePay" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600"/>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tipe Dompet</label>
          <select name="type" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
            <option value="bank">Rekening Bank (BCA, Mandiri, BRI, dll)</option>
            <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay, Dana)</option>
            <option value="cash">Uang Tunai / Cash</option>
            <option value="investment">Investasi / Tabungan Emas</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Saldo Awal (Rp)</label>
          <input type="number" name="balance" required value="0" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-brand-600"/>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all">
            Simpan Dompet
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

function renderAddCategoryModal() {
  return `
  <div id="addCategoryModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-900 text-lg">Tambah Kategori Custom</h3>
        <button onclick="closeModal('addCategoryModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form action="/api/settings/categories/add" method="POST" class="space-y-4">
        <div class="grid grid-cols-4 gap-2">
          <div class="col-span-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Emoji</label>
            <input type="text" name="emoji" required value="🏷️" class="w-full px-3 py-3 rounded-xl border border-slate-200 text-center text-xl focus:outline-none focus:border-brand-600"/>
          </div>
          <div class="col-span-3">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Kategori</label>
            <input type="text" name="name" required placeholder="Contoh: Belanja Online" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600"/>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jenis Kategori</label>
          <select name="type" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-600 bg-white">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Budget Bulanan (Rp) - Khusus Pengeluaran</label>
          <input type="number" name="monthly_budget" value="500000" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-600"/>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all">
            Tambah Kategori
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

function renderUpgradeModal() {
  return `
  <div id="upgradeModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span class="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full uppercase">Upgrade Pro</span>
          <h3 class="font-extrabold text-slate-900 text-lg mt-1">Metode Pembayaran</h3>
        </div>
        <button onclick="closeModal('upgradeModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 bg-brand-50 rounded-2xl border border-brand-200 flex justify-between items-center">
        <div>
          <div class="text-xs text-brand-900 font-bold">TataDana PRO (Lifetime Akses)</div>
          <div class="text-[11px] text-slate-500">Akses tanpa batas seumur hidup</div>
        </div>
        <div class="text-lg font-black text-brand-700">Rp99.000</div>
      </div>

      <form action="/api/payments/checkout" method="POST" class="space-y-4">
        <input type="hidden" name="plan" value="pro"/>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih Jalur Pembayaran:</label>
          <div class="space-y-2">
            <label class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50">
              <div class="flex items-center gap-2.5">
                <input type="radio" name="payment_type" value="midtrans" checked class="text-brand-600"/>
                <div>
                  <div class="font-bold text-xs text-slate-900">Midtrans Gateway Otomatis</div>
                  <div class="text-[11px] text-slate-500">QRIS (GoPay/ShopeePay), Virtual Account BCA/Mandiri</div>
                </div>
              </div>
              <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Instan</span>
            </label>

            <label class="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50">
              <div class="flex items-center gap-2.5">
                <input type="radio" name="payment_type" value="manual_transfer" class="text-brand-600"/>
                <div>
                  <div class="font-bold text-xs text-slate-900">Transfer Bank Manual</div>
                  <div class="text-[11px] text-slate-500">Verifikasi manual oleh Superadmin</div>
                </div>
              </div>
              <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Manual</span>
            </label>
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all">
            Lanjutkan ke Pembayaran (Rp99.000)
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

function renderAddBillModal({ categories, wallets }) {
  return `
  <div id="addBillModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-150">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span class="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full uppercase">Tagihan Rutin</span>
          <h3 class="font-extrabold text-slate-900 text-lg mt-1">Tambah Tagihan Baru</h3>
        </div>
        <button onclick="closeModal('addBillModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form action="/api/bills/create" method="POST" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Tagihan</label>
          <input type="text" name="name" required placeholder="Contoh: Listrik PLN, WiFi Biznet, Kost" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20"/>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nominal (Rp)</label>
            <input type="number" name="amount" required placeholder="Contoh: 350000" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-600"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jatuh Tempo (Tgl)</label>
            <select name="due_day" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-brand-600 bg-white">
              ${Array.from({ length: 31 }, (_, i) => i + 1).map(d => `<option value="${d}" ${d === 10 ? 'selected' : ''}>Tgl ${d} per bulan</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kategori Transaksi</label>
          <select name="category_id" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-600 bg-white">
            ${categories.filter(c => c.type === 'expense').map(c => `<option value="${c.id}" ${c.name.toLowerCase().includes('tagihan') ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Dompet Sumber Pembayaran</label>
          <select name="wallet_id" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-600 bg-white">
            ${wallets.map(w => `<option value="${w.id}" ${w.is_default ? 'selected' : ''}>👛 ${w.name} (Saldo: Rp${Number(w.balance || 0).toLocaleString('id-ID')})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nomor Pelanggan / Catatan</label>
          <input type="text" name="notes" placeholder="Contoh: No. Meter 51234892019" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"/>
        </div>

        <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input type="checkbox" id="addBillReminderCheck" name="auto_reminder" value="true" checked class="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"/>
          <label for="addBillReminderCheck" class="text-xs text-slate-700 font-semibold cursor-pointer">
            Kirim pengingat otomatis via Telegram H-3 & H-1 sebelum jatuh tempo
          </label>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all">
            Simpan Tagihan Baru
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

function renderPayBillModal({ wallets }) {
  return `
  <div id="payBillModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-150">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Konfirmasi Pembayaran</span>
          <h3 class="font-extrabold text-slate-900 text-lg mt-1">Bayar Tagihan Rutin</h3>
        </div>
        <button onclick="closeModal('payBillModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
        <div>
          <div id="payBillNameDisplay" class="text-xs font-bold text-emerald-950">Nama Tagihan</div>
          <div class="text-[11px] text-emerald-700">Status akan ditandai Lunas bulan ini</div>
        </div>
        <div id="payBillAmountDisplay" class="text-lg font-black text-emerald-700">Rp0</div>
      </div>

      <form action="/api/bills/pay" method="POST" class="space-y-4">
        <input type="hidden" name="bill_id" id="payBillIdInput" value=""/>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Potong Saldo dari Dompet:</label>
          <select name="wallet_id" id="payBillWalletSelect" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-600 bg-white">
            ${wallets.map(w => `<option value="${w.id}">👛 ${w.name} (Saldo: Rp${Number(w.balance || 0).toLocaleString('id-ID')})</option>`).join('')}
          </select>
        </div>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
          <input type="checkbox" id="recordTxCheckbox" name="record_tx" value="true" checked class="mt-0.5 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"/>
          <label for="recordTxCheckbox" class="text-xs text-slate-700 cursor-pointer leading-relaxed">
            <b>Catat otomatis sebagai transaksi pengeluaran</b> dan kurangi saldo dompet terpilih secara instan.
          </label>
        </div>

        <div class="pt-2 flex gap-3">
          <button type="button" onclick="closeModal('payBillModal')" class="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs transition-colors">
            Batal
          </button>
          <button type="submit" class="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-xs transition-all">
            Konfirmasi Bayar
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}
