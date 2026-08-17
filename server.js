const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'veritabani.json');

function dbOku() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    const ilk = {
      kullanicilar: [{
        id:'admin1',adSoyad:'Yonetici',email:'admin@admin.com',telefon:'',sifre:'1234',
        rol:'yonetici',aktif:true,tarih:new Date().toISOString()
      }],
      musteriler: [],
      servisler: [],
      fisCounter: 0
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(ilk, null, 2));
    return ilk;
  }
}

function dbKaydet(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function jsonGonder(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function govdeOku(req) {
  return new Promise((resolve) => {
    let govde = '';
    req.on('data', chunk => govde += chunk);
    req.on('end', () => resolve(govde));
  });
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // HTML dosyasi sun
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'ServisYonetim.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // API: Veritabani oku
  if (url.pathname === '/api/db' && req.method === 'GET') {
    return jsonGonder(res, dbOku());
  }

  // API: Kullanici giris
  if (url.pathname === '/api/giris' && req.method === 'POST') {
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    const tab = body.tab || 'pc';
    let k;
    if (tab === 'pc') {
      k = db.kullanicilar.find(x => x.email && x.email.toLowerCase() === (body.email||'').toLowerCase() && x.sifre === body.sifre);
    } else {
      k = db.kullanicilar.find(x => x.telefon === body.telefon && x.sifre === body.sifre);
    }
    if (!k) return jsonGonder(res, { hata: 'Gecersiz bilgi' }, 401);
    if (!k.aktif) return jsonGonder(res, { hata: 'Hesap pasif' }, 403);
    return jsonGonder(res, { kullanici: k });
  }

  // API: Kullanici ekle
  if (url.pathname === '/api/kullanici' && req.method === 'POST') {
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    const yeni = { id: 'k' + Date.now(), ...body, aktif: true, tarih: new Date().toISOString() };
    if (body.telefon && db.kullanicilar.find(x => x.telefon === body.telefon))
      return jsonGonder(res, { hata: 'Telefon zaten kayitli' }, 400);
    if (body.email && db.kullanicilar.find(x => x.email === body.email))
      return jsonGonder(res, { hata: 'Email zaten kayitli' }, 400);
    db.kullanicilar.push(yeni);
    dbKaydet(db);
    return jsonGonder(res, { kullanici: yeni });
  }

  // API: Kullanici guncelle
  if (url.pathname.startsWith('/api/kullanici/') && req.method === 'PUT') {
    const id = url.pathname.split('/')[3];
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    const k = db.kullanicilar.find(x => x.id === id);
    if (!k) return jsonGonder(res, { hata: 'Bulunamadi' }, 404);
    Object.assign(k, body);
    dbKaydet(db);
    return jsonGonder(res, { ok: true });
  }

  // API: Kullanici sil
  if (url.pathname.startsWith('/api/kullanici/') && req.method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    const db = dbOku();
    db.kullanicilar = db.kullanicilar.filter(x => x.id !== id);
    dbKaydet(db);
    return jsonGonder(res, { ok: true });
  }

  // API: Musteriler
  if (url.pathname === '/api/musteriler' && req.method === 'GET') {
    return jsonGonder(res, dbOku().musteriler);
  }
  if (url.pathname === '/api/musteri' && req.method === 'POST') {
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    const yeni = { id: 'm' + Date.now(), ...body, tarih: new Date().toISOString() };
    db.musteriler.push(yeni);
    dbKaydet(db);
    return jsonGonder(res, yeni);
  }
  if (url.pathname.startsWith('/api/musteri/') && req.method === 'PUT') {
    const id = url.pathname.split('/')[3];
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    const m = db.musteriler.find(x => x.id === id);
    if (!m) return jsonGonder(res, { hata: 'Bulunamadi' }, 404);
    Object.assign(m, body);
    dbKaydet(db);
    return jsonGonder(res, m);
  }
  if (url.pathname.startsWith('/api/musteri/') && req.method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    const db = dbOku();
    db.musteriler = db.musteriler.filter(x => x.id !== id);
    dbKaydet(db);
    return jsonGonder(res, { ok: true });
  }

  // API: Servisler
  if (url.pathname === '/api/servisler' && req.method === 'GET') {
    return jsonGonder(res, dbOku().servisler);
  }
  if (url.pathname === '/api/servis' && req.method === 'POST') {
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    db.fisCounter = (db.fisCounter || 0) + 1;
    const t = new Date();
    const fisNo = 'SVS-' + t.getFullYear().toString().slice(-2) + (t.getMonth()+1).toString().padStart(2,'0') + t.getDate().toString().padStart(2,'0') + '-' + db.fisCounter.toString().padStart(4,'0');
    const yeni = { id: 's' + Date.now(), fisNo, ...body, tarih: new Date().toISOString(), baslangicTarihi: new Date().toISOString(), bitisTarihi: null, sonuc: '', sonucTarihi: null, sonucYazan: null };
    db.servisler.push(yeni);
    dbKaydet(db);
    return jsonGonder(res, yeni);
  }
  if (url.pathname.startsWith('/api/servis/') && req.method === 'PUT') {
    const id = url.pathname.split('/')[3];
    const body = JSON.parse(await govdeOku(req));
    const db = dbOku();
    const s = db.servisler.find(x => x.id === id);
    if (!s) return jsonGonder(res, { hata: 'Bulunamadi' }, 404);
    Object.assign(s, body);
    dbKaydet(db);
    return jsonGonder(res, s);
  }
  if (url.pathname.startsWith('/api/servis/') && req.method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    const db = dbOku();
    db.servisler = db.servisler.filter(x => x.id !== id);
    dbKaydet(db);
    return jsonGonder(res, { ok: true });
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let ip = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
  }
  console.log('========================================');
  console.log('  SERVIS YONETIM SISTEMI CALISIYOR');
  console.log('========================================');
  console.log('');
  console.log('  PC giris:      http://localhost:' + PORT);
  console.log('  Telefon giris: http://' + ip + ':' + PORT);
  console.log('');
  console.log('  Telefon ile ayni WiFi aginda olmali!');
  console.log('========================================');
});
