# Plan 001: Buscador de platos

## Archivos a tocar
- NUEVO: src/utils/dishSearch.js (lógica de búsqueda, sin interfaz)
- MODIFICAR: src/components/views/DishesView.jsx (campo de búsqueda y lista filtrada)
- MODIFICAR: src/index.css (estilos del campo de búsqueda)
- MODIFICAR: memory.md (actualizar estado al terminar)
- NO TOCAR: src/hooks/useRestaurantState.js ni ningún otro archivo.

## Cómo se implementa

### 1. Lógica (src/utils/dishSearch.js)
- Función normalizeText(texto): pasa a minúsculas, separa y quita las tildes
  (mismo método NFD que ya usa toSlug) y elimina espacios al inicio y al final.
  Cubre RF-05, RF-06, CL-01 y CL-02.
- Función filterDishes(platos, texto): si el texto normalizado está vacío devuelve
  todos los platos (RF-07, CL-02). Si no, devuelve los platos cuyo nombre normalizado
  CONTIENE el texto normalizado, usando includes() de texto plano, sin expresiones
  regulares (RF-04, CL-04). No modifica el arreglo original (RF-09).

### 2. Estado en la vista (DishesView.jsx)
- Nuevo estado local: search (texto escrito), con useState, junto a los demás.
- Valor calculado en cada render: filtered = filterDishes(data.plat, search).
  No se guarda en otro estado ni en localStorage.

### 3. Interfaz
- Campo de texto arriba de la cuadrícula, debajo de la barra de acción, con el
  ícono Search de lucide-react (ya instalado, no se agrega librería).
- Placeholder: "Buscar plato por nombre" (RF-02). Se filtra al escribir (RF-03).
- La cuadrícula recorre filtered en lugar de data.plat.

### 4. Estados de la lista
- Si data.plat está vacío: se mantiene el mensaje que ya existe (CL-05).
- Si hay platos pero filtered está vacío: se muestra "No se encontraron platos" (RF-08).
- Si hay resultados: se muestran las tarjetas como antes.

### 5. Estilos
- Clases nuevas en src/index.css para el contenedor y el campo (ancho completo con
  máximo, para que un texto largo no rompa el diseño, CL-03). Se reutilizan las
  variables de color existentes.

## Casos límite y dónde se resuelven
- CL-01 y CL-02: trim dentro de normalizeText.
- CL-03: el campo tiene ancho máximo y el navegador recorta el texto largo.
- CL-04: includes() de texto plano, sin RegExp.
- CL-05: la condición data.plat.length > 0 existente se conserva.

## Riesgos
- La "ñ" se trata como "n" al quitar tildes (aceptado en RF-06).
- Borrar un plato mientras hay texto escrito: la lista se recalcula sola porque
  filtered se calcula en cada render.