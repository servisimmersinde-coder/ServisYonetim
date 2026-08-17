import { useState, useEffect } from 'react';
import { musteriAPI } from '../services/api';

export default function Musteriler() {
  const [musteriler, setMusteriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState('');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenenMusteri, setDuzenlenenMusteri] = useState(null);
  const [silModal, setSilModal] = useState(null);

  const [form, setForm] = useState({
    adSoyad: '', telefon: '', email: '', adres: '',
    aracMarka: '', aracModel: '', plaka: '', notlar: ''
  });

  useEffect(() => {
    musterileriYukle();
  }, []);

  const musterileriYukle = async (aramaMetni = arama) => {
    setYukleniyor(true);
    try {
      const res = await musteriAPI.getAll(aramaMetni);
      setMusteriler(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleArama = (e) => {
    e.preventDefault();
    musterileriYukle();
  };

  const formResetle = () => {
    setForm({
      adSoyad: '', telefon: '', email: '', adres: '',
      aracMarka: '', aracModel: '', plaka: '', notlar: ''
    });
    setDuzenlenenMusteri(null);
  };

  const modalAc = (musteri = null) => {
    if (musteri) {
      setDuzenlenenMusteri(musteri);
      setForm({
        adSoyad: musteri.adSoyad || '',
        telefon: musteri.telefon || '',
        email: musteri.email || '',
        adres: musteri.adres || '',
        aracMarka: musteri.aracMarka || '',
        aracModel: musteri.aracModel || '',
        plaka: musteri.plaka || '',
        notlar: musteri.notlar || ''
      });
    } else {
      formResetle();
    }
    setModalAcik(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (duzenlenenMusteri) {
        await musteriAPI.update(duzenlenenMusteri._id, form);
      } else {
        await musteriAPI.create(form);
      }
      setModalAcik(false);
      formResetle();
      musterileriYukle();
    } catch (err) {
      alert(err.response?.data?.hata || 'Hata olustu');
    }
  };

  const musteriSil = async (id) => {
    try {
      await musteriAPI.delete(id);
      setMusteriler(musteriler.filter(m => m._id !== id));
      setSilModal(null);
    } catch (err) {
      alert(err.response?.data?.hata || 'Silme hatasi');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Musteriler</h1>
        <button className="btn btn-primary" onClick={() => modalAc()}>+ Yeni Musteri</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <form onSubmit={handleArama} style={{ display: 'flex', gap: '12px', flex: 1 }}>
            <input
              type="text"
              placeholder="Ad, telefon veya plaka ile arama..."
              value={arama}
              onChange={(e) => setArama(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Ara</button>
          </form>
        </div>

        {yukleniyor ? (
          <div className="text-center" style={{ padding: '40px' }}>Yukleniyor...</div>
        ) : musteriler.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#128100;</div>
            <p>Musteri bulunamadi</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Telefon</th>
                  <th>Plaka</th>
                  <th>Arac</th>
                  <th>Islemler</th>
                </tr>
              </thead>
              <tbody>
                {musteriler.map((m) => (
                  <tr key={m._id}>
                    <td><strong>{m.adSoyad}</strong></td>
                    <td>{m.telefon}</td>
                    <td>{m.plaka || '-'}</td>
                    <td>{m.aracMarka} {m.aracModel}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-info btn-sm" onClick={() => modalAc(m)}>Duzenle</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setSilModal(m)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAcik && (
        <div className="modal-overlay" onClick={() => setModalAcik(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{duzenlenenMusteri ? 'Musteri Duzenle' : 'Yeni Musteri'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ad Soyad *</label>
                  <input type="text" value={form.adSoyad} onChange={(e) => setForm({...form, adSoyad: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Telefon *</label>
                  <input type="tel" value={form.telefon} onChange={(e) => setForm({...form, telefon: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Plaka</label>
                  <input type="text" value={form.plaka} onChange={(e) => setForm({...form, plaka: e.target.value.toUpperCase()})} placeholder="34 ABC 123" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Arac Marka</label>
                  <input type="text" value={form.aracMarka} onChange={(e) => setForm({...form, aracMarka: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Arac Model</label>
                  <input type="text" value={form.aracModel} onChange={(e) => setForm({...form, aracModel: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Adres</label>
                <textarea value={form.adres} onChange={(e) => setForm({...form, adres: e.target.value})} rows="2" />
              </div>
              <div className="form-group">
                <label>Notlar</label>
                <textarea value={form.notlar} onChange={(e) => setForm({...form, notlar: e.target.value})} rows="2" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-primary btn-sm" style={{ background: '#6b7280' }} onClick={() => { setModalAcik(false); formResetle(); }}>Iptal</button>
                <button type="submit" className="btn btn-success btn-sm">{duzenlenenMusteri ? 'Guncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {silModal && (
        <div className="modal-overlay" onClick={() => setSilModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Musteri Sil</h2>
            <p><strong>{silModal.adSoyad}</strong> isimli musteriyi silmek istediginize emin misiniz?</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-sm" style={{ background: '#6b7280' }} onClick={() => setSilModal(null)}>Iptal</button>
              <button className="btn btn-danger btn-sm" onClick={() => musteriSil(silModal._id)}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
