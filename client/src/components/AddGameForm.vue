<template>
  <div class="add-game-form">
    <h2>Agregar Nuevo Juego</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Nombre:</label>
        <input 
          type="text" 
          id="name" 
          v-model="gameData.name" 
          required
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="category">Categoría:</label>
        <select 
          id="category" 
          v-model="gameData.category" 
          required
          class="form-control"
        >
          <option value="">Seleccionar categoría</option>
          <option value="Acción">Acción</option>
          <option value="Aventura">Aventura</option>
          <option value="RPG">RPG</option>
          <option value="Estrategia">Estrategia</option>
          <option value="Deportes">Deportes</option>
          <option value="Simulación">Simulación</option>
        </select>
      </div>

      <div class="form-group">
        <label for="size_kb">Tamaño (KB):</label>
        <input 
          type="number" 
          id="size_kb" 
          v-model="gameData.size_kb" 
          required
          min="1"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="price">Precio:</label>
        <input 
          type="number" 
          id="price" 
          v-model="gameData.price" 
          required
          min="0"
          step="0.01"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="available_licenses">Licencias Disponibles:</label>
        <input 
          type="number" 
          id="available_licenses" 
          v-model="gameData.available_licenses" 
          required
          min="0"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="image_url">URL de la Imagen:</label>
        <input 
          type="url" 
          id="image_url" 
          v-model="gameData.image_url"
          class="form-control"
        >
      </div>

      <div class="form-group">
        <label for="min_stock">Stock Mínimo:</label>
        <input 
          type="number" 
          id="min_stock" 
          v-model="gameData.min_stock"
          min="1"
          class="form-control"
        >
      </div>

      <button type="submit" class="btn btn-primary">Agregar Juego</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddGameForm',
  data() {
    return {
      gameData: {
        name: '',
        category: '',
        size_kb: '',
        price: '',
        available_licenses: '',
        image_url: '',
        min_stock: 10
      }
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/games', this.gameData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 201) {
          this.$emit('game-added', response.data);
          this.resetForm();
          alert('Juego agregado exitosamente');
        }
      } catch (error) {
        console.error('Error al agregar el juego:', error);
        alert(error.response?.data?.error || 'Error al agregar el juego');
      }
    },
    resetForm() {
      this.gameData = {
        name: '',
        category: '',
        size_kb: '',
        price: '',
        available_licenses: '',
        image_url: '',
        min_stock: 10
      };
    }
  }
};
</script>

<style scoped>
.add-game-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
