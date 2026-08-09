/**
 * FAQ dataset — Catering Nusantara.
 *
 * Every fact below is sourced from the project's real documents:
 *  - backend/docs/database-seeders.md   (the 5 real paket: menu, price, min order, capacity)
 *  - docs/project-context.md            (business identity, event types, order flow)
 *  - docs/seo/content/brief-*.md        (serving areas, corporate subscriptions, transparency)
 *  - docs/architecture.md               (how-to-order flow: chat → confirm → DP → H-1 → struk)
 *
 * No invented numbers: where a detail is unconfirmed by the client, the copy says
 * "konsultasikan via WhatsApp" instead of fabricating a value.
 */

export type FaqCategory = {
  id: string
  label: string
  description: string
}

export type FaqItem = {
  id: string
  category: string
  title: string
  content: string
}

export const WHATSAPP_URL = "https://wa.me/628561155113"

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "pemesanan-pengiriman",
    label: "Pemesanan & Pengiriman",
    description: "Minimal porsi · area · jadwal",
  },
  {
    id: "paket-menu",
    label: "Paket & Menu",
    description: "Isi · harga · kustom",
  },
  {
    id: "acara-layanan",
    label: "Acara & Layanan",
    description: "Event · skala · fasilitas",
  },
  {
    id: "pembayaran-struk",
    label: "Pembayaran & Struk",
    description: "Transfer · DP · struk resmi",
  },
]
export const FAQ_ITEMS: FaqItem[] = [
  /* ─────────────────────────── Pemesanan & Pengiriman ─────────────────────────── */
  {
    id: "minimal-porsi",
    category: "pemesanan-pengiriman",
    title: "Berapa porsi minimum untuk setiap paket?",
    content:
      "Setiap paket punya minimum pemesanan yang berbeda:\n- Nasi Box Hemat mulai 20 porsi\n- Snack Box Arisan mulai 15 box\n- Prasmanan Pernikahan mulai 100 porsi\n- Prasmanan Korporat mulai 50 porsi\n\nTumpeng Mini dihitung per paket — satu paket berisi 10 porsi dan sudah bisa dipesan.",
  },
  {
    id: "area-pengantaran",
    category: "pemesanan-pengiriman",
    title: "Apakah bisa pesan untuk acara di luar Bogor?",
    content:
      "Bisa. Kami melayani Bogor dan sekitarnya:\n- Depok\n- Cibinong\n- Sentul\n- Cileungsi\n- Jakarta (Jabodetabek)\n\nBiaya antar dihitung sesuai jarak; konfirmasikan alamat acara via WhatsApp agar kami sampaikan estimasi waktu dan biaya pengantaran.",
  },
  {
    id: "waktu-pemesanan",
    category: "pemesanan-pengiriman",
    title: "Berapa jauh hari sebelumnya harus memesan?",
    content:
      "Semakin awal semakin baik, terutama untuk acara besar. Untuk prasmanan 100+ porsi sebaiknya beri kami waktu minimal H-7 agar bahan dan tenaga bisa disiapkan. Untuk nasi box atau snack box, konsultasikan jadwal Anda via WhatsApp — kami sesuaikan dengan kapasitas produksi harian (20–1000 porsi).",
  },
  {
    id: "alur-pemesanan",
    category: "pemesanan-pengiriman",
    title: "Bagaimana alur pemesanan dari awal sampai selesai?",
    content:
      "Alurnya sederhana — semuanya lewat satu percakapan WhatsApp:\n1. Pilih paket di katalog dan hitung porsi sesuai tamu.\n2. Kirim detail pesanan lewat WhatsApp.\n3. Kami konfirmasi menu dan harga.\n4. Transfer uang muka sesuai kesepakatan.\n5. H-1 kami hubungi untuk konfirmasi akhir.\n6. Pesanan diantar atau disajikan sesuai jadwal, lalu Anda menerima struk resmi.",
  },
  {
    id: "pesanan-dadakan",
    category: "pemesanan-pengiriman",
    title: "Apakah melayani pesanan dadakan?",
    content:
      "Kami memasak di hari yang sama dengan bahan segar, jadi ketersediaan pesanan dadakan bergantung pada kapasitas produksi saat itu. Untuk pesanan mendadak, langsung hubungi WhatsApp kami — tim akan memberi tahu apakah slot produksi masih terbuka untuk jadwal acara Anda.",
  },
  {
    id: "cara-pengiriman",
    category: "pemesanan-pengiriman",
    title: "Bagaimana pengiriman atau penyajian dilakukan?",
    content:
      "Pesanan diantar sesuai jadwal acara agar makanan tiba dalam keadaan hangat. Untuk prasmanan, tim kami menyiapkan penataan meja lengkap dengan chafing dish dan alat saji. Detail jadwal, area, dan biaya antar selalu dikonfirmasi bersama sebelum acara.",
  },

  /* ─────────────────────────────── Paket & Menu ─────────────────────────────── */
  {
    id: "daftar-paket",
    category: "paket-menu",
    title: "Paket apa saja yang tersedia?",
    content:
      "Saat ini ada **lima paket**:\n- Paket Nasi Box Hemat mulai Rp22.000/porsi\n- Paket Prasmanan Pernikahan Rp45.000/porsi\n- Paket Snack Box Arisan mulai Rp18.000/box\n- Paket Tumpeng Mini Rp250.000 per paket (10 porsi)\n- Paket Prasmanan Korporat Rp55.000/porsi\n\nNasi Box Hemat dan Tumpeng Mini adalah *menu andalan* kami.",
  },
  {
    id: "isi-nasi-box",
    category: "paket-menu",
    title: "Apa isi Paket Nasi Box Hemat?",
    content:
      "Nasi putih lengkap dengan lauk dan sayur:\n- Ayam goreng\n- Tempe orek\n- Sayur sop\n- Kerupuk dan air mineral gelas\n\nAyamnya segar harian dan dimasak tanpa MSG tambahan. Harga Rp22.000/porsi dengan minimal 20 porsi — pilihan praktis dan mengenyangkan untuk rapat atau jamuan kantor.",
  },
  {
    id: "isi-snack-box",
    category: "paket-menu",
    title: "Apa isi Snack Box Arisan?",
    content:
      "Satu box berisi **empat jenis kue basah**:\n- Risoles\n- Lumpia\n- Kue lapis\n- Pastel\n\nSemua digoreng mendadak dengan bahan segar, bukan stok beku, dan dilengkapi air mineral botol kecil. Harga mulai Rp18.000/box dengan minimal 15 box.",
  },
  {
    id: "harga-tumpeng",
    category: "paket-menu",
    title: "Berapa harga Tumpeng Mini?",
    content:
      "Tumpeng Mini dihargai Rp250.000 per paket, dan satu paket sudah berisi 10 porsi. Jadi yang Anda lihat adalah harga per paket, bukan per porsi. Minimal pemesanan satu paket, cocok untuk perayaan kecil di rumah atau kantor.",
  },
  {
    id: "isi-prasmanan",
    category: "paket-menu",
    title: "Apa saja menu di prasmanan pernikahan dan korporat?",
    content:
      "Menu prasmanan pernikahan (Rp45.000/porsi):\n- Rendang\n- Ayam bakar\n- Ikan asam manis\n- Sayur lodeh\n- Puding, es buah, kerupuk, sambal, dan buah potong\n\nMenu prasmanan korporat (Rp55.000/porsi):\n- Chicken cordon bleu\n- Beef teriyaki\n- Capcay\n- Puding coklat\n\nKeduanya sudah termasuk chafing dish dan alat saji lengkap.",
  },
  {
    id: "kustomisasi-menu",
    category: "paket-menu",
    title: "Apakah menu bisa dikustomisasi?",
    content:
      "Tentu. Menu utama dan lauk tambahan bisa disesuaikan dengan selera, anggaran, dan tema acara. Kami juga menerima permintaan khusus seperti menu vegetarian untuk paket korporat, serta penyesuaian untuk alergen atau kebutuhan halal.",
  },
  {
    id: "kehalalan-bahan",
    category: "paket-menu",
    title: "Apakah bahan yang digunakan halal dan segar?",
    content:
      "Ya — semua paket menggunakan daging sapi dan ayam pilihan yang dimasak di hari yang sama:\n- Nasi box dimasak **tanpa MSG tambahan**\n- Tumpeng dibuat **tanpa pengawet**\n- Snack digoreng mendadak agar hangat dan renyah\n\nUntuk kebutuhan khusus soal alergen, sampaikan saja saat konsultasi menu.",
  },

  /* ─────────────────────────────── Acara & Layanan ─────────────────────────────── */
  {
    id: "jenis-acara",
    category: "acara-layanan",
    title: "Jenis acara apa saja yang bisa dilayani?",
    content:
      "Kami melayani berbagai jenis acara:\n- Resepsi pernikahan\n- Syukuran\n- Arisan dan pengajian\n- Ulang tahun dan aqiqah kecil\n- Rapat, training, seminar, dan gathering kantor\n\nTumpeng, prasmanan, nasi box, dan snack box — semua bisa disesuaikan dengan skala acara Anda.",
  },
  {
    id: "kapasitas-produksi",
    category: "acara-layanan",
    title: "Berapa kapasitas produksi dalam satu acara?",
    content:
      "Kapasitas produksi kami berkisar 20 hingga 1000 porsi per acara. Dari tumpeng mini untuk perayaan keluarga kecil hingga prasmanan pernikahan ratusan porsi, kami bisa menyesuaikan dengan skala dan jadwal acara Anda.",
  },
  {
    id: "langganan-kantor",
    category: "acara-layanan",
    title: "Apakah bisa langganan nasi box kantor bulanan?",
    content:
      "Bisa. Banyak kantor di Bogor dan sekitarnya memesan nasi box secara rutin untuk rapat, training, dan jamuan karyawan. Untuk pesanan berulang kami siapkan menu yang bervariasi tiap hari dan pengantaran tepat waktu. Hubungi kami untuk diskusi jadwal, variasi menu, dan kebutuhan faktur.",
  },
  {
    id: "coffee-break",
    category: "acara-layanan",
    title: "Apakah ada paket coffee break untuk rapat atau seminar?",
    content:
      "Ada. Snack Box Arisan sangat cocok untuk coffee break — kombinasi kue basah dengan air mineral. Untuk kebutuhan lebih lengkap, konsultasikan pilihan minuman dan jumlah porsi via WhatsApp agar kami siapkan paket coffee break yang sesuai dengan jadwal acara Anda.",
  },
  {
    id: "penataan-prasmanan",
    category: "acara-layanan",
    title: "Apakah prasmanan termasuk penataan dan alat saji?",
    content:
      "Ya. Paket prasmanan pernikahan dan korporat sudah termasuk chafing dish, alat saji lengkap, dan penataan meja prasmanan di lokasi acara. Tim kami datang lebih awal untuk memastikan makanan tersusun rapi dan tetap hangat sampai tamu mulai menyantap.",
  },
  {
    id: "acara-besar",
    category: "acara-layanan",
    title: "Bagaimana untuk acara besar seperti pernikahan?",
    content:
      "Untuk resepsi pernikahan kami sediakan prasmanan dengan skala 100 hingga 1000 porsi. Menu bisa disesuaikan dengan tema, dan penataan meja sudah termasuk dalam paket. Disarankan memesan jauh-jauh hari agar jadwal, bahan, dan tenaga bisa disiapkan maksimal.",
  },

  /* ─────────────────────────────── Pembayaran & Struk ─────────────────────────────── */
  {
    id: "cara-pembayaran",
    category: "pembayaran-struk",
    title: "Bagaimana cara pembayaran dilakukan?",
    content:
      "Pembayaran dilakukan via transfer bank dengan alur sederhana:\n1. Pesanan dikonfirmasi melalui WhatsApp.\n2. Untuk pesanan besar, uang muka dibayar di awal.\n3. Pelunasan dilakukan sesuai kesepakatan, biasanya sebelum hari acara.",
  },
  {
    id: "struk-resmi",
    category: "pembayaran-struk",
    title: "Apakah saya mendapatkan struk atau invoice resmi?",
    content:
      "Ya. Setiap pesanan dicatat dengan nomor struk resmi berformat STR-tanggal-nomor urut, berisi rincian paket, jumlah porsi, biaya tambahan, dan total harga. Untuk kebutuhan perusahaan, kami juga bisa menyiapkan invoice/faktur atas nama instansi Anda.",
  },
  {
    id: "perhitungan-total",
    category: "pembayaran-struk",
    title: "Bagaimana total harga dihitung? Apakah transparan?",
    content:
      "Total harga dihitung otomatis oleh sistem kami: (jumlah porsi × harga paket) ditambah biaya tambahan jika ada, misalnya lauk tambahan atau menu khusus. Semua rincian disampaikan dan disepakati bersama lewat WhatsApp sebelum pesanan diproses — tidak ada biaya tersembunyi.",
  },
  {
    id: "tambahan-menu",
    category: "pembayaran-struk",
    title: "Apakah bisa menambahkan lauk atau menu tambahan?",
    content:
      "Bisa. Lauk dan menu tambahan bisa ditambahkan ke paket mana pun, misalnya menambah pilihan lauk pada nasi box atau menu ekstra pada prasmanan. Biaya tambahan dimasukkan ke rincian sebelum struk final, jadi jumlah akhir selalu jelas sejak awal.",
  },
  {
    id: "korporat-faktur",
    category: "pembayaran-struk",
    title: "Apakah melayani pembayaran via faktur untuk perusahaan?",
    content:
      "Ya, kami melayani pembayaran via faktur/tagihan untuk pesanan korporat, termasuk untuk langganan nasi box kantor. Silakan hubungi kami via WhatsApp atau email — Waroengpecelayam99@gmail.com — untuk kebutuhan dokumen dan jadwal penagihan.",
  },
  {
    id: "perubahan-pesanan",
    category: "pembayaran-struk",
    title: "Bagaimana jika jumlah porsi berubah mendekati hari H?",
    content:
      "Perubahan jumlah porsi masih bisa dilakukan, terutama jika disampaikan sebelum kami mulai produksi. Pada H-1 kami melakukan konfirmasi ulang untuk memastikan jumlah final, harga, dan jadwal pengantaran sesuai dengan kesepakatan awal.",
  },
]
