const $ = s => document.querySelector(s),
  esc = s =>
    String(s).replace(
      /[&<>"]/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
    );
const Bs = n => 'Bs ' + (+n).toFixed(2),
  today = () => new Date().toLocaleDateString('es-BO'),
  uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

const seed = () => ({
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

let S;
try {
  S = JSON.parse(localStorage.getItem('rest1'));
} catch (e) {}
S = S || seed();

const save = () => {
  try {
    localStorage.setItem('rest1', JSON.stringify(S));
  } catch (e) {}
};

let cur = 'dash',
  cart = {};

const T = {
  dash: 'Inicio',
  ing: 'Ingredientes',
  plat: 'Platos',
  prov: 'Proveedores',
  ped: 'Pedidos',
  comp: 'Compras',
  fin: 'Ingresos y egresos',
  rep: 'Reportes'
};

const I = id => S.ing.find(x => x.id == id),
  low = () => S.ing.filter(x => x.s <= x.m);

function toast(t) {
  const e = $('#toast');
  e.textContent = t;
  e.classList.add('show');
  setTimeout(() => e.classList.remove('show'), 2600);
}

function ask(title, fields, cb) {
  const D = $('#dlg');
  D.innerHTML = `<form><h3>${title}</h3>${fields
    .map(
      f =>
        `<label>${f.l}${
          f.t == 'select'
            ? `<select name="${f.k}">${f.o
                .map(o => `<option value="${o[0]}">${esc(o[1])}</option>`)
                .join('')}</select>`
            : `<input name="${f.k}" type="${f.t || 'text'}" ${
                f.t == 'number' ? 'step="any" min="0"' : ''
              } ${f.r === 0 ? '' : 'required'}>`
        }</label>`
    )
    .join('')}<div class="row"><button type="button" class="ghost" id="cx">Cancelar</button><button class="pri">Guardar</button></div></form>`;
  D.showModal();
  $('#cx').onclick = () => D.close();
  D.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target));
    D.close();
    cb(o);
  };
}

function move(iid, tipo, q, nota) {
  const x = I(iid);
  if (tipo == 'Entrada') x.s += q;
  else if (tipo == 'Salida') x.s = Math.max(0, x.s - q);
  else {
    q = q - x.s;
    x.s += q;
  }
  S.mov.unshift({ f: today(), i: x.n, t: tipo, q: +q.toFixed(2), nota });
}

function addFin(t, d, m) {
  S.fin.unshift({ f: today(), t, d, m: +m });
}

const tbl = (h, rows) =>
  `<div class="tw"><table><tr>${h
    .map(x => `<th>${x}</th>`)
    .join('')}</tr>${rows.join('') ||
    `<tr><td colspan="${h.length}" class="mut">Aún no hay registros.</td></tr>`}</table></div>`;

const sum = t =>
  S.fin.filter(x => x.t == t).reduce((a, x) => a + x.m, 0);

const V = {
  dash() {
    const L = low();
    return `<div class="grid"><div class="stat"><b class="in">${Bs(
      sum('Ingreso')
    )}</b><span>Ingresos</span></div><div class="stat"><b class="out">${Bs(
      sum('Egreso')
    )}</b><span>Egresos</span></div><div class="stat"><b>${Bs(
      sum('Ingreso') - sum('Egreso')
    )}</b><span>Balance</span></div><div class="stat"><b>${
      L.length
    }</b><span>Alertas de stock</span></div></div>
<div class="box"><h3>Ingredientes por reponer</h3>${
      L.length
        ? tbl(
            ['Ingrediente', 'Stock', 'Mínimo'],
            L.map(
              x =>
                `<tr><td>${esc(x.n)}</td><td class="out">${x.s} ${
                  x.u
                }</td><td>${x.m} ${x.u}</td></tr>`
            )
          )
        : '<p class="mut">Todo el inventario está sobre el mínimo.</p>'
    }</div>
<div class="box"><h3>Últimos pedidos</h3>${tbl(
      ['N°', 'Mesa', 'Total', 'Fecha'],
      S.ped
        .slice(0, 5)
        .map(
          p =>
            `<tr><td>${p.n}</td><td>${esc(p.mesa)}</td><td>${Bs(
              p.tot
            )}</td><td>${p.f}</td></tr>`
        )
    )}</div>`;
  },
  ing() {
    return `<div class="bar"><h2>Ingredientes</h2><button class="pri" data-a="addIng">Nuevo ingrediente</button></div><div class="box">${tbl(
      ['Nombre', 'Stock', 'Mínimo', 'Costo/u', 'Estado', ''],
      S.ing.map(
        x =>
          `<tr><td>${esc(x.n)}</td><td>${+x.s.toFixed(2)} ${
            x.u
          }</td><td>${x.m} ${x.u}</td><td>${Bs(x.c)}</td><td><span class="tag ${
            x.s <= x.m ? 'low' : 'ok'
          }">${
            x.s <= x.m ? 'Reponer' : 'Normal'
          }</span></td><td><button class="sm" data-a="mov" data-id="${
            x.id
          }">Movimiento</button> <button class="sm del" data-a="del" data-k="ing" data-id="${
            x.id
          }">Borrar</button></td></tr>`
      )
    )}</div>
