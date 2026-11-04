# Instalación en macOS (Apple Silicon)

Tribuna Central 2.0 Offices se usa desde el código fuente en el navegador. No hace falta
compilar la app de escritorio (Tauri/Rust); eso queda como opción para la fase 6.

## 1. Requisitos

- macOS en Apple Silicon (M1 o posterior).
- [Node.js 22](https://nodejs.org/) y npm (`node --version` debe mostrar v22.x).
- Git.
- [Claude Code](https://claude.com/claude-code) instalado y con sesión iniciada
  (`claude auth status`). Es el proveedor por defecto de los agentes; si prefieres otro
  (OpenRouter, Anthropic API, Ollama local…) se elige en SETTINGS → PROVIDERS.

## 2. Clonar e instalar

```bash
git clone https://github.com/andrew2e/tribunacentral2.0.git
cd tribunacentral2.0
npm ci
```

`npm ci` instala las dependencias fijadas en `package-lock.json` (entre ellas `node-pty`, que
compila un módulo nativo para el terminal de los agentes; si falla, instala las Xcode Command
Line Tools con `xcode-select --install` y repite).

## 3. Arrancar

Arranque normal (pantalla de bienvenida y creación de agentes a mano):

```bash
node sidecar/index.js
```

Arranque con la redacción precargada (recomendado): materializa el seed de
`dev/fixtures/tc-offices/` en un workspace de trabajo y abre la app ya configurada:

```bash
node dev/seed.js --fixture tc-offices --keep
```

En ambos casos abre <http://127.0.0.1:8787> en el navegador. Para cambiar el puerto:
`PORT=9000 node sidecar/index.js`.

## 4. Dónde quedan los datos

El workspace (agentes, memoria, transcripciones, gasto, tareas) se guarda en
`~/.local/share/StarNet/workspaces` cuando arrancas con `node sidecar/index.js`, o en la carpeta
que indique `dev/seed.js` cuando usas el seed. Las claves de proveedores van al llavero de
macOS, nunca a archivos del proyecto. Nada sale de la máquina salvo las llamadas al proveedor
de modelos y las herramientas de red que un agente use con tu aprobación.

## 5. Actualizar

```bash
git pull
npm ci
```

Este proyecto no sigue las versiones nuevas de StarNet (ver `UPSTREAM.md`).
