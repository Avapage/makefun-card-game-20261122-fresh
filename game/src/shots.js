// SIGILBOUND — staged scenes for screenshots: ?scene=title | duel | win | loss.
// Every scene is fixed (no randomness), so the screenshots are reproducible frame for frame.
import { cardById, SIGILS } from './cards.js';
import { renderAll, showEnd } from './render.js';
import { confettiStill } from './animate.js';

const $ = (id) => document.getElementById(id);

function shotCard(id, n) {
  const base = cardById(id);
  return { ...base, uid: `shot-${id}-${n}` };
}

function setHands(state, playerIds, aiIds) {
  state.player.hand = playerIds.map((id, i) => shotCard(id, i));
  state.ai.hand = aiIds.map((id, i) => shotCard(id, i));
  state.player.deck = state.player.deck.slice(0, 18);
  state.ai.deck = state.ai.deck.slice(0, 18);
}

function stageDuel(game) {
  const { state, ui } = game;
  state.phase = 'pick';
  state.round = 6;
  state.attuned = 'flame';
  state.player.life = 14;
  state.ai.life = 17;
  state.player.maxEnergy = 6; state.player.energy = 5;
  state.ai.maxEnergy = 6; state.ai.energy = 4;
  setHands(state,
    ['wildfire', 'mist-serpent', 'stone-golem', 'gale-falcon', 'coral-sage'],
    ['storm-roc', 'pyre-knight', 'undertow', 'basalt-hound', 'zephyr']);
  const wildfire = state.player.hand[0];
  const stormRoc = state.ai.hand[0];
  state.lastRound = {
    round: 6, playerCard: wildfire, aiCard: stormRoc,
    playerTotal: 13, aiTotal: 7, winner: 'player', damage: 8,
    events: ["Wildfire's Ember sears for +2."],
  };
  state.log = [
    { round: 4, text: 'Vex takes the round: Granite Warden 9 vs Tide Runner 4 — you take 5.', tone: 'bad' },
    { round: 5, text: 'You take the round: Mist Serpent 7 vs Breeze Imp 3 — Vex takes 4. Mist Serpent Siphons 2 life back.', tone: 'good' },
    { round: 6, text: 'You take the round: Wildfire 13 vs Storm Roc 7 — Vex takes 8.', tone: 'good' },
    { round: 6, text: "Wildfire's Ember sears for +2.", tone: 'good' },
  ];
  state.roundsWon = { player: 3, ai: 2 };
  $('title-screen').classList.add('hidden');
  $('end-screen').classList.add('hidden');
  renderAll(state, ui);
}

function stageEnd(game, won) {
  const { state, ui } = game;
  state.phase = 'over';
  state.winner = won ? 'player' : 'ai';
  state.round = won ? 11 : 9;
  state.roundsWon = won ? { player: 7, ai: 4 } : { player: 3, ai: 5 };
  state.player.life = won ? 9 : 0;
  state.ai.life = won ? 0 : 12;
  state.overReason = won
    ? 'Vex falls. The sigils are yours.'
    : 'Your light gutters out. Vex keeps the table.';
  state.log = [
    { round: state.round, text: state.overReason, tone: won ? 'good' : 'bad' },
  ];
  setHands(state,
    ['ash-phoenix', 'mountain-king'],
    ['deep-leviathan', 'tempest-djinn']);
  $('title-screen').classList.add('hidden');
  renderAll(state, ui);
  showEnd(state);
  if (won) confettiStill(40);
}

export function stageScene(game, scene) {
  if (scene === 'duel') stageDuel(game);
  else if (scene === 'win') stageEnd(game, true);
  else if (scene === 'loss') stageEnd(game, false);
  // 'title' (or anything else): leave the title screen up over a fresh table.
}

export function sceneFromUrl() {
  const scene = new URLSearchParams(window.location.search).get('scene');
  return scene || 'title';
}

export { SIGILS };
