<template>
  <div class="transactions-container">
    <h2>Mis Compras</h2>
    
    <div v-if="transactions.length === 0" class="empty-transactions">
      <p>No tienes compras realizadas</p>
      <router-link to="/" class="btn btn-primary">Ver Juegos</router-link>
    </div>
    
    <div v-else class="transactions-list">
      <div v-for="transaction in transactions" :key="transaction.id" class="transaction-card">
        <div class="transaction-header">
          <h3>Compra #{{ transaction.id }}</h3>
          <p>Fecha: {{ new Date(transaction.date).toLocaleString() }}</p>
        </div>
        
        <div class="transaction-items">
          <div v-for="item in transaction.items" :key="item.game_name" class="transaction-item">
            <span class="game-name">{{ item.game_name }}</span>
            <span class="quantity">x{{ item.quantity }}</span>
            <span class="price">${{ item.unit_price.toFixed(2) }}</span>
            <span class="subtotal">${{ item.subtotal.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="transaction-footer">
          <div v-if="transaction.discount_percentage > 0" class="discount">
            Descuento aplicado: {{ transaction.discount_percentage }}%
          </div>
          <div class="total">
            Total: ${{ transaction.total_amount.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Transactions',
  data() {
    return {
      transactions: []
    };
  },
  created() {
    this.fetchTransactions();
  },
  methods: {
    async fetchTransactions() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.transactions = response.data;
      } catch (error) {
        console.error('Error al obtener transacciones:', error);
      }
    }
  }
};
</script>

<style scoped>
.transactions-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.empty-transactions {
  text-align: center;
  padding: 40px;
}

.transaction-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.transaction-items {
  margin: 15px 0;
}

.transaction-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 8px 0;
}

.game-name {
  font-weight: 500;
}

.quantity, .price, .subtotal {
  text-align: right;
}

.transaction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.discount {
  color: #28a745;
}

.total {
  font-size: 1.2em;
  font-weight: bold;
}

.btn-primary {
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 4px;
  display: inline-block;
}
</style>
