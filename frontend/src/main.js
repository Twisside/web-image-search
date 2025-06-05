import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia';
import router from './router';
import axios from 'axios';
import { useAuthStore } from './store/auth';

axios.defaults.baseURL = '/api';
const app = createApp(App);
app.use(createPinia());
app.use(router);

const authStore = useAuthStore();

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const auth = useAuthStore(); // Get store instance inside interceptor
      auth.logout();
      router.push('/login');
      alert('Session expired or unauthorized. Please log in again.');
    }
    return Promise.reject(error);
  }
);

// If token exists on init, set it to axios headers
if (authStore.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
}

app.mount('#app');