<div class="box"><h3>Historial de movimientos</h3>${tbl(
      ['Fecha', 'Ingrediente', 'Tipo', 'Cantidad', 'Nota'],
      S.mov
        .slice(0, 15)
        .map(
          m =>
            `<tr><td>${m.f}</td><td>${esc(m.i)}</td><td>${m.t}</td><td>${
              m.q
            }</td><td>${esc(m.nota || '')}</td></tr>`
        )
    )}</div>`;
  },
  plat() {
    return `<div class="bar"><h2>Platos</h2><button class="pri" data-a="addPlat">Nuevo plato</button></div><div class="box">${
      S.plat
        .map(
          p =>
            `<div class="plato"><div><b>${esc(p.n)}</b> · ${Bs(
              p.p
            )}<div class="mut" style="font-size:13px">${p.r
              .map(([i, q]) => `${q} ${I(i)?.u || ''} ${esc(I(i)?.n || '?')}`)
              .join(', ')}</div></div><button class="sm del" data-a="del" data-k="plat" data-id="${
              p.id
            }">Borrar</button></div>`
        )
        .join('') || '<p class="mut">Agrega tu primer plato.</p>'
    }</div>`;
  },
  prov() {
    return `<div class="bar"><h2>Proveedores</h2><button class="pri" data-a="addProv">Nuevo proveedor</button></div><div class="box">${tbl(
      ['Nombre', 'Teléfono', ''],
      S.prov.map(
        p =>
          `<tr><td>${esc(p.n)}</td><td>${esc(p.t)}</td><td><button class="sm del" data-a="del" data-k="prov" data-id="${
            p.id
          }">Borrar</button></td></tr>`
      )
    )}</div>`;
  },
  ped() {
    const tot = S.plat.reduce((a, p) => a + (cart[p.id] || 0) * p.p, 0);
    return `<h2>Nuevo pedido</h2><div class="box">${S.plat
      .map(
        p =>
          `<div class="plato"><div><b>${esc(p.n)}</b><div class="mut">${Bs(
            p.p
          )}</div></div><div class="step"><button data-a="step" data-id="${
            p.id
          }" data-d="-1" aria-label="Quitar">−</button><b>${
            cart[p.id] || 0
          }</b><button data-a="step" data-id="${
            p.id
          }" data-d="1" aria-label="Agregar">+</button></div></div>`
      )
      .join('')}
<label>Mesa o cliente<input id="mesa" placeholder="Ej: Mesa 4"></label><div class="bar"><b>Total: ${Bs(
      tot
    )}</b><button class="pri" data-a="order">Registrar pedido</button></div></div>
