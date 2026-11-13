# REA en Tribuna Central 2.0 Offices — investigación técnica

Estado: **integrado en el seed, pendiente de la primera conexión en el Mac** (2026-11-13). El registro
del conector se probó contra el sidecar; la conexión dentro de Docker no, porque la máquina donde se
preparó no tenía Docker.

## Qué es

[REA](https://github.com/andrew2e/rea) (Reverse Engineer Anything, fork de `morluto/rea`) es un servidor
MCP para entender cómo funciona una app o un sitio sin tener su código fuente. Aquí es la herramienta de
**SONDA**, la agente de investigación técnica del departamento de Investigación.

Para qué sirve en TC: ver cómo implementa un competidor o un operador una función (calculadora, marcador,
comparador de cuotas, flujo de registro), respaldar con evidencia lo que una reseña afirma sobre una app, y
entregar a FORJA una descripción precisa de lo que hay que construir.

## Cómo está montado

| Pieza | Dónde | Detalle |
| --- | --- | --- |
| Agente | `dev/fixtures/tc-offices/` (`sonda`) | Clase `engineer`, perfil **SAFE CELL**, aprobación `ask` |
| Conector | `dev/tc-offices/rea-connector.json` | stdio, `npx -y rea-agents@6.9.0 mcp`, propietario `sonda` |
| Registro | `dev/tc-connect-rea.mjs` | Equivale al formulario STDIO (Safe Cell) del panel Connectors |
| Imagen de la celda | `seed.json` → `env.STARNET_DOCKER_IMAGE` | `node:24-bookworm` (REA exige Node ^22.23.4 o ^24.22.1; la imagen por defecto es Node 20) |

Decisiones:

- **Celda aislada, no el Mac.** El harness solo permite servidores MCP por comando dentro de una Safe Cell
  (Docker). Encaja con el uso: lo que SONDA analiza es software ajeno y no confiable.
- **Versión fijada a 6.9.0 de npm.** Es la primera que respeta `REA_MCP_TOOL_FAMILIES`; con 6.8.0 (la
  versión que declara el fork) el servidor anuncia las 229 herramientas completas.
- **Tres familias de herramientas: `application,electron,session`.** Cubren análisis estático de
  JavaScript, sitios y apps Electron, comparación de versiones y evidencia, sin navegador ni
  descompiladores. El catálogo completo pesa unos 300 KB por turno; no lo actives entero.

## Puesta en marcha (una vez)

1. Instala y abre Docker Desktop en el Mac.
2. Arranca la redacción: `node dev/seed.js --fixture tc-offices --keep`.
3. En otra terminal: `node dev/tc-connect-rea.mjs`. Debe terminar con `connected=true` y el número de
   herramientas. La primera vez tarda: Docker descarga la imagen y `npx` instala REA dentro de la celda.
4. En la estación, coloca un objeto **connector** en la sala de SONDA (sin él, una Safe Cell no recibe
   herramientas de conectores).

Si el paso 3 dice `saved=true · connected=false`, el conector quedó guardado y el motivo aparece en la misma
línea y en el panel Connectors; corrige la causa y pulsa Reload.

Una estación que ya estaba guardada con `--keep` no recibe a SONDA sola: el seed no pisa un save existente.
Arranca una vez sin `--keep`, o créala desde la interfaz con perfil SAFE CELL y pon en `agentId` del
preset el id que le asigne la app.

## Uso

Copia el objetivo al espacio de trabajo de SONDA (`<workspace>/sonda/`, que la celda ve como `/workspace`) y
pídele la pregunta concreta, por ejemplo: «En `/workspace/calculadora/`, ¿cómo calcula el retorno de una
apuesta combinada? Dame la evidencia».

## Ampliaciones opcionales

Cada una se activa añadiendo la familia a `REA_MCP_TOOL_FAMILIES` y volviendo a ejecutar el script.

| Familia | Para qué | Requiere en la celda |
| --- | --- | --- |
| `browser` | Capturar una página en vivo y exportar sus scripts | Chromium con depuración remota |
| `android,apktool` | APK de apps de apuestas | Java y JADX |
| `artifact` | Instaladores, binarios Go/Rust, WASM, SQLite | Nada extra |
| `native` | Binarios nativos | Ghidra u otro proveedor |

## Límites de uso

Están escritos en las instrucciones de SONDA y aplican a cualquier encargo: solo software y sitios obtenidos
de forma legítima y pública; nada de evadir inicios de sesión, pagos, licencias o protecciones anticopia; no
se extraen credenciales ni datos personales; no se prueban servidores de terceros; no se copia código ajeno,
se describe el comportamiento. Los términos de uso de algunas apps prohíben la ingeniería inversa: revísalos
antes de publicar algo basado en un análisis.
