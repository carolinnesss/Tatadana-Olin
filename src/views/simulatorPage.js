// ====================================================================
// TataDana - Telegram Bot Live Simulator Page
// Provides realistic Telegram Chat UI directly in browser
// Enables instant testing of Natural NLP, Voice Note STT, and Receipt OCR
// ====================================================================

export function renderSimulatorPage({ user, wallets = [] }) {
  return `
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          🤖 Simulasi Interaktif Bot Telegram
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Uji coba langsung parsing teks natural, foto struk OCR, dan pesan suara tanpa perlu membuka aplikasi Telegram.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          🟢 Engine Online
        </span>
      </div>
    </div>

    <!-- Quick Pill Commands (Part 4.6 & Payment Methods & Transfers & Period Filters) -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2 text-xs">
      <span class="font-bold text-slate-500 mr-1">Contoh Cepat:</span>
      <button onclick="sendQuickMessage('tes chat bot telegram')" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-mono font-bold flex items-center gap-1 border border-emerald-300 shadow-2xs">
        ⚡ "tes chat bot"
      </button>
      <button onclick="sendQuickMessage('halo')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        👋 "halo"
      </button>
      <button onclick="sendQuickMessage('/hari ini')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /hari ini
      </button>
      <button onclick="sendQuickMessage('/kemarin')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /kemarin
      </button>
      <button onclick="sendQuickMessage('/7 hari')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /7 hari
      </button>
      <button onclick="sendQuickMessage('/30 hari')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /30 hari
      </button>
      <button onclick="sendQuickMessage('/bulan ini')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /bulan ini
      </button>
      <button onclick="sendQuickMessage('/bulan lalu')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /bulan lalu
      </button>
      <button onclick="sendQuickMessage('/tahun ini')" class="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-700 rounded-lg font-mono font-semibold">
        /tahun ini
      </button>
      <button onclick="sendQuickMessage('/jatah')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-mono font-bold flex items-center gap-1">
        🎯 /jatah
      </button>
      <button onclick="sendQuickMessage('/saldo')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono font-semibold">
        /saldo
      </button>
      <button onclick="sendQuickMessage('/budget')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono font-semibold">
        /budget
      </button>
      <button onclick="sendQuickMessage('beli bakso 15rb pake gopay')" class="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-semibold flex items-center gap-1">
        📱 "beli bakso 15rb pake gopay"
      </button>
      <button onclick="sendQuickMessage('kopi 25k via bca')" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold flex items-center gap-1">
        🏦 "kopi 25k via bca"
      </button>
      <button onclick="sendQuickMessage('makan siang 35rb cash')" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold flex items-center gap-1">
        💵 "makan siang 35rb cash"
      </button>
      <button onclick="sendQuickMessage('transfer 50rb dari bca ke gopay')" class="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold flex items-center gap-1">
        ⇄ "transfer 50rb bca ke gopay"
      </button>
      <button onclick="sendQuickMessage('top up dana 100rb dari mandiri')" class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1">
        ⇄ "top up dana 100rb dari mandiri"
      </button>
      <button onclick="sendQuickMessage('gajian 5jt')" class="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg font-semibold">
        💰 "gajian 5jt"
      </button>
      <button onclick="simulateReceiptPhoto()" class="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold flex items-center gap-1">
        📸 Struk
      </button>
      <button onclick="simulateVoiceNote()" class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold flex items-center gap-1">
        🎙️ Voice Note
      </button>
    </div>

    <!-- Telegram Phone Mockup Box -->
    <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[640px]">
      <!-- Telegram Header -->
      <div class="bg-slate-800/90 border-b border-slate-700/80 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-rose-700 flex items-center justify-center text-white font-extrabold shadow-md">
            TD
          </div>
          <div>
            <div class="text-white font-bold text-sm">TataDana Official Bot ⚡</div>
            <div class="text-xs text-emerald-400">bot aktif • waktu WIB (Asia/Jakarta)</div>
          </div>
        </div>
        <div class="text-xs text-slate-400">
          Akun: <b class="text-slate-200">${user.full_name || 'User'}</b> (${user.plan.toUpperCase()})
        </div>
      </div>

      <!-- Chat Stream Body -->
      <div id="chatMessages" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-sans custom-scrollbar">
        <!-- Initial Welcome Message -->
        <div class="flex justify-start">
          <div class="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-md border border-slate-700/80 leading-relaxed shadow-sm">
            🤖 <b>Halo ${user.full_name || 'Kawan'}! Selamat datang di TataDana Bot.</b><br/><br/>
            💳 <b>Pilihan Metode Pembayaran & Transfer:</b><br/>
            • <b>E-Wallet:</b> Ketik <i>"beli bakso 15rb pake gopay"</i> / <i>"kopi 20k ovo"</i> / <i>"bensin 30k dana"</i>.<br/>
            • <b>Rekening Bank:</b> Ketik <i>"makan 45k via bca"</i> / <i>"belanja 120k mandiri"</i>.<br/>
            • <b>Tunai (Cash):</b> Ketik <i>"parkir 5rb cash"</i>.<br/>
            • <b>Transfer / Top Up Saldo:</b> Ketik <i>"transfer 50rb bca ke gopay"</i> atau <code>/transfer 50000 bca gopay</code>.<br/><br/>
            💡 <i>Gunakan tombol pilihan metode pembayaran di bawah untuk memilih metode secara cepat!</i>
          </div>
        </div>
      </div>

      <!-- Payment Method Selection Bar (Chip Selector Dinamis dari Wallets User - Context 7) -->
      <div id="pmChipBar" class="bg-slate-800/95 px-4 py-2 border-t border-slate-700/80 flex items-center gap-1.5 overflow-x-auto text-xs custom-scrollbar">
        <span class="text-slate-400 font-bold whitespace-nowrap text-[11px] mr-1 flex items-center gap-1">
          <span>👛 Metode:</span>
        </span>
        <button type="button" onclick="selectPaymentMethod('')" id="pmBtn-default" class="pm-chip px-2.5 py-1 rounded-lg bg-brand-600 text-white font-bold whitespace-nowrap text-[11px] shadow-sm transition-all">
          Default (Utama)
        </button>
        ${wallets.map(w => {
          let icon = '👛';
          if (w.type === 'ewallet') icon = '📱';
          else if (w.type === 'bank') icon = '🏦';
          else if (w.type === 'cash') icon = '💵';
          const safeKey = (w.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanName = (w.name || '').replace(/'/g, "\\'");
          return `
          <button type="button" onclick="selectPaymentMethod('${cleanName.toLowerCase()}')" id="pmBtn-${safeKey}" class="pm-chip px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 hover:text-white font-medium whitespace-nowrap text-[11px] transition-all">
            ${icon} ${w.name}
          </button>
          `;
        }).join('')}
        <button type="button" onclick="openModal('addWalletSimModal')" class="ml-2 px-3 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/40 font-bold whitespace-nowrap text-[11px] transition-all flex items-center gap-1 flex-shrink-0" title="Kelola dan tambah metode pembayaran / e-wallet baru">
          <span>+ Tambah Dompet / E-Wallet Baru</span>
        </button>
        <a href="/wallets" class="px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0" title="Kelola dompet di halaman /wallets">
          <span>Kelola ↗</span>
        </a>
      </div>

      <!-- Chat Input Bar -->
      <div class="bg-slate-800/90 border-t border-slate-700/80 p-4">
        <form id="chatForm" onsubmit="handleSendMessage(event)" class="flex items-center gap-3">
          <input type="text" id="chatInput" placeholder="Ketik pesan transaksi (misal: beli sate 30rb atau transfer 50rb bca ke gopay)..." class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-sans"/>
          <button type="button" onclick="simulateVoiceNote()" title="Simulasi Voice Note" class="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            <i data-lucide="mic" class="w-4 h-4 text-amber-400"></i>
          </button>
          <button type="button" onclick="simulateReceiptPhoto()" title="Simulasi Foto Struk" class="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            <i data-lucide="camera" class="w-4 h-4 text-purple-400"></i>
          </button>
          <button type="submit" id="chatSubmitBtn" class="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-colors">
            Kirim
          </button>
        </form>
      </div>
    </div>

    <!-- Modal Tambah Dompet Langsung di Simulator (User Request #7) -->
    <div id="addWalletSimModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full uppercase">Metode Pembayaran</span>
            <h3 class="font-extrabold text-slate-900 text-base mt-1">Tambah Dompet / E-Wallet Baru</h3>
          </div>
          <button type="button" onclick="closeModal('addWalletSimModal')" class="text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form id="addWalletSimForm" onsubmit="handleQuickAddWallet(event)" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Dompet / E-Wallet</label>
            <input type="text" id="simWalletName" required placeholder="Contoh: GoPay, DANA, BCA, Seabank" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 font-sans"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipe Pembayaran</label>
            <select id="simWalletType" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 bg-white font-sans">
              <option value="ewallet">📱 E-Wallet (GoPay, OVO, DANA, ShopeePay)</option>
              <option value="bank">🏦 Rekening Bank (BCA, Mandiri, BRI, BNI)</option>
              <option value="cash">💵 Tunai (Cash / Uang Saku)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Saldo Awal (Rp)</label>
            <input type="number" id="simWalletBalance" placeholder="0" min="0" value="0" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 font-sans"/>
          </div>

          <p class="text-[11px] text-slate-500">
            💡 Dompet yang ditambahkan akan otomatis tersinkron ke Telegram Bot & Simulator secara instan.
          </p>

          <div class="pt-2">
            <button type="submit" id="simAddWalletSubmitBtn" class="w-full py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 text-xs transition-all">
              Simpan & Sambungkan ke Bot
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script>
    const chatContainer = document.getElementById('chatMessages');
    let currentSelectedPaymentMethod = '';
    let isSubmitting = false;

    function selectPaymentMethod(methodKey) {
      currentSelectedPaymentMethod = methodKey;
      document.querySelectorAll('.pm-chip').forEach(btn => {
        btn.className = 'pm-chip px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 hover:text-white font-medium whitespace-nowrap text-[11px] transition-all';
      });

      const safeKey = methodKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      const activeBtn = document.getElementById(safeKey ? 'pmBtn-' + safeKey : 'pmBtn-default');
      if (activeBtn) {
        activeBtn.className = 'pm-chip px-2.5 py-1 rounded-lg bg-brand-600 text-white font-bold whitespace-nowrap text-[11px] shadow-sm ring-2 ring-brand-400/30 transition-all';
      }

      const input = document.getElementById('chatInput');
      if (input && methodKey && input.value.trim() && !input.value.toLowerCase().includes(methodKey.toLowerCase())) {
        input.value = input.value.trim() + ' pake ' + methodKey;
        input.focus();
      }
    }

    function appendUserMessage(html) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex justify-end';
      msgDiv.innerHTML = '<div class="bg-brand-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-md shadow-sm">' + html + '</div>';
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function appendBotMessage(html) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex justify-start';
      msgDiv.innerHTML = '<div class="bg-slate-800 text-slate-100 p-4 rounded-2xl rounded-tl-none max-w-md border border-slate-700 leading-relaxed shadow-sm whitespace-pre-line font-sans">' + html + '</div>';
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendQuickMessage(text) {
      const input = document.getElementById('chatInput');
      if (input) input.value = text;
      handleSendMessage();
    }

    async function handleSendMessage(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (isSubmitting) return;

      const input = document.getElementById('chatInput');
      const submitBtn = document.getElementById('chatSubmitBtn');
      let text = (input ? input.value : '').trim();
      if (!text) return;

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }

      // Smart payment method injection only for actual transaction text, never for testing/greeting/command messages
      const isConversational = /^(tes|test|testing|cek|check|ping|p|halo|hai|hi|hey|assalamualaikum|bantuan|help|panduan|menu|saldo|jatah|budget|hari ini|kemarin|7 hari|30 hari|bulan ini|bulan lalu|tahun ini)(\b.*)?$/i.test(text);
      if (currentSelectedPaymentMethod && !text.startsWith('/') && !isConversational && !/(pake|pakai|via|lewat|dari|ke|dengan)\s+/i.test(text)) {
        text = text + ' pake ' + currentSelectedPaymentMethod;
      }

      appendUserMessage(text);
      if (input) input.value = '';

      try {
        const res = await fetch('/api/telegram/simulate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'text', text })
        });
        const data = await res.json();
        if (data && data.reply) {
          appendBotMessage(data.reply);
          if (data.reply.includes('Dompet Berhasil Ditambahkan!')) {
            const matchName = data.reply.match(/Nama\s*:\s*👛\s*<b>([^<]+)<\/b>/i);
            const matchType = data.reply.match(/Tipe\s*:\s*([^\n]+)/i);
            if (matchName) {
              const wName = matchName[1].trim();
              const wType = (matchType && matchType[1].toLowerCase().includes('bank')) ? 'bank' : ((matchType && matchType[1].toLowerCase().includes('cash')) ? 'cash' : 'ewallet');
              addChipToBar(wName, wType);
            }
          }
        } else {
          appendBotMessage('❌ Terjadi kesalahan pada bot: ' + ((data && data.error) || 'Server tidak merespon'));
        }
      } catch (err) {
        appendBotMessage('❌ Error koneksi ke server: ' + err.message);
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        if (input) input.focus();
      }
    }

    async function handleQuickAddWallet(e) {
      if (e) e.preventDefault();
      const nameInput = document.getElementById('simWalletName');
      const typeInput = document.getElementById('simWalletType');
      const balInput = document.getElementById('simWalletBalance');
      const submitBtn = document.getElementById('simAddWalletSubmitBtn');

      const name = nameInput.value.trim();
      const type = typeInput.value;
      const balance = Number(balInput.value) || 0;

      if (!name) return;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Menyambungkan...'; }

      try {
        const res = await fetch('/api/wallets/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, type, balance })
        });
        const data = await res.json();
        if (data.ok || data.success) {
          const w = data.wallet || { name, type, balance };
          addChipToBar(w.name, w.type);
          closeModal('addWalletSimModal');
          nameInput.value = '';
          balInput.value = '0';
          appendBotMessage('🎉 <b>Dompet Baru Tersambung!</b>\nMetode 👛 <b>' + w.name + '</b> (' + w.type.toUpperCase() + ') saldo Rp' + Number(w.balance || 0).toLocaleString('id-ID') + ' telah berhasil ditambahkan dan otomatis aktif di Chatbot AI & Bot Telegram kamu!');
        } else {
          alert('Gagal menambah dompet: ' + (data.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        alert('Gagal menghubungi server: ' + err.message);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Simpan & Sambungkan ke Bot'; }
      }
    }

    function addChipToBar(name, type) {
      const chipBar = document.getElementById('pmChipBar');
      if (!chipBar) return;
      let icon = '👛';
      if (type === 'ewallet') icon = '📱';
      else if (type === 'bank') icon = '🏦';
      else if (type === 'cash') icon = '💵';
      const safeKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (document.getElementById('pmBtn-' + safeKey)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'pmBtn-' + safeKey;
      btn.className = 'pm-chip px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 hover:text-white font-medium whitespace-nowrap text-[11px] transition-all';
      btn.onclick = () => selectPaymentMethod(name.toLowerCase());
      btn.innerHTML = icon + ' ' + name;

      const addBtn = chipBar.querySelector('button[onclick*="addWalletSimModal"]');
      if (addBtn) {
        chipBar.insertBefore(btn, addBtn);
      } else {
        chipBar.appendChild(btn);
      }
      selectPaymentMethod(name.toLowerCase());
    }

    async function simulateReceiptPhoto() {
      if (isSubmitting) return;
      isSubmitting = true;
      appendUserMessage('📸 [Foto Struk Belanja Supermarket]');
      try {
        const res = await fetch('/api/telegram/simulate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'photo' })
        });
        const data = await res.json();
        if (data.reply) {
          appendBotMessage(data.reply);
        }
      } catch (err) {
        appendBotMessage('❌ Gagal memproses struk: ' + err.message);
      } finally {
        isSubmitting = false;
      }
    }

    async function simulateVoiceNote() {
      if (isSubmitting) return;
      isSubmitting = true;
      appendUserMessage('🎙️ [Pesan Suara / Voice Note 0:08]');
      try {
        const res = await fetch('/api/telegram/simulate-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'voice' })
        });
        const data = await res.json();
        if (data.reply) {
          appendBotMessage(data.reply);
        }
      } catch (err) {
        appendBotMessage('❌ Gagal memproses suara: ' + err.message);
      } finally {
        isSubmitting = false;
      }
    }
  </script>
  `;
}
