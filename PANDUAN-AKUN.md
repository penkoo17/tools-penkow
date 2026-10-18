# Panduan Akun Dashboard

Panduan membuat, mengelola, dan menghapus akun untuk masuk ke halaman `/dashboard`. Jumlah akun **tidak dibatasi** — bebas menambah dan menghapus sendiri.

## 1. Dari mana akun dibaca

Akun dibaca dari sumber pertama yang tersedia, berurutan:

1. `DASHBOARD_ACCOUNTS` — daftar akun dalam bentuk JSON (dipakai di Vercel).
2. `DASHBOARD_USER` + `DASHBOARD_PASS` — satu akun lewat env (format lama, tetap didukung).
3. `data/accounts.json` — daftar akun lokal (hash scrypt).
4. `data/auth.json` — akun tunggal format lama; otomatis dipindahkan ke `accounts.json` saat pertama kali Anda menambah atau menghapus akun.

Artinya: kalau di Vercel sudah ada env, file lokal tidak berpengaruh apa pun ke versi live. Kalau tidak ada akun sama sekali, login menjawab `503 Akun dashboard belum dikonfigurasi.`

Password tidak pernah disimpan sebagai teks biasa, dan file akun sudah masuk `.gitignore` (tidak ikut ke GitHub).

## 2. Sebelum mulai

```powershell
cd "C:\Users\Administrator\Documents\GitHub\tools-penkow"
```

`npm run` hanya jalan di folder yang memuat `package.json`.

## 3. Membuat akun

```powershell
npm run add-account -- budi passwordbudi123
npm run add-account -- penko passwordpenko123
npm run add-account -- gudang passwordgudang123
```

- Username bebas tanpa spasi, password **minimal 8 karakter**.
- Setiap perintah menambah satu akun baru.
- Menjalankan lagi dengan username yang sama = **mengganti password** akun itu, bukan membuat akun kedua.
- Username tidak peka huruf besar/kecil saat login (`Penko` = `penko`).

Melihat daftar akun (tanpa membocorkan password atau hash):

```powershell
npm run accounts
```

Menambah akun pertama kali akan memindahkan akun lama dari `data/auth.json` ke `data/accounts.json` secara otomatis, dan akun lama tetap bisa login seperti biasa.

## 4. Menghapus akun

Satu akun:

```powershell
npm run remove-account -- budi          # hanya peringatan, belum menghapus
npm run remove-account -- budi --yes    # benar-benar dihapus
```

Semua akun lokal:

```powershell
npm run remove-account -- --all --yes
```

Efeknya langsung terasa:

- Sesi login akun yang baru dihapus **langsung mati**; dia akan diminta login lagi.
- Sesi akun lain **tetap hidup** (kecuali kunci sesi ikut diubah — lihat bagian 6).
- Kalau semua akun hilang, dashboard terkunci dan login menjawab `503 Akun dashboard belum dikonfigurasi.`

## 5. Menguji di lokal

```powershell
npm run dev
```

Buka `http://localhost:3000/login`, masuk dengan salah satu akun, dan Anda akan diarahkan ke `/dashboard`. Username yang sedang aktif terlihat sebagai chip kecil di kanan atas, di sebelah tombol **Keluar**.

## 6. Akun di produksi (Vercel)

Script CLI tidak jalan di Vercel (filesystem-nya read-only), jadi akun produksi dititipkan lewat env.

1. Siapkan akun di komputer Anda (`npm run add-account -- ...`).
2. Cetak nilainya untuk Vercel:
   ```powershell
   npm run accounts:export
   ```
   Perintah ini menampilkan satu baris JSON berisi daftar akun beserta hash-nya (bukan password asli).
3. Vercel → project `tools-penko-4wzo` → **Settings → Environment Variables**, tambahkan untuk Production dan Preview:
   - `DASHBOARD_ACCOUNTS` = tempel JSON dari langkah 2
   - `AUTH_SECRET` = string acak panjang:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
     ```
4. **Redeploy** deployment terakhir (env baru dipakai setelah deploy ulang).
5. Uji: `https://vtiktok.cc.cd/dashboard` harus mengarah ke `/login`, lalu masuk dengan salah satu akun.

Menambah atau menghapus akun di produksi = ubah isi `DASHBOARD_ACCOUNTS`, simpan, lalu redeploy. Di sisi lokal, jalan pintas `DASHBOARD_USER` + `DASHBOARD_PASS` (satu akun) juga masih didukung.

