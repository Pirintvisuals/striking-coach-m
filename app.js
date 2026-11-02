'use strict';
// Striking Coach: one-user, offline, hands-free audio coach. See PLAN.md.

const $ = id => document.getElementById(id);
const LS = {
  get(k, d) { try { const v = localStorage.getItem('sc.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sc.' + k, JSON.stringify(v)); } catch {} },
};
const settings = Object.assign({ defPct: 15, sayAnswer: true, headKicks: true, quick: false }, LS.get('settings', {}));
const saveSettings = () => LS.set('settings', settings);

let LIB = null, SPRITE = null;

// ---------- pausable clock ----------
const clock = {
  t0: 0, offset: 0, pausedAt: null,
  now() { return (this.pausedAt ?? performance.now()) - this.t0 - this.offset; },
  reset() { this.t0 = performance.now(); this.offset = 0; this.pausedAt = null; },
  pause() { if (this.pausedAt == null) this.pausedAt = performance.now(); },
  resume() { if (this.pausedAt != null) { this.offset += performance.now() - this.pausedAt; this.pausedAt = null; } },
};
let run = null; // current session state
class Abort extends Error {}
const tick = ms => new Promise(r => setTimeout(r, ms));
async function waitUntil(t) {
  while (clock.now() < t) {
    if (run.aborted) throw new Abort();
    await tick(Math.max(5, Math.min(50, t - clock.now())));
  }
  if (run.aborted) throw new Abort();
}
const wait = ms => waitUntil(clock.now() + ms);

// ---------- audio: ONE <audio> element playing a sprite (iOS-safe) ----------
const audio = { el: null, ok: false, ctx: null };

function initAudio() {
  audio.el = new Audio('audio/sprite.m4a');
  audio.el.preload = 'auto';
  audio.el.setAttribute('playsinline', '');
}

// Must be called synchronously inside the Start tap.
function unlockAudio() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
  try { speechSynthesis.speak(new SpeechSynthesisUtterance(' ')); } catch {}
  const el = audio.el;
  el.currentTime = 0; // sprite starts with half a second of silence
  const p = el.play();
  return Promise.resolve(p).then(() => { el.pause(); audio.ok = !!SPRITE; })
    .catch(e => { audio.ok = false; console.warn('audio unlock failed', e); });
}

function speak(text) {
  if (!text || !('speechSynthesis' in window)) return Promise.resolve();
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB'; u.rate = 1.1;
    const t = setTimeout(res, 1000 + text.length * 120);
    u.onend = u.onerror = () => { clearTimeout(t); res(); };
    speechSynthesis.speak(u);
  });
}

function beep(freq, ms) { // only used if the sprite is missing
  try {
    audio.ctx = audio.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
    o.frequency.value = freq; g.gain.value = 0.3; o.connect(g).connect(audio.ctx.destination);
    o.start(); o.stop(audio.ctx.currentTime + ms / 1000);
  } catch {}
  return tick(ms);
}
const FX_FALLBACK = { 'fx:bell': [830, 900], 'fx:bell3': [830, 1200], 'fx:beep': [880, 150], 'fx:clack': [1800, 300], 'fx:alert': [1500, 250] };

async function clip(id, text) {
  if (run && run.aborted) throw new Abort();
  const c = SPRITE && SPRITE.clips[id];
  if (!c || !audio.ok) {
    if (id.startsWith('fx:')) return FX_FALLBACK[id] ? beep(...FX_FALLBACK[id]) : undefined;
    return speak(text || (c && c.text));
  }
  const el = audio.el, end = c.s + c.d, started = clock.now();
  el.currentTime = c.s;
  try { await el.play(); } catch { return speak(text || c.text); }
  for (;;) {
    await tick(15);
    if (run && run.aborted) { el.pause(); throw new Abort(); }
    if (clock.pausedAt != null) { if (!el.paused) el.pause(); continue; }
    if (el.paused && !el.ended) { try { await el.play(); } catch {} }
    if (el.currentTime >= end || el.ended) break;
    if (clock.now() - started > c.d * 1000 + 1500) break; // safety net
  }
  el.pause();
}

const NUM = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' };
const spoken = t => t.split(' ').map(w => NUM[w] || w).join(' ');
async function sayTokens(tokens) { for (const t of tokens) await clip('t:' + t, spoken(t)); }

