import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (error) {
            setError('Error al cargar el historial de transacciones');
            console.error('Error fetching transactions:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const downloadReceipt = (transaction) => {
        // Aquí se implementaría la lógica para descargar el comprobante
        console.log('Descargando comprobante para transacción:', transaction.id);
    };

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Historial de Compras</h1>

            {transactions.length === 0 ? (
                <p>No hay transacciones para mostrar</p>
            ) : (
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="border rounded p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">
                                        Transacción #{transaction.id}
                                    </h3>
                                    <p className="text-gray-600">
                                        {formatDate(transaction.date)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold">
                                        Total: ${transaction.total_amount.toFixed(2)}
                                    </p>
                                    {transaction.discount_percentage > 0 && (
                                        <p className="text-green-600">
                                            Descuento aplicado: {transaction.discount_percentage}%
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Detalles:</h4>
                                <div className="space-y-2">
                                    {transaction.items.map((item, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span>
                                                {item.game_name} x {item.quantity}
                                            </span>
                                            <span>${item.subtotal.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => downloadReceipt(transaction)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Descargar comprobante
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => navigate('/games')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Volver a la tienda
            </button>
        </div>
    );
};

export default TransactionHistory; 