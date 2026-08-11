import confetti from 'canvas-confetti';

const COLORS = ['#FFD93D', '#FF9F45', '#FF6B9D', '#6BCB77', '#4D96FF', '#9B72CF'];

export function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: COLORS,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: COLORS,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function fireBigConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 }, colors: COLORS };

  function shoot(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  shoot(0.25, { spread: 26, startVelocity: 55 });
  shoot(0.2, { spread: 60 });
  shoot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  shoot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  shoot(0.1, { spread: 120, startVelocity: 45 });
}

export function fireStarConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    shapes: ['star'],
    colors: ['#FFD93D', '#FF9F45'],
  });
}