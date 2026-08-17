import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('kullanici');
      window.location.href = '/giris';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  giris: (data) => API.post('/auth/giris', data),
  kayit: (data) => API.post('/auth/kayit', data),
  profil: () => API.get('/auth/profil'),
  kullanicilar: () => API.get('/auth/kullanicilar'),
  kullaniciSil: (id) => API.delete(`/auth/kullanici/${id}`),
  kullaniciDurum: (id) => API.put(`/auth/kullanici/${id}/durum`),
};

export const musteriAPI = {
  getAll: (arama) => API.get('/musteriler', { params: { arama } }),
  getOne: (id) => API.get(`/musteriler/${id}`),
  create: (data) => API.post('/musteriler', data),
  update: (id, data) => API.put(`/musteriler/${id}`, data),
  delete: (id) => API.delete(`/musteriler/${id}`),
};

export const servisAPI = {
  getAll: (params) => API.get('/servisler', { params }),
  getOne: (id) => API.get(`/servisler/${id}`),
  create: (data) => API.post('/servisler', data),
  update: (id, data) => API.put(`/servisler/${id}`, data),
  delete: (id) => API.delete(`/servisler/${id}`),
  istatistik: () => API.get('/servisler/istatistik/ozet'),
};

export default API;
