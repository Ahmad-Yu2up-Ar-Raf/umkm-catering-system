**DOKUMEN PENGUJIAN (TESTING)**

**Platform Hybrid & Mini POS Catering Nusantara**

| Nama Kelompok | Kelompok Project Catering |
| :---- | :---- |
| Klien / UMKM | Catering Nusantara (Bu Eva) |
| Anggota Pengembang | Ahmad Yusuf Ar-Rafi Deniz Rizki Attila Thoriq Azhar Raditya |
| Kelas / Instansi | XII RPL \- SMK Informatika Pesat |
| Tanggal Pengujian | 7 September 2026 |
| Teknologi Sistem | *Frontend:* React \+ Vite (SPA) | *Backend:* Laravel \+ Neon |

# **A. Jenis Pengujian yang Digunakan**

Pengujian ini dilakukan secara komprehensif menggunakan standar kualitas perangkat lunak premium, menggabungkan empat metode pengujian untuk memastikan platform berfungsi sempurna dari sisi pelanggan maupun pengelola dapur:

* **Pengujian Fungsional (Blackbox Testing):** Menguji akurasi algoritma *Frontend Calculator*, integrasi WhatsApp, dan sistem *Internal Mini POS* tanpa melihat struktur kode sumber.  
* **Pengujian Kompatibilitas (Compatibility Testing):** Memastikan arsitektur *Single Page Application* (SPA) berbasis React \+ Vite berjalan sangat cepat dan responsif di berbagai perangkat.  
* **Pengujian Usability (Kemudahan Penggunaan):** Menilai pengalaman antarmuka pengguna, kejelasan filosofi desain *Down To Earth*, dan keterbacaan tipografi Merriweather & Figtree.  
* **User Acceptance Test (UAT):** Persetujuan akhir dari pihak klien (Ibu Eva) bahwa sistem telah menyelesaikan masalah kalkulasi manual dan risiko nota fisik tercecer.

# **B. Pengujian Fungsional (Blackbox Testing)**

*Bagian ini diisi oleh Tim Tester untuk memvalidasi fitur-fitur utama platform Hybrid Catering Nusantara.*

| Website / Kelompok yang Diuji |  |
| :---- | :---- |
| Kelompok Tester (Penguji) |  |
| Nama Anggota  |  |

| No | Halaman / Fitur | Skenario Pengujian (+) /  | Hasil yang Diharapkan | Hasil Aktual | Status | Catatan |
| ----- | :---- | :---- | :---- | ----- | ----- | ----- |
| 1 | **Landing Page (Beranda)** | \+ : Membuka website pertama kali untuk melihat visual utama \- :  | Tampil desain *Earth Tone*, tipografi premium, dan *showcase* menu 'Best Seller' menggunakan foto dokumentasi asli (bukan *stock photo*) |  |  |  |
| 2 | **Katalog Terpadu (Filter & Search)** | Mencari paket menggunakan bilah pencarian dan mengklik filter kategori | Sistem menyaring menu secara akurat berdasarkan kategori (Nasi Box, Prasmanan, Snack Box, Tumpeng Mini)  |  |  |  |
| 3 | **Frontend Calculator** | Memasukkan angka jumlah porsi (Pax) pada detail paket katering | Sistem secara instan dan presisi menampilkan estimasi total harga kalkulasi otomatis |  |  |  |
| 4 | **Integrasi WhatsApp** | Mengklik tombol pemesanan setelah simulasi kalkulator porsi selesai | Tautan mengarahkan langsung ke WhatsApp Ibu Eva dengan format rincian pesanan otomatis (Konversi Langsung) |  |  |  |
| 5 | **Login & Otentikasi Admin** | Mengisi *username/password* pada halaman *login* admin | Sistem memvalidasi kredensial dan mengarahkan pengguna ke Dashboard Admin dengan aman |  |  |  |
| 6 | **Dashboard Statistik Admin** | Memantau layar utama Dashboard Admin setelah *login* | Menampilkan grafik volume pesanan harian dan performa menu secara *real-time* |  |  |  |
| 7 | **Manajemen Paket Menu** | Melakukan *update* harga atau menambah menu catering baru di *database* | Perubahan harga/paket tersimpan ke *database* Neon dan langsung diperbarui di halaman Katalog Publik |  |  |  |
| 8 | **Internal Mini POS (Input Pesanan)** | Memasukkan rincian pesanan pelanggan dari WhatsApp ke dalam sistem POS | Pesanan tercatat di sistem digital; fitur *Admin Snapshot Price* aktif untuk mengunci harga transaksi secara otomatis |  |  |  |
| 9 | **Auto-Generator Invoice** | Mengklik tombol "Cetak Struk Digital" pada pesanan yang telah dikonfirmasi | Sistem menerbitkan kuitansi profesional berformat otomatis (misal: `STR-YYYYMMDD-XXXX`) yang siap dikirim ke pelanggan |  |  |  |

# **C. Pengujian Kompatibilitas (Compatibility Testing)**

*Sistem harus berjalan lancar tanpa hambatan visual (responsive) mengingat target trafik lokal Bogor akan mengakses website dari berbagai gawai.*

| No | Perangkat & Browser | Aspek yang Diperiksa | Hasil Pengamatan | Status |
| ----- | :---- | :---- | :---- | ----- |
| 1 | Laptop/PC \- Google Chrome | Skala UI penuh, visibilitas *Dashboard Admin* dan *Mini POS* |  |  |
| 2 | Laptop/PC \- Safari / Edge | Kinerja *backend* Laravel, transisi SPA React yang super cepat |  |  |
| 3 | Tablet (iPad / Android Tab) | Tampilan *grid* katalog menu dan form kalkulator porsi |  |  |
| 4 | Smartphone \- Chrome (Android) | Responsivitas tombol *Filter Menu* dan integrasi klik WhatsApp |  |  |
| 5 | Smartphone \- Safari (iOS) | Keterbacaan teks (Merriweather & Figtree) di layar kecil |  |  |

# **D. Pengujian Usability (Kemudahan Penggunaan)**

*Pengujian sudut pandang pelanggan/admin untuk memastikan solusi ini benar-benar menyelesaikan masalah operasional dapur Catering Nusantara.*

| No | Pernyataan / Indikator Penilaian | Ya | Tidak | Catatan / Masukan |
| ----- | :---- | ----- | ----- | :---- |
| 1 | Pelanggan dapat dengan mudah menghitung estimasi biaya menggunakan *Frontend Calculator* tanpa perlu bertanya manual |  |  |  |
| 2 | Tombol *checkout* ke WhatsApp mudah ditemukan dan format pesan otomatis sangat jelas |  |  |  |
| 3 | Penggunaan foto asli dan palet warna *Earth Tone* berhasil memberikan kesan terpercaya, profesional, dan "Down To Earth" |  |  |  |
| 4 | Admin dapur merasa fitur *Internal Mini POS* mempercepat proses pencatatan dibanding menulis di kertas/nota fisik |  |  |  |
| 5 | Hasil cetak struk digital (*Invoice*) terlihat profesional dan format penomorannya rapi |  |  |  |

# **E. Kesimpulan Pengujian**

*(Bagian ini diisi setelah seluruh proses rotasi pengujian selesai dilakukan. Tuliskan ringkasan hasil performa website, tingkat keberhasilan penyelesaian bug, dan persetujuan kesiapan sistem (Fase 1: Digitalisasi & POS) sebelum dirilis ke lingkungan produksi / diserahkan kepada klien).*

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

