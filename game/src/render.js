// SIGILBOUND — the table: draws the duelists, their hands, the arena, the log and the banners.
// Every value the judge needs is on screen at once: both hands, both life bars, energy, decks.
import { SIGILS, KEYWORD_TEXT } from './cards.js';
import { MAX_LIFE } from './duel.js';

const $ = (id) => document.getElementById(id);

export function cardEl(card, size = '') {
  const sigil = SIGILS[card.sigil];
  const el = document.createElement('div');
  el.className = `card sigil-${card.sigil}${size ? ` card-${size}` : ''}`;
  el.dataset.uid = card.uid;
  el.dataset.cost = card.cost;
  const costPips = '●'.repeat(card.cost) + '<span class="spent">' + '○'.repeat(Math.max(0, 4 - card.cost)) + '</span>';
  el.innerHTML =
    `<div class="cost-row"><span class="cost-pips" title="Energy cost ${card.cost}">${costPips}</span>` +
    `<span class="sigil-glyph sigil-${card.sigil}" title="${sigil.name}">${sigil.glyph}</span></div>` +
    `<div class="power">${card.power}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="keyword">${card.keyword ? KEYWORD_TEXT[card.keyword].split(' — ')[0] : ''}</div>`;
  el.title = `${card.name} — ${sigil.name} ${sigil.glyph}, power ${card.power}, cost ${card.cost}` +
    (card.keyword ? `. ${KEYWORD_TEXT[card.keyword]}` : '');
  return el;
}

export function cardBackEl(size = '') {
  const el = document.createElement('div');
  el.className = `card card-back${size ? ` card-${size}` : ''}`;
  el.textContent = '✦';
  return el;
}

