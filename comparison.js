(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const stage = $("compare-stage");
  const range = $("compare-range");
  const play = $("compare-play");
  const before = $("compare-before");
  const after = $("compare-after");
  const beforeLayer = stage.querySelector(".compare-before-layer");
  const thumbnails = $("compare-thumbnails");
  const comparison = document.getElementById("comparison");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const photos = window.comparisonPhotos || [];

  const fullscreenButton = document.createElement("button");
  fullscreenButton.type = "button";
  fullscreenButton.className = "compare-fullscreen";
  fullscreenButton.textContent = "Full screen";
  fullscreenButton.title = "Full screen (F)";
  fullscreenButton.setAttribute("aria-label", "Open comparison in full screen");
  play.after(fullscreenButton);

  document.querySelector(".comparison-section > .section-heading > p")?.remove();
  document.querySelectorAll("#comparison-note, .compare-sets, .compare-modes").forEach((element) => element.remove());
  document.querySelector(".compare-tip").textContent = "Select a thumbnail or use Left/Right to change photographs. Press F for full screen. The slider supports mouse, touch, and keyboard.";
  range.setAttribute("aria-label", "Reveal before photograph");
  stage.classList.remove("side-mode");

  let index = 0;
  let animationFrame = 0;
  let animationStart = 0;

  function setSplit(value) {
    range.value = value;
    stage.style.setProperty("--split", `${value}%`);
  }

  function stop() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    play.textContent = "Play comparison";
    play.setAttribute("aria-pressed", "false");
  }

  function isFullscreen() {
    return document.fullscreenElement === comparison || document.webkitFullscreenElement === comparison;
  }

  function updateFullscreenButton() {
    const active = isFullscreen();
    fullscreenButton.textContent = active ? "Exit full screen" : "Full screen";
    fullscreenButton.setAttribute("aria-label", active ? "Exit full screen" : "Open comparison in full screen");
    fullscreenButton.setAttribute("aria-pressed", String(active));
  }

  async function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        await exit?.call(document);
      } else {
        const enter = comparison.requestFullscreen || comparison.webkitRequestFullscreen;
        await enter?.call(comparison);
      }
    } catch (error) {
      console.warn("Full-screen mode is not available in this browser.", error);
    }
  }

  function centerActiveThumbnail(behavior = "smooth") {
    const active = thumbnails.querySelector('[aria-pressed="true"]');
    if (!active) return;
    const left = active.offsetLeft - (thumbnails.clientWidth - active.offsetWidth) / 2;
    thumbnails.scrollTo({ left: Math.max(0, left), behavior: reducedMotion.matches ? "auto" : behavior });
  }

  function layout() {
    const photo = photos[index];
    if (!photo) return;

    const width = stage.clientWidth || 1100;
    const ratio = photo.aspect || 0.667;
    const minHeight = innerWidth < 700 ? 230 : 350;
    const maxHeight = innerWidth < 700 ? 560 : 820;
    stage.style.height = `${Math.round(Math.max(minHeight, Math.min(maxHeight, width / ratio)))}px`;

    if (photo.rotate) {
      const rect = beforeLayer.getBoundingClientRect();
      before.style.width = `${rect.height}px`;
      before.style.height = `${rect.width}px`;
    } else {
      before.style.width = "100%";
      before.style.height = "100%";
    }
  }

  function select(nextIndex) {
    stop();
    index = (nextIndex + photos.length) % photos.length;
    const photo = photos[index];
    if (!photo) return;

    stage.classList.remove("photo-change");
    void stage.offsetWidth;
    stage.classList.add("photo-change");

    after.src = photo.after;
    after.alt = `${photo.title} — finished edit`;
    before.src = photo.before;
    before.alt = `${photo.title} — before`;
    before.classList.toggle("rotated", Boolean(photo.rotate));
    $("compare-title").textContent = photo.title;
    $("compare-description").textContent = photo.description;
    $("compare-count").textContent = `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    thumbnails.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
    centerActiveThumbnail(index === 0 ? "auto" : "smooth");
    setSplit(50);
    requestAnimationFrame(layout);
  }

  function buildThumbnails() {
    thumbnails.replaceChildren();
    photos.forEach((photo, photoIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `View ${photo.title}`);

      const image = document.createElement("img");
      image.src = photo.after;
      image.alt = "";
      image.loading = "lazy";
      const number = document.createElement("span");
      number.className = "compare-thumbnail-number";
      number.textContent = String(photoIndex + 1).padStart(2, "0");
      button.append(image, number);
      button.addEventListener("click", () => select(photoIndex));
      thumbnails.append(button);
    });
    select(0);
  }

  range.addEventListener("input", () => {
    stop();
    setSplit(range.value);
  });
  range.addEventListener("pointerdown", stop);
  $("compare-prev").addEventListener("click", () => select(index - 1));
  $("compare-next").addEventListener("click", () => select(index + 1));
  fullscreenButton.addEventListener("click", toggleFullscreen);
  play.addEventListener("click", () => {
    if (animationFrame) {
      stop();
      return;
    }
    if (reducedMotion.matches) {
      setSplit(Number(range.value) < 50 ? 100 : 0);
      return;
    }

    animationStart = performance.now();
    play.textContent = "Pause comparison";
    play.setAttribute("aria-pressed", "true");
    const tick = (time) => {
      setSplit(50 + 45 * Math.sin((time - animationStart) / 1800));
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || document.querySelector("dialog[open]")) return;
    if (event.target.closest("input, textarea, select")) return;

    const bounds = comparison.getBoundingClientRect();
    const comparisonIsVisible = bounds.bottom > 0 && bounds.top < innerHeight;
    if (!comparisonIsVisible && !isFullscreen()) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      select(index + (event.key === "ArrowRight" ? 1 : -1));
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    updateFullscreenButton();
    requestAnimationFrame(() => {
      layout();
      centerActiveThumbnail("auto");
    });
  });
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  reducedMotion.addEventListener("change", stop);
  before.addEventListener("load", layout);
  after.addEventListener("load", layout);
  new ResizeObserver(layout).observe(stage);

  updateFullscreenButton();
  buildThumbnails();
})();
