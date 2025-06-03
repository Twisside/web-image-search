<template>
  <div class="login-container">
    <h2>Login or Register</h2>
    <form @submit.prevent="handleLogin" v-if="!showRegisterForm">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="loginCredentials.username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="loginCredentials.password" required>
      </div>
      <button type="submit" :disabled="loading">Login</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <form @submit.prevent="handleRegister" v-if="showRegisterForm">
      <div>
        <label for="reg-username">Username:</label>
        <input type="text" id="reg-username" v-model="registerCredentials.username" required>
      </div>
      <div>
        <label for="reg-password">Password:</label>
        <input type="password" id="reg-password" v-model="registerCredentials.password" required>
      </div>
       <div>
        <label for="reg-role">Role (e.g., USER, ADMIN - for demo):</label>
        <input type="text" id="reg-role" v-model="registerCredentials.role">
         <small>Default: USER. For demo, you can try ADMIN if backend supports it.</small>
      </div>
      <button type="submit" :disabled="loading">Register</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <button @click="toggleFormType" :disabled="loading">
      {{ showRegisterForm ? 'Switch to Login' : 'Switch to Register' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const showRegisterForm = ref(false);

const loginCredentials = ref({
  username: '',
  password: ''
});

const registerCredentials = ref({
  username: '',
  password: '',
  role: 'USER' // Default role, can be changed by user for demo if backend allows
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(loginCredentials.value);
    // Router will navigate on success (defined in authStore action)
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed.';
  }
  loading.value = false;
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.register({
        username: registerCredentials.value.username,
        password: registerCredentials.value.password,
        roles: [registerCredentials.value.role] // Backend expects roles as an array
    });
    // Router will navigate on success (defined in authStore action via login after register)
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.';
  }
  loading.value = false;
};

const toggleFormType = () => {
  showRegisterForm.value = !showRegisterForm.value;
  error.value = ''; // Clear error when switching forms
  loginCredentials.value = { username: '', password: '' };
  registerCredentials.value = { username: '', password: '', role: 'USER' };
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
}
.login-container div {
  margin-bottom: 15px;
}
.login-container label {
  display: block;
  margin-bottom: 5px;
}
.login-container input {
  width: calc(100% - 20px);
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.login-container button {
  padding: 10px 15px;
  background-color: var(--button-primary, #7aa8da);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 10px;
}
.login-container button:hover {
  background-color: var(--button-primary-hover, #6396d9);
}
.login-container button:disabled {
  background-color: #ccc;
}
.error-message {
  color: var(--error-color, #e74c3c);
  margin-top: 10px;
}
</style>