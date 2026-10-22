// ====================================================================
// TataDana - Superadmin Dashboard & Dedicated Admin Portal (Part 10)
// AI Provider config (Gemini/GPT/DeepSeek), User Impersonation,
// Registration Approvals, Pro Upgrade Approvals, AI Logs, & Audit Logs
// ====================================================================

export function renderAdminDashboard({ users, aiProviders, aiLogs, payments, auditLogs }) {
  const pendingUsers = (users || []).filter(u => u.approval_status === 'pending');
  const pendingUpgrades = (users || []).filter(u => u.plan_upgrade_status === 'pending_approval' || (payments || []).some(p => p.user_id === u.id && p.status === 'pending'));

  return `
  <!-- Admin Header Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-purple-600"></i> Superadmin Portal
        </span>
        ${pendingUsers.length > 0 ? `
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            ${pendingUsers.length} Pendaftaran Baru Menunggu
          </span>
        ` : ''}
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Superadmin Control Center (Admin Control Center)</h1>
      <p class="text-sm text-slate-500">Persetujuan pendaftaran user, upgrade PRO, impersonasi pengguna, konfigurasi AI & audit log.</p>
    </div>

    <!-- Quick Impersonation Dropdown, Export & Logout -->
    <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      <a href="/api/admin/export-users" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm">
        <i data-lucide="download" class="w-3.5 h-3.5 text-brand-600"></i> Export Data User
      </a>
      <div class="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <span class="text-xs font-bold text-slate-500 pl-1">Impersonasi:</span>
        <select onchange="if(this.value) window.location.href='/api/admin/impersonate?userId=' + this.value" class="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg">
          <option value="">Pilih Pengguna...</option>
          ${users.map(u => `<option value="${u.id}">${u.full_name} (${u.plan.toUpperCase()})</option>`).join('')}
        </select>
      </div>
      <a href="/api/auth/logout" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-all" title="Keluar dari sesi Superadmin">
        <i data-lucide="log-out" class="w-3.5 h-3.5 text-rose-600"></i> Keluar
      </a>
    </div>
  </div>

  <!-- 1. ANTREAN PERSETUJUAN REGISTRASI AKUN (User Request #2) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-900 text-lg">📝 Antrean Persetujuan Registrasi Akun Pengguna Baru</h3>
          <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full ${pendingUsers.length > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'}">
            ${pendingUsers.length} Menunggu Persetujuan
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">Pengguna baru tidak dapat langsung masuk ke dashboard sebelum disetujui atau di-impersonate oleh Superadmin.</p>
      </div>
    </div>

    ${pendingUsers.length === 0 ? `
      <div class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
        <i data-lucide="check-circle-2" class="w-8 h-8 text-emerald-500 mx-auto mb-2"></i>
        <div class="text-sm font-bold text-slate-700">Semua Pendaftaran Akun Telah Diproses</div>
        <div class="text-xs text-slate-400 mt-1">Tidak ada akun baru yang sedang menunggu persetujuan Superadmin saat ini.</div>
      </div>
    ` : `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3">Nama Pengguna</th>
              <th class="px-4 py-3">Kontak (Email / No HP)</th>
              <th class="px-4 py-3">Waktu Daftar</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-center">Aksi Superadmin</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${pendingUsers.map(u => `
              <tr class="hover:bg-slate-50/70">
                <td class="px-4 py-3">
                  <div class="font-bold text-slate-900 text-sm">${u.full_name}</div>
                  <div class="text-[11px] text-slate-400 font-mono">ID: ${u.id.slice(0, 12)}...</div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div>${u.email || '-'}</div>
                  <div class="font-mono text-[11px] text-slate-500">${u.phone_number || '-'}</div>
                </td>
                <td class="px-4 py-3 text-slate-500 whitespace-nowrap">
                  ${new Date(u.created_at || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    ⏳ Menunggu Persetujuan
                  </span>
                </td>
                <td class="px-4 py-3 text-center space-x-1.5 whitespace-nowrap">
                  <button onclick="approveUser('${u.id}', '${u.full_name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all">
                    ✓ Setujui Akun
                  </button>
                  <button onclick="rejectUser('${u.id}', '${u.full_name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all">
                    ✕ Tolak
                  </button>
                  <a href="/api/admin/impersonate?userId=${u.id}" class="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> Impersonate
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  </div>

  <!-- 2. ANTREAN PERMINTAAN UPGRADE PRO & IMPERSONASI (User Request #3) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-900 text-lg">⭐ Antrean Permintaan Upgrade PRO & Impersonate</h3>
          <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full ${pendingUpgrades.length > 0 ? 'bg-brand-100 text-brand-800 border border-brand-200' : 'bg-slate-100 text-slate-600'}">
            ${pendingUpgrades.length} Permintaan Aktif
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">User yang ingin bayar atau upgrade PRO harus menunggu impersonate dan persetujuan dari Superadmin.</p>
      </div>
    </div>

    ${pendingUpgrades.length === 0 ? `
      <div class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
        <i data-lucide="sparkles" class="w-8 h-8 text-brand-500 mx-auto mb-2"></i>
        <div class="text-sm font-bold text-slate-700">Tidak Ada Antrean Upgrade PRO</div>
        <div class="text-xs text-slate-400 mt-1">Semua permintaan langganan PRO telah diproses atau pengguna sudah aktif.</div>
      </div>
    ` : `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3">Pengguna</th>
              <th class="px-4 py-3">Paket Diminta</th>
              <th class="px-4 py-3">Nominal Biaya</th>
              <th class="px-4 py-3">Metode Bayar</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-center">Aksi Superadmin</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${pendingUpgrades.map(u => {
              const userPayment = (payments || []).find(p => p.user_id === u.id && p.status === 'pending');
              const paymentMethod = userPayment ? userPayment.payment_type : 'Midtrans / Transfer';
              const paymentId = userPayment ? userPayment.id : '';
              return `
              <tr class="hover:bg-slate-50/70">
                <td class="px-4 py-3">
                  <div class="font-bold text-slate-900 text-sm">${u.full_name}</div>
                  <div class="text-slate-500 text-[11px]">${u.email || u.phone_number}</div>
                  <div class="text-[10px] text-slate-400">Plan saat ini: <span class="uppercase font-bold">${u.plan}</span></div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-brand-100 text-brand-800 border border-brand-200">
                    ⭐ TataDana PRO Lifetime
                  </span>
                </td>
                <td class="px-4 py-3 font-bold text-slate-900 text-sm">
                  Rp99.000
                </td>
                <td class="px-4 py-3 text-slate-600 capitalize">
                  ${paymentMethod}
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Menunggu Approval
                  </span>
                </td>
                <td class="px-4 py-3 text-center space-x-1.5 whitespace-nowrap">
                  <button onclick="approveUpgrade('${u.id}', '${paymentId}', '${u.full_name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all">
                    ✓ Setujui & Aktifkan PRO
                  </button>
                  <button onclick="rejectUpgrade('${u.id}', '${paymentId}', '${u.full_name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all">
                    ✕ Tolak
                  </button>
                  <a href="/api/admin/impersonate?userId=${u.id}" class="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1">
                    <i data-lucide="user-check" class="w-3.5 h-3.5"></i> Impersonate User
                  </a>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `}
  </div>

  <!-- 3. AI PROVIDER MANAGEMENT (Part 10 & Part 2) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">🤖 Konfigurasi AI Provider (Gemini / OpenAI / DeepSeek)</h3>
        <p class="text-xs text-slate-500">Kelola mode 'Single' atau 'Parallel Failover'. API key disimpan terenkripsi di database.</p>
      </div>
      <span class="text-xs font-bold bg-brand-100 text-brand-800 px-3 py-1 rounded-full border border-brand-200">
        Mode Aktif: Parallel Failover
      </span>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      ${aiProviders.map(p => `
        <div class="p-5 rounded-2xl border ${p.is_primary ? 'border-2 border-brand-600 bg-brand-50/20' : 'border-slate-200 bg-white'} space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">${p.provider_name === 'gemini' ? '✨' : p.provider_name === 'openai' ? '🧠' : '⚡'}</span>
              <h4 class="font-bold text-slate-900 uppercase text-sm">${p.provider_name}</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">
              ${p.is_active ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          <div class="space-y-1.5 text-xs text-slate-600">
            <div>Model: <b class="text-slate-900">${p.model_name}</b></div>
            <div>Peran: <b class="${p.is_primary ? 'text-brand-600' : 'text-slate-500'}">${p.is_primary ? 'Primary Engine' : 'Secondary Fallback'}</b></div>
            <div>Key: <code class="bg-slate-100 px-1 py-0.5 rounded text-[10px]">••••••••${(p.api_key_encrypted || '').slice(-4)}</code></div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button onclick="editProviderKeyPrompt('${p.provider_name}')" class="font-semibold text-brand-600 hover:underline">
              Ganti Token API
            </button>
            <span class="text-[11px] text-slate-400">Mode: ${p.mode}</span>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- 4. RIWAYAT PEMBAYARAN MIDTRANS & MANUAL (Part 10 & Part 6) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">💳 Semua Riwayat Transaksi Pembayaran</h3>
        <p class="text-xs text-slate-500">Log lengkap transaksi Midtrans otomatis dan transfer manual.</p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3">Order ID</th>
            <th class="px-4 py-3">User ID</th>
            <th class="px-4 py-3">Paket</th>
            <th class="px-4 py-3">Nominal</th>
            <th class="px-4 py-3">Metode</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-center">Status Pembayaran</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${payments.map(pm => `
            <tr class="hover:bg-slate-50/70">
              <td class="px-4 py-3 font-mono font-semibold">${pm.order_id}</td>
              <td class="px-4 py-3 text-slate-600 font-mono">${pm.user_id.slice(0, 8)}...</td>
              <td class="px-4 py-3 font-bold uppercase text-brand-600">${pm.plan}</td>
              <td class="px-4 py-3 font-semibold">Rp${Number(pm.amount).toLocaleString('id-ID')}</td>
              <td class="px-4 py-3 text-slate-500 capitalize">${pm.payment_type}</td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${pm.status === 'settlement' || pm.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : pm.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}">
                  ${pm.status}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                ${pm.status === 'pending' ? `
                  <button onclick="approvePayment('${pm.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors">Approve</button>
                  <button onclick="rejectPayment('${pm.id}')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px] transition-colors">Reject</button>
                ` : `<span class="text-slate-400 font-medium capitalize">${pm.status === 'settlement' || pm.status === 'approved' ? 'Telah Diterima' : pm.status}</span>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 5. AI CALL LOGS & COST MONITORING (Part 10) -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
    <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
      <div>
        <h3 class="font-bold text-slate-900 text-lg">📊 Log Panggilan AI (Monitoring Latensi & Biaya)</h3>
        <p class="text-xs text-slate-500">Mencatat setiap pemanggilan parsing teks, transkripsi VN, OCR foto struk, dan financial advisor.</p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3">Waktu</th>
            <th class="px-4 py-3">Provider</th>
            <th class="px-4 py-3">Action Type</th>
            <th class="px-4 py-3">Tokens In/Out</th>
            <th class="px-4 py-3">Latency</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-mono">
          ${aiLogs.map(log => `
            <tr class="hover:bg-slate-50">
              <td class="px-4 py-3 text-slate-500">${new Date(log.created_at).toLocaleTimeString('id-ID')}</td>
              <td class="px-4 py-3 font-bold text-brand-700 uppercase">${log.provider}</td>
              <td class="px-4 py-3 text-slate-700">${log.action_type}</td>
              <td class="px-4 py-3">${log.prompt_tokens} / ${log.response_tokens}</td>
              <td class="px-4 py-3 font-semibold ${log.latency_ms > 800 ? 'text-amber-600' : 'text-emerald-600'}">${log.latency_ms}ms</td>
              <td class="px-4 py-3">
                <span class="text-[10px] px-2 py-0.5 rounded font-bold ${log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                  ${log.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 6. USER MANAGEMENT & AUDIT LOGS (Part 10) -->
  <div class="grid lg:grid-cols-2 gap-6">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 class="font-bold text-slate-900 text-base mb-4">Daftar Pengguna TataDana</h3>
      <div class="divide-y divide-slate-100 text-xs">
        ${users.map(u => `
          <div class="py-3 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-900 flex items-center gap-1.5">
                ${u.full_name}
                ${u.approval_status === 'pending' ? '<span class="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">Pending</span>' : ''}
              </div>
              <div class="text-slate-500">${u.email} • ${u.phone_number || '-'}</div>
            </div>
            <div class="text-right flex items-center gap-2">
              <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${u.plan === 'pro' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-600'}">
                ${u.plan.toUpperCase()}
              </span>
              <button onclick="viewUserTransactions('${u.id}', '${u.full_name.replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors">
                Lihat Transaksi
              </button>
              <a href="/api/admin/impersonate?userId=${u.id}" class="px-2.5 py-1 bg-purple-50 text-purple-700 rounded text-[11px] font-bold hover:bg-purple-100 transition-colors">
                Masuk
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 class="font-bold text-slate-900 text-base mb-4">Audit Log Akses Admin (Compliance)</h3>
      <div id="adminAuditLogContainer" class="divide-y divide-slate-100 text-xs">
        ${auditLogs.map(a => `
          <div class="py-3">
            <div class="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Action: <b class="text-brand-700">${a.action}</b></span>
              <span>${new Date(a.created_at).toLocaleTimeString('id-ID')}</span>
            </div>
            <div class="text-slate-700 mt-1 font-mono text-[11px] truncate">
              ${JSON.stringify(a.details)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- MODAL LIHAT TRANSAKSI USER (Part 10 - Support Audit Log) -->
  <div id="adminTxModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span class="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Support Troubleshooting</span>
          <h3 id="adminTxModalTitle" class="font-extrabold text-slate-900 text-lg mt-1">Transaksi Pengguna</h3>
        </div>
        <button onclick="closeModal('adminTxModal')" class="text-slate-400 hover:text-slate-700">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <i data-lucide="shield-alert" class="w-4 h-4 text-amber-600 flex-shrink-0"></i>
        <span><b>Catatan Privasi:</b> Akses data transaksi ini secara otomatis dicatat ke dalam Compliance Audit Log sistem.</span>
      </div>

      <div class="overflow-y-auto max-h-80 border border-slate-100 rounded-xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
            <tr>
              <th class="px-4 py-2.5">Tanggal (Tgl, Bln, Thn)</th>
              <th class="px-4 py-2.5">Jenis</th>
              <th class="px-4 py-2.5">Kategori</th>
              <th class="px-4 py-2.5">Catatan</th>
              <th class="px-4 py-2.5">Sumber Transaksi</th>
              <th class="px-4 py-2.5 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody id="adminTxModalBody" class="divide-y divide-slate-100 font-sans">
            <tr>
              <td colspan="6" class="p-4 text-center text-slate-400">Memuat data transaksi...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pt-2 flex justify-end">
        <button onclick="closeModal('adminTxModal')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
          Tutup
        </button>
      </div>
    </div>
  </div>

  <script>
    // Persetujuan Registrasi Akun Pengguna Baru
    function approveUser(userId, userName) {
      if (confirm('Setujui pendaftaran akun ' + userName + '? Pengguna akan dapat login ke dashboard.')) {
        fetch('/api/admin/users/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Akun ' + userName + ' berhasil disetujui!');
            window.location.reload();
          } else {
            alert('Gagal menyetujui akun: ' + (data.error || 'Unknown error'));
          }
        }).catch(err => alert('Error: ' + err.message));
      }
    }

    function rejectUser(userId, userName) {
      const reason = prompt('Masukkan alasan penolakan pendaftaran akun ' + userName + ':', 'Data tidak lengkap atau tidak valid');
      if (reason) {
        fetch('/api/admin/users/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, reason })
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Pendaftaran akun ' + userName + ' telah ditolak.');
            window.location.reload();
          } else {
            alert('Gagal menolak akun: ' + (data.error || 'Unknown error'));
          }
        }).catch(err => alert('Error: ' + err.message));
      }
    }

    // Persetujuan Permintaan Upgrade PRO
    function approveUpgrade(userId, paymentId, userName) {
      if (confirm('Setujui permintaan upgrade akun ' + userName + ' ke Paket PRO Lifetime?')) {
        fetch('/api/admin/upgrade/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, payment_id: paymentId })
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Akun ' + userName + ' resmi diaktifkan sebagai TataDana PRO Lifetime!');
            window.location.reload();
          } else {
            alert('Gagal menyetujui upgrade: ' + (data.error || 'Unknown error'));
          }
        }).catch(err => alert('Error: ' + err.message));
      }
    }

    function rejectUpgrade(userId, paymentId, userName) {
      const reason = prompt('Masukkan alasan penolakan upgrade PRO untuk ' + userName + ':', 'Bukti transfer tidak valid atau belum masuk');
      if (reason) {
        fetch('/api/admin/upgrade/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, payment_id: paymentId, reason })
        }).then(res => res.json()).then(data => {
          if (data.success) {
            alert('Permintaan upgrade PRO untuk ' + userName + ' telah ditolak.');
            window.location.reload();
          } else {
            alert('Gagal menolak upgrade: ' + (data.error || 'Unknown error'));
          }
        }).catch(err => alert('Error: ' + err.message));
      }
    }

    async function viewUserTransactions(userId, userName) {
      document.getElementById('adminTxModalTitle').innerText = 'Data Transaksi: ' + userName;
      const tbody = document.getElementById('adminTxModalBody');
      tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Mengambil data transaksi dan mencatat audit log...</td></tr>';
      openModal('adminTxModal');

      try {
        const res = await fetch('/api/admin/user-transactions?userId=' + userId + '&reason=' + encodeURIComponent('Superadmin support inquiry ' + userName));
        const data = await res.json();
        
        if (data.transactions && data.transactions.length > 0) {
          const monthsIndo = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
          ];
          const formatIndoDate = (dateStr) => {
            if (!dateStr) return '-';
            const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (m) {
              const year = m[1];
              const monthName = monthsIndo[parseInt(m[2], 10) - 1] || m[2];
              const day = parseInt(m[3], 10);
              return day + ' ' + monthName + ' ' + year;
            }
            return dateStr;
          };
          const formatSource = (source) => {
            if (!source) return { label: 'Web Dashboard', icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
            const s = String(source).toLowerCase();
            if (s === 'telegram_text') return { label: 'Telegram (Teks)', icon: '📱', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
            if (s === 'telegram_voice') return { label: 'Telegram (Voice Note)', icon: '🎙️', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            if (s === 'telegram_photo') return { label: 'Telegram (Foto Struk)', icon: '🧾', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
            if (s.startsWith('telegram')) return { label: 'Telegram Bot', icon: '🤖', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
            if (s === 'simulator') return { label: 'Simulator Bot', icon: '🤖', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
            if (s === 'transfer') return { label: 'Transfer Dompet', icon: '⇄', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
            return { label: source.replace('_', ' ').toUpperCase(), icon: '💻', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
          };

          tbody.innerHTML = data.transactions.map(t => {
            const isIncome = t.type === 'income';
            const isTransfer = t.type === 'transfer';
            const cat = (data.categories || []).find(c => c.id === t.category_id);
            const src = formatSource(t.source);
            const fullDate = formatIndoDate(t.transaction_date);

            const badgeColor = isIncome ? 'bg-emerald-100 text-emerald-800' : isTransfer ? 'bg-blue-100 text-blue-800' : 'bg-brand-100 text-brand-800';
            const amtColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-slate-900';
            const prefix = isIncome ? '+' : isTransfer ? '⇄ ' : '-';

            return '<tr class="hover:bg-slate-50">' +
              '<td class="px-4 py-2.5 whitespace-nowrap">' +
                '<div class="font-bold text-slate-800 flex items-center gap-1.5">' +
                  '<span>📅 ' + fullDate + '</span>' +
                '</div>' +
                '<div class="text-[10px] text-slate-400 font-mono">' + (t.transaction_date || '-') + '</div>' +
              '</td>' +
              '<td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ' + badgeColor + '">' + t.type.toUpperCase() + '</span></td>' +
              '<td class="px-4 py-2.5 font-medium text-slate-800">' + (cat ? (cat.emoji + ' ' + cat.name) : (isTransfer ? '⇄ Transfer Saldo' : 'Umum')) + '</td>' +
              '<td class="px-4 py-2.5 text-slate-600">' + (t.notes || '-') + '</td>' +
              '<td class="px-4 py-2.5 whitespace-nowrap">' +
                '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ' + src.badge + '">' +
                  src.icon + ' ' + src.label +
                '</span>' +
              '</td>' +
              '<td class="px-4 py-2.5 font-bold text-right whitespace-nowrap ' + amtColor + '">' + prefix + 'Rp' + Number(t.amount).toLocaleString('id-ID') + '</td>' +
              '</tr>';
          }).join('');
        } else {
          tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-400">Pengguna ini belum memiliki riwayat transaksi tercatat.</td></tr>';
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500 font-bold">Gagal memuat transaksi: ' + err.message + '</td></tr>';
      }
    }

    function approvePayment(paymentId) {
      if (confirm('Konfirmasi persetujuan pembayaran ini untuk meng-upgrade user ke Pro?')) {
        fetch('/api/admin/payments/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId })
        }).then(() => window.location.reload());
      }
    }

    function rejectPayment(paymentId) {
      const reason = prompt('Masukkan alasan penolakan pembayaran:', 'Bukti transfer tidak valid');
      if (reason) {
        fetch('/api/admin/payments/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId, reason })
        }).then(() => window.location.reload());
      }
    }

    function editProviderKeyPrompt(providerName) {
      const key = prompt('Masukkan API key baru untuk ' + providerName + ':');
      if (key && key.trim()) {
        fetch('/api/admin/ai-provider/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider_name: providerName, api_key: key.trim() })
        }).then(() => alert('API Key ' + providerName + ' berhasil diperbarui!'));
      }
    }
  </script>
  `;
}

// --------------------------------------------------------------------
// DEDICATED SUPERADMIN LOGIN PAGE (User Request #5)
// URL: /admin/login
// --------------------------------------------------------------------
export function renderAdminLoginPage({ error = null, message = null, success = null } = {}) {
  return `
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
    <!-- Ambient glowing backdrop -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-700/20 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-700/20 blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10 space-y-6">
      <!-- Portal Brand Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/25 mb-1">
          <i data-lucide="shield-check" class="w-8 h-8"></i>
        </div>
        <div class="inline-block px-3 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          Superadmin Portal
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          TataDana Control Center
        </h1>
        <p class="text-xs text-slate-400">
          Gerbang login khusus Superadmin. Tidak dapat diakses dari dashboard pengguna umum.
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
        ${error ? `
        <div class="p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-xs font-medium text-red-200 flex items-center gap-2.5">
          <i data-lucide="alert-octagon" class="w-4 h-4 flex-shrink-0 text-red-400"></i>
          <span>${error}</span>
        </div>
        ` : ''}

        ${message ? `
        <div class="p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 text-xs font-medium text-amber-200 flex items-center gap-2.5">
          <i data-lucide="info" class="w-4 h-4 flex-shrink-0 text-amber-400"></i>
          <span>${message}</span>
        </div>
        ` : ''}

        ${success ? `
        <div class="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs font-medium text-emerald-200 flex items-center gap-2.5">
          <i data-lucide="check-circle" class="w-4 h-4 flex-shrink-0 text-emerald-400"></i>
          <span>${success}</span>
        </div>
        ` : ''}

        <!-- Google Instant Login Button for Superadmin -->
        <div>
          <a href="/api/admin/google-login" class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm transition-all shadow-md group">
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Masuk Instan dengan Google (Superadmin)</span>
          </a>
        </div>

        <div class="relative flex items-center justify-center my-3">
          <div class="border-t border-slate-800 w-full"></div>
          <span class="bg-slate-900 px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider relative">atau kredensial sandracarolin1004</span>
        </div>

        <form action="/api/admin/login" method="POST" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Superadmin / No HP
            </label>
            <input type="text" name="identifier" id="adminEmailInput" required value="sandracarolin1004@gmail.com" placeholder="sandracarolin1004@gmail.com" class="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all font-sans"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Sandi Superadmin
            </label>
            <input type="password" name="password" id="adminPasswordInput" required value="password123" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all font-sans"/>
          </div>

          <button type="submit" class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2">
            <i data-lucide="log-in" class="w-4 h-4"></i> Masuk ke Admin Dashboard
          </button>
        </form>

        <div class="pt-2 border-t border-slate-800 text-center space-y-3">
          <button type="button" onclick="quickFillSuperadmin()" class="w-full py-2.5 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
            <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-400"></i> Masuk Cepat Superadmin (sandracarolin1004@gmail.com)
          </button>

          <div>
            <a href="/" class="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1">
              ← Kembali ke Beranda TataDana
            </a>
          </div>
        </div>
      </div>

      <div class="text-center text-[11px] text-slate-500">
        &copy; 2026 TataDana Fintech • Dedicated Superadmin Portal Protected
      </div>
    </div>
  </div>

  <script>
    function quickFillSuperadmin() {
      document.getElementById('adminEmailInput').value = 'sandracarolin1004@gmail.com';
      document.getElementById('adminPasswordInput').value = 'password123';
      document.querySelector('form').submit();
    }
  </script>
  `;
}
