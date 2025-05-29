<template>
  <div class="cart-container">
    <h2>Carrito de Compras</h2>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>Tu carrito está vacío</p>
      <router-link to="/" class="btn btn-primary">Ver Juegos</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.game.id" class="cart-item">
          <div class="item-info">
            <img v-if="item.game.image_url" :src="item.game.image_url" :alt="item.game.name" class="item-image">
            <div class="item-details">
              <h3>{{ item.game.name }}</h3>
              <p>Precio: ${{ item.game.price }}</p>
              <div class="quantity-controls">
                <button @click="decreaseQuantity(item)" class="btn btn-sm">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="btn btn-sm">+</button>
              </div>
            </div>
          </div>
          <div class="item-total">
            <p>Total: ${{ (item.game.price * item.quantity).toFixed(2) }}</p>
            <button @click="removeItem(item)" class="btn btn-danger btn-sm">Eliminar</button>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <h3>Resumen de Compra</h3>
        <div class="summary-details">
          <p>Subtotal: ${{ subtotal.toFixed(2) }}</p>
          <p v-if="discountPercentage > 0">Descuento ({{ discountPercentage }}%): ${{ discountAmount.toFixed(2) }}</p>
          <p class="total">Total: ${{ total.toFixed(2) }}</p>
        </div>
        <button @click="checkout" class="btn btn-success btn-lg">Proceder al Pago</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Cart',
  data() {
    return {
      cartItems: [],
      subtotal: 0,
      discountPercentage: 0,
      discountAmount: 0,
      total: 0
    };
  },
  created() {
    this.loadCart();
  },
  methods: {
    loadCart() {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cartItems = cart;
      this.calculateTotals();
    },
    async calculateTotals() {
      if (this.cartItems.length === 0) {
        this.subtotal = 0;
        this.discountPercentage = 0;
        this.discountAmount = 0;
        this.total = 0;
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:5000/api/cart/calculate',
          {
            items: this.cartItems.map(item => ({
              game_id: item.game.id,
              quantity: item.quantity
            }))
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        this.subtotal = response.data.subtotal;
        this.discountPercentage = response.data.discount_percentage;
        this.discountAmount = response.data.discount_amount;
        this.total = response.data.total;
      } catch (error) {
        console.error('Error al calcular totales:', error);
      }
    },
    increaseQuantity(item) {
      if (item.quantity < item.game.available_licenses) {
        item.quantity++;
        this.updateCart();
      }
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateCart();
      }
    },
    removeItem(item) {
      const index = this.cartItems.indexOf(item);
      if (index > -1) {
        this.cartItems.splice(index, 1);
        this.updateCart();
      }
    },
    updateCart() {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.calculateTotals();
    },
    async checkout() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:5000/api/cart/checkout',
          {
            items: this.cartItems.map(item => ({
              game_id: item.game.id,
              quantity: item.quantity
            }))
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Limpiar carrito después de la compra exitosa
        this.cartItems = [];
        localStorage.removeItem('cart');
        this.$router.push('/transactions');
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        alert(error.response?.data?.error || 'Error al procesar el pago');
      }
    }
  }
};
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.cart-items {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.item-info {
  display: flex;
  gap: 15px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
}

.summary-details {
  margin: 20px 0;
}

.total {
  font-size: 1.2em;
  font-weight: bold;
}

.btn {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-sm {
  padding: 5px 10px;
}

.btn-lg {
  padding: 12px 24px;
  width: 100%;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-primary {
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  display: inline-block;
}
</style>
