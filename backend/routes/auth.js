const express = require('express');
const jwt = require('jsonwebtoken');
const Kullanici = require('../models/Kullanici');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

const tokenUret = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Kayit
router.post('/kayit', async (req, res) => {
  try {
    const { adSoyad, email, sifre, telefon, rol } = req.body;

    const mevcutKullanici = await Kullanici.findOne({ email });
    if (mevcutKullanici) {
      return res.status(400).json({ hata: 'Bu email zaten kayitli' });
    }

    const kullaniciSayisi = await Kullanici.countDocuments();
    const kullaniciRol = kullaniciSayisi === 0 ? 'yonetici' : (rol || 'kullanici');

    const kullanici = await Kullanici.create({
      adSoyad,
      email,
      sifre,
      telefon,
      rol: kullaniciRol
    });

    const token = tokenUret(kullanici._id);

    res.status(201).json({
      token,
      kullanici: {
        id: kullanici._id,
        adSoyad: kullanici.adSoyad,
        email: kullanici.email,
        rol: kullanici.rol,
        telefon: kullanici.telefon
      }
    });
  } catch (error) {
    res.status(500).json({ hata: 'Kayit hatasi: ' + error.message });
  }
});

// Giris
router.post('/giris', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({ hata: 'Email ve sifre zorunludur' });
    }

    const kullanici = await Kullanici.findOne({ email }).select('+sifre');
    if (!kullanici) {
      return res.status(401).json({ hata: 'Gecersiz email veya sifre' });
    }

    if (!kullanici.aktif) {
      return res.status(401).json({ hata: 'Hesabiniz pasif durumdadir' });
    }

    const eslesme = await kullanici.sifreKarsilastir(sifre);
    if (!eslesme) {
      return res.status(401).json({ hata: 'Gecersiz email veya sifre' });
    }

    const token = tokenUret(kullanici._id);

    res.json({
      token,
      kullanici: {
        id: kullanici._id,
        adSoyad: kullanici.adSoyad,
        email: kullanici.email,
        rol: kullanici.rol,
        telefon: kullanici.telefon
      }
    });
  } catch (error) {
    res.status(500).json({ hata: 'Giris hatasi: ' + error.message });
  }
});

// Profil getir
router.get('/profil', auth, async (req, res) => {
  res.json({
    kullanici: {
      id: req.kullanici._id,
      adSoyad: req.kullanici.adSoyad,
      email: req.kullanici.email,
      rol: req.kullanici.rol,
      telefon: req.kullanici.telefon
    }
  });
});

// Tum kullaniciyi getir (sadece yonetici)
router.get('/kullanicilar', auth, adminOnly, async (req, res) => {
  try {
    const kullanicilar = await Kullanici.find().select('-sifre').sort({ createdAt: -1 });
    res.json(kullanicilar);
  } catch (error) {
    res.status(500).json({ hata: 'Kullanicilar yuklenemedi' });
  }
});

// Kullanici sil (sadece yonetici)
router.delete('/kullanici/:id', auth, adminOnly, async (req, res) => {
  try {
    const kullanici = await Kullanici.findById(req.params.id);
    if (!kullanici) {
      return res.status(404).json({ hata: 'Kullanici bulunamadi' });
    }
    if (kullanici.rol === 'yonetici') {
      return res.status(400).json({ hata: 'Yonetici silinemez' });
    }
    await Kullanici.findByIdAndDelete(req.params.id);
    res.json({ mesaj: 'Kullanici silindi' });
  } catch (error) {
    res.status(500).json({ hata: 'Silme hatasi' });
  }
});

// Kullanici durumu degistir (sadece yonetici)
router.put('/kullanici/:id/durum', auth, adminOnly, async (req, res) => {
  try {
    const kullanici = await Kullanici.findById(req.params.id);
    if (!kullanici) {
      return res.status(404).json({ hata: 'Kullanici bulunamadi' });
    }
    kullanici.aktif = !kullanici.aktif;
    await kullanici.save();
    res.json({ mesaj: `Kullanici ${kullanici.aktif ? 'aktif' : 'pasif'} edildi`, kullanici });
  } catch (error) {
    res.status(500).json({ hata: 'Guncelleme hatasi' });
  }
});

module.exports = router;
