# Proposal: Tu Futuro Dual

## Intent

Uniempresarial necesita una plataforma de orientación vocacional para estudiantes de secundaria en Bogotá que no saben qué estudiar. El prototipo actual (ue-descubre.netlify.app) tiene resultados hardcoded, sin almacenamiento, sin panel admin y sin algoritmo psicométrico real. Este rebuild crea un sistema completo con motor evaluativo válido, gestión de leads y panel de administración.

## Scope

### In Scope
- Test vocacional wizard (4 dimensiones: Holland/RIASEC, Big Five, Habilidades, Motivación)
- Descargo de responsabilidad visible durante el test
- Formulario de datos personales con checkbox de consentimiento Ley 1581 (opt-in explícito)
- Resultados: Top 3 + ranking completo de 12 programas (7 presenciales + 5 virtuales)
- Panel admin: login, dashboard métricas, tabla leads con filtros, detalle lead, exportación Excel
- Almacenamiento en Google Sheets (cero costo)
- Deploy en Vercel

### Out of Scope
- Cuestionario adaptativo (CAT) — futura iteración
- Machine Learning para scoring — requiere datos históricos
- App móvil nativa
- Pagos o matrículas en línea
- Integración con Sistemas de Información Universitarios (SIU)
- Soporte multi-idioma

## Capabilities

### New Capabilities
- `test-engine`: Motor de evaluación wizard con 4 dimensiones psicométricas, scoring y ranking
- `results-display`: Presentación de resultados con Top 3 expandible y explicaciones por carrera
- `lead-management`: Formulario de contacto, almacenamiento y gestión de leads
- `admin-panel`: Dashboard, tabla leads con filtros, detalle lead, exportación Excel
- `google-sheets-storage`: Integración con Google Sheets API como base de datos

### Modified Capabilities
None — greenfield project.

## Direction Visual — GAMIFICADA

**Palabra clave: GAMIFICADO**

