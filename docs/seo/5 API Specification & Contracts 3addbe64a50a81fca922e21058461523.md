# 5. API Specification & Contracts

# API Specification & Contracts

## Base URL

- **Development:** `http://localhost:8000/api/v1`
- **Production:** `https://api.catering-nusantara.com/api/v1`

## Authentication

All admin endpoints require `Authorization: Bearer <token>` header.

Token obtained via `POST /api/v1/auth/login`.

## Response Envelope

### Success Response

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

HTTP Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request / Validation Error
- 401: Unauthenticated
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

---

## Public Endpoints (No Auth Required)

### GET /paket — List Catalog Packages

Query Parameters:

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| kategori_paket | string | No | Filter: Nasi Box, Prasmanan, Snack, Tumpeng |
| kategori_acara | string | No | Filter: Pernikahan, Kantor, Ulang Tahun, Arisan, Umum |
| min_harga | int | No | Minimum price filter |
| max_harga | int | No | Maximum price filter |
| search | string | No | Search by package name |
| best_seller | boolean | No | true = only best sellers |

Response: Array of package objects (without internal fields like created_at on list)

```json
{
  "data": [
    {
      "id": 1,
      "nama_paket": "Nasi Box Ayam Goreng",
      "kategori_paket": "Nasi Box",
      "kategori_acara": "Umum",
      "menu_utama": ["Nasi Putih", "Ayam Goreng", "Sambal", "Lalapan"],
      "harga_per_porsi": 35000,
      "min_order": 10,
      "gambar": "/storage/paket/nasi-box-ayam.jpg",
      "is_best_seller": true,
      "deskripsi": "Paket nasi box lengkap dengan lauk ayam goreng..."
    }
  ]
}
```

### GET /paket/{id} — Package Detail

Response: Single package with full fields including menu_tambahan, fasilitas_termasuk

### GET /paket/best-seller — Best Seller Packages

Response: Array of best seller packages (same shape as list)

### GET /galeri — Event Gallery

Response:

```json
{
  "data": [
    {
      "id": 1,
      "nama_acara": "Pernikahan Andi & Sari",
      "deskripsi_acara": "Prasmanan untuk 500 undangan",
      "gambar_acara": "/storage/galeri/wedding-1.jpg",
      "tanggal_acara": "2026-06-15"
    }
  ]
}
```

---

## Auth Endpoints

### POST /auth/login

Request:

```json
{
  "email": "admin@catering.com",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "token": "1|abc123token...",
    "user": {
      "id": 1,
      "nama": "Ratna Kusuma",
      "email": "admin@catering.com"
    }
  }
}
```

### POST /auth/logout

Requires: Bearer token

Response: `{ "message": "Logged out" }`

---

## Admin: Dashboard

### GET /admin/dashboard

Response:

```json
{
  "data": {
    "total_paket": 20,
    "total_kategori": 4,
    "pesanan_hari_ini": 3,
    "pendapatan_bulan_ini": 15000000,
    "paket_terpopuler": [
      {"id": 1, "nama": "Nasi Box Ayam", "total_pesanan": 45}
    ]
  }
}
```

---

## Admin: Package Management (CRUD)

### GET /admin/paket — List All (with pagination)

### POST /admin/paket — Create

### GET /admin/paket/{id} — Get

### PUT /admin/paket/{id} — Update

### DELETE /admin/paket/{id} — Delete

### POST/PUT /admin/paket Request Body

```json
{
  "nama_paket": "Nasi Box Ayam Goreng",
  "kategori_paket": "Nasi Box",
  "kategori_acara": "Umum",
  "menu_utama": ["Nasi Putih", "Ayam Goreng", "Sambal"],
  "menu_tambahan": ["Telur Balado (+Rp5,000)", "Perkedel (+Rp3,000)"],
  "fasilitas_termasuk": ["Box + Styrofoam", "Sendok + Tisu"],
  "catatan_alergen": "Mengandung gluten, seafood",
  "jenis_kemasan": "Box",
  "min_order": 10,
  "harga_per_porsi": 35000,
  "kapasitas_produksi": 200,
  "deskripsi": "Paket nasi box favorit...",
  "is_best_seller": true
}
```

**Validation Rules:**

| Field | Rules |
| --- | --- |
| nama_paket | required, string, max:255 |
| kategori_paket | required, in: Nasi Box, Prasmanan, Snack, Tumpeng |
| menu_utama | required, array, min:1 |
| menu_utama.* | string, max:255 |
| menu_tambahan | nullable, array |
| menu_tambahan.* | string, max:255 |
| fasilitas_termasuk | nullable, array |
| harga_per_porsi | required, numeric, min:0, max:999999999.99 |
| min_order | required, integer, min:1 |
| gambar | nullable, image, max:2048, mimes:jpg,png,webp |

---

## Admin: Gallery Management

### GET /admin/galeri — List

### POST /admin/galeri — Create (multipart: nama_acara, deskripsi_acara, gambar_acara, tanggal_acara)

### DELETE /admin/galeri/{id} — Delete

---

## Admin: Order Management (Mini POS)

### GET /admin/pesanan — List Orders (paginated, sorted by newest)

Query Parameters: status, date_from, date_to, search (by customer name/phone)

### POST /admin/pesanan — Create Order

Request:

```json
{
  "nama_pemesan": "Budi Santoso",
  "no_telepon": "081234567890",
  "paket_id": 1,
  "jumlah_paket": 10,
  "detail_tambahan": ["Telur Balado (+Rp5,000)"],
  "biaya_tambahan": 5000,
  "catatan": "Mohon antar sebelum jam 10 pagi"
}
```

**IMPORTANT Server-Side Logic:**

- `total_harga` is NEVER accepted from request
- Server looks up `paket.harga_per_porsi` at creation time → copies to `harga_paket_satuan` (snapshot)
- Server generates `nomor_struk` as `STR-YYYYMMDD-XXXX`
- Formula: `total_harga = (jumlah_paket × harga_paket_satuan) + biaya_tambahan`

### GET /admin/pesanan/{id} — Order Detail

### PUT /admin/pesanan/{id} — Update Order Status

Request:

```json
{
  "status_pesanan": "confirmed"
}
```

Valid statuses: pending, confirmed, completed, cancelled

### GET /admin/pesanan/{id}/struk — Generate Receipt / Invoice View