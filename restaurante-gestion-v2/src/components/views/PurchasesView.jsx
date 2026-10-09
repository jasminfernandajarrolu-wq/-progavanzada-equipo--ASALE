import React, { useState } from 'react';
import { Bs } from '../../data/seedData';
import { Plus, ShoppingCart } from 'lucide-react';
import { Modal } from '../Modal';

export function PurchasesView({ data, onRecordPurchase, showToast }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');

  const handleOpenModal = () => {
    if (data.prov.length === 0) {
      showToast('Primero registra al menos un proveedor');
      return;
    }
    if (data.ing.length === 0) {
      showToast('Primero registra al menos un ingrediente');
      return;
    }
    setSupplierId(data.prov[0]?.id || '');
    setIngredientId(data.ing[0]?.id || '');
    setQuantity('');
    setTotalCost('');
    setIsAddOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || !ingredientId || !quantity || !totalCost) return;

    onRecordPurchase({
      supplierId,
      ingredientId,
      quantity: Number(quantity),
      totalCost: Number(totalCost)
    });

    setIsAddOpen(false);
  };

  return (
    <div>
      <div className="action-bar">
        <h2>Compras de Insumos</h2>
        <button type="button" className="btn-pri" onClick={handleOpenModal}>
          <Plus size={16} />
          <span>Registrar compra</span>
        </button>
      </div>

      <div className="content-box">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Ingrediente</th>
                <th>Cantidad</th>
                <th>Costo Total</th>
              </tr>
            </thead>
            <tbody>
              {data.comp.length > 0 ? (
                data.comp.map((c, idx) => (
                  <tr key={idx}>
                    <td>{c.f}</td>
                    <td><b>{c.p}</b></td>
                    <td>{c.i}</td>
                    <td>{c.q}</td>
                    <td className="text-out">{Bs(c.c)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
                    No hay compras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Compra */}
      <Modal isOpen={isAddOpen} title="Registrar Compra de Insumos" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Proveedor
            <select
              className="form-input"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
            >
              {data.prov.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.n}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Ingrediente adquirido
            <select
              className="form-input"
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              required
            >
              {data.ing.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.n} ({i.u})
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label className="form-label">
              Cantidad
              <input
                className="form-input"
                type="number"
                step="any"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
              />
            </label>

            <label className="form-label">
              Costo total (Bs)
              <input
                className="form-input"
                type="number"
                step="any"
                min="0"
                required
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="0.00"
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-pri">
              <ShoppingCart size={16} />
              <span>Guardar compra</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
