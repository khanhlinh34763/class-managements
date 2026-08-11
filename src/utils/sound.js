let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTickSound() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

export function playBellSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const frequencies = [1046.5, 1318.5, 1568];
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);
    const startTime = now + index * 0.15;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
    oscillator.start(startTime);
    oscillator.stop(startTime + 1.2);
  });
}

export function playSuccessSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
    gainNode.gain.setValueAtTime(0.2, now + index * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
    oscillator.start(now + index * 0.1);
    oscillator.stop(now + index * 0.1 + 0.3);
  });
}

export function playDrumrollSound(durationMs = 1500) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * (durationMs / 1000);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1000;
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  noise.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + durationMs / 1000);
}