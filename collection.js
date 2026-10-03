(() => {
  "use strict";

  const photos = window.collectionPhotos || [];
  const missingPhoto = {
    src: "assets/comparisons/04-after.jpg",
    title: "A smile on graduation day",
    description: "A graduation portrait with warmer colour, balanced facial exposure and a softer background in the finished image.",
    group: "graduation",
    category: "Graduation"
  };

  if (!photos.some((photo) => photo.src === missingPhoto.src)) {
    const photoIndex = photos.push(missingPhoto) - 1;
    const section = document.getElementById("collection-graduation");
    const track = section?.querySelector(".category-track");

    if (track && !track.querySelector(`img[src="${missingPhoto.src}"]`)) {
      const card = document.createElement("figure");
      card.className = "collection-card";

      const button = document.createElement("button");
      button.className = "collection-image";
      button.type = "button";
      button.dataset.photo = String(photoIndex);
      button.setAttribute("aria-label", `Open ${missingPhoto.title}`);

      const image = document.createElement("img");
      image.src = missingPhoto.src;
      image.alt = missingPhoto.title;
      image.loading = "lazy";
      button.append(image);

      const caption = document.createElement("figcaption");
      const category = document.createElement("p");
      category.className = "photo-category";
      category.textContent = missingPhoto.category;
      const title = document.createElement("h4");
      title.textContent = missingPhoto.title;
      const description = document.createElement("p");
      description.textContent = missingPhoto.description;
      caption.append(category, title, description);
      card.append(button, caption);
      track.prepend(card);

      const total = track.querySelectorAll(".collection-card").length;
      const headingCount = section.querySelector(".category-heading .eyebrow");
      if (headingCount) headingCount.textContent = `${String(total).padStart(2, "0")} PHOTOGRAPHS`;
    }
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.getElementById("navigation");

  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    menu.textContent = open ? "Close" : "Menu";
  });
  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.textContent = "Menu";
    }
  });

  const sections = [...document.querySelectorAll(".category-section")];
  sections.forEach((section) => {
    const track = section.querySelector(".category-track");
    const originals = [...track.querySelectorAll(".collection-card")];
    const counter = section.querySelector(".category-count");
    const buttons = [...section.querySelectorAll("[data-direction]")];
    if (!originals.length) return;

    const last = originals.at(-1).cloneNode(true);
    const first = originals[0].cloneNode(true);
    [last, first].forEach((clone) => {
      clone.dataset.clone = "true";
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("button").forEach((button) => {
        button.tabIndex = -1;
      });
    });
    track.prepend(last);
    track.append(first);

    const cards = [last, ...originals, first];
    let current = 1;
    let animationFrame;
    let timer;
    let initialized = false;
    const logicalIndex = (index) => (index - 1 + originals.length) % originals.length;

    function center(index, behavior = "instant") {
      const rect = cards[index].getBoundingClientRect();
      const bounds = track.getBoundingClientRect();
      track.scrollBy({
        left: rect.left + rect.width / 2 - bounds.left - track.clientWidth / 2,
        behavior
      });
    }

    function update() {
      const midpoint = track.getBoundingClientRect().left + track.clientWidth / 2;
      let nearest = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - midpoint);
        if (distance < nearest) {
          nearest = distance;
          current = index;
        }
      });
      cards.forEach((card, index) => card.classList.toggle("active", index === current));
      counter.textContent = `${logicalIndex(current) + 1} / ${originals.length}`;
      buttons.forEach((button) => {
        button.disabled = originals.length < 2;
      });
    }

    function settle() {
      if (current === 0) {
        current = originals.length;
        center(current);
      } else if (current === cards.length - 1) {
        current = 1;
        center(current);
      }
    }

    function move(direction) {
      const destination = Math.max(0, Math.min(cards.length - 1, current + direction));
      center(destination, reducedMotion.matches ? "instant" : "smooth");
    }

    buttons.forEach((button) => button.addEventListener("click", () => move(Number(button.dataset.direction))));
    track.addEventListener("keydown", (event) => {
      if (event.target === track && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(update);
      clearTimeout(timer);
      timer = setTimeout(settle, 180);
    }, { passive: true });
    new ResizeObserver(() => {
      center(initialized ? current : 1);
      initialized = true;
      requestAnimationFrame(update);
    }).observe(track);
    requestAnimationFrame(() => {
      center(1);
      update();
    });
  });

  if (!reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("recede", entry.intersectionRatio < 0.28));
    }, { threshold: [0, 0.15, 0.28, 0.5, 1] });
    sections.forEach((section) => observer.observe(section));
  }

  const popup = document.getElementById("photo-popup");
  const image = document.getElementById("popup-image");
  let active = 0;
  let pool = photos.map((_, index) => index);
  let trigger;
  let closing = false;

  function showPhoto(index) {
    active = (index + pool.length) % pool.length;
    const photo = photos[pool[active]];
    image.src = photo.src;
    image.alt = photo.title;
    document.getElementById("popup-title").textContent = photo.title;
    document.getElementById("popup-description").textContent = photo.description;
    document.getElementById("popup-category").textContent = `${photo.category} · ${active + 1} / ${pool.length}`;
    image.style.animation = "none";
    void image.offsetWidth;
    image.style.animation = "";
  }

  function close() {
    if (closing) return;
    closing = true;
    popup.classList.add("closing");
    setTimeout(() => {
      popup.close();
      popup.classList.remove("closing");
      document.body.classList.remove("popup-open");
      closing = false;
      trigger?.focus();
    }, reducedMotion.matches ? 0 : 220);
  }

  document.querySelectorAll("[data-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      trigger = button;
      const selected = Number(button.dataset.photo);
      pool = photos.map((photo, index) => photo.group === photos[selected].group ? index : -1).filter((index) => index >= 0);
      showPhoto(pool.indexOf(selected));
      popup.showModal();
      document.body.classList.add("popup-open");
    });
  });
  document.getElementById("popup-close").onclick = close;
  document.getElementById("popup-prev").onclick = () => showPhoto(active - 1);
  document.getElementById("popup-next").onclick = () => showPhoto(active + 1);
  popup.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  popup.addEventListener("click", (event) => {
    const rect = popup.getBoundingClientRect();
    if (event.target === popup && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
      close();
    }
  });
  popup.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(active + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  popup.addEventListener("close", () => document.body.classList.remove("popup-open"));
})();
