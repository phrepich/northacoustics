export type NavigationItem = {
  href: string;
  label: string;
};

export type ServiceLine = {
  slug: string;
  href: string;
  title: string;
  homeTitle: string;
  summary: string;
  description: string;
  focus: string[];
  problem: string;
  services: string[];
  clients: string[];
  deliverables: string[];
};

export const company = {
  shortName: "NorthAcoustics",
  legalName: "NorthAcoustics",
  displayName: "NorthAcoustics",
  tagline: "Medicion acustica en terreno con trazabilidad tecnica.",
  contact: {
    email: "contacto@northacoustics.cl",
    phone: "+56 9 0000 0000",
    whatsapp: "56900000000",
    location: "Chile",
  },
};

export const navigation: NavigationItem[] = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/contacto", label: "Contacto" },
];

export const homeMetrics = [
  { value: "Campo", label: "Captura tecnica desde terreno." },
  { value: "Datos", label: "Informacion estructurada por proyecto." },
  { value: "Trazabilidad", label: "Evidencia para cada medicion." },
];

export const serviceLines: ServiceLine[] = [
  {
    slug: "monitoreo-acustico",
    href: "/servicios/monitoreo-ambiental-acustico",
    title: "Monitoreo ambiental y acustico",
    homeTitle: "Monitoreo acustico",
    summary: "Mediciones de ruido con evidencia, ubicacion y condiciones de terreno.",
    description: "Planificacion y registro de campanas de ruido ambiental con trazabilidad de puntos, mediciones y respaldos.",
    focus: ["Medicion", "Evidencia"],
    problem: "Necesidad de registrar mediciones tecnicas de forma consistente y verificable.",
    services: ["Registro de puntos", "Captura de mediciones", "Condiciones ambientales", "Evidencia fotografica"],
    clients: ["Industrias", "Proyectos de infraestructura", "Consultoras ambientales"],
    deliverables: ["Registro de campana", "Evidencia tecnica", "Informe trazable"],
  },
  {
    slug: "gestion-de-campanas",
    href: "/servicios/calidad-soporte-tecnico",
    title: "Gestion tecnica de campanas",
    homeTitle: "Gestion de campanas",
    summary: "Coordinacion operativa de proyectos, equipos y control de calidad en terreno.",
    description: "Soporte para organizar campanas de medicion, asegurar consistencia de captura y preparar informacion para revision tecnica.",
    focus: ["Operacion", "Calidad"],
    problem: "Falta de visibilidad sobre actividades, evidencias y estados de una campana.",
    services: ["Planificacion de terreno", "Control de avance", "Revision de registros", "Seguimiento de incidencias"],
    clients: ["Equipos de terreno", "Jefaturas tecnicas", "Operadores de proyecto"],
    deliverables: ["Plan de terreno", "Control de avance", "Registro de incidencias"],
  },
  {
    slug: "reportabilidad",
    href: "/servicios/topografia-control-geometrico",
    title: "Reportabilidad tecnica",
    homeTitle: "Reportabilidad",
    summary: "Informacion estructurada para revisar resultados y respaldar decisiones.",
    description: "Consolidacion de datos de terreno para generar reportes tecnicos claros, consistentes y auditables.",
    focus: ["Datos", "Reportes"],
    problem: "Datos dispersos que dificultan revisar resultados y preparar entregables.",
    services: ["Consolidacion de resultados", "Exportacion de datos", "Versionado de informes", "Trazabilidad documental"],
    clients: ["Responsables ambientales", "Mandantes", "Equipos de revision"],
    deliverables: ["Resumen de resultados", "Exportacion de datos", "Historial de versiones"],
  },
];

export const directionHighlights = [
  "Criterio tecnico aplicado a mediciones y evidencias de terreno.",
  "Trazabilidad de informacion desde el punto de captura hasta el reporte.",
  "Coordinacion entre equipos operativos, revision tecnica y clientes.",
  "Mejora continua basada en datos verificables.",
];

export const differentiators = [
  "Operacion pensada para trabajo real en terreno.",
  "Datos estructurados por cliente, proyecto, punto y medicion.",
  "Evidencia geografica, fotografica y ambiental asociada al registro.",
  "Reportabilidad tecnica con control de versiones.",
  "Base preparada para auditoria y mejora continua.",
];

export const workflow = [
  { title: "Planificar", description: "Definir alcance, proyecto, puntos y criterios de la campana." },
  { title: "Medir", description: "Capturar resultados, condiciones ambientales y evidencia desde terreno." },
  { title: "Revisar", description: "Validar consistencia tecnica y completar los respaldos necesarios." },
  { title: "Reportar", description: "Consolidar resultados en entregables claros y trazables." },
];

export const projects = [
  {
    type: "Campana de ruido ambiental",
    intervention: "Registro de puntos, mediciones, evidencia y condiciones de terreno.",
    result: "Informacion ordenada para analisis y reporte tecnico.",
  },
  {
    type: "Control de mediciones en terreno",
    intervention: "Seguimiento de actividades, equipos y respaldo de cada registro.",
    result: "Mayor visibilidad sobre el avance y la calidad de captura.",
  },
];
