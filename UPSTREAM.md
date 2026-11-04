# Origen del código

Este repositorio es un fork de **StarNet** (https://github.com/androoAGI/starnet),
un harness local-first de agentes de IA creado por Andrew Sims y publicado bajo
licencia MIT (ver `LICENSE` y `NOTICE.md`).

## Versión base fijada

| Dato | Valor |
| --- | --- |
| Repositorio upstream | `androoAGI/starnet` |
| Rama upstream | `feat/harness-backend` (la rama por defecto del autor) |
| Commit base | `74fcd5040ba0eb93c8f9fa07b2d0a9fcfddd1475` |
| Fecha del commit | 2026-10-29 |
| Versión de StarNet | 0.14.1 |
| Fork creado | 2026-11-04 |

La rama `feat/harness-backend` de este repositorio se conserva **sin tocar** como
copia exacta de ese commit. Todo el trabajo de Tribuna Central 2.0 Offices vive en
`main`. Para comparar con el upstream o traer una corrección puntual:

```bash
git remote add upstream https://github.com/androoAGI/starnet   # una sola vez
git fetch --depth 200 upstream feat/harness-backend
git log --oneline 74fcd50..upstream/feat/harness-backend        # qué ha cambiado arriba
git cherry-pick <sha>                                            # traer un fix concreto
```

Decisión: **no se persigue el upstream.** StarNet cambia a diario y su autor
trabaja solo; este fork se mantiene sobre la versión fijada y solo incorpora
correcciones concretas cuando hagan falta.

## Lo que la licencia MIT NO cubre

El código es MIT. El nombre StarNet, el logo, el arte de la estación y los
sprites **no están licenciados** (NOTICE.md, sección "StarNet's own name and
artwork"). Por eso este proyecto:

- se llama **Tribuna Central 2.0 Offices** y no usa el nombre ni el logo de StarNet;
- reemplaza el arte y los sprites por arte propio (fase 5 del plan en
  `docs/TC_OFFICES_PLAN.md`); hasta que esa fase termine, el arte heredado solo
  se usa en local, por una sola persona, y no se redistribuye;
- conserva intactos los avisos de licencia de terceros de `NOTICE.md`.
