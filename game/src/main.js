// SIGILBOUND — bootstrap: build the duel, draw the table, wire the controls,
// and stage a screenshot scene when ?scene= is given (?scene=title|duel|win|loss).
import { createDuel, startDuel } from './duel.js';
import { renderAll, hideOverlays } from './render.js';
import { attachControls } from './input.js';
import { stageScene, sceneFromUrl } from './shots.js';

function seedFromUrl() {
  const seed = Number(new URLSearchParams(window.location.search).get('seed'));
  return Number.isSafeInteger(seed) && seed > 0 ? seed : (Date.now() % 2147483647);
}

const game = {
  state: createDuel(seedFromUrl()),
  ui: { selectedUid: null, onPick: null },
};

game.restart = () => {
  game.state = createDuel(seedFromUrl());
  startDuel(game.state);
  game.ui.selectedUid = null;
  hideOverlays();
  renderAll(game.state, game.ui);
};

startDuel(game.state);
attachControls(game);
renderAll(game.state, game.ui);
stageScene(game, sceneFromUrl());

// Handle for play-testing and screenshots.
window.SIGILBOUND = game;
