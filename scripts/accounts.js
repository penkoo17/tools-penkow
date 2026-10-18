// Kelola akun dashboard: tambah, lihat, hapus, dan ekspor untuk Vercel.
// Pakai: node scripts/accounts.js <list|add|remove|export> [argumen]

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const LEGACY_FILE = path.join(DATA_DIR, 'auth.json');

const USAGE = [
  'Pakai salah satu:',
  '  npm run accounts                                  lihat daftar akun',
  '  npm run add-account -- <username> <password>      tambah atau ganti password akun',
  '  npm run remove-account -- <username>              hapus satu akun (perlu --yes)',
  '  npm run remove-account -- --all                   hapus semua akun (perlu --yes)',
  '  npm run accounts:export                           cetak JSON akun untuk env Vercel'
].join('\n');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function pickList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.accounts)) return raw.accounts;
  return [];
}

function loadAccounts() {
  const stored = readJson(ACCOUNTS_FILE);
  if (stored !== null) {
    return {
      accounts: pickList(stored),
      secret: stored && typeof stored.secret === 'string' ? stored.secret : '',
      fromLegacy: false
    };
  }

  const legacy = readJson(LEGACY_FILE);
  if (legacy && legacy.user && legacy.salt && legacy.hash) {
    return {
      accounts: [
        {
          user: legacy.user,
          salt: legacy.salt,
          hash: legacy.hash,
          created: legacy.created || null
        }
      ],
      secret: '',
      fromLegacy: true
    };
  }

  return { accounts: [], secret: '', fromLegacy: false };
}

function saveAccounts(accounts, secret) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    ACCOUNTS_FILE,
    JSON.stringify(
      {
        version: 1,
        // Dipakai menandatangani cookie sesi kalau AUTH_SECRET tidak di-set.
        secret: secret || crypto.randomBytes(32).toString('base64url'),
        accounts
      },
      null,
      2
    ) + '\n'
  );
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function envWarning() {
  if (process.env.DASHBOARD_ACCOUNTS) {
    console.log(
      'Perhatian: DASHBOARD_ACCOUNTS sedang di-set, jadi login memakai akun dari env itu, bukan file ini.'
    );
  }
  if (process.env.DASHBOARD_PASS) {
    console.log(
      'Perhatian: DASHBOARD_PASS sedang di-set, jadi login memakai akun dari env itu, bukan file ini.'
    );
  }
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('id-ID');
}

function commandList() {
  const { accounts, fromLegacy } = loadAccounts();

  if (fromLegacy) {
    console.log('Akun masih tersimpan di data/auth.json (format lama, tetap dipakai).');
  }

  if (!accounts.length) {
    console.log('Belum ada akun lokal. Buat dengan:');
    console.log('  npm run add-account -- <username> <password>');
  } else {
    console.log(`Total akun lokal: ${accounts.length}`);
    accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.user}   dibuat: ${formatDate(account.created)}`);
    });
  }

  envWarning();
}

function commandAdd(args) {
  const [user, password] = args;

  if (!user || !password) {
    console.error(USAGE);
    process.exit(1);
  }
  if (/\s/.test(user)) {
    console.error('Username tidak boleh memuat spasi.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password minimal 8 karakter.');
    process.exit(1);
  }

  const { accounts, secret, fromLegacy } = loadAccounts();
  if (fromLegacy) {
    console.log('Akun lama dari data/auth.json dipindahkan ke data/accounts.json.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const entry = { user, salt, hash: hashPassword(password, salt), created: Date.now() };
  const index = accounts.findIndex(
    account => account.user.toLowerCase() === user.toLowerCase()
  );

  if (index >= 0) {
    entry.created = accounts[index].created || entry.created;
    accounts[index] = entry;
    console.log(`Password akun "${accounts[index].user}" diperbarui.`);
  } else {
    accounts.push(entry);
    console.log(`Akun "${user}" dibuat.`);
  }

  saveAccounts(accounts, secret);
  if (fromLegacy) fs.rmSync(LEGACY_FILE, { force: true });
  console.log(`Total akun sekarang: ${accounts.length}`);
  envWarning();
}

function commandRemove(args) {
  const confirmed = args.includes('--yes');
  const removeAll = args.includes('--all');
  const user = args.find(arg => !arg.startsWith('--'));

  if (!removeAll && !user) {
    console.error(USAGE);
    process.exit(1);
  }

  const { accounts, secret } = loadAccounts();
  const targets = removeAll
    ? accounts
    : accounts.filter(account => account.user.toLowerCase() === user.toLowerCase());

  if (!targets.length) {
    console.log(
      removeAll ? 'Belum ada akun lokal untuk dihapus.' : `Akun "${user}" tidak ditemukan.`
    );
    process.exit(0);
  }

  const label = removeAll
    ? `SEMUA akun lokal (${targets.length} akun)`
    : `akun "${targets[0].user}"`;

  if (!confirmed) {
    console.log(`Ini akan menghapus ${label}.`);
    console.log('Kalau yakin, ulangi dengan --yes di belakangnya.');
    process.exit(1);
  }

  const remaining = accounts.filter(account => !targets.includes(account));
  if (remaining.length) saveAccounts(remaining, secret);
  else fs.rmSync(ACCOUNTS_FILE, { force: true });

  fs.rmSync(LEGACY_FILE, { force: true });

  console.log(`Dihapus: ${label}.`);
  console.log(`Sisa akun lokal: ${remaining.length}`);
  if (!remaining.length) {
    console.log('Dashboard terkunci sampai ada akun baru dibuat.');
  }
  envWarning();
}

function commandExport() {
  const { accounts } = loadAccounts();

  if (!accounts.length) {
    console.error('Belum ada akun lokal untuk diekspor.');
    process.exit(1);
  }

  const payload = accounts.map(account => ({
    user: account.user,
    salt: account.salt,
    hash: account.hash
  }));

  console.log('Tempel baris di bawah ini sebagai nilai DASHBOARD_ACCOUNTS di Vercel:');
  console.log(JSON.stringify(payload));
  console.log(`Jumlah akun: ${payload.length}. Nilainya memuat hash, tapi bukan password asli.`);
}

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'list':
    commandList();
    break;
  case 'add':
    commandAdd(args);
    break;
  case 'remove':
    commandRemove(args);
    break;
  case 'export':
    commandExport();
    break;
  default:
    console.error(USAGE);
    process.exit(1);
}
