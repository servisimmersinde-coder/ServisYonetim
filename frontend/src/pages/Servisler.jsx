import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Servisler() {
  const [servisler, setServisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState('');
  const [durumFiltre, setDurumFiltre] = useState('');
  const [silModal, setSilModal] = useState(null);
  const { kullanici } = useAuth();

  useEffect(() => {
    servisleriYukle();
  }, [durumFiltre]);

  const servisleriYukle = async () => {
    setYukleniyor(true);
    try {
      const res = await servisAPI.getAll({ durum: durumFiltre, arama });
      setServisler(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleArama = (e) => {
    e.preventDefault();
    servisleriYukle();
  };

  const servisSil = async (id) => {
    try {
      await servisAPI.delete(id);
      setServisler(servisler.filter(s => s._id !== id));
      setSilModal(null);
    } catch (err) {
      alert(err.response?.data?.hata || 'Silme hatasi');
    }
  };

  const durumBadge = (durum) => {
    const etiketler = {
      beklemede: 'Beklemede',
      islemde: 'Islemde',
      tamamlandi: 'Tamamlandi',
      iptal: 'Iptal'
    };
    return <span className={`badge badge-${durum}`}>{etiketler[durum]}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Servis Kayitlari</h1>
        <Link to="/servisler/yeni" className="btn btn-primary">+ Yeni Servis</Link>
      </div>

      <div className="card">
        <div className="search-bar">
          <form onSubmit={handleArama} style={{ display: 'flex', gap: '12px', flex: 1 }}>
            <input
              type="text"
              placeholder="Musteri, plaka veya fis no ile arama..."
              value={arama}
              onChange={(e) => setArama(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Ara</button>
          </form>
          <select value={durumFiltre} onChange={(e) => setDurumFiltre(e.target.value)}>
            <option value="">Tum Durumlar</option>
            <option value="beklemede">Beklemede</option>
            <option value="islemde">Islemde</option>
            <option value="tamamlandi">Tamamlandi</option>
            <option value="iptal">Iptal</option>
          </select>
        </div>

        {yukleniyor ? (
          <div className="text-center" style={{ padding: '40px' }}>Yukleniyor...</div>
        ) : servisler.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#128295;</div>
            <p>Servis kaydi bulunamadi</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fis No</th>
                  <th>Musteri</th>
                  <th>Plaka</th>
                  <th>Servis Tipi</th>
                  <th>Durum</th>
                  <th>Tutar</th>
                  <th>Tarih</th>
                  <th>Islemler</th>
                </tr>
              </thead>
              <tbody>
                {servisler.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.fisNo}</strong></td>
                    <td>{s.musteri?.adSoyad || '-'}</td>
                    <td>{s.musteri?.plaka || '-'}</td>
                    <td>{s.servisTipi}</td>
                    <td>{durumBadge(s.durum)}</td>
                    <td>{s.kdvDahilToplam?.toLocaleString('tr-TR')} TL</td>
                    <td>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/servisler/${s._id}`} className="btn btn-info btn-sm">Gor</Link>
                        <Link to={`/servisler/${s._id}/fis`} className="btn btn-success btn-sm">Fis</Link>
                        {kullanici?.rol === 'yonetici' && (
                          <button className="btn btn-danger btn-sm" onClick={() => setSilModal(s)}>Sil</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {silModal && (
        <div className="modal-overlay" onClick={() => setSilModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Servis Kaydini Sil</h2>
            <p><strong>{silModal.fisNo}</strong> numarali servis kaydini silmek istediginize emin misiniz?</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-sm" onClick={() => setSilModal(null)}>Iptal</button>
              <button className="btn btn-danger btn-sm" onClick={() => servisSil(silModal._id)}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
