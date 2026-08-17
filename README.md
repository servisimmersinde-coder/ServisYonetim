# Servis Yonetim Sistemi

Servis hizmeti veren isletmeler icin gelistirilmis tam yigin web uygulamasidir.

## Ozellikler

### Yonetici Paneli
- Tum servis kayitlarini goruntuleme ve yonetme
- Kullanici hesaplari yonetimi (ekleme, pasif/aktif etme, silme)
- Gelir istatistikleri ve dashboard
- Durum guncelleme yetkisi
- Musteri yonetimi
- Fis olusturma ve yazdirma

### Kullanici Paneli
- Kendi servis kayitlarini goruntuleme
- Yeni servis kaydi olusturma
- Musteri ekleme ve duzenleme
- Fis olusturma ve yazdirma
- Servis durumu takibi

### Genel Ozellikler
- JWT tabanli guvenli giris/kayit sistemi
- Rol bazli yetkilendirme (Yonetici / Kullanici)
- Otomatik fis numarasi uretme
- KDV ve indirim hesaplama
- PDF formatinda fis yazdirma
- Arama ve filtreleme
- Responsive tasarim

## Teknolojiler

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token)
- bcryptjs (Sifre hashleme)

### Frontend
- React 18
- React Router v6
- Axios (API istekleri)
- Vite (Build araci)

## Kurulum

### On Hazirliklar
1. [Node.js](https://nodejs.org/) yuklu olmali (v18+)
2. [MongoDB](https://www.mongodb.com/) yuklu olmali veya MongoDB Atlas kullanilmali

### Adimlar

```bash
# 1. Proje klasorune gidin
cd ServisYonetim

# 2. Tum bagimliliklari yukleyin
npm run install:all

# 3. Backend .env dosyasini duzenleyin
# backend/.env dosyasini acin ve gerekli ayarlari yapin

# 4. MongoDB'yi baslatin (terminalde ayri pencerede)
mongod

# 5. Backend'i baslatin
npm run dev:backend

# 6. Frontend'i baslatin (ayri terminalde)
npm run dev:frontend
```

### Erisim
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Veritabani Ayarlari

`backend/.env` dosyasi:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/servis_yonetim
JWT_SECRET=istediginiz-gizli-anahtar
JWT_EXPIRE=7d
```

## Kullanim

1. Uygulamayi acin ve "Kayit Olun" secenegiyle ilk kullanicinizi olusturun
2. Ilk kullanici otomatik olarak **Yonetici** olarak atanir
3. Yonetici olarak musteri ve servis kayitlari olusturabilirsiniz
4. Yeni kullanicilar "Kayit Ol" ile hesap olusturabilir (Kullanici olarak)
5. Yonetici Paneli > Kullanicilar bolumunden kullanicilari yonetebilirsiniz

## Proje Yapisi

```
ServisYonetim/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Kullanici.js
│   │   ├── Musteri.js
│   │   └── ServisKayit.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── musteri.js
│   │   └── servis.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AnaLayout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FisGoster.jsx
│   │   │   ├── GirisSayfasi.jsx
│   │   │   ├── Kullanicilar.jsx
│   │   │   ├── Musteriler.jsx
│   │   │   ├── ServisDetay.jsx
│   │   │   ├── Servisler.jsx
│   │   │   └── YeniServis.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
└── README.md
```
