import React from 'react';
import { Bs } from '../../data/seedData';
import { Printer, RefreshCw, BarChart2, Calculator } from 'lucide-react';

export function ReportsView({ data, getFinancialSum, onResetToSeed }) {
  // Aggregate sales by dish
  const salesByDish = {};
  data.ped.forEach((p) => {
    (p.items || []).forEach(([dishName, qty, amount]) => {
      if (!salesByDish[dishName]) {
        salesByDish[dishName] = { qty: 0, total: 0 };
      }
      salesByDish[dishName].qty += qty;
      salesByDish[dishName].total += amount;
    });
  });

  const totalInventoryValue = data.ing.reduce(
    (sum, x) => sum + x.s * x.c,
    0
  );

  const totalSales = data.ped.reduce((sum, p) => sum + p.tot, 0);
  const totalPurchases = data.comp.reduce((sum, c) => sum + c.c, 0);
  const balance = getFinancialSum('Ingreso') - getFinancialSum('Egreso');

  return (
    <div>
      <div className="action-bar">
        <h2>Reportes y Estadísticas</h2>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => window.print()}
          title="Imprimir informe en papel o exportar a PDF"
        >
          <Printer size={16} />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      {/* Inventario valorizado */}
      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calculator size={18} color="var(--pri)" />
          <h3 style={{ fontSize: '18px' }}>Inventario valorizado</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Stock Disponible</th>
                <th>Costo Unitario</th>
                <th>Valorización Total</th>
              </tr>
            </thead>
            <tbody>
              {data.ing.map((x) => (
                <tr key={x.id}>
                  <td><b>{x.n}</b></td>
                  <td>{Number(x.s.toFixed(2))} {x.u}</td>
                  <td>{Bs(x.c)}</td>
                  <td className="text-in">{Bs(x.s * x.c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '16px' }}>
          Valor Total del Inventario: <b>{Bs(totalInventoryValue)}</b>
        </div>
      </div>

      {/* Ventas por plato */}
      <div className="content-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={18} color="var(--teal)" />
          <h3 style={{ fontSize: '18px' }}>Ventas por plato típico</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plato</th>
                <th>Unidades Vendidas</th>
                <th>Total Facturado</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(salesByDish).length > 0 ? (
                Object.entries(salesByDish).map(([dishName, stat]) => (
                  <tr key={dishName}>
                    <td><b>{dishName}</b></td>
                    <td>{stat.qty} porciones</td>
                    <td className="text-in">{Bs(stat.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    Aún no se han vendido platos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="content-box">
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Resumen Ejecutivo</h3>
        <p style={{ margin: '8px 0 20px', lineHeight: 1.8 }}>
          Ventas Acumuladas: <b>{Bs(totalSales)}</b> · Compras de Insumos: <b>{Bs(totalPurchases)}</b> · Balance de Caja: <b style={{ color: balance >= 0 ? 'var(--teal)' : 'var(--bad)' }}>{Bs(balance)}</b>
        </p>

        <button
          type="button"
          className="btn-ghost btn-del"
          onClick={() => {
            if (window.confirm('¿Seguro que deseas restablecer todos los datos a la versión inicial de prueba?')) {
              onResetToSeed();
            }
          }}
        >
          <RefreshCw size={15} />
          <span>Restablecer datos de ejemplo</span>
        </button>
      </div>
    </div>
  );
}