// ---------- library ----------
const parse = s => s.split('|').map(st => st.split(',').map(t => t.trim()).filter(Boolean));
function prepLibrary() {
  for (const k of ['combos', 'traps', 'rare']) for (const e of LIB[k]) {
    e.kind = k === 'traps' ? 'trap' : k === 'rare' ? 'rare' : 'combo';
    e.steps = parse(e.calls);
    e.tags = e.tags || [];
    if (/head kick/.test(e.calls)) e.tags.push('head');
  }
  for (const d of LIB.defence) {
    d.kind = 'def';
    d.answerSteps = parse(d.answer)[0];
    d.tags = [/kick|teep/.test(d.attack) ? 'kick' : 'punch'];
  }
  LIB.byId = {};
  for (const e of [...LIB.combos, ...LIB.traps, ...LIB.rare, ...LIB.defence]) LIB.byId[e.id] = e;
}

const allowed = e => settings.headKicks || !/head kick/.test(e.calls || e.answer);
const weightOf = (e, r) => e.tags.reduce((w, t) => w + (r.weights[t] || 0), 0);
function pickWeighted(list, wfn) {
  const ws = list.map(wfn), sum = ws.reduce((a, b) => a + b, 0);
  if (!sum) return null;
  let x = Math.random() * sum;
  for (let i = 0; i < list.length; i++) { x -= ws[i]; if (x <= 0) return list[i]; }
  return list[list.length - 1];
}

function pickOffence(r, st) {
  const fresh = e => allowed(e) && !st.recent.includes(e.id);
  if (r.trap && Math.random() < r.trap) {
    const t = pickWeighted(LIB.traps.filter(fresh), e => weightOf(e, r));
    if (t) return t;
  }
  return pickWeighted(LIB.combos.filter(fresh), e => weightOf(e, r) * (e.id === st.featured ? 4 : 1))
    || pickWeighted(LIB.combos.filter(allowed), e => weightOf(e, r)) || LIB.combos[0];
}

function pickNext(r, st) {
  const defP = Math.min(0.6, (settings.defPct / 100) * r.def);
  if (r.defTags.length && Math.random() < defP) {
    const d = pickWeighted(LIB.defence.filter(d => allowed(d) && !st.recent.includes(d.id) && r.defTags.includes(d.tags[0])), () => 1);
    if (d) return d;
  }
  return pickOffence(r, st);
}

// ---------- pacing ----------
const PACE = {
  warm:      { per: 0.7,  rec: 2.6, react: 1.2 },
  hard:      { per: 0.45, rec: 1.6, react: 0.6 },
  technical: { per: 0.8,  rec: 3.2, react: 1.2 },
  burnout:   { per: 0.3,  rec: 0.35, react: 0 },
  slow:      { per: 1.1,  rec: 4.0, react: 1.5 },
};
const MOVE = /^(pull|slip|roll|parry|check|catch|block|step|pivot|angle|shoulder|feint)/;
const strikes = ts => ts.reduce((n, t) => n + (MOVE.test(t) ? 0.6 : 1), 0);
const stepGap = (ts, p) => (strikes(ts) * p.per + p.rec) * 1000;
function estimate(e, p) { // ms, rough: ~0.5 s of speech per token
  if (e.kind === 'def') return 1500 + p.react * 1000 + e.answerSteps.length * 500 + stepGap(e.answerSteps, p);
  return e.steps.reduce((ms, s) => ms + s.length * 500 + stepGap(s, p), 0);
}

