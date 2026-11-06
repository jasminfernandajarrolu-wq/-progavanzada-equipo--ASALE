// Lógica de búsqueda de platos (sin interfaz).

// Pasa a minúsculas, quita tildes y espacios al inicio y al final.
export function normalizeText(text) {
    return String(text ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Devuelve los platos cuyo nombre CONTIENE el texto buscado.
// Si el texto está vacío, devuelve todos los platos.
// No modifica el arreglo original.
export function filterDishes(dishes, searchText) {
    const query = normalizeText(searchText);
    if (!query) return dishes;
    return dishes.filter((dish) => normalizeText(dish.n).includes(query));
}