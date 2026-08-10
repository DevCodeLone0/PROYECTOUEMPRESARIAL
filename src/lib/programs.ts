export interface Program {
  id: string;
  name: string;
  shortName: string;
  modality: "presencial" | "virtual";
  description: string;
  whyDualModel: string;
  displayOrder: number;
}

export const programs: Program[] = [
  {
    id: "ing-software",
    name: "Ingeniería de Software",
    shortName: "Ing. Software",
    modality: "presencial",
    description:
      "Diseña, desarrolla y mantienes soluciones tecnológicas que transforman industrias. Aprende programación, arquitectura de software y gestión de proyectos con metodologías ágiles.",
    whyDualModel:
      "En el Modelo Dual trabajas en empresas de tecnología reales desde el primer semestre. Aplicas lo que aprendes en clase en proyectos con clientes verdaderos, construyendo un portafolio profesional antes de graduarte.",
    displayOrder: 1,
  },
  {
    id: "negocios-turisticos",
    name: "Negocios Turísticos y Hoteleros",
    shortName: "Neg. Turísticos",
    modality: "presencial",
    description:
      "Gestiona hoteles, agencias de viaje y destinos turísticos. Combina administración, hospitalidad y experiencia del cliente en un sector en constante crecimiento.",
    whyDualModel:
      "El Modelo Dual te inserta en hoteles, resorts y agencias de turismo reales. Gestionas operaciones, atiendes clientes y aprendes el negocio desde adentro, con mentores que viven la industria cada día.",
    displayOrder: 2,
  },
  {
    id: "admin-empresas",
    name: "Administración de Empresas",
    shortName: "Admin. Empresas",
    modality: "presencial",
    description:
      "Lidera organizaciones con visión estratégica. Finanzas, marketing, recursos humanos y operaciones se integran para que tomes decisiones que impactan el crecimiento del negocio.",
    whyDualModel:
      "En el Modelo Dual rotas por departamentos reales: finanzas, mercadeo, talento humano y operaciones. Cada rotación es un semestre de experiencia empresarial que nadie más tiene al graduarse.",
    displayOrder: 3,
  },
  {
    id: "negocios-internacionales",
    name: "Negocios Internacionales",
    shortName: "Neg. Internacionales",
    modality: "presencial",
    description:
      "Conecta mercados globales. Comercio exterior, logística internacional y negociación intercultural te preparan para liderar en un mundo sin fronteras.",
    whyDualModel:
      "El Modelo Dual te conecta con empresas que exportan e importan. Negocias con proveedores internacionales, manejas documentación aduanera y vives el comercio global en carne propia.",
    displayOrder: 4,
  },
  {
    id: "finanzas",
    name: "Finanzas y Comercio Exterior",
    shortName: "Finanzas",
    modality: "presencial",
    description:
      "Domina los mercados financieros y el comercio internacional. Inversiones, banca, seguros y análisis financiero para que tomes decisiones con impacto económico real.",
    whyDualModel:
      "En el Modelo Dual trabajas en bancos, fintechs y empresas de comercio exterior. Analizas portafolios reales, gestiones financieras y aprendes regulación con profesionales del sector.",
    displayOrder: 5,
  },
  {
    id: "ing-industrial",
    name: "Ingeniería Industrial",
    shortName: "Ing. Industrial",
    modality: "presencial",
    description:
      "Optimiza procesos, reduce costos y mejora la productividad. Logística, producción, calidad y mejora continua para que las organizaciones funcionen mejor.",
    whyDualModel:
      "El Modelo Dual te lleva a plantas de producción y centros logísticos reales. Diseñas flujos, implementas mejoras y mides resultados con datos reales, no simulaciones.",
    displayOrder: 6,
  },
  {
    id: "marketing",
    name: "Marketing",
    shortName: "Marketing",
    modality: "presencial",
    description:
      "Crea marcas que conectan. Estrategia digital, publicidad, investigación de mercados y branding para que las empresas cuenten historias que venden.",
    whyDualModel:
      "En el Modelo Dual gestionas campañas reales para empresas reales. Creas contenido, analizas métricas y construyes estrategias de marketing que generan resultados medibles desde el primer día.",
    displayOrder: 7,
  },
  {
    id: "ing-software-virtual",
    name: "Ingeniería de Software Virtual",
    shortName: "Ing. Software (V)",
    modality: "virtual",
    description:
      "La misma formación en tecnología, pero con la flexibilidad del aprendizaje virtual. Programación, desarrollo web y móvil desde cualquier lugar.",
    whyDualModel:
      "El Modelo Dual virtual te conecta con empresas de tecnología de forma remota. Trabajas en equipos distribuidos, usas herramientas de colaboración digital y construyes tu carrera sin límites geográficos.",
    displayOrder: 8,
  },
  {
    id: "admin-empresas-virtual",
    name: "Administración de Empresas Virtual",
    shortName: "Admin. Empresas (V)",
    modality: "virtual",
    description:
      "Lidera organizaciones desde cualquier lugar. La flexibilidad virtual combinada con experiencia empresarial real te da ventaja competitiva.",
    whyDualModel:
      "En el Modelo Dual virtual gestionas proyectos empresariales reales de forma remota. Aprendes liderazgo digital, herramientas de gestión y tomas de decisiones con impacto real.",
    displayOrder: 9,
  },
  {
    id: "negocios-turisticos-virtual",
    name: "Negocios Turísticos y Hoteleros Virtual",
    shortName: "Neg. Turísticos (V)",
    modality: "virtual",
    description:
      "Gestiona el turismo y la hospitalidad con flexibilidad virtual. Marketing turístico, gestión hotelera y experiencia del cliente digital.",
    whyDualModel:
      "El Modelo Dual virtual te inserta en empresas turísticas que operan digitalmente. Gestiones reservas, diseñas experiencias y aprendes el negocio del turismo desde cualquier punto del país.",
    displayOrder: 10,
  },
  {
    id: "ing-industrial-virtual",
    name: "Ingeniería Industrial Virtual",
    shortName: "Ing. Industrial (V)",
    modality: "virtual",
    description:
      "Optimiza procesos desde el mundo digital. Logística, producción y calidad con herramientas de simulación y gestión virtual.",
    whyDualModel:
      "En el Modelo Dual virtual trabajas con empresas que digitalizan sus procesos productivos. Analizas datos reales, optimizas flujos y implementas mejoras con impacto tangible.",
    displayOrder: 11,
  },
  {
    id: "marketing-virtual",
    name: "Marketing Virtual",
    shortName: "Marketing (V)",
    modality: "virtual",
    description:
      "Crea estrategias de marketing digitales que conectan. Social media, content marketing, SEO y análisis de datos para marcas que quieren crecer online.",
    whyDualModel:
      "En el Modelo Dual virtual gestionas campañas digitales reales para empresas. Creas contenido, analizas métricas y construyes estrategias que generan tráfico y ventas desde el primer día.",
    displayOrder: 12,
  },
];

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getPresencialPrograms(): Program[] {
  return programs.filter((p) => p.modality === "presencial");
}

