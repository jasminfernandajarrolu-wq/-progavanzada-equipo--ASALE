# 🍲 API REST - Sabores Bolivianos (Arquitectura MVC)

API REST desarrollada con **Python**, **Flask** y **SQLite (`sqlite3`)**, diseñada bajo la arquitectura **Modelo-Vista-Controlador (MVC)**, con soporte para CORS (`flask-cors`) y relaciones de integridad referencial para el sistema de gestión del restaurante de comida típica boliviana **Sabores Bolivianos**.

---

## 📁 Estructura del Proyecto

```text
backend/
├── app.py                      # Punto de entrada, configuración de Flask y CORS
├── config.py                   # Configuración del entorno y ruta de la base de datos
├── db.py                       # Conexión sqlite3 con claves foráneas activas (PRAGMA foreign_keys = ON)
├── seed.py                     # Script idempotente para cargar los 5 platos iniciales
├── requirements.txt            # Dependencias del proyecto (Flask, Flask-Cors)
├── README_API.md               # Esta documentación
├── models/                     # Capa de Modelo (Acceso a datos con SQL puro)
│   ├── usuario_model.py        # Entidad Usuario con roles (administrador, mesero, cajero)
│   ├── categoria_model.py      # Entidad Categoria
│   ├── plato_model.py          # Entidad Plato (con FK a Categoria, imagen e ingredientes)
│   └── pedido_model.py         # Entidad Pedido (con FKs a Usuario y Plato, más cantidad)
├── views/                      # Capa de Vista (Estandarización de respuestas JSON)
│   └── response_view.py
├── controllers/                # Capa de Controladores (Blueprints y validaciones)
│   ├── usuario_controller.py   # Rutas y validaciones para /usuarios
│   ├── categoria_controller.py # Rutas y validaciones para /categorias
│   ├── plato_controller.py     # Rutas y validaciones para /platos
│   ├── pedido_controller.py    # Rutas y validaciones para /pedidos
│   └── reporte_controller.py   # Rutas para reportes de pedidos y platos
└── tests/                      # Suite de pruebas automatizadas (unittest)
    ├── test_app.py
    ├── test_db.py
    ├── test_usuarios.py
    ├── test_categorias.py
    ├── test_platos.py
    ├── test_pedidos.py
    ├── test_reportes.py
    └── test_seed.py
```

---

## 🗄️ Entidades y Relaciones

- **Usuario:** `id` (PK), `nombre`, `correo` (UNIQUE), `rol` (`'administrador'`, `'mesero'`, `'cajero'`).
- **Categoria:** `id` (PK), `nombre`.
- **Plato:** `id` (PK), `nombre`, `precio`, `idCategoria` (FK a Categoria, ON DELETE RESTRICT), `imagen` (nombre de archivo `.jpg`), `ingredientes` (JSON array `[["nombre", cantidad_kg], ...]`).
- **Pedido:** `id` (PK), `idUsuario` (FK a Usuario, ON DELETE RESTRICT), `idPlato` (FK a Plato, ON DELETE RESTRICT), `cantidad` (INTEGER > 0).

---

## 🌱 Cargar Datos Iniciales (Seed)

El script `backend/seed.py` carga los 5 platos bolivianos de la carta con sus categorías, imagen e ingredientes. Es **idempotente**: si se ejecuta dos veces no duplica datos.

```powershell
# Desde la raíz del repositorio:
python -m backend.seed
```

Salida esperada (primera vez):
```
=== Seed: Restaurante Sabores Bolivianos ===
  [+] Categoría creada: Platos fuertes
  [+] Categoría creada: Sopas
  [+] Plato creado: Pique macho (Bs 55.00)
  [+] Plato creado: Sopa de maní (Bs 30.00)
  ...
Categorías creadas : 2
Platos creados     : 5
Platos omitidos    : 0
===========================================
```

Platos que se cargan:

| Nombre | Precio | Categoría | Imagen |
|---|---|---|---|
| Pique macho | Bs 55.00 | Platos fuertes | pique-macho.jpg |
| Sopa de maní | Bs 30.00 | Sopas | sopa-de-mani.jpg |
| Silpancho | Bs 35.00 | Platos fuertes | silpancho.jpg |
| Fricasé | Bs 40.00 | Platos fuertes | fricase.jpg |
| Charquekan | Bs 50.00 | Platos fuertes | charquekan.jpg |

---

## ⚙️ Requisitos Previos e Instalación en Windows

### 1. Requisitos
- Python 3.10 o superior instalado y agregado al `PATH`.

### 2. Crear entorno virtual (Opcional pero recomendado)
En **PowerShell** o **CMD**:
```powershell
python -m venv venv
.\venv\Scripts\activate
```

### 3. Instalar Dependencias
Desde la raíz del repositorio o dentro de `backend/`:
```powershell
pip install -r backend/requirements.txt
```

