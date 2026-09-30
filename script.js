'use strict';
// Add your own photographs here after uploading them to the assets folder.
// Example: { src: 'assets/portrait-01.jpg', alt: 'Portrait in natural light', caption: 'Portraits' }
const photography = [{ src: 'assets/por1.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },{ src: 'assets/por2.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },
  { src: 'assets/por3.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },{ src: 'assets/por4.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },
  { src: 'assets/por5.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },{ src: 'assets/por6.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },
  { src: 'assets/por7.jpg', alt: 'Describe your actual portrait', caption: 'Portraits' },
  { src: 'assets/landscape1.jpg', alt: 'Describe your actual landscape', caption: 'Landscapes' }, { src: 'assets/landscape.jpg', alt: 'Describe your actual landscape', caption: 'Landscapes' }, 
  { src: 'assets/landscape3.jpg', alt: 'Describe your actual landscape', caption: 'Landscapes' },
  { src: 'assets/landscape4.jpg', alt: 'Describe your actual landscape', caption: 'Landscapes' }, {src: 'assets/festival-gold.jpg', alt: 'A performer in a gold-and-white costume holding a framed portrait above her head, with dancers behind her', caption: 'Festival'}];

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
  menuButton.textContent = open ? 'Close' : 'Menu';
});
navigation.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
});

const gallery = document.querySelector('#photo-gallery');
photography.forEach(photo => {
  const figure = document.createElement('figure');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'image-button';
  button.setAttribute('aria-label', 'Enlarge ' + photo.alt);
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = photo.alt;
  image.loading = 'lazy';
  button.append(image);
  figure.append(button);
  if (photo.caption) {
    const caption = document.createElement('figcaption');
    caption.textContent = photo.caption;
    figure.append(caption);
  }
  gallery.append(figure);
});
gallery.hidden = photography.length === 0;

const viewer = document.querySelector('#image-viewer');
document.querySelectorAll('.image-button').forEach(button => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    viewer.querySelector('img').src = image.src;
    viewer.querySelector('img').alt = image.alt;
    viewer.querySelector('p').textContent = image.alt;
    viewer.showModal();
  });
});
viewer.querySelector('button').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  if (event.target === viewer) viewer.close();
});

// Existing GitHub images remain usable when previewing outside the repository.
// Relative paths are always tried first so future repository changes still work.
document.querySelectorAll('img[src^="assets/"]').forEach(image => {
  image.addEventListener('error', () => {
    if (image.dataset.fallbackTried) return;
    image.dataset.fallbackTried = 'true';
    const path = image.getAttribute('src');
    image.src = 'https://m9g1c19n.github.io/' + path;
  });
});
