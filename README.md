# SIGILBOUND

[![bounty](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Avapage/makefun-card-game-20261122-fresh/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Avapage/makefun-card-game-20261122-fresh/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

A duel of four sigils. You and Vex, Warden of the Four Sigils, face each other across a felt table with 20 life each and decks drawn from the same 30 cards. Every round you each play one card, revealed at the same moment — the sigil wheel, the Attuned sigil and raw power decide who bleeds.

Bounty: https://make.fun/bounty/best-card-game-20261122-1826

## How to play

- **Click a card to select it, click again (or press Enter) to play it.** It costs energy; energy grows by one each round to 6 and refills every turn.
- **Number keys 1–9** pick a card, **Enter** plays the selected card, **Esc** puts it back, **R** starts a new duel after the end.
- **The wheel:** Flame ▲ beats Gale ✦, Gale beats Stone ◆, Stone beats Tide ●, Tide beats Flame — advantage is +3 power. Same sigil: +1 each. The last round's winning sigil becomes **Attuned** (+2 next round), so every win shapes the next hand.
- **Keywords:** Siphon heals 2 on a win, Sunder deals 2 even on a loss, Ember adds +2 damage on sigil advantage.
- **Vex plays face-up.** Read his hand and counter it — he scores every card he can afford against your best reply, so the obvious play is the one he expects.
- An empty deck bites: every card you cannot draw costs escalating life.

## The build

- Static files only, no network, no build step: `game/index.html` opens in desktop Chrome and plays offline. All art is CSS and glyphs; all sound is synthesized with WebAudio.
- `game/src/` is split one job per file: `cards.js` (the catalogue), `deck.js` (build, shuffle, draw, fatigue), `duel.js` (the rules), `opponent.js` (Vex's choices), `render.js` (the table), `animate.js` (floaters, confetti), `audio.js` (the synth), `input.js` (hands, keys, turn flow), `shots.js` (staged screenshot scenes), `main.js` (bootstrap).
- `main.ts` hands the game in: it copies `game/` and `screenshots/` to the output dir and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.