---

## ▶️ Cómo Ejecutar la API en Windows

Desde la raíz del repositorio:
```powershell
python -m backend.app
```

O entrando a la carpeta `backend`:
```powershell
cd backend
python app.py
```

El servidor iniciará en:
```text
http://127.0.0.1:5000/
```

La base de datos SQLite `database.sqlite3` se crea automáticamente con las 4 tablas e índices necesarios.

---

## 🧪 Ejecución de la Suite de Pruebas

Para ejecutar las 52 pruebas automatizadas:
```powershell
python -m unittest discover -s backend/tests -p "test_*.py" -v
```

---

## 📡 Documentación y Ejemplos de Endpoints

### 1. Usuarios (`/usuarios`)
Los usuarios representan al personal del restaurante y requieren un rol válido: `'administrador'`, `'mesero'` o `'cajero'`.

#### 📋 Listar usuarios
- **Método:** `GET /usuarios`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/usuarios" -Method GET
  ```
- **cURL:**
  ```bash
  curl -X GET http://127.0.0.1:5000/usuarios
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "datos": [
      {"id": 1, "nombre": "Jasmin Jarro", "correo": "jasmin@sabores.bo", "rol": "administrador"}
    ]
  }
  ```

#### 🔍 Obtener usuario por ID
- **Método:** `GET /usuarios/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/usuarios/1" -Method GET
  ```

#### ➕ Crear usuario
- **Método:** `POST /usuarios`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/usuarios" -Method POST -ContentType "application/json" -Body '{"nombre": "Carlos Rojas", "correo": "carlos@sabores.bo", "rol": "mesero"}'
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "mensaje": "Usuario creado exitosamente",
    "datos": {"id": 2, "nombre": "Carlos Rojas", "correo": "carlos@sabores.bo", "rol": "mesero"}
  }
  ```
- **Errores posibles:**
  - `400 Bad Request`: Si falta el nombre, correo o si el rol no es `'administrador'`, `'mesero'` o `'cajero'`.
  - `409 Conflict`: Si el correo ya existe.

#### ✏️ Actualizar usuario
- **Método:** `PUT /usuarios/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/usuarios/2" -Method PUT -ContentType "application/json" -Body '{"nombre": "Carlos Rojas P.", "correo": "carlos.p@sabores.bo", "rol": "cajero"}'
  ```

#### ❌ Eliminar usuario
- **Método:** `DELETE /usuarios/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/usuarios/2" -Method DELETE
  ```
- **Errores posibles:**
  - `404 Not Found`: Si el usuario no existe.
  - `409 Conflict`: Si el usuario tiene pedidos registrados en el restaurante.

---

### 2. Categorías (`/categorias`)
Agrupa las preparaciones culinarias (ej. *Platos Típicos*, *Sopas Tradicionales*, *Bebidas y Refrescos*).

#### 📋 Listar categorías
- **Método:** `GET /categorias`

#### 🔍 Obtener categoría por ID
- **Método:** `GET /categorias/<id>`

#### ➕ Crear categoría
- **Método:** `POST /categorias`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/categorias" -Method POST -ContentType "application/json" -Body '{"nombre": "Platos Fuertes"}'
  ```

#### ✏️ Actualizar categoría
- **Método:** `PUT /categorias/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/categorias/1" -Method PUT -ContentType "application/json" -Body '{"nombre": "Platos Típicos Tradicionales"}'
  ```

#### ❌ Eliminar categoría
- **Método:** `DELETE /categorias/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/categorias/1" -Method DELETE
  ```
- **Errores posibles:**
  - `404 Not Found`: Si la categoría no existe.
  - `409 Conflict`: **Si la categoría tiene platos asociados** (ej. *"No se puede eliminar la categoría con id 1 porque tiene platos asociados"*).

---

### 3. Platos (`/platos`)
Representa cada plato típico del menú (ej. *Silpancho*, *Pique Macho*, *Sopa de Maní*, *Majadito*).

#### 📋 Listar platos
- **Método:** `GET /platos`
- **Respuesta (200 OK):**
  ```json
  {
    "datos": [
      {
        "id": 1,
        "nombre": "Silpancho Cochabambino",
        "precio": 35.00,
        "idCategoria": 1,
        "categoria_nombre": "Platos Fuertes"
      }
    ]
  }
  ```

#### 🔍 Obtener plato por ID
- **Método:** `GET /platos/<id>`

#### ➕ Crear plato
- **Método:** `POST /platos`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/platos" -Method POST -ContentType "application/json" -Body '{"nombre": "Pique Macho", "precio": 55.00, "idCategoria": 1}'
  ```
- **Errores posibles:**
  - `400 Bad Request`: Si el precio <= 0 o faltan campos obligatorios.
  - `404 Not Found`: Si `idCategoria` no existe en la base de datos.

