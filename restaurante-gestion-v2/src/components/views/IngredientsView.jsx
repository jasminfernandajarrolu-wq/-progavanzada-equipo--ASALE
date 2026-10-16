import React, { useState } from 'react';
import { Bs } from '../../data/seedData';
import { Plus, History, ArrowRightLeft, Trash2, Eye } from 'lucide-react';
import { Modal } from '../Modal';

export function IngredientsView({
  data,
  onAddIngredient,
  onRecordMovement,
  onDeleteItem,
  readOnly = false
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [movementTarget, setMovementTarget] = useState(null);

  // Form states
  const [newIng, setNewIng] = useState({ n: '', u: 'kg', s: '', m: '', c: '' });
  const [movData, setMovData] = useState({ t: 'Entrada', q: '', nota: '' });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!newIng.n) return;
    onAddIngredient(newIng);
    setNewIng({ n: '', u: 'kg', s: '', m: '', c: '' });
    setIsAddOpen(false);
  };

  const handleMovSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!movementTarget || !movData.q) return;
    onRecordMovement(movementTarget.id, movData.t, Number(movData.q), movData.nota);
    setMovData({ t: 'Entrada', q: '', nota: '' });
    setMovementTarget(null);
  };

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2>Ingredientes e Inventario</h2>
          <span className="text-mut" style={{ fontSize: '13px' }}>
            Control de insumos y materias primas del restaurante
          </span>
        </div>

        {readOnly ? (
          <span className="badge-readonly" title="Solo tienes permiso de lectura en este módulo">
            <Eye size={14} />
            <span>Modo solo lectura</span>
          </span>
        ) : (
          <button type="button" className="btn-pri" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} />
            <span>Nuevo ingrediente</span>
          </button>
        )}
      </div>

      <div className="content-box">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Costo / u</th>
                <th>Estado</th>
                {!readOnly && <th style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {data.ing.map((x) => {
                const isLow = x.s <= x.m;
                return (
                  <tr key={x.id}>
                    <td><b>{x.n}</b></td>
                    <td className={isLow ? 'text-out' : ''}>
                      {Number(x.s.toFixed(2))} {x.u}
                    </td>
                    <td>{x.m} {x.u}</td>
                    <td>{Bs(x.c)}</td>
                    <td>
                      <span className={`tag ${isLow ? 'low' : 'ok'}`}>
                        {isLow ? 'Reponer' : 'Normal'}
                      </span>
                    </td>
                    {!readOnly && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          style={{ marginRight: '6px' }}
                          onClick={() => setMovementTarget(x)}
                          title="Registrar movimiento"
                        >
                          <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
                          Movimiento
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm btn-del"
                          onClick={() => {
                            if (window.confirm(`¿Borrar el ingrediente "${x.n}"?`)) {
                              onDeleteItem('ing', x.id);
                            }
                          }}
                          title="Eliminar ingrediente"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <History size={18} color="var(--pri)" />
          <h3 style={{ fontSize: '18px' }}>Historial de movimientos</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ingrediente</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {data.mov.length > 0 ? (
                data.mov.slice(0, 15).map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.f}</td>
                    <td><b>{m.i}</b></td>
                    <td>
                      <span className={`tag ${m.t === 'Entrada' ? 'ok' : m.t === 'Salida' ? 'low' : ''}`}>
                        {m.t}
                      </span>
                    </td>
                    <td>{m.q > 0 ? `+${m.q}` : m.q}</td>
                    <td className="text-mut">{m.nota || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals solo disponibles para Administrador (no readOnly) */}
      {!readOnly && (
        <>
          {/* Modal: Nuevo Ingrediente */}
          <Modal isOpen={isAddOpen} title="Nuevo Ingrediente" onClose={() => setIsAddOpen(false)}>
            <form onSubmit={handleAddSubmit}>
              <label className="form-label">
                Nombre del ingrediente
                <input
                  className="form-input"
                  required
                  value={newIng.n}
                  onChange={(e) => setNewIng({ ...newIng, n: e.target.value })}
                  placeholder="Ej: Carne de res"
                />
              </label>

              <label className="form-label">
                Unidad de medida
                <select
                  className="form-input"
                  value={newIng.u}
                  onChange={(e) => setNewIng({ ...newIng, u: e.target.value })}
                >
                  <option value="kg">kg (Kilogramos)</option>
                  <option value="l">l (Litros)</option>
                  <option value="unid">unid (Unidades)</option>
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label className="form-label">
                  Stock inicial
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={newIng.s}
                    onChange={(e) => setNewIng({ ...newIng, s: e.target.value })}
                  />
                </label>
                <label className="form-label">
                  Stock mínimo
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={newIng.m}
                    onChange={(e) => setNewIng({ ...newIng, m: e.target.value })}
                  />
                </label>
              </div>

              <label className="form-label">
                Costo por unidad (Bs)
                <input
                  className="form-input"
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={newIng.c}
                  onChange={(e) => setNewIng({ ...newIng, c: e.target.value })}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsAddOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-pri">
                  Guardar ingrediente
                </button>
              </div>
            </form>
          </Modal>

          {/* Modal: Registrar Movimiento */}
          <Modal
            isOpen={!!movementTarget}
            title={movementTarget ? `Movimiento: ${movementTarget.n}` : 'Movimiento'}
            onClose={() => setMovementTarget(null)}
          >
            <form onSubmit={handleMovSubmit}>
              <div style={{ marginBottom: '14px', fontSize: '14px', color: 'var(--mut)' }}>
                Stock actual: <b>{movementTarget ? `${movementTarget.s} ${movementTarget.u}` : ''}</b>
              </div>

              <label className="form-label">
                Tipo de movimiento
                <select
                  className="form-input"
                  value={movData.t}
                  onChange={(e) => setMovData({ ...movData, t: e.target.value })}
                >
                  <option value="Entrada">Entrada (Compra / Ingreso)</option>
                  <option value="Salida">Salida (Merma / Consumo)</option>
                  <option value="Ajuste">Ajuste de inventario físico</option>
                </select>
              </label>

              <label className="form-label">
                Cantidad ({movementTarget?.u || 'u'})
                <input
                  className="form-input"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={movData.q}
                  onChange={(e) => setMovData({ ...movData, q: e.target.value })}
                  placeholder="0.00"
                />
              </label>

              <label className="form-label">
                Nota o motivo
                <input
                  className="form-input"
                  value={movData.nota}
                  onChange={(e) => setMovData({ ...movData, nota: e.target.value })}
                  placeholder="Ej: Ajuste semanal, merma de cocina..."
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setMovementTarget(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-pri">
                  Registrar movimiento
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
