# Exploración: Tu Futuro Dual

## Estado actual

**Prototipo existente (ue-descubre.netlify.app):**
- Aplicación de página única (SPA) con HTML/CSS/Tailwind/JS
- Flujo lineal: bienvenida → nombre → 15 preguntas → carga → 3 opciones de carrera → formulario de contacto
- Diseño responsivo, enfoque en mobile-first
- Branding "Tu Futuro Dual" con paleta de colores azul/celeste
- Footer menciona: "Ideado por Aida Lucía Toro Ramírez - Directora de Planeación Uniempresarial y Desarrollado por Brayam Chavarro"
- **Limitaciones críticas:**
  - Solo muestra 3 opciones (no ranking completo)
  - Sin algoritmo psicométrico real (parece hardcoded)
  - Sin almacenamiento de resultados
  - Sin panel de administración
  - Sin validación de datos
  - Sin analytics ni métricas

**Lo que construiremos:**
- Plataforma completa con Next.js 15 + React 19 + Supabase
- Motor psicométrico real basado en Holland/RIASEC y Big Five
- Ranking dinámico de 12 programas (7 presenciales + 5 virtuales)
- Sistema de leads con datos personales
- Panel de administración para admisiones
- Exportación a Excel
- Cumplimiento Ley 1581 de 2012 (protección datos personales)

## Áreas afectadas

### Páginas/Rutas
- `/` — Landing page con CTA al test
- `/test` — Motor de evaluación (wizard de preguntas)
- `/test/[step]` — Steps individuales del test
- `/resultados` — Resultados con ranking de carreras
- `/admin` — Panel de administración (protegido)
- `/admin/leads` — Lista de leads con resultados
- `/admin/reportes` — Exportación y métricas
- `/api/submit-test` — API para procesar respuestas
- `/api/leads` — API para CRUD de leads

### Componentes React
- `TestWizard` — Contenedor principal del test
- `QuestionCard` — Tarjeta de pregunta individual
- `ProgressBar` — Progreso del test
- `ResultsDisplay` — Mostrador de resultados con ranking
- `CareerCard` — Tarjeta de carrera recomendada
- `LeadForm` — Formulario de datos personales
- `AdminLayout` — Layout del panel admin
- `LeadsTable` — Tabla de leads con filtros
- `ExportButton` — Botón de exportación Excel

### Base de datos (Supabase)
- `test_sessions` — Sesiones de test (id, user_id, started_at, completed_at, status)
- `test_responses` — Respuestas individuales (session_id, question_id, dimension, score)
- `user_profiles` — Perfiles de usuarios (id, name, email, phone, created_at)
- `leads` — Leads de admisión (user_id, test_session_id, program_ranking, contact_status, notes)
- `programs` — Catálogo de programas (id, name, modality, description)
- `scoring_rules` — Reglas de puntuación (dimension, program_id, weight)

### Modelo psicométrico (4 dimensiones)
1. **Brújula de Intereses** (Holland/RIASEC) — 6 escalas: Realista, Investigativo, Artístico, Social, Emprendedor, Convencional
2. **Blueprint de Personalidad** (Big Five) — 5 escalas: Extraversion, Amabilidad, Responsabilidad, Neuroticismo, Apertura
3. **Inventario de Habilidades** — Auto-percepción de confianza en tareas clave
4. **Motor de Motivación** — Drivers intrínsecos vs extrínsecos

### Infraestructura
- Supabase Auth (autenticación anónima para test, admin con email/password)
- Supabase Storage (para reportes Excel generados)
- Supabase Edge Functions (para procesamiento de scoring)
- Vercel (deploy de Next.js)

## Enfoques comparativos

### Motor de Evaluación

| Enfoque | Pros | Cons | Complejidad |
|---------|------|------|-------------|
| **Wizard lineal (actual)** | Simple, UX conocido, fácil de implementar | Menos engagement, puede parecer monótono | Baja |
| **Cuestionario adaptativo (CAT)** | Menos preguntas, más preciso, personalizado | Complejo de implementar, requiere/item bank grande | Alta |
| **Híbrido: Wizard con branches** | Balance entre simplicidad y personalización, UX familiar | Requiere diseño cuidadoso de branches | Media |

**Recomendación:** Híbrido wizard con branches. Mantener la familiaridad del wizard pero permitir que preguntas clave determinen caminos alternos. Ejemplo: si respondió alto en "Investigativo", mostrar preguntas adicionales de esa dimensión.

### Algoritmo de Scoring

| Enfoque | Pros | Cons | Complejidad |
|---------|------|------|-------------|
| **Ponderación simple (suma ponderada)** | Transparente, fácil de explicar, rápido | No captura interacciones entre dimensiones | Baja |
| **Matriz de compatibilidad (reglas)** | Permite reglas complejas, mantenible | Puede volverse rígido, requiere validación experta | Media |
| **Machine Learning (clasificador)** | Puede发现 patrones no obvios, se mejora con datos | Requiere datos históricos, caja negra, overfitting | Alta |

