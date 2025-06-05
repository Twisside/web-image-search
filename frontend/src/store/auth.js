import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/auth/login', credentials);
        const { token, user } = response.data;
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        router.push('/');
      } catch (error) {
        console.error('Login failed:', error);
        alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        // Optionally, throw the error to be handled by the component
        throw error;
      }
    },
    async register(userData) {
      try {
        await axios.post('/auth/register', userData);
        // Optionally, log in the user directly after registration
        await this.login({ username: userData.username, password: userData.password });
      } catch (error) {
        console.error('Registration failed:', error);
        alert(error.response?.data?.message || 'Registration failed.');
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      router.push('/login');
    },
    // Action to generate a specific token if needed for the /token endpoint as per prompt
    async generateToken(payload) { // payload might be { username, password, role (optional) }
      try {
        // Assuming /api/token is a distinct endpoint as per \"Have a /token endpoint\"
        const response = await axios.post('/token', payload); 
        const { token, user } = response.data; // Assuming similar response structure
        this.token = token;
        this.user = user; // Or whatever user info is relevant from this endpoint
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Decide navigation based on context, maybe not always to home
      } catch (error) {
        console.error('Token generation failed:', error);
        alert(error.response?.data?.message || 'Token generation failed.');
        throw error;
      }
    }
  }
});