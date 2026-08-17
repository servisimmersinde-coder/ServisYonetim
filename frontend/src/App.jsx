import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import GirisSayfasi from './pages/GirisSayfasi';
import AnaLayout from './pages/AnaLayout';
import Dashboard from './pages/Dashboard';
import Servisler from './pages/Servisler';
import YeniServis from './pages/YeniServis';
import ServisDetay from './pages/ServisDetay';
import FisGoster from './pages/FisGoster';
import Musteriler from './pages/Musteriler';
import Kullanicilar from './pages/Kullanicilar';

function KorumaliRota({ children }) {
  const { kullanici, yukleniyor } = useAuth();
  if (yukleniyor) return <div style={{ textAlign: 'center', padding: '100px' }}>Yukleniyor...</div>;
  return kullanici ? children : <Navigate to="/giris" />;
}

function GirisRota({ children }) {
  const { kullanici, yukleniyor } = useAuth();
  if (yukleniyor) return <div style={{ textAlign: 'center', padding: '100px' }}>Yukleniyor...</div>;
  return kullanici ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/giris" element={<GirisRota><GirisSayfasi /></GirisRota>} />
      <Route path="/" element={<KorumaliRota><AnaLayout /></KorumaliRota>}>
        <Route index element={<Dashboard />} />
        <Route path="servisler" element={<Servisler />} />
        <Route path="servisler/yeni" element={<YeniServis />} />
        <Route path="servisler/:id" element={<ServisDetay />} />
        <Route path="servisler/:id/fis" element={<FisGoster />} />
        <Route path="musteriler" element={<Musteriler />} />
        <Route path="kullanicilar" element={<Kullanicilar />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
