import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No autenticado o token no encontrado.');
        return;
    }

    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', err.response?.data?.msg || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToAdmin = async (userId) => {
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
        setError('No autenticado o token no encontrado.');
        return;
    }
    try {
      await axios.put(`/api/users/${userId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Usuario promovido a administrador');
      fetchUsers();
    } catch (err) {
      setError('No se pudo promover el usuario');
      console.error('Error promoting user:', err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 mb-2 rounded">{success}</div>}
      <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nombre</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Rol</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.is_admin ? 'Administrador' : 'Usuario'}</td>
              <td className="py-2 px-4 border-b">
                {!user.is_admin && (
                  <button
                    onClick={() => promoteToAdmin(user.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Promover a admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel; 