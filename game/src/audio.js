// SIGILBOUND — sound: tiny WebAudio synth blips. No audio files, no network.
// The context is created on the first user gesture, so browsers never autoplay-block it.
let ctx = null;
let enabled = true;

export function setEnabled(on) { enabled = on; }
export function isEnabled() { return enabled; }

function audio() {
  if (!enabled) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type = 'sine', gain = 0.08, when = 0) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ac.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + dur + 0.02);
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.05); },
  select() { tone(520, 0.07, 'triangle', 0.06); tone(780, 0.07, 'triangle', 0.05, 0.05); },
  play() { tone(330, 0.12, 'sawtooth', 0.05); tone(495, 0.14, 'sawtooth', 0.04, 0.08); },
  reveal() { tone(880, 0.1, 'square', 0.04); tone(1174, 0.16, 'square', 0.04, 0.09); },
  hurt() { tone(180, 0.22, 'sawtooth', 0.07); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, 'triangle', 0.08, i * 0.12)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'sine', 0.07, i * 0.14)); },
};
