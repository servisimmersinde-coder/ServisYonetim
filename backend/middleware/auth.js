const jwt = require('jsonwebtoken');
const Kullanici = require('../models/Kullanici');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ hata: 'Yetkilendirme hatasi - Token gerekli' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const kullanici = await Kullanici.findById(decoded.id);

    if (!kullanici || !kullanici.aktif) {
      return res.status(401).json({ hata: 'Kullanici bulunamadi veya pasif' });
    }

    req.kullanici = kullanici;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ hata: 'Yetkilendirme hatasi' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.kullanici.rol !== 'yonetici') {
    return res.status(403).json({ hata: 'Bu islem icin yonetici yetkisi gerekli' });
  }
  next();
};

module.exports = { auth, adminOnly };
