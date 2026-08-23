/**
 * =========================================================================
 * GROW CENTER - BIMBEL MANAGEMENT SYSTEM
 * File: Setup.gs (Inisialisasi Database & Pengaturan Google Spreadsheet)
 * =========================================================================
 */

const TARGET_SPREADSHEET_ID = '1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA';

function setupDatabase() {
  return setupDatabaseUtama();
}

function setupDatabaseUtama(targetSS) {
  let ss = targetSS;
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {}
  }
  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    } catch (e) {
      Logger.log("Gagal membuka spreadsheet target: " + e.toString());
    }
  }

  if (!ss) {
    throw new Error("Spreadsheet target tidak ditemukan. Harap pastikan script memiliki izin akses ke spreadsheet ID: " + TARGET_SPREADSHEET_ID);
  }

  Logger.log("Memulai inisialisasi database Grow Center pada spreadsheet: " + ss.getName() + " (" + ss.getUrl() + ")...");

  // 1. Inisialisasi Sheet SISWA (5 Data Siswa Lengkap)
  setupSheetSiswa(ss);

  // 2. Inisialisasi Sheet TENTOR (5 Data Tentor Lengkap)
  setupSheetTentor(ss);

  // 3. Inisialisasi Sheet SESI MENGAJAR (6 Data Sesi Mengajar)
  setupSheetSesi(ss);

  // 4. Inisialisasi Sheet KEUANGAN (Data Arus Kas Realistis 6 Bulan)
  setupSheetKeuangan(ss);

  // 5. Inisialisasi Sheet PENGATURAN
  setupSheetPengaturan(ss);

  // Hapus 'Sheet1' default jika masih ada
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      Logger.log("Sheet1 default: " + e.toString());
    }
  }

  SpreadsheetApp.flush();
  Logger.log("Inisialisasi database selesai! URL: " + ss.getUrl());
  
  return {
    success: true,
    message: "Database Grow Center berhasil disiapkan dengan 5 Data Siswa & 5 Data Tentor lengkap!",
    sheetUrl: ss.getUrl()
  };
}

/**
 * 1. Setup Sheet Siswa - 5 Siswa Lengkap
 */
function setupSheetSiswa(ss) {
  let sheet = ss.getSheetByName('Siswa') || ss.insertSheet('Siswa');
  sheet.clear();

  const headers = [
    'ID Siswa', 
    'Nama Lengkap', 
    'Kelas / Jenjang', 
    'Program / Paket', 
    'No WA Siswa', 
    'Nama Orang Tua', 
    'No WA Ortu', 
    'Nominal SPP', 
    'Status SPP Bulan Ini', 
    'Tanggal Daftar', 
    'Status'
  ];
  sheet.appendRow(headers);
  formatHeaderStyle(sheet, '#4F46E5');

  // 5 Data Siswa Dummy Lengkap
  const sampleData = [
    ['SIS-001', 'Ananda Pratama', '12 SMA - IPA', 'Reguler Intensif UTBK SNBT', '081234567890', 'Bpk. Bambang', '081298765432', 450000, 'Lunas', '2026-01-10', 'Aktif'],
    ['SIS-002', 'Clarissa Putri', '9 SMP', 'Privat 3x Seminggu Juara', '081345678901', 'Ibu Ratna', '081387654321', 600000, 'Belum Lunas', '2026-01-15', 'Aktif'],
    ['SIS-003', 'Dimas Satria', '11 SMA - IPS', 'Semi Privat Soshum Mandiri', '081456789012', 'Bpk. Hendra', '081476543210', 400000, 'Lunas', '2026-02-01', 'Aktif'],
    ['SIS-004', 'Elena Syahira', '6 SD', 'Bimbel Juara Masuk SMP Favorit', '081567890123', 'Ibu Maya', '081565432109', 350000, 'Belum Lunas', '2026-02-10', 'Aktif'],
    ['SIS-005', 'Farhan Al-Ghifari', '12 SMA - IPA', 'Kedokteran & Kedinasan Class', '081678901234', 'Bpk. Dr. Gunawan', '081654321098', 750000, 'Belum Lunas', '2026-02-20', 'Aktif']
  ];

  sampleData.forEach(row => sheet.appendRow(row));

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 210);
  sheet.setColumnWidth(5, 130);
  sheet.setColumnWidth(6, 160);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 140);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 120);
  sheet.setColumnWidth(11, 100);

  sheet.getRange(2, 8, sheet.getLastRow() - 1, 1).setNumberFormat('"Rp"#,##0');
}

/**
 * 2. Setup Sheet Tentor - 5 Tentor Lengkap
 */
