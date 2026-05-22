import axios from 'axios';

// Buat instance Axios dengan konfigurasi dasar
const apiClient = axios.create({
  // --- PERBAIKAN UTAMA DI SINI ---
  //baseURL: 'https://mochafolk.com/api', // Gunakan domain aman Anda
  // -------------------------------

  // baseURL: 'http://localhost:3000',
   baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk melampirkan token secara otomatis
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;

