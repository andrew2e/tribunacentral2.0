# Tribuna Central 2.0 Offices — plan de fases y diseño de la redacción

Estado: **fase 1 completada, fase 2 y 3 iniciadas** (2026-11-04). Este documento es el plan
vivo; se actualiza al cerrar cada fase.

## Fases

| # | Fase | Qué incluye | Estado |
| --- | --- | --- | --- |
| 1 | Base | Fork, versión fijada (`UPSTREAM.md`), arranque desde fuente, `CLAUDE.md` | ✅ |
| 2 | Marca | Nombre en todo lo visible, logo y wordmark TC, paleta, README propio | 🟡 nombre, textos, paleta TC (tema `tc`, por defecto) y wordmark provisional en paths (`dev/make-tc-wordmark.py`) listos; logo/wordmark definitivos pendientes de Jerome |
| 3 | Redacción precargada | Seed con cinco departamentos y sus agentes; estación con cinco salas y líneas de trabajo | 🟡 roster, saves y estación de diez salas (25 agentes) listos (`dev/tc-offices/build-station.js`, comprobada en navegador); faltan las líneas de trabajo |
| 4 | Skills y conectores | Portar las 4 skills TC; conectores Drive, Trello, WP Royal MCP, Ahrefs, Slack, GitHub; cron de vigilancia y de "Listo para WP" | ⬜ |
| 5 | Arte TC | Personajes (uno por agente) y muebles de las cinco salas; retirar el arte heredado | ⬜ |
| 6 | Poda y app instalable | Quitar canales, proveedores y skills ajenos; opcional: build Tauri para macOS | ⬜ |

## Diseño de la redacción

Convención: cada departamento es una **sala**; cada agente ocupa una **bahía** (bay) en su sala;
las líneas (cintas) encadenan bahías cuando hay un flujo fijo. Los nombres son códigos cortos
en mayúsculas, como hace la app; Andrés los puede cambiar en el seed.

### 1. Investigación (sala `investigacion`)

| Agente | Clase | Qué hace |
| --- | --- | --- |
| **LUPA** | researcher | Research de contenido para un tema o keyword: fuentes, datos, ángulos, qué ya publicó TC (anti-canibalización). Entrega un brief. |
| **VIGÍA** | scout | Vigila las casas de apuestas y casinos que TC ya reseña: bonos, términos, licencias, apps, métodos de pago. Corre en cron y entrega solo cambios confirmados con URL y fecha. |
| **RADAR** | analyst | Competencia: qué publican los medios rivales en los clusters de TC, huecos de contenido, tendencias. |
| **SONDA** | engineer | Investigación técnica: cómo funciona por dentro una app o un sitio (competidores, operadores reseñados), con evidencia. Usa REA en una celda aislada. Ver `docs/TC_REA.md`. |

Capacidades: web (`dish`), archivos (`cabinet`), memoria (`notebook`), conector Ahrefs. SONDA: perfil SAFE CELL (Docker)
y conector REA.
Línea: INBOX ▸ LUPA ▸ OUTBOX (`research_line` reducida) + VIGÍA con cron semanal.

### 2. Dirección de contenido (sala `direccion`)

| Agente | Clase | Qué hace |
| --- | --- | --- |
| **PAUTA** | foreman (Team Lead) | Jefa de redacción adjunta: arma y prioriza las tandas, aplica la taxonomía de clusters, territorios de escritores y reglas anticanibalización; propone la asignación para aprobación de Andrés. Skill `asignaciones-editoriales-tc`. |
| **TABLERO** | publisher (Content Manager) | Mantiene el board TC Posts Main Control: crea cards, mueve estados, controla plazos y carga por escritor. |

Capacidades: Drive, Trello, archivos, orquestador (puede delegar a Investigación y QA).

### 3. QA (sala `qa`)

Flujo fijo: la entrega del escritor entra, pasa por los revisores en paralelo, CIERRE consolida y
decide: devolver al escritor con correcciones o aplicarlas y marcar "Listo para WP".

