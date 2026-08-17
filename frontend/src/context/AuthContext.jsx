import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [kullanici, setKullanici] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.profil()
        .then(res => setKullanici(res.data.kullanici))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('kullanici');
          setToken(null);
          setKullanici(null);
        })
        .finally(() => setYukleniyor(false));
    } else {
      setYukleniyor(false);
    }
  }, [token]);

  const girisYap = async (email, sifre) => {
    const res = await authAPI.giris({ email, sifre });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('kullanici', JSON.stringify(res.data.kullanici));
    setToken(res.data.token);
    setKullanici(res.data.kullanici);
    return res.data;
  };

  const kayitOl = async (data) => {
    const res = await authAPI.kayit(data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('kullanici', JSON.stringify(res.data.kullanici));
    setToken(res.data.token);
    setKullanici(res.data.kullanici);
    return res.data;
  };

  const cikisYap = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('kullanici');
    setToken(null);
    setKullanici(null);
  };

  return (
    <AuthContext.Provider value={{ kullanici, token, yukleniyor, girisYap, kayitOl, cikisYap }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
