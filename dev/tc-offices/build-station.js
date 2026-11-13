#!/usr/bin/env node
/* dev/tc-offices/build-station.js — construye la estación de cinco salas de Tribuna Central 2.0 Offices y la guarda
   en el seed (dev/fixtures/tc-offices/agent.save.json → doc.station).

     node dev/tc-offices/build-station.js           # construye, comprueba y escribe el seed
     node dev/tc-offices/build-station.js --check   # construye y comprueba, sin escribir

   Usa el mismo constructor que BUILD MODE (StationBuilder, patrón "ring"): la sala central es Dirección de contenido y
   alrededor van Investigación, QA, SEO y Desarrollo web, unidas por pasillos. Después sienta a cada agente en un
   escritorio de su sala y coloca los objetos de capacidad de cada departamento (web, archivos, memoria, terminal y el
   CONNECTOR de REA para SONDA). Termina comprobando que cada objeto se puede alcanzar caminando, que cada agente tiene
   su escritorio en su sala y que la estación pasa la validación de guardado. Si algo falla, no escribe nada.

   Ojo con los permisos: un agente queda limitado a los objetos de SU sala solo cuando trabaja en una línea de trabajo
   (una bahía, `bay`), así lo decide WorldModel.agentRoomId. Con escritorio y sin línea, recibe los objetos de toda la
   estación. Esta estación todavía no tiene líneas: las salas ordenan la oficina, no separan permisos. */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const APP = path.join(REPO, 'frontend', 'app');
const req = f => require(path.join(APP, f));
const M = req('worldmodel.js'), P = req('pipeline.js'), W = req('workflowline.js');
const SB = req('stationbuilder.js'), T = req('stationtemplates.js'), S = req('propsprites.js');
const { capScope } = require(path.join(REPO, 'sidecar', 'capability', 'cap-scope.js'));
const { checkedStation } = require(path.join(REPO, 'sidecar', 'capability', 'saved-placement.js'));
const SAVE = path.join(REPO, 'dev', 'fixtures', 'tc-offices', 'agent.save.json');
const CHECK_ONLY = process.argv.includes('--check');

M.setPropRules(t => { const s = S.spec(t); return s ? { mount: s.mount || null, stack: !!s.stack, surface: !!s.surface, flat: !!s.flat } : null; });
const env = { WorldModel: M, Pipeline: P, WorkflowLine: W, crew: [{ id: 'agent', name: 'PAUTA' }], heroId: 'agent', StationTemplates: T, PropSprites: S,
  EquipmentHelp: req('equipmenthelp.js'), RoomStyles: req('roomstyles.js'), LineLayout: req('linelayout.js'), LineEdit: req('lineedit.js') };

function die(msg) { console.error('\n[build-station] ' + msg + '\n'); process.exit(1); }

/* La redacción. `hub` = la sala central (la de inicio, que ya trae los cinco objetos esenciales).
   agents: quién se sienta en la sala (agentId) · gear: objetos de capacidad que se añaden ·
   needs: capacidades que el departamento necesita (cuando haya líneas de trabajo, serán las de su sala). */
const DIRECCION = 'DIRECCIÓN DE CONTENIDO';
const PLAN = [
  { name: DIRECCION, hub: true, agents: ['agent', 'tablero'], gear: [],
    needs: ['cabinet', 'computer', 'dish', 'notebook', 'studio', 'workbench'] },
  { name: 'INVESTIGACIÓN', style: 'desks', size: 'large', agents: ['lupa', 'vigia', 'radar', 'sonda'],
    gear: ['comms_dish', 'gigs_servercart', { t: 'connector_portal', connectorId: 'rea' }],
    needs: ['cabinet', 'computer', 'connector', 'dish', 'notebook'] },
  { name: 'QA', style: 'desks', size: 'large', agents: ['corrector', 'verificador', 'voz', 'cierre'], gear: ['comms_dish'],
    needs: ['cabinet', 'computer', 'dish'] },
  { name: 'SEO', style: 'desks', agents: ['ranking', 'enlace'], gear: ['comms_dish'],
    needs: ['cabinet', 'computer', 'dish'] },
  { name: 'DESARROLLO WEB', style: 'workshop', agents: ['forja', 'prensa'], gear: ['rack', 'comms_dish'],
    needs: ['cabinet', 'computer', 'dish', 'workbench'] }
];
const SEATS = { desk: 1, desk2: 1, console: 1, consoleL: 1, pixelrig: 1, bench: 1 };

// 1. salas y pasillos, con el constructor de BUILD MODE
const st = M.create(M.starterDoc());
const hubId = st.spawnRoomId();
if (!hubId || !st.roomById(hubId)) die('la estación inicial no tiene sala de inicio');
const layout = { layout: { pattern: 'ring', rooms: PLAN.filter(r => !r.hub).map(r => Object.assign({ name: r.name, style: r.style }, r.size ? { size: r.size } : {})) } };
const pb = SB.planBuild(st.serialize(), layout, env);
if (!pb.ok) die('el constructor rechazó el plano: ' + pb.error);
const ap = SB.apply(st, pb.plan, env);
if (!ap.ok) die('el constructor no pudo aplicar el plano: ' + ap.error);
if (!st.renameRoom(hubId, DIRECCION).ok) die('no se pudo renombrar la sala central');

const roomByName = name => st.rooms().find(r => r.name === name);
const propsIn = roomId => st.props().filter(p => st.roomAt(p.x, p.y) === roomId);

