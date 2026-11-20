# 🍲 Sabores Bolivianos

Sistema de gestión para un restaurante de comida típica boliviana, desarrollado como proyecto de la materia **Programación Avanzada**.

## Integrantes

- Jasmin Fernanda Jarro Lupa
- [Otros integrantes, si hay]

## Funcionalidades

- **Inicio:** resumen de ingresos, egresos, balance y alertas de stock.
- **Ingredientes:** inventario con movimientos de entrada y salida.
- **Platos:** registro de platos típicos.
- **Proveedores:** directorio de proveedores.
- **Pedidos:** registro de pedidos por mesa o cliente.
- **Compras:** registro de compras de insumos.
- **Ingresos y egresos:** control financiero.
- **Reportes:** inventario valorizado, ventas por plato y resumen ejecutivo.
- Modo claro y modo oscuro.

## Tecnologías

- React
- Vite
- CSS
- Lucide React (íconos)

## Cómo ejecutar el proyecto

1. Clonar el repositorio:

```bash
   git clone https://github.com/jasminfernandajarrolu-wq/-progavanzada-equipo--ASALE.git
```

2. Entrar a la carpeta del proyecto:

```bash
   cd -progavanzada-equipo--ASALE/restaurante-gestion-v2
```

3. Instalar dependencias:

```bash
   npm install
```

4. Iniciar el servidor de desarrollo:

```bash
   npm run dev
```

5. Abrir en el navegador la dirección que aparece, normalmente `http://localhost:5173`.

## Estado del proyecto

Por ahora el proyecto incluye el frontend y el backend conectado con SQLite.

## Cómo ejecutar el proyecto

El proyecto tiene dos partes: el backend (Flask + SQLite) y el frontend (React + Vite). Hay que correr las dos, cada una en su terminal.

### Requisitos
- Python 3
- Node.js

### 1. Backend (primera terminal)

Desde la raíz del repositorio:

```bash
pip install -r backend/requirements.txt
python -m backend.seed
python -m backend.app
```

- `python -m backend.seed` carga los platos de ejemplo en la base de datos. No duplica si se ejecuta dos veces.
- `python -m backend.app` inicia la API en `http://127.0.0.1:5000`. Dejar esta terminal abierta.

### 2. Frontend (segunda terminal)

```bash
cd restaurante-gestion-v2
npm install
npm run dev
```

Abrir en el navegador `http://localhost:5173`.

### Tests del backend

```bash
python -m pytest backend/tests
```

## Estructura

- `backend/`: API REST en Flask con base de datos SQLite.
- `restaurante-gestion-v2/`: frontend en React (Sabores Bolivianos).
- `restaurante-gestion/`: primera versión del frontend.
- `portafolio-jasmin/`: portafolio personal.
