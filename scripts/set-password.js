const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const [user, password] = process.argv.slice(2);

if (!user || !password) {
  console.error('Pakai: npm run set-password -- <username> <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password minimal 8 karakter.');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'data');
fs.mkdirSync(dir, { recursive: true });

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

fs.writeFileSync(
  path.join(dir, 'auth.json'),
  JSON.stringify({ user, salt, hash }, null, 2) + '\n'
);

console.log(`Akun dashboard disimpan: ${user}`);
console.log('Password disimpan sebagai hash scrypt di data/auth.json.');

if (process.env.DASHBOARD_PASS) {
  console.log(
    'Perhatian: DASHBOARD_PASS sedang di-set, jadi login memakai env itu. Hapus dulu kalau mau memakai akun ini.'
  );
}
