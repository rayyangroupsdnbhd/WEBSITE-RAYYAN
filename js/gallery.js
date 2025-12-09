
// Event page gallery loader (uses gallery.json in each event folder)
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-event')) return;

  const grid = document.querySelector('.event-gallery-grid');
  if (!grid) return;

  async function loadEventGallery() {
    try {
      const res = await fetch('gallery.json');
      const data = await res.json();
      const images = (data.images || []).filter(Boolean);
      if (!images.length) return;

      // Clear existing static images
      grid.innerHTML = '';

      images.forEach((fileName, index) => {
        const img = document.createElement('img');
        img.src = fileName;
        img.alt = `Event photo ${index + 1}`;
        grid.appendChild(img);
      });
    } catch (err) {
      console.error('Failed to load event gallery:', err);
    }
  }

  loadEventGallery();
});