**Recomendación:** Matriz de compatibilidad. Para un MVP con 12 programas, se puede crear una matriz 4x12 donde cada celda tiene el peso de esa dimensión para cada programa. Ejemplo:
- Ingeniería de Software: Alto peso en Investigativo + Responsabilidad
- Marketing: Alto peso en Emprendedor + Social
- Administración: Balance entre Emprendedor + Convencional

### Ranking de Resultados

| Enfoque | Pros | Cons | Complejidad |
|---------|------|------|-------------|
| **Top 3 fijo** | Simple, enfocado | Pierde opciones, usuario no ve alternativas | Baja |
| **Ranking completo (1-12)** | Transparencia total, usuario decide | Puede abrumar, necesita explicaciones claras | Media |
| **Top 3 + "ver más"** | Balance entre foco y opciones | Requiere UX cuidadosa para expandir | Media |

**Recomendación:** Top 3 + "ver más". Mostrar las 3 mejores opciones con explicaciones detalladas, y permitir expandir para ver el ranking completo con explicaciones breves. Esto mantiene el foco sin perder transparencia.

### Persistencia de Datos

| Enfoque | Pros | Cons | Complejidad |
|---------|------|------|-------------|
| **Supabase directo (client-side)** | Rápido de implementar, menos código | Menos control, potencialmente menos seguro | Baja |
| **API Routes (server-side)** | Control total, validación server, seguridad | Más código, más puntos de fallo | Media |
| **Edge Functions** | Baja latencia, escalable, separación clara | Más complejo de debug, cold starts | Alta |

**Recomendación:** API Routes para MVP. Ofrece buen balance entre control y velocidad de desarrollo. Edge Functions para optimizaciones futuras si se necesita baja latencia.

## Recomendación

**Arquitectura recomendada:**

1. **Frontend:** Next.js 15 App Router con React 19, Tailwind CSS 4, Zustand 5 para estado global del test
2. **Backend:** Supabase (PostgreSQL + Auth + Storage) con API Routes para lógica de negocio
3. **Motor psicométrico:** Matriz de compatibilidad 4 dimensiones × 12 programas, con scoring ponderado
4. **Flujo de usuario:**
   - Landing → Test (wizard híbrido con branches) → Resultados (top 3 + ver más) → Formulario contacto → Confirmación
   - Admin: Login → Dashboard → Leads (filtros, búsqueda) → Detalle lead → Exportar Excel
5. **Protección datos:** Ley 1581 de 2012, consentimiento explícito, cifrado en tránsito y reposo

**Stack específico:**
- Next.js 15.4+ (App Router, Server Actions)
- React 19 (use, Server Components)
- Tailwind CSS 4 (con @theme)
- Supabase JS v2
- Zustand 5 (estado del test)
- Zod 4 (validación de formularios)
- XLSX (exportación Excel)
- Vercel (deploy)

## Riesgos

1. **Complejidad psicométrica:** El modelo de 4 dimensiones puede ser demasiado ambicioso para MVP. Considerar empezar con Holland/RIASEC y agregar las demás dimensiones en iteraciones posteriores.
2. **Validez del instrumento:** Sin validación psicométrica formal, los resultados pueden no ser confiables. Necesitaremos revisión de expertos en orientación vocacional.
3. **Deadline ajustado:** 3-4 semanas es agresivo para un sistema completo. Priorizar: test funcional → resultados → formulario → admin básico.
4. **Base de datos de mapeo:** El usuario definirá el mapeo arquetipo→programa. Necesitamos esa información antes de implementar el scoring.
5. **Escalabilidad:** El prototipo actual es estático. Con Supabase tendremos escalabilidad, pero necesitaremos monitorear performance del test con muchos usuarios simultáneos.
6. **Carga cognitiva:** 15+ preguntas pueden ser muchas para estudiantes. Considerar optimizar el número con CAT o agrupar preguntas.

## ¿Listo para propuesta?

**Sí**, estamos listos para avanzar a la fase de propuesta. La exploración ha identificado:
- Estado claro del prototipo existente y brechas
- Áreas de arquitectura definidas
- Enfoques comparados con recomendaciones
- Riesgos identificados y mitigables
- Stack tecnológico confirmado

**Información pendiente del usuario:**
1. Mapeo exacto de dimensiones→programas (pesos de la matriz de compatibilidad)
2. Número óptimo de preguntas por dimensión (¿15 total o más?)
3. ¿Quién validará el instrumento psicométrico?
4. ¿Requieren analytics específicos en el admin?
5. ¿Fecha límite exacta o flexible?

La propuesta puede proceder con las decisiones de arquitectura recomendadas, dejando el mapeo psicométrico como un componente configurable.