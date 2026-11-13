# Tribuna Central 2.0 Offices — plan de fases y diseño de la redacción

Estado: **fase 1 completada, fase 2 y 3 iniciadas** (2026-11-04). Este documento es el plan
vivo; se actualiza al cerrar cada fase.

## Fases

| # | Fase | Qué incluye | Estado |
| --- | --- | --- | --- |
| 1 | Base | Fork, versión fijada (`UPSTREAM.md`), arranque desde fuente, `CLAUDE.md` | ✅ |
| 2 | Marca | Nombre en todo lo visible, logo y wordmark TC, paleta, README propio | 🟡 nombre, textos, paleta TC (tema `tc`, por defecto) y wordmark provisional en paths (`dev/make-tc-wordmark.py`) listos; logo/wordmark definitivos pendientes de Jerome |
| 3 | Redacción precargada | Seed con cinco departamentos y sus agentes; estación con cinco salas y líneas de trabajo | 🟡 roster, saves y estación de cinco salas listos (`dev/tc-offices/build-station.js`, comprobada en navegador); faltan las líneas de trabajo |
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
