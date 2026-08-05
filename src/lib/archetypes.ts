export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  whyDualModel: string;
  dominantDimension: string;
}

export const archetypes: Archetype[] = [
  {
    id: "lider-estrategico",
    name: "El Líder Estratégico",
    emoji: "👑",
    description:
      "Tomas decisiones con visión de largo plazo. Te gusta planificar, organizar equipos y ver resultados medibles. Eres naturalmente competitivo y buscas impactar organizaciones enteras.",
    whyDualModel:
      "El Modelo Dual te da acceso a empresas donde puedes liderar proyectos reales desde temprano. No es solo estudiar administración — es vivirla en una empresa que confía en tu capacidad de decisión.",
    dominantDimension: "intereses",
  },
  {
    id: "creador-visionario",
    name: "El Creador Visionario",
    emoji: "🎨",
    description:
      "Tu mente genera ideas que otros no ven. Creatividad, innovación y expresión visual son tu lenguaje natural. Transformas conceptos en experiencias que conectan con las personas.",
    whyDualModel:
      "En el Modelo Dual tu creatividad no se queda en el aula. Trabajas con agencias, empresas de marketing y estudios de diseño que necesitan tu visión para crear campañas y productos reales.",
    dominantDimension: "intereses",
  },
  {
    id: "analista-preciso",
    name: "El Analista Preciso",
    emoji: "🔍",
    description:
      "Los datos cuentan historias para ti. Eres metódico, preciso y buscas la excelencia en cada detalle. Tu capacidad para encontrar patrones te hace invaluable en cualquier equipo.",
    whyDualModel:
      "El Modelo Dual te conecta con empresas de tecnología y finanzas donde tu precisión analítica se aplica a problemas reales. No simulaciones — datos y decisiones con impacto real.",
    dominantDimension: "intereses",
  },
  {
    id: "innovador-tecnologico",
    name: "El Innovador Tecnológico",
    emoji: "🚀",
    description:
      "La tecnología es tu herramienta para cambiar el mundo. Programas, construyes y automatizas. Cada problema es una oportunidad para crear una solución digital.",
    whyDualModel:
      "En el Modelo Dual trabajas en empresas de tecnología que necesitan soluciones reales. Codificas, deployas y aprendes de ingenieros senior que te muestran cómo se construye software que miles usan.",
    dominantDimension: "intereses",
  },
  {
    id: "conectador-humano",
    name: "El Conectador Humano",
    emoji: "🤝",
    description:
      "Entiendes a las personas como nadie. Empatía, comunicación y habilidades sociales te hacen naturalmente efectivo liderando equipos y construyendo relaciones.",
    whyDualModel:
      "El Modelo Dual te pone en empresas donde las relaciones humanas son el negocio. Gestión de talento, atención al cliente, trabajo en equipo — tu empatía se convierte en ventaja competitiva.",
    dominantDimension: "intereses",
  },
  {
    id: "aventurero-global",
    name: "El Aventurero Global",
    emoji: "🌍",
    description:
      "El mundo es tu classroom. Idiomas, culturas y mercados internacionales te fascinan. Buscas experiencias que trascienden fronteras y te preparen para una carrera sin límites.",
    whyDualModel:
      "El Modelo Dual te conecta con empresas que operan internacionalmente. Negocias con proveedores de otros países, manejas documentación aduanera y vives el comercio global desde Bogotá.",
    dominantDimension: "intereses",
  },
  {
    id: "constructor-eficiente",
    name: "El Constructor Eficiente",
    emoji: "⚙️",
    description:
      "Optimizas todo lo que tocas. Procesos, recursos, tiempo — encuentras la forma más inteligente de hacer las cosas. Eres práctico, sistemático y orientado a resultados.",
    whyDualModel:
      "En el Modelo Dual trabajas en plantas productivas y centros logísticos reales. Diseñas flujos, implementas mejoras y mides impacto con datos reales, no teoría.",
    dominantDimension: "intereses",
  },
  {
    id: "lider-practico",
    name: "El Líder Práctico",
    emoji: "💡",
    description:
      "Aprendes haciendo. No te conformas con la teoría — necesitas probar, fallar y mejorar. Tu enfoque práctico te da una ventaja que ningún libro puede dar.",
    whyDualModel:
      "El Modelo Dual es tu camino natural. 50% del tiempo en clase, 50% en empresa real. No es una pasantía — es tu forma de aprender, exactamente como funciona tu cerebro.",
    dominantDimension: "personalidad",
  },
  {
    id: "pensador-critico",
    name: "El Pensador Crítico",
    emoji: "🧠",
    description:
      "Cuestionas todo, analizas desde múltiples ángulos y no te conformas con respuestas fáciles. Tu mente crítica es tu mayor fortaleza para tomar decisiones informadas.",
    whyDualModel:
      "En el Modelo Dual confrontas teoría con práctica real. Los problemas que analizas en clase los enfrentas en la empresa, y eso te da una capacidad de análisis que nadie más tiene.",
    dominantDimension: "personalidad",
  },
  {
    id: "ejecutor-resiliente",
    name: "El Ejecutor Resiliente",
    emoji: "💪",
    description:
      "Cuando todos se rinden, tú sigues. Disciplina, constancia y mentalidad de crecimiento te permiten superar obstáculos que paralizan a otros.",
    whyDualModel:
      "El Modelo Dual te desafía de verdad. Manejar la presión de una empresa real mientras estudias te prepara para cualquier carrera. La resiliencia se construye con experiencia, no con teoría.",
    dominantDimension: "personalidad",
  },
];

export function getArchetypeById(id: string): Archetype | undefined {
  return archetypes.find((a) => a.id === id);
}