| Agente | Clase | Qué hace |
| --- | --- | --- |
| **CORRECTOR** | reviewer | Gramática, ortografía, puntuación, estilo RAE/TC. |
| **VERIFICADOR** | reviewer | Datos, cifras, nombres, fechas, cuotas, afirmaciones sobre operadores; marca todo lo no verificable. |
| **VOZ** | reviewer | Voz y tono de marca TC, estructura, completitud frente al brief, SEO on-page básico (H1/H2, intro, meta). |
| **CIERRE** | chief | Consolida los tres informes, decide devolver o corregir, redacta la respuesta al escritor (Slack/Drive) o aplica los cambios en el doc. Skill `qa-copywriters-tc`. |

Capacidades: Drive/Docs, archivos, memoria, Slack (solo para avisar), orquestador en CIERRE.
Línea: blueprint `revision_loop` adaptado: INBOX ▸ SPLITTER (3 revisores) ▸ MERGER ▸ CIERRE ▸
LOOP (hasta `approved`, 2 pasadas) ▸ OUTBOX.

### 4. SEO (sala `seo`)

| Agente | Clase | Qué hace |
| --- | --- | --- |
| **RANKING** | optimizer (SEO Specialist) | Auditoría GSC/Ahrefs mensual y a demanda: indexación, impresiones, clics, caídas, causas raíz, plan priorizado. Skill `auditoria-gsc`. |
| **ENLACE** | optimizer | On-page y enlazado interno: títulos, metas (Yoast), canibalización, clusters, oportunidades de keywords. |

Capacidades: Ahrefs, GSC (vía navegador), WordPress (Yoast), web, archivos.

### 5. Desarrollo web (sala `desarrollo`)

| Agente | Clase | Qué hace |
| --- | --- | --- |
| **FORJA** | engineer | Cambios técnicos en tribunacentral.com: plugins, tema, rendimiento, bugs; trabaja con repo y terminal, propone y espera aprobación antes de tocar producción. |
| **PRENSA** | deployer | Publicación: carga a WordPress los artículos "Listo para WP" con autor, categorías, etiquetas e imagen destacada; mueve la card a Publicado. Skill `publicar-articulos-wp-tc`. |

Capacidades: terminal (`workbench`), archivos, GitHub, WP Royal MCP, Trello, Drive.

### Reglas comunes a todos los agentes

- Hablan y escriben en español neutro (TC es un medio hispano); respetan la guía de voz de TC.
- No inventan datos; lo no verificado se marca como tal.
- Nada sale de la máquina (publicar, mover cards, avisar a un escritor) sin aprobación de
  Andrés, salvo que él lo active por tarea.
- Proveedor por defecto: `claude-cli`.

## Seed

`dev/fixtures/tc-offices/` contiene el roster y un save por agente. Para arrancar con la
redacción precargada:

```bash
npm ci
node dev/seed.js --fixture tc-offices        # ver dev/seed.js; si no acepta --fixture, copiar la carpeta sobre dev/fixtures/seed-workspace
```

## Pendientes conocidos

- Primera conexión de REA en el Mac con Docker (`docs/TC_REA.md`): no se pudo probar dentro de la celda.
- Líneas de trabajo por departamento (p. ej. `revision_loop` en QA). Hasta que existan, las salas ordenan la oficina
  pero no separan permisos: un agente solo queda limitado a los objetos de su sala cuando trabaja en una bahía
  (`WorldModel.agentRoomId`); con escritorio y sin línea recibe los de toda la estación.
- Logo y wordmark TC en `frontend/assets/brand/`.
- `src-tauri/tauri.conf.json`: `productName`, `identifier` y updater solo cuando se haga la
  build de escritorio (fase 6).

## Ampliación del 2026-11-13: diez departamentos

Andrés Eloy nombra los departamentos así: **Research** (antes Investigación, con dos pisos: deportes y casas de
apuestas) y **Redacción** (antes Dirección de contenido; PAUTA es el jefe de redacción). Se añadieron cinco:

| Departamento | Agentes | Función |
| --- | --- | --- |
| Cumplimiento y juego responsable | NORMA (paralegal), AVISO (auditor) | Permisos SEGOB y regulación; revisión de juego responsable de cada pieza, entre QA y SEO |
| Alianzas con operadores | ALIANZA (negotiator), VÍNCULO (registrar) | Ficha de cada operador; inventario y comprobación de enlaces de afiliado |
| Datos y analítica | MÉTRICA (analyst), EMBUDO (analyst) | Tráfico y búsquedas; conversión por operador y artículo |
| Redes y distribución | ALTAVOZ (marketer), BOLETÍN (copywriter), CLAQUETA (producer) | Redes sociales, newsletter, guiones de video |
| Diseño | TRAZO (designer), MARCA (curator) | Piezas visuales; coherencia de marca y banco de imágenes |

