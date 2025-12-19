# PROMPT KHUSUS (Copy-Paste ini ke Gemini/ChatGPT)

> **Instruksi untuk AI:**
>
> "Saya ingin kamu bertindak sebagai penulis akademis profesional di bidang Ilmu Komputer/Teknologi Informasi. Tugasmu adalah menulis sebuah **Makalah Ilmiah (Jurnal)** lengkap berbahasa Indonesia berdasarkan kerangka dan data teknis di bawah ini.
>
> **Ketentuan Penulisan:**
>
> 1.  Gunakan bahasa Indonesia yang baku, formal, dan akademis (hindari kata slang atau terlalu santai).
> 2.  Ikuti struktur bab yang saya berikan: Judul, Abstrak, Pendahuluan, Landasan Teori, Pembahasan (Metodologi), Kesimpulan, dan Daftar Pustaka.
> 3.  **Kembangkan poin-poin kerangka** menjadi paragraf yang utuh, mengalir, dan logis. Jangan hanya berupa bullet points, tapi narasi deskriptif.
> 4.  Pada bagian **Pembahasan**, jelaskan aspek teknis "Hybrid Log Ingestion" dan "ETL Process" seolah-olah kamu yang membuat sistem tersebut, dengan menekankan keunggulan arsitekturnya yang skalabel.
> 5.  Pastikan Abstrak tidak lebih dari 200 kata.
>
> **Data & Kerangka Makalah utk Dikembangkan:**
> (Gunakan seluruh kerangka di bawah ini. Pastikan untuk menonjolkan fitur baru **"Visitor Intelligence"** yang melacak pengunjung unik tanpa login (Session-based) dan penanganan **Zona Waktu (Timezone Handling)** manual untuk server Cloud.)"

---

# Struktur Artikel: Implementasi Pipeline Data Engineering Clickstream

## a. Judul, Penulis, dan Instansi

**Judul Usulan:**
Implementasi Pipeline Data Engineering Sederhana untuk Analisis Perilaku Pengunjung (_Clickstream_) pada Aplikasi E-Commerce Menggunakan Arsitektur Cloud Hybrid

**Penulis:**
[Heri Ramadhan]

**Instansi:**
[Universitas Negeri Padang]

---

## b. Abstrak (Maksimal 200 Kata)

Perkembangan e-commerce menuntut pemahaman mendalam mengenai perilaku pengguna untuk meningkatkan strategi penjualan. Penelitian ini bertujuan untuk merancang dan membangun sistem _Clickstream Analysis_ sederhana yang terintegrasi pada aplikasi toko online berbasis web. Sistem dibangun menggunakan Node.js dengan menerapkan pola arsitektur MVC. Fitur utama mencakup pencatatan interaksi pengguna (_Log Ingestion_) seperti melihat produk dan menambahkan barang ke keranjang, yang disimpan secara _hybrid_ menggunakan Azure Blob Storage untuk skalabilitas dan _fallback_ lokal. Proses pengolahan data dilakukan melalui mekanisme ETL (_Extract, Transform, Load_) terminimalisir yang mengagregasi data log mentah menjadi metrik analitik yang tersimpan dalam database MySQL. Hasil akhir ditampilkan dalam bentuk _Dashboard Admin_ interaktif yang memvisualisasikan tren trafik harian dan produk terpopuler. Pengujian menunjukkan sistem mampu menangani seluruh siklus data mulai dari akuisisi log hingga visualisasi, membuktikan bahwa implementasi pipeline data modern dapat diterapkan pada skala aplikasi web sederhana.

---

## c. Kata Kunci

- Clickstream Analysis
- Data Engineering
- ETL (Extract, Transform, Load)
- Azure Cloud Storage
- Web Development (Node.js)

---

## d. Bab Isi Makalah

### 1. Pendahuluan

- **Latar Belakang:** Jelaskan pertumbuhan data di era digital dan pentingnya data perilaku user (_behavioral data_) dibanding sekadar data transaksi.
- **Rumusan Masalah:** Bagaimana cara melacak jejak digital user di website tanpa membebani performa database utama secara langsung?
- **Tujuan:** Membangun purwarupa aplikasi e-commerce yang memiliki fitur _built-in analytics_ dengan arsitektur yang siap-cloud (_cloud-ready_).
- **Batasan Masalah:** Lingkup pada tracking interaksi dasar (View, Add to Cart, Purchase) dan simulasi environment Azure. (Sistem tidak menangani pembayaran asli).

### 2. Landasan Teori