function setupSheetTentor(ss) {
  let sheet = ss.getSheetByName('Tentor') || ss.insertSheet('Tentor');
  sheet.clear();

  const headers = [
    'ID Tentor', 
    'Nama Lengkap', 
    'Mata Pelajaran', 
    'No WhatsApp', 
    'Honor Per Sesi (Rp)', 
    'Bank & No Rekening', 
    'Tanggal Bergabung', 
    'Status'
  ];
  sheet.appendRow(headers);
  formatHeaderStyle(sheet, '#4F46E5');

  // 5 Data Tentor Dummy Lengkap
  const sampleData = [
    ['TTR-001', 'Kak Fikri, S.Pd', 'Matematika & Fisika SMA', '081901234567', 75000, 'BCA 123456789 a.n Fikri Hidayat', '2025-10-01', 'Aktif'],
    ['TTR-002', 'Kak Sarah, M.Si', 'Kimia & Biologi SMA', '081912345678', 80000, 'Mandiri 987654321 a.n Sarah Amalia', '2025-11-05', 'Aktif'],
    ['TTR-003', 'Kak Budi, S.Hum', 'Bahasa Inggris TOEFL & Indo', '081923456789', 70000, 'BNI 5544332211 a.n Budi Santoso', '2026-01-02', 'Aktif'],
    ['TTR-004', 'Kak Nisa, S.Si', 'Matematika & Sains SD/SMP', '081934567890', 65000, 'BRI 0192837465 a.n Annisa Rahma', '2026-01-20', 'Aktif'],
    ['TTR-005', 'Kak Reza, S.E', 'Ekonomi & Akuntansi SMA', '081945678901', 75000, 'BSI 7123456789 a.n Reza Pratama', '2026-02-05', 'Aktif']
  ];

  sampleData.forEach(row => sheet.appendRow(row));

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 210);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 230);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 100);

  sheet.getRange(2, 5, sheet.getLastRow() - 1, 1).setNumberFormat('"Rp"#,##0');
}

/**
 * 3. Setup Sheet Sesi Mengajar Tentor
 */
function setupSheetSesi(ss) {
  let sheet = ss.getSheetByName('SesiTentor') || ss.insertSheet('SesiTentor');
  sheet.clear();

  const headers = [
    'ID Sesi', 
    'ID Tentor', 
    'Nama Tentor', 
    'Tanggal', 
    'Kelas / Siswa', 
    'Mata Pelajaran', 
    'Durasi (Sesi)', 
    'Total Honor (Rp)', 
    'Status Bayar', 
    'Tanggal Bayar', 
    'Catatan'
  ];
  sheet.appendRow(headers);
  formatHeaderStyle(sheet, '#4F46E5');

  // Sesi mengajar realistis mencakup ke-5 tentor
  const sampleData = [
    ['SES-001', 'TTR-001', 'Kak Fikri, S.Pd', '2026-08-15', '12 SMA - IPA (Ananda Pratama)', 'Matematika Saintek', 1, 75000, 'Lunas', '2026-08-20', 'Sesi berjalan lancar'],
    ['SES-002', 'TTR-001', 'Kak Fikri, S.Pd', '2026-08-18', '12 SMA - IPA (Farhan Al-Ghifari)', 'Fisika Dinamika & Gerak', 1.5, 112500, 'Belum Dibayar', '', 'Fokus latihan soal UTBK'],
    ['SES-003', 'TTR-002', 'Kak Sarah, M.Si', '2026-08-19', '9 SMP (Clarissa Putri)', 'Kimia Dasar & Biologi', 1, 80000, 'Belum Dibayar', '', 'Materi persiapan ujian'],
    ['SES-004', 'TTR-003', 'Kak Budi, S.Hum', '2026-08-21', '6 SD (Elena Syahira)', 'Bahasa Inggris Grammar & Vocab', 1, 70000, 'Belum Dibayar', '', 'Siswa sangat aktif'],
    ['SES-005', 'TTR-004', 'Kak Nisa, S.Si', '2026-08-22', '11 SMA - IPS (Dimas Satria)', 'Matematika Dasar & Aljabar', 1, 65000, 'Belum Dibayar', '', ''],
    ['SES-006', 'TTR-005', 'Kak Reza, S.E', '2026-08-22', '11 SMA - IPS (Dimas Satria)', 'Ekonomi & Akuntansi Keuangan', 1.5, 112500, 'Belum Dibayar', '', 'Bab Laporan Laba Rugi']
  ];

  sampleData.forEach(row => sheet.appendRow(row));

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 170);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 180);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 140);
  sheet.setColumnWidth(9, 120);
  sheet.setColumnWidth(10, 120);
  sheet.setColumnWidth(11, 190);

  sheet.getRange(2, 8, sheet.getLastRow() - 1, 1).setNumberFormat('"Rp"#,##0');
}

