'use strict';
// Captions follow the photo order shown in the supplied portfolio screenshots.
// Keep these entries in the same order as the photography array in script.js.
const photoStories = [
  { category: 'Outdoor portrait', title: 'A Pause in the Countryside', description: 'A portrait on horseback beneath a rustic wooden frame. Soft greenery and a patterned outfit bring color to the quiet outdoor setting.' },
  { category: 'Outdoor portrait', title: 'Green Among the Trees', description: 'A green outfit echoes the surrounding foliage in this horseback portrait. The blurred background keeps attention on the subject’s expression.' },
  { category: 'Outdoor portrait', title: 'Under the Wooden Frame', description: 'A seated portrait with the horse in the foreground and intersecting wooden branches overhead. The dark floral outfit stands out against the soft green background.' },
  { category: 'Beach portrait', title: 'Pink by the Shore', description: 'A bright pink outfit contrasts with the pale shore and blue-gray water. The chair and extended pose create a strong shape against the distant hills.' },
  { category: 'Fashion portrait', title: 'Warm Light, Dark Fabric', description: 'A seated portrait in black, framed by a cream upholstered chair. Warm light and the textured backdrop give the image an intimate, dramatic feel.' },
  { category: 'Fashion portrait', title: 'Lines and Lace', description: 'An expressive pose in a black lace outfit beside a tall upholstered chair. Raised arms and the woven backdrop bring movement and texture into the frame.' },
  { category: 'Fashion portrait', title: 'A Confident Pose', description: 'A black evening outfit against a cream chair and dark rustic backdrop. The raised arm and turned gaze give the portrait a lively, confident character.' },
  { category: 'Festival', title: 'The Color of Celebration', description: 'A smiling performer in an elaborate green-and-gold costume. The radiating headdress and open gesture capture the energy of the celebration.' },
  { category: 'Everyday life', title: 'Care in Small Moments', description: 'A person waters a bed of seedlings with a green watering can. The visible stream of water draws attention to the simple work of tending young plants.' },
  { category: 'Landscape', title: 'Between Two Bridges', description: 'Parallel bridges lead the eye toward greenery beyond the water. Reflections and a cloud-filled sky add depth to the scene.' },
  { category: 'Festival', title: 'A Street Full of Color', description: 'A performer in a vivid pink costume stands among dancers on a decorated street. Bunting overhead and bold costumes fill the scene with the movement of a parade.' },
  {category: 'Festival', title: 'A Celebration in Gold', description: 'A smiling performer raises a framed portrait above her gold-and-white costume. Behind her, rows of dancers and colorful decorations fill the street with the energy of a celebration.'}
];

function enhancePhotographyGallery() {
  const gallery = document.querySelector('#photo-gallery');
  if (!gallery || gallery.dataset.carouselReady) return false;
  const figures = Array.from(gallery.children).filter(element => element.tagName === 'FIGURE');
  if (!figures.length) return false;
  gallery.dataset.carouselReady = 'true';
  gallery.hidden = false;
  gallery.classList.add('photography-track');
  gallery.setAttribute('role', 'region');
  gallery.setAttribute('aria-roledescription', 'carousel');
  gallery.setAttribute('aria-label', 'Selected photography');
  gallery.tabIndex = 0;

  figures.forEach((figure, index) => {
    const image = figure.querySelector('img');
    const story = photoStories[index];
    figure.classList.add('photography-slide');
    figure.setAttribute('role', 'group');
    figure.setAttribute('aria-roledescription', 'slide');
    figure.setAttribute('aria-label', `${index + 1} of ${figures.length}`);
    let caption = figure.querySelector('figcaption');
    if (!caption) { caption = document.createElement('figcaption'); figure.append(caption); }
    if (!story) return; // Additional photos retain their original captions.
    caption.replaceChildren();
    const category = document.createElement('p'); category.className = 'photo-category'; category.textContent = story.category;
    const title = document.createElement('h3'); title.textContent = story.title;
    const description = document.createElement('p'); description.className = 'photo-description'; description.textContent = story.description;
    caption.append(category, title, description);
    if (image) image.alt = story.description;
    const imageButton = figure.querySelector('button');
    if (imageButton) imageButton.setAttribute('aria-label', 'Enlarge ' + story.title);
  });

  const shell = document.createElement('div'); shell.className = 'photography-carousel';
  gallery.before(shell); shell.append(gallery);
  const controls = document.createElement('div'); controls.className = 'photography-controls';
  const counter = document.createElement('p'); counter.className = 'photo-counter'; counter.setAttribute('aria-live', 'polite'); counter.setAttribute('aria-atomic', 'true');
  const buttons = document.createElement('div'); buttons.className = 'photo-navigation';
  const previous = document.createElement('button'); previous.type = 'button'; previous.textContent = '← Previous'; previous.setAttribute('aria-controls', gallery.id);
  const next = document.createElement('button'); next.type = 'button'; next.textContent = 'Next →'; next.setAttribute('aria-controls', gallery.id);
  buttons.append(previous, next); controls.append(counter, buttons); shell.append(controls);
  let activeIndex = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateControls() {
    const left = gallery.getBoundingClientRect().left;
    let distance = Infinity;
    figures.forEach((figure, index) => {
      const difference = Math.abs(figure.getBoundingClientRect().left - left);
      if (difference < distance) { distance = difference; activeIndex = index; }
    });
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(figures.length).padStart(2, '0')}`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === figures.length - 1;
  }
  function move(direction) {
    const index = Math.max(0, Math.min(figures.length - 1, activeIndex + direction));
    const delta = figures[index].getBoundingClientRect().left - gallery.getBoundingClientRect().left;
    gallery.scrollBy({ left: delta, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let scrollFrame;
  gallery.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame); scrollFrame = requestAnimationFrame(updateControls);
  }, { passive: true });
  window.addEventListener('resize', updateControls);
  updateControls();
  return true;
}

function initializePhotographyCarousel() {
  if (enhancePhotographyGallery()) return;
  const gallery = document.querySelector('#photo-gallery');
  if (!gallery) return;
  const observer = new MutationObserver(() => {
    if (enhancePhotographyGallery()) observer.disconnect();
  });
  observer.observe(gallery, { childList: true });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePhotographyCarousel, { once: true });
} else { initializePhotographyCarousel(); }
