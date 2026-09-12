// This file contains the interaction for The Impossible Button game.
const escapeButton = document.querySelector('#summon');
let escapeMode = false;
let mercyMode = false;
let escapesSinceBreak = 0;

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
  if (escapesSinceBreak === 10) {
    mercyMode = true;
    escapeButton.querySelector('span').textContent = 'ALRIGHT, ALRIGHT…';
    escapeButton.querySelector('small').textContent = 'click me once';
    toast('alright alright i will let you click me once');
  }
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
  if (!escapeMode) {
    startEscapeGame();
  } else if (mercyMode) {
    // This click is intentionally allowed: it does not move the button yet.
    mercyMode = false;
    escapesSinceBreak = 0;
    escapeButton.querySelector('span').textContent = 'YOU GOT ME!';
    escapeButton.querySelector('small').textContent = '…for one second';
    toast('You got it! But it is running away again…');
    clearTimeout(window.mercyTimer);
    window.mercyTimer = setTimeout(() => {
      escapeButton.querySelector('span').textContent = 'CATCH ME';
      escapeButton.querySelector('small').textContent = 'if you can';
      moveEscapeButton();
    }, 650);
  } else {
    moveEscapeButton();
  }
};
document.querySelector('#reset').addEventListener('click', () => {
  escapeMode = false;
  mercyMode = false;
  escapesSinceBreak = 0;
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