<div class="box"><h3>Historial de ventas</h3>${tbl(
      ['N°', 'Mesa', 'Detalle', 'Total', 'Fecha'],
      S.ped.map(
        p =>
          `<tr><td>${p.n}</td><td>${esc(p.mesa)}</td><td>${esc(
            p.d
          )}</td><td>${Bs(p.tot)}</td><td>${p.f}</td></tr>`
      )
    )}</div>`;
  },
  comp() {
    return `<div class="bar"><h2>Compras de insumos</h2><button class="pri" data-a="addComp">Registrar compra</button></div><div class="box">${tbl(
      ['Fecha', 'Proveedor', 'Ingrediente', 'Cantidad', 'Costo'],
      S.comp.map(
        c =>
          `<tr><td>${c.f}</td><td>${esc(c.p)}</td><td>${esc(c.i)}</td><td>${
            c.q
          }</td><td>${Bs(c.c)}</td></tr>`
      )
    )}</div>`;
  },
  fin() {
    return `<div class="bar"><h2>Ingresos y egresos</h2><button class="pri" data-a="addFin">Nuevo registro</button></div><div class="grid"><div class="stat"><b class="in">${Bs(
      sum('Ingreso')
    )}</b><span>Ingresos</span></div><div class="stat"><b class="out">${Bs(
      sum('Egreso')
    )}</b><span>Egresos</span></div></div><div class="box">${tbl(
      ['Fecha', 'Tipo', 'Descripción', 'Monto'],
      S.fin.map(
        f =>
          `<tr><td>${f.f}</td><td class="${
            f.t == 'Ingreso' ? 'in' : 'out'
          }">${f.t}</td><td>${esc(f.d)}</td><td>${Bs(f.m)}</td></tr>`
      )
    )}</div>`;
  },
  rep() {
    const v = {};
    S.ped.forEach(p =>
      p.items.forEach(([n, q, m]) => {
        v[n] = v[n] || [0, 0];
        v[n][0] += q;
        v[n][1] += m;
      })
    );
    return `<div class="bar"><h2>Reportes</h2><button class="ghost" data-a="print">Imprimir / PDF</button></div>
<div class="box"><h3>Inventario valorizado</h3>${tbl(
      ['Ingrediente', 'Stock', 'Valor'],
      S.ing.map(
        x =>
          `<tr><td>${esc(x.n)}</td><td>${+x.s.toFixed(2)} ${x.u}</td><td>${Bs(
            x.s * x.c
          )}</td></tr>`
      )
    )}<p><b>Total: ${Bs(
      S.ing.reduce((a, x) => a+ x.s * x.c, 0)
    )}</b></p></div>
<div class="box"><h3>Ventas por plato</h3>${tbl(
      ['Plato', 'Unidades', 'Total'],
      Object.entries(v).map(
        ([n, a]) => `<tr><td>${esc(n)}</td><td>${a[0]}</td><td>${Bs(a[1])}</td></tr>`
      )
    )}</div>
