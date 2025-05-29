import React, { useState, useEffect } from 'react';
import axios from 'axios';

const categorias = [
  { value: 'rompecabezas', label: 'Rompecabezas' },
  { value: 'accion', label: 'Acción' },
  { value: 'deportes', label: 'Deportes' },
];

const GameAdminForm = ({ onGameAdded, editMode = false, initialData = {}, onCancel, onGameUpdated }) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    size_kb: '',
    price: '',
    available_licenses: '',
    image_url: '',
    min_stock: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editMode && initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || '',
        size_kb: initialData.size_kb || '',
        price: initialData.price || '',
        available_licenses: initialData.available_licenses || '',
        image_url: initialData.image_url || '',
        min_stock: initialData.min_stock || ''
      });
    }
  }, [editMode, initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.category || !form.size_kb || !form.price || !form.available_licenses) {
      setError('Todos los campos obligatorios deben estar completos.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (editMode) {
        await axios.put(`/api/games/${initialData.id}`, {
          category: form.category,
          size_kb: parseInt(form.size_kb),
          price: parseFloat(form.price),
          available_licenses: parseInt(form.available_licenses),
          image_url: form.image_url,
          min_stock: form.min_stock ? parseInt(form.min_stock) : undefined
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Juego actualizado exitosamente');
        if (onGameUpdated) onGameUpdated();
      } else {
        await axios.post('/api/games', {
          name: form.name,
          category: form.category,
          size_kb: parseInt(form.size_kb),
          price: parseFloat(form.price),
          available_licenses: parseInt(form.available_licenses),
          image_url: form.image_url,
          min_stock: form.min_stock ? parseInt(form.min_stock) : undefined
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Juego agregado exitosamente');
        setForm({ name: '', category: '', size_kb: '', price: '', available_licenses: '', image_url: '', min_stock: '' });
        if (onGameAdded) onGameAdded();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el juego');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-2">{editMode ? 'Editar juego' : 'Agregar nuevo juego'}</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 mb-2 rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Nombre *</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" required disabled={editMode} />
        </div>
        <div>
          <label className="block mb-1">Categoría *</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded p-2" required>
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1">Tamaño (KB) *</label>
          <input name="size_kb" type="number" min="1" value={form.size_kb} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block mb-1">Precio *</label>
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block mb-1">Licencias disponibles *</label>
          <input name="available_licenses" type="number" min="1" value={form.available_licenses} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block mb-1">URL de imagen</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Stock mínimo</label>
          <input name="min_stock" type="number" min="0" value={form.min_stock} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">{editMode ? 'Guardar cambios' : 'Agregar juego'}</button>
          {editMode && (
            <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 w-full">Cancelar</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GameAdminForm; 