function energyPips(energy, max) {
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="${i < energy ? 'pip-on' : 'pip-off'}">●</span>`;
  }
  return html;
}

function renderVitals(prefix, side) {
  $(`${prefix}-life-fill`).style.width = `${Math.max(0, (side.life / MAX_LIFE) * 100)}%`;
  $(`${prefix}-life-fill`).classList.toggle('low', side.life <= 6);
  $(`${prefix}-life-text`).textContent = `${side.life} / ${MAX_LIFE}`;
  $(`${prefix}-energy-pips`).innerHTML = energyPips(side.energy, side.maxEnergy);
  $(`${prefix}-energy-text`).textContent = `${side.energy}/${side.maxEnergy}`;
  $(`${prefix}-deck-text`).textContent = `${side.deck.length} card${side.deck.length === 1 ? '' : 's'}`;
}

function renderHand(containerId, hand, opts) {
  const box = $(containerId);
  box.innerHTML = '';
  for (const card of hand) {
    const el = cardEl(card, opts.size || '');
    if (opts.playable) {
      el.classList.toggle('unaffordable', card.cost > opts.energy);
      if (opts.selectedUid === card.uid) el.classList.add('selected');
      if (opts.onPick) el.addEventListener('click', () => opts.onPick(card));
    }
    box.appendChild(el);
  }
}

// The arena: 'empty' (no cards), 'backs' (both picks face-down), 'faces' (revealed).
export function renderArena(state, mode) {
  const aiSlot = $('ai-played');
  const pSlot = $('player-played');
  aiSlot.innerHTML = '';
  pSlot.innerHTML = '';
  aiSlot.classList.remove('empty');
  pSlot.classList.remove('empty');
  if (mode === 'empty') {
    aiSlot.classList.add('empty');
    pSlot.classList.add('empty');
    aiSlot.innerHTML = '<span class="slot-hint">waiting…</span>';
    pSlot.innerHTML = '<span class="slot-hint">pick a card below</span>';
    return;
  }
  const aiCard = mode === 'backs' ? state.aiPick : state.lastRound?.aiCard;
  const pCard = mode === 'backs' ? state.playerPick : state.lastRound?.playerCard;
  if (aiCard) aiSlot.appendChild(mode === 'backs' ? cardBackEl('arena') : cardEl(aiCard, 'arena'));
  else { aiSlot.classList.add('empty'); aiSlot.innerHTML = '<span class="slot-hint">Vex holds</span>'; }
  if (pCard) pSlot.appendChild(mode === 'backs' ? cardBackEl('arena') : cardEl(pCard, 'arena'));
  else { pSlot.classList.add('empty'); pSlot.innerHTML = '<span class="slot-hint">You hold</span>'; }
  if (mode === 'faces' && state.lastRound) {
    const winEl = state.lastRound.winner === 'player' ? pSlot.firstChild : state.lastRound.winner === 'ai' ? aiSlot.firstChild : null;
    const loseEl = state.lastRound.winner === 'player' ? aiSlot.firstChild : state.lastRound.winner === 'ai' ? pSlot.firstChild : null;
    if (winEl) winEl.classList.add('flip-in', 'lunge');
    if (loseEl) loseEl.classList.add('flip-in', 'shake');
  }
}

function renderBanner(state) {
  const banner = $('round-banner');
  if (state.phase === 'over') {
    banner.innerHTML = state.winner === 'player'
      ? `<b>VICTORY.</b> ${state.overReason}`
      : `<b>DEFEAT.</b> ${state.overReason}`;
    return;
  }
  if (state.phase === 'reveal') {
    banner.textContent = 'Both cards are down — reveal!';
    return;
  }
  if (state.lastRound) {
    const r = state.lastRound;
    const line = r.winner === 'tie'
      ? `Round ${r.round} tied ${r.playerTotal}–${r.aiTotal} — both take 1.`
      : r.winner === 'player'
        ? `Round ${r.round}: you win ${r.playerTotal}–${r.aiTotal} — Vex takes <span class="dmg">${r.damage}</span>.`
        : `Round ${r.round}: Vex wins ${r.aiTotal}–${r.playerTotal} — you take <span class="dmg">${r.damage}</span>.`;
    banner.innerHTML = line + (r.events.length ? ` ${r.events.join(' ')}` : '');
    return;
  }
  banner.innerHTML = 'Choose a card. Vex is watching your hand too.';
}

function renderLog(state) {
  const list = $('duel-log');
  list.innerHTML = '';
  for (const entry of state.log.slice(-30)) {
    const li = document.createElement('li');
    if (entry.tone) li.className = entry.tone;
    li.innerHTML = `<span class="r">ROUND ${entry.round || '—'}</span>${entry.text}`;
    list.appendChild(li);
  }
  list.scrollTop = list.scrollHeight;
}

export function showEnd(state) {
  const card = $('end-screen').querySelector('.end-card');
  card.classList.toggle('win', state.winner === 'player');
  card.classList.toggle('loss', state.winner !== 'player');
  $('end-sigils').innerHTML = state.winner === 'player'
    ? '<span class="sigil-glyph sigil-flame">▲</span><span class="sigil-glyph sigil-tide">●</span><span class="sigil-glyph sigil-stone">◆</span><span class="sigil-glyph sigil-gale">✦</span>'
    : '<span class="sigil-glyph" style="color:#9aa5b1">✦</span>';
  $('end-title').textContent = state.winner === 'player' ? 'VICTORY' : 'DEFEAT';
  $('end-line').textContent = state.overReason;
  $('end-stats').innerHTML =
    `<div><b>${state.round}</b>rounds</div>` +
    `<div><b>${state.roundsWon.player}–${state.roundsWon.ai}</b>rounds won</div>` +
    `<div><b>${state.player.life}</b>life left</div>`;
  $('end-screen').classList.remove('hidden');
}

export function hideOverlays() {
  $('title-screen').classList.add('hidden');
  $('end-screen').classList.add('hidden');
}

export function renderAll(state, ui) {
  $('round-num').textContent = state.round;
  const attuned = $('attuned-badge');
  attuned.className = state.attuned ? `attuned-${state.attuned}` : 'attuned-none';
  $('attuned-sigil').textContent = state.attuned ? `${SIGILS[state.attuned].glyph} ${SIGILS[state.attuned].name}` : '—';
  renderVitals('ai', state.ai);
  renderVitals('player', state.player);
  renderHand('ai-hand', state.ai.hand, { size: 'mini' });
  renderHand('player-hand', state.player.hand, {
    playable: state.phase === 'pick',
    energy: state.player.energy,
    selectedUid: ui.selectedUid,
    onPick: ui.onPick,
  });
  $('hold-btn').classList.toggle('hidden',
    !(state.phase === 'pick' && state.player.hand.length > 0 && state.player.hand.every((c) => c.cost > state.player.energy)));
  // Arena: picks on the table show face-down until the flip; a settled round stays visible.
  if (state.playerPick || state.aiPick) renderArena(state, 'backs');
  else if (state.lastRound) renderArena(state, 'faces');
  else renderArena(state, 'empty');
  renderBanner(state);
  renderLog(state);
  document.title = state.phase === 'over'
    ? (state.winner === 'player' ? 'VICTORY — SIGILBOUND' : 'DEFEAT — SIGILBOUND')
    : `SIGILBOUND — Round ${state.round}`;
}
