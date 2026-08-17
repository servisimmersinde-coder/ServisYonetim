import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function GirisSayfasi() {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [kayitModu, setKayitModu] = useState(false);
  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const { girisYap, kayitOl } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);

    try {
      if (kayitModu) {
        await kayitOl({ adSoyad, email, sifre, telefon });
      } else {
        await girisYap(email, sifre);
      }
    } catch (err) {
      setHata(err.response?.data?.hata || 'Bir hata olustu');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Servis Yonetim</h1>
        <p className="subtitle">
          {kayitModu ? 'Yeni hesap olusturun' : 'Hesabiniza giris yapin'}
        </p>

        {hata && <div className="error-text mb-4">{hata}</div>}

        <form onSubmit={handleSubmit}>
          {kayitModu && (
            <>
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  placeholder="Adinizi girin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Sifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="Sifrenizi girin"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={yukleniyor}>
            {yukleniyor ? 'Lutfen bekleyin...' : (kayitModu ? 'Kayit Ol' : 'Giris Yap')}
          </button>
        </form>

        <div className="toggle-text">
          {kayitModu ? 'Zaten hesabiniz var mi?' : 'Hesabiniz yok mu?'}
          <button
            className="btn-link"
            onClick={() => { setKayitModu(!kayitModu); setHata(''); }}
          >
            {kayitModu ? 'Giris Yap' : 'Kayit Olun'}
          </button>
        </div>
      </div>
    </div>
  );
}
