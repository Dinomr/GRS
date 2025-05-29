<template>
  <div class="admin-games">
    <h1>Administración de Juegos</h1>
    <div class="admin-container">
      <AddGameForm @game-added="onGameAdded" />
      
      <div class="games-list" v-if="games.length > 0">
        <h2>Juegos Existentes</h2>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Licencias Disponibles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in games" :key="game.id">
                <td>{{ game.name }}</td>
                <td>{{ game.category }}</td>
                <td>${{ game.price.toFixed(2) }}</td>
                <td>{{ game.available_licenses }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-primary me-2"
                    @click="editGame(game)"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="no-games">
        No hay juegos registrados
      </div>
    </div>
  </div>
</template>

<script>
import AddGameForm from '@/components/AddGameForm.vue';
import axios from 'axios';

export default {
  name: 'AdminGames',
  components: {
    AddGameForm
  },
  data() {
    return {
      games: []
    };
  },
  methods: {
    async fetchGames() {
      try {
        const response = await axios.get('http://localhost:5000/api/games');
        this.games = response.data;
      } catch (error) {
        console.error('Error al obtener juegos:', error);
        alert('Error al cargar los juegos');
      }
    },
    onGameAdded(newGame) {
      this.fetchGames();
    },
    editGame(game) {
      // Implementar edición de juego en una futura actualización
      console.log('Editar juego:', game);
    }
  },
  created() {
    this.fetchGames();
  }
};
</script>

<style scoped>
.admin-games {
  padding: 20px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.games-list {
  margin-top: 40px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.no-games {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.me-2 {
  margin-right: 8px;
}
</style>
