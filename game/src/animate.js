// SIGILBOUND — motion: damage floaters over the life bars and a confetti burst for a win.
export function damageFloater(text, nearElementId, heal = false) {
  const anchor = document.getElementById(nearElementId);
  if (!anchor) return;
  const box = document.getElementById('floaters');
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = `floater${heal ? ' heal' : ''}`;
  el.textContent = text;
  el.style.left = `${rect.left + rect.width / 2 - 20}px`;
  el.style.top = `${rect.top - 8}px`;
  box.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

const CONFETTI_COLORS = ['#d8a93b', '#e5484d', '#3f8cff', '#e8a13c', '#3fbf7f', '#f4ead2'];

export function confettiBurst(count = 90) {
  const box = document.getElementById('confetti');
  box.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = `${Math.random() * 1.2}s`;
    piece.style.animationDuration = `${2.4 + Math.random() * 1.6}s`;
    box.appendChild(piece);
  }
  setTimeout(() => { box.innerHTML = ''; }, 5200);
}

// Static confetti for the staged win screenshot: pieces frozen mid-air, no animation.
export function confettiStill(count = 40) {
  const box = document.getElementById('confetti');
  box.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.animation = 'none';
    piece.style.top = `${8 + Math.random() * 70}vh`;
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    box.appendChild(piece);
  }
}