Jangan menaruh password di `.env.local`, karena file itu ikut ter-track di repo ini.

## 7. Sesi login

| Kejadian | Akun itu sendiri | Akun lain |
| --- | --- | --- |
| Akun dihapus | Sesi langsung mati | Tetap login |
| Password akun diganti (lokal, ada kunci sesi di `accounts.json`) | Sesi lama tetap hidup sampai 7 hari | Tetap login |
| Password akun diganti (produksi) | Kalau `AUTH_SECRET` di-set: sesi tetap hidup; kalau tidak: semua sesi mati | Sama |
| `AUTH_SECRET` diganti (produksi) | Semua sesi mati | Semua sesi mati |
| `DASHBOARD_ACCOUNTS` diubah (produksi) tanpa `AUTH_SECRET` | Semua sesi mati | Semua sesi mati |

Cookie sesi berlaku **7 hari**, bersifat `HttpOnly` + `SameSite=Lax`, dengan flag `Secure` otomatis di HTTPS. Karena sesi bersifat stateless (ditandatangani, bukan disimpan di database), tombol **Keluar** hanya menghapus cookie di browser yang bersangkutan. Untuk memaksa semua orang login ulang, ganti `AUTH_SECRET` (produksi) atau hapus `secret` di `data/accounts.json` (lokal).

## 8. Menutup akses dashboard

- **Sementara:** kosongkan `DASHBOARD_ACCOUNTS` (dan `DASHBOARD_PASS`) di Vercel → redeploy → login menjawab 503.
- **Ganti total daftar akun:** jalankan `npm run accounts:export` setelah mengubah akun lokal, lalu tempel hasilnya ke `DASHBOARD_ACCOUNTS` → redeploy.

## 9. Ringkasan perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run accounts` | Lihat daftar akun lokal |
| `npm run add-account -- <user> <pass>` | Tambah akun, atau ganti password akun yang ada |
| `npm run remove-account -- <user> --yes` | Hapus satu akun |
| `npm run remove-account -- --all --yes` | Hapus semua akun lokal |
| `npm run accounts:export` | Cetak JSON akun untuk `DASHBOARD_ACCOUNTS` di Vercel |
| `npm run dev` | Jalankan lokal di `http://localhost:3000` |
| `npm run check-imports` | Cek kecocokan huruf besar/kecil import (penjaga Vercel/Linux) |
| `npm run build` | Verifikasi build sebelum push |

Perintah lama `set-password` dan `delete-account` sudah diganti oleh `add-account` dan `remove-account`.

## 10. Kalau ada masalah

| Gejala | Artinya | Solusi |
| --- | --- | --- |
| `503 Akun dashboard belum dikonfigurasi.` | Tidak ada akun dari mana pun | Buat akun lokal, atau isi env Vercel lalu redeploy |
| `401 Username atau password salah.` | Kredensial tidak cocok | Periksa username; ganti password dengan `add-account` |
| `429 Terlalu banyak percobaan…` | Lebih dari 5 percobaan gagal dalam 10 menit untuk username + IP yang sama | Tunggu 10 menit |
| Akun baru tidak bisa login | Ada env yang menang atas file | Cek `DASHBOARD_ACCOUNTS` / `DASHBOARD_PASS`, atau jalankan `npm run accounts` untuk melihat peringatannya |
| Semua orang ter-logout setelah menambah akun | Kunci sesi berubah (tidak ada `AUTH_SECRET`, atau `secret` di `accounts.json` terhapus) | Set `AUTH_SECRET` di produksi; di lokal biarkan `secret` di `data/accounts.json` apa adanya |
| Halaman `/dashboard` terus redirect | Sesi kedaluwarsa, akun dihapus, atau kunci sesi diganti | Login ulang |

## 11. Aturan aman

- Jangan commit `data/accounts.json`, `data/auth.json`, atau nilai `AUTH_SECRET`.
- Password yang diketik sebagai argumen perintah tercatat di riwayat shell; awali dengan spasi atau bersihkan riwayat setelahnya.
- Di produksi selalu set `AUTH_SECRET` panjang dan acak: supaya mengganti password atau daftar akun tidak memaksa semua orang login ulang, dan supaya mencabut semua sesi cukup dengan mengganti satu nilai itu.
- Jalankan `npm run check-imports` sebelum push kalau habis memindahkan file antar folder — Windows tidak peka huruf besar/kecil, Vercel (Linux) peka.
