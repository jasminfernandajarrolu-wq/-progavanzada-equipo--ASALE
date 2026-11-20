import { useState, useEffect, useCallback } from 'react';
import { getInitialData, today, uid } from '../data/seedData';

const STORAGE_KEY = 'rest1';
const API_BASE = 'http://127.0.0.1:5000';

// Normaliza un texto: minúsculas y sin tildes.
// "Ají amarillo" → "aji amarillo"   "Maíz mote" → "maiz mote"
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Convierte un ingrediente de la API al formato interno {id, n, u, s, m, c}
function apiIngredienteToLocal(i) {
  return {
    id: String(i.id),
    n: i.nombre,
    u: i.unidad,
    s: Number(i.stock) || 0,
    m: Number(i.stockMinimo) || 0,
    c: Number(i.precioUnitario) || 0,
    _fromApi: true
  };
}

// Convierte un plato de la API al formato interno {id, n, p, r, imagen}.
// ingList = data.ing del estado, para resolver nombres → ids.
function apiPlatoToLocal(p, ingList) {
  const r = [];
  const ingredientesRaw = Array.isArray(p.ingredientes) ? p.ingredientes : [];

  ingredientesRaw.forEach(([nombre, qty]) => {
    const nombreNorm = normalizar(nombre);
    const ing = (ingList || []).find((x) => normalizar(x.n) === nombreNorm);
    if (ing) {
      r.push([ing.id, qty]);
    } else {
      console.warn(
        `[Platos API] Ingrediente "${nombre}" no encontrado en data.ing — se omite del plato "${p.nombre}".`
      );
    }
  });

  return {
    id: String(p.id),
    n: p.nombre,
    p: p.precio,
    r,
    imagen: p.imagen || '',
    _fromApi: true,
    _rawIngredientes: ingredientesRaw
  };
}

