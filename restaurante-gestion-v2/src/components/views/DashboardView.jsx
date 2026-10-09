import React from 'react';
import { Bs } from '../../data/seedData';
import { TrendingUp, TrendingDown, Scale, AlertTriangle, Clock } from 'lucide-react';

export function DashboardView({ data, lowStockItems, getFinancialSum }) {
  const ingresos = getFinancialSum('Ingreso');
  const egresos = getFinancialSum('Egreso');
  const balance = ingresos - egresos;
  const recentOrders = data.ped.slice(0, 5);

  return (
    <div>
      <section className="hero-banner">
        <div>
          <h2>Bienvenidos a Sabores Bolivianos</h2>
          <p>Tradición, sabor y buena cocina en cada plato</p>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <TrendingUp size={16} color="var(--teal)" />
            <span>Ingresos</span>
          </div>
          <div className="stat-value text-in">{Bs(ingresos)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <TrendingDown size={16} color="var(--bad)" />
            <span>Egresos</span>
          </div>
          <div className="stat-value text-out">{Bs(egresos)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <Scale size={16} color="var(--pri)" />
            <span>Balance</span>
          </div>
          <div className="stat-value">{Bs(balance)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <AlertTriangle size={16} color="var(--gold)" />
            <span>Alertas de stock</span>
          </div>
          <div className="stat-value" style={{ color: lowStockItems.length > 0 ? 'var(--bad)' : 'var(--ok)' }}>
            {lowStockItems.length}
          </div>
        </div>
      </div>

      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertTriangle size={18} color="var(--bad)" />
          <h3 style={{ fontSize: '18px' }}>Ingredientes por reponer</h3>
        </div>
        {lowStockItems.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td><b>{item.n}</b></td>
                    <td className="text-out">{item.s} {item.u}</td>
                    <td>{item.m} {item.u}</td>
                    <td><span className="tag low">Reponer</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-mut" style={{ margin: '8px 0' }}>
            Todo el inventario está sobre el mínimo requerido.
          </p>
        )}
      </div>

      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Clock size={18} color="var(--pri)" />
          <h3 style={{ fontSize: '18px' }}>Últimos pedidos registrados</h3>
        </div>
        {recentOrders.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Mesa / Cliente</th>
                  <th>Total</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((p) => (
                  <tr key={p.n}>
                    <td>#{p.n}</td>
                    <td><b>{p.mesa}</b></td>
                    <td className="text-in">{Bs(p.tot)}</td>
                    <td>{p.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-mut" style={{ margin: '8px 0' }}>
            Aún no se han registrado pedidos en esta sesión.
          </p>
        )}
      </div>
    </div>
  );
}