Ningún agente publica, envía ni negocia: todos entregan para aprobación. Pendiente: los hubs (NFL Fantasy, Fantasy
Liga MX, Melate y Progol, equipos de la Liga MX) y los conectores de cada departamento nuevo.

## Research Piso 2 configurado (2026-11-16)

Primer departamento configurado a partir del cuestionario del Commander ("Cuestionario de configuración — Research, Piso 2").

- **VIGÍA** (sonnet): vigila las 9 casas con permiso SEGOB (18 reseñas y `/bonos/`), revisión semanal. Comprueba que sale por IP de México antes de empezar, compara lo publicado en TC con la ficha de cada promoción y entrega `informes/vigilancia-AAAA-MM-DD.csv` y `.md` en su carpeta de trabajo, con evidencia en PDF. Solo páginas públicas; no edita el sitio.
- **PAUTA** (opus): recibe el informe primero, lo filtra y sube al Commander solo lo que requiere su decisión.
- NORMA entra si el cambio toca el permiso SEGOB; AVISO si el texto propuesto menciona un bono.
- Pendiente: conectores de Drive (hoja de seguimiento en TC Management) y Slack (canal `#research-tc-20` para avisos urgentes); que Desarrollo web aplique los cambios aprobados vía WordPress; ejecución programada (hoy se lanza a mano).
- Las instrucciones viven en el seed (`dev/fixtures/tc-offices/`); `/home/claude/scratch` no se versiona.

### Research Piso 1 y apoyo técnico configurados (2026-11-17)

Respuestas de Andrés en el cuestionario: solo México; competencia vigilada solo Legalbet México e igaming.bet;
Ubersuggest solo cuando esté conectado; RADAR informa cada lunes; el resto, propuestas de Claude aceptadas.

- **RADAR** (sonnet): informe `informes/radar-AAAA-MM-DD.md` con 5 a 10 oportunidades priorizadas, a PAUTA.
- **LUPA** (sonnet): un brief por tema aprobado en `briefs/AAAA-MM-DD-slug.md` (orden del Template de Entrega v3),
  escritor sugerido orientativo, anticanibalización con la API pública de WordPress (`/wp-json/wp/v2/posts|pages?search=`).
- **SONDA** (sonnet): solo por encargo; apps de las casas con permiso SEGOB y herramientas de la competencia.
- **PAUTA**: recibe RADAR, pide briefs a LUPA y sube al Commander solo la lista final.
- Sin cifras de volumen mientras no haya Search Console, Ubersuggest ni Ahrefs conectados ("sin dato").
- Pendiente: conector de Search Console (requiere cliente OAuth de Google y añadir Search Console al
  transporte de Google), Drive para guardar briefs como Google Doc, y la rutina de los lunes para RADAR.

### Research probado de punta a punta (2026-11-18)

- Ciclo completo PAUTA → RADAR → LUPA → PAUTA probado en la oficina en marcha: informe `radar/informes/radar-2026-11-18.md`,
  briefs `lupa/briefs/liguilla-apertura-2026-cuartos-cruces-momios.md` y `lupa/briefs/codigo-promocional-playdoit.md`,
  propuesta `agent/ciclo/propuesta-ciclo-2026-11-18.md`.
- PAUTA ya tiene los territorios de los escritores en su manual.
- Rutina creada: RADAR cada lunes a las 9:00 (Europe/Madrid). Solo corre con la Mac encendida y la oficina abierta.
- VIGÍA comprueba la IP antes de empezar y se detiene si no es de México (probado: sin VPN se detuvo).
- Aprendido: cambiar el agente enfocado desde la consola (App.selectAgent) deja la sesión abierta con la identidad de otro
  agente. Abrir cada agente desde su ficha de la tripulación.
- Pendiente: modo de aprobación de RADAR, LUPA, VIGÍA y PAUTA (hoy piden permiso para cada escritura y cada clic del
  navegador; la rutina del lunes se quedará esperando), conector de Search Console, Drive para los briefs, Slack #research-tc-20.
