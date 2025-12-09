
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.fg-track');
  const viewport = document.querySelector('.fg-viewport');
  if (!track || !viewport) return;

  const prevBtn = document.querySelector('.fg-prev');
  const nextBtn = document.querySelector('.fg-next');

  let slides = [];
  let currentIndex = 0;
  let autoTimer = null;

  async function loadGallery() {
    try {
      const res = await fetch('./gallery/events.json');
      const data = await res.json();
      const events = (data.events || []).filter(e => e && e.folder);

      if (!events.length) return;

      // build slides from events.json
      events.forEach((ev, index) => {
        if (!ev.cover) return; // skip events without cover image
        const slide = document.createElement('a');
        slide.className = 'fg-slide';
        slide.href = `./gallery/${ev.folder}/index.html`;

        const img = document.createElement('img');
        img.src = `./gallery/${ev.folder}/${ev.cover}`;
        img.alt = ev.title || `Featured Event ${index + 1}`;

        const caption = document.createElement('div');
        caption.className = 'fg-caption';
        caption.textContent = ev.title || `Featured Event ${index + 1}`;

        slide.appendChild(img);
        slide.appendChild(caption);
        track.appendChild(slide);
      });

      slides = Array.from(track.querySelectorAll('.fg-slide'));
      updateSlides();
      startAutoPlay();

      if (prevBtn) {
        prevBtn.addEventListener('click', () => move(-1));
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => move(1));
      }

      viewport.addEventListener('mouseenter', stopAutoPlay);
      viewport.addEventListener('mouseleave', startAutoPlay);
    } catch (err) {
      console.error('Failed to load home gallery:', err);
    }
  }

  function move(direction) {
    if (!slides.length) return;
    stopAutoPlay();
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    updateSlides();
    startAutoPlay();
  }

  function updateSlides() {
    if (!slides.length) return;

    slides.forEach((slide, i) => {
      const offset = (i - currentIndex + slides.length) % slides.length;

      slide.classList.remove('is-center', 'is-side', 'is-hidden');

      if (offset === 0) {
        slide.classList.add('is-center');
      } else if (offset === 1 || offset === slides.length - 1) {
        slide.classList.add('is-side');
      } else {
        slide.classList.add('is-hidden');
      }
    });

    // Center the active slide in the viewport
    track.style.transform = 'translateX(0px)';
    const centerX = viewport.offsetWidth / 2;
    const activeSlide = slides[currentIndex];
    const slideRect = activeSlide.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const slideCenter = (slideRect.left - trackRect.left) + slideRect.width / 2;
    const offset = centerX - slideCenter;
    track.style.transform = `translateX(${offset}px)`;
  }

  function startAutoPlay() {
    if (autoTimer || slides.length <= 1) return;
    autoTimer = setInterval(() => move(1), 6000);
  }

  function stopAutoPlay() {
    if (!autoTimer) return;
    clearInterval(autoTimer);
    autoTimer = null;
  }

  loadGallery();
});
