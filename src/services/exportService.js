// ====================================================================
// TataDana - Financial Report Export Service (PDF & Excel / CSV)
// Generates reports on-demand, stores in Supabase Storage, logs to export_history
// ====================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../db/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPORTS_DIR = path.join(__dirname, '..', '..', 'storage_exports');

if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

export class ExportService {
  // Generate on-demand CSV / Excel compatible spreadsheet
  async generateExcelReport(user, periodStart, periodEnd, transactions, categories, wallets) {
    const fileName = `Laporan_TataDana_${periodStart}_sd_${periodEnd}.csv`;
    const filePath = path.join(EXPORTS_DIR, fileName);

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
        return `${day} ${monthName} ${year}`;
      }
      return dateStr;
    };

    const formatSource = (source) => {
      if (!source) return 'Web Dashboard';
      const s = String(source).toLowerCase();
      if (s === 'telegram_text') return 'Telegram (Teks)';
      if (s === 'telegram_voice') return 'Telegram (Voice Note)';
      if (s === 'telegram_photo') return 'Telegram (Foto Struk)';
      if (s.startsWith('telegram')) return 'Telegram Bot';
      if (s === 'simulator') return 'Simulator Bot';
      if (s === 'transfer') return 'Transfer Dompet';
      if (s === 'web' || s === 'web_manual') return 'Web Dashboard';
      return source.replace('_', ' ').toUpperCase();
    };

    // Header section
    let content = `LAPORAN KEUANGAN PRIBADI - TATADANA\n`;
    content += `Nama Pengguna,${user.full_name || 'User TataDana'}\n`;
    content += `Email,${user.email || '-'}\n`;
    content += `Periode Laporan,${periodStart} s/d ${periodEnd}\n`;
    content += `Tanggal Cetak,${new Date().toLocaleDateString('id-ID')}\n\n`;

    // Summary metrics
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const netCashflow = totalIncome - totalExpense;

    content += `RINGKASAN KEUANGAN\n`;
    content += `Total Pemasukan (IDR),${totalIncome}\n`;
    content += `Total Pengeluaran (IDR),${totalExpense}\n`;
    content += `Net Cashflow (IDR),${netCashflow}\n`;
    content += `Total Transaksi,${transactions.length}\n\n`;

    // Detailed transactions table
    content += `DETAIL TRANSAKSI\n`;
    content += `No,Tanggal (Tgl Bln Thn),Tanggal ISO,Jenis Transaksi,Kategori,Dompet,Nominal (IDR),Catatan & Item Belanja,Sumber Transaksi,Rincian Struk Multi-Item\n`;

    transactions.forEach((t, idx) => {
      const isIncome = t.type === 'income';
      const isTransfer = t.type === 'transfer';
      const typeLabel = isIncome ? 'Pemasukan' : isTransfer ? 'Transfer Antar Dompet' : 'Pengeluaran';
      const wallet = wallets.find(w => w.id === t.wallet_id)?.name || 'Dompet Utama';
      const dstWallet = wallets.find(w => w.id === t.destination_wallet_id)?.name;
      const walletStr = dstWallet ? `${wallet} -> ${dstWallet}` : wallet;
      const category = categories.find(c => c.id === t.category_id)?.name || (isTransfer ? 'Transfer Saldo' : 'Umum');
      const itemsStr = t.receipt_items && t.receipt_items.length > 0
        ? `"${t.receipt_items.map(i => `${i.name} (x${i.qty}): Rp${Number(i.price).toLocaleString('id-ID')}`).join('; ')}"`
        : '-';

      const fullDate = formatIndoDate(t.transaction_date);
      const srcLabel = formatSource(t.source);

      content += `${idx + 1},"${fullDate}","${t.transaction_date || '-'}","${typeLabel}","${category}","${walletStr}",${t.amount},"${(t.notes || '').replace(/"/g, '""')}","${srcLabel}",${itemsStr}\n`;
    });

    // Write UTF-8 with BOM so Excel recognizes Indonesian characters properly
    fs.writeFileSync(filePath, '\uFEFF' + content, 'utf-8');
    const stats = fs.statSync(filePath);

    // Record into export_history
    const exportRecord = {
      user_id: user.id,
      file_type: 'xlsx',
      period_start: periodStart,
      period_end: periodEnd,
      storage_path: `exports/${fileName}`,
      file_name: fileName,
      file_size_kb: Math.round(stats.size / 1024)
    };

    const { data: record } = await supabase.from('export_history').insert(exportRecord);

    return {
      fileName,
      filePath,
      downloadUrl: `/api/reports/download/${fileName}`,
      record
    };
  }

  // Generate on-demand Printable HTML / PDF Report
  async generatePDFReport(user, periodStart, periodEnd, transactions, categories, wallets) {
    const fileName = `Laporan_TataDana_${periodStart}_sd_${periodEnd}.pdf.html`;
    const filePath = path.join(EXPORTS_DIR, fileName);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const netCashflow = totalIncome - totalExpense;

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
        return `${day} ${monthName} ${year}`;
      }
      return dateStr;
    };

    const formatSource = (source) => {
      if (!source) return { label: 'Web Dashboard', icon: '💻' };
      const s = String(source).toLowerCase();
      if (s === 'telegram_text') return { label: 'Telegram (Teks)', icon: '📱' };
      if (s === 'telegram_voice') return { label: 'Telegram (Voice Note)', icon: '🎙️' };
      if (s === 'telegram_photo') return { label: 'Telegram (Foto Struk)', icon: '🧾' };
      if (s.startsWith('telegram')) return { label: 'Telegram Bot', icon: '🤖' };
      if (s === 'simulator') return { label: 'Simulator Bot', icon: '🤖' };
      if (s === 'transfer') return { label: 'Transfer Dompet', icon: '⇄' };
      if (s === 'web' || s === 'web_manual') return { label: 'Web Dashboard', icon: '💻' };
      return { label: source.replace('_', ' ').toUpperCase(), icon: '💻' };
    };

    let rowsHtml = transactions.map((t, idx) => {
      const isIncome = t.type === 'income';
      const isTransfer = t.type === 'transfer';
      const wallet = wallets.find(w => w.id === t.wallet_id)?.name || 'Dompet Utama';
      const dstWallet = wallets.find(w => w.id === t.destination_wallet_id)?.name;
      const walletStr = dstWallet ? `👛 ${wallet} ➔ ${dstWallet}` : `👛 ${wallet}`;
      const category = categories.find(c => c.id === t.category_id);
      const fullDate = formatIndoDate(t.transaction_date);
      const src = formatSource(t.source);

      let itemsSection = '';
      if (t.receipt_items && t.receipt_items.length > 0) {
        itemsSection = `
          <div style="font-size: 11px; color: #475569; margin-top: 4px; padding-left: 8px; border-left: 2px solid #cbd5e1;">
            <b>Rincian Item Struk Belanja:</b><br/>
            ${t.receipt_items.map(item => `• ${item.name} (${item.qty}x) — Rp${Number(item.price).toLocaleString('id-ID')}`).join('<br/>')}
          </div>
        `;
      }

      const typeLabel = isIncome ? 'PEMASUKAN' : isTransfer ? 'TRANSFER' : 'PENGELUARAN';
      const typeBg = isIncome ? '#dcfce7; color: #15803d;' : isTransfer ? '#dbeafe; color: #1d4ed8;' : '#fee2e2; color: #b91c1c;';
      const amtColor = isIncome ? '#16a34a' : isTransfer ? '#2563eb' : '#dc2626';
      const prefix = isIncome ? '+' : isTransfer ? '⇄ ' : '-';

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
          <td style="padding: 10px 8px; color: #64748b;">${idx + 1}</td>
          <td style="padding: 10px 8px; white-space: nowrap;">
            <b>${fullDate}</b>
            <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">${t.transaction_date || '-'}</div>
          </td>
          <td style="padding: 10px 8px; white-space: nowrap;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${typeBg}">
              ${typeLabel}
            </span>
          </td>
          <td style="padding: 10px 8px; white-space: nowrap;">${category?.emoji || (isTransfer ? '⇄' : '🏷️')} ${category?.name || (isTransfer ? 'Transfer Saldo' : 'Umum')}</td>
          <td style="padding: 10px 8px; color: #475569; white-space: nowrap;">${walletStr}</td>
          <td style="padding: 10px 8px; white-space: nowrap; font-size: 11px; font-weight: 600; color: #334155;">
            ${src.icon} ${src.label}
          </td>
          <td style="padding: 10px 8px; font-weight: 800; text-align: right; white-space: nowrap; color: ${amtColor}; font-size: 13px;">
            ${prefix}Rp${Number(t.amount).toLocaleString('id-ID')}
          </td>
          <td style="padding: 10px 8px;">
            <div style="font-weight: 600; color: #0f172a;">${t.notes || '-'}</div>
            ${itemsSection}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Laporan Keuangan TataDana</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 30px; background: #ffffff; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
    .header { border-bottom: 2px solid #800020; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { font-size: 26px; font-weight: 800; color: #800020; letter-spacing: -0.5px; }
    .tagline { font-size: 13px; color: #64748b; margin-top: 2px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
    .summary-card { background: #fdf2f4; border: 1px solid #f9d2d9; border-radius: 12px; padding: 16px; }
    .summary-title { font-size: 12px; color: #67001a; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
    .summary-value { font-size: 20px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f8fafc; padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
    .btn-print { background: #800020; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 10px 16px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
    <div>
      <span style="font-weight: 700; color: #0f172a; font-size: 14px;">📄 Pratinjau Cetak Laporan Keuangan TataDana</span>
      <span style="font-size: 12px; color: #64748b; margin-left: 8px;">(Total ${transactions.length} transaksi)</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <a href="/transactions" class="btn-secondary">← Kembali ke Transaksi</a>
      <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
    </div>
  </div>

  <div class="header">
    <div>
      <div class="logo">TataDana</div>
      <div class="tagline">Catat keuangan semudah chat — Platform Fintech Cerdas Indonesia</div>
    </div>
    <div style="text-align: right; font-size: 13px; color: #475569;">
      <div><b>Laporan Keuangan & Transaksi Resmi</b></div>
      <div>Periode: <b>${periodStart} s/d ${periodEnd}</b></div>
      <div>Nama Pengguna: <b>${user.full_name || 'User TataDana'}</b></div>
      <div>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-title">Total Pemasukan</div>
      <div class="summary-value" style="color: #16a34a;">+Rp${totalIncome.toLocaleString('id-ID')}</div>
    </div>
    <div class="summary-card">
      <div class="summary-title">Total Pengeluaran</div>
      <div class="summary-value" style="color: #dc2626;">-Rp${totalExpense.toLocaleString('id-ID')}</div>
    </div>
    <div class="summary-card">
      <div class="summary-title">Net Cashflow</div>
      <div class="summary-value" style="color: ${netCashflow >= 0 ? '#16a34a' : '#dc2626'};">
        ${netCashflow >= 0 ? '+' : ''}Rp${netCashflow.toLocaleString('id-ID')}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 30px;">#</th>
        <th style="width: 110px;">Tanggal</th>
        <th style="width: 90px;">Jenis</th>
        <th style="width: 120px;">Kategori</th>
        <th style="width: 120px;">Dompet</th>
        <th style="width: 110px;">Sumber</th>
        <th style="width: 120px; text-align: right;">Nominal</th>
        <th>Catatan & Rincian Item Belanja</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
    Laporan ini dibuat otomatis secara resmi oleh sistem TataDana. 100% data tersimpan aman dan terenkripsi.
  </div>
</body>
</html>
    `;

    fs.writeFileSync(filePath, html, 'utf-8');
    const stats = fs.statSync(filePath);

    const exportRecord = {
      user_id: user.id,
      file_type: 'pdf',
      period_start: periodStart,
      period_end: periodEnd,
      storage_path: `exports/${fileName}`,
      file_name: fileName,
      file_size_kb: Math.round(stats.size / 1024)
    };

    const { data: record } = await supabase.from('export_history').insert(exportRecord);

    return {
      fileName,
      filePath,
      downloadUrl: `/api/reports/download/${fileName}`,
      record
    };
  }
}

export const exportService = new ExportService();
