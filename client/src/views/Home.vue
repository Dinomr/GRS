<template>
  <div class="home">
    <h1>Bienvenido a Game Retail Store</h1>
    <div class="filters">
      <div class="sort-controls">
        <label>Ordenar por:</label>
        <select v-model="sortBy" @change="updateSort">
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
        </select>
        <select v-model="sortOrder" @change="updateSort">
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>
    </div>
    <div class="game-grid" v-if="games.length > 0">
      <div v-for="game in games" :key="game.id" class="game-card">
        <img :src="game.image_url || '/placeholder-game.jpg'" :alt="game.name" class="game-image">
        <div class="game-info">
          <h3>{{ game.name }}</h3>
          <p class="category">{{ game.category }}</p>
          <p class="price">${{ game.price.toFixed(2) }}</p>
          <p class="stock">{{ game.available_licenses }} licencias disponibles</p>
          <button 
            class="btn btn-primary"
            @click="addToCart(game)"
            :disabled="game.available_licenses === 0"
          >
            {{ game.available_licenses > 0 ? 'Agregar al Carrito' : 'Sin Stock' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="no-games">
      No hay juegos disponibles en este momento
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      games: [],
      sortBy: 'name',
      sortOrder: 'asc'
    };
  },
  methods: {
    async fetchGames() {
      try {
        const response = await axios.get(`/games?sort_by=${this.sortBy}&sort_order=${this.sortOrder}`);
        this.games = response.data;
      } catch (error) {
        console.error('Error al obtener juegos:', error);
      }
    },
    addToCart(game) {
      // Esta función se implementará cuando desarrollemos el carrito de compras
      console.log('Agregar al carrito:', game);
    },
    updateSort() {
      this.fetchGames();
    }
  },
  created() {
    this.fetchGames();
  }
};
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.sort-controls label {
  color: #666;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.game-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.game-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.game-info {
  padding: 15px;
}

.game-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.category {
  color: #666;
  font-size: 0.9em;
  margin: 5px 0;
}

.price {
  font-size: 1.2em;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}

.stock {
  font-size: 0.9em;
  color: #28a745;
  margin: 5px 0;
}

.btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.no-games {
  text-align: center;
  color: #666;
  margin-top: 50px;
}
</style>
