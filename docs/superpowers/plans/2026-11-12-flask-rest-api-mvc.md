# Plan de Implementación: API REST Flask con Arquitectura MVC

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una API REST completa en Python con Flask y SQLite (`sqlite3`) dentro del directorio `backend/`, con arquitectura MVC, CORS habilitado, CRUD para 4 entidades, 2 reportes agregados, manejo estricto de códigos HTTP (400, 404, 409), suite de pruebas automatizadas y documentación en `README_API.md`.

**Architecture:** Arquitectura Modelo-Vista-Controlador (MVC): `models/` gestiona consultas SQL puras con SQLite y relaciones de clave foránea; `controllers/` gestiona rutas mediante Flask Blueprints y valida entradas; `views/` estandariza payloads JSON para respuestas exitosas y de error; `app.py`, `config.py` y `db.py` orquestan la aplicación, CORS y la base de datos.

**Tech Stack:** Python 3.14+, Flask 3.x, Flask-CORS, SQLite3 (estándar), unittest (estándar).

**Spec:** Especificación provista en el prompt del usuario:
- Entidades: Usuario (id, nombre, correo único), Marca (id, nombre), Producto (id, nombre, precio, idMarca), Venta (id, idUsuario, idProducto).
- CRUD completo para las 4 entidades.
- Reportes: `/reportes/ventas-por-usuario` y `/reportes/productos-por-marca`.
- Validaciones y códigos de error: 400 (bad request), 404 (not found), 409 (conflict/FK).
- Carpeta aislada `backend/`, `README_API.md`, sin modificar el `README.md` principal.

---

## Global Constraints

- Todos los archivos del backend deben ubicarse estrictamente dentro de `backend/`.
- No modificar el archivo `README.md` existente en la raíz.
- Usar el módulo estándar `sqlite3` (sin ORM externos como SQLAlchemy).
- Mantener activas las claves foráneas en SQLite (`PRAGMA foreign_keys = ON;`).
- Habilitar CORS con `flask-cors` en toda la aplicación.
- Respuestas de error consistentes en formato JSON: `{"error": "mensaje", "status": <codigo>}`.

## Review Focus (Casos Límite y Reglas de Negocio)

1. **Borrado con restricción FK (Error 409):** Intentar eliminar una Marca con productos asociados o un Usuario/Producto con ventas registradas debe capturarse como `sqlite3.IntegrityError` y devolver código HTTP 409 Conflict.
2. **Correo duplicado en Usuario (Error 409):** Intentar crear o actualizar un usuario con un correo existente debe devolver código HTTP 409 Conflict.
3. **Referencias a IDs inexistentes en inserción (Error 400 / 404):** Crear un Producto con `idMarca` que no existe o una Venta con `idUsuario`/`idProducto` inexistente debe ser validado o rechazado por integridad referencial devolviendo 404 o 400.
4. **Campos vacíos o tipos erróneos (Error 400):** Cuerpos sin JSON, strings vacíos en nombres, o precio no numérico / negativo deben devolver 400 Bad Request con detalle explicativo.
5. **IDs no encontrados en GET/PUT/DELETE (Error 404):** Consultar, editar o borrar un ID que no existe debe devolver 404 Not Found.

---

### Task 1: Estructura base del proyecto y capa de Base de Datos
**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/config.py`
- Create: `backend/db.py`
- Create: `backend/views/__init__.py`
- Create: `backend/views/response_view.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_db.py`

**Interfaces:**
- `db.get_db_connection(db_path=None)` -> `sqlite3.Connection` con `row_factory = sqlite3.Row` y `PRAGMA foreign_keys = ON`.
- `db.init_db(db_path=None)` -> inicializa el esquema DDL de las 4 tablas e índices.
- `response_view.success_response(data, status=200)` -> `(Response, int)`
- `response_view.error_response(message, status=400)` -> `(Response, int)`

- [ ] **Step 1: Crear `backend/requirements.txt` y `backend/config.py`**
- [ ] **Step 2: Escribir prueba unitaria `test_db.py` que verifique creación de tablas y activación de claves foráneas**
- [ ] **Step 3: Implementar `backend/db.py` y `backend/views/response_view.py`**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_db.py` y validar éxito**

---

### Task 2: Modelo y Controlador de Usuarios (CRUD + 400, 404, 409)
**Files:**
- Create: `backend/models/__init__.py`
- Create: `backend/models/usuario_model.py`
- Create: `backend/controllers/__init__.py`
- Create: `backend/controllers/usuario_controller.py`
- Create: `backend/tests/test_usuarios.py`

**Interfaces:**
- `usuario_model.UsuarioModel`: métodos `get_all()`, `get_by_id(id)`, `create(nombre, correo)`, `update(id, nombre, correo)`, `delete(id)`
- Blueprint `usuario_bp`: `/usuarios` (GET, POST), `/usuarios/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas unitarias en `test_usuarios.py` para GET, POST, PUT, DELETE, correo duplicado (409), datos faltantes (400), no encontrado (404)**
- [ ] **Step 2: Implementar `UsuarioModel` en `backend/models/usuario_model.py`**
- [ ] **Step 3: Implementar `usuario_controller.py` con validación de payloads y códigos 400, 404, 409**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_usuarios.py` y validar éxito**

