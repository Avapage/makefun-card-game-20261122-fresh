// SIGILBOUND — the card catalogue: every card's name, power, sigil, cost and keyword.
// Suits are told apart by colour AND shape: Flame ▲ red, Tide ● blue, Stone ◆ amber, Gale ✦ green.
// Keywords: Siphon (heal 2 when your card wins the round), Sunder (deal 2 even when your card
// loses the round), Ember (+2 damage when your sigil beats the other card's sigil).

export const SIGILS = {
  flame: { key: 'flame', name: 'Flame', glyph: '▲', beats: 'gale' },
  tide: { key: 'tide', name: 'Tide', glyph: '●', beats: 'flame' },
  stone: { key: 'stone', name: 'Stone', glyph: '◆', beats: 'tide' },
  gale: { key: 'gale', name: 'Gale', glyph: '✦', beats: 'stone' },
};

export const SIGIL_KEYS = ['flame', 'tide', 'stone', 'gale'];

export const KEYWORD_TEXT = {
  siphon: 'Siphon — heal 2 on a win',
  sunder: 'Sunder — deal 2 even on a loss',
  ember: 'Ember — +2 damage on sigil advantage',
};

// power, cost: cost roughly tracks power (1–2 cheap, 3–4 heavy); keyword cards pay ~1 power.
export const CATALOGUE = [
  { id: 'coal-sprite', name: 'Coal Sprite', power: 1, sigil: 'flame', cost: 1, keyword: null },
  { id: 'ember-imp', name: 'Ember Imp', power: 2, sigil: 'flame', cost: 1, keyword: null },
  { id: 'cinder-wisp', name: 'Cinder Wisp', power: 3, sigil: 'flame', cost: 1, keyword: null },
  { id: 'flame-hound', name: 'Flame Hound', power: 4, sigil: 'flame', cost: 2, keyword: null },
  { id: 'pyre-knight', name: 'Pyre Knight', power: 5, sigil: 'flame', cost: 2, keyword: null },
  { id: 'inferno-drake', name: 'Inferno Drake', power: 7, sigil: 'flame', cost: 3, keyword: null },
  { id: 'wildfire', name: 'Wildfire', power: 8, sigil: 'flame', cost: 3, keyword: 'ember' },
  { id: 'ash-phoenix', name: 'Ash Phoenix', power: 9, sigil: 'flame', cost: 4, keyword: 'siphon' },
  { id: 'dew-sprite', name: 'Dew Sprite', power: 1, sigil: 'tide', cost: 1, keyword: null },
  { id: 'coral-sage', name: 'Coral Sage', power: 2, sigil: 'tide', cost: 1, keyword: null },
  { id: 'tide-runner', name: 'Tide Runner', power: 3, sigil: 'tide', cost: 1, keyword: null },
  { id: 'reef-guardian', name: 'Reef Guardian', power: 4, sigil: 'tide', cost: 2, keyword: null },
  { id: 'mist-serpent', name: 'Mist Serpent', power: 5, sigil: 'tide', cost: 2, keyword: 'siphon' },
  { id: 'undertow', name: 'Undertow', power: 6, sigil: 'tide', cost: 3, keyword: 'sunder' },
  { id: 'deep-leviathan', name: 'Deep Leviathan', power: 8, sigil: 'tide', cost: 3, keyword: null },
  { id: 'pebble', name: 'Pebble', power: 1, sigil: 'stone', cost: 1, keyword: null },
  { id: 'moss-troll', name: 'Moss Troll', power: 2, sigil: 'stone', cost: 1, keyword: null },
  { id: 'basalt-hound', name: 'Basalt Hound', power: 3, sigil: 'stone', cost: 1, keyword: null },
  { id: 'amber-aegis', name: 'Amber Aegis', power: 4, sigil: 'stone', cost: 2, keyword: 'ember' },
  { id: 'stone-golem', name: 'Stone Golem', power: 5, sigil: 'stone', cost: 2, keyword: null },
  { id: 'granite-warden', name: 'Granite Warden', power: 6, sigil: 'stone', cost: 3, keyword: null },
  { id: 'quake-beast', name: 'Quake Beast', power: 7, sigil: 'stone', cost: 3, keyword: 'sunder' },
  { id: 'mountain-king', name: 'Mountain King', power: 9, sigil: 'stone', cost: 4, keyword: null },
  { id: 'zephyr', name: 'Zephyr', power: 1, sigil: 'gale', cost: 1, keyword: null },
  { id: 'breeze-imp', name: 'Breeze Imp', power: 2, sigil: 'gale', cost: 1, keyword: null },
  { id: 'sky-dancer', name: 'Sky Dancer', power: 3, sigil: 'gale', cost: 1, keyword: null },
  { id: 'gale-falcon', name: 'Gale Falcon', power: 4, sigil: 'gale', cost: 2, keyword: null },
  { id: 'cloud-shepherd', name: 'Cloud Shepherd', power: 5, sigil: 'gale', cost: 2, keyword: 'siphon' },
  { id: 'storm-roc', name: 'Storm Roc', power: 7, sigil: 'gale', cost: 3, keyword: null },
  { id: 'tempest-djinn', name: 'Tempest Djinn', power: 8, sigil: 'gale', cost: 4, keyword: 'ember' },
];

export function cardById(id) {
  return CATALOGUE.find((c) => c.id === id) || null;
}

export function sigilBeats(a, b) {
  return SIGILS[a] && SIGILS[a].beats === b;
}
