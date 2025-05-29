<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="credentials.email" 
            required
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            v-model="credentials.password" 
            required
            class="form-control"
          >
        </div>

        <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:5000/api/login', this.credentials);
        
        // Guardar token y datos del usuario
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Notificar cambio en el estado de autenticación
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: response.data.user
        }));
        
        // Redirigir según el rol
        if (response.data.user.is_admin) {
          this.$router.push('/admin/games');
        } else {
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión. Verifica tus credenciales.');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0056b3;
}
</style>
