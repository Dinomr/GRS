import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameAdminForm from './GameAdminForm';

const GameList = ({ user }) => {
    const [games, setGames] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editGame, setEditGame] = useState(null);
    const navigate = useNavigate();

    console.log('GameList received user prop:', user);

    const fetchGames = useCallback(async () => {
        try {
            const response = await axios.get(`/api/games`, {
                params: {
                    search,
                    category,
                    sort_by: sortBy,
                    sort_order: sortOrder
                }
            });
            setGames(response.data);
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    }, [search, category, sortBy, sortOrder]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const handleGameClick = (gameId) => {
        navigate(`/games/${gameId}`);
    };

    const handleEdit = (game) => {
        setEditGame(game);
    };

    const handleDelete = async (gameId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este juego?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/games/${gameId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGames();
        } catch (err) {
            alert('Error al eliminar el juego');
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* Formulario de administración solo para admin */}
            {user && user.is_admin && !editGame && (
                <GameAdminForm onGameAdded={fetchGames} />
            )}
            {user && user.is_admin && editGame && (
                <GameAdminForm
                    editMode={true}
                    initialData={editGame}
                    onCancel={() => setEditGame(null)}
                    onGameUpdated={() => { setEditGame(null); fetchGames(); }}
                />
            )}
            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Buscar juegos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border rounded"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">Todas las categorías</option>
                    <option value="rompecabezas">Rompecabezas</option>
                    <option value="accion">Acción</option>
                    <option value="deportes">Deportes</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="name">Ordenar por nombre</option>
                    <option value="price">Ordenar por precio</option>
                </select>
                <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border rounded"
                >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className="border rounded p-4 cursor-pointer hover:shadow-lg relative"
                        onClick={() => handleGameClick(game.id)}
                    >
                        {game.image_url && (
                            <img
                                src={game.image_url}
                                alt={game.name}
                                className="w-full h-48 object-cover mb-4"
                            />
                        )}
                        <h3 className="text-xl font-bold">{game.name}</h3>
                        <p className="text-gray-600">Categoría: {game.category}</p>
                        <p className="text-gray-600">Precio: ${game.price}</p>
                        <p className="text-gray-600">
                            Licencias disponibles: {game.available_licenses}
                        </p>
                        {user && user.is_admin && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={e => { e.stopPropagation(); handleEdit(game); }}
                                    className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); handleDelete(game.id); }}
                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameList; 