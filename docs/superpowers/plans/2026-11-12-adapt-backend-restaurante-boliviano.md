# Plan de Implementación: Adaptación del Backend a Restaurante de Comida Típica Boliviana (Sabores Bolivianos)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorizar y adaptar el backend existente en `backend/` para el sistema gastronómico de restaurante boliviano, actualizando las entidades a Categoria, Plato, Pedido (con cantidad) y Usuario (con roles: administrador, mesero, cajero), ajustando endpoints, reportes, suite de pruebas y documentación sin modificar el `README.md` principal.

**Architecture:** MVC estricto: `models/` con consultas SQL puras (`sqlite3`), `controllers/` con Blueprints y validaciones HTTP, `views/` con formateo JSON estandarizado, claves foráneas `PRAGMA foreign_keys = ON` y CORS habilitado.

**Tech Stack:** Python 3.14+, Flask 3.1, Flask-Cors 5.0, SQLite3, unittest.

---

## Global Constraints

- Todos los cambios deben realizarse dentro de `backend/`.
- No modificar el archivo `README.md` de la raíz del proyecto.
- Eliminar de forma limpia los archivos antiguos reemplazados (`marca_*`, `producto_*`, `venta_*`).
- Entidades actualizadas:
  - `Usuario`: `id`, `nombre`, `correo` (UNIQUE), `rol` (`'administrador'`, `'mesero'`, `'cajero'`).
  - `Categoria`: `id`, `nombre`.
  - `Plato`: `id`, `nombre`, `precio`, `idCategoria` (FK a Categoria, ON DELETE RESTRICT).
  - `Pedido`: `id`, `idUsuario` (FK a Usuario), `idPlato` (FK a Plato), `cantidad` (INTEGER > 0).
- Endpoints:
  - `/usuarios`
  - `/categorias`
  - `/platos`
  - `/pedidos`
  - `/reportes/pedidos-por-usuario` (cantidad de pedidos y monto total = SUM(precio * cantidad))
  - `/reportes/platos-por-categoria` (cantidad y lista de platos por categoría)
- Validaciones y códigos de error: 400 (Bad Request), 404 (Not Found), 409 (Conflict).

---

## Review Focus (Casos Límite y Reglas de Negocio)

1. **Validación de rol en Usuario (400):** Si `rol` no es `'administrador'`, `'mesero'` o `'cajero'`, devolver 400 Bad Request.
2. **Validación de cantidad en Pedido (400):** `cantidad` debe ser un entero > 0.
3. **Monto total en reporte de pedidos:** El monto debe calcularse como `COALESCE(SUM(p.precio * ped.cantidad), 0.0)`.
4. **Borrado con restricción FK (409):**
   - Borrar categoría con platos asociados -> 409.
   - Borrar plato con pedidos asociados -> 409.
   - Borrar usuario con pedidos asociados -> 409.
5. **IDs no encontrados (404) y correo duplicado (409).**

---

### Task 1: Esquema de Base de Datos y Pruebas DDL (`db.py` y `test_db.py`)
**Files:**
- Modify: `backend/db.py`
- Modify: `backend/tests/test_db.py`

**Interfaces:**
- Tablas SQLite: `Usuario`, `Categoria`, `Plato`, `Pedido`.
- Claves foráneas activas y restricción `CHECK(rol IN ('administrador', 'mesero', 'cajero'))`.

- [ ] **Step 1: Escribir pruebas en `test_db.py` verificando las nuevas tablas `Categoria`, `Plato`, `Pedido` y la restricción de `rol`**
- [ ] **Step 2: Actualizar `SCHEMA_SQL` en `backend/db.py` con las 4 nuevas tablas**
- [ ] **Step 3: Ejecutar `python -m unittest backend/tests/test_db.py` y validar éxito**

---

### Task 2: Usuario con Campo `rol` (Modelo, Controlador y Pruebas)
**Files:**
- Modify: `backend/models/usuario_model.py`
- Modify: `backend/controllers/usuario_controller.py`
- Modify: `backend/tests/test_usuarios.py`

**Interfaces:**
- `UsuarioModel`: `create(nombre, correo, rol)`, `update(id, nombre, correo, rol)`.
- Validar `rol` en `usuario_controller.py`: debe ser uno de `['administrador', 'mesero', 'cajero']`.