#### ✏️ Actualizar plato
- **Método:** `PUT /platos/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/platos/1" -Method PUT -ContentType "application/json" -Body '{"nombre": "Silpancho Especial", "precio": 38.00, "idCategoria": 1}'
  ```

#### ❌ Eliminar plato
- **Método:** `DELETE /platos/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/platos/1" -Method DELETE
  ```
- **Errores posibles:**
  - `404 Not Found`: Si el plato no existe.
  - `409 Conflict`: Si el plato tiene pedidos registrados.

---

### 4. Pedidos (`/pedidos`)
Registra las comandas atendidas por meseros o cobradas por cajeros. Incluye el campo obligatorio `cantidad` (> 0).

#### 📋 Listar pedidos
- **Método:** `GET /pedidos`
- **Respuesta (200 OK):**
  ```json
  {
    "datos": [
      {
        "id": 1,
        "idUsuario": 2,
        "usuario_nombre": "Carlos Rojas",
        "usuario_correo": "carlos@sabores.bo",
        "usuario_rol": "mesero",
        "idPlato": 1,
        "plato_nombre": "Silpancho Cochabambino",
        "plato_precio": 35.00,
        "idCategoria": 1,
        "cantidad": 3,
        "subtotal": 105.00
      }
    ]
  }
  ```

#### 🔍 Obtener pedido por ID
- **Método:** `GET /pedidos/<id>`

#### ➕ Registrar pedido
- **Método:** `POST /pedidos`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/pedidos" -Method POST -ContentType "application/json" -Body '{"idUsuario": 2, "idPlato": 1, "cantidad": 2}'
  ```
- **Errores posibles:**
  - `400 Bad Request`: Si la cantidad es <= 0 o faltan campos.
  - `404 Not Found`: Si `idUsuario` o `idPlato` no existen.

#### ✏️ Actualizar pedido
- **Método:** `PUT /pedidos/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/pedidos/1" -Method PUT -ContentType "application/json" -Body '{"idUsuario": 2, "idPlato": 1, "cantidad": 4}'
  ```

#### ❌ Eliminar pedido
- **Método:** `DELETE /pedidos/<id>`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/pedidos/1" -Method DELETE
  ```

---

### 5. Reportes (`/reportes`)

#### 📊 Reporte 1: Pedidos por Usuario
Calcula la cantidad de pedidos y el monto total acumulado por cada usuario considerando `precio * cantidad`.
- **Método:** `GET /reportes/pedidos-por-usuario`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/reportes/pedidos-por-usuario" -Method GET
  ```
- **cURL:**
  ```bash
  curl -X GET http://127.0.0.1:5000/reportes/pedidos-por-usuario
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "datos": [
      {
        "idUsuario": 2,
        "nombre": "Carlos Rojas",
        "correo": "carlos@sabores.bo",
        "rol": "mesero",
        "cantidad_pedidos": 5,
        "monto_total": 245.00
      },
      {
        "idUsuario": 1,
        "nombre": "Jasmin Jarro",
        "correo": "jasmin@sabores.bo",
        "rol": "administrador",
        "cantidad_pedidos": 0,
        "monto_total": 0.00
      }
    ]
  }
  ```

#### 📊 Reporte 2: Platos por Categoría
Devuelve la cantidad de platos y la lista detallada agrupada por cada categoría culinaria.
- **Método:** `GET /reportes/platos-por-categoria`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:5000/reportes/platos-por-categoria" -Method GET
  ```
- **cURL:**
  ```bash
  curl -X GET http://127.0.0.1:5000/reportes/platos-por-categoria
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "datos": [
      {
        "idCategoria": 1,
        "nombre_categoria": "Platos Fuertes",
        "cantidad_platos": 2,
        "platos": [
          {"id": 1, "nombre": "Silpancho Cochabambino", "precio": 35.00},
          {"id": 2, "nombre": "Pique Macho", "precio": 55.00}
        ]
      },
      {
        "idCategoria": 2,
        "nombre_categoria": "Bebidas",
        "cantidad_platos": 0,
        "platos": []
      }
    ]
  }
  ```

---

## 🛡️ Formato Estándar de Errores

Todos los errores devuelven un objeto JSON con el siguiente formato uniforme:
```json
{
  "codigo": 400,
  "error": "El rol 'gerente' no es válido. Los roles permitidos son: administrador, mesero, cajero"
}
```

- **`400 Bad Request`:** Cuerpo no JSON, rol no permitido, precio <= 0, cantidad <= 0 o campos obligatorios vacíos.
- **`404 Not Found`:** Recurso no encontrado por ID, o claves foráneas inexistentes (`idCategoria`, `idUsuario`, `idPlato`).
- **`409 Conflict`:** Restricción de unicidad violada (correo ya registrado) o restricción de clave foránea (intentar eliminar una categoría con platos, o un usuario/plato con pedidos).