export function getVirtualPrograms(): Program[] {
  return programs.filter((p) => p.modality === "virtual");
}

export interface UniqueProgram {
  /** Base id without "-virtual" suffix, e.g. "marketing". */
  baseId: string;
  /** Base name without " Virtual" suffix. */
  name: string;
  /** Modalities this career is actually offered in. */
  modalities: ("presencial" | "virtual")[];
  description: string;
  whyDualModel: string;
  displayOrder: number;
}

/** 7 unique careers, each with the modalities it is offered in. */
export function getUniquePrograms(): UniqueProgram[] {
  const byBase = new Map<string, Program[]>();
  for (const program of programs) {
    const baseId = program.id.replace(/-virtual$/, "");
    const variants = byBase.get(baseId) ?? [];
    variants.push(program);
    byBase.set(baseId, variants);
  }

  return [...byBase.values()]
    .map((variants) => {
      // Use the presencial entry as the source of name/description/whyDualModel.
      const source = variants.find((p) => p.modality === "presencial") ?? variants[0];
      const modalities = (["presencial", "virtual"] as const).filter((m) =>
        variants.some((p) => p.modality === m)
      );

      return {
        baseId: source.id.replace(/-virtual$/, ""),
        name: source.name.replace(/ Virtual$/, ""),
        modalities,
        description: source.description,
        whyDualModel: source.whyDualModel,
        displayOrder: source.displayOrder,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Base display name for any program id (strips " Virtual" from virtual names). */
export function getProgramBaseName(id: string): string {
  const program = getProgramById(id);
  if (!program) return id.replace(/-virtual$/, "");
  return program.name.replace(/ Virtual$/, "");
}
