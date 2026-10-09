import { useState, useEffect, useCallback } from 'react';
import { getInitialData, today, uid } from '../data/seedData';

const STORAGE_KEY = 'rest1';

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

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Persist state changes
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

  // 1. Add Ingredient
  const addIngredient = useCallback(
    (item) => {
      const newIng = {
        id: uid(),
        n: item.n.trim(),
        u: item.u.trim(),
        s: Number(item.s) || 0,
        m: Number(item.m) || 0,
        c: Number(item.c) || 0
      };
      setData((prev) => ({
        ...prev,
        ing: [...prev.ing, newIng]
      }));
      showToast(`Ingrediente "${newIng.n}" agregado`);
    },
    [showToast]
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

  // 3. Add Dish
  const addDish = useCallback(
    ({ name, price, recipe }) => {
      const newDish = {
        id: uid(),
        n: name.trim(),
        p: Number(price) || 0,
        r: recipe // array of [ingId, qty]
      };
      setData((prev) => ({
        ...prev,
        plat: [...prev.plat, newDish]
      }));
      showToast(`Plato "${newDish.n}" creado`);
    },
    [showToast]
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

  // 7. Delete Item
  const deleteItem = useCallback(
    (collectionKey, id) => {
      setData((prev) => ({
        ...prev,
        [collectionKey]: (prev[collectionKey] || []).filter((item) => item.id !== id)
      }));
      showToast('Registro eliminado');
    },
    [showToast]
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
        `Pedido #${orderNumber} registrado con éxito. Stock descontado${
          hasLowStock ? ' · ¡Hay alertas de stock por reponer!' : ''
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
  }, [showToast]);

  return {
    data,
    toastMessage,
    showToast,
    hideToast,
    getIngredient,
    lowStockItems,
    getFinancialSum,
    addIngredient,
    recordMovement,
    addDish,
    addSupplier,
    recordPurchase,
    addFinanceRecord,
    deleteItem,
    recordOrder,
    resetToSeed
  };
}
