import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [istatistik, setIstatistik] = useState(null);
  const [sonServisler, setSonServisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const { kullanici } = useAuth();

  useEffect(() => {
    veriYukle();
  }, []);

  const veriYukle = async () => {
    try {
      const [istRes, servisRes] = await Promise.all([
        servisAPI.istatistik(),
        servisAPI.getAll({})
      ]);
      setIstatistik(istRes.data);
      setSonServisler(servisRes.data.slice(0, 5));
    } catch (err) {
      console.error('Veri yukleme hatasi', err);
    } finally {
      setYukleniyor(false);
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

  if (yukleniyor) return <div className="card">Yukleniyor...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Merhaba, {kullanici?.adSoyad}</h1>
        <Link to="/servisler/yeni" className="btn btn-primary">+ Yeni Servis</Link>
      </div>

      {istatistik && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">&#128295;</div>
            <div className="stat-info">
              <h3>{istatistik.toplamServis}</h3>
              <p>Toplam Servis</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">&#9203;</div>
            <div className="stat-info">
              <h3>{istatistik.bekleyenServis}</h3>
              <p>Bekleyen Servis</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon teal">&#128736;</div>
            <div className="stat-info">
              <h3>{istatistik.devamEdenServis}</h3>
              <p>Devam Eden</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">&#9989;</div>
            <div className="stat-info">
              <h3>{istatistik.tamamlananServis}</h3>
              <p>Tamamlanan</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">&#8378;</div>
            <div className="stat-info">
              <h3>{istatistik.son30GunGelir.toLocaleString('tr-TR')} TL</h3>
              <p>Son 30 Gun Gelir</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">&#128197;</div>
            <div className="stat-info">
              <h3>{istatistik.bugunServis}</h3>
              <p>Bugun</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '18px' }}>Son Servis Kayitlari</h2>
          <Link to="/servisler" className="btn btn-info btn-sm">Tumunu Gor</Link>
        </div>
        {sonServisler.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#128295;</div>
            <p>Henuz servis kaydi bulunmuyor</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fis No</th>
                  <th>Musteri</th>
                  <th>Servis Tipi</th>
                  <th>Durum</th>
                  <th>Tutar</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {sonServisler.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.fisNo}</strong></td>
                    <td>{s.musteri?.adSoyad || '-'}</td>
                    <td>{s.servisTipi}</td>
                    <td>{durumBadge(s.durum)}</td>
                    <td>{s.kdvDahilToplam?.toLocaleString('tr-TR')} TL</td>
                    <td>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