<div class="box"><h3>Resumen</h3><p>Ventas: ${Bs(
      S.ped.reduce((a, p) => a + p.tot, 0)
    )} · Compras: ${Bs(
      S.comp.reduce((a, c) => a + c.c, 0)
    )} · Balance: <b>${Bs(
      sum('Ingreso') - sum('Egreso')
    )}</b></p><button class="ghost del" data-a="reset">Restablecer datos de ejemplo</button></div>`;
  }
};

function render() {
  $('#nav').innerHTML = Object.entries(T)
    .map(
      ([k, v]) =>
        `<button data-v="${k}" class="${k == cur ? 'on' : ''}">${v}${
          k == 'dash' && low().length ? ' (' + low().length + ')' : ''
        }</button>`
    )
    .join('');
  $('#app').innerHTML = V[cur]();
  save();
}

const opts = a => a.map(x => [x.id, x.n]);

const A = {
  addIng: () =>
    ask(
      'Nuevo ingrediente',
      [
        { k: 'n', l: 'Nombre' },
        { k: 'u', l: 'Unidad (kg, l, unid)' },
        { k: 's', l: 'Stock inicial', t: 'number' },
        { k: 'm', l: 'Stock mínimo', t: 'number' },
        { k: 'c', l: 'Costo por unidad (Bs)', t: 'number' }
      ],
      o => {
        S.ing.push({
          id: uid(),
          n: o.n,
          u: o.u,
          s: +o.s,
          m: +o.m,
          c: +o.c
        });
        render();
      }
    ),
  mov: b =>
    ask(
      'Movimiento de ' + I(b.dataset.id).n,
      [
        {
          k: 't',
          l: 'Tipo',
          t: 'select',
          o: [
            ['Entrada', 'Entrada'],
            ['Salida', 'Salida (merma o consumo)'],
            ['Ajuste', 'Ajuste (stock real contado)']
          ]
        },
        { k: 'q', l: 'Cantidad', t: 'number' },
        { k: 'n', l: 'Nota', r: 0 }
      ],
      o => {
        move(b.dataset.id, o.t, +o.q, o.n);
        render();
        toast('Movimiento registrado');
      }
    ),
  addPlat: () => {
    const io = [['', '—']].concat(opts(S.ing));
    ask(
      'Nuevo plato',
      [
        { k: 'n', l: 'Nombre' },
        { k: 'p', l: 'Precio (Bs)', t: 'number' }
      ].concat(
        [1, 2, 3].flatMap(n => [
          { k: 'i' + n, l: 'Ingrediente ' + n, t: 'select', o: io, r: 0 },
          { k: 'q' + n, l: 'Cantidad por plato', t: 'number', r: 0 }
        ])
      ),
      o => {
        const r = [1, 2, 3]
          .filter(n => o['i' + n] && +o['q' + n] > 0)
          .map(n => [o['i' + n], +o['q' + n]]);
        S.plat.push({ id: uid(), n: o.n, p: +o.p, r });
        render();
      }
    );
  },
  addProv: () =>
    ask(
      'Nuevo proveedor',
      [
        { k: 'n', l: 'Nombre' },
        { k: 't', l: 'Teléfono' }
      ],
      o => {
        S.prov.push({ id: uid(), n: o.n, t: o.t });
        render();
      }
    ),
  addComp: () => {
    if (!S.prov.length) return toast('Primero registra un proveedor');
    ask(
      'Registrar compra',
      [
        { k: 'p', l: 'Proveedor', t: 'select', o: opts(S.prov) },
        { k: 'i', l: 'Ingrediente', t: 'select', o: opts(S.ing) },
        { k: 'q', l: 'Cantidad', t: 'number' },
        { k: 'c', l: 'Costo total (Bs)', t: 'number' }
      ],
      o => {
        const x = I(o.i),
          p = S.prov.find(y => y.id == o.p);
        move(o.i, 'Entrada', +o.q, 'Compra a ' + p.n);
        x.c = +o.c / +o.q;
        S.comp.unshift({
          f: today(),
          p: p.n,
          i: x.n,
          q: +o.q,
          c: +o.c
        });
        addFin('Egreso', 'Compra: ' + x.n, o.c);
        render();
        toast('Compra registrada y stock actualizado');
      }
    );
  },
  addFin: () =>
    ask(
      'Nuevo registro',
      [
        {
          k: 't',
          l: 'Tipo',
          t: 'select',
          o: [
            ['Ingreso', 'Ingreso'],
            ['Egreso', 'Egreso']
          ]
        },
        { k: 'd', l: 'Descripción' },
        { k: 'm', l: 'Monto (Bs)', t: 'number' }
      ],
      o => {
        addFin(o.t, o.d, o.m);
        render();
      }
    ),
  del: b => {
    if (confirm('¿Borrar este registro?')) {
      S[b.dataset.k] = S[b.dataset.k].filter(x => x.id != b.dataset.id);
      render();
    }
  },
  step: b => {
    const k = b.dataset.id;
    cart[k] = Math.max(0, (cart[k] || 0) + +b.dataset.d);
    const m = $('#mesa')?.value;
    render();
    if ($('#mesa')) $('#mesa').value = m;
  },
  order: () => {
    const sel = S.plat.filter(p => cart[p.id] > 0);
    if (!sel.length) return toast('Agrega al menos un plato');
    const need = {};
    sel.forEach(p =>
      p.r.forEach(([i, q]) => (need[i] = (need[i] || 0) + q * cart[p.id]))
    );
    for (const i in need)
      if (!I(i) || I(i).s < need[i])
        return toast('Falta stock de ' + (I(i)?.n || 'ingrediente'));
    const n = S.ped.length + 1,
      tot = sel.reduce((a, p) => a + p.p * cart[p.id], 0);
    for (const i in need) move(i, 'Salida', need[i], 'Pedido #' + n);
    S.ped.unshift({
      n,
      mesa: $('#mesa').value || 'Sin mesa',
      tot,
      f: today(),
      d: sel.map(p => cart[p.id] + '× ' + p.n).join(', '),
      items: sel.map(p => [p.n, cart[p.id], p.p * cart[p.id]])
    });
    addFin('Ingreso', 'Venta pedido #' + n, tot);
    cart = {};
    render();
    toast(
      'Pedido registrado. Stock descontado' +
        (low().length ? ' · hay alertas de stock' : '')
    );
  },
  print: () => window.print(),
  reset: () => {
    if (confirm('Se borrarán todos tus datos.')) {
      S = seed();
      cart = {};
      render();
    }
  }
};

document.addEventListener('click', e => {
  const v = e.target.closest('[data-v]');
  if (v) {
    cur = v.dataset.v;
    return render();
  }
  const b = e.target.closest('[data-a]');
  if (b) A[b.dataset.a](b);
});

render();
