export type OrderStep = {
  id: string
  /** "01" – "07" — the timeline marker (big display numeral). */
  step: string
  title: string
  description: string
  image: string
  imageAlt: string
}

/**
 * #cara-pesan — the 7-step ordering workflow.
 * Shared by both the desktop pinned GSAP timeline and the mobile scroll timeline.
 */
export const ORDER_STEPS: OrderStep[] = [
  {
    id: "jelajahi",
    step: "01",
    title: "Jelajahi Katalog",
    description:
      "Jelajahi katalog kami dan pilih paket yang paling pas — telusuri menu andalan, lalu tentukan pilihan terbaik untuk acara Anda.",
    image: "/assets/images/ordering/step-1.png",
    imageAlt: "Katalog menu katering nasi box",
  },
  {
    id: "isi-detail",
    step: "02",
    title: "Isi Detail Pesanan",
    description:
      "Lengkapi formulir pemesanan dengan lengkap — nama, alamat pengantaran, tanggal acara, dan catatan kebutuhan khusus Anda.",
    image: "/assets/images/ordering/step-2.png",
    imageAlt: "Menulis detail pesanan",
  },
  {
    id: "whatsapp",
    step: "03",
    title: "Konfirmasi via WhatsApp",
    description:
      "Anda diarahkan ke WhatsApp dengan ringkasan pesanan yang terisi otomatis — cek kembali detailnya, lalu kirim untuk melanjutkan.",
    image: "/assets/images/ordering/step-3.png",
    imageAlt: "Ringkasan pesanan di aplikasi chat",
  },
  {
    id: "pembayaran",
    step: "04",
    title: "Pembayaran & Verifikasi",
    description:
      "Bayar via transfer bank atau e-wallet seperti GoPay, kirim bukti pembayaran, lalu tim kami memverifikasi pesanan Anda.",
    image: "/assets/images/ordering/step-4.png",
    imageAlt: "Pembayaran digital via ponsel",
  },
  {
    id: "konfirmasi",
    step: "05",
    title: "Konfirmasi Pesanan",
    description:
      "Pesanan Anda kami konfirmasi dan struk resmi dikirim — rincian paket, jumlah porsi, serta total harga tercatat dengan jelas.",
    image: "/assets/images/ordering/step-5.png",
    imageAlt: "Struk resmi pesanan",
  },
  {
    id: "pengiriman",
    step: "06",
    title: "Menanti Pengantaran",
    description:
      "Tim kami menyiapkan hidangan segar dan mengantarkan tepat jadwal — hangat, rapi, dan siap tersaji di lokasi acara Anda.",
    image: "/assets/images/ordering/step-6.png",
    imageAlt: "Nasi box siap diantar",
  },
  {
    id: "nikmati",
    step: "07",
    title: "Siap Dinikmati",
    description:
      "Pesanan tiba dengan sempurna dan siap dinikmati — setiap sajian terasa seperti masakan rumahan untuk perayaan istimewa Anda.",
    image: "/assets/images/ordering/step-7.png",
    imageAlt: "Tumpeng nasi kuning untuk perayaan",
  },
]
