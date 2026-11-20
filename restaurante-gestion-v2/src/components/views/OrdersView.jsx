import React, { useState, useEffect, useCallback } from 'react';
import { Bs } from '../../data/seedData';
import { ShoppingBag, Utensils, History, Plus, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';

const API_BASE = 'http://127.0.0.1:5000';

// ── Utilidades de API ────────────────────────────────────────────────────
async function apiCall(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  let json = {};
  try {
    json = await res.json();
  } catch (e) {
    json = {};
  }
  if (!res.ok || json.error) {
    throw new Error(json.error || `Error ${res.status}`);
  }
  return json.datos;
}

function describeError(e) {
  return e instanceof TypeError
    ? 'No se pudo conectar con el servidor backend (http://127.0.0.1:5000)'
    : e.message;
}

const userIdOf = (p) => Number(p.idUsuario ?? p.id_usuario);
const dishIdOf = (p) => Number(p.idPlato ?? p.id_plato);

// Carga pedidos, usuarios y platos desde la API
function useApiData() {
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const [ped, usr, pla] = await Promise.all([
        apiCall('/pedidos'),
        apiCall('/usuarios'),
        apiCall('/platos')
      ]);
      setPedidos(Array.isArray(ped) ? ped : []);
      setUsuarios(Array.isArray(usr) ? usr : []);
      setPlatos(Array.isArray(pla) ? pla : []);
      setError(null);
    } catch (e) {
      setError(describeError(e));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { pedidos, usuarios, platos, error, reload };
}

// Une cada pedido con su usuario y su plato, y calcula el total (cantidad × precio)
function buildRows(pedidos, usuarios, platos) {
  return pedidos.map((p) => {
    const idUsuario = userIdOf(p);
    const idPlato = dishIdOf(p);
    const usuario = usuarios.find((u) => Number(u.id) === idUsuario);
    const plato = platos.find((x) => Number(x.id) === idPlato);
    const cantidad = Number(p.cantidad) || 0;
    const precio = plato ? Number(plato.precio) || 0 : 0;
    return {
      id: p.id,
      idUsuario,
      idPlato,
      cantidad,
      usuario,
      plato,
      precio,
      total: cantidad * precio
    };
  });
}

function Banner({ type, children }) {
  const isError = type === 'error';
  return (
    <div
      className="content-box"
      style={{
        borderLeft: `4px solid ${isError ? '#e5484d' : '#30a46c'}`,
        marginBottom: '12px'
      }}
    >
      {children}
    </div>
  );
}

// ── Pestaña: Gestión de Pedidos (API) — CRUD completo ───────────────────
function PedidosApiTab() {
  const { pedidos, usuarios, platos, error, reload } = useApiData();
  const [notice, setNotice] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ idUsuario: '', idPlato: '', cantidad: 1 });

  const rows = buildRows(pedidos, usuarios, platos);
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  const selectedPlato = platos.find((x) => String(x.id) === String(form.idPlato));
  const formTotal =
    (parseInt(form.cantidad, 10) || 0) * (selectedPlato ? Number(selectedPlato.precio) || 0 : 0);

  const openNew = () => {
    setEditingId(null);
    setFormError(null);
    setForm({
      idUsuario: usuarios[0] ? String(usuarios[0].id) : '',
      idPlato: platos[0] ? String(platos[0].id) : '',
      cantidad: 1
    });
    setIsOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setFormError(null);
    setForm({
      idUsuario: String(row.idUsuario),
      idPlato: String(row.idPlato),
      cantidad: row.cantidad
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = JSON.stringify({
      idUsuario: Number(form.idUsuario),
      idPlato: Number(form.idPlato),
      cantidad: parseInt(form.cantidad, 10) || 1
    });
    const headers = { 'Content-Type': 'application/json' };

    try {
      if (editingId === null) {
        await apiCall('/pedidos', { method: 'POST', headers, body });
        setNotice({ type: 'ok', text: 'Pedido registrado en la base de datos' });
      } else {
        await apiCall(`/pedidos/${editingId}`, { method: 'PUT', headers, body });
        setNotice({ type: 'ok', text: 'Pedido actualizado en la base de datos' });
      }
      setIsOpen(false);
      reload();
    } catch (err) {
      setFormError(describeError(err));
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar el pedido #${row.id}?`)) return;
    try {
      await apiCall(`/pedidos/${row.id}`, { method: 'DELETE' });
      setNotice({ type: 'ok', text: `Pedido #${row.id} eliminado` });
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: describeError(err) });
    }
  };

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2>Gestión de Pedidos (API)</h2>
          <span className="text-mut" style={{ fontSize: '13px' }}>
            Pedidos guardados en la base de datos SQLite
          </span>
        </div>
        <button
          type="button"
          className="btn-pri"
          onClick={openNew}
          disabled={Boolean(error) || usuarios.length === 0 || platos.length === 0}
        >
          <Plus size={16} />
          <span>Nuevo pedido</span>
        </button>
      </div>

      {error && <Banner type="error">{error}</Banner>}
      {notice && <Banner type={notice.type}>{notice.text}</Banner>}

      <div className="content-box">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Plato</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <b>{r.usuario ? r.usuario.nombre : `Usuario ${r.idUsuario}`}</b>
                      {r.usuario && (
                        <div className="text-mut" style={{ fontSize: '12px' }}>
                          {r.usuario.rol}
                        </div>
                      )}
                    </td>
                    <td>{r.plato ? r.plato.nombre : `Plato ${r.idPlato}`}</td>
                    <td>{Bs(r.precio)}</td>
                    <td>{r.cantidad}</td>
                    <td className="text-in">{Bs(r.total)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => openEdit(r)}
                          title="Editar pedido"
                        >
                          <Pencil size={13} style={{ marginRight: '4px' }} />
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-sm btn-del"
                          onClick={() => handleDelete(r)}
                          title="Eliminar pedido"
                        >
                          <Trash2 size={13} style={{ marginRight: '4px' }} />
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    {error ? 'No hay conexión con el backend.' : 'Aún no hay pedidos en la base de datos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <span className="text-mut">Total de todos los pedidos: </span>
            <b className="text-in">{Bs(grandTotal)}</b>
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        title={editingId === null ? 'Nuevo pedido' : `Editar pedido #${editingId}`}
        onClose={() => setIsOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Usuario
            <select
              className="form-input"
              required
              value={form.idUsuario}
              onChange={(e) => setForm({ ...form, idUsuario: e.target.value })}
            >
              <option value="">— Seleccionar usuario —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} ({u.rol})
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Plato
            <select
              className="form-input"
              required
              value={form.idPlato}
              onChange={(e) => setForm({ ...form, idPlato: e.target.value })}
            >
              <option value="">— Seleccionar plato —</option>
              {platos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {Bs(Number(p.precio) || 0)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Cantidad
            <input
              className="form-input"
              type="number"
              min="1"
              step="1"
              required
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </label>

          <div style={{ margin: '12px 0' }}>
            <span className="text-mut">Total: </span>
            <b className="text-in" style={{ fontSize: '20px' }}>{Bs(formTotal)}</b>
          </div>

          {formError && (
            <p style={{ color: '#e5484d', fontSize: '13px', marginBottom: '8px' }}>{formError}</p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-pri">
              {editingId === null ? 'Guardar pedido' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Pestaña: Pedidos por usuario (consulta) ──────────────────────────────
function PedidosPorUsuarioTab() {
  const { pedidos, usuarios, platos, error } = useApiData();
  const [selected, setSelected] = useState('todos');

  const rows = buildRows(pedidos, usuarios, platos);

  const resumen = usuarios.map((u) => {
    const propios = rows.filter((r) => r.idUsuario === Number(u.id));
    return {
      usuario: u,
      pedidos: propios.length,
      unidades: propios.reduce((s, r) => s + r.cantidad, 0),
      total: propios.reduce((s, r) => s + r.total, 0)
    };
  });

  const detalle =
    selected === 'todos' ? rows : rows.filter((r) => String(r.idUsuario) === selected);
  const totalDetalle = detalle.reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <div className="action-bar">
        <div>
          <h2>Pedidos por usuario</h2>
          <span className="text-mut" style={{ fontSize: '13px' }}>
            Ventas agrupadas por el usuario que atendió
          </span>
        </div>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      <div className="content-box">
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Resumen por usuario</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Pedidos</th>
                <th>Unidades</th>
                <th>Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {resumen.length > 0 ? (
                resumen.map((r) => (
                  <tr key={r.usuario.id}>
                    <td><b>{r.usuario.nombre}</b></td>
                    <td>{r.usuario.rol}</td>
                    <td>{r.pedidos}</td>
                    <td>{r.unidades}</td>
                    <td className="text-in">{Bs(r.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    Sin datos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '18px' }}>Detalle</h3>
          <select
            className="form-input"
            style={{ maxWidth: '260px' }}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            aria-label="Filtrar por usuario"
          >
            <option value="todos">Todos los usuarios</option>
            {usuarios.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Plato</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {detalle.length > 0 ? (
                detalle.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.usuario ? r.usuario.nombre : `Usuario ${r.idUsuario}`}</td>
                    <td>{r.plato ? r.plato.nombre : `Plato ${r.idPlato}`}</td>
                    <td>{r.cantidad}</td>
                    <td className="text-in">{Bs(r.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    Este usuario no tiene pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {detalle.length > 0 && (
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <span className="text-mut">Total: </span>
            <b className="text-in">{Bs(totalDetalle)}</b>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pestaña: Comanda y Salón (POS) — igual que antes ─────────────────────
function PosPanel({ data, onRecordOrder }) {
  const [cart, setCart] = useState({});
  const [mesa, setMesa] = useState('');

  const updateCart = (dishId, delta) => {
    setCart((prev) => {
      const current = prev[dishId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [dishId]: next };
    });
  };

  const totalAmount = data.plat.reduce(
    (sum, p) => sum + (cart[p.id] || 0) * p.p,
    0
  );

  const handleOrderSubmit = () => {
    const success = onRecordOrder(cart, mesa);
    if (success) {
      setCart({});
      setMesa('');
    }
  };

  return (
    <div>
      <div className="action-bar">
        <h2>Punto de Venta · Comanda y Salón</h2>
      </div>

      <div className="content-box">
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Seleccionar Platos</h3>
        <div>
          {data.plat.map((p) => {
            const count = cart[p.id] || 0;
            return (
              <div key={p.id} className="dish-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={15} color="var(--pri)" />
                    <b>{p.n}</b>
                  </div>
                  <div className="text-in" style={{ fontSize: '14px', marginTop: '2px' }}>
                    {Bs(p.p)}
                  </div>
                </div>

                <div className="step-control">
                  <button
                    type="button"
                    onClick={() => updateCart(p.id, -1)}
                    disabled={count === 0}
                    aria-label={`Quitar unidad de ${p.n}`}
                  >
                    −
                  </button>
                  <b>{count}</b>
                  <button
                    type="button"
                    onClick={() => updateCart(p.id, 1)}
                    aria-label={`Agregar unidad de ${p.n}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <label className="form-label" style={{ marginBottom: '16px' }}>
            Mesa o Nombre del Cliente
            <input
              className="form-input"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              placeholder="Ej: Mesa 4, Barra o Para llevar"
            />
          </label>

          <div className="action-bar" style={{ margin: 0 }}>
            <div>
              <span className="text-mut" style={{ fontSize: '14px' }}>Total a pagar:</span>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)' }}>
                {Bs(totalAmount)}
              </div>
            </div>

            <button
              type="button"
              className="btn-pri"
              onClick={handleOrderSubmit}
              disabled={totalAmount === 0}
            >
              <ShoppingBag size={18} />
              <span>Registrar pedido</span>
            </button>
          </div>
        </div>
      </div>

      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <History size={18} color="var(--pri)" />
          <h3 style={{ fontSize: '18px' }}>Historial de ventas</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Mesa / Cliente</th>
                <th>Detalle del Pedido</th>
                <th>Total Facturado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.ped.length > 0 ? (
                data.ped.map((p) => (
                  <tr key={p.n}>
                    <td>#{p.n}</td>
                    <td><b>{p.mesa}</b></td>
                    <td style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.d}
                    </td>
                    <td className="text-in">{Bs(p.tot)}</td>
                    <td>{p.f}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    Aún no se han registrado pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Vista principal con pestañas ─────────────────────────────────────────
export function OrdersView({ data, onRecordOrder }) {
  const [tab, setTab] = useState('pos');

  const tabs = [
    { key: 'pos', label: 'Comanda y Salón (POS)' },
    { key: 'api', label: 'Gestión de Pedidos (API)' },
    { key: 'usr', label: 'Pedidos por usuario' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={tab === t.key ? 'btn-pri' : 'btn-ghost'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pos' && <PosPanel data={data} onRecordOrder={onRecordOrder} />}
      {tab === 'api' && <PedidosApiTab />}
      {tab === 'usr' && <PedidosPorUsuarioTab />}
    </div>
  );
}