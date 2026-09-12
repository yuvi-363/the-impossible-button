// This file contains the interaction for The Impossible Button game.
const escapeButton = document.querySelector('#summon');
let escapeMode = false;
let mercyMode = false;
let escapesSinceBreak = 0;
let playerScore = 0;
let scoreUnlocked = false;
let audioContext;

function updateGameScore() {
  const display = document.querySelector('#game-score');
  display.textContent = scoreUnlocked ? `score : ${playerScore}` : 'score?';
  display.classList.toggle('score-active', scoreUnlocked);
}

function playButtonSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();

  const duration = 0.34;
  const sound = audioContext.createBufferSource();
  const noise = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const samples = noise.getChannelData(0);
  const filter = audioContext.createBiquadFilter();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;

  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
  sound.buffer = noise;
  filter.type = 'bandpass';
  filter.Q.value = 1.1;
  // Low → bright → low makes the noise feel like it passes by the listener.
  filter.frequency.setValueAtTime(420, now);
  filter.frequency.exponentialRampToValueAtTime(3200, now + 0.13);
  filter.frequency.exponentialRampToValueAtTime(380, now + duration);
  volume.gain.setValueAtTime(0.001, now);
  volume.gain.exponentialRampToValueAtTime(0.16, now + 0.07);
  volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
  sound.connect(filter);
  filter.connect(volume);
  volume.connect(audioContext.destination);
  sound.start(now);
  sound.stop(now + duration);
}

function moveEscapeButton() {
  const rect = sky.getBoundingClientRect();
  const current = escapeButton.getBoundingClientRect();
  const currentX = current.left - rect.left + current.width / 2;
  const currentY = current.top - rect.top + current.height / 2;
  const buttonHalfWidth = current.width / 2 + 10;
  const minX = buttonHalfWidth;
  const maxX = Math.max(minX, rect.width - buttonHalfWidth);
  const minY = 80;
  const maxY = Math.max(minY, rect.height - 80);
  // Keep picking until the new location is clearly away from the last one.
  const minimumJump = Math.min(220, Math.max(90, Math.min(rect.width, rect.height) * 0.48));
  let x, y, distance = 0;
  for (let attempt = 0; attempt < 20 && distance < minimumJump; attempt++) {
    x = minX + Math.random() * (maxX - minX);
    y = minY + Math.random() * (maxY - minY);
    distance = Math.hypot(x - currentX, y - currentY);
  }
  escapeButton.style.left = `${x}px`;
  escapeButton.style.top = `${y}px`;
  escapesSinceBreak++;
  calls++;
  score();
  $('#bubble').textContent = words[calls % words.length];
  hero.style.left = `${x - 35}px`;
  hero.style.top = `${y - 115}px`;
  hero.classList.remove('pose');
  void hero.offsetWidth;
  hero.classList.add('pose');
}

function offerOneClick() {
  mercyMode = true;
  escapesSinceBreak++;
  calls++;
  score();
  escapeButton.querySelector('span').textContent = 'ALRIGHT, ALRIGHT…';
  escapeButton.querySelector('small').textContent = 'click me once';
  toast('alright alright i will let you click me once');
}

function startEscapeGame() {
  escapeMode = true;
  hero.classList.remove('hidden', 'swing');
  void hero.offsetWidth;
  hero.classList.add('swing');
  $('#status').textContent = 'Button escape mode activated!';
  escapeButton.querySelector('span').textContent = 'CATCH ME';
  escapeButton.querySelector('small').textContent = 'if you can';
  moveEscapeButton();
  toast('Uh oh. The button now runs away.');
}

escapeButton.onclick = event => {
  event.stopPropagation();
  playButtonSound();
  if (!escapeMode) {
    startEscapeGame();
  } else if (mercyMode) {
    // This click is intentionally allowed: it does not move the button yet.
    mercyMode = false;
    escapesSinceBreak = 0;
    scoreUnlocked = true;
    playerScore++;
    updateGameScore();
    escapeButton.querySelector('span').textContent = 'YOU GOT ME!';
    escapeButton.querySelector('small').textContent = '…for one second';
    toast('You got it! But it is running away again…');
    clearTimeout(window.mercyTimer);
    window.mercyTimer = setTimeout(() => {
      escapeButton.querySelector('span').textContent = 'CATCH ME';
      escapeButton.querySelector('small').textContent = 'if you can';
      moveEscapeButton();
    }, 1500);
  } else if (escapesSinceBreak === 9) {
    // The tenth press is the truce: the button stays put for one click.
    offerOneClick();
  } else {
    moveEscapeButton();
  }
};
document.querySelector('#reset').addEventListener('click', () => {
  escapeMode = false;
  mercyMode = false;
  escapesSinceBreak = 0;
  playerScore = 0;
  scoreUnlocked = false;
  updateGameScore();
  clearTimeout(window.mercyTimer);
  escapeButton.style.left = '50%';
  escapeButton.style.top = '57%';
  hero.style.left = '50%';
  hero.style.top = '26px';
  hero.classList.add('hidden');
  escapeButton.querySelector('span').textContent = 'PRESS ME';
  escapeButton.querySelector('small').textContent = 'it looks easy';
  $('#status').textContent = 'Standing by';
});
