const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const kullaniciSchema = new mongoose.Schema({
  adSoyad: {
    type: String,
    required: [true, 'Ad Soyad zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email zorunludur'],
    unique: true,
    lowercase: true,
    trim: true
  },
  sifre: {
    type: String,
    required: [true, 'Sifre zorunludur'],
    minlength: 6,
    select: false
  },
  rol: {
    type: String,
    enum: ['yonetici', 'kullanici'],
    default: 'kullanici'
  },
  telefon: {
    type: String,
    trim: true
  },
  aktif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

kullaniciSchema.pre('save', async function(next) {
  if (!this.isModified('sifre')) return next();
  const salt = await bcrypt.genSalt(10);
  this.sifre = await bcrypt.hash(this.sifre, salt);
  next();
});

kullaniciSchema.methods.sifreKarsilastir = async function(girilenSifre) {
  return await bcrypt.compare(girilenSifre, this.sifre);
};

module.exports = mongoose.model('Kullanici', kullaniciSchema);