/**
 * 4. Setup Sheet Keuangan (Arus Kas)
 */
function setupSheetKeuangan(ss) {
  let sheet = ss.getSheetByName('Keuangan') || ss.insertSheet('Keuangan');
  sheet.clear();

  const headers = [
    'ID Transaksi', 
    'Tanggal', 
    'Tipe', 
    'Kategori', 
    'Deskripsi', 
    'Jumlah (Rp)', 
    'Metode Pembayaran', 
    'Referensi / Nama', 
    'Dicatat Oleh'
  ];
  sheet.appendRow(headers);
  formatHeaderStyle(sheet, '#4F46E5');

  const sampleData = [
    ['TRX-001', '2026-08-01', 'Pemasukan', 'SPP Siswa', 'Pembayaran SPP Agustus - Ananda Pratama', 450000, 'Transfer BCA', 'SIS-001 (Ananda)', 'Admin'],
    ['TRX-002', '2026-08-02', 'Pemasukan', 'SPP Siswa', 'Pembayaran SPP Agustus - Dimas Satria', 400000, 'Tunai', 'SIS-003 (Dimas)', 'Admin'],
    ['TRX-003', '2026-08-05', 'Pengeluaran', 'Operasional & Listrik', 'Tagihan Listrik & WiFi Kantor Bimbel', 350000, 'Transfer Mandiri', 'Operasional', 'Admin'],
    ['TRX-004', '2026-08-10', 'Pengeluaran', 'ATK & Modul', 'Cetak Modul Belajar Semester Ganjil', 220000, 'Tunai', 'Pengadaan', 'Admin'],
    ['TRX-005', '2026-08-12', 'Pemasukan', 'Pendaftaran', 'Biaya Pendaftaran Siswa Baru - Farhan Al-Ghifari', 150000, 'Transfer BCA', 'SIS-005 (Farhan)', 'Admin'],
    ['TRX-006', '2026-08-20', 'Pengeluaran', 'Honor Tentor', 'Pembayaran Honor Kak Fikri (SES-001)', 75000, 'Transfer BCA', 'TTR-001 (Fikri)', 'Admin']
  ];

  sampleData.forEach(row => sheet.appendRow(row));

  sheet.setColumnWidth(1, 110);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 110);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 270);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(8, 180);
  sheet.setColumnWidth(9, 110);

  sheet.getRange(2, 6, sheet.getLastRow() - 1, 1).setNumberFormat('"Rp"#,##0');
}

/**
 * 5. Setup Sheet Pengaturan
 */
function setupSheetPengaturan(ss) {
  let sheet = ss.getSheetByName('Pengaturan') || ss.insertSheet('Pengaturan');
  sheet.clear();

  sheet.appendRow(['Parameter', 'Nilai']);
  formatHeaderStyle(sheet, '#4F46E5');

  const config = [
    ['nama_bimbel', 'Grow Center'],
    ['tagline', 'Solusi Belajar Berprestasi & Menyenangkan'],
    ['alamat', 'Jl. Pendidikan Mandiri No. 88, Kota Belajar'],
    ['no_wa_admin', '081234567890'],
    ['rekening_pembayaran', 'BCA: 8735019283 a.n Grow Center Official | Mandiri: 1320098765432'],
    ['template_tagihan_wa', 'Halo Bapak/Ibu {ORANG_TUA}, kami dari *Grow Center* ingin menginformasikan tagihan bimbingan belajar ananda *{NAMA_SISWA}* untuk periode *{BULAN}* sebesar *Rp {NOMINAL}*. Pembayaran dapat ditransfer melalui: {REKENING}. Konfirmasi via chat ini ya. Terima kasih! 🙏'],
    ['template_honor_wa', 'Halo *{NAMA_TENTOR}*, berikut konfirmasi pembayaran honor mengajar Anda di *Grow Center* untuk periode *{PERIODE}* sebesar *Rp {TOTAL_HONOR}* telah ditransfer ke rekening {BANK_TENTOR}. Rincian sesi terlampir. Terima kasih atas dedikasinya! 🌟']
  ];

  config.forEach(row => sheet.appendRow(row));

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 600);
}

function formatHeaderStyle(sheet, hexColor) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  range.setBackground(hexColor)
       .setFontColor('#FFFFFF')
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);
}

function testKoneksiDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().map(s => s.getName());
  return {
    spreadsheetName: ss.getName(),
    sheetsAvailable: sheets
  };
}
