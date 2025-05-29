import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import GameList from './components/GameList';
import GameDetails from './components/GameDetails';
import Cart from './components/Cart';
import TransactionHistory from './components/TransactionHistory';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" />;
};

const App = () => {
    const [user, setUser] = useState({});
    const location = useLocation();

    // Función para actualizar el estado del usuario, llamada por Auth.js
    const handleLoginSuccess = () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
    };

    useEffect(() => {
        handleLoginSuccess(); // Cargar usuario al montar y al cambiar la ruta
        // Escuchar cambios en localStorage para sincronización entre tabs
        const handleStorage = () => {
            handleLoginSuccess();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [location.pathname]); // Dependencia en location.pathname

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser({});
        window.location.href = '/auth';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="text-xl font-bold text-blue-600">
                                    Game Store
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/games"
                                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                >
                                    Juegos
                                </Link>
                                {user.is_admin && (
                                    <Link
                                        to="/admin"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Admin
                                    </Link>
                                )}
                                {user.id && (
                                    <>
                                        <Link
                                            to="/cart"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                        >
                                            Carrito
                                        </Link>
                                        <Link
                                            to="/transactions"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                        >
                                            Mis Compras
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            {user.id ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700">
                                        Hola, {user.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <Routes>
                    <Route path="/" element={<Navigate to="/games" />} />
                    {/* Pasar la función de callback al componente Auth */}
                    <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
                    <Route
                        path="/games"
                        element={
                            <PrivateRoute>
                                <GameList user={user} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/games/:id"
                        element={
                            <PrivateRoute>
                                <GameDetails user={user} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <PrivateRoute>
                                <Cart user={user} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/transactions"
                        element={
                            <PrivateRoute>
                                <TransactionHistory user={user} />
                            </PrivateRoute>
                        }
                    />
                     {/* Ruta para el panel de administración */}
                     <Route
                         path="/admin"
                         element={
                             <PrivateRoute>
                                 {user.is_admin ? <AdminPanel /> : <Navigate to="/games" />}
                             </PrivateRoute>
                         }
                     />
                </Routes>
            </main>
        </div>
    );
};

export default App;
