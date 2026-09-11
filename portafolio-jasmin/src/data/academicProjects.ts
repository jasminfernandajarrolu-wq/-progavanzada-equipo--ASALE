export interface AcademicProject {
  id: string;
  title: string;
  course: string; // Materia / Asignatura
  semester: string; // Semestre o año
  shortDescription: string;
  fullDescription: string;
  objectives: string[];
  keyFeatures: string[];
  technologies: string[];
  teamSize?: string;
  gradeBadge?: string;
  links: {
    github?: string;
    demo?: string;
    docs?: string;
  };
  accentColor: string;
}

export const academicProjects: AcademicProject[] = [
  {
    id: "sistema-sar",
    title: "Sistema de Gestión de Sistemas para el SAR",
    course: "Programación II",
    semester: "Proyecto de Asignatura",
    shortDescription: "Control de procesos, inventario de infraestructura de sistemas, solicitudes de servicios, control de accesos RBAC y auditoría inmutable de eventos.",
    fullDescription: "Plataforma desarrollada para la materia de Programación II orientada a la administración integral y supervisión de servicios tecnológicos para el SAR. Implementa una gestión centralizada de solicitudes e incidencias, inventario de activos, asignación jerárquica de permisos basada en roles y registro detallado de eventos para auditoría del sistema.",
    objectives: [
      "Aplicar conceptos avanzados de Programación Orientada a Objetos, herencia y polimorfismo.",
      "Implementar un módulo de seguridad y control de accesos por roles (RBAC).",
      "Garantizar la trazabilidad y registro inmutable de transacciones e inventario de infraestructura."
    ],
    keyFeatures: [
      "Control de procesos y flujo de solicitudes de servicios de sistemas.",
      "Inventario detallado de infraestructura y recursos tecnológicos.",
      "Control de accesos basado en roles y permisos jerárquicos (RBAC).",
      "Auditoría inmutable de eventos y bitácora de transacciones del sistema.",
      "Interfaz gráfica moderna y validación estricta de entradas de datos."
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "REST APIs"],
    teamSize: "Proyecto Académico",
    gradeBadge: "Proyecto Destacado",
    links: {
      github: "https://github.com/",
      demo: "#"
    },
    accentColor: "blue"
  },
  {
    id: "sistema-starbucks",
    title: "Sistema de Gestión para una Cafetería de Starbucks",
    course: "Programación I",
    semester: "Proyecto de Asignatura",
    shortDescription: "Punto de venta (POS), toma ágil de órdenes, personalizador de bebidas con cálculo dinámico de costo, panel en vivo para baristas y control de stock de insumos.",
    fullDescription: "Solución de software desarrollada para la asignatura de Programación I orientada al flujo comercial de una cafetería de alta demanda. Abarca el catálogo de productos con personalización en vivo de bebidas (tipo de leche, temperatura, jarabes, tamaño), comanda digital instantánea para baristas, facturación y control de existencias de insumos.",
    objectives: [
      "Diseñar la lógica fundamental de negocio y estructuras algorítmicas de venta.",
      "Construir un módulo de cálculo dinámico de precios y totales con impuestos.",
      "Administrar el stock de insumos y recetas para actualización automática tras cada compra."
    ],
    keyFeatures: [
      "Punto de venta (POS) y toma ágil de órdenes en mostrador.",
      "Personalizador interactivo de bebidas con cálculo dinámico de costo en tiempo real.",
      "Panel en vivo para baristas con estado de preparación de comandas.",
      "Control de stock de insumos básicos (granos de café, jarabes, lácteos, vasos).",
      "Emisión y desglose de comprobantes de pago con arqueo de caja."
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "Node.js", "SQL"],
    teamSize: "Proyecto Académico",
    gradeBadge: "Calificación Sobresaliente",
    links: {
      github: "https://github.com/",
      demo: "#"
    },
    accentColor: "emerald"
  }
];
