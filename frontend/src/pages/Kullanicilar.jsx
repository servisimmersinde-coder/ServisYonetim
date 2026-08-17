import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function Kullanicilar() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silModal, setSilModal] = useState(null);

  useEffect(() => {
    kullanicilariYukle();
  }, []);

  const kullanicilariYukle = async () => {
    try {
      const res = await authAPI.kullanicilar();
      setKullanicilar(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const kullaniciSil = async (id) => {
    try {
      await authAPI.kullaniciSil(id);
      setKullanicilar(kullanicilar.filter(k => k._id !== id));
      setSilModal(null);
    } catch (err) {
      alert(err.response?.data?.hata || 'Silme hatasi');
    }
  };

  const durumDegistir = async (id) => {
    try {
      await authAPI.kullaniciDurum(id);
      kullanicilariYukle();
    } catch (err) {
      alert(err.response?.data?.hata || 'Hata');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Kullanici Yonetimi</h1>
      </div>

      <div className="card">
        {yukleniyor ? (
          <div className="text-center" style={{ padding: '40px' }}>Yukleniyor...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Kayit Tarihi</th>
                  <th>Islemler</th>
                </tr>
              </thead>
              <tbody>
                {kullanicilar.map((k) => (
                  <tr key={k._id}>
                    <td><strong>{k.adSoyad}</strong></td>
                    <td>{k.email}</td>
                    <td>{k.telefon || '-'}</td>
                    <td>
                      <span className={`badge ${k.rol === 'yonetici' ? 'badge-islemde' : 'badge-beklemede'}`}>
                        {k.rol === 'yonetici' ? 'Yonetici' : 'Kullanici'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${k.aktif ? 'badge-tamamlandi' : 'badge-iptal'}`}>
                        {k.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>{new Date(k.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div className="flex gap-2">
                        {k.rol !== 'yonetici' && (
                          <>
                            <button
                              className={`btn btn-sm ${k.aktif ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => durumDegistir(k._id)}
                            >
                              {k.aktif ? 'Pasif Et' : 'Aktif Et'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setSilModal(k)}>Sil</button>
                          </>
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
            <h2>Kullanici Sil</h2>
            <p><strong>{silModal.adSoyad}</strong> isimli kullaniciciyi silmek istediginize emin misiniz?</p>
            <div className="modal-actions">
              <button className="btn btn-primary btn-sm" style={{ background: '#6b7280' }} onClick={() => setSilModal(null)}>Iptal</button>
              <button className="btn btn-danger btn-sm" onClick={() => kullaniciSil(silModal._id)}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