// ---------- UI during a run ----------
function showCall(text, def) { $('call').textContent = text; $('call').classList.toggle('def', !!def); $('answer').textContent = ''; }
function setPhase(label, durMs, focus) {
  run.phase = { label, end: clock.now() + durMs };
  $('phase').textContent = label;
  $('focus').textContent = focus || '';
  showCall('');
}
function renderClock() {
  if (!run || !run.phase) return;
  const s = Math.max(0, Math.ceil((run.phase.end - clock.now()) / 1000));
  $('clock').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Gap waits double as the 10-second-warning hook.
async function gapWait(ms) {
  const until = clock.now() + ms;
  while (clock.now() < until) {
    if (!run.st.warned && run.phase.end - clock.now() <= 10500) { run.st.warned = true; await clip('fx:clack'); }
    await waitUntil(Math.min(until, clock.now() + 100));
  }
}

async function doItem(e, p) {
  if (e.kind === 'def') {
    showCall(e.attack + ' incoming', true);
    await clip('fx:alert');
    await clip('a:' + e.attack, e.attack);
    await gapWait(p.react * 1000);
    if (settings.sayAnswer) { $('answer').textContent = '→ ' + e.answer; await sayTokens(e.answerSteps); }
    await gapWait(stepGap(e.answerSteps, p));
    return;
  }
  for (let i = 0; i < e.steps.length; i++) {
    const s = e.steps[i];
    showCall(s.join(', ') + (e.steps.length > 1 ? `  (${i + 1}/${e.steps.length})` : ''), false);
    await sayTokens(s);
    await gapWait(stepGap(s, p));
  }
}

async function runRound(spec) {
  const { r, dur, pace, label, rare, featured } = spec;
  const st = run.st = { recent: [], featured, warned: false, rareDone: false };
  setPhase(label, dur, r.focus);
  const end = run.phase.end;
  await clip('fx:bell');
  await clip('f:' + r.id, r.focus);
  const rareAt = rare && Math.random() < 0.6 ? clock.now() + dur * (0.3 + Math.random() * 0.45) : Infinity;
  let first = true;
  for (;;) {
    const remain = end - clock.now();
    if (remain < 5000) break;
    let e;
    if (first && featured) e = LIB.byId[featured];
    else if (clock.now() >= rareAt && !st.rareDone) { st.rareDone = true; e = pickWeighted(LIB.rare, () => 1); }
    else e = pickNext(r, st);
    first = false;
    for (let tries = 0; estimate(e, pace) > remain - 800 && tries < 12; tries++) e = pickNext(r, st);
    if (estimate(e, pace) > remain - 800) break;
    st.recent.push(e.id); if (st.recent.length > 6) st.recent.shift();
    await doItem(e, pace);
  }
  showCall('');
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.roundsDone++;
}

async function runRest(dur, next) {
  setPhase('Rest', dur, next ? 'Next: ' + next.r.focus : '');
  const end = run.phase.end;
  await clip('p:rest', 'Rest.');
  await wait(2000);
  const f = next.featured && LIB.byId[next.featured];
  if (f) {
    showCall('');
    $('answer').textContent = f.why;
    await clip('p:tip', 'Tip for next round.');
    await clip('w:' + f.id, f.why);
  }
  if (end - clock.now() > 10500) { await waitUntil(end - 10000); await clip('p:ten', 'Ten seconds.'); }
  await countIn(end);
}

async function countIn(end) {
  for (const s of [3, 2, 1]) { await waitUntil(end - s * 1000); await clip('fx:beep'); }
  await waitUntil(end);
}

function buildRounds(sess) {
  const q = settings.quick;
  const T = q ? { warm: 30e3, round: 30e3, final: 30e3, rest: 15e3 } : { warm: 120e3, round: 240e3, final: 120e3, rest: 60e3 };
  const mode = sess.mode;
  const rounds = [{ r: LIB.warmup, dur: T.warm, pace: PACE.warm, label: 'Warm-up', rare: false }];
  LIB.plans[sess.plan].forEach((r, i) => rounds.push({ r, dur: T.round, pace: PACE[mode], label: `Round ${i + 1} of 4`, rare: true }));
  rounds.push({ r: LIB.finals[mode], dur: T.final, pace: mode === 'hard' ? PACE.burnout : PACE.slow, label: 'Final round', rare: false });
  // Featured combo per round: its why-line is the rest tip, and it opens that round.
  for (const sp of rounds.slice(1)) sp.featured = pickOffence(sp.r, { recent: [], featured: null }).id;
  return { rounds, rest: T.rest };
}

async function runSession(sess) {
  const { rounds, rest } = buildRounds(sess);
  run.totalRounds = rounds.length;
  setPhase('Get ready', 10000, sess.name + ' · ' + sess.mode);
  await clip('i:' + sess.id, sess.intro);
  await countIn(run.phase.end);
  for (let i = 0; i < rounds.length; i++) {
    if (i > 0) await runRest(rest, rounds[i]);
    await runRound(rounds[i]);
  }
  setPhase('Done', 0, '');
  await clip('p:done', 'Session done. Good work. Rate it and log it.');
}

// ---------- screen wake ----------
let wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      $('wakeInfo').textContent = 'Screen kept awake (Wake Lock).';
      return;
    }
  } catch (e) { console.warn('wake lock', e); }
  try { await $('keepAwake').play(); $('wakeInfo').textContent = 'Screen kept awake (video fallback).'; }
  catch { $('wakeInfo').textContent = 'Could not keep the screen awake: set Auto-Lock to Never.'; }
}
function releaseAwake() {
  try { wakeLock && wakeLock.release(); } catch {}
  wakeLock = null;
  $('keepAwake').pause();
}
document.addEventListener('visibilitychange', () => {
  if (run && !run.finished && document.visibilityState === 'visible') keepAwake();
});

