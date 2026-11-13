# Tribuna Central 2.0 Offices — guía para sesiones de Claude Code

Lee esto primero. Después, `docs/BRAIN.md` (orientación técnica de 5 minutos heredada de
StarNet) y `docs/TC_OFFICES_PLAN.md` (el plan de fases y el diseño de la redacción).

## Qué es este proyecto

Una **redacción digital local** para Tribuna Central: una app de escritorio (Node sidecar +
frontend en canvas) donde agentes de IA, organizados por departamentos, hacen trabajo real
para el medio. Es un fork de StarNet (`UPSTREAM.md` fija la versión base y lo que la
licencia no cubre). El único usuario es Andrés Eloy, Editor en Jefe de Tribuna Central;
corre en su Mac (Apple Silicon) y se usa en el navegador (`node sidecar/index.js` →
http://127.0.0.1:8787). El shell Tauri es opcional y queda para el final.

## Decisiones fijas (no re-litigar)

| Tema | Decisión |
| --- | --- |
| Nombre | **Tribuna Central 2.0 Offices**. Nunca "StarNet" en nada visible al usuario. |
| Identificadores internos | Se conservan (`starnet.*`, `skynet.*`, `SKYNET_*`, nombres de archivos, claves de localStorage). StarNet hizo lo mismo al renombrarse desde Skynet. Renombrarlos rompe tests y saves sin beneficio. |
| Idioma | La **interfaz queda en inglés**; los **agentes hablan y escriben en español** (instrucciones, nombres de salas y de agentes en español). No traducir la UI salvo pedido explícito. |
| Modelo | Proveedor por defecto `claude-cli` (usa el Claude Code instalado y su sesión; no guarda claves). Otros proveedores siguen disponibles. |
| Arte | **Arte propio** de TC (personajes y muebles). Hasta que exista, el arte heredado es solo para uso local de una persona. Nunca redistribuir el fork con el arte de StarNet. |
| Upstream | No se persigue. Solo cherry-picks puntuales (ver `UPSTREAM.md`). |
| Usuarios | Uno. No hacen falta cuentas, equipos, ni relays/canales de mensajería (Telegram, Discord, Signal, Matrix, Slack como canal de chat). Slack solo como conector para avisar a escritores. |

## Los cinco departamentos

Sala = equipo con permisos; objeto colocado = capacidad real (`sidecar/capability/registry.js`:
`computer`=pensar, `dish`=web, `cabinet`=archivos, `notebook`=memoria, `workbench`=terminal,
`connector`=MCP, `orchestrator`=delegar, `studio`=imágenes).

| Departamento | Función | Capacidades |
| --- | --- | --- |
| **Investigación** | Research de contenido; vigilancia de novedades de las casas de apuestas y casinos que ya reseña TC; competencia; investigación técnica de apps y sitios (SONDA, `docs/TC_REA.md`) | web, archivos, memoria, Ahrefs, cron, REA en Safe Cell |
| **Dirección de contenido** | Gerencia editorial: planifica tandas, asigna temas a los escritores, controla el board | Drive, Trello, archivos, orquestador |
| **QA** | Revisa las entregas de los escritores (gramática, hechos, voz TC, completitud, SEO on-page), devuelve cambios o los aplica | Drive/Docs, archivos, Slack (aviso a escritores), bucle de revisión |
| **SEO** | Auditorías GSC/Ahrefs, keywords, canibalización, on-page, enlazado interno | Ahrefs, GSC, WordPress (Yoast), web |
| **Desarrollo web** | Soporte técnico de tribunacentral.com: WordPress, publicación, código | terminal, archivos, GitHub, WP Royal MCP |

El detalle de agentes, roles y salas está en `docs/TC_OFFICES_PLAN.md`. Las skills propias de
TC (`qa-copywriters-tc`, `publicar-articulos-wp-tc`, `asignaciones-editoriales-tc`,
`auditoria-gsc`) se portan a `skills-catalog/skills/` en la fase 4.

## Dónde se personaliza (datos, no motor)

- `dev/fixtures/tc-offices/` — el **seed de la redacción**: `agent.roster.json` (agentes:
  `agentId, name, system, model, provider, role, skills, approvalMode`) y un `<agentId>.save.json`
  por agente. `node dev/seed.js` lo materializa. **Primero edita el seed, no el código.**
- `frontend/app/worldmodel.js` — `freshDoc()` (estación inicial), `BAY_ROLES`, `BLUEPRINTS`
  (líneas prearmadas: `revision_loop` es exactamente el flujo escritor→revisor→aprobado).
- `shared/specialties.js` — catálogo de clases (researcher, reviewer, optimizer=SEO, engineer,
  publisher=Content Manager, copywriter, foreman=Team Lead…). Contrato congelado: solo añadir.
- `sidecar/capability/registry.js` — objeto → herramientas y permisos.
- `skills-catalog/skills/<slug>/` — `SKILL.md` + `skill.json` + `references/`.
- `frontend/assets/brand/` — logo y wordmark. `frontend/assets/sprites/manifest.json` y
  `frontend/assets/industrial/*/manifest.json` — personajes y muebles.

## Reglas de trabajo

- Respeta la **ley del producto** heredada: la interfaz nunca afirma un estado que el harness no
  pueda probar (nada de métricas, trabajo o gasto simulados).
- `shared/` es un contrato congelado: cambios solo aditivos, nunca renombrar ni borrar eventos.
- La mayoría de los bugs son de costura emisor → store → render; traza el camino completo.
- Antes de "arreglar" algo que un doc dice que falta, `grep` el código: los docs de `docs/`
  envejecen en horas (ver `docs/INDEX.md`).
- Tests: `npm run test:fast` es la puerta de merge (~50 min). Para cambios acotados corre los
  tests del área (`node --test test/<archivo>.test.js`) y arranca el sidecar para comprobar
  que levanta. `npm ci` antes de nada (hay dependencias; el README original ya no es exacto).
- No commits de binarios nuevos grandes, `node_modules/`, `dev/.scratch-workspace/`, claves ni
  `.env.dev`.
- Commits en español o inglés, estilo Conventional Commits (`feat(seed): …`, `chore(brand): …`).
- `main` es la rama de trabajo. `feat/harness-backend` es la copia intacta del upstream: no tocar.

## Qué podar (fase 6), no antes

Canales de mensajería (`sidecar/channels/` salvo SSE hub y secrets), `relay/`, proveedor
"StarNet Managed" (`sidecar/providers/registry.js` id `starnet`), jukebox/Spotify, skills de
fitness/receipts/job-hunting, `website/`, `gal/`, `loops/` y la maquinaria de release pública
(`.github/workflows/release*.yml`, `scripts/release-*`). Podar antes de tener la redacción
funcionando solo añade riesgo.
