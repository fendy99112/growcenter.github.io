# 📖 PANDUAN INTEGRASI SPREADSHEET: GROW CENTER

Aplikasi **Grow Center** telah dikonfigurasi dan diintegrasikan secara permanen ke Google Spreadsheet target:
🔗 **URL Spreadsheet**: [https://docs.google.com/spreadsheets/d/1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA/edit](https://docs.google.com/spreadsheets/d/1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA/edit)  
🆔 **Spreadsheet ID**: `1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA`

---

## ⚡ Langkah Mudah Memasang Script di Spreadsheet Target

### Langkah 1: Buka Google Apps Script dari Spreadsheet Anda
1. Buka spreadsheet: [https://docs.google.com/spreadsheets/d/1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA/edit](https://docs.google.com/spreadsheets/d/1smfixcCWptAcWRlAi8FN3to0k7m_2SWAXukx-pTTLPA/edit)
2. Di menu atas Google Spreadsheet, klik **Ekstensi** (*Extensions*) &rarr; **Apps Script**.
3. Tab editor Google Apps Script akan terbuka.

---

### Langkah 2: Salin File `Code.gs` & `Setup.gs`
1. Di file `Code.gs` bawaan editor, hapus seluruh kodenya.
2. Salin seluruh isi dari [`Code.gs`](file:///c:/Users/User/Documents/antigravity/proud-noether/Code.gs) lalu tempelkan (*paste*) ke file `Code.gs` di editor.
3. Klik ikon **+** (Tambah file) &rarr; pilih **Script** &rarr; beri nama **`Setup`** (menjadi `Setup.gs`).
4. Salin seluruh isi dari [`Setup.gs`](file:///c:/Users/User/Documents/antigravity/proud-noether/Setup.gs) lalu tempelkan ke file `Setup.gs`.
5. Tekan **Ctrl + S** untuk menyimpan.

---

### Langkah 3: Tambahkan File Antarmuka `Index.html`
1. Di panel kiri bagian **Files**, klik tombol **+** &rarr; pilih **HTML**.
2. Beri nama file: **`Index`** (tanpa menuliskan `.html`).
3. Hapus isi bawaannya, lalu salin seluruh isi dari [`Index.html`](file:///c:/Users/User/Documents/antigravity/proud-noether/Index.html) dan tempelkan ke editor.
4. Tekan **Ctrl + S** untuk menyimpan.

---

### Langkah 4: Inisialisasi Database (1-Klik)
1. Pada menu pilihan fungsi di bagian atas (di samping tombol *Run/Jalankan*), pilih fungsi **`setupDatabase`**.
2. Klik tombol **Run** (Jalankan).
3. Jika muncul jendela otorisasi izin (*Review Permissions*):
   - Klik **Review Permissions** &rarr; Pilih akun Google Anda.
   - Klik **Advanced** (Tingkat Lanjut) &rarr; Klik **Go to Grow Center App (unsafe)**.
   - Klik **Allow** (Izinkan).
4. Selesai! Buka kembali spreadsheet Anda, seluruh 5 sheet (`Siswa`, `Tentor`, `SesiTentor`, `Keuangan`, `Pengaturan`) beserta 5 data siswa dummy, 5 data tentor dummy, 6 sesi, 6 transaksi kas, rumus total, dan format warna modern akan langsung terpasang otomatis!

---

### Langkah 5: Publikasikan Aplikasi Web (Deploy Web App)
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy** &rarr; **New deployment**.
2. Klik ikon gerigi ⚙️ di sebelah *Select type* &rarr; pilih **Web app**.
3. Atur konfigurasi:
   - **Description**: `Grow Center V2.0`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone`
4. Klik tombol **Deploy**.
5. Salin URL Web App yang dihasilkan (contoh: `https://script.google.com/macros/s/AKfycb.../exec`).
6. Buka URL tersebut di browser atau smartphone Anda untuk mulai mengelola bimbel Grow Center!
