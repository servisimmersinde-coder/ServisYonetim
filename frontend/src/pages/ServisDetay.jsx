import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { servisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ServisDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servis, setServis] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [duzenleme, setDuzenleme] = useState(false);
  const [form, setForm] = useState({});
  const { kullanici } = useAuth();

  useEffect(() => {
    servisiYukle();
  }, [id]);

  const servisiYukle = async () => {
    try {
      const res = await servisAPI.getOne(id);
      setServis(res.data);
      setForm(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const durumGuncelle = async (yeniDurum) => {
    try {
      await servisAPI.update(id, { durum: yeniDurum });
      servisiYukle();
    } catch (err) {
      alert(err.response?.data?.hata || 'Guncelleme hatasi');
    }
  };

  const kaydet = async () => {
    try {
      await servisAPI.update(id, { durum: form.durum, notlar: form.notlar, aciklama: form.aciklama });
      setDuzenleme(false);
      servisiYukle();
    } catch (err) {
      alert(err.response?.data?.hata || 'Guncelleme hatasi');
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
  if (!servis) return <div className="card">Servis kaydi bulunamadi</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Servis Detay - {servis.fisNo}</h1>
        <div className="flex gap-2">
          <Link to={`/servisler/${servis._id}/fis`} className="btn btn-success btn-sm">Fis Goster</Link>
          <Link to="/servisler" className="btn btn-primary btn-sm" style={{ background: '#6b7280' }}>Geri Don</Link>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3>Musteri Bilgileri</h3>
          {durumBadge(servis.durum)}
        </div>
        <div className="form-row">
          <div><strong>Ad Soyad:</strong> {servis.musteri?.adSoyad}</div>
          <div><strong>Telefon:</strong> {servis.musteri?.telefon}</div>
          <div><strong>Plaka:</strong> {servis.musteri?.plaka}</div>
          <div><strong>Arac:</strong> {servis.musteri?.aracMarka} {servis.musteri?.aracModel}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4">Servis Bilgileri</h3>
        <div className="form-row">
          <div><strong>Servis Tipi:</strong> {servis.servisTipi}</div>
          <div><strong>Aciklama:</strong> {servis.aciklama}</div>
          <div><strong>Baslangic:</strong> {new Date(servis.baslangicTarihi).toLocaleDateString('tr-TR')}</div>
          <div><strong>Bitis:</strong> {servis.bitisTarihi ? new Date(servis.bitisTarihi).toLocaleDateString('tr-TR') : '-'}</div>
        </div>
      </div>

      {servis.yapilanIslemler?.length > 0 && (
        <div className="card">
          <h3 className="mb-4">Yapilan Islemler</h3>
          <table>
            <thead>
              <tr><th>Islem</th><th className="text-right">Tutar</th></tr>
            </thead>
            <tbody>
              {servis.yapilanIslemler.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.islem}</td>
                  <td className="text-right">{i.tutar?.toLocaleString('tr-TR')} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {servis.parcalar?.length > 0 && (
        <div className="card">
          <h3 className="mb-4">Kullanilan Parcalar</h3>
          <table>
            <thead>
              <tr><th>Parca</th><th>Adet</th><th>Birim Fiyat</th><th className="text-right">Toplam</th></tr>
            </thead>
            <tbody>
              {servis.parcalar.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.aciklama}</td>
                  <td>{p.adet}</td>
                  <td>{p.birimFiyat?.toLocaleString('tr-TR')} TL</td>
                  <td className="text-right">{p.toplam?.toLocaleString('tr-TR')} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h3 className="mb-4">Fiyat Ozeti</h3>
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
          <div className="flex justify-between mb-2"><span>Ara Toplam:</span><strong>{servis.toplamTutar?.toLocaleString('tr-TR')} TL</strong></div>
          <div className="flex justify-between mb-2"><span>Indirim ({servis.indirimOrani}%):</span><strong>-{(servis.toplamTutar * servis.indirimOrani / 100).toLocaleString('tr-TR')} TL</strong></div>
          <div className="flex justify-between mb-2"><span>KDV ({servis.kdvOrani}%):</span><strong>{((servis.indirimliTutar) * servis.kdvOrani / 100).toLocaleString('tr-TR')} TL</strong></div>
          <hr style={{ margin: '8px 0' }} />
          <div className="flex justify-between" style={{ fontSize: '18px' }}>
            <strong>Toplam (KDV Dahil):</strong>
            <strong style={{ color: '#2563eb' }}>{servis.kdvDahilToplam?.toLocaleString('tr-TR')} TL</strong>
          </div>
        </div>
      </div>

      {kullanici?.rol === 'yonetici' && (
        <div className="card">
          <h3 className="mb-4">Durum Guncelle</h3>
          <div className="flex gap-2">
            <button className="btn btn-warning btn-sm" onClick={() => durumGuncelle('beklemede')}>Beklemede</button>
            <button className="btn btn-info btn-sm" onClick={() => durumGuncelle('islemde')}>Islemde</button>
            <button className="btn btn-success btn-sm" onClick={() => durumGuncelle('tamamlandi')}>Tamamlandi</button>
            <button className="btn btn-danger btn-sm" onClick={() => durumGuncelle('iptal')}>Iptal</button>
          </div>
        </div>
      )}

      {servis.notlar && (
        <div className="card">
          <h3 className="mb-2">Notlar</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{servis.notlar}</p>
        </div>
      )}
    </div>
  );
}