export function useRestaurantState() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading from localStorage', e);
    }
    return getInitialData();
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriasError, setCategoriasError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosError, setUsuariosError] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Persist state changes (excluye plat que viene de la API)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [data]);

  // Toast timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // ── Cargar ingredientes desde la API ─────────────────────────────────
  const fetchIngredientes = useCallback(() => {
    return fetch(`${API_BASE}/ingredientes`)
      .then((res) => res.json())
      .then((json) => {
        if (json.datos && Array.isArray(json.datos)) {
          const ingsApi = json.datos.map(apiIngredienteToLocal);
          setData((prev) => {
            // Si ya hay platos cargados desde la API, re-resolver sus recetas con la lista fresca de ingredientes
            const platActualizados = (prev.plat || []).map((p) => {
              if (p._fromApi && p._rawIngredientes) {
                return apiPlatoToLocal(
                  { id: p.id, nombre: p.n, precio: p.p, imagen: p.imagen, ingredientes: p._rawIngredientes },
                  ingsApi
                );
              }
              return p;
            });
            return {
              ...prev,
              ing: ingsApi,
              plat: platActualizados
            };
          });
          return ingsApi;
        }
      })
      .catch((err) => {
        console.warn('No se pudo conectar con la API de ingredientes:', err.message);
        // Si la API no responde, se mantienen los datos locales
      });
  }, []);

  // ── Cargar platos desde la API ────────────────────────────────────────
  const fetchPlatos = useCallback(() => {
    return fetch(`${API_BASE}/platos`)
      .then((res) => res.json())
      .then((json) => {
        if (json.datos && Array.isArray(json.datos)) {
          setData((prev) => {
            const platosApi = json.datos.map((p) => apiPlatoToLocal(p, prev.ing));
            return { ...prev, plat: platosApi };
          });
        }
      })
      .catch((err) => {
        console.warn('No se pudo conectar con la API de platos:', err.message);
        // Si la API no responde, se mantienen los datos de localStorage/seed
      });
  }, []);

  // ── Cargar categorías desde la API ───────────────────────────────────
  const fetchCategorias = useCallback(() => {
    return fetch(`${API_BASE}/categorias`)
      .then((res) => res.json())
      .then((json) => {
        if (json.datos && Array.isArray(json.datos)) {
          setCategorias(json.datos);
          setCategoriasError(null);
          return json.datos;
        } else {
          setCategoriasError(json.error || 'Error al obtener categorías');
        }
      })
      .catch((err) => {
        console.warn('API de categorías no disponible:', err.message);
        setCategoriasError('No se pudo conectar con el servidor backend (http://127.0.0.1:5000)');
      });
  }, []);

  const addCategoria = useCallback((nombre) => {
    return fetch(`${API_BASE}/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: (nombre || '').trim() })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.datos) {
          showToast(`Categoría "${json.datos.nombre}" creada`);
          fetchCategorias();
          return { success: true, data: json.datos };
        } else {
          showToast(json.error || 'Error al crear categoría');
          return { success: false, error: json.error };
        }
      })
      .catch((err) => {
        showToast('No se pudo conectar con el servidor');
        return { success: false, error: err.message };
      });
  }, [fetchCategorias, showToast]);

  const updateCategoria = useCallback((id, nombre) => {
    return fetch(`${API_BASE}/categorias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: (nombre || '').trim() })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.datos) {
          showToast(`Categoría "${json.datos.nombre}" actualizada`);
          fetchCategorias();
          return { success: true, data: json.datos };
        } else {
          showToast(json.error || 'Error al actualizar categoría');
          return { success: false, error: json.error };
        }
      })
      .catch((err) => {
        showToast('No se pudo conectar con el servidor');
        return { success: false, error: err.message };
      });
  }, [fetchCategorias, showToast]);

  const deleteCategoria = useCallback((id) => {
    return fetch(`${API_BASE}/categorias/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          showToast(json.error);
          return { success: false, error: json.error };
        } else {
          showToast('Categoría eliminada');
          fetchCategorias();
          return { success: true };
        }
      })
      .catch((err) => {
        showToast('No se pudo conectar con el servidor');
        return { success: false, error: err.message };
      });
  }, [fetchCategorias, showToast]);

  // ── Cargar usuarios desde la API ──────────────────────────────────────
  const fetchUsuarios = useCallback(() => {
    return fetch(`${API_BASE}/usuarios`)
      .then((res) => res.json())
      .then((json) => {
        if (json.datos && Array.isArray(json.datos)) {
          setUsuarios(json.datos);
          setUsuariosError(null);
          return json.datos;
        } else {
          setUsuariosError(json.error || 'Error al obtener usuarios');
        }
      })
      .catch((err) => {
        console.warn('API de usuarios no disponible:', err.message);
        setUsuariosError('No se pudo conectar con el servidor backend (http://127.0.0.1:5000)');
      });
  }, []);

  const addUsuario = useCallback((userData) => {
    return fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: (userData.nombre || '').trim(),
        correo: (userData.correo || '').trim(),
        rol: (userData.rol || 'mesero').trim()
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.datos) {
          showToast(`Usuario "${json.datos.nombre}" creado`);
          fetchUsuarios();
          return { success: true, data: json.datos };
        } else {
          showToast(json.error || 'Error al crear usuario');
          return { success: false, error: json.error };
        }
      })
      .catch((err) => {
        showToast('No se pudo conectar con el servidor');
        return { success: false, error: err.message };
      });
  }, [fetchUsuarios, showToast]);

  const updateUsuario = useCallback((id, userData) => {
    return fetch(`${API_BASE}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: (userData.nombre || '').trim(),
        correo: (userData.correo || '').trim(),
        rol: (userData.rol || 'mesero').trim()
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.datos) {
          showToast(`Usuario "${json.datos.nombre}" actualizado`);
          fetchUsuarios();
          return { success: true, data: json.datos };
        } else {
          showToast(json.error || 'Error al actualizar usuario');
          return { success: false, error: json.error };
        }
      })
      .catch((err) => {
        showToast('No se pudo conectar con el servidor');
        return { success: false, error: err.message };
      });
  }, [fetchUsuarios, showToast]);

  const deleteUsuario = useCallback((id) => {
    return fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          showToast(json.error);
          return { success: false, error: json.error };
        } else {
          showToast('Usuario eliminado');
          fetchUsuarios();
          return { success: true };
        }
      })
      .catch((err) => {
        showToast('No se pudo conectar con el servidor');
        return { success: false, error: err.message };
      });
  }, [fetchUsuarios, showToast]);

  useEffect(() => {
    // Cargar primero ingredientes y luego platos para resolución inmediata de IDs
    fetchIngredientes().finally(() => {
      fetchPlatos();
    });
    fetchCategorias();
    fetchUsuarios();
  }, [fetchIngredientes, fetchPlatos, fetchCategorias, fetchUsuarios]);

  const getIngredient = useCallback(
    (id) => data.ing.find((x) => x.id === id),
    [data.ing]
  );

  const lowStockItems = data.ing.filter((x) => x.s <= x.m);

  const getFinancialSum = useCallback(
    (type) =>
      data.fin
        .filter((x) => x.t === type)
        .reduce((sum, item) => sum + (Number(item.m) || 0), 0),
    [data.fin]
  );

  // 1. Add Ingredient — llama a la API con fallback a local
  const addIngredient = useCallback(
    (item) => {
      const payload = {
        nombre: (item.n || '').trim(),
        unidad: (item.u || 'kg').trim(),
        stock: Number(item.s) || 0,
        stockMinimo: Number(item.m) || 0,
        precioUnitario: Number(item.c) || 0
      };

      fetch(`${API_BASE}/ingredientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.datos) {
            showToast(`Ingrediente "${json.datos.nombre}" agregado`);
            fetchIngredientes();
          } else {
            showToast(json.error || 'Error al agregar ingrediente');
          }
        })
        .catch((err) => {
          console.warn('API de ingredientes no disponible, guardando en local:', err.message);
          const newIng = {
            id: uid(),
            n: payload.nombre,
            u: payload.unidad,
            s: payload.stock,
            m: payload.stockMinimo,
            c: payload.precioUnitario
          };
          setData((prev) => ({
            ...prev,
            ing: [...prev.ing, newIng]
          }));
          showToast(`Ingrediente "${newIng.n}" agregado (modo local)`);
        });
    },
    [fetchIngredientes, showToast]
  );

  // 1.1 Update Ingredient — para edición / actualización de stock
  const updateIngredient = useCallback(
    (id, item) => {
      const payload = {
        nombre: (item.n || item.nombre || '').trim(),
        unidad: (item.u || item.unidad || 'kg').trim(),
        stock: Number(item.s !== undefined ? item.s : item.stock) || 0,
        stockMinimo: Number(item.m !== undefined ? item.m : item.stockMinimo) || 0,
        precioUnitario: Number(item.c !== undefined ? item.c : item.precioUnitario) || 0
      };

      fetch(`${API_BASE}/ingredientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.datos) {
            showToast(`Ingrediente "${json.datos.nombre}" actualizado`);
            fetchIngredientes();
          } else {
            showToast(json.error || 'Error al actualizar ingrediente');
          }
        })
        .catch((err) => {
          console.warn('API de ingredientes no disponible, actualizando local:', err.message);
          setData((prev) => ({
            ...prev,
            ing: prev.ing.map((x) =>
              String(x.id) === String(id)
                ? { ...x, n: payload.nombre, u: payload.unidad, s: payload.stock, m: payload.stockMinimo, c: payload.precioUnitario }
                : x
            )
          }));
          showToast('Ingrediente actualizado (modo local)');
        });
    },
    [fetchIngredientes, showToast]
  );

  // 2. Inventory Movement
  const recordMovement = useCallback(
    (iid, tipo, q, nota = '') => {
      const qty = Number(q) || 0;
      setData((prev) => {
        const ingIndex = prev.ing.findIndex((x) => x.id === iid);
        if (ingIndex === -1) return prev;

        const target = { ...prev.ing[ingIndex] };
        let delta = qty;

        if (tipo === 'Entrada') {
          target.s += qty;
        } else if (tipo === 'Salida') {
          target.s = Math.max(0, target.s - qty);
        } else if (tipo === 'Ajuste') {
          delta = qty - target.s;
          target.s = qty;
        }

        const newMov = {
          f: today(),
          i: target.n,
          t: tipo,
          q: Number(delta.toFixed(2)),
          nota
        };

        const updatedIng = [...prev.ing];
        updatedIng[ingIndex] = target;

        return {
          ...prev,
          ing: updatedIng,
          mov: [newMov, ...prev.mov]
        };
      });
      showToast('Movimiento de inventario registrado');
    },
    [showToast]
  );

  // 3. Add Dish — llama al API y recarga lista
  const addDish = useCallback(
    ({ name, price, recipe }) => {
      // recipe es [[ingId, qty], ...] con IDs frontend.
      // Para el backend convertimos a [[nombreIng, qty]] usando los ingredientes del estado.
      const ingredientesParaApi = recipe.map(([ingId, qty]) => {
        const ing = data.ing.find((x) => x.id === ingId);
        return [ing ? ing.n : ingId, qty];
      });

      const payload = {
        nombre: name.trim(),
        precio: Number(price) || 0,
        idCategoria: 1,          // "Platos fuertes" por defecto (id 1 tras seed)
        imagen: '',
        ingredientes: ingredientesParaApi
      };

      fetch(`${API_BASE}/platos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.datos) {
            showToast(`Plato "${json.datos.nombre}" creado`);
            fetchPlatos();   // recarga la lista actualizada
          } else {
            showToast(json.error || 'Error al crear el plato');
          }
        })
        .catch((err) => {
          console.error('Error al crear plato en API:', err);
          showToast('No se pudo conectar con el servidor');
        });
    },
    [data.ing, fetchPlatos, showToast]
  );

  // 4. Add Supplier
  const addSupplier = useCallback(
    ({ name, phone }) => {
      const newSupplier = {
        id: uid(),
        n: name.trim(),
        t: phone.trim()
      };
      setData((prev) => ({
        ...prev,
        prov: [...prev.prov, newSupplier]
      }));
      showToast(`Proveedor "${newSupplier.n}" registrado`);
    },
    [showToast]
  );

  // 5. Record Purchase
  const recordPurchase = useCallback(
    ({ supplierId, ingredientId, quantity, totalCost }) => {
      const qty = Number(quantity) || 0;
      const cost = Number(totalCost) || 0;

      setData((prev) => {
        const prov = prev.prov.find((p) => p.id === supplierId);
        const ingIndex = prev.ing.findIndex((i) => i.id === ingredientId);
        if (!prov || ingIndex === -1) return prev;

        const targetIng = { ...prev.ing[ingIndex] };
        targetIng.s += qty;
        if (qty > 0) {
          targetIng.c = cost / qty;
        }

        const newComp = {
          f: today(),
          p: prov.n,
          i: targetIng.n,
          q: qty,
          c: cost
        };

        const newMov = {
          f: today(),
          i: targetIng.n,
          t: 'Entrada',
          q: qty,
          nota: `Compra a ${prov.n}`
        };

        const newFin = {
          f: today(),
          t: 'Egreso',
          d: `Compra: ${targetIng.n}`,
          m: cost
        };

        const updatedIng = [...prev.ing];
        updatedIng[ingIndex] = targetIng;

        return {
          ...prev,
          ing: updatedIng,
          comp: [newComp, ...prev.comp],
          mov: [newMov, ...prev.mov],
          fin: [newFin, ...prev.fin]
        };
      });
      showToast('Compra registrada y stock actualizado');
    },
    [showToast]
  );

  // 6. Add Financial Record
  const addFinanceRecord = useCallback(
    (tipo, descripcion, monto) => {
      const m = Number(monto) || 0;
      const newRecord = {
        f: today(),
        t: tipo,
        d: descripcion.trim(),
        m
      };
      setData((prev) => ({
        ...prev,
        fin: [newRecord, ...prev.fin]
      }));
      showToast(`Registro financiero de ${tipo.toLowerCase()} añadido`);
    },
    [showToast]
  );

  // 7. Delete Item — para 'plat' e 'ing' llama a la API; para el resto usa localStorage
  const deleteItem = useCallback(
    (collectionKey, id) => {
      if (collectionKey === 'plat') {
        fetch(`${API_BASE}/platos/${id}`, { method: 'DELETE' })
          .then((res) => res.json())
          .then((json) => {
            if (json.error) {
              showToast(json.error);
            } else {
              showToast('Plato eliminado');
              fetchPlatos();   // recarga la lista
            }
          })
          .catch((err) => {
            console.error('Error al eliminar plato en API:', err);
            showToast('No se pudo conectar con el servidor');
          });
      } else if (collectionKey === 'ing') {
        // Regla: Antes de borrar un ingrediente, avisa si algún plato lo usa
        const targetIng = data.ing.find((x) => String(x.id) === String(id));
        const ingNorm = targetIng ? normalizar(targetIng.n) : '';

        const platoUsando = data.plat.find((p) => {
          return (
            Array.isArray(p.r) &&
            p.r.some(([iId]) => {
              if (String(iId) === String(id)) return true;
              if (targetIng && normalizar(iId) === ingNorm) return true;
              return false;
            })
          );
        });

        if (platoUsando) {
          showToast(
            `No se puede eliminar "${targetIng ? targetIng.n : 'el ingrediente'}": se usa en el plato "${platoUsando.n}"`
          );
          return;
        }

        fetch(`${API_BASE}/ingredientes/${id}`, { method: 'DELETE' })
          .then((res) => res.json())
          .then((json) => {
            if (json.error) {
              showToast(json.error);
            } else {
              showToast('Ingrediente eliminado');
              fetchIngredientes();
            }
          })
          .catch((err) => {
            console.warn('API de ingredientes no disponible al eliminar, procediendo local:', err.message);
            setData((prev) => ({
              ...prev,
              ing: (prev.ing || []).filter((item) => String(item.id) !== String(id))
            }));
            showToast('Ingrediente eliminado (modo local)');
          });
      } else if (collectionKey === 'cat') {
        deleteCategoria(id);
      } else if (collectionKey === 'usr') {
        deleteUsuario(id);
      } else {
        setData((prev) => ({
          ...prev,
          [collectionKey]: (prev[collectionKey] || []).filter((item) => item.id !== id)
        }));
        showToast('Registro eliminado');
      }
    },
    [data.ing, data.plat, fetchIngredientes, fetchPlatos, deleteCategoria, deleteUsuario, showToast]
  );

  // 8. Process Order (Sales POS)
  const recordOrder = useCallback(
    (cart, tableOrClient) => {
      const sel = data.plat.filter((p) => (cart[p.id] || 0) > 0);
      if (!sel.length) {
        showToast('Agrega al menos un plato');
        return false;
      }

      // Calculate required ingredients
      const need = {};
      sel.forEach((p) => {
        const count = cart[p.id] || 0;
        p.r.forEach(([ingId, requiredQty]) => {
          need[ingId] = (need[ingId] || 0) + requiredQty * count;
        });
      });

      // Verify stock
      for (const ingId in need) {
        const item = data.ing.find((x) => x.id === ingId);
        if (!item || item.s < need[ingId]) {
          showToast(`Falta stock de ${item ? item.n : 'un ingrediente'}`);
          return false;
        }
      }

      const orderNumber = data.ped.length + 1;
      const totalAmount = sel.reduce(
        (sum, p) => sum + p.p * (cart[p.id] || 0),
        0
      );

      setData((prev) => {
        // Deduct inventory
        const updatedIng = prev.ing.map((item) => {
          if (need[item.id]) {
            return {
              ...item,
              s: Math.max(0, item.s - need[item.id])
            };
          }
          return item;
        });

        // Add movement log for each ingredient
        const newMovements = Object.entries(need).map(([ingId, qty]) => {
          const item = prev.ing.find((x) => x.id === ingId);
          return {
            f: today(),
            i: item ? item.n : 'Ingrediente',
            t: 'Salida',
            q: Number(qty.toFixed(2)),
            nota: `Pedido #${orderNumber}`
          };
        });

        const newOrder = {
          n: orderNumber,
          mesa: tableOrClient.trim() || 'Sin mesa',
          tot: totalAmount,
          f: today(),
          d: sel.map((p) => `${cart[p.id]}× ${p.n}`).join(', '),
          items: sel.map((p) => [p.n, cart[p.id], p.p * cart[p.id]])
        };

        const newFinance = {
          f: today(),
          t: 'Ingreso',
          d: `Venta pedido #${orderNumber}`,
          m: totalAmount
        };

        return {
          ...prev,
          ing: updatedIng,
          mov: [...newMovements, ...prev.mov],
          ped: [newOrder, ...prev.ped],
          fin: [newFinance, ...prev.fin]
        };
      });

      const hasLowStock = data.ing.some((x) => {
        const remaining = (need[x.id] ? x.s - need[x.id] : x.s);
        return remaining <= x.m;
      });

      showToast(
        `Pedido #${orderNumber} registrado con éxito. Stock descontado${hasLowStock ? ' · ¡Hay alertas de stock por reponer!' : ''
        }`
      );
      return true;
    },
    [data.plat, data.ing, data.ped.length, showToast]
  );

  // 9. Reset seed data
  const resetToSeed = useCallback(() => {
    const seed = getInitialData();
    setData(seed);
    showToast('Datos de ejemplo restablecidos');
    // Recarga todas las entidades de la API tras resetear
    fetchIngredientes().finally(() => {
      fetchPlatos();
    });
    fetchCategorias();
    fetchUsuarios();
  }, [showToast, fetchIngredientes, fetchPlatos, fetchCategorias, fetchUsuarios]);

  return {
    data,
    toastMessage,
    showToast,
    hideToast,
    getIngredient,
    lowStockItems,
    getFinancialSum,
    addIngredient,
    updateIngredient,
    recordMovement,
    addDish,
    addSupplier,
    recordPurchase,
    addFinanceRecord,
    deleteItem,
    recordOrder,
    resetToSeed,
    fetchPlatos,
    fetchIngredientes,
    categorias,
    categoriasError,
    fetchCategorias,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    usuarios,
    usuariosError,
    fetchUsuarios,
    addUsuario,
    updateUsuario,
    deleteUsuario
  };
}
