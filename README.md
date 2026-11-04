# Tribuna Central 2.0 Offices

**La redacción digital local de Tribuna Central: agentes de IA organizados por departamentos
que hacen trabajo real para el medio.**

Una app local-first para una sola persona (Andrés Eloy, Editor en Jefe). Los agentes viven en
una oficina pixel-art dividida en cinco departamentos; cada sala es un equipo con permisos y
cada objeto colocado es una capacidad real (web, archivos, terminal, conectores). El layout
que dibujas es el flujo de trabajo que los agentes ejecutan.

| Departamento | Qué hace |
| --- | --- |
| **Investigación** | Research de contenido y vigilancia de las casas de apuestas y casinos que TC reseña |
| **Dirección de contenido** | Planifica las tandas y asigna temas a los escritores |
| **QA** | Revisa las entregas de los escritores y devuelve o aplica correcciones |
| **SEO** | Auditorías GSC/Ahrefs, on-page, enlazado interno |
| **Desarrollo web** | Soporte técnico de tribunacentral.com y publicación en WordPress |

El diseño completo está en [docs/TC_OFFICES_PLAN.md](docs/TC_OFFICES_PLAN.md). La guía para
trabajar en el código con Claude Code está en [CLAUDE.md](CLAUDE.md).

## Arrancar

Requisitos: Node.js 22, npm, Git, y [Claude Code](https://claude.com/claude-code) instalado y
con sesión iniciada (es el "cerebro" por defecto; no se guarda ninguna clave).

```bash
git clone https://github.com/andrew2e/tribunacentral2.0.git
cd tribunacentral2.0
npm ci
node sidecar/index.js
```

Abre <http://127.0.0.1:8787>. Para arrancar con la redacción ya precargada (cinco
departamentos y sus agentes) usa el seed, descrito en [INSTALL.md](INSTALL.md).

## Qué es real

- Las llamadas a modelos pasan por el sidecar local; las herramientas operan con comprobaciones
  explícitas de capacidad y consentimiento.
- Memoria, transcripciones, gasto, tareas y programaciones persisten en disco.
- Varios agentes corren a la vez con workspaces y permisos separados.
- La interfaz nunca afirma un estado que el harness no pueda probar.

## Origen y licencia

Este proyecto es un fork de [StarNet](https://github.com/androoAGI/starnet), de Andrew Sims,
cuyo código se publica bajo licencia MIT (ver [LICENSE](LICENSE), [NOTICE.md](NOTICE.md) y
[UPSTREAM.md](UPSTREAM.md)). El nombre, el logo y el arte de StarNet no forman parte de esa
licencia y no se usan aquí: este proyecto lleva su propio nombre y, progresivamente, su propio
arte. Los documentos originales de StarNet se conservan en `docs/upstream/`.

Uso privado. No es un producto público ni está afiliado a StarNet.
