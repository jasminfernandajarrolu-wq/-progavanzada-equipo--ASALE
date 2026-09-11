export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  username: string;
}

export interface Skill {
  name: string;
  category: 'Frontend' | 'Backend & Datos' | 'Herramientas' | 'Conceptos';
  icon?: string;
  level?: string;
}

export interface PersonalInfo {
  name: string;
  shortName: string;
  nickname?: string;
  role: string;
  specialty: string;
  career: string;
  location: string;
  availability: string;
  phone: {
    display: string;
    raw: string; // Para enlace tel: o wa.me
    whatsappUrl: string;
  };
  email: string;
  bio: string;
  aboutMeLong: string[];
  socials: SocialLink[];
  skills: Skill[];
  stats: {
    label: string;
    value: string;
  }[];
}

export const personalInfo: PersonalInfo = {
  name: "JASMIN FERNANDA JARRO LUPA",
  shortName: "Jasmin Jarro",
  role: "Desarrollador Web Frontend & Software Engineer",
  specialty: "Ingeniería de Software y Desarrollo Web Frontend",
  career: "Ingeniería de Sistemas",
  location: "Disponible Remoto / Presencial",
  availability: "Disponible para nuevos proyectos y pasantías",
  phone: {
    display: "+1 (829) 000-0000", // Modifica con tu número de teléfono real
    raw: "+18290000000",
    whatsappUrl: "https://wa.me/18290000000?text=Hola%20Jasmin%20Fernanda,%20vi%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20conversar.",
  },
  email: "jasmin.jarro@example.com", // Modifica con tu correo
  bio: "Estudiante de Ingeniería de Sistemas con especialidad en Ingeniería de Software y Desarrollo Web Frontend. Enfocada en la construcción de sistemas de gestión integrales, interfaces de usuario de alto impacto y arquitectura de software escalable.",
  aboutMeLong: [
    "Soy Jasmin Fernanda Jarro Lupa, estudiante de Ingeniería de Sistemas especializada en Ingeniería de Software y Desarrollo Web Frontend. Me apasiona transformar procesos complejos y necesidades de negocio en aplicaciones web robustas, rápidas y visualmente atractivas.",
    "He liderado y desarrollado tres sistemas clave: el Sistema de Gestión de Sistemas para el SAR, el Sistema de Gestión para una Cafetería de Starbucks, y el Sistema de Gestión para el Gimnasio HyC Fitness. Cada uno aborda problemáticas reales con arquitecturas sólidas y enfoque centrado en el usuario.",
    "Mi objetivo profesional es continuar aportando valor en equipos de desarrollo tecnológico mediante código limpio, diseño UI/UX responsivo y estándares de calidad de software."
  ],
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/",
      icon: "github",
      username: "github.com/jasmin-jarro"
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/",
      icon: "linkedin",
      username: "linkedin.com/in/jasmin-jarro"
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/18290000000?text=Hola%20Jasmin%20Fernanda,%20vi%20tu%20portafolio%20y%20me%20gustar%C3%ADa%20conversar.",
      icon: "whatsapp",
      username: "Chat directo"
    },
    {
      name: "Email",
      url: "mailto:jasmin.jarro@example.com",
      icon: "mail",
      username: "jasmin.jarro@example.com"
    }
  ],
  stats: [
    { label: "Sistemas Desarrollados", value: "3" },
    { label: "Especialidad Principal", value: "Software & Frontend" },
    { label: "Carrera Universitaria", value: "Ing. de Sistemas" },
    { label: "Compromiso y Calidad", value: "100%" }
  ],
  skills: [
    // Frontend
    { name: "HTML5 / CSS3 Moderno", category: "Frontend" },
    { name: "JavaScript (ES6+)", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "React / Vite", category: "Frontend" },
    { name: "Astro", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend" },
    
    // Backend & Datos
    { name: "Node.js / Express", category: "Backend & Datos" },
    { name: "Bases de Datos SQL (PostgreSQL, MySQL)", category: "Backend & Datos" },
    { name: "Modelado Relacional de Sistemas", category: "Backend & Datos" },
    { name: "APIs RESTful", category: "Backend & Datos" },
    
    // Herramientas & Conceptos
    { name: "Git & GitHub", category: "Herramientas" },
    { name: "Figma (UI/UX)", category: "Herramientas" },
    { name: "Postman", category: "Herramientas" },
    { name: "Scrum / Metodologías Ágiles", category: "Conceptos" },
    { name: "Arquitectura de Software", category: "Conceptos" }
  ]
};
