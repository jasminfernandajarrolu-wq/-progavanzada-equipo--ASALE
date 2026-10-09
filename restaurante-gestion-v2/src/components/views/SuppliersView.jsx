import React, { useState } from 'react';
import { Plus, Trash2, Phone, Truck } from 'lucide-react';
import { Modal } from '../Modal';

export function SuppliersView({ data, onAddSupplier, onDeleteItem }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAddSupplier({ name, phone });
    setName('');
    setPhone('');
    setIsAddOpen(false);
  };

  return (
    <div>
      <div className="action-bar">
        <h2>Directorio de Proveedores</h2>
        <button type="button" className="btn-pri" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          <span>Nuevo proveedor</span>
        </button>
      </div>

      <div className="content-box">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre del Proveedor</th>
                <th>Teléfono de Contacto</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.prov.length > 0 ? (
                data.prov.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={15} color="var(--pri)" />
                        <b>{p.n}</b>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="var(--teal)" />
                        <span>{p.t || '—'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-ghost btn-sm btn-del"
                        onClick={() => {
                          if (window.confirm(`¿Borrar al proveedor "${p.n}"?`)) {
                            onDeleteItem('prov', p.id);
                          }
                        }}
                        title="Eliminar proveedor"
                      >
                        <Trash2 size={13} style={{ marginRight: '4px' }} />
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    No hay proveedores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Proveedor */}
      <Modal isOpen={isAddOpen} title="Registrar Nuevo Proveedor" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Nombre comercial o empresa
            <input
              className="form-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Distribuidora Los Andes"
            />
          </label>

          <label className="form-label">
            Teléfono de contacto
            <input
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 71234567"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-pri">
              Guardar proveedor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
