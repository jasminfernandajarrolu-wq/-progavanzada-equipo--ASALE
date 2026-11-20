import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, AlertTriangle } from 'lucide-react';
import { Modal } from '../Modal';

export function CategoriesView({
  categorias = [],
  categoriasError = null,
  onAddCategoria,
  onUpdateCategoria,
  onDeleteCategoria,
  readOnly = false
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nombre, setNombre] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setNombre('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setNombre(cat.nombre);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingCategory) {
      await onUpdateCategoria(editingCategory.id, nombre);
    } else {
      await onAddCategoria(nombre);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setNombre('');
  };

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2>Categorías de Platos</h2>
          <span className="text-mut" style={{ fontSize: '13px' }}>
            Clasificación de la carta gastronómica de Sabores Bolivianos
          </span>
        </div>

        {!readOnly && (
          <button type="button" className="btn-pri" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nueva categoría</span>
          </button>
        )}
      </div>

      {categoriasError && (
        <div
          className="content-box"
          style={{
            borderLeft: '4px solid #E05A47',
            background: 'rgba(224, 90, 71, 0.08)',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <AlertTriangle size={20} color="#E05A47" />
          <div>
            <div style={{ fontWeight: '700', color: '#E05A47', fontSize: '14px' }}>
              Servidor backend desconectado
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
              {categoriasError}. Inicia el servidor con <code>python -m backend.app</code> en tu terminal.
            </div>
          </div>
        </div>
      )}

      <div className="content-box">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Nombre de la Categoría</th>
                {!readOnly && <th style={{ textAlign: 'right', width: '160px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {categorias.length > 0 ? (
                categorias.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <span className="text-mut">#{cat.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={14} color="var(--pri)" />
                        <b>{cat.nombre}</b>
                      </div>
                    </td>
                    {!readOnly && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          style={{ marginRight: '6px' }}
                          onClick={() => handleOpenEdit(cat)}
                          title="Editar categoría"
                        >
                          <Pencil size={13} style={{ marginRight: '4px' }} />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm btn-del"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
                              onDeleteCategoria(cat.id);
                            }
                          }}
                          title="Eliminar categoría"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={readOnly ? 2 : 3} className="text-mut" style={{ textAlign: 'center', padding: '24px' }}>
                    {categoriasError ? 'No hay categorías disponibles sin conexión.' : 'No hay categorías registradas.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear / Editar Categoría */}
      {!readOnly && (
        <Modal
          isOpen={isModalOpen}
          title={editingCategory ? `Editar Categoría #${editingCategory.id}` : 'Nueva Categoría'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <label className="form-label">
              Nombre de la categoría
              <input
                className="form-input"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Platos Fuertes, Postres, Bebidas..."
                autoFocus
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-pri">
                {editingCategory ? 'Actualizar categoría' : 'Crear categoría'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
