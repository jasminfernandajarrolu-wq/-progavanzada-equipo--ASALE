import React, { useState } from 'react';
import { Bs } from '../../data/seedData';
import { Plus, Trash2, Eye } from 'lucide-react';
import { Modal } from '../Modal';

// Convierte "Pollo al maní" -> "pollo-al-mani"
function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Emoji de reemplazo según palabras del nombre
function dishEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('salte')) return '🥟';
  if (n.includes('pollo') || n.includes('sajta')) return '🍗';
  if (n.includes('charque') || n.includes('carne') || n.includes('silpancho')) return '🥩';
  if (n.includes('sopa') || n.includes('chairo') || n.includes('caldo')) return '🍲';
  if (n.includes('pescado') || n.includes('trucha')) return '🐟';
  if (n.includes('mote') || n.includes('choclo')) return '🌽';
  return '🍽️';
}

function DishPhoto({ name }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="dish-photo dish-photo-fallback" aria-hidden="true">
        <span>{dishEmoji(name)}</span>
      </div>
    );
  }

  return (
    <img
      className="dish-photo"
      src={`/platos/${toSlug(name)}.jpg`}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function DishesView({ data, onAddDish, onDeleteItem, getIngredient, readOnly = false }) {
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
    if (readOnly) return;
    if (!dishName || !dishPrice) return;

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
        <div>
          <h2>Platos y Especialidades</h2>
          <span className="text-mut" style={{ fontSize: '13px' }}>
            Carta gastronómica de Sabores Bolivianos
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
            <span>Nuevo plato</span>
          </button>
        )}
      </div>

      {data.plat.length > 0 ? (
        <div className="dishes-grid">
          {data.plat.map((p) => (
            <article key={p.id} className="dish-tile">
              <DishPhoto name={p.n} />

              <div className="dish-body">
                <div className="dish-head">
                  <h3 className="dish-name">{p.n}</h3>
                  <span className="dish-price">{Bs(p.p)}</span>
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

                {!readOnly && (
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
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="content-box">
          <p className="text-mut" style={{ textAlign: 'center', padding: '16px' }}>
            No hay platos configurados en la carta.
          </p>
        </div>
      )}

      {/* Modal: Nuevo Plato (Solo si NO es solo lectura) */}
      {!readOnly && (
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
      )}
    </div>
  );
}