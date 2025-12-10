// Event page gallery loader
// Priority:
// 1) Try gallery.json in the same folder (manual control / backwards compatible)
// 2) If no gallery.json or empty, and site is hosted on github.io, auto-load images
//    from the corresponding folder in the GitHub repository using the GitHub API.

document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-event')) return;

  const grid = document.querySelector('.event-gallery-grid');
  if (!grid) return;

  function getPathInfo() {
    // Remove /index.html from the end of the path
    const pathname = window.location.pathname.replace(/\/index\.html$/, '');
    const segments = pathname.split('/').filter(Boolean); // remove empty

    return {
      pathname,
      segments,
      hostname: window.location.hostname
    };
  }

  async function loadFromGalleryJson() {
    try {
      const res = await fetch('gallery.json', { cache: 'no-store' });
      if (!res.ok) return false;

      const data = await res.json();
      const images = (data.images || []).filter(Boolean);
      if (!images.length) return false;

      grid.innerHTML = '';

      images.forEach((fileName, index) => {
        const img = document.createElement('img');
        img.src = fileName;
        img.alt = `Event photo ${index + 1}`;
        grid.appendChild(img);
      });

      return true;
    } catch (err) {
      console.error('Failed to load event gallery from gallery.json:', err);
      return false;
    }
  }

  async function loadFromGitHub(branchHint = 'main') {
    const info = getPathInfo();

    // Only attempt auto GitHub detection when hosted on *.github.io
    if (!/\.github\.io$/.test(info.hostname)) {
      return false;
    }

    const hostParts = info.hostname.split('.');
    const owner = hostParts[0]; // username or org

    let repo = '';
    let pathFromRepoRoot = '';

    if (info.segments.length && info.segments[0] !== 'gallery') {
      // Project pages: https://owner.github.io/repo/...
      repo = info.segments[0];
      pathFromRepoRoot = info.segments.slice(1).join('/');
    } else {
      // User/Org pages: https://owner.github.io/...
      // By convention, the repo is owner.github.io
      repo = owner + '.github.io';
      pathFromRepoRoot = info.segments.join('/');
    }

    if (!pathFromRepoRoot) {
      // We expect to be inside something like gallery/eventX
      return false;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathFromRepoRoot}?ref=${branchHint}`;

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) {
        console.warn('GitHub API responded with status', res.status, 'for', apiUrl);
        return false;
      }

      const files = await res.json();
      if (!Array.isArray(files)) return false;

      const images = files
        .filter(item =>
          item.type === 'file' &&
          /\.(jpe?g|png|gif|webp)$/i.test(item.name)
        )
        .map(item => item.name);

      if (!images.length) return false;

      grid.innerHTML = '';

      images.forEach((fileName, index) => {
        const img = document.createElement('img');
        // Images are in the same folder as the current index.html
        img.src = fileName;
        img.alt = `Event photo ${index + 1}`;
        grid.appendChild(img);
      });

      return true;
    } catch (err) {
      console.error('Failed to load event gallery from GitHub API:', err);
      return false;
    }
  }

  async function loadEventGallery() {
    // 1) Try gallery.json first (existing simple control)
    const okFromJson = await loadFromGalleryJson();
    if (okFromJson) return;

    // 2) If that fails or is empty, try GitHub auto-detect (main then master)
    let okFromGitHub = await loadFromGitHub('main');
    if (!okFromGitHub) {
      okFromGitHub = await loadFromGitHub('master');
    }

    if (!okFromGitHub) {
      console.warn('No event images found via gallery.json or GitHub auto-detect.');
    }
  }

  loadEventGallery();
});