---

### Task 3: Modelo y Controlador de Marcas (CRUD + 400, 404, 409 al borrar con productos)
**Files:**
- Create: `backend/models/marca_model.py`
- Create: `backend/controllers/marca_controller.py`
- Create: `backend/tests/test_marcas.py`

**Interfaces:**
- `marca_model.MarcaModel`: métodos `get_all()`, `get_by_id(id)`, `create(nombre)`, `update(id, nombre)`, `delete(id)`
- Blueprint `marca_bp`: `/marcas` (GET, POST), `/marcas/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas unitarias en `test_marcas.py` para CRUD de marcas y error 409 si tiene productos dependientes**
- [ ] **Step 2: Implementar `MarcaModel` en `backend/models/marca_model.py`**
- [ ] **Step 3: Implementar `marca_controller.py` con validaciones**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_marcas.py` y validar éxito**

---

### Task 4: Modelo y Controlador de Productos (CRUD + FK a Marca)
**Files:**
- Create: `backend/models/producto_model.py`
- Create: `backend/controllers/producto_controller.py`
- Create: `backend/tests/test_productos.py`

**Interfaces:**
- `producto_model.ProductoModel`: métodos `get_all()`, `get_by_id(id)`, `create(nombre, precio, idMarca)`, `update(id, nombre, precio, idMarca)`, `delete(id)`
- Blueprint `producto_bp`: `/productos` (GET, POST), `/productos/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas unitarias en `test_productos.py` para CRUD, validación de precio positivo (400), idMarca inexistente (404/400), producto no encontrado (404)**
- [ ] **Step 2: Implementar `ProductoModel` en `backend/models/producto_model.py`**
- [ ] **Step 3: Implementar `producto_controller.py` con validaciones de tipos y rangos**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_productos.py` y validar éxito**

---

### Task 5: Modelo y Controlador de Ventas (CRUD + FKs a Usuario y Producto)
**Files:**
- Create: `backend/models/venta_model.py`
- Create: `backend/controllers/venta_controller.py`
- Create: `backend/tests/test_ventas.py`

**Interfaces:**
- `venta_model.VentaModel`: métodos `get_all()`, `get_by_id(id)`, `create(idUsuario, idProducto)`, `update(id, idUsuario, idProducto)`, `delete(id)`
- Blueprint `venta_bp`: `/ventas` (GET, POST), `/ventas/<id>` (GET, PUT, DELETE)

- [ ] **Step 1: Escribir pruebas unitarias en `test_ventas.py` para registro de ventas, validación de foreign keys a usuario y producto inexistentes**
- [ ] **Step 2: Implementar `VentaModel` en `backend/models/venta_model.py`**
- [ ] **Step 3: Implementar `venta_controller.py`**
- [ ] **Step 4: Ejecutar `python -m unittest backend/tests/test_ventas.py` y validar éxito**

---

### Task 6: Controlador y Consultas de Reportes
**Files:**
- Create: `backend/controllers/reporte_controller.py`
- Create: `backend/tests/test_reportes.py`

**Interfaces:**
- GET `/reportes/ventas-por-usuario` -> `[{"idUsuario": int, "nombre": str, "correo": str, "cantidad_ventas": int, "monto_total": float}, ...]`
- GET `/reportes/productos-por-marca` -> `[{"idMarca": int, "nombre_marca": str, "cantidad_productos": int, "productos": [{"id": int, "nombre": str, "precio": float}, ...]}, ...]`

- [ ] **Step 1: Escribir pruebas unitarias en `test_reportes.py` con datos de prueba (usuarios con y sin ventas, marcas con y sin productos)**
- [ ] **Step 2: Implementar `reporte_controller.py` con las consultas de agregación SQL optimizadas**
- [ ] **Step 3: Ejecutar `python -m unittest backend/tests/test_reportes.py` y validar éxito**

---

### Task 7: Integración en `app.py`, CORS, suite completa de pruebas y `README_API.md`
**Files:**
- Create: `backend/app.py`
- Create: `backend/README_API.md`
- Test: Ejecución de toda la suite `backend/tests/`

- [ ] **Step 1: Crear `backend/app.py` integrando Flask, `CORS(app)`, registro de todos los Blueprints y manejo global de errores 404/500 en JSON**
- [ ] **Step 2: Ejecutar la suite completa de pruebas automatizadas: `python -m unittest discover -s backend/tests -p "test_*.py"`**
- [ ] **Step 3: Redactar `backend/README_API.md` con instrucciones paso a paso para Windows (PowerShell/CMD), comandos para instalar dependencias, levantar el servidor y ejemplos `curl` / `Invoke-RestMethod` de cada endpoint**
- [ ] **Step 4: Verificar que el `README.md` de la raíz permanezca 100% inalterado**
