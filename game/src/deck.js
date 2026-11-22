// SIGILBOUND — decks: seeded shuffle, draw, and the fatigue bite of an empty deck.
import { CATALOGUE } from './cards.js';

// Small deterministic PRNG (mulberry32) so staged screenshot scenes replay exactly.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(cards, rng) {
  const deck = cards.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Each duelist gets a full copy of the catalogue, shuffled — same pool, fair fight.
// uid is unique per card instance across both decks, so the table can tell them apart.
let nextUid = 1;
export function buildDeck(rng) {
  return shuffle(CATALOGUE.map((c) => ({ ...c, uid: `c${nextUid++}` })), rng);
}

export function drawCards(duelist, n) {
  const drawn = [];
  for (let i = 0; i < n; i++) {
    if (duelist.deck.length === 0) {
      // An empty deck bites: escalating fatigue damage, 1 then 2 then 3…
      duelist.fatigue += 1;
      duelist.life = Math.max(0, duelist.life - duelist.fatigue);
      drawn.push({ fatigue: duelist.fatigue });
    } else {
      drawn.push(duelist.deck.pop());
    }
  }
  return drawn;
}

export function handHasAffordable(hand, energy) {
  return hand.some((c) => c && c.cost <= energy);
}
