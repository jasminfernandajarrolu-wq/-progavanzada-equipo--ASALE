# 🍲 Sabores del Altiplano - Sistema de Gestión

Sistema web ligero e interactivo de gestión integral para restaurantes de comida típica boliviana, desarrollado como proyecto universitario. Permite administrar de forma sincronizada el inventario de materias primas, menú de platos con escandallos/recetas, compras a proveedores, ventas en salón (comandas), finanzas (flujo de caja) y reportes ejecutivos.

---

## 📋 Tabla de Contenidos
- [Características Principales](#-características-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos del Sistema](#-módulos-del-sistema)
  - [1. Inicio / Panel Principal (Dashboard)](#1-inicio--panel-principal-dashboard)
  - [2. Ingredientes (Gestión de Inventario)](#2-ingredientes-gestión-de-inventario)
  - [3. Platos (Menú y Recetas)](#3-platos-menú-y-recetas)
  - [4. Proveedores](#4-proveedores)
  - [5. Pedidos (Ventas y Comandas)](#5-pedidos-ventas-y-comandas)
  - [6. Compras de Insumos](#6-compras-de-insumos)
  - [7. Ingresos y Egresos (Finanzas)](#7-ingresos-y-egresos-finanzas)
  - [8. Reportes y Estadísticas](#8-reportes-y-estadísticas)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instrucciones de Instalación y Uso](#-instrucciones-de-instalación-y-uso)
- [Persistencia y Datos Semilla](#-persistencia-y-datos-semilla)

---

## 🚀 Características Principales

- **Descuento Automático de Stock (Escandallo):** Al confirmar un pedido, el sistema calcula los insumos requeridos según la receta de cada plato y descuenta automáticamente las cantidades del inventario.
- **Validación de Disponibilidad:** Bloquea ventas si los insumos requeridos no alcanzan el stock disponible en cocina.
- **Sincronización Financiera:** Las compras a proveedores se registran automáticamente como egresos, y los pedidos pagados ingresan como ingresos al flujo de caja.
- **Diseño Adaptativo y Modo Oscuro:** Interfaz optimizada para móviles, tablets y computadoras, con soporte nativo para tema claro y oscuro según las preferencias del sistema operativo.
- **Persistencia en LocalStorage:** No requiere configuración de servidores de bases de datos pesados; la información se conserva automáticamente en el navegador.
- **Listo para Imprimir / PDF:** Hoja de estilos con reglas `@media print` para exportar reportes limpios sin botones ni barras de navegación.

---

## 📁 Estructura del Proyecto

```text
restaurante-gestion/
│
├── index.html       # Estructura semántica HTML5 de la aplicación
├── styles.css       # Estilos visuales, variables CSS, temas (claro/oscuro) y diseño responsivo
├── app.js           # Lógica del sistema, control de estado, navegación y persistencia
├── restaurante.html # Archivo original consolidado (respaldo inicial)
└── README.md        # Documentación completa del proyecto
```

---

## 📦 Módulos del Sistema

### 1. Inicio / Panel Principal (Dashboard)
- **Métricas Globales:** Indicadores clave de desempeño financiero en tiempo real:
  - Total de Ingresos (Bs).
  - Total de Egresos (Bs).
  - Balance Neto (Ingresos menos Egresos).
  - Contador de alertas de stock mínimo.
- **Ingredientes por Reponer:** Tabla de alerta temprana que resalta los insumos cuyo stock está en o por debajo de su umbral mínimo permitido.
- **Últimos Pedidos:** Resumen de las comandas más recientes registradas con número de orden, mesa, total y fecha.

### 2. Ingredientes (Gestión de Inventario)
- Catálogo detallado de materias primas e insumos (ej. Charque, Papa, Maíz mote, Carne de res, Pollo, Arroz, Ají amarillo, Maní).
- Monitoreo de unidad de medida (`kg`, `l`, `unid`), stock disponible, punto de reposición (stock mínimo) y costo unitario promedio en Bolivianos (`Bs`).
- Etiquetas de estado visuales: `Normal` (verde) y `Reponer` (rojo).
- **Control de Movimientos:**
  - **Entrada:** Registro manual de recepciones de producto.
  - **Salida:** Mermas, desperdicios o consumos extraordinarios de cocina.
  - **Ajuste:** Corrección por inventario físico / conteo real.
- **Historial de Movimientos:** Auditoría cronológica de los últimos 15 movimientos con fecha, ingrediente, tipo de transacción, cantidad y observaciones.

### 3. Platos (Menú y Recetas)
- Catálogo de especialidades gastronómicas bolivianas precargadas (Pique macho, Sopa de maní, Silpancho, Fricasé, Charquekan).
- Configuración de precio de venta al público en Bolivianos (`Bs`).
- Visualización de la receta asociada a cada plato (ingredientes y proporciones requeridas por porción).
- Capacidad para crear nuevos platos asociando múltiples ingredientes del inventario con sus respectivas cantidades.

### 4. Proveedores
- Directorio de proveedores de insumos comerciales (ej. Mercado Rodríguez, Avícola Los Andes).
- Registro de nombre del proveedor y teléfono de contacto para reposición rápida.
- Soporte para agregar y dar de baja proveedores.

### 5. Pedidos (Ventas y Comandas)
- Pantalla táctil de comanda para salón y atención al cliente.
- Botones incrementales (`+` / `−`) para seleccionar cantidades por plato en tiempo real.
- Asignación de mesa o nombre de cliente (ej. `Mesa 4`, `Para llevar`).
- Verificación automática de stock: si algún ingrediente no alcanza para la cantidad solicitada, alerta al usuario y no permite registrar la orden.
- Al procesar la orden:
  1. Descuenta automáticamente los ingredientes del inventario según receta.
  2. Registra el egreso de stock en el historial de movimientos de insumos.
  3. Suma el monto facturado a los ingresos financieros.
  4. Agrega la comanda al historial de ventas con fecha y desglose.

### 6. Compras de Insumos
- Registro de compra de materias primas a proveedores registrados.
- Selección de proveedor, ingrediente a abastecer, cantidad adquirida y costo total pagado (`Bs`).
- Actualización automática de:
  - Entrada de stock al inventario.
  - Recálculo del costo unitario del ingrediente.
  - Registro inmediato del egreso en el módulo financiero.

### 7. Ingresos y Egresos (Finanzas)
- Registro cronológico del flujo de caja del negocio.
- Visualización discriminada de entradas (ventas automáticas e ingresos extraordinarios) y salidas (compras de insumos y gastos operativos).
- Muestra el balance general consolidado.
- Permite la creación manual de registros financieros (ej. pago de servicios básicos, alquileres, propinas, etc.).

### 8. Reportes y Estadísticas
- **Inventario Valorizado:** Cálculo del capital inmovilizado en insumos (Stock actual × Costo unitario) con sumatoria total en Bs.
- **Ventas por Plato:** Desglose del volumen de unidades vendidas y recaudación total generada por cada ítem del menú.
- **Resumen Financiero:** Comparativa directa de Ventas Totales vs. Compras Totales vs. Balance Neto.
- **Imprimir / Exportar a PDF:** Formato listo para impresión física o guardado en PDF para rendición de cuentas universitaria.
- **Restablecimiento del Sistema:** Opción para reiniciar la base de datos a sus valores iniciales con datos de ejemplo (seed data).

---

## 🛠 Tecnologías Utilizadas

- **HTML5:** Semántica web moderna (`<header>`, `<nav>`, `<main>`, `<dialog>`, etc.).
- **CSS3 (Vanilla):** Variables personalizadas (CSS Custom Properties), diseño flexible (Flexbox y CSS Grid), micro-interacciones, diseño responsivo y reglas `@media print`.
- **JavaScript (Vanilla ES6+):** Programación reactiva simple mediante renderizado declarativo, manipulación del DOM nativa, validaciones y cálculos matemáticos.
- **Google Fonts:** Tipografías modernas *Bricolage Grotesque* (títulos) y *Public Sans* (cuerpo de texto).
- **Web Storage API:** Persistencia local mediante `localStorage`.

---

## 💻 Instrucciones de Instalación y Uso

No requiere servidores backend complejos ni configuración de base de datos externa:

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/restaurante-gestion.git
   cd restaurante-gestion
   ```
2. **Abrir en el navegador:**
   - Haz doble clic directamente sobre `index.html`, o
   - Ábrelo desde tu editor favorito con extensiones como *Live Server*, o
   - Con Node.js usando un servidor estático:
     ```bash
     npx serve .
     ```
3. **Acceder:** Abre tu navegador web en `http://localhost:3000` (o la dirección que indique tu servidor local).

---

## 💾 Persistencia y Datos Semilla

El sistema guarda automáticamente cualquier cambio en la clave `rest1` del `localStorage` del navegador. Si deseas reiniciar la aplicación con los platos y datos iniciales de prueba para demostraciones o defensas del proyecto, ve a la pestaña **Reportes** y haz clic en **"Restablecer datos de ejemplo"**.

---
*Proyecto universitario de demostración - Sistema de Gestión Gastronómica.*