| Elemento | Dirección |
|----------|-----------|
| **Paleta** | Tonos oscuros (negros, grises profundos), NO colores institucionales Uniempresarial |
| **Acentos** | Colores neón/vibrantes sobre fondo oscuro (para elementos interactivos, botones, progreso) |
| **Tipografía** | Bold, moderna, juvenil — sans-serif con personalidad |
| **Logo/Marca** | MUY presente en header, visible en todo momento |
| **Tono** | Juvenil, cercano, gamificado — como una app de游戏, no como una web corporativa |
| **Elementos gamificados** | Barra de progreso animada, puntos/niveles, micro-animaciones, feedback visual en cada respuesta |
| **Inspiración** | [Chaptr.studio](https://chaptr.studio/) · [Basic/Dept](https://www.basicagency.com/) · [Pollen](https://www.pollen.design/) |

**NO queremos:** Web corporativa azul institucional, textos formales, diseño aburrido, sensación de "prueba escolar"

**SÍ queremos:** Sensación de "juego interactivo", vibe de app moderna, dark mode nativo, animaciones sutiles que mantengan engagement

### Principios de Diseño Visual

1. **SÚPER VISUAL** — Cada pantalla es una experiencia. No hay "páginas con texto", hay composiciones visuales.
2. **JUGAR CON EL DISEÑO** — Tipografía grande que rompe grid, elementos que se superponen, shapes orgánicos,破格 layout.
3. **MOTION ES PARTE DEL DISEÑO** — No es decoración, es comunicación. Transiciones entre preguntas, animaciones de resultado, micro-interacciones en cada click.
4. **DARK MODE NATIVO** — El fondo oscuro es el lienzo. Los colores neón/vibrantes son la pintura.
5. **SCROLL QUE CUENTA HISTORIA** — Landing page con scroll narrativo, no todo visible de una vez.
6. **IMÁGENES CON PERSONALIDAD** — No fotos stock genéricas. Ilustraciones, iconografía custom, o fotografía estilizada.
7. **GAMIFICACIÓN VISUAL** — Barra de progreso como "vida de videojuego", puntos que aparecen, animaciones de "correcto", confeti al ver resultados.

## Approach

Next.js 15 App Router + React 19 + Google Sheets API. Wizard híbrido con branches condicionales. Matriz de compatibilidad 4×12 para scoring ponderado. API Routes para lógica server-side. Zustand 5 para estado del test. Zod 4 para validación. Datos almacenados en Google Sheets (cero costo). Admin accede directamente al Sheet para filtrar y exportar Excel.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/` | New | App Router pages: landing, test, resultados, admin |
| `src/components/` | New | TestWizard, QuestionCard, ResultsDisplay, LeadForm, AdminLayout, LeadsTable |
| `src/lib/` | New | Google Sheets client, scoring engine, Zod schemas |
| `src/stores/` | New | Zustand store for test state |
| `src/app/api/` | New | API routes: submit-test, leads (writes to Google Sheets) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Deadline 3-4 semanas ajustado | High | Priorizar: test funcional → resultados → formulario → admin |
| Validez psicométrica sin validación formal | Medium | Dejar matriz configurable, revisión de expertos post-MVP |
| Mapeo dimensión→programa pendiente | Medium | Componente configurable con valores por defecto razonables |
| Google Sheets API rate limit (60 req/min) | Low | suficiente para volumen esperado, implementar retry |
| Google Sheets puede tener downtime | Low | Mostrar mensaje de error amigable, reintentar |

## Rollback Plan

Google Sheets mantiene el historial de cambios. Vercel permite rollback a deploy anterior. Si el scoring falla, fallback a mostrar los 12 programas sin ranking. No hay datos de producción que migrar (greenfield).

## Dependencies

- Google Cloud Project (Google Sheets API habilitada)
- Cuenta de Google para la hoja de cálculo
- Vercel project para deploy
- Mapeo de pesos dimensión×programa del usuario
- Validación psicométrica de experto (post-MVP)

## Legal & Compliance

### Descargo de Responsabilidad
El test vocacional es una herramienta de orientación **informativa y complementaria**. Los resultados NO constituyen:
- Diagnóstico psicológico o psicométrico certificado
- Garantía de admisión a Uniempresarial
- Promesa de empleabilidad o resultado profesional
- Sustitución de orientación vocacional profesional

El estudiante entiende y acepta que:
- Los resultados son una guía basada en auto-percepción, no en evaluación clínica
- La decisión de carrera es responsabilidad exclusiva del estudiante y su familia
- Uniempresarial se reserva el derecho de modificar programas académicos
- El instrumento puede ser actualizado para mejorar su precisión

### Consentimiento de Tratamiento de Datos Personales
**Checkbox obligatorio** antes de enviar el formulario de datos:

> ☐ **Acepto el tratamiento de mis datos personales** por parte de la Fundación Universitaria Empresarial de la CCB (Uniempresarial), con NIT 830.084.876-6, para las siguientes finalidades:
> - Contacto por parte del equipo de admisiones sobre programas académicos
> - Envío de información sobre eventos, convocatorias y procesos de admisión
> - Seguimiento del proceso de orientación vocacional
>
> Mis datos serán tratados conforme a la **Ley 1581 de 2012** y su decreto reglamentario 1377 de 2013. Tengo derecho a acceder, rectificar, suprimir y/o portar mis datos personales en cualquier momento, escribiendo a **admisiones@uniempresarial.edu.co**.
>
> **Política de Protección de Datos:** [uniempresarial.edu.co/política-de-protección-de-datos](https://uniempresarial.edu.co/wp-content/uploads/2025/02/Certificado-Politica-de-Proteccion-de-Datos-1.pdf)

**Regla de negocio:** El formulario NO se puede enviar sin casilla de consentimiento marcada. El checkbox debe estar DESMARCADO por defecto (opt-in explícito).

## Contexto Institucional — Uniempresarial

| Dato | Valor |
|------|-------|
| Nombre completo | Fundación Universitaria Empresarial de la CCB |
| NIT | 830.084.876-6 |
| Dirección | Cra 33a # 30-20, Bogotá D.C., Colombia |
| Teléfono | +57 (601) 794 5718 |
| WhatsApp | 314 208 4103 |
| Email admisiones | admisiones@uniempresarial.edu.co |
| Modelo educativo | Modelo Dual (teoría + práctica en entorno empresarial real) |
| Alianzas empresariales | +350 empresas aliadas |
| Empleabilidad | 87% |
| Trayectoria | 25 años |
| Internacionalización | 17 universidades aliadas en 9 países |
| Vigilancia | Ministerio de Educación Nacional |

## Success Criteria

- [ ] Test funcional con 4 dimensiones y wizard responsivo
- [ ] Resultados muestran Top 3 con explicación + ranking completo expandible
- [ ] Formulario captura datos con consentimiento Ley 1581 (checkbox opt-in)
- [ ] Descargo de responsabilidad visible antes/durante el test
- [ ] Admin panel con UI amigable: dashboard, tabla leads, filtros, exportación Excel
- [ ] Carga <3s en mobile, 100 users simultáneos sin degradación
- [ ] TypeScript estricto, sin errores de tipo

## Admin Panel — UI Amigable para Admisiones

**Concepto:** El admin panel es la **cara visible** del sistema para admisiones. Google Sheets es solo el backend. Admisiones NUNCA abre el Sheet directamente.

| Componente | Función |
|------------|---------|
| **Dashboard** | Métricas: total leads, leads hoy, leads por carrera, tendencia semanal |
| **Tabla de Leads** | Lista completa con columnas: nombre, email, celular, carrera top, compatibilidad, fecha |
| **Filtros** | Dropdowns: rango de fechas, carrera recomendada, modalidad, arquetipo |
| **Búsqueda** | Buscar por nombre o correo en tiempo real |
| **Detalle Lead** | Click en lead → panel lateral con toda la info + respuestas del test |
| **Exportar Excel** | Botón que genera .xlsx desde los datos filtrados (no abre Google Sheet) |
| **Accesibilidad** | Diseño claro, grandes botones, colores distinguish, sin sobrecarga visual |

**Flujo del admin:**
```
1. Admin abre /admin → ve dashboard con métricas
2. Navega a /admin/leads → ve tabla de todos los leads
3. Aplica filtros (ej: "solo los de Ingeniería de Software esta semana")
4. Hace click en un lead → ve detalle completo
5. Click "Exportar Excel" → descarga archivo .xlsx con los datos filtrados
```

**Regla:** El admin panel es tan fácil como usar una hoja de cálculo, pero con mejor diseño.
