#!/usr/bin/env node
/* dev/tc-connect-trello.mjs — registra Trello (servidor MCP por stdio, atlassian-trello-mcp) como conector de TABLERO.

   Uso, con la redacción ya arrancada y Docker abierto:
     TRELLO_API_KEY=... TRELLO_TOKEN=... node dev/tc-connect-trello.mjs           # solo lectura (por defecto)
     TRELLO_API_KEY=... TRELLO_TOKEN=... node dev/tc-connect-trello.mjs --write   # permite crear y mover cards

   La clave y el token se leen de las variables de entorno de tu Terminal: no se escriben en el repositorio
   ni se imprimen. El sidecar los guarda en la configuración local de conectores de tu Mac (dev/.scratch-*),
   igual que si los escribieras en el formulario STDIO del panel Connectors. TABLERO debe usar el perfil
   SAFE CELL (ya viene así en el seed) y Docker debe estar corriendo. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const port = String(process.env.STARNET_PORT || process.env.SKYNET_PORT || process.env.PORT || '8787');
const base = 'http://127.0.0.1:' + port;
const preset = JSON.parse(fs.readFileSync(path.join(HERE, 'tc-offices', 'trello-connector.json'), 'utf8'));

function fail(msg) { console.error('\n[tc-connect-trello] ' + msg + '\n'); process.exit(1); }

const key = (process.env.TRELLO_API_KEY || '').trim();
const tok = (process.env.TRELLO_TOKEN || '').trim();
if (!key || !tok) fail('faltan TRELLO_API_KEY y TRELLO_TOKEN en esta ventana de Terminal. Ver docs/TC_OFFICES_PLAN.md, sección Redacción.');

const write = process.argv.includes('--write');
preset.env = Object.assign({}, preset.env, { TRELLO_API_KEY: key, TRELLO_TOKEN: tok, TRELLO_READ_ONLY: write ? 'false' : 'true' });

if (process.argv.includes('--dry-run')) {
  console.log('POST ' + base + '/api/connectors (modo ' + (write ? 'escritura' : 'solo lectura') + ', credenciales ocultas)');
  process.exit(0);
}

let page;
try { page = await (await fetch(base + '/')).text(); }
catch (e) { fail('no hay sidecar en ' + base + ' (' + (e && e.message) + '). Arranca la redacción primero.'); }
const m = /window\.__STARNET_API_TOKEN__=("[^"]+")/.exec(page);
if (!m) fail('la página de ' + base + ' no trae el token de la API; ¿es Tribuna Central 2.0 Offices?');
const token = JSON.parse(m[1]);

const res = await fetch(base + '/api/connectors', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-starnet-token': token, origin: base },
  body: JSON.stringify(preset)
});
let out; try { out = await res.json(); } catch (_) { out = {}; }
console.log('[tc-connect-trello] HTTP ' + res.status + ' · modo=' + (write ? 'escritura' : 'solo lectura') +
  ' · saved=' + out.saved + ' · connected=' + out.connected +
  (out.state ? ' · state=' + out.state : '') + (out.toolCount != null ? ' · tools=' + out.toolCount : '') +
  (out.code ? ' · ' + out.code : '') + (out.error ? ' · ' + out.error : ''));
if (!res.ok || out.saved === false) process.exit(1);
if (!out.connected) console.log('[tc-connect-trello] guardado, pero aún sin conectar: revisa que Docker esté abierto y pulsa Reload en Connectors.');
