# 🚀 Portafolio Web Personal con Astro

Portafolio web profesional de alto rendimiento desarrollado con **[Astro](https://astro.build)** y **[Tailwind CSS](https://tailwindcss.com)**, optimizado para **Ingeniería de Sistemas**, especialidad en **Ingeniería de Software** y **Desarrollo Web Frontend**.

---

## 📑 Secciones del Portafolio

1. **Inicio / Sobre mí (`#sobre-mi`):**
   - Presentación profesional, rol de Ingeniera de Sistemas y Frontend.
   - Enlace directo a WhatsApp con número de teléfono visible.
   - Perfil destacado, resumen de trayectoria y estadísticas clave.

2. **Proyectos de Materias (`#materias`):**
   - Trabajos y proyectos realizados para clases/asignaturas escolares y universitarias.
   - **Proyecto Insignia:** *Sistema de Punto de Venta y Pedidos para Cafetería Starbucks* (Ingeniería de Software & Arquitectura de Sistemas).
   - *Plataforma de Tutorías Universitarias* (Programación Web).
   - *Sistema de Control Logístico y Almacén* (Bases de Datos).
   - Fichas técnicas interactivas con objetivos de aprendizaje y tecnologías.

3. **Proyectos Personales (`#personales`):**
   - Aplicaciones y soluciones construidas por iniciativa propia.
   - **Proyecto Destacado:** *Sistema Integral de Gestión para Gimnasio 'HyC Fitness'* (Control de socios, membresías, asistencia y métricas).
   - *FinanzTrack: Gestor de Finanzas y Presupuestos*.
   - *DevUI: Biblioteca de Componentes Frontend*.

4. **Stack Tecnológico & Habilidades (`#habilidades`):**
   - Frontend, Backend & Bases de Datos, Herramientas y Metodologías de Ingeniería.

5. **Contacto & Redes (`#contacto`):**
   - Botón directo a WhatsApp con tu número configurable.
   - Botón para copiar correo electrónico en un clic.
   - Enlaces a redes sociales (GitHub, LinkedIn, WhatsApp, Email).

---

## 🛠️ Cómo Iniciar el Proyecto

Desde tu terminal (PowerShell o CMD) dentro de esta carpeta:

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build

# Previsualizar la compilación de producción
npm run preview
```

> **Nota para Windows PowerShell:** Si alguna vez experimentas problemas de permisos de scripts con `npm`, utiliza `npm.cmd run dev`.

---

## ✏️ ¿Cómo Personalizar tus Datos y Proyectos?

Toda la información está separada en archivos TypeScript muy fáciles de editar en la carpeta `src/data/`:

### 1. Tus Datos Personales, Teléfono y Redes
Abre `src/data/personalInfo.ts`:
- **Nombre y biografía:** Modifica `name`, `bio`, `aboutMeLong`.
- **Número de contacto / WhatsApp:** Modifica `phone.display`, `phone.raw` y `phone.whatsappUrl`.
- **Correo:** Modifica `email`.
- **Redes:** Modifica las URLs de `socials` (GitHub, LinkedIn, etc.).

### 2. Tus Proyectos de Materias
Abre `src/data/academicProjects.ts`:
- Puedes modificar el proyecto de **Starbucks**, agregar materias nuevas, semestres, calificaciones o enlaces a tus repositorios.

### 3. Tus Proyectos Personales
Abre `src/data/personalProjects.ts`:
- Puedes actualizar el proyecto del gimnasio **HyC Fitness**, tus enlaces a demos o añadir más proyectos independientes.

---

## 🌐 Estructura de Archivos

```
portfolio-astro/
├── astro.config.mjs          # Configuración de Astro y Tailwind
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración de TypeScript
├── public/
│   └── favicon.svg           # Favicon vectorial moderno
└── src/
    ├── styles/
    │   └── global.css        # Estilos globales y efectos visuales
    ├── data/
    │   ├── personalInfo.ts   # Datos de contacto, teléfono, redes y perfil
    │   ├── academicProjects.ts # Proyectos de materias (Starbucks, etc.)
    │   └── personalProjects.ts # Proyectos personales (HyC Fitness, etc.)
    ├── components/
    │   ├── Navbar.astro      # Barra de navegación responsiva
    │   ├── Hero.astro        # Sección 1: Sobre mí y contacto rápido
    │   ├── AcademicProjects.astro # Sección 2: Materias
    │   ├── PersonalProjects.astro # Sección 3: Proyectos Personales
    │   ├── SkillsSection.astro    # Habilidades y herramientas
    │   ├── ContactSection.astro   # Teléfono, WhatsApp y redes
    │   ├── ProjectModal.astro     # Diálogo modal nativo accesible
    │   └── Footer.astro      # Pie de página
    ├── layouts/
    │   └── Layout.astro      # Plantilla base HTML con metadatos
    └── pages/
        └── index.astro       # Página principal
```
