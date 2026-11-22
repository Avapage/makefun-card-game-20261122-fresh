// SIGILBOUND — hands, keys and the turn flow: select a card, commit it, watch the reveal,
// then the round settles and the next one begins. Click a selected card again (or Enter) to play.
import { beginNextRound, resolveRound } from './duel.js';
import { chooseCard } from './opponent.js';
import { renderAll, renderArena, showEnd } from './render.js';
import { confettiBurst, damageFloater } from './animate.js';
import { sfx, setEnabled, isEnabled } from './audio.js';

const $ = (id) => document.getElementById(id);

function removeFromHand(side, card) {
  const i = side.hand.findIndex((c) => c.uid === card.uid);
  if (i >= 0) side.hand.splice(i, 1);
}

function commitPicks(game) {
  const { state, ui } = game;
  state.phase = 'reveal';
  ui.selectedUid = null;
  state.lastRound = null;
  renderAll(state, ui);
  sfx.play();
  // The reveal: backs down first, then the flip.
  setTimeout(() => {
    renderArena(state, 'faces');
    sfx.reveal();
    setTimeout(() => settleRound(game), 500);
  }, 650);
}

function settleRound(game) {
  const { state, ui } = game;
  const before = { player: state.player.life, ai: state.ai.life };
  const result = resolveRound(state);
  const loser = result.winner === 'player' ? 'ai' : result.winner === 'ai' ? 'player' : null;
  if (loser) {
    const dealt = before[loser] - state[loser].life;
    if (dealt > 0) damageFloater(`-${dealt}`, `${loser}-life-fill`);
    sfx.hurt();
  }
  renderAll(state, ui);
  if (state.phase === 'over') {
    showEnd(state);
    if (state.winner === 'player') { confettiBurst(); sfx.win(); }
    else sfx.lose();
    return;
  }
  setTimeout(() => {
    beginNextRound(state);
    renderAll(state, ui);
  }, 1600);
}

function playCard(game, card) {
  const { state } = game;
  if (state.phase !== 'pick') return;
  if (card.cost > state.player.energy) return;
  // Vex decides FIRST, from the full pre-pick state: he must weigh the card you are
  // about to play, not only the hand you have left after playing it.
  state.aiPick = chooseCard(state);
  if (state.aiPick) {
    removeFromHand(state.ai, state.aiPick);
    state.ai.energy -= state.aiPick.cost;
  }
  removeFromHand(state.player, card);
  state.player.energy -= card.cost;
  state.playerPick = card;
  commitPicks(game);
}

function holdTurn(game) {
  const { state } = game;
  if (state.phase !== 'pick') return;
  state.playerPick = null;
  state.aiPick = chooseCard(state);
  if (state.aiPick) {
    removeFromHand(state.ai, state.aiPick);
    state.ai.energy -= state.aiPick.cost;
  }
  commitPicks(game);
}

export function attachControls(game) {
  const { ui } = game;
  ui.onPick = (card) => {
    const state = game.state;
    if (state.phase !== 'pick') return;
    if (card.cost > state.player.energy) { sfx.click(); return; }
    if (ui.selectedUid === card.uid) { playCard(game, card); return; }
    ui.selectedUid = card.uid;
    sfx.select();
    renderAll(state, ui);
  };

  $('hold-btn').addEventListener('click', () => holdTurn(game));
  $('new-duel-btn').addEventListener('click', () => game.restart());
  $('begin-btn').addEventListener('click', () => {
    $('title-screen').classList.add('hidden');
    sfx.click();
  });
  $('again-btn').addEventListener('click', () => game.restart());
  $('sound-toggle').addEventListener('click', (e) => {
    setEnabled(!isEnabled());
    e.target.textContent = isEnabled() ? 'SOUND ON' : 'SOUND OFF';
  });

  document.addEventListener('keydown', (e) => {
    const state = game.state;
    if (state.phase === 'over' && (e.key === 'r' || e.key === 'R')) { game.restart(); return; }
    if (state.phase !== 'pick') return;
    if (e.key >= '1' && e.key <= '9') {
      const card = state.player.hand[Number(e.key) - 1];
      if (card) ui.onPick(card);
    } else if (e.key === 'Enter') {
      const card = state.player.hand.find((c) => c.uid === ui.selectedUid);
      if (card) playCard(game, card);
    } else if (e.key === 'Escape') {
      ui.selectedUid = null;
      renderAll(state, ui);
    }
  });
}
