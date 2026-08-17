import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AnaLayout() {
  const { kullanici, cikisYap } = useAuth();
  const navigate = useNavigate();
  const yonetici = kullanici?.rol === 'yonetici';

  const cikis = () => {
    cikisYap();
    navigate('/giris');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Servis Yonetim</h2>
          <p>{yonetici ? 'Yonetici Paneli' : 'Kullanici Paneli'}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            <span className="icon">&#127968;</span> Dashboard
          </NavLink>
          <NavLink to="/servisler">
            <span className="icon">&#128295;</span> Servisler
          </NavLink>
          <NavLink to="/musteriler">
            <span className="icon">&#128100;</span> Musteriler
          </NavLink>
          {yonetici && (
            <NavLink to="/kullanicilar">
              <span className="icon">&#128101;</span> Kullanicilar
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {kullanici?.adSoyad?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="user-name">{kullanici?.adSoyad}</div>
              <div className="user-role">{kullanici?.rol}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={cikis}>
            Cikis Yap
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