// ---------- screens ----------
function show(id) {
  for (const s of document.querySelectorAll('.screen')) s.classList.toggle('hidden', s.id !== id);
  window.scrollTo(0, 0);
}
let chosen = 0;
const fmtSession = s => `${s.name} — ${s.mode}`;

function renderHome() {
  const next = LS.get('next', 0) % LIB.sessions.length;
  const s = LIB.sessions[chosen];
  $('nextName').textContent = s.name;
  $('nextMode').textContent = s.mode === 'hard' ? 'Hard day' : 'Technical day';
  $('nextRounds').textContent = (chosen === next ? 'Next in rotation. ' : 'Picked manually. ') +
    (settings.quick ? 'QUICK TEST MODE is on.' : 'Warm-up 2 min · 4 × 4 min · final 2 min · 1 min rest.');
  $('pickList').innerHTML = '';
  LIB.sessions.forEach((x, i) => {
    const b = document.createElement('button');
    b.textContent = `${i + 1}. ${x.name} (${x.mode === 'hard' ? 'hard' : 'tech'})`;
    b.classList.toggle('on', i === chosen);
    b.onclick = () => { chosen = i; renderHome(); };
    $('pickList').appendChild(b);
  });
  show('home');
}

$('startBtn').onclick = () => {
  const sess = LIB.sessions[chosen];
  const unlocked = unlockAudio(); // synchronous part runs inside the tap
  keepAwake();
  run = { sess, idx: chosen, aborted: false, finished: false, roundsDone: 0, totalRounds: 6, started: new Date() };
  clock.reset();
  $('pauseBtn').textContent = 'Pause';
  show('run');
  run.timer = setInterval(renderClock, 200);
  unlocked.then(() => runSession(sess)).then(() => finish(true), e => { if (!(e instanceof Abort)) console.error(e); finish(false); });
};
$('pauseBtn').onclick = () => {
  if (clock.pausedAt == null) { clock.pause(); $('pauseBtn').textContent = 'Resume'; }
  else { clock.resume(); $('pauseBtn').textContent = 'Pause'; }
};
$('stopBtn').onclick = () => {
  if (!confirm('Stop the session?')) return;
  clock.resume();
  run.aborted = true;
};

function finish(completed) {
  if (!run || run.finished) return;
  run.finished = true;
  clearInterval(run.timer);
  audio.el.pause();
  try { speechSynthesis.cancel(); } catch {}
  releaseAwake();
  run.completed = completed;
  $('logSummary').textContent = `${fmtSession(run.sess)} · ${run.roundsDone}/${run.totalRounds} rounds` + (completed ? '' : ' (stopped early)');
  rating = 0; renderStars(); $('note').value = '';
  show('logScreen');
}

let rating = 0;
function renderStars() {
  $('stars').innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.textContent = i; b.classList.toggle('on', i === rating);
    b.onclick = () => { rating = i; renderStars(); };
    $('stars').appendChild(b);
  }
}
$('saveLog').onclick = () => {
  if (!rating && !confirm('Save without a rating?')) return;
  const log = LS.get('log', []);
  log.push({
    date: run.started.toISOString(), session: run.sess.id, name: fmtSession(run.sess),
    rounds: `${run.roundsDone}/${run.totalRounds}`, completed: run.completed,
    rating, note: $('note').value.trim(), defPct: settings.defPct, quick: settings.quick,
  });
  LS.set('log', log);
  LS.set('next', (run.idx + 1) % LIB.sessions.length);
  chosen = LS.get('next', 0); run = null; renderHome();
};
$('discardLog').onclick = () => { run = null; renderHome(); };

