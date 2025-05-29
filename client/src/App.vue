<template>
  <div id="app">
    <nav class="navbar">
      <a href="/" class="nav-brand">Game Retail Store</a>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link v-if="isAdmin" to="/admin/games" class="nav-link">Panel Admin</router-link>
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="nav-link">Iniciar Sesión</router-link>
        </template>
        <template v-else>
          <router-link to="/cart" class="nav-link cart-link">
            Carrito
            <span v-if="cartItemCount" class="cart-count">{{ cartItemCount }}</span>
          </router-link>
          <router-link to="/transactions" class="nav-link">Mis Compras</router-link>
          <span class="nav-link user-name">{{ userName }}</span>
          <a href="#" @click.prevent="logout" class="nav-link">Cerrar Sesión</a>
        </template>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      user: null
    };
  },
  computed: {
    isLoggedIn() {
      return this.user !== null;
    },
    isAdmin() {
      return this.user?.is_admin || false;
    },
    userName() {
      return this.user?.name || '';
    },
    cartItemCount() {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((total, item) => total + item.quantity, 0);
    }
  },
  methods: {
    checkAuth() {
      const userStr = localStorage.getItem('user');
      this.user = userStr ? JSON.parse(userStr) : null;
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.user = null;
      this.$router.push('/login');
    },
    updateAuthState(userData) {
      this.user = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    }
  },
  created() {
    this.checkAuth();
    window.addEventListener('storage', this.checkAuth);
    window.addEventListener('auth-state-changed', (e) => this.updateAuthState(e.detail));
    // Emitir evento para que otros componentes sepan que App está listo
    window.dispatchEvent(new Event('app-mounted'));
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.navbar {
  background-color: #333;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  color: white;
  text-decoration: none;
  font-size: 1.5em;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #555;
}

.router-link-active {
  background-color: #555;
}
</style>