// ¿se llega caminando a un objeto desde el centro de la sala de inicio? (la misma regla que el constructor)
function reachCheck() {
  const g = st.projectGeometry(), ox = g.origin.tx, oy = g.origin.ty;
  const r = st.roomById(hubId).rects[0], cx = (r.x1 + r.x2) >> 1, cy = (r.y1 + r.y2) >> 1;
  let o = null, bd = Infinity;
  for (let y = r.y1; y <= r.y2; y++) for (let x = r.x1; x <= r.x2; x++) {
    const d = Math.abs(x - cx) + Math.abs(y - cy);
    if (d < bd && g.walkable(x - ox, y - oy)) { bd = d; o = { x, y }; }
  }
  return p => {
    for (let y = p.y - 1; y <= p.y + p.h; y++) for (let x = p.x - 1; x <= p.x + p.w; x++) {
      const edgeY = y === p.y - 1 || y === p.y + p.h, edgeX = x === p.x - 1 || x === p.x + p.w;
      if (edgeY === edgeX) continue;
      if (g.walkable(x - ox, y - oy) && g.path(o.x - ox, o.y - oy, x - ox, y - oy)) return true;
    }
    return false;
  };
}

/* coloca un objeto en la sala: prueba casillas desde la pared del fondo hacia delante y se queda con la primera donde
   cabe, no corta el paso a nada de lo que ya hay y se puede alcanzar */
function place(roomId, t, isDesk) {
  const sp = S.spec(t);
  if (!sp) die('no existe el objeto ' + t);
  const w = sp.w || 1, h = sp.h || 1, rect = st.roomById(roomId).rects[0];
  for (let y = rect.y1 + 1; y <= rect.y2; y++) for (let x = rect.x1; x <= rect.x2; x++) {
    if (!st.canPlaceProp(t, x, y, w, h).ok) continue;
    if (isDesk) {   // un escritorio necesita libre la fila de abajo, donde va la silla
      let seat = false;
      for (let sx = x; sx < x + w; sx++) {
        const pid = st.propAt(sx, y + 1), q = pid && st.propById(pid);
        if (st.roomAt(sx, y + 1) === roomId && (!q || q.block === false)) seat = true;
      }
      if (!seat) continue;
    }
    const res = st.addProp({ t, x, y, w, h, r: 0 });
    if (!res || !res.ok) continue;
    const reach = reachCheck();
    if (st.props().every(p => p.block === false || reach(p))) return res.id;
    st.removeProp(res.id);
  }
  die('no hay sitio en ' + st.roomById(roomId).name + ' para ' + t);
}

// 2. cada agente a un escritorio de su sala, y los objetos de cada departamento
for (const room of PLAN) {
  const rm = roomByName(room.name);
  if (!rm) die('falta la sala ' + room.name);
  for (const aid of room.agents) {
    const own = st.props().find(p => p.agentId === aid && SEATS[p.t] && st.roomAt(p.x, p.y) === rm.id);
    if (own) continue;
    const seat = propsIn(rm.id).find(p => SEATS[p.t] && !p.agentId) || st.propById(place(rm.id, 'desk', true));
    const r = st.assignPropAgent(seat.id, aid);
    if (!r || !r.ok) die('no se pudo sentar a ' + aid + ' en ' + room.name);
  }
  for (const g of room.gear) {
    const t = typeof g === 'string' ? g : g.t;
    const id = place(rm.id, t, false);
    if (g.connectorId && !st.bindConnector(id, g.connectorId).ok) die('no se pudo unir el connector a ' + g.connectorId);
  }
}

// 3. comprobaciones
const reach = reachCheck();
const stuck = st.props().filter(p => p.block !== false && !reach(p));
if (stuck.length) die('objetos a los que no se llega caminando: ' + stuck.map(p => p.t + '@' + p.x + ',' + p.y).join(', '));
const station = st.serialize();
const saved = checkedStation({ station });
if (!saved) die('la estación no pasa la validación de guardado');

const lines = [];
let bad = 0;
for (const room of PLAN) {
  for (const aid of room.agents) {
    const desks = st.props().filter(p => p.agentId === aid && SEATS[p.t]);
    const where = desks.length ? desks.map(d => st.roomById(st.roomAt(d.x, d.y)).name).join(' + ') : '(sin escritorio)';
    const sc = capScope(saved, aid);
    const ok = desks.length === 1 && where === room.name && !(sc && sc.scoped);
    if (!ok) bad++;
    lines.push((ok ? '  ok  ' : '  !!  ') + aid.padEnd(12) + where);
  }
}
const have = [...new Set(st.props().map(p => st.capForProp(p.t)).filter(Boolean))].sort();
const missing = [...new Set([].concat(...PLAN.map(r => r.needs)))].filter(t => !have.includes(t));
const portal = st.props().find(p => p.t === 'connector_portal');
console.log('\n  agente      sala de su escritorio');
console.log(lines.join('\n'));
console.log('\n  connector: ' + (portal ? st.roomById(st.roomAt(portal.x, portal.y)).name + ' → ' + portal.connectorId : 'NINGUNO'));
console.log('  capacidades en la estación: ' + have.join(', '));
console.log('  salas: ' + st.rooms().filter(r => r.kind !== 'corridor').map(r => r.name).join(' · ') + '  ·  objetos: ' + st.props().length);
if (bad || !portal || missing.length) {
  die((bad ? bad + ' agente(s) sin un único escritorio en su sala. ' : '') + (!portal ? 'falta el connector. ' : '')
    + (missing.length ? 'faltan capacidades: ' + missing.join(', ') + '. ' : '') + 'No se escribe el seed.');
}

// 4. al seed
if (CHECK_ONLY) { console.log('\n  --check: todo correcto; no se escribe nada.\n'); process.exit(0); }
const save = JSON.parse(fs.readFileSync(SAVE, 'utf8'));
save.doc.station = station;
fs.writeFileSync(SAVE, JSON.stringify(save, null, 2) + '\n');
console.log('\n  escrito en ' + path.relative(REPO, SAVE) + '\n');
