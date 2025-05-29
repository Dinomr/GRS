import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GameDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const fetchGameDetails = useCallback(async () => {
        try {
            const response = await axios.get(`/api/games/${id}`);
            setGame(response.data);
        } catch (error) {
            setError('Error al cargar los detalles del juego');
            console.error('Error fetching game details:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchGameDetails();
    }, [fetchGameDetails]);

    const handleAddToCart = () => {
        if (quantity > game.available_licenses) {
            setError('No hay suficientes licencias disponibles');
            return;
        }
        // Obtener carrito actual de localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === game.id);
        if (existing) {
            // Sumar cantidad, pero no exceder el stock
            const newQuantity = Math.min(existing.quantity + quantity, game.available_licenses);
            existing.quantity = newQuantity;
        } else {
            cart.push({
                id: game.id,
                name: game.name,
                category: game.category,
                price: game.price,
                quantity: quantity
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        navigate('/cart');
    };

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Volver
                </button>
            </div>
        );
    }

    if (!game) {
        return <div className="container mx-auto p-4">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Volver
            </button>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {game.image_url && (
                    <img
                        src={game.image_url}
                        alt={game.name}
                        className="w-full h-64 object-cover"
                    />
                )}
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">{game.name}</h1>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-gray-600">Categoría</p>
                            <p className="font-semibold">{game.category}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Tamaño</p>
                            <p className="font-semibold">{game.size_kb} KB</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Precio</p>
                            <p className="font-semibold">${game.price}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Licencias disponibles</p>
                            <p className="font-semibold">{game.available_licenses}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Licencias vendidas</p>
                            <p className="font-semibold">{game.sold_licenses}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <label className="text-gray-600">Cantidad:</label>
                        <input
                            type="number"
                            min="1"
                            max={game.available_licenses}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="border rounded p-2 w-20"
                        />
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                    >
                        Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameDetails; 