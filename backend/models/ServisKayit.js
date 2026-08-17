const mongoose = require('mongoose');

const servisKayitSchema = new mongoose.Schema({
  musteri: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musteri',
    required: [true, 'Musteri zorunludur']
  },
  servisTipi: {
    type: String,
    required: [true, 'Servis tipi zorunludur'],
    trim: true
  },
  aciklama: {
    type: String,
    required: [true, 'Aciklama zorunludur'],
    trim: true
  },
  yapilanIslemler: [{
    islem: String,
    tutar: Number
  }],
  parcalar: [{
    adet: Number,
    birimFiyat: Number,
    toplam: Number,
    aciklama: String
  }],
  toplamTutar: {
    type: Number,
    default: 0
  },
  indirimOrani: {
    type: Number,
    default: 0
  },
  indirimliTutar: {
    type: Number,
    default: 0
  },
  kdvOrani: {
    type: Number,
    default: 20
  },
  kdvDahilToplam: {
    type: Number,
    default: 0
  },
  durum: {
    type: String,
    enum: ['beklemede', 'islemde', 'tamamlandi', 'iptal'],
    default: 'beklemede'
  },
  baslangicTarihi: {
    type: Date,
    default: Date.now
  },
  bitisTarihi: {
    type: Date
  },
  garantiBitisTarihi: {
    type: Date
  },
  notlar: {
    type: String,
    trim: true
  },
  fisNo: {
    type: String,
    unique: true
  },
  ekleyenKullanici: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kullanici',
    required: true
  }
}, {
  timestamps: true
});

servisKayitSchema.pre('save', async function(next) {
  let toplam = 0;

  if (this.yapilanIslemler && this.yapilanIslemler.length > 0) {
    toplam += this.yapilanIslemler.reduce((sum, i) => sum + (i.tutar || 0), 0);
  }
  if (this.parcalar && this.parcalar.length > 0) {
    toplam += this.parcalar.reduce((sum, p) => sum + (p.toplam || 0), 0);
  }

  this.toplamTutar = toplam;
  this.indirimliTutar = toplam - (toplam * this.indirimOrani / 100);
  this.kdvDahilToplam = this.indirimliTutar + (this.indirimliTutar * this.kdvOrani / 100);

  if (!this.fisNo) {
    const tarih = new Date();
    const yil = tarih.getFullYear().toString().slice(-2);
    const ay = (tarih.getMonth() + 1).toString().padStart(2, '0');
    const gun = tarih.getDate().toString().padStart(2, '0');
    const rastgele = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.fisNo = `SVS-${yil}${ay}${gun}-${rastgele}`;
  }

  next();
});

module.exports = mongoose.model('ServisKayit', servisKayitSchema);
