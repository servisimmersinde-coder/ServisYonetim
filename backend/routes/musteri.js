const express = require('express');
const Musteri = require('../models/Musteri');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Tum musterileri getir
router.get('/', auth, async (req, res) => {
  try {
    const { arama } = req.query;
    let filtre = {};

    if (arama) {
      filtre.$or = [
        { adSoyad: { $regex: arama, $options: 'i' } },
        { telefon: { $regex: arama, $options: 'i' } },
        { plaka: { $regex: arama, $options: 'i' } },
        { email: { $regex: arama, $options: 'i' } }
      ];
    }

    if (req.kullanici.rol !== 'yonetici') {
      filtre.ekleyenKullanici = req.kullanici._id;
    }

    const musteriler = await Musteri.find(filtre)
      .populate('ekleyenKullanici', 'adSoyad')
      .sort({ createdAt: -1 });

    res.json(musteriler);
  } catch (error) {
    res.status(500).json({ hata: 'Musteriler yuklenemedi' });
  }
});

// Tek musteri getir
router.get('/:id', auth, async (req, res) => {
  try {
    const musteri = await Musteri.findById(req.params.id)
      .populate('ekleyenKullanici', 'adSoyad');
    if (!musteri) {
      return res.status(404).json({ hata: 'Musteri bulunamadi' });
    }
    res.json(musteri);
  } catch (error) {
    res.status(500).json({ hata: 'Musteri yuklenemedi' });
  }
});

// Yeni musteri ekle
router.post('/', auth, async (req, res) => {
  try {
    const musteri = await Musteri.create({
      ...req.body,
      ekleyenKullanici: req.kullanici._id
    });
    res.status(201).json(musteri);
  } catch (error) {
    res.status(400).json({ hata: 'Musteri eklenemedi: ' + error.message });
  }
});

// Musteri guncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const musteri = await Musteri.findById(req.params.id);
    if (!musteri) {
      return res.status(404).json({ hata: 'Musteri bulunamadi' });
    }

    if (req.kullanici.rol !== 'yonetici' &&
        musteri.ekleyenKullanici.toString() !== req.kullanici._id.toString()) {
      return res.status(403).json({ hata: 'Bu musteriyi duzenleme yetkiniz yok' });
    }

    Object.assign(musteri, req.body);
    await musteri.save();
    res.json(musteri);
  } catch (error) {
    res.status(400).json({ hata: 'Guncelleme hatasi: ' + error.message });
  }
});

// Musteri sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const musteri = await Musteri.findById(req.params.id);
    if (!musteri) {
      return res.status(404).json({ hata: 'Musteri bulunamadi' });
    }

    if (req.kullanici.rol !== 'yonetici' &&
        musteri.ekleyenKullanici.toString() !== req.kullanici._id.toString()) {
      return res.status(403).json({ hata: 'Bu musteriyi silme yetkiniz yok' });
    }

    await Musteri.findByIdAndDelete(req.params.id);
    res.json({ mesaj: 'Musteri silindi' });
  } catch (error) {
    res.status(500).json({ hata: 'Silme hatasi' });
  }
});

module.exports = router;
