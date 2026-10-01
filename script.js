'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
  menuButton.textContent = open ? 'Close' : 'Menu';
});
navigation?.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
});
const viewer = document.querySelector('#image-viewer');
let viewerTrigger;
document.addEventListener('click', event => {
  const button = event.target.closest('.image-button');
  if (!button || !viewer) return;
  const photo = button.querySelector('img');
  if (!photo || !photo.getAttribute('src')) return;
  viewerTrigger = button;
  viewer.querySelector('img').src = photo.src;
  viewer.querySelector('img').alt = photo.alt;
  viewer.querySelector('p').textContent = photo.alt;
  viewer.showModal();
});
viewer?.querySelector('button').addEventListener('click', () => viewer.close());
viewer?.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer?.addEventListener('close', () => viewerTrigger?.focus());
