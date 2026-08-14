<?php

namespace App\Enums;

/**
 * Gallery-native event categories for the public Galeri Perayaan portfolio.
 *
 * Decoupled from KategoriAcaraEnum (paket) on purpose: the gallery needs
 * storytelling categories (Di Balik Dapur, Hampers) that competition/order
 * categories do not. Cross-mapping for a future paket→galeri link:
 * KategoriAcaraEnum::Kantor → Korporat, Ulang Tahun|Arisan → Perayaan.
 */
enum GaleriKategoriEnum: string
{
    case Pernikahan = 'Pernikahan';
    case Korporat = 'Korporat';
    case TumpengSyukuran = 'Tumpeng & Syukuran';
    case Perayaan = 'Perayaan';
    case Hampers = 'Hampers';
    case DiBalikDapur = 'Di Balik Dapur';
    case Lainnya = 'Lainnya';
}
