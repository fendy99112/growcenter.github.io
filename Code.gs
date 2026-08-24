/**
 * GROW CENTER - Bimbel Management System
 * Google Apps Script Backend (Code.gs)
 * Version: 2.0 (Modern UI/UX Edition)
 */

// Global Sheet Names & Target Database
const DEFAULT_SPREADSHEET_ID = '1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA';
const DEFAULT_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA/edit';

const SHEETS = {
  SISWA: 'Siswa',
  TENTOR: 'Tentor',
  SESI: 'SesiTentor',
  KEUANGAN: 'Keuangan',
  PENGATURAN: 'Pengaturan'
};

/**
 * HTTP GET Handler - Melayani Web App Frontend & REST API
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter.data ? JSON.parse(e.parameter.data) : null);
  }

  let html;
  try {
    html = HtmlService.createHtmlOutputFromFile('Index');
  } catch (err) {
    html = HtmlService.createHtmlOutputFromFile('index');
  }

  return html
    .setTitle('Grow Center - Sistem Informasi Manajemen Bimbel')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * HTTP POST Handler - Melayani Request API dari Hosting Eksternal (GitHub Pages / Vercel)
 */
function doPost(e) {
  try {
    let action = '';
    let data = null;
    if (e && e.postData && e.postData.contents) {
      const parsed = JSON.parse(e.postData.contents);
      action = parsed.action;
      data = parsed.data;
    } else if (e && e.parameter) {
      action = e.parameter.action;
      data = e.parameter.data ? JSON.parse(e.parameter.data) : null;
    }
    return handleApiRequest(action, data);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApiRequest(action, data) {
  let result = { success: false, error: 'Aksi API tidak valid' };
  try {
    if (action === 'getDashboardData') result = getDashboardData();
    else if (action === 'getSiswaList') result = getSiswaList();
    else if (action === 'saveSiswa') result = saveSiswa(data);
    else if (action === 'deleteSiswa') result = deleteSiswa(data);
    else if (action === 'bayarSPPSiswa') result = bayarSPPSiswa(data);
    else if (action === 'getTentorList') result = getTentorList();
    else if (action === 'saveTentor') result = saveTentor(data);
    else if (action === 'deleteTentor') result = deleteTentor(data);
    else if (action === 'getSesiList') result = getSesiList();
    else if (action === 'saveSesi') result = saveSesi(data);
    else if (action === 'bayarHonorTentor') result = bayarHonorTentor(data);
    else if (action === 'deleteSesi') result = deleteSesi(data);
    else if (action === 'getKeuanganList') result = getKeuanganList();
    else if (action === 'saveTransaksi') result = saveTransaksi(data);
    else if (action === 'deleteTransaksi') result = deleteTransaksi(data);
    else if (action === 'getPengaturan') result = getPengaturan();
    else if (action === 'savePengaturan') result = savePengaturan(data);
    else if (action === 'getPendingNotifications') result = getPendingNotifications();
    else if (action === 'getDatabaseInfo') result = getDatabaseInfo();
    else if (action === 'connectCustomSpreadsheet') result = connectCustomSpreadsheet(data);
  } catch (err) {
    result = { success: false, error: err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper untuk include file modular jika diperlukan
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * =========================================================================
 * TRIGGER OTOMATIS SAAT SPREADSHEET DIBUKA
 * =========================================================================
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🎓 Grow Center')
      .addItem('🌐 Buka Aplikasi Web', 'showWebAppDialog')
      .addSeparator()
      .addItem('⚙️ Setup Ulang Database', 'setupDatabase')
      .addItem('📊 Cek Status Koneksi', 'showConnectionStatus')
      .addToUi();
  } catch (e) {
    Logger.log('onOpen skipped in non-container context: ' + e.toString());
  }
}

function showWebAppDialog() {
  const url = ScriptApp.getService().getUrl();
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:15px;text-align:center;">' +
    '<h3>Aplikasi Grow Center Siap Digunakan!</h3>' +
    '<p>Klik tautan di bawah ini untuk membuka aplikasi:</p>' +
    '<p><a href="' + url + '" target="_blank" style="display:inline-block;padding:10px 20px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">🚀 Buka Web App Grow Center</a></p>' +
    '<p style="font-size:11px;color:#666;margin-top:10px;">URL: ' + url + '</p>' +
    '</div>'
  ).setWidth(420).setHeight(220);
  SpreadsheetApp.getUi().showModalDialog(html, 'Aplikasi Grow Center');
}

function showConnectionStatus() {
  const ss = getSpreadsheet();
  SpreadsheetApp.getUi().alert(
    'Status Koneksi Database',
    '✅ Aplikasi Terhubung Otomatis ke Spreadsheet:\n\n' +
    'Nama: ' + ss.getName() + '\n' +
    'ID: ' + ss.getId() + '\n' +
    'Jumlah Sheet: ' + ss.getSheets().length + ' sheet aktif\n' +
    'URL: ' + ss.getUrl(),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * =========================================================================
 * FUNGSI SETUP DATABASE UTAMA (DAPAT DIJALANKAN DARI TOOLBAR APPS SCRIPT)
 * =========================================================================
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  return setupDatabaseUtama(ss, true);
}

function setupDatabaseUtama(targetSS, forceReset = false) {
  const ss = targetSS || getSpreadsheet();
  if (!ss) {
    throw new Error("Spreadsheet tidak dapat diakses.");
  }

  // 1. Siswa
  let shSiswa = ss.getSheetByName(SHEETS.SISWA);
  if (!shSiswa) {
    shSiswa = ss.insertSheet(SHEETS.SISWA);
  }
  if (forceReset || shSiswa.getLastRow() <= 1) {
    shSiswa.clear();
    shSiswa.appendRow(['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    formatHeader(shSiswa);
    shSiswa.appendRow(['SIS-001', 'Ananda Pratama', '12 SMA - IPA', 'Reguler Intensif UTBK SNBT', '081234567890', 'Bpk. Bambang', '081298765432', 450000, 'Lunas', '2026-01-10', 'Aktif']);
    shSiswa.appendRow(['SIS-002', 'Clarissa Putri', '9 SMP', 'Privat 3x Seminggu Juara', '081345678901', 'Ibu Ratna', '081387654321', 600000, 'Belum Lunas', '2026-01-15', 'Aktif']);
    shSiswa.appendRow(['SIS-003', 'Dimas Satria', '11 SMA - IPS', 'Semi Privat Soshum Mandiri', '081456789012', 'Bpk. Hendra', '081476543210', 400000, 'Lunas', '2026-02-01', 'Aktif']);
    shSiswa.appendRow(['SIS-004', 'Elena Syahira', '6 SD', 'Bimbel Juara Masuk SMP Favorit', '081567890123', 'Ibu Maya', '081565432109', 350000, 'Belum Lunas', '2026-02-10', 'Aktif']);
    shSiswa.appendRow(['SIS-005', 'Farhan Al-Ghifari', '12 SMA - IPA', 'Kedokteran & Kedinasan Class', '081678901234', 'Bpk. Dr. Gunawan', '081654321098', 750000, 'Belum Lunas', '2026-02-20', 'Aktif']);
  }

  // 2. Tentor
  let shTentor = ss.getSheetByName(SHEETS.TENTOR);
  if (!shTentor) {
    shTentor = ss.insertSheet(SHEETS.TENTOR);
  }
  if (forceReset || shTentor.getLastRow() <= 1) {
    shTentor.clear();
    shTentor.appendRow(['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    formatHeader(shTentor);
    shTentor.appendRow(['TTR-001', 'Kak Fikri, S.Pd', 'Matematika & Fisika SMA', '081901234567', 75000, 'BCA 123456789 a.n Fikri Hidayat', '2025-10-01', 'Aktif']);
    shTentor.appendRow(['TTR-002', 'Kak Sarah, M.Si', 'Kimia & Biologi SMA', '081912345678', 80000, 'Mandiri 987654321 a.n Sarah Amalia', '2025-11-05', 'Aktif']);
    shTentor.appendRow(['TTR-003', 'Kak Budi, S.Hum', 'Bahasa Inggris TOEFL & Indo', '081923456789', 70000, 'BNI 5544332211 a.n Budi Santoso', '2026-01-02', 'Aktif']);
    shTentor.appendRow(['TTR-004', 'Kak Nisa, S.Si', 'Matematika & Sains SD/SMP', '081934567890', 65000, 'BRI 0192837465 a.n Annisa Rahma', '2026-01-20', 'Aktif']);
    shTentor.appendRow(['TTR-005', 'Kak Reza, S.E', 'Ekonomi & Akuntansi SMA', '081945678901', 75000, 'BSI 7123456789 a.n Reza Pratama', '2026-02-05', 'Aktif']);
  }

  // 3. Sesi
  let shSesi = ss.getSheetByName(SHEETS.SESI);
  if (!shSesi) {
    shSesi = ss.insertSheet(SHEETS.SESI);
  }
  if (forceReset || shSesi.getLastRow() <= 1) {
    shSesi.clear();
    shSesi.appendRow(['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    formatHeader(shSesi);
    shSesi.appendRow(['SES-001', 'TTR-001', 'Kak Fikri, S.Pd', '2026-08-15', '12 SMA - IPA (Ananda Pratama)', 'Matematika Saintek', 1, 75000, 'Lunas', '2026-08-20', 'Sesi berjalan lancar']);
    shSesi.appendRow(['SES-002', 'TTR-001', 'Kak Fikri, S.Pd', '2026-08-18', '12 SMA - IPA (Farhan Al-Ghifari)', 'Fisika Dinamika & Gerak', 1.5, 112500, 'Belum Dibayar', '', 'Fokus latihan soal UTBK']);
    shSesi.appendRow(['SES-003', 'TTR-002', 'Kak Sarah, M.Si', '2026-08-19', '9 SMP (Clarissa Putri)', 'Kimia Dasar & Biologi', 1, 80000, 'Belum Dibayar', '', 'Materi persiapan ujian']);
    shSesi.appendRow(['SES-004', 'TTR-003', 'Kak Budi, S.Hum', '2026-08-21', '6 SD (Elena Syahira)', 'Bahasa Inggris Grammar & Vocab', 1, 70000, 'Belum Dibayar', '', 'Siswa sangat aktif']);
    shSesi.appendRow(['SES-005', 'TTR-004', 'Kak Nisa, S.Si', '2026-08-22', '11 SMA - IPS (Dimas Satria)', 'Matematika Dasar & Aljabar', 1, 65000, 'Belum Dibayar', '', '']);
    shSesi.appendRow(['SES-006', 'TTR-005', 'Kak Reza, S.E', '2026-08-22', '11 SMA - IPS (Dimas Satria)', 'Ekonomi & Akuntansi Keuangan', 1.5, 112500, 'Belum Dibayar', '', 'Bab Laporan Laba Rugi']);
  }

  // 4. Keuangan
  let shKeu = ss.getSheetByName(SHEETS.KEUANGAN);
  if (!shKeu) {
    shKeu = ss.insertSheet(SHEETS.KEUANGAN);
  }
  if (forceReset || shKeu.getLastRow() <= 1) {
    shKeu.clear();
    shKeu.appendRow(['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    formatHeader(shKeu);
    shKeu.appendRow(['TRX-001', '2026-08-01', 'Pemasukan', 'SPP Siswa', 'Pembayaran SPP Agustus - Ananda Pratama', 450000, 'Transfer BCA', 'SIS-001 (Ananda)', 'Admin']);
    shKeu.appendRow(['TRX-002', '2026-08-02', 'Pemasukan', 'SPP Siswa', 'Pembayaran SPP Agustus - Dimas Satria', 400000, 'Tunai', 'SIS-003 (Dimas)', 'Admin']);
    shKeu.appendRow(['TRX-003', '2026-08-05', 'Pengeluaran', 'Operasional & Listrik', 'Tagihan Listrik & WiFi Kantor Bimbel', 350000, 'Transfer Mandiri', 'Operasional', 'Admin']);
    shKeu.appendRow(['TRX-004', '2026-08-10', 'Pengeluaran', 'ATK & Modul', 'Cetak Modul Belajar Semester Ganjil', 220000, 'Tunai', 'Pengadaan', 'Admin']);
    shKeu.appendRow(['TRX-005', '2026-08-12', 'Pemasukan', 'Pendaftaran', 'Biaya Pendaftaran Siswa Baru - Farhan Al-Ghifari', 150000, 'Transfer BCA', 'SIS-005 (Farhan)', 'Admin']);
    shKeu.appendRow(['TRX-006', '2026-08-20', 'Pengeluaran', 'Honor Tentor', 'Pembayaran Honor Kak Fikri (SES-001)', 75000, 'Transfer BCA', 'TTR-001 (Fikri)', 'Admin']);
  }

  // 5. Pengaturan
  let shPeng = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!shPeng) {
    shPeng = ss.insertSheet(SHEETS.PENGATURAN);
  }
  if (forceReset || shPeng.getLastRow() <= 1) {
    shPeng.clear();
    shPeng.appendRow(['Parameter', 'Nilai']);
    formatHeader(shPeng);
    shPeng.appendRow(['nama_bimbel', 'Grow Center']);
    shPeng.appendRow(['tagline', 'Solusi Belajar Berprestasi & Menyenangkan']);
    shPeng.appendRow(['alamat', 'Jl. Pendidikan Mandiri No. 88, Kota Belajar']);
    shPeng.appendRow(['no_wa_admin', '081234567890']);
    shPeng.appendRow(['rekening_pembayaran', 'BCA: 8735019283 a.n Grow Center Official | Mandiri: 1320098765432']);
    shPeng.appendRow(['template_tagihan_wa', 'Halo Bapak/Ibu {ORANG_TUA}, kami dari *Grow Center* ingin menginformasikan tagihan bimbingan belajar ananda *{NAMA_SISWA}* untuk periode *{BULAN}* sebesar *Rp {NOMINAL}*. Pembayaran dapat ditransfer melalui: {REKENING}. Konfirmasi via chat ini ya. Terima kasih! 🙏']);
    shPeng.appendRow(['template_honor_wa', 'Halo *{NAMA_TENTOR}*, berikut konfirmasi pembayaran honor mengajar Anda di *Grow Center* untuk periode *{PERIODE}* sebesar *Rp {TOTAL_HONOR}* telah ditransfer ke rekening {BANK_TENTOR}. Rincian sesi terlampir. Terima kasih atas dedikasinya! 🌟']);
  }

  // Hapus Sheet1 default jika ada
  const defSheet = ss.getSheetByName('Sheet1');
  if (defSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defSheet); } catch(e) {}
  }

  SpreadsheetApp.flush();

  return {
    success: true,
    message: "Database Grow Center berhasil disiapkan!",
    sheetUrl: ss.getUrl()
  };
}

/**
 * Mendapatkan atau membuat Spreadsheet database aktif secara 100% otomatis
 */
function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const customId = props.getProperty('SPREADSHEET_ID');

  // 1. Jika ada ID kustom yang disimpan via menu Pengaturan, gunakan itu
  if (customId && customId.trim() !== '') {
    try {
      const ss = SpreadsheetApp.openById(customId.trim());
      if (ss) {
        ensureDatabaseStructure(ss);
        return ss;
      }
    } catch (e) {
      Logger.log("openById customId gagal: " + e.toString());
    }
  }

  // 2. Buka DEFAULT_SPREADSHEET_ID (ID Spreadsheet Target Utama pengguna)
  if (DEFAULT_SPREADSHEET_ID && DEFAULT_SPREADSHEET_ID.trim() !== '') {
    try {
      const ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID.trim());
      if (ss) {
        ensureDatabaseStructure(ss);
        return ss;
      }
    } catch (e) {
      Logger.log("openById DEFAULT_SPREADSHEET_ID gagal: " + e.toString());
    }
  }

  // 3. Coba container-bound active spreadsheet
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      ensureDatabaseStructure(active);
      return active;
    }
  } catch (err) {
    Logger.log("Bukan container-bound: " + err.toString());
  }

  // 4. Fallback jika benar-benar belum ada akses
  const newSS = SpreadsheetApp.create('Database Grow Center (Bimbel Management)');
  props.setProperty('SPREADSHEET_ID', newSS.getId());
  ensureDatabaseStructure(newSS);
  return newSS;
}

/**
 * Memastikan seluruh 5 sheet database selalu ada tanpa menghapus data yang sudah diinput
 */
function ensureDatabaseStructure(ss) {
  if (!ss) return;
  
  // 1. Siswa
  let shSiswa = ss.getSheetByName(SHEETS.SISWA);
  if (!shSiswa) {
    shSiswa = ss.insertSheet(SHEETS.SISWA);
    shSiswa.appendRow(['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    formatHeader(shSiswa);
    shSiswa.appendRow(['SIS-001', 'Ananda Pratama', '12 SMA - IPA', 'Reguler Intensif UTBK SNBT', '081234567890', 'Bpk. Bambang', '081298765432', 450000, 'Lunas', '2026-01-10', 'Aktif']);
    shSiswa.appendRow(['SIS-002', 'Clarissa Putri', '9 SMP', 'Privat 3x Seminggu Juara', '081345678901', 'Ibu Ratna', '081387654321', 600000, 'Belum Lunas', '2026-01-15', 'Aktif']);
    shSiswa.appendRow(['SIS-003', 'Dimas Satria', '11 SMA - IPS', 'Semi Privat Soshum Mandiri', '081456789012', 'Bpk. Hendra', '081476543210', 400000, 'Lunas', '2026-02-01', 'Aktif']);
    shSiswa.appendRow(['SIS-004', 'Elena Syahira', '6 SD', 'Bimbel Juara Masuk SMP Favorit', '081567890123', 'Ibu Maya', '081565432109', 350000, 'Belum Lunas', '2026-02-10', 'Aktif']);
    shSiswa.appendRow(['SIS-005', 'Farhan Al-Ghifari', '12 SMA - IPA', 'Kedokteran & Kedinasan Class', '081678901234', 'Bpk. Dr. Gunawan', '081654321098', 750000, 'Belum Lunas', '2026-02-20', 'Aktif']);
  } else if (shSiswa.getLastRow() === 0) {
    shSiswa.appendRow(['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    formatHeader(shSiswa);
  }

  // 2. Tentor
  let shTentor = ss.getSheetByName(SHEETS.TENTOR);
  if (!shTentor) {
    shTentor = ss.insertSheet(SHEETS.TENTOR);
    shTentor.appendRow(['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    formatHeader(shTentor);
    shTentor.appendRow(['TTR-001', 'Kak Fikri, S.Pd', 'Matematika & Fisika SMA', '081901234567', 75000, 'BCA 123456789 a.n Fikri Hidayat', '2025-10-01', 'Aktif']);
    shTentor.appendRow(['TTR-002', 'Kak Sarah, M.Si', 'Kimia & Biologi SMA', '081912345678', 80000, 'Mandiri 987654321 a.n Sarah Amalia', '2025-11-05', 'Aktif']);
    shTentor.appendRow(['TTR-003', 'Kak Budi, S.Hum', 'Bahasa Inggris TOEFL & Indo', '081923456789', 70000, 'BNI 5544332211 a.n Budi Santoso', '2026-01-02', 'Aktif']);
    shTentor.appendRow(['TTR-004', 'Kak Nisa, S.Si', 'Matematika & Sains SD/SMP', '081934567890', 65000, 'BRI 0192837465 a.n Annisa Rahma', '2026-01-20', 'Aktif']);
    shTentor.appendRow(['TTR-005', 'Kak Reza, S.E', 'Ekonomi & Akuntansi SMA', '081945678901', 75000, 'BSI 7123456789 a.n Reza Pratama', '2026-02-05', 'Aktif']);
  } else if (shTentor.getLastRow() === 0) {
    shTentor.appendRow(['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    formatHeader(shTentor);
  }

  // 3. Sesi
  let shSesi = ss.getSheetByName(SHEETS.SESI);
  if (!shSesi) {
    shSesi = ss.insertSheet(SHEETS.SESI);
    shSesi.appendRow(['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    formatHeader(shSesi);
    shSesi.appendRow(['SES-001', 'TTR-001', 'Kak Fikri, S.Pd', '2026-08-15', '12 SMA - IPA (Ananda Pratama)', 'Matematika Saintek', 1, 75000, 'Lunas', '2026-08-20', 'Sesi berjalan lancar']);
    shSesi.appendRow(['SES-002', 'TTR-001', 'Kak Fikri, S.Pd', '2026-08-18', '12 SMA - IPA (Farhan Al-Ghifari)', 'Fisika Dinamika & Gerak', 1.5, 112500, 'Belum Dibayar', '', 'Fokus latihan soal UTBK']);
    shSesi.appendRow(['SES-003', 'TTR-002', 'Kak Sarah, M.Si', '2026-08-19', '9 SMP (Clarissa Putri)', 'Kimia Dasar & Biologi', 1, 80000, 'Belum Dibayar', '', 'Materi persiapan ujian']);
    shSesi.appendRow(['SES-004', 'TTR-003', 'Kak Budi, S.Hum', '2026-08-21', '6 SD (Elena Syahira)', 'Bahasa Inggris Grammar & Vocab', 1, 70000, 'Belum Dibayar', '', 'Siswa sangat aktif']);
    shSesi.appendRow(['SES-005', 'TTR-004', 'Kak Nisa, S.Si', '2026-08-22', '11 SMA - IPS (Dimas Satria)', 'Matematika Dasar & Aljabar', 1, 65000, 'Belum Dibayar', '', '']);
    shSesi.appendRow(['SES-006', 'TTR-005', 'Kak Reza, S.E', '2026-08-22', '11 SMA - IPS (Dimas Satria)', 'Ekonomi & Akuntansi Keuangan', 1.5, 112500, 'Belum Dibayar', '', 'Bab Laporan Laba Rugi']);
  } else if (shSesi.getLastRow() === 0) {
    shSesi.appendRow(['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    formatHeader(shSesi);
  }

  // 4. Keuangan
  let shKeu = ss.getSheetByName(SHEETS.KEUANGAN);
  if (!shKeu) {
    shKeu = ss.insertSheet(SHEETS.KEUANGAN);
    shKeu.appendRow(['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    formatHeader(shKeu);
    shKeu.appendRow(['TRX-001', '2026-08-01', 'Pemasukan', 'SPP Siswa', 'Pembayaran SPP Agustus - Ananda Pratama', 450000, 'Transfer BCA', 'SIS-001 (Ananda)', 'Admin']);
    shKeu.appendRow(['TRX-002', '2026-08-02', 'Pemasukan', 'SPP Siswa', 'Pembayaran SPP Agustus - Dimas Satria', 400000, 'Tunai', 'SIS-003 (Dimas)', 'Admin']);
    shKeu.appendRow(['TRX-003', '2026-08-05', 'Pengeluaran', 'Operasional & Listrik', 'Tagihan Listrik & WiFi Kantor Bimbel', 350000, 'Transfer Mandiri', 'Operasional', 'Admin']);
    shKeu.appendRow(['TRX-004', '2026-08-10', 'Pengeluaran', 'ATK & Modul', 'Cetak Modul Belajar Semester Ganjil', 220000, 'Tunai', 'Pengadaan', 'Admin']);
    shKeu.appendRow(['TRX-005', '2026-08-12', 'Pemasukan', 'Pendaftaran', 'Biaya Pendaftaran Siswa Baru - Farhan Al-Ghifari', 150000, 'Transfer BCA', 'SIS-005 (Farhan)', 'Admin']);
    shKeu.appendRow(['TRX-006', '2026-08-20', 'Pengeluaran', 'Honor Tentor', 'Pembayaran Honor Kak Fikri (SES-001)', 75000, 'Transfer BCA', 'TTR-001 (Fikri)', 'Admin']);
  } else if (shKeu.getLastRow() === 0) {
    shKeu.appendRow(['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    formatHeader(shKeu);
  }

  // 5. Pengaturan
  let shPeng = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!shPeng) {
    shPeng = ss.insertSheet(SHEETS.PENGATURAN);
    shPeng.appendRow(['Parameter', 'Nilai']);
    formatHeader(shPeng);
    shPeng.appendRow(['nama_bimbel', 'Grow Center']);
    shPeng.appendRow(['tagline', 'Solusi Belajar Berprestasi & Menyenangkan']);
    shPeng.appendRow(['alamat', 'Jl. Pendidikan Mandiri No. 88, Kota Belajar']);
    shPeng.appendRow(['no_wa_admin', '081234567890']);
    shPeng.appendRow(['rekening_pembayaran', 'BCA: 8735019283 a.n Grow Center Official | Mandiri: 1320098765432']);
    shPeng.appendRow(['template_tagihan_wa', 'Halo Bapak/Ibu {ORANG_TUA}, kami dari *Grow Center* ingin menginformasikan tagihan bimbingan belajar ananda *{NAMA_SISWA}* untuk periode *{BULAN}* sebesar *Rp {NOMINAL}*. Pembayaran dapat ditransfer melalui: {REKENING}. Konfirmasi via chat ini ya. Terima kasih! 🙏']);
    shPeng.appendRow(['template_honor_wa', 'Halo *{NAMA_TENTOR}*, berikut konfirmasi pembayaran honor mengajar Anda di *Grow Center* untuk periode *{PERIODE}* sebesar *Rp {TOTAL_HONOR}* telah ditransfer ke rekening {BANK_TENTOR}. Rincian sesi terlampir. Terima kasih atas dedikasinya! 🌟']);
  } else if (shPeng.getLastRow() === 0) {
    shPeng.appendRow(['Parameter', 'Nilai']);
    formatHeader(shPeng);
  }

  SpreadsheetApp.flush();
}

/**
 * API untuk Frontend: Mengambil informasi koneksi Spreadsheet
 */
function getDatabaseInfo() {
  try {
    const ss = getSpreadsheet();
    return {
      success: true,
      connected: true,
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      totalSheets: ss.getSheets().length
    };
  } catch (e) {
    return {
      success: false,
      connected: false,
      error: e.toString()
    };
  }
}

/**
 * API untuk Frontend: Hubungkan ke Spreadsheet ID kustom
 */
function connectCustomSpreadsheet(spreadsheetIdOrUrl) {
  try {
    if (!spreadsheetIdOrUrl) throw new Error("ID atau URL Spreadsheet tidak boleh kosong");
    
    let targetId = spreadsheetIdOrUrl.trim();
    const urlMatch = targetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      targetId = urlMatch[1];
    }

    const ss = SpreadsheetApp.openById(targetId);
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', targetId);
    ensureDatabaseStructure(ss);

    return {
      success: true,
      message: 'Berhasil terhubung ke spreadsheet: ' + ss.getName(),
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: 'Gagal terhubung: ' + e.toString() };
  }
}

function formatHeader(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  range.setBackground('#4F46E5')
       .setFontColor('#FFFFFF')
       .setFontWeight('bold')
       .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Helper aman: Mengambil sheet berdasarkan nama atau membuatnya jika belum ada
 */
function getOrCreateSheet(ss, sheetName, defaultHeaders = []) {
  if (!ss) throw new Error("Spreadsheet tidak tersedia");
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    const all = ss.getSheets();
    for (let i = 0; i < all.length; i++) {
      if (all[i].getName().trim().toLowerCase() === sheetName.trim().toLowerCase()) {
        return all[i];
      }
    }
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      formatHeader(sheet);
    }
  }
  return sheet;
}

// ==========================================
// 1. DASHBOARD APIS
// ==========================================

function getDashboardData() {
  try {
    const ss = getSpreadsheet();
    
    // Ambil data siswa
    const shSiswa = getOrCreateSheet(ss, SHEETS.SISWA, ['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    const shTentor = getOrCreateSheet(ss, SHEETS.TENTOR, ['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    const shSesi = getOrCreateSheet(ss, SHEETS.SESI, ['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    const shKeu = getOrCreateSheet(ss, SHEETS.KEUANGAN, ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);

    const siswaRows = getSheetDataAsObjects(shSiswa);
    const tentorRows = getSheetDataAsObjects(shTentor);
    const sesiRows = getSheetDataAsObjects(shSesi);
    const keuRows = getSheetDataAsObjects(shKeu);
    
    const totalSiswaAktif = siswaRows.filter(s => s['Status'] === 'Aktif').length;
    const totalTentorAktif = tentorRows.filter(t => t['Status'] === 'Aktif').length;
    
    // Hitung Pemasukan & Pengeluaran Bulan Ini
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    
    let pemasukanBulanIni = 0;
    let pengeluaranBulanIni = 0;
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    // Monthly data for chart (Last 6 months)
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const mName = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
      monthsData.push({
        label: mName,
        year: d.getFullYear(),
        month: d.getMonth(),
        pemasukan: 0,
        pengeluaran: 0
      });
    }

    keuRows.forEach(trx => {
      const tDate = parseDateString(trx['Tanggal']);
      const nominal = Number(trx['Jumlah (Rp)']) || 0;
      const isPemasukan = (trx['Tipe'] || '').toLowerCase() === 'pemasukan';
      
      if (isPemasukan) {
        totalPemasukan += nominal;
        if (tDate.getFullYear() === curYear && tDate.getMonth() === curMonth) {
          pemasukanBulanIni += nominal;
        }
      } else {
        totalPengeluaran += nominal;
        if (tDate.getFullYear() === curYear && tDate.getMonth() === curMonth) {
          pengeluaranBulanIni += nominal;
        }
      }
      
      // Plot to 6-month chart
      monthsData.forEach(m => {
        if (tDate.getFullYear() === m.year && tDate.getMonth() === m.month) {
          if (isPemasukan) m.pemasukan += nominal;
          else m.pengeluaran += nominal;
        }
      });
    });

    // Tunggakan SPP
    let totalTunggakanSPP = 0;
    let siswaMenunggak = 0;
    let siswaLunas = 0;
    
    siswaRows.forEach(s => {
      if (s['Status'] === 'Aktif') {
        const nominal = Number(s['Nominal SPP']) || 0;
        if (s['Status SPP Bulan Ini'] === 'Belum Lunas') {
          totalTunggakanSPP += nominal;
          siswaMenunggak++;
        } else {
          siswaLunas++;
        }
      }
    });

    // Honor Tentor yang Belum Dibayar
    let totalHonorBelumDibayar = 0;
    let sesiBelumDibayarCount = 0;
    sesiRows.forEach(ses => {
      if (ses['Status Bayar'] === 'Belum Dibayar') {
        totalHonorBelumDibayar += Number(ses['Total Honor (Rp)']) || 0;
        sesiBelumDibayarCount++;
      }
    });

    // Transaksi Terkini (5 terakhir)
    const recentTransactions = [...keuRows].reverse().slice(0, 5);

    // Sesi Terkini (5 terakhir)
    const recentSessions = [...sesiRows].reverse().slice(0, 5);

    return {
      success: true,
      stats: {
        totalSiswaAktif,
        totalTentorAktif,
        pemasukanBulanIni,
        pengeluaranBulanIni,
        labaBersihBulanIni: pemasukanBulanIni - pengeluaranBulanIni,
        totalTunggakanSPP,
        siswaMenunggak,
        siswaLunas,
        totalHonorBelumDibayar,
        sesiBelumDibayarCount
      },
      chartData: monthsData,
      recentTransactions,
      recentSessions
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// ==========================================
// 2. DATA SISWA APIS
// ==========================================

function getSiswaList() {
  try {
    const ss = getSpreadsheet();
    const shSiswa = getOrCreateSheet(ss, SHEETS.SISWA, ['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    const data = getSheetDataAsObjects(shSiswa);
    return { success: true, data: data };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function saveSiswa(form) {
  try {
    if (!form) return { success: false, error: 'Data form kosong' };
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.SISWA, ['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    const data = sheet.getDataRange().getValues();
    
    let id = (form.id || '').trim();
    const isEdit = Boolean(id);
    
    let rowIndex = -1;
    if (isEdit) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === id) {
          rowIndex = i + 1;
          break;
        }
      }
    } else {
      let maxNum = 0;
      for (let i = 1; i < data.length; i++) {
        const match = String(data[i][0]).match(/\d+/);
        if (match) {
          const n = parseInt(match[0], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      id = 'SIS-' + String(maxNum + 1).padStart(3, '0');
    }

    const rowData = [
      id,
      form.nama || '',
      form.kelas || '',
      form.program || '',
      form.no_wa_siswa || '',
      form.nama_ortu || '',
      form.no_wa_ortu || '',
      Number(form.nominal_spp) || 0,
      form.status_spp || 'Belum Lunas',
      form.tgl_daftar || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
      form.status || 'Aktif'
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    SpreadsheetApp.flush();

    return { 
      success: true, 
      message: 'Data siswa ' + (form.nama || id) + ' berhasil disimpan ke Google Sheets!', 
      id: id,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    };
  } catch (e) {
    Logger.log("Error saveSiswa: " + e.toString());
    return { success: false, error: e.toString() };
  }
}

function deleteSiswa(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.SISWA);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(id).trim()) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return { success: true, message: 'Data siswa berhasil dihapus!' };
      }
    }
    return { success: false, error: 'Siswa tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function bayarSPPSiswa(payment) {
  try {
    const ss = getSpreadsheet();
    const shSiswa = ss.getSheetByName(SHEETS.SISWA);
    const shKeu = ss.getSheetByName(SHEETS.KEUANGAN);
    
    // Update status SPP Siswa
    const dataSiswa = shSiswa.getDataRange().getValues();
    let namaSiswa = '';
    for (let i = 1; i < dataSiswa.length; i++) {
      if (String(dataSiswa[i][0]).trim() === String(payment.id_siswa).trim()) {
        namaSiswa = dataSiswa[i][1];
        shSiswa.getRange(i + 1, 9).setValue('Lunas'); // Kolom 9 = Status SPP Bulan Ini
        break;
      }
    }

    // Hitung ID TRX baru
    const dataKeu = shKeu.getDataRange().getValues();
    let maxNum = 0;
    for (let i = 1; i < dataKeu.length; i++) {
      const match = String(dataKeu[i][0]).match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    const trxId = 'TRX-' + String(maxNum + 1).padStart(3, '0');
    const tgl = payment.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
    const deskripsi = `Pembayaran SPP (${payment.bulan || 'Bulan Ini'}) - ${namaSiswa}`;
    
    shKeu.appendRow([
      trxId,
      tgl,
      'Pemasukan',
      'SPP Siswa',
      deskripsi,
      Number(payment.jumlah) || 0,
      payment.metode || 'Transfer',
      `${payment.id_siswa} (${namaSiswa})`,
      'Admin'
    ]);

    SpreadsheetApp.flush();

    return { 
      success: true, 
      message: `Pembayaran SPP untuk ${namaSiswa} berhasil dicatat ke Google Sheets!`,
      trxId: trxId,
      namaSiswa: namaSiswa,
      jumlah: payment.jumlah,
      tanggal: tgl
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// 3. DATA TENTOR APIS
// ==========================================

function getTentorList() {
  try {
    const ss = getSpreadsheet();
    const shTentor = getOrCreateSheet(ss, SHEETS.TENTOR, ['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    const data = getSheetDataAsObjects(shTentor);
    return { success: true, data: data };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function saveTentor(form) {
  try {
    if (!form) return { success: false, error: 'Data form kosong' };
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.TENTOR, ['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    const data = sheet.getDataRange().getValues();
    
    let id = (form.id || '').trim();
    const isEdit = Boolean(id);
    
    let rowIndex = -1;
    if (isEdit) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === id) {
          rowIndex = i + 1;
          break;
        }
      }
    } else {
      let maxNum = 0;
      for (let i = 1; i < data.length; i++) {
        const match = String(data[i][0]).match(/\d+/);
        if (match) {
          const n = parseInt(match[0], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      id = 'TTR-' + String(maxNum + 1).padStart(3, '0');
    }

    const rowData = [
      id,
      form.nama || '',
      form.mapel || '',
      form.no_wa || '',
      Number(form.honor_per_sesi) || 0,
      form.rekening || '',
      form.tgl_bergabung || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
      form.status || 'Aktif'
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    SpreadsheetApp.flush();

    return { 
      success: true, 
      message: 'Data tentor ' + (form.nama || id) + ' berhasil disimpan ke Google Sheets!', 
      id: id,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function deleteTentor(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.TENTOR, ['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(id).trim()) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return { success: true, message: 'Data tentor berhasil dihapus!' };
      }
    }
    return { success: false, error: 'Tentor tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// 4. SESI & PEMBAYARAN HONOR TENTOR APIS
// ==========================================

function getSesiList() {
  try {
    const ss = getSpreadsheet();
    const shSesi = getOrCreateSheet(ss, SHEETS.SESI, ['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    const rawData = getSheetDataAsObjects(shSesi);
    
    const data = rawData.map(s => {
      let jam = s['Waktu / Jam'] || '14:00 - 15:30 WIB';
      let tipe = s['Tipe Sesi'] || 'Offline di Bimbel';
      let materi = s['Materi Detail'] || s['Mata Pelajaran'] || '';
      let evaluasi = s['Evaluasi Siswa'] || '';

      const cat = String(s['Catatan'] || '');
      const jamMatch = cat.match(/\[Jam:\s*([^\]]+)\]/i);
      if (jamMatch && jamMatch[1]) jam = jamMatch[1].trim();

      const tipeMatch = cat.match(/\[(Offline di Bimbel|Privat Guru ke Rumah|Online via Zoom\/Meet)\]/i);
      if (tipeMatch && tipeMatch[1]) tipe = tipeMatch[1].trim();

      const materiMatch = cat.match(/Materi:\s*([^.]+)/i);
      if (materiMatch && materiMatch[1]) materi = materiMatch[1].trim();

      const evalMatch = cat.match(/Evaluasi:\s*(.+)$/i);
      if (evalMatch && evalMatch[1]) evaluasi = evalMatch[1].trim();

      return {
        ...s,
        'Waktu / Jam': jam,
        'Tipe Sesi': tipe,
        'Materi Detail': materi,
        'Evaluasi Siswa': evaluasi
      };
    });

    return { success: true, data: data };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function saveSesi(form) {
  try {
    if (!form) return { success: false, error: 'Data form kosong' };
    const ss = getSpreadsheet();
    const shSesi = getOrCreateSheet(ss, SHEETS.SESI, ['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    const shTentor = getOrCreateSheet(ss, SHEETS.TENTOR, ['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);
    const dataSesi = shSesi.getDataRange().getValues();
    
    // Cari detail tentor jika honor belum dihitung
    let namaTentor = form.nama_tentor || '';
    let honorPerSesi = Number(form.honor_per_sesi) || 0;
    
    if (form.id_tentor) {
      const tentorData = getSheetDataAsObjects(shTentor);
      const t = tentorData.find(item => item['ID Tentor'] === form.id_tentor);
      if (t) {
        namaTentor = t['Nama Lengkap'];
        if (!honorPerSesi) {
          honorPerSesi = Number(t['Honor Per Sesi (Rp)']) || 75000;
        }
      }
    }

    const durasi = Number(form.durasi) || 1;
    const totalHonor = Number(form.total_honor) || (durasi * honorPerSesi);
    
    let maxNum = 0;
    for (let i = 1; i < dataSesi.length; i++) {
      const match = String(dataSesi[i][0]).match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    const id = (form.id || ('SES-' + String(maxNum + 1).padStart(3, '0'))).trim();

    // Susun catatan komprehensif memuat jam, metode, materi dan evaluasi
    let formattedCatatan = form.catatan || '';
    if (!formattedCatatan && (form.jam || form.tipe_sesi || form.materi_detail || form.evaluasi)) {
      const parts = [];
      if (form.jam) parts.push(`[Jam: ${form.jam}]`);
      if (form.tipe_sesi) parts.push(`[${form.tipe_sesi}]`);
      if (form.materi_detail) parts.push(`Materi: ${form.materi_detail}.`);
      if (form.evaluasi) parts.push(`Evaluasi: ${form.evaluasi}`);
      formattedCatatan = parts.join(' ');
    }

    const rowData = [
      id,
      form.id_tentor || '',
      namaTentor,
      form.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
      form.kelas_siswa || '',
      form.mapel || '',
      durasi,
      totalHonor,
      form.status_bayar || 'Belum Dibayar',
      form.status_bayar === 'Lunas' ? (form.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd')) : '',
      formattedCatatan
    ];

    if (form.id) {
      let found = false;
      for (let i = 1; i < dataSesi.length; i++) {
        if (String(dataSesi[i][0]).trim() === id) {
          shSesi.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
          found = true;
          break;
        }
      }
      if (!found) shSesi.appendRow(rowData);
    } else {
      shSesi.appendRow(rowData);
    }
    SpreadsheetApp.flush();

    return { 
      success: true, 
      message: 'Sesi mengajar berhasil dicatat ke Google Sheets!', 
      id: id,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function bayarHonorTentor(payout) {
  try {
    const ss = getSpreadsheet();
    const shSesi = getOrCreateSheet(ss, SHEETS.SESI, ['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    const shKeu = getOrCreateSheet(ss, SHEETS.KEUANGAN, ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    
    const sesiIds = Array.isArray(payout.sesi_ids) ? payout.sesi_ids.map(String) : [String(payout.sesi_ids)];
    const tgl = payout.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
    let totalBayar = 0;
    let tentorName = payout.nama_tentor || '';
    let tentorId = payout.id_tentor || '';

    // Update status sesi
    const dataSesi = shSesi.getDataRange().getValues();
    for (let i = 1; i < dataSesi.length; i++) {
      const currentId = String(dataSesi[i][0]).trim();
      if (sesiIds.includes(currentId)) {
        shSesi.getRange(i + 1, 9).setValue('Lunas'); // Status Bayar
        shSesi.getRange(i + 1, 10).setValue(tgl); // Tanggal Bayar
        totalBayar += Number(dataSesi[i][7]) || 0;
        if (!tentorName) tentorName = dataSesi[i][2];
        if (!tentorId) tentorId = dataSesi[i][1];
      }
    }

    if (payout.total_override) {
      totalBayar = Number(payout.total_override);
    }

    // Catat ke Buku Kas Keuangan (Pengeluaran)
    const dataKeu = shKeu.getDataRange().getValues();
    let maxNum = 0;
    for (let i = 1; i < dataKeu.length; i++) {
      const match = String(dataKeu[i][0]).match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    const trxId = 'TRX-' + String(maxNum + 1).padStart(3, '0');
    const deskripsi = `Pembayaran Honor Tentor: ${tentorName} (${sesiIds.length} Sesi)`;

    shKeu.appendRow([
      trxId,
      tgl,
      'Pengeluaran',
      'Honor Tentor',
      deskripsi,
      totalBayar,
      payout.metode || 'Transfer',
      `${tentorId} (${tentorName})`,
      'Admin'
    ]);

    SpreadsheetApp.flush();

    return {
      success: true,
      message: `Honor ${tentorName} sebesar Rp ${totalBayar.toLocaleString('id-ID')} berhasil dibayarkan ke Google Sheets!`,
      trxId: trxId,
      tentorName: tentorName,
      totalBayar: totalBayar,
      sesiCount: sesiIds.length,
      tanggal: tgl,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function deleteSesi(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.SESI, ['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(id).trim()) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return { success: true, message: 'Sesi berhasil dihapus!' };
      }
    }
    return { success: false, error: 'Sesi tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// 5. PENCATATAN KEUANGAN (ARUS KAS) APIS
// ==========================================

function getKeuanganList() {
  try {
    const ss = getSpreadsheet();
    const shKeu = getOrCreateSheet(ss, SHEETS.KEUANGAN, ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    const rawData = getSheetDataAsObjects(shKeu);
    
    const data = rawData.map(k => {
      let jam = k['Waktu / Jam'] || '09:00 WIB';
      const desk = String(k['Deskripsi'] || '');
      const jamMatch = desk.match(/^\[([0-9:]+\s*(?:WIB|WITA|WIT)?)\]/i);
      if (jamMatch && jamMatch[1]) {
        jam = jamMatch[1].trim();
      }
      return {
        ...k,
        'Waktu / Jam': jam
      };
    });

    return { success: true, data: data };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function saveTransaksi(form) {
  try {
    if (!form) return { success: false, error: 'Data form kosong' };
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.KEUANGAN, ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    const data = sheet.getDataRange().getValues();
    
    let id = (form.id || '').trim();
    const isEdit = Boolean(id);
    
    let rowIndex = -1;
    if (isEdit) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === id) {
          rowIndex = i + 1;
          break;
        }
      }
    } else {
      let maxNum = 0;
      for (let i = 1; i < data.length; i++) {
        const match = String(data[i][0]).match(/\d+/);
        if (match) {
          const n = parseInt(match[0], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      id = 'TRX-' + String(maxNum + 1).padStart(3, '0');
    }

    let deskripsi = form.deskripsi || '';
    if (form.jam && !deskripsi.startsWith('[')) {
      deskripsi = `[${form.jam}] ${deskripsi}`;
    }

    const rowData = [
      id,
      form.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
      form.tipe || 'Pemasukan',
      form.kategori || 'Lainnya',
      deskripsi,
      Number(form.jumlah) || 0,
      form.metode || 'Transfer',
      form.referensi || '',
      form.dicatat_oleh || 'Admin'
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    SpreadsheetApp.flush();

    return { 
      success: true, 
      message: 'Transaksi kas berhasil dicatat ke Google Sheets!', 
      id: id,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl()
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function deleteTransaksi(id) {
  try {
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.KEUANGAN, ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)', 'Metode Pembayaran', 'Referensi / Nama', 'Dicatat Oleh']);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(id).trim()) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return { success: true, message: 'Transaksi kas berhasil dihapus!' };
      }
    }
    return { success: false, error: 'Transaksi tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// 6. PENGATURAN & NOTIFIKASI
// ==========================================

function getPengaturan() {
  try {
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.PENGATURAN, ['Parameter', 'Nilai']);
    const rows = sheet.getDataRange().getValues();
    const config = {};
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        config[rows[i][0]] = rows[i][1];
      }
    }
    return { success: true, config: config };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function savePengaturan(config) {
  try {
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss, SHEETS.PENGATURAN, ['Parameter', 'Nilai']);
    const rows = sheet.getDataRange().getValues();
    
    for (const key in config) {
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === String(key).trim()) {
          sheet.getRange(i + 1, 2).setValue(config[key]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, config[key]]);
      }
    }
    SpreadsheetApp.flush();
    return { success: true, message: 'Pengaturan berhasil diperbarui di Google Sheets!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function getPendingNotifications() {
  try {
    const ss = getSpreadsheet();
    const shSiswa = getOrCreateSheet(ss, SHEETS.SISWA, ['ID Siswa', 'Nama Lengkap', 'Kelas / Jenjang', 'Program / Paket', 'No WA Siswa', 'Nama Orang Tua', 'No WA Ortu', 'Nominal SPP', 'Status SPP Bulan Ini', 'Tanggal Daftar', 'Status']);
    const shSesi = getOrCreateSheet(ss, SHEETS.SESI, ['ID Sesi', 'ID Tentor', 'Nama Tentor', 'Tanggal', 'Kelas / Siswa', 'Mata Pelajaran', 'Durasi (Sesi)', 'Total Honor (Rp)', 'Status Bayar', 'Tanggal Bayar', 'Catatan']);
    const shTentor = getOrCreateSheet(ss, SHEETS.TENTOR, ['ID Tentor', 'Nama Lengkap', 'Mata Pelajaran', 'No WhatsApp', 'Honor Per Sesi (Rp)', 'Bank & No Rekening', 'Tanggal Bergabung', 'Status']);

    const siswaList = getSheetDataAsObjects(shSiswa);
    const sesiList = getSheetDataAsObjects(shSesi);
    const tentorList = getSheetDataAsObjects(shTentor);
    const configRes = getPengaturan();
    const config = configRes.config || {};

    // 1. Tagihan SPP Siswa Belum Lunas
    const sppPending = siswaList
      .filter(s => s['Status'] === 'Aktif' && s['Status SPP Bulan Ini'] === 'Belum Lunas')
      .map(s => {
        let msg = config.template_tagihan_wa || 'Halo Bapak/Ibu {ORANG_TUA}, kami dari *Grow Center* ingin menginformasikan tagihan bimbingan belajar ananda *{NAMA_SISWA}* sebesar *Rp {NOMINAL}*. Rekening: {REKENING}. Terima kasih!';
        msg = msg.replace('{ORANG_TUA}', s['Nama Orang Tua'] || 'Orang Tua')
                 .replace('{NAMA_SISWA}', s['Nama Lengkap'] || '')
                 .replace('{BULAN}', new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }))
                 .replace('{NOMINAL}', (Number(s['Nominal SPP']) || 0).toLocaleString('id-ID'))
                 .replace('{REKENING}', config.rekening_pembayaran || 'Hubungi Admin');
        
        const phone = cleanPhoneNumber(s['No WA Ortu'] || s['No WA Siswa']);
        const waLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : '#';

        return {
          id: s['ID Siswa'],
          nama: s['Nama Lengkap'],
          kelas: s['Kelas / Jenjang'],
          ortu: s['Nama Orang Tua'],
          phone: s['No WA Ortu'] || s['No WA Siswa'],
          nominal: Number(s['Nominal SPP']) || 0,
          waLink: waLink,
          pesan: msg
        };
      });

    // 2. Honor Tentor Belum Dibayar (Group by Tentor)
    const unpaidTutorsMap = {};
    sesiList.filter(ses => ses['Status Bayar'] === 'Belum Dibayar').forEach(ses => {
      const tId = ses['ID Tentor'];
      if (!unpaidTutorsMap[tId]) {
        const tentorObj = tentorList.find(t => t['ID Tentor'] === tId) || {};
        unpaidTutorsMap[tId] = {
          id: tId,
          nama: ses['Nama Tentor'] || tentorObj['Nama Lengkap'] || 'Tentor',
          phone: tentorObj['No WhatsApp'] || '',
          rekening: tentorObj['Bank & No Rekening'] || '',
          totalHonor: 0,
          sesiIds: [],
          sesiList: []
        };
      }
      unpaidTutorsMap[tId].totalHonor += Number(ses['Total Honor (Rp)']) || 0;
      unpaidTutorsMap[tId].sesiIds.push(ses['ID Sesi']);
      unpaidTutorsMap[tId].sesiList.push(ses);
    });

    const honorPending = Object.values(unpaidTutorsMap).map(t => {
      let msg = config.template_honor_wa || 'Halo *{NAMA_TENTOR}*, berikut rincian honor mengajar di *Grow Center* periode {PERIODE} sebesar *Rp {TOTAL_HONOR}*. Rekening: {BANK_TENTOR}. Terima kasih!';
      msg = msg.replace('{NAMA_TENTOR}', t.nama)
               .replace('{PERIODE}', new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }))
               .replace('{TOTAL_HONOR}', t.totalHonor.toLocaleString('id-ID'))
               .replace('{BANK_TENTOR}', t.rekening || 'Rekening Anda');
      
      const phone = cleanPhoneNumber(t.phone);
      const waLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : '#';

      return {
        id: t.id,
        nama: t.nama,
        phone: t.phone,
        rekening: t.rekening,
        totalHonor: t.totalHonor,
        sesiCount: t.sesiIds.length,
        sesiIds: t.sesiIds,
        waLink: waLink,
        pesan: msg
      };
    });

    return {
      success: true,
      sppPending: sppPending,
      honorPending: honorPending
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==========================================
// UTILITY HELPERS
// ==========================================

function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const results = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, 'GMT+7', 'yyyy-MM-dd');
      }
      obj[headers[j]] = val;
      if (val !== '' && val !== null && val !== undefined) hasData = true;
    }
    if (hasData) results.push(obj);
  }
  return results;
}

function parseDateString(dateVal) {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  const parts = String(dateVal).split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let str = String(phone).replace(/\D/g, '');
  if (str.startsWith('0')) {
    str = '62' + str.substring(1);
  } else if (str.startsWith('8')) {
    str = '62' + str;
  }
  return str;
}
