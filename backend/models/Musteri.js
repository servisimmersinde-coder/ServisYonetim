const mongoose = require('mongoose');

const musteriSchema = new mongoose.Schema({
  adSoyad: {
    type: String,
    required: [true, 'Musteri adi zorunludur'],
    trim: true
  },
  telefon: {
    type: String,
    required: [true, 'Telefon numarasi zorunludur'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  adres: {
    type: String,
    trim: true
  },
  aracMarka: {
    type: String,
    trim: true
  },
  aracModel: {
    type: String,
    trim: true
  },
  plaka: {
    type: String,
    trim: true,
    uppercase: true
  },
  notlar: {
    type: String,
    trim: true
  },
  ekleyenKullanici: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kullanici',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Musteri', musteriSchema);
