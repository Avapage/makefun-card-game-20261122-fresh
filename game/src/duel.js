// SIGILBOUND — the duel rules: rounds, the sigil wheel, Attunement, keywords, fatigue, victory.
// Pure logic, no DOM: render.js draws whatever this returns.
import { sigilBeats } from './cards.js';
import { buildDeck, drawCards, makeRng } from './deck.js';

export const MAX_LIFE = 20;
export const MAX_ENERGY = 6;
export const HAND_SIZE = 5;

export function newDuelist(name) {
  return {
    name, life: MAX_LIFE, energy: 2, maxEnergy: 2,
    hand: [], deck: [], discard: [], fatigue: 0,
  };
}

export function createDuel(seed = (Date.now() % 2147483647)) {
  const rng = makeRng(seed);
  const state = {
    seed, rng,
    phase: 'title', // title | pick | reveal | over
    round: 1,
    attuned: null, // sigil key the last round's winner set: +2 power next round
    player: newDuelist('You'),
    ai: newDuelist('VEX'),
    playerPick: null,
    aiPick: null,
    lastRound: null,
    log: [],
    winner: null,
    overReason: '',
    roundsWon: { player: 0, ai: 0 },
  };
  state.player.deck = buildDeck(rng);
  state.ai.deck = buildDeck(rng);
  return state;
}

export function startDuel(state) {
  state.phase = 'pick';
  state.round = 1;
  state.attuned = null;
  state.log = [{ round: 0, text: 'The duel begins. Vex lays his hand face-up — read it, then strike.', tone: '' }];
  for (const side of [state.player, state.ai]) {
    side.life = MAX_LIFE;
    side.energy = 2; side.maxEnergy = 2;
    side.fatigue = 0; side.discard = [];
    side.hand = [];
    drawCards(side, HAND_SIZE).forEach((c) => { if (!c.fatigue) side.hand.push(c); });
  }
  state.playerPick = null; state.aiPick = null; state.lastRound = null;
  state.winner = null; state.overReason = '';
  state.roundsWon = { player: 0, ai: 0 };
}

// One card's fighting total against the foe's card this round.
export function cardTotal(card, foeCard, attuned) {
  if (!card) return 0;
  let total = card.power;
  if (foeCard) {
    if (sigilBeats(card.sigil, foeCard.sigil)) total += 3;
    if (card.sigil === foeCard.sigil) total += 1;
  }
  if (attuned && card.sigil === attuned) total += 2;
  return total;
}

function pushLog(state, text, tone = '') {
  state.log.push({ round: state.round, text, tone });
}

