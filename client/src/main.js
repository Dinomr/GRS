import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configurar Axios
axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Interceptor para manejar errores
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la petición:', error)
    return Promise.reject(error)
  }
)

// Configurar axios
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const app = createApp(App);
app.use(router);
app.mount('#app');
