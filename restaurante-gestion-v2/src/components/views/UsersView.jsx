import React, { useState } from 'react';
import { Plus, Pencil, Trash2, User, Mail, ShieldCheck, Utensils, WalletCards, AlertTriangle } from 'lucide-react';
import { Modal } from '../Modal';

const ROLES_LIST = [
  { value: 'administrador', label: 'Administrador', icon: ShieldCheck, color: 'var(--pri)' },
  { value: 'mesero', label: 'Mesero', icon: Utensils, color: '#0F6B6F' },
  { value: 'cajero', label: 'Cajero', icon: WalletCards, color: '#D69715' }
];

function RoleBadge({ role }) {
  const r = (role || '').toLowerCase();
  const cfg = ROLES_LIST.find((x) => x.value === r);
  const Icon = cfg ? cfg.icon : User;

  return (
    <span
      className={`tag ${r === 'administrador' ? 'low' : r === 'cajero' ? 'ok' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        textTransform: 'capitalize',
        fontWeight: '600'
      }}
    >
      <Icon size={12} />
      <span>{cfg ? cfg.label : role}</span>
    </span>
  );
}

export function UsersView({
  usuarios = [],
  usuariosError = null,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  readOnly = false
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'mesero'
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ nombre: '', correo: '', rol: 'mesero' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.correo.trim()) return;

    if (editingUser) {
      await onUpdateUsuario(editingUser.id, formData);
    } else {
      await onAddUsuario(formData);
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ nombre: '', correo: '', rol: 'mesero' });
  };

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2>Usuarios y Personal del Restaurante</h2>
          <span className="text-mut" style={{ fontSize: '13px' }}>
            Gestión de cuentas y asignación de roles (administrador, mesero, cajero)
          </span>
        </div>

        {!readOnly && (
          <button type="button" className="btn-pri" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Nuevo usuario</span>
          </button>
        )}
      </div>

      {usuariosError && (
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
              {usuariosError}. Inicia el servidor con <code>python -m backend.app</code> en tu terminal.
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
                <th>Nombre del Usuario</th>
                <th>Correo Electrónico</th>
                <th>Rol Asignado</th>
                {!readOnly && <th style={{ textAlign: 'right', width: '160px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="text-mut">#{u.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} color="var(--pri)" />
                        <b>{u.nombre}</b>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mut)' }}>
                        <Mail size={13} />
                        <span>{u.correo}</span>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={u.rol} />
                    </td>
                    {!readOnly && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          style={{ marginRight: '6px' }}
                          onClick={() => handleOpenEdit(u)}
                          title="Editar usuario"
                        >
                          <Pencil size={13} style={{ marginRight: '4px' }} />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm btn-del"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar al usuario "${u.nombre}" (${u.correo})?`)) {
                              onDeleteUsuario(u.id);
                            }
                          }}
                          title="Eliminar usuario"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={readOnly ? 4 : 5} className="text-mut" style={{ textAlign: 'center', padding: '24px' }}>
                    {usuariosError ? 'No hay usuarios disponibles sin conexión.' : 'No hay usuarios registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear / Editar Usuario */}
      {!readOnly && (
        <Modal
          isOpen={isModalOpen}
          title={editingUser ? `Editar Usuario #${editingUser.id}` : 'Nuevo Usuario'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <label className="form-label">
              Nombre completo
              <input
                className="form-input"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Marcelo Quiroga"
                autoFocus
              />
            </label>

            <label className="form-label">
              Correo electrónico
              <input
                type="email"
                className="form-input"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                placeholder="ej: marcelo@sabores.bo"
              />
            </label>

            <label className="form-label">
              Rol del sistema
              <select
                className="form-input"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-pri">
                {editingUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
