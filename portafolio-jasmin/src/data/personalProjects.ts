export interface PersonalProject {
  id: string;
  title: string;
  subtitle: string;
  status: 'Completado' | 'En Desarrollo' | 'En Producción';
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  technologies: string[];
  links: {
    github?: string;
    demo?: string;
    liveUrl?: string;
  };
  featured: boolean;
  accentColor: string;
  iconName: string;
  bannerTag: string;
}

export const personalProjects: PersonalProject[] = [
  {
    id: "sistema-hyc-fitness",
    title: "Sistema de Gestión para el Gimnasio HyC Fitness",
    subtitle: "Estructura de Datos - Programación III",
    status: "Completado",
    shortDescription: "Administración integral de socios, control de planes y vencimientos de membresías, validación rápida de acceso diario en recepción y dashboard financiero.",
    fullDescription: "Sistema integral desarrollado aplicando principios avanzados de estructuras de datos (listas enlazadas, árboles de búsqueda, tablas hash) y Programación III para la optimización de procesos del gimnasio HyC Fitness. Garantiza búsquedas en tiempo constante para socios en recepción, control automatizado de vencimiento de suscripciones y métricas de rendimiento.",
    highlights: [
      "Administración integral de socios: registro, expedientes, historial de pagos y estados.",
      "Control de planes y vencimientos automáticos de membresías con alertas preventivas.",
      "Validación rápida de acceso diario en recepción con verificación en milisegundos.",
      "Dashboard financiero con métricas de ingresos mensuales, aforo y retención de usuarios.",
      "Manejo eficiente de memoria y ordenamiento de registros mediante estructuras de datos optimizadas."
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "Node.js", "Estructuras de Datos", "Chart.js"],
    links: {
      github: "https://github.com/",
      demo: "#",
      liveUrl: "#"
    },
    featured: true,
    accentColor: "cyan",
    iconName: "dumbbell",
    bannerTag: "Estructura de Datos - Programación III"
  }
];
