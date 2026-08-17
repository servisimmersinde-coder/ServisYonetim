import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servisAPI, musteriAPI } from '../services/api';

export default function YeniServis() {
  const navigate = useNavigate();
  const [musteriler, setMusteriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const [form, setForm] = useState({
    musteri: '',
    servisTipi: '',
    aciklama: '',
    yapilanIslemler: [{ islem: '', tutar: 0 }],
    parcalar: [{ adet: 1, birimFiyat: 0, toplam: 0, aciklama: '' }],
    indirimOrani: 0,
    kdvOrani: 20,
    notlar: ''
  });

  useEffect(() => {
    musteriAPI.getAll().then(res => setMusteriler(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const islemEkle = () => {
    setForm({
      ...form,
      yapilanIslemler: [...form.yapilanIslemler, { islem: '', tutar: 0 }]
    });
  };

  const islemSil = (index) => {
    const yeniIslemler = form.yapilanIslemler.filter((_, i) => i !== index);
    setForm({ ...form, yapilanIslemler: yeniIslemler });
  };

  const islemDegistir = (index, alan, deger) => {
    const yeniIslemler = [...form.yapilanIslemler];
    yeniIslemler[index][alan] = alan === 'tutar' ? Number(deger) : deger;
    setForm({ ...form, yapilanIslemler: yeniIslemler });
  };

  const parcaEkle = () => {
    setForm({
      ...form,
      parcalar: [...form.parcalar, { adet: 1, birimFiyat: 0, toplam: 0, aciklama: '' }]
    });
  };

  const parcaSil = (index) => {
    const yeniParcalar = form.parcalar.filter((_, i) => i !== index);
    setForm({ ...form, parcalar: yeniParcalar });
  };

  const parcaDegistir = (index, alan, deger) => {
    const yeniParcalar = [...form.parcalar];
    if (alan === 'aciklama') {
      yeniParcalar[index][alan] = deger;
    } else {
      yeniParcalar[index][alan] = Number(deger);
    }
    yeniParcalar[index].toplam = yeniParcalar[index].adet * yeniParcalar[index].birimFiyat;
    setForm({ ...form, parcalar: yeniParcalar });
  };

  const hesaplaToplam = () => {
    let toplam = 0;
    form.yapilanIslemler.forEach(i => { toplam += i.tutar || 0; });
    form.parcalar.forEach(p => { toplam += p.toplam || 0; });
    const indirimli = toplam - (toplam * (form.indirimOrani || 0) / 100);
    const kdvDahil = indirimli + (indirimli * (form.kdvOrani || 0) / 100);
    return { toplam, indirimli, kdvDahil };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);

    try {
      await servisAPI.create(form);
      navigate('/servisler');
    } catch (err) {
      setHata(err.response?.data?.hata || 'Kayit hatasi');
    } finally {
      setYukleniyor(false);
    }
  };

  const { toplam, indirimli, kdvDahil } = hesaplaToplam();

  return (
    <div>
      <div className="page-header">
        <h1>Yeni Servis Kaydi</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {hata && <div className="error-text mb-4">{hata}</div>}

        <div className="card">
          <h3 className="mb-4">Musteri ve Servis Bilgileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Musteri *</label>
              <select name="musteri" value={form.musteri} onChange={handleChange} required>
                <option value="">Musteri secin...</option>
                {musteriler.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.adSoyad} - {m.plaka || 'Plaka yok'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Servis Tipi *</label>
              <input
                type="text"
                name="servisTipi"
                value={form.servisTipi}
                onChange={handleChange}
                placeholder="Ornegin: Yağ Degisimi, Fren Kontrolu"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Aciklama *</label>
            <textarea
              name="aciklama"
              value={form.aciklama}
              onChange={handleChange}
              placeholder="Servis hakkinda aciklama..."
              rows="3"
              required
            />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Yapilan Islemler</h3>
            <button type="button" className="btn btn-info btn-sm" onClick={islemEkle}>+ Islem Ekle</button>
          </div>
          {form.yapilanIslemler.map((islem, index) => (
            <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Islem aciklamasi"
                value={islem.islem}
                onChange={(e) => islemDegistir(index, 'islem', e.target.value)}
                style={{ flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Tutar"
                value={islem.tutar || ''}
                onChange={(e) => islemDegistir(index, 'tutar', e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              {form.yapilanIslemler.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => islemSil(index)}>X</button>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Parcalar</h3>
            <button type="button" className="btn btn-info btn-sm" onClick={parcaEkle}>+ Parca Ekle</button>
          </div>
          {form.parcalar.map((parca, index) => (
            <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Parca aciklamasi"
                value={parca.aciklama}
                onChange={(e) => parcaDegistir(index, 'aciklama', e.target.value)}
                style={{ flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Adet"
                value={parca.adet || ''}
                onChange={(e) => parcaDegistir(index, 'adet', e.target.value)}
                style={{ flex: 0.5, padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Birim Fiyat"
                value={parca.birimFiyat || ''}
                onChange={(e) => parcaDegistir(index, 'birimFiyat', e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <span style={{ flex: 1, padding: '8px', background: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
                {parca.toplam?.toLocaleString('tr-TR') || 0} TL
              </span>
              {form.parcalar.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => parcaSil(index)}>X</button>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="mb-4">Fiyat Ozeti</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Indirim (%)</label>
              <input
                type="number"
                name="indirimOrani"
                value={form.indirimOrani}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>KDV (%)</label>
              <input
                type="number"
                name="kdvOrani"
                value={form.kdvOrani}
                onChange={handleChange}
              />
            </div>
          </div>
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
            <div className="flex justify-between mb-2"><span>Ara Toplam:</span><strong>{toplam.toLocaleString('tr-TR')} TL</strong></div>
            <div className="flex justify-between mb-2"><span>Indirim ({form.indirimOrani}%):</span><strong>-{(toplam * form.indirimOrani / 100).toLocaleString('tr-TR')} TL</strong></div>
            <div className="flex justify-between mb-2"><span>KDV ({form.kdvOrani}%):</span><strong>{((toplam - toplam * form.indirimOrani / 100) * form.kdvOrani / 100).toLocaleString('tr-TR')} TL</strong></div>
            <hr style={{ margin: '8px 0' }} />
            <div className="flex justify-between" style={{ fontSize: '18px' }}>
              <strong>Toplam:</strong>
              <strong style={{ color: '#2563eb' }}>{kdvDahil.toLocaleString('tr-TR')} TL</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-group">
            <label>Notlar</label>
            <textarea
              name="notlar"
              value={form.notlar}
              onChange={handleChange}
              placeholder="Ek notlar..."
              rows="3"
            />
          </div>
        </div>

        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/servisler')} style={{ background: '#6b7280' }}>Iptal</button>
          <button type="submit" className="btn btn-success btn-sm" disabled={yukleniyor}>
            {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