// ---------- history / export ----------
function exportText() {
  const log = LS.get('log', []);
  const day = d => d.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' });
  const lines = [
    `STRIKING COACH LOG — exported ${new Date().toISOString().slice(0, 10)} — ${log.length} sessions`,
    `Settings: defence calls ${settings.defPct}%, say answer ${settings.sayAnswer ? 'on' : 'off'}, head kicks ${settings.headKicks ? 'on' : 'off'}`,
    `Next in rotation: ${fmtSession(LIB.sessions[LS.get('next', 0)])}`, '',
  ];
  for (const x of log) {
    const d = new Date(x.date);
    lines.push(`${day(d)} ${d.toTimeString().slice(0, 5)} | ${x.name} | ${x.rounds} rounds${x.completed ? '' : ' (stopped)'}${x.quick ? ' (quick test)' : ''} | rating ${x.rating || '-'}/5 | def ${x.defPct}%`);
    if (x.note) lines.push('  Note: ' + x.note.replace(/\n+/g, ' / '));
  }
  return lines.join('\n');
}
function renderHistory() {
  const log = LS.get('log', []);
  $('histList').innerHTML = log.length ? '' : '<p class="small">No sessions logged yet.</p>';
  for (const x of [...log].reverse()) {
    const div = document.createElement('div');
    div.className = 'hist';
    div.innerHTML = `<div><b>${x.rating || '–'}/5</b> ${x.name}</div><div class="small">${new Date(x.date).toLocaleString('en-GB')} · ${x.rounds} rounds</div>`;
    if (x.note) { const p = document.createElement('div'); p.textContent = x.note; div.appendChild(p); }
    $('histList').appendChild(div);
  }
  $('exportMsg').textContent = ''; $('exportBox').classList.add('hidden');
  show('history');
}
$('histBtn').onclick = renderHistory;
$('exportBtn').onclick = async () => {
  const text = exportText();
  try { await navigator.clipboard.writeText(text); $('exportMsg').textContent = 'Copied. Paste it to Claude.'; }
  catch {
    const box = $('exportBox'); box.value = text; box.classList.remove('hidden'); box.select();
    $('exportMsg').textContent = 'Clipboard blocked: select the text below and copy it.';
  }
};

// ---------- settings ----------
function renderSettings() {
  $('defPct').value = settings.defPct; $('defVal').textContent = settings.defPct + '%';
  $('sayAnswer').checked = settings.sayAnswer; $('headKicks').checked = settings.headKicks; $('quick').checked = settings.quick;
  $('rotSel').innerHTML = LIB.sessions.map((s, i) => `<option value="${i}">${i + 1}. ${fmtSession(s)}</option>`).join('');
  $('rotSel').value = LS.get('next', 0);
  $('audioInfo').textContent = SPRITE ? `Voice clips loaded (${Object.keys(SPRITE.clips).length}). ${audio.ok ? 'Audio unlocked.' : ''}` : 'No voice clips found: using the phone\'s built-in voice.';
  show('settings');
}
$('setBtn').onclick = renderSettings;
$('defPct').oninput = e => { settings.defPct = +e.target.value; $('defVal').textContent = settings.defPct + '%'; saveSettings(); };
$('sayAnswer').onchange = e => { settings.sayAnswer = e.target.checked; saveSettings(); };
$('headKicks').onchange = e => { settings.headKicks = e.target.checked; saveSettings(); };
$('quick').onchange = e => { settings.quick = e.target.checked; saveSettings(); };
$('rotSel').onchange = e => { LS.set('next', +e.target.value); chosen = +e.target.value; };
$('testSound').onclick = () => {
  const done = unlockAudio();
  run = { aborted: false, test: true };
  done.then(async () => {
    await clip('fx:bell'); await sayTokens(['1', '2', 'lead head kick']);
    await clip('fx:alert'); await clip('a:cross', 'cross'); await sayTokens(['pull', '2']);
    $('audioInfo').textContent = audio.ok ? 'Played from voice clips.' : 'Played with the built-in voice (no clips).';
    run = null;
  });
};
for (const b of document.querySelectorAll('.back')) b.onclick = renderHome;

// ---------- boot ----------
(async function boot() {
  LIB = await fetch('library.json').then(r => r.json());
  prepLibrary();
  try { SPRITE = await fetch('audio/sprite.json').then(r => r.ok ? r.json() : null); } catch { SPRITE = null; }
  initAudio();
  chosen = LS.get('next', 0) % LIB.sessions.length;
  renderHome();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
