# Especificación 001: Buscador de platos

## Objetivo
Permitir filtrar las tarjetas de platos en la vista Platos mientras se escribe el nombre,
para encontrar un plato rápido sin recorrer toda la lista.

## Alcance
- Vista afectada: src/components/views/DishesView.jsx
- Solo frontend. No se agrega backend ni base de datos.
- Los datos de los platos siguen viniendo del estado actual (localStorage).

## Requisitos funcionales
1. RF-01: La vista Platos muestra un campo de texto de búsqueda arriba de las tarjetas.
2. RF-02: El campo tiene un texto de ayuda en español: "Buscar plato por nombre".
3. RF-03: Al escribir, las tarjetas se filtran en tiempo real, sin botón de buscar.
4. RF-04: La búsqueda se hace por nombre del plato.
5. RF-05: La búsqueda ignora mayúsculas y minúsculas.
6. RF-06: La búsqueda ignora tildes (por ejemplo, "pique" encuentra "Piqué").
7. RF-07: Si el campo está vacío, se muestran todos los platos.
8. RF-08: Si ningún plato coincide, se muestra el mensaje "No se encontraron platos".
9. RF-09: El filtro no modifica ni borra los datos guardados, solo cambia lo que se muestra.

## Casos límite
- CL-01: Espacios al inicio o al final del texto se ignoran.
- CL-02: Texto solo con espacios se trata como campo vacío.
- CL-03: Texto muy largo no rompe el diseño del campo.
- CL-04: Caracteres especiales (por ejemplo "*" o "(") no causan errores.
- CL-05: Si no hay platos registrados, se muestra el estado vacío que ya existía.

## Criterios de aceptación
- CA-01: Al escribir "sopa", solo se ven los platos cuyo nombre contiene "sopa".
- CA-02: Al escribir "SOPA" o "Sopa" el resultado es el mismo.
- CA-03: Al escribir sin tilde se encuentran platos que sí la tienen.
- CA-04: Al borrar el texto, vuelven a verse todos los platos.
- CA-05: Con un texto sin coincidencias aparece "No se encontraron platos".
- CA-06: Al recargar la página, los platos guardados siguen intactos.

## Fuera de alcance
- Buscar por precio, categoría o ingredientes.
- Ordenar o paginar resultados.
- Guardar el texto de búsqueda al cambiar de vista.