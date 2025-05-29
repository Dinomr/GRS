import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totals, setTotals] = useState({
        subtotal: 0,
        discount_percentage: 0,
        discount_amount: 0,
        total: 0
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Cargar carrito desde localStorage al montar
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(stored);
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const calculateTotals = useCallback(async () => {
        try {
            if (cartItems.length === 0) {
                setTotals({ subtotal: 0, discount_percentage: 0, discount_amount: 0, total: 0 });
                return;
            }
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/cart/calculate', {
                items: cartItems.map(item => ({
                    game_id: item.id,
                    quantity: item.quantity
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTotals(response.data);
        } catch (error) {
            setError('Error al calcular totales');
            console.error('Error calculating totals:', error);
        }
    }, [cartItems]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    const updateQuantity = (gameId, newQuantity) => {
        setCartItems(items =>
            items.map(item =>
                item.id === gameId
                    ? { ...item, quantity: Math.max(1, newQuantity) }
                    : item
            )
        );
    };

    const removeItem = (gameId) => {
        setCartItems(items => items.filter(item => item.id !== gameId));
    };

    const handleCheckout = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/cart/checkout', {
                items: cartItems.map(item => ({
                    game_id: item.id,
                    quantity: item.quantity
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Limpiar carrito
            setCartItems([]);
            localStorage.removeItem('cart');
            // Mostrar mensaje de éxito y redirigir
            alert(`Compra exitosa! Número de transacción: ${response.data.transaction_id}`);
            navigate('/transactions');
        } catch (error) {
            setError(error.response?.data?.error || 'Error al procesar la compra');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
                <p>Tu carrito está vacío</p>
                <button
                    onClick={() => navigate('/games')}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Ver juegos
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    {cartItems.map(item => (
                        <div key={item.id} className="border rounded p-4 mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <p className="text-gray-600">Categoría: {item.category}</p>
                                    <p className="text-gray-600">Precio unitario: ${item.price}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="text-gray-600">Cantidad:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="border rounded p-2 w-20 ml-2"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                            <p className="text-right mt-2">
                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <div className="border rounded p-4">
                        <h2 className="text-xl font-bold mb-4">Resumen de compra</h2>
                        <div className="space-y-2">
                            <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
                            {totals.discount_percentage > 0 && (
                                <>
                                    <p>Descuento ({totals.discount_percentage}%): -${totals.discount_amount.toFixed(2)}</p>
                                </>
                            )}
                            <p className="text-xl font-bold">
                                Total: ${totals.total.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg mt-4 hover:bg-green-600"
                        >
                            Confirmar compra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart; 