- **Clickstream Data:** Definisi data clickstream (rekaman klik, navigasi halaman).
- **ETL (Extract, Transform, Load):** Konsep dasar perpindahan data dari sumber mentah (Raw Log) ke gudang data (Data Warehouse/Analytics DB).
- **Arsitektur MVC (Model-View-Controller):** Pola desain perangkat lunak yang memisahkan logika aplikasi (Controller), data (Model), dan antarmuka (View).
- **Cloud Storage (Blob):** Konsep penyimpanan objek tak terstruktur untuk data log yang masif.
- **Azure Database for MySQL (Flexible Server):** Layanan database relasional terkelola penuh di cloud yang menawarkan ketersediaan tinggi, skalabilitas otomatis, dan fleksibilitas kontrol terhadap konfigurasi server (seperti SSL, firewall, dan parameter performa) tanpa perlu mengelola infrastruktur fisik.

### 3. Pembahasan (Metodologi & Implementasi)

**3.1. Perancangan Sistem**

- **Arsitektur Umum:** Gambarkan diagram blok: User -> Web App -> Log Service -> Azure/Local Storage -> ETL Service -> MySQL -> Admin Dashboard.
- **Skema Database:** Jelaskan tabel `products` (data operasional) vs `product_analytics` & `daily_analytics` (data analitikal).

**3.2. Implementasi Kode Program**

- **Teknologi:** Node.js, Express, MySQL2, EJS, TailwindCSS.
- **Fitur Log Ingestion:** Kode `LogIngestionService.js` menggunakan pendekatan _Hybrid_. Jika koneksi Azure tersedia (`AZURE_STORAGE_CONNECTION_STRING` ada), log dikirim ke Blob Storage. Jika tidak, log disimpan sebagai file JSON lokal. Ini menjamin sistem tetap jalan meski internet mati (_Fault Tolerance_).
- **Logika ETL:** Kode `ETLService.js` menjalankan tugas periodik:
  - _Extract_: Membaca ratusan file JSON (dari Blob/Lokal).
  - _Transform_:
    - Mengagregasi jumlah View/Cart/Purchase per Product ID.
    - **Visitor Tracking**: Mengekstrak `session_id` dan `user_agent` untuk mengidentifikasi pengunjung unik (Upsert Logic).
  - _Load_: Menyimpan hasil agregasi ke tabel MySQL (`product_analytics` dan `visitor_sessions`).
  - _Cleanup_: Menghapus/mengarsipkan log mentah dengan penanganan _error handling_ (ignoring `BlobNotFound`) untuk stabilitas.
- **Visualisasi Data & Zona Waktu:** Menggunakan Library Chart.js di Dashboard Admin.
  - **Tantangan Timezone:** Mengingat server Azure berbasis UTC, diterapkan logika kustom pada _View Layer_ (`admin-dashboard.ejs`) untuk mengonversi waktu UTC ke WIB (+7 Jam) secara manual agar data "Last Seen" relevan bagi admin lokal.

**3.3. Pengujian & Hasil**

- **Skenario Pengujian:** User melakukan simulasi belanja (melihat barang, masuk keranjang, checkout).
- **Hasil:**
  - Dashboard Admin menampilkan tren trafik secara _Near Real-time_.
  - Tabel **"Recent Visitors"** berhasil menampilkan identitas sesi (`guest_xxx`) dan waktu akses yang akurat dalam format lokal Indonesia (WIB), mengatasi isu selisih waktu server cloud.
- **Analisa Keunggulan:** Sistem terbukti tidak membebani database utama saat _logging_ karena penulisan log dilakukan ke storage terpisah (Blob) terlebih dahulu (_Decoupled Architecture_). Fitur pelacakan sesi memungkinkan analisis audiens tanpa mengharuskan user login.

### 4. Kesimpulan dan Saran

- **Kesimpulan:** Penelitian ini berhasil mengimplementasikan alur data engineering lengkap dari hulu ke hilir. Penggunaan penyimpanan sementara (temp logs/blob) terbukti efektif memisahkan beban _transactional_ dan _analytical_.
- **Saran:** Pengembangan selanjutnya dapat menggunakan _Message Queue_ (seperti Kafka/RabbitMQ) untuk _streaming_ log dan penerapan _Recommendation System_ berbasis _Machine Learning_ untuk saran produk otomatis.

---

## e. Daftar Pustaka

[1] untuk daftar pustaka tolong sesuaikan, dan cari daftar pustaka baik itu dari artikel ilmiah yang relevan, jurnal, buku, atau website yang relevan. dan harus sesuai dengan konten artikel. dan tahun terbit nya harus 2020-2025.
