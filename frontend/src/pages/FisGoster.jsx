import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servisAPI } from '../services/api';

export default function FisGoster() {
  const { id } = useParams();
  const [servis, setServis] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    servisAPI.getOne(id)
      .then(res => setServis(res.data))
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, [id]);

  const yazdir = () => {
    window.print();
  };

  if (yukleniyor) return <div className="card">Yukleniyor...</div>;
  if (!servis) return <div className="card">Servis bulunamadi</div>;

  return (
    <div>
      <div className="page-header no-print">
        <h1>Fis Goster</h1>
        <div className="flex gap-2">
          <button className="btn btn-success btn-sm" onClick={yazdir}>Yazdir</button>
          <Link to={`/servisler/${servis._id}`} className="btn btn-primary btn-sm" style={{ background: '#6b7280' }}>Geri Don</Link>
        </div>
      </div>

      <div className="card">
        <div className="fis-container">
          <h3>SERVIS YONETIM SISTEMI</h3>
          <p className="fis-subtitle">Servis Hizmeti Fişi</p>

          <div className="fis-divider"></div>

          <div className="fis-row">
            <span>Fis No:</span>
            <strong>{servis.fisNo}</strong>
          </div>
          <div className="fis-row">
            <span>Tarih:</span>
            <span>{new Date(servis.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="fis-row">
            <span>Servis Tipi:</span>
            <span>{servis.servisTipi}</span>
          </div>

          <div className="fis-divider"></div>

          <h4 style={{ marginBottom: '6px', fontSize: '13px' }}>MUSTERI BILGILERI</h4>
          <div className="fis-row">
            <span>Ad Soyad:</span>
            <span>{servis.musteri?.adSoyad}</span>
          </div>
          <div className="fis-row">
            <span>Telefon:</span>
            <span>{servis.musteri?.telefon}</span>
          </div>
          <div className="fis-row">
            <span>Plaka:</span>
            <span>{servis.musteri?.plaka}</span>
          </div>
          <div className="fis-row">
            <span>Arac:</span>
            <span>{servis.musteri?.aracMarka} {servis.musteri?.aracModel}</span>
          </div>

          <div className="fis-divider"></div>

          <h4 style={{ marginBottom: '6px', fontSize: '13px' }}>YAPILAN ISLEMLER</h4>
          {servis.yapilanIslemler?.map((i, idx) => (
            <div className="fis-row" key={idx}>
              <span>{i.islem}</span>
              <span>{i.tutar?.toLocaleString('tr-TR')} TL</span>
            </div>
          ))}

          {servis.parcalar?.length > 0 && (
            <>
              <div className="fis-divider"></div>
              <h4 style={{ marginBottom: '6px', fontSize: '13px' }}>PARCALAR</h4>
              {servis.parcalar.map((p, idx) => (
                <div className="fis-row" key={idx}>
                  <span>{p.aciklama} x{p.adet}</span>
                  <span>{p.toplam?.toLocaleString('tr-TR')} TL</span>
                </div>
              ))}
            </>
          )}

          <div className="fis-divider"></div>

          <div className="fis-row">
            <span>Ara Toplam:</span>
            <span>{servis.toplamTutar?.toLocaleString('tr-TR')} TL</span>
          </div>
          {servis.indirimOrani > 0 && (
            <div className="fis-row">
              <span>Indirim ({servis.indirimOrani}%):</span>
              <span>-{(servis.toplamTutar * servis.indirimOrani / 100).toLocaleString('tr-TR')} TL</span>
            </div>
          )}
          <div className="fis-row">
            <span>KDV ({servis.kdvOrani}%):</span>
            <span>{((servis.indirimliTutar) * servis.kdvOrani / 100).toLocaleString('tr-TR')} TL</span>
          </div>

          <div className="fis-divider"></div>

          <div className="fis-row fis-toplam">
            <span>TOPLAM (KDV Dahil):</span>
            <span>{servis.kdvDahilToplam?.toLocaleString('tr-TR')} TL</span>
          </div>

          <div className="fis-divider"></div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '12px' }}>
            Bu fis Servis Yonetim Sistemi tarafindan olusturulmustur.
          </p>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>
            Servis Tarihi: {new Date(servis.baslangicTarihi).toLocaleDateString('tr-TR')}
            {servis.bitisTarihi && ` - Bitis: ${new Date(servis.bitisTarihi).toLocaleDateString('tr-TR')}`}
          </p>
        </div>
      </div>
    </div>
  );
}
