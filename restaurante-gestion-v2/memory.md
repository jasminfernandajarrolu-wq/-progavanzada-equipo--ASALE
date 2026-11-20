# memory.md

## Estado actual
- Buscador de platos en la vista Platos (filtra por nombre, sin tildes ni mayúsculas).
- Frontend en React + Vite.
- Menú lateral y cabecera.
- Portada.
- Vista de platos en tarjetas con fotos.
- Login.
- README actualizado.
- Comandos personalizados SDD creados (/especificar, /clarificar, /planificar, /tareas, /implementar, /validar) y sincronizados en .agents/skills.
- **Backend Flask MVC** en `backend/` con SQLite: entidades Usuario (con rol), Categoria, Plato, Ingrediente, Pedido. 75 tests pasan con pytest y unittest.
- **API conectada al frontend**:
  - `Platos`: `GET /platos`, `POST /platos`, `DELETE /platos/<id>`.
  - `Ingredientes`: `GET /ingredientes`, `POST /ingredientes`, `PUT /ingredientes/<id>`, `DELETE /ingredientes/<id>`.
  - `Categorías`: CRUD completo con `GET`, `POST`, `PUT`, `DELETE /categorias/<id>`, con prevención de borrado 409 si tiene platos y vista React dedicada.
  - `Usuarios`: CRUD completo con `GET`, `POST`, `PUT`, `DELETE /usuarios/<id>`, select de rol (administrador, mesero, cajero), prevención de borrado 409 si tiene pedidos y vista React dedicada.
  - Aviso claro en pantalla en Categorías y Usuarios cuando el servidor backend está desconectado.
  - Fallback transparente a `localStorage` en los módulos locales existentes.
- **seed.py** idempotente carga las 2 categorías, los 8 ingredientes iniciales, los 5 platos típicos bolivianos, los 3 usuarios con roles y 3 pedidos de prueba (ejecutar con `python -m backend.seed`).
- **Plato** tiene campos `imagen` (nombre .jpg) e `ingredientes` (JSON `[["nombre", qty_kg], ...]`).
- **Ingrediente** tiene `id`, `nombre` (UNIQUE), `unidad`, `stock`, `stockMinimo`, `precioUnitario`.
- **Resolución de recetas en tarjetas**: `apiPlatoToLocal` convierte nombres de ingredientes de la API a IDs de `data.ing` usando comparación sin tildes ni mayúsculas (`normalizar()`).

## Aprendizajes
- El agente propone, yo reviso y dirijo.
- Cada cambio pequeño va con su commit.
- Si un cambio deja la pantalla negra, abrir la consola (F12) y leer el error en rojo.
- En Antigravity, los comandos personalizados se definen como Agent Skills con SKILL.md.
- Para resolver nombres→IDs en un `useCallback` sin crear bucles infinitos, usar `setData((prev) => ...)` para acceder al estado actual sin declararlo como dependencia del callback.

## Para levantar el sistema
```powershell
# 1. Seed (solo la primera vez):
python -m backend.seed

# 2. API:
python -m backend.app   # → http://127.0.0.1:5000

# 3. Frontend (otra terminal):
cd restaurante-gestion-v2
pnpm dev                # → http://localhost:5173
```

## Próximos pasos
- Definir la siguiente funcionalidad del sistema para iniciar su ciclo SDD con `/especificar`.
- Posibles candidatos: filtros por categoría o precio en Platos, carrito/comandas en Pedidos, o gestión de insumos.
