document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.event-gallery-grid');
  const lightbox = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');

  if (!grid || !lightbox || !lightboxImg) return;

  // Use event delegation to handle dynamically loaded images
  grid.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;

    // MOBILE TAP EFFECT
    grid.querySelectorAll('img.active').forEach(i => {
      if (i !== img) i.classList.remove('active');
    });
    img.classList.toggle('active');

    // LIGHTBOX POP-OUT
    lightboxImg.src = img.src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent scroll
  });

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    document.body.style.overflow = '';
    grid.querySelectorAll('img.active').forEach(i => i.classList.remove('active'));
  }

  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', e => {
    if (e.target !== lightboxImg) closeLightbox();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
});
