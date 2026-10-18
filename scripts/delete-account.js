const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'auth.json');
const confirmed = process.argv.includes('--yes');

if (!fs.existsSync(file)) {
  console.log('Tidak ada akun lokal di data/auth.json.');
  process.exit(0);
}

if (!confirmed) {
  console.log('Ini akan menghapus akun dashboard lokal di data/auth.json.');
  console.log('Kalau yakin, jalankan: npm run delete-account -- --yes');
  process.exit(1);
}

fs.rmSync(file);
console.log('Akun lokal dihapus. Dashboard terkunci sampai akun dibuat lagi.');

if (process.env.DASHBOARD_PASS) {
  console.log(
    'Perhatian: DASHBOARD_PASS masih di-set, jadi login tetap memakai env itu sampai variabelnya dihapus.'
  );
}
