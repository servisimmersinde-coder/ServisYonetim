const express = require('express');
const ServisKayit = require('../models/ServisKayit');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Tum servis kayitlarini getir
router.get('/', auth, async (req, res) => {
  try {
    const { durum, arama, baslangic, bitis } = req.query;
    let filtre = {};

    if (durum) filtre.durum = durum;

    if (baslangic || bitis) {
      filtre.createdAt = {};
      if (baslangic) filtre.createdAt.$gte = new Date(baslangic);
      if (bitis) filtre.createdAt.$lte = new Date(bitis + 'T23:59:59');
    }

    if (req.kullanici.rol !== 'yonetici') {
      filtre.ekleyenKullanici = req.kullanici._id;
    }

    let sorgu = ServisKayit.find(filtre)
      .populate('musteri', 'adSoyad telefon plaka aracMarka aracModel')
      .populate('ekleyenKullanici', 'adSoyad');

    if (arama) {
      const musteriler = await require('../models/Musteri').find({
        $or: [
          { adSoyad: { $regex: arama, $options: 'i' } },
          { plaka: { $regex: arama, $options: 'i' } },
          { telefon: { $regex: arama, $options: 'i' } }
        ]
      }).select('_id');

      const musteriIdleri = musteriler.map(m => m._id);
      filtre.$or = [
        { musteri: { $in: musteriIdleri } },
        { fisNo: { $regex: arama, $options: 'i' } }
      ];
      sorgu = ServisKayit.find(filtre)
        .populate('musteri', 'adSoyad telefon plaka aracMarka aracModel')
        .populate('ekleyenKullanici', 'adSoyad');
    }

    const kayitlar = await sorgu.sort({ createdAt: -1 });
    res.json(kayitlar);
  } catch (error) {
    res.status(500).json({ hata: 'Servis kayitlari yuklenemedi' });
  }
});

// Tek servis kaydi getir
router.get('/:id', auth, async (req, res) => {
  try {
    const kayit = await ServisKayit.findById(req.params.id)
      .populate('musteri')
      .populate('ekleyenKullanici', 'adSoyad telefon');
    if (!kayit) {
      return res.status(404).json({ hata: 'Servis kaydi bulunamadi' });
    }
    res.json(kayit);
  } catch (error) {
    res.status(500).json({ hata: 'Kayit yuklenemedi' });
  }
});

// Yeni servis kaydi olustur
router.post('/', auth, async (req, res) => {
  try {
    const kayit = await ServisKayit.create({
      ...req.body,
      ekleyenKullanici: req.kullanici._id
    });
    const doluKayit = await ServisKayit.findById(kayit._id)
      .populate('musteri', 'adSoyad telefon plaka aracMarka aracModel')
      .populate('ekleyenKullanici', 'adSoyad');
    res.status(201).json(doluKayit);
  } catch (error) {
    res.status(400).json({ hata: 'Servis kaydi olusturulamadi: ' + error.message });
  }
});

// Servis kaydini guncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const kayit = await ServisKayit.findById(req.params.id);
    if (!kayit) {
      return res.status(404).json({ hata: 'Servis kaydi bulunamadi' });
    }

    if (req.kullanici.rol !== 'yonetici' &&
        kayit.ekleyenKullanici.toString() !== req.kullanici._id.toString()) {
      return res.status(403).json({ hata: 'Bu kaydi duzenleme yetkiniz yok' });
    }

    Object.assign(kayit, req.body);
    if (req.body.durum === 'tamamlandi' && !kayit.bitisTarihi) {
      kayit.bitisTarihi = new Date();
    }
    await kayit.save();

    const guncellenmis = await ServisKayit.findById(kayit._id)
      .populate('musteri', 'adSoyad telefon plaka aracMarka aracModel')
      .populate('ekleyenKullanici', 'adSoyad');

    res.json(guncellenmis);
  } catch (error) {
    res.status(400).json({ hata: 'Guncelleme hatasi: ' + error.message });
  }
});

// Servis kaydini sil
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const kayit = await ServisKayit.findByIdAndDelete(req.params.id);
    if (!kayit) {
      return res.status(404).json({ hata: 'Servis kaydi bulunamadi' });
    }
    res.json({ mesaj: 'Servis kaydi silindi' });
  } catch (error) {
    res.status(500).json({ hata: 'Silme hatasi' });
  }
});

// Dashboard istatistikleri
router.get('/istatistik/ozet', auth, async (req, res) => {
  try {
    let filtre = {};
    if (req.kullanici.rol !== 'yonetici') {
      filtre.ekleyenKullanici = req.kullanici._id;
    }

    const toplamServis = await ServisKayit.countDocuments(filtre);
    const bekleyenServis = await ServisKayit.countDocuments({ ...filtre, durum: 'beklemede' });
    const devamEdenServis = await ServisKayit.countDocuments({ ...filtre, durum: 'islemde' });
    const tamamlananServis = await ServisKayit.countDocuments({ ...filtre, durum: 'tamamlandi' });

    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const bugunServis = await ServisKayit.countDocuments({
      ...filtre,
      createdAt: { $gte: bugun }
    });

    const gelirSon30Gun = await ServisKayit.aggregate([
      {
        $match: {
          ...filtre,
          durum: 'tamamlandi',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          toplamGelir: { $sum: '$kdvDahilToplam' }
        }
      }
    ]);

    res.json({
      toplamServis,
      bekleyenServis,
      devamEdenServis,
      tamamlananServis,
      bugunServis,
      son30GunGelir: gelirSon30Gun[0]?.toplamGelir || 0
    });
  } catch (error) {
    res.status(500).json({ hata: 'Istatistikler yuklenemedi' });
  }
});

module.exports = router;
