# 🎓 GROW CENTER - Sistem Informasi Manajemen Bimbel

Aplikasi manajemen operasional & pencatatan bimbingan belajar (bimbel) berbasis **Google Apps Script** dan **Google Sheets** dengan desain antarmuka modern (Modern SaaS UI/UX).

---

## 🌟 Fitur Utama & Menu Terpadu

1. **📊 Dashboard Lengkap dengan 3 Diagram Modern**:
   - **Kartu Metrik KPI**: Siswa Aktif, Tentor Aktif, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Tunggakan SPP Siswa, dan Honor Tentor Belum Dibayar.
   - **Diagram 1 (Arus Kas 6 Bulan)**: Smooth Area Spline Chart bergradasi modern membandingkan realisasi pemasukan SPP vs pengeluaran operasional & honor.
   - **Diagram 2 (Kelunasan SPP Siswa)**: Donut Chart interaktif dengan persentase kelunasan (`% Lunas`) dan highlight tunggakan.
   - **Diagram 3 (Distribusi Sesi & Produktivitas Tentor)**: Bar Chart modern menunjukkan akumulasi jam/sesi mengajar per pengajar.
   - Log transaksi keuangan terkini & sesi mengajar terbaru secara realtime.
   - Tombol *Quick Action*: Bayar SPP Cepat, Catat Sesi Baru, Tambah Transaksi, dan Buka Google Spreadsheet.

2. **💰 Pencatatan Keuangan (Arus Kas & Buku Kas)**:
   - Catat pemasukan (SPP, formulir pendaftaran, modul) & pengeluaran (honor tentor, listrik, ATK, operasional).
   - Filter lengkap: Rentang tanggal, tipe transaksi, kategori, dan pencarian.
   - Ringkasan otomatis Total Pemasukan, Total Pengeluaran, dan Saldo Bersih.
   - Ekspor data laporan keuangan ke file **CSV / Excel** & cetak kuitansi transaksi.

3. **👨‍🎓 Manajemen Data Siswa (5 Data Dummy Realistis)**:
   - 5 Siswa: `SIS-001` (Ananda Pratama), `SIS-002` (Clarissa Putri), `SIS-003` (Dimas Satria), `SIS-004` (Elena Syahira), `SIS-005` (Farhan Al-Ghifari).
   - Database murid, kelas/jenjang, paket bimbel, nominal SPP bulanan, dan kontak orang tua.
   - Indikator status SPP bulanan: **Lunas** (hijau) atau **Belum Lunas** (merah).
   - Fitur **Bayar SPP 1-Klik**: otomatis mengubah status murid menjadi Lunas dan mencatat transaksi ke Buku Kas.
   - Tombol langsung kirim tagihan via WhatsApp.

4. **🧑‍🏫 Manajemen Data Tentor / Tutor (5 Data Dummy Realistis)**:
   - 5 Tentor: `TTR-001` (Kak Fikri, S.Pd), `TTR-002` (Kak Sarah, M.Si), `TTR-003` (Kak Budi, S.Hum), `TTR-004` (Kak Nisa, S.Si), `TTR-005` (Kak Reza, S.E).
   - Database biodata pengajar, mata pelajaran yang diampu, nomor WhatsApp, honor per sesi (Rp), dan rekening bank tujuan.
   - Tombol hubungi WhatsApp 1-klik untuk setiap pengajar.

5. **📝 Sesi Mengajar & Pembayaran Honor Tentor (Payroll)**:
   - Pencatatan jam/sesi mengajar tentor dengan kalkulasi honor otomatis berdasarkan tarif per sesi tentor.
   - Filter sesi yang belum terbayar (*Pending Payout*) vs sudah lunas.
   - Fitur **Pencairan Honor Tentor** (single atau batch): otomatis mencatat pengeluaran ke Buku Kas dan menghasilkan **Slip Honor Digital** siap cetak / PDF.

6. **💬 Pusat Notifikasi & Tagihan (WhatsApp Hub)**:
   - Deteksi otomatis siswa yang menunggak SPP pada bulan berjalan.
   - Deteksi otomatis tentor yang honor sesinya belum dicairkan.
   - **Tautan WhatsApp 1-Klik (`wa.me`)** dengan pesan ramah, sopan, dan terformat otomatis mencantumkan nama murid/tentor, nominal, nomor rekening bimbel, dan rincian periode.

7. **⚙️ Pengaturan & Manajemen Google Spreadsheet**:
   - Integrasi otomatis Google Spreadsheet (Auto-Detect, Auto-Create, Menu `onOpen` di Google Sheets).
   - Ubah profil bimbel (Nama Bimbel, Slogan, Alamat, No WA Admin, No Rekening Bank).
   - Kustomisasi Template Pesan Tagihan SPP & Template Pesan Honor Tentor.
   - Tombol Setup / Reset Otomatis Database Google Sheets.

8. **🖨️ Kuitansi & Bukti Pembayaran Digital**:
   - Generator kuitansi resmi lengkap dengan nomor transaksi, tanggal, cap status Lunas, dan format siap cetak/simpan PDF (`Ctrl + P` / `window.print()`).

---

## 📁 Struktur Berkas

- [`Setup.gs`](file:///c:/Users/User/Documents/antigravity/proud-noether/Setup.gs) : Skrip inisialisasi tabel database Spreadsheet (`Siswa`, `Tentor`, `SesiTentor`, `Keuangan`, `Pengaturan`) dengan data 5 siswa dan 5 tentor.
- [`Code.gs`](file:///c:/Users/User/Documents/antigravity/proud-noether/Code.gs) : Backend Google Apps Script (Auto-connect & Auto-create Google Spreadsheet, menu `onOpen`, CRUD, kalkulasi analitik, slip honor, dan generator pesan WhatsApp).
- [`Index.html`](file:///c:/Users/User/Documents/antigravity/proud-noether/Index.html) : Antarmuka Web App frontend untuk Google Apps Script sekaligus preview browser offline mandiri (LocalStorage).
- [`PANDUAN_SETUP.md`](file:///c:/Users/User/Documents/antigravity/proud-noether/PANDUAN_SETUP.md) : Panduan lengkap langkah demi langkah untuk men-deploy aplikasi ke Google Apps Script dan Google Spreadsheet.