- [ ] **Step 1: Actualizar `test_usuarios.py` para validar inclusión de `rol`, rechazo de rol inválido (400), y CRUD completo**
- [ ] **Step 2: Actualizar `UsuarioModel` en `backend/models/usuario_model.py`**
- [ ] **Step 3: Actualizar `backend/controllers/usuario_controller.py` con validación de `rol`**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_usuarios.py` y validar éxito**

---

### Task 3: Categoria (Modelo, Controlador y Pruebas)
**Files:**
- Create: `backend/models/categoria_model.py`
- Create: `backend/controllers/categoria_controller.py`
- Create: `backend/tests/test_categorias.py`
- Delete: `backend/models/marca_model.py`, `backend/controllers/marca_controller.py`, `backend/tests/test_marcas.py`

**Interfaces:**
- `CategoriaModel`: `get_all()`, `get_by_id(id)`, `create(nombre)`, `update(id, nombre)`, `delete(id)`
- Blueprint `categoria_bp`: `/categorias` (GET, POST), `/categorias/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas en `test_categorias.py` (CRUD y error 409 al borrar categoría con platos asociados)**
- [ ] **Step 2: Implementar `CategoriaModel` y `categoria_controller.py`**
- [ ] **Step 3: Eliminar archivos antiguos de `marca`**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_categorias.py` y validar éxito**

---

### Task 4: Plato (Modelo, Controlador y Pruebas)
**Files:**
- Create: `backend/models/plato_model.py`
- Create: `backend/controllers/plato_controller.py`
- Create: `backend/tests/test_platos.py`
- Delete: `backend/models/producto_model.py`, `backend/controllers/producto_controller.py`, `backend/tests/test_productos.py`

**Interfaces:**
- `PlatoModel`: `get_all()`, `get_by_id(id)`, `create(nombre, precio, idCategoria)`, `update(id, nombre, precio, idCategoria)`, `delete(id)`
- Blueprint `plato_bp`: `/platos` (GET, POST), `/platos/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas en `test_platos.py` (CRUD, validación de precio > 0, idCategoria existente, error 409 al borrar si tiene pedidos)**
- [ ] **Step 2: Implementar `PlatoModel` y `plato_controller.py`**
- [ ] **Step 3: Eliminar archivos antiguos de `producto`**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_platos.py` y validar éxito**

---

### Task 5: Pedido con `cantidad` (Modelo, Controlador y Pruebas)
**Files:**
- Create: `backend/models/pedido_model.py`
- Create: `backend/controllers/pedido_controller.py`
- Create: `backend/tests/test_pedidos.py`
- Delete: `backend/models/venta_model.py`, `backend/controllers/venta_controller.py`, `backend/tests/test_ventas.py`

**Interfaces:**
- `PedidoModel`: `get_all()`, `get_by_id(id)`, `create(idUsuario, idPlato, cantidad)`, `update(id, idUsuario, idPlato, cantidad)`, `delete(id)`
- Blueprint `pedido_bp`: `/pedidos` (GET, POST), `/pedidos/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas en `test_pedidos.py` (CRUD, validación de cantidad > 0, idUsuario/idPlato existentes, error 409 en borrado de usuario/plato dependiente)**
- [ ] **Step 2: Implementar `PedidoModel` y `pedido_controller.py`**
- [ ] **Step 3: Eliminar archivos antiguos de `venta`**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_pedidos.py` y validar éxito**

---

### Task 6: Reportes de Restaurante (Ventas -> Pedidos por Usuario y Platos por Categoría)
**Files:**
- Modify: `backend/controllers/reporte_controller.py`
- Modify: `backend/tests/test_reportes.py`

**Interfaces:**
- `GET /reportes/pedidos-por-usuario` -> `[{"idUsuario": int, "nombre": str, "correo": str, "rol": str, "cantidad_pedidos": int, "monto_total": float}, ...]`
- `GET /reportes/platos-por-categoria` -> `[{"idCategoria": int, "nombre_categoria": str, "cantidad_platos": int, "platos": [{"id": int, "nombre": str, "precio": float}, ...]}, ...]`

- [ ] **Step 1: Escribir pruebas en `test_reportes.py` calculando pedidos con cantidades y montos acumulados**
- [ ] **Step 2: Actualizar `reporte_controller.py` con las nuevas rutas y consultas SQL de agregación**
- [ ] **Step 3: Ejecutar `python -m unittest backend/tests/test_reportes.py` y validar éxito**

---

### Task 7: Integración en `app.py`, Suite Completa y `README_API.md`
**Files:**
- Modify: `backend/app.py`
- Modify: `backend/tests/test_app.py`
- Modify: `backend/README_API.md`
- Remove: `backend/database.sqlite3` antigua (para que se regenere con el nuevo DDL limpio)

- [ ] **Step 1: Actualizar `backend/app.py` registrando `categoria_bp`, `plato_bp`, `pedido_bp` y la ruta informativa `/`**
- [ ] **Step 2: Actualizar `test_app.py` y ejecutar toda la suite de pruebas**
- [ ] **Step 3: Actualizar `backend/README_API.md` con las nuevas entidades, ejemplos de platos típicos bolivianos (Silpancho, Sopa de Maní, etc.), roles y endpoints**
- [ ] **Step 4: Verificar que el `README.md` original siga intacto**