// Both picks are set (a pick is a card object, or null for a hold). Settle the round.
export function resolveRound(state) {
  const p = state.playerPick;
  const a = state.aiPick;
  const pTotal = cardTotal(p, a, state.attuned);
  const aTotal = cardTotal(a, p, state.attuned);

  let winner = null; // 'player' | 'ai' | 'tie'
  if (pTotal > aTotal) winner = 'player';
  else if (aTotal > pTotal) winner = 'ai';
  else winner = 'tie';

  const result = {
    round: state.round, playerCard: p, aiCard: a,
    playerTotal: pTotal, aiTotal: aTotal, winner,
    damage: 0, events: [],
  };

  if (!p && !a) {
    pushLog(state, 'Both duelists hold. The sigils hum, unresolved.', '');
    result.events.push('Both hold — no damage.');
  } else if (winner === 'tie') {
    // A tied round bruises both.
    state.player.life = Math.max(0, state.player.life - 1);
    state.ai.life = Math.max(0, state.ai.life - 1);
    result.damage = 1;
    result.events.push('Dead even — both duelists take 1.');
    pushLog(state, `${nameOf(p)} meets ${nameOf(a)} dead even (${pTotal} vs ${aTotal}) — both take 1.`, '');
  } else {
    const winCard = winner === 'player' ? p : a;
    const loseCard = winner === 'player' ? a : p;
    const winSide = winner === 'player' ? state.player : state.ai;
    const loseSide = winner === 'player' ? state.ai : state.player;
    let damage = Math.max(1, Math.abs(pTotal - aTotal));
    const hadAdvantage = loseCard ? sigilBeats(winCard.sigil, loseCard.sigil) : false;
    if (winCard.keyword === 'ember' && hadAdvantage) {
      damage += 2;
      result.events.push(`${winCard.name}'s Ember sears for +2.`);
    }
    loseSide.life = Math.max(0, loseSide.life - damage);
    result.damage = damage;
    if (winCard.keyword === 'siphon') {
      winSide.life = Math.min(MAX_LIFE, winSide.life + 2);
      result.events.push(`${winCard.name} Siphons 2 life back.`);
    }
    if (loseCard && loseCard.keyword === 'sunder') {
      winSide.life = Math.max(0, winSide.life - 2);
      result.events.push(`${loseCard.name}'s Sunder bites back for 2.`);
    }
    state.attuned = winCard.sigil;
    state.roundsWon[winner] += 1;
    const verb = winner === 'player' ? 'You take the round' : 'Vex takes the round';
    pushLog(state,
      `${verb}: ${nameOf(p)} ${pTotal} vs ${nameOf(a)} ${aTotal} — ${loseSide.name} takes ${damage}.`,
      winner === 'player' ? 'good' : 'bad');
    for (const e of result.events) pushLog(state, e, winner === 'player' ? 'good' : 'bad');
  }

  if (p) state.player.discard.push(p);
  if (a) state.ai.discard.push(a);
  state.lastRound = result;
  state.playerPick = null;
  state.aiPick = null;

  checkDeaths(state, winner);
  return result;
}

function nameOf(card) {
  return card ? card.name : 'a held hand';
}

// A duelist at 0 life loses. A double fall goes to the round's winner; a tie, or a fall
// with no round to judge it (fatigue), goes to you.
function checkDeaths(state, roundWinner) {
  const pDead = state.player.life <= 0;
  const aDead = state.ai.life <= 0;
  if (!pDead && !aDead) return;
  state.phase = 'over';
  if (pDead && aDead) {
    // A double fall with no round winner goes to the duelist still standing taller.
    state.winner = roundWinner === 'ai' ? 'ai' : 'player';
    state.overReason = 'Both duelists fall at once — the round decides it.';
  } else if (aDead) {
    state.winner = 'player';
    state.overReason = 'Vex falls. The sigils are yours.';
  } else {
    state.winner = 'ai';
    state.overReason = 'Your light gutters out. Vex keeps the table.';
  }
  pushLog(state, state.overReason, state.winner === 'player' ? 'good' : 'bad');
}

// Advance to the next round: more energy, a fresh card each (fatigue if the deck is dry).
export function beginNextRound(state) {
  if (state.phase === 'over') return;
  state.round += 1;
  state.phase = 'pick';
  for (const side of [state.player, state.ai]) {
    side.maxEnergy = Math.min(MAX_ENERGY, state.round + 1);
    side.energy = side.maxEnergy;
    const drawn = drawCards(side, side.hand.length < HAND_SIZE ? 1 : 0);
    for (const c of drawn) {
      if (c.fatigue) {
        pushLog(state, `${side.name}'s deck is empty — fatigue bites for ${c.fatigue}.`, side === state.player ? 'bad' : 'good');
      } else {
        side.hand.push(c);
      }
    }
    // A hold last round earns a catch-up card.
    if (state.lastRound && ((side === state.player && !state.lastRound.playerCard) || (side === state.ai && !state.lastRound.aiCard))) {
      const extra = drawCards(side, 1);
      for (const c of extra) {
        if (c.fatigue) pushLog(state, `${side.name}'s deck is empty — fatigue bites for ${c.fatigue}.`, side === state.player ? 'bad' : 'good');
        else side.hand.push(c);
      }
    }
  }
  checkDeaths(state, null);
}
