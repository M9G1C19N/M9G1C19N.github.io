'use strict';
// The collection is rendered in HTML so it stays visible without JavaScript.
const cards = Array.from(document.querySelectorAll('.gallery-card'));
const feature = document.querySelector('.featured-gallery');
const thumbnailStrip = document.querySelector('#photo-thumbnails');
const previous = document.querySelector('#photo-previous');
const next = document.querySelector('#photo-next');
let selected = 0;
let currentFilter = "all";
const eligible = () => cards.map((c,i)=>i).filter(i=>currentFilter === "all" || cards[i].dataset.category === currentFilter);
const thumbs = cards.map((card, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'View ' + card.querySelector('h3').textContent);
  button.setAttribute('aria-pressed', 'false');
  const image = card.querySelector('img').cloneNode();
  image.alt = '';
  button.append(image);
  button.addEventListener('click', () => selectPhoto(index, true));
  thumbnailStrip.append(button);
  return button;
});
function selectPhoto(index, scrollThumbnail = false) {
  selected = Math.max(0, Math.min(cards.length - 1, index));
  const card = cards[selected];
  const original = card.querySelector('img');
  const image = feature.querySelector('img');
  image.src = original.getAttribute('src');
  image.alt = original.alt;
  feature.querySelector('.featured-photo').setAttribute('aria-label', 'Enlarge ' + card.querySelector('h3').textContent);
  feature.querySelector('.photo-category').textContent = card.querySelector('.photo-category').textContent;
  feature.querySelector('h3').textContent = card.querySelector('h3').textContent;
  feature.querySelector('.feature-description').textContent = card.querySelector('figcaption p').textContent;
  document.querySelector('#photo-counter').textContent = `${eligible().indexOf(selected) + 1} / ${eligible().length}`;
  const list=eligible();const pos=list.indexOf(selected);
  previous.disabled = pos <= 0;
  next.disabled = pos >= list.length - 1;
  thumbs.forEach((button,i)=>{button.hidden=!eligible().includes(i)});
  thumbs.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
  if (scrollThumbnail) {
    const thumb = thumbs[selected];
    thumbnailStrip.scrollTo({left: thumb.offsetLeft - thumbnailStrip.offsetLeft - thumbnailStrip.clientWidth / 2 + thumb.clientWidth / 2, behavior: 'auto'});
  }
}
previous.addEventListener('click', () => selectPhoto(eligible()[Math.max(0,eligible().indexOf(selected)-1)], true));
next.addEventListener('click', () => selectPhoto(eligible()[Math.min(eligible().length-1,eligible().indexOf(selected)+1)], true));
feature.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); const list=eligible();selectPhoto(list[Math.max(0,Math.min(list.length-1,list.indexOf(selected)+(event.key === 'ArrowRight'?1:-1)))],true);
  }
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;currentFilter=filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });if(eligible().length)selectPhoto(eligible()[0]);
  });
});
if (cards.length) {
  selectPhoto(0);
  feature.hidden = false;
  document.querySelector('.gallery-toolbar').hidden = false;
}
