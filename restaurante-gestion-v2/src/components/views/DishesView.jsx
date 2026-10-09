import React, { useState } from 'react';
import { Bs } from '../../data/seedData';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { Modal } from '../Modal';

export function DishesView({ data, onAddDish, onDeleteItem, getIngredient }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [recipes, setRecipes] = useState([
    { ingId: '', qty: '' },
    { ingId: '', qty: '' },
    { ingId: '', qty: '' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dishName || !dishPrice) return;

    // Filter valid recipe pairs
    const validRecipe = recipes
      .filter((r) => r.ingId && Number(r.qty) > 0)
      .map((r) => [r.ingId, Number(r.qty)]);

    onAddDish({
      name: dishName,
      price: Number(dishPrice),
      recipe: validRecipe
    });

    setDishName('');
    setDishPrice('');
    setRecipes([
      { ingId: '', qty: '' },
      { ingId: '', qty: '' },
      { ingId: '', qty: '' }
    ]);
    setIsAddOpen(false);
  };

  const addRecipeRow = () => {
    setRecipes([...recipes, { ingId: '', qty: '' }]);
  };

  const removeRecipeRow = (index) => {
    if (recipes.length <= 1) {
      setRecipes([{ ingId: '', qty: '' }]);
      return;
    }
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  const updateRecipeRow = (index, field, value) => {
    const updated = [...recipes];
    updated[index] = { ...updated[index], [field]: value };
    setRecipes(updated);
  };

  return (
    <div>
      <div className="action-bar">
        <h2>Platos y Especialidades</h2>
        <button type="button" className="btn-pri" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          <span>Nuevo plato</span>
        </button>
      </div>

      <div className="content-box">
        {data.plat.length > 0 ? (
          <div>
            {data.plat.map((p) => (
              <div key={p.id} className="dish-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={16} color="var(--pri)" />
                    <b>{p.n}</b>
                    <span className="text-in" style={{ fontSize: '15px' }}>· {Bs(p.p)}</span>
                  </div>
                  <div className="dish-recipe">
                    {p.r.length > 0 ? (
                      p.r
                        .map(([iId, q]) => {
                          const ing = getIngredient(iId);
                          return `${q} ${ing ? ing.u : ''} de ${ing ? ing.n : '?'}`;
                        })
                        .join(' · ')
                    ) : (
                      <span className="text-mut">Sin ingredientes configurados</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-ghost btn-sm btn-del"
                  onClick={() => {
                    if (window.confirm(`¿Borrar el plato "${p.n}"?`)) {
                      onDeleteItem('plat', p.id);
                    }
                  }}
                  title="Eliminar plato"
                >
                  <Trash2 size={13} style={{ marginRight: '4px' }} />
                  Borrar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
            No hay platos configurados. Agrega tu primer plato típico.
          </p>
        )}
      </div>

      {/* Modal: Nuevo Plato */}
      <Modal isOpen={isAddOpen} title="Nuevo Plato del Menú" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleSubmit}>
          <label className="form-label">
            Nombre del plato
            <input
              className="form-input"
              required
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Ej: Fricasé de cerdo"
            />
          </label>

          <label className="form-label">
            Precio de venta al público (Bs)
            <input
              className="form-input"
              type="number"
              step="any"
              min="0"
              required
              value={dishPrice}
              onChange={(e) => setDishPrice(e.target.value)}
              placeholder="Ej: 45.00"
            />
          </label>

          <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>
              Escandallo / Receta (Ingredientes por porción)
            </span>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={addRecipeRow}
              style={{ padding: '2px 8px', fontSize: '12px' }}
            >
              + Añadir ingrediente
            </button>
          </div>

          {recipes.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: '8px',
                marginBottom: '8px',
                alignItems: 'center'
              }}
            >
              <select
                className="form-input"
                value={row.ingId}
                onChange={(e) => updateRecipeRow(idx, 'ingId', e.target.value)}
              >
                <option value="">— Seleccionar ingrediente {idx + 1} —</option>
                {data.ing.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.n} ({item.u})
                  </option>
                ))}
              </select>

              <input
                className="form-input"
                type="number"
                step="any"
                min="0"
                placeholder="Cantidad"
                value={row.qty}
                onChange={(e) => updateRecipeRow(idx, 'qty', e.target.value)}
              />

              <button
                type="button"
                className="btn-ghost btn-sm btn-del"
                style={{ padding: '8px', height: '100%', display: 'flex', alignItems: 'center' }}
                onClick={() => removeRecipeRow(idx)}
                title="Quitar ingrediente de la receta"
                disabled={recipes.length <= 1}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-pri">
              Guardar plato
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
