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

## 📁 Estructura del Proyecto (Arquitectura React)

```text
restaurante-gestion/
├── index.html                   # Punto de entrada HTML con carga de Vite y fuentes tipográficas
├── package.json                 # Dependencias (React 19, Lucide React, Vite, Rollup)
├── vite.config.js               # Configuración del bundler Vite con plugin oficial de React
├── public/                      # Recursos estáticos
├── src/
│   ├── main.jsx                 # Montaje de la aplicación React en el DOM (#root)
│   ├── App.jsx                  # Componente orquestador, navegación por pestañas y tema
│   ├── index.css                # Sistema de diseño con variables CSS, animaciones y temas
│   ├── data/
│   │   └── seedData.js          # Datos iniciales (semilla), utilidades de formato (Bs) e ID
│   ├── hooks/
│   │   └── useRestaurantState.js# Hook personalizado con la lógica de negocio y persistencia
│   └── components/
│       ├── Header.jsx           # Encabezado institucional con alternador de tema claro/oscuro
│       ├── Navigation.jsx       # Barra de navegación con pestañas e indicador de alertas
│       ├── Modal.jsx            # Componente modal accesible con tecla ESC y backdrop
│       ├── Toast.jsx            # Notificaciones emergentes temporizadas
│       └── views/
│           ├── DashboardView.jsx  # Métricas globales, balance y alertas críticas
│           ├── IngredientsView.jsx# Catálogo de insumos e historial de movimientos
│           ├── DishesView.jsx     # Menú y generador dinámico de escandallos/recetas
│           ├── SuppliersView.jsx  # Directorio y gestión de proveedores
│           ├── OrdersView.jsx     # TPV/Comandera táctil con validación de inventario
│           ├── PurchasesView.jsx  # Registro de compras con impacto en costo y stock
│           ├── FinancesView.jsx   # Libro de ingresos y egresos (flujo de caja)
│           └── ReportsView.jsx    # Inventario valorizado, estadísticas y exportación a PDF
└── README.md                    # Documentación técnica completa
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

- **React 19:** Biblioteca moderna de interfaces de usuario, componentes funcionales, hooks nativos (`useState`, `useEffect`, `useCallback`) y gestión declarativa del estado.
- **Vite 6:** Entorno de compilación ultra-rápido de nueva generación con soporte para Hot Module Replacement (HMR).
- **Lucide React:** Iconografía moderna y consistente para cada acción, estado y flujo de trabajo.
- **CSS3 Moderno:** Variables personalizadas (CSS Custom Properties), diseño flexible (Flexbox y CSS Grid), micro-interacciones, soporte nativo de tema oscuro/claro y reglas `@media print`.
- **Google Fonts:** Tipografías *Bricolage Grotesque* (títulos e identidad) y *Public Sans* (cuerpo de texto).
- **Web Storage API:** Persistencia local reactiva mediante `localStorage` (`rest1`).

---

## 💻 Instrucciones de Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo con Hot Reload:**
   ```bash
   npm run dev
   ```
   Abre en tu navegador la dirección indicada en la terminal (usualmente `http://localhost:5173`).

3. **Compilar para producción (Build optimizado):**
   ```bash
   npm run build
   ```

4. **Previsualizar la versión de producción:**
   ```bash
   npm run preview
   ```

---

## 💾 Persistencia y Datos Semilla

El sistema guarda automáticamente cualquier cambio en la clave `rest1` del `localStorage` del navegador. Si deseas reiniciar la aplicación con los platos y datos iniciales de prueba para demostraciones o defensas del proyecto, ve a la pestaña **Reportes** y haz clic en **"Restablecer datos de ejemplo"**.

---
*Proyecto universitario de demostración - Sistema de Gestión Gastronómica.*
