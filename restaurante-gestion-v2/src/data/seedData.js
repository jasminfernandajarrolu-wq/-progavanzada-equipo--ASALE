export const Bs = (n) => `Bs ${Number(n || 0).toFixed(2)}`;

export const today = () => new Date().toLocaleDateString('es-BO');

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export const getInitialData = () => ({
  ing: [
    { id: 'i1', n: 'Charque', u: 'kg', s: 8, m: 3, c: 70 },
    { id: 'i2', n: 'Papa', u: 'kg', s: 40, m: 15, c: 5 },
    { id: 'i3', n: 'Maíz mote', u: 'kg', s: 12, m: 5, c: 12 },
    { id: 'i4', n: 'Carne de res', u: 'kg', s: 20, m: 8, c: 55 },
    { id: 'i5', n: 'Pollo', u: 'kg', s: 15, m: 6, c: 22 },
    { id: 'i6', n: 'Arroz', u: 'kg', s: 25, m: 10, c: 9 },
    { id: 'i7', n: 'Ají amarillo', u: 'kg', s: 2, m: 2, c: 30 },
    { id: 'i8', n: 'Maní', u: 'kg', s: 6, m: 3, c: 25 }
  ],
  prov: [
    { id: 'p1', n: 'Mercado Rodríguez', t: '70012345' },
    { id: 'p2', n: 'Avícola Los Andes', t: '71122334' }
  ],
  plat: [
    { id: 'd1', n: 'Pique macho', p: 55, r: [['i4', 0.3], ['i2', 0.3], ['i7', 0.02]] },
    { id: 'd2', n: 'Sopa de maní', p: 30, r: [['i8', 0.08], ['i2', 0.2], ['i6', 0.05]] },
    { id: 'd3', n: 'Silpancho', p: 35, r: [['i4', 0.2], ['i2', 0.3], ['i6', 0.15]] },
    { id: 'd4', n: 'Fricasé', p: 40, r: [['i5', 0.3], ['i3', 0.1], ['i7', 0.03]] },
    { id: 'd5', n: 'Charquekan', p: 50, r: [['i1', 0.2], ['i3', 0.15], ['i2', 0.2]] }
  ],
  ped: [],
  comp: [],
  mov: [],
  fin: []
});
