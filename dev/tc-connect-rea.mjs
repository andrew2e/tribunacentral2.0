#!/usr/bin/env node
/* dev/tc-connect-rea.mjs — registra REA (ingeniería inversa, servidor MCP por stdio) como conector de SONDA.

   Uso, con la redacción ya arrancada (node dev/seed.js --fixture tc-offices --keep):
     node dev/tc-connect-rea.mjs            # usa dev/tc-offices/rea-connector.json
     node dev/tc-connect-rea.mjs --dry-run  # solo muestra lo que enviaría

   Hace lo mismo que el formulario STDIO (Safe Cell) del panel Connectors: un POST /api/connectors al
   sidecar local. No guarda ni imprime el token de la API; lo lee de la página servida en loopback, igual
   que el navegador. El sidecar decide si conecta: SONDA debe usar el perfil SAFE CELL y Docker debe estar
   corriendo; si no, responde con el motivo y no se finge una conexión. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const port = String(process.env.STARNET_PORT || process.env.SKYNET_PORT || process.env.PORT || '8787');
const base = 'http://127.0.0.1:' + port;
const presetPath = path.join(HERE, 'tc-offices', 'rea-connector.json');
const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));

function fail(msg) { console.error('\n[tc-connect-rea] ' + msg + '\n'); process.exit(1); }

if (process.argv.includes('--dry-run')) {
  console.log('POST ' + base + '/api/connectors');
  console.log(JSON.stringify(preset, null, 2));
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
const line = 'HTTP ' + res.status + ' · saved=' + out.saved + ' · connected=' + out.connected +
  (out.state ? ' · state=' + out.state : '') + (out.toolCount != null ? ' · tools=' + out.toolCount : '') +
  (out.code ? ' · ' + out.code : '') + (out.error ? ' · ' + out.error : '');
console.log('[tc-connect-rea] ' + line);
if (!res.ok || out.saved === false) process.exit(1);
if (!out.connected) console.log('[tc-connect-rea] guardado, pero aún sin conectar: revisa que Docker esté abierto y pulsa Reload en Connectors.');
