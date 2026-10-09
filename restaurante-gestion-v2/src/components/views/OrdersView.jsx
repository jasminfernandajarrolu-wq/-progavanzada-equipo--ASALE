import React, { useState } from 'react';
import { Bs } from '../../data/seedData';
import { ShoppingBag, Utensils, History } from 'lucide-react';

export function OrdersView({ data, onRecordOrder }) {
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
