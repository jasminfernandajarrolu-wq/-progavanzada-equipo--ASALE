import React, { useState } from 'react';
import { Bs } from '../../data/seedData';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Modal } from '../Modal';

export function FinancesView({ data, onAddFinanceRecord, getFinancialSum }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipo, setTipo] = useState('Ingreso');
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');

  const ingresos = getFinancialSum('Ingreso');
  const egresos = getFinancialSum('Egreso');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc || !monto) return;
    onAddFinanceRecord(tipo, desc, Number(monto));
    setDesc('');
    setMonto('');
    setIsOpen(false);
  };

  return (
    <div>
      <div className="action-bar">
        <h2>Ingresos y Egresos (Caja)</h2>
        <button type="button" className="btn-pri" onClick={() => setIsOpen(true)}>
          <Plus size={16} />
          <span>Nuevo registro</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <TrendingUp size={16} color="var(--teal)" />
            <span>Total Ingresos</span>
          </div>
          <div className="stat-value text-in">{Bs(ingresos)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <TrendingDown size={16} color="var(--bad)" />
            <span>Total Egresos</span>
          </div>
          <div className="stat-value text-out">{Bs(egresos)}</div>
        </div>
      </div>

      <div className="content-box">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {data.fin.length > 0 ? (
                data.fin.map((f, idx) => (
                  <tr key={idx}>
                    <td>{f.f}</td>
                    <td>
                      <span className={`tag ${f.t === 'Ingreso' ? 'ok' : 'low'}`}>
                        {f.t}
                      </span>
                    </td>
                    <td>{f.d}</td>
                    <td className={f.t === 'Ingreso' ? 'text-in' : 'text-out'}>
                      {Bs(f.m)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    No hay movimientos financieros registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Registro Financiero */}
      <Modal isOpen={isOpen} title="Nuevo Registro de Caja" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Tipo de flujo
            <select
              className="form-input"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="Ingreso">Ingreso (Venta extraordinaria, etc.)</option>
              <option value="Egreso">Egreso (Gasto operativo, alquiler, servicios)</option>
            </select>
          </label>

          <label className="form-label">
            Descripción del concepto
            <input
              className="form-input"
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ej: Pago de gas y luz"
            />
          </label>

          <label className="form-label">
            Monto (Bs)
            <input
              className="form-input"
              type="number"
              step="any"
              min="0"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-pri">
              <Wallet size={16} />
              <span>Guardar registro</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
