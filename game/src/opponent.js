// SIGILBOUND — Vex, the AI opponent. His hand is face-up, so his choices must be readable
// and counterable: he scores every card he can afford against every card you can afford,
// assumes you answer with your best reply, and plays the card whose worst case hurts least.
// A little jitter keeps him from being a solved puzzle.
import { cardTotal } from './duel.js';

// Score one candidate card from Vex's hand: damage dealt minus damage taken, judged by the
// worst reply you have and the average reply, with keyword value folded in.
function scoreCard(state, card) {
  const me = state.ai;
  const you = state.player;
  const yourReplies = you.hand.filter((c) => c.cost <= you.energy);
  if (yourReplies.length === 0) {
    // You cannot answer: the card lands unopposed.
    return cardTotal(card, null, state.attuned) * 2 + (card.keyword === 'siphon' ? 4 : 0);
  }
  let worst = Infinity;
  let sum = 0;
  for (const reply of yourReplies) {
    const myTotal = cardTotal(card, reply, state.attuned);
    const yourTotal = cardTotal(reply, card, state.attuned);
    let dealt = 0;
    let taken = 0;
    if (myTotal > yourTotal) dealt = Math.max(1, myTotal - yourTotal);
    else if (yourTotal > myTotal) taken = Math.max(1, yourTotal - myTotal);
    else { dealt = 0; taken = 1; }
    if (card.keyword === 'ember' && myTotal > yourTotal) dealt += 2;
    if (card.keyword === 'siphon' && myTotal > yourTotal) dealt += 2; // life is worth damage
    if (reply.keyword === 'sunder' && yourTotal < myTotal) taken += 2;
    const value = dealt - taken;
    sum += value;
    if (value < worst) worst = value;
  }
  const avg = sum / yourReplies.length;
  let score = worst * 2 + avg;
  // When hurt, Vex values a Siphon win more; when ahead, he banks his heavy cards.
  if (me.life <= 8 && card.keyword === 'siphon') score += 3;
  if (me.life > you.life + 6 && card.cost >= 3) score -= 1.5;
  // A cheap card that still wins keeps the big guns for later.
  if (card.cost <= 2 && worst > 0) score += 0.5;
  return score;
}

export function chooseCard(state) {
  const affordable = state.ai.hand.filter((c) => c.cost <= state.ai.energy);
  if (affordable.length === 0) return null; // hold
  let best = null;
  let bestScore = -Infinity;
  for (const card of affordable) {
    const score = scoreCard(state, card) + state.rng() * 1.2; // jitter
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}
