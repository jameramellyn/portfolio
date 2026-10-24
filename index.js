// index.js — homepage-specific logic
// Handles: project grid population, art carousel, desktop photo thumbnails

(function () {
  'use strict';

  /* ══════════════════════════════
     PROJECT GRID
     Add your projects here. Each object becomes a card.
     `thumb` should point to your screenshot image.
     `url`   is the link when the card is clicked.
  ══════════════════════════════ */
  const PROJECTS = [
    {
      name:  'Low Price Center',
      thumb: 'images/projects/low-price-center.png',
      label: 'Low Price Center',
      url:   'https://github.com/CSES-Open-Source/LowPriceCenter',
    },
    {
      name:  'Where Droughts Hide',
      thumb: 'images/projects/where-droughts-hide.png',
      label: 'Where Droughts Hide',
      url:   'https://github.com/pemam238/DSC-106-Final-Project',
    },
    {
      name:  'OnWise',
      thumb: 'images/projects/onwise.png',
      label: 'OnWise',
      url:   'https://github.com/speechara18/cal-hacks-fa25-submission',
    },
    {
      name:  'Predicting Food Recipe Origins',
      thumb: 'images/projects/food-origins.png',
      label: 'Food Origins',
      url:   'https://github.com/ColecamC/recipes-predictive-project',
    },
  ];

  function buildProjectGrid() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    PROJECTS.forEach(project => {
      const a = document.createElement('a');
      a.className = 'project-card';
      a.href = project.url;
      if (project.url.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.setAttribute('aria-label', project.name + ' project');
      a.innerHTML = `
        <div class="project-thumb">
          <img src="${project.thumb}" alt="${project.name} screenshot" onerror="this.style.display='none'">
          <span class="project-thumb-label">${project.label}</span>
        </div>
        <div class="project-meta">
          <p class="project-name">${project.name}</p>
        </div>
      `;
      grid.appendChild(a);
    });
  }

  /* ══════════════════════════════
     ART CAROUSEL
     Add your artwork images here.
     `src`   points to the image file.
     `title` is the caption shown below the phone.
  ══════════════════════════════ */
  const ARTWORKS = [
    { src: 'images/art/art-01.jpg', title: 'Artwork 1' },
    { src: 'images/art/art-02.jpg', title: 'Artwork 2' },
    { src: 'images/art/art-03.jpg', title: 'Artwork 3' },
    { src: 'images/art/art-04.jpg', title: 'Artwork 4' },
    { src: 'images/art/art-05.jpg', title: 'Artwork 5' },
    { src: 'images/art/art-06.jpg', title: 'Artwork 6' },
    { src: 'images/art/art-07.jpg', title: 'Artwork 7' },
    { src: 'images/art/art-08.jpg', title: 'Artwork 8' },
  ];

  let currentArt = 0;

  function buildThumbnails() {
    const container = document.getElementById('thumbnails');
    if (!container) return;

    ARTWORKS.forEach((art, i) => {
      const btn = document.createElement('button');
      btn.className = 'art-thumb' + (i === 0 ? ' active' : '');
      btn.dataset.index = i;
      btn.setAttribute('aria-label', art.title);
      btn.innerHTML = `<img src="${art.src}" alt="${art.title}">`;
      btn.addEventListener('click', () => showArt(i));
      container.appendChild(btn);
    });
  }

  function showArt(idx) {
    const total = ARTWORKS.length;
    currentArt = ((idx % total) + total) % total;
    const art = ARTWORKS[currentArt];

    const mainImg = document.getElementById('art-main');
    const caption = document.getElementById('art-caption');
    const thumbs  = document.querySelectorAll('.art-thumb');

    if (mainImg) {
      mainImg.src = art.src;
      mainImg.alt = art.title;
    }
    if (caption) {
      caption.textContent = `${art.title} · ${currentArt + 1} / ${total}`;
    }
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentArt));
  }

  function initCarousel() {
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    if (prev) prev.addEventListener('click', () => showArt(currentArt - 1));
    if (next) next.addEventListener('click', () => showArt(currentArt + 1));

    // Keyboard on the carousel region
    const region = document.querySelector('[role="region"]');
    if (region) {
      region.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  showArt(currentArt - 1);
        if (e.key === 'ArrowRight') showArt(currentArt + 1);
      });
    }
  }

  /* ══════════════════════════════
     DESKTOP PHOTOS (contact section)
     Add your personal photo filenames here.
  ══════════════════════════════ */
  const DESKTOP_PHOTOS = [
    { src: 'images/contact/culture-1.jpg', label: 'Culture.jpg' },
    { src: 'images/contact/culture-2.jpg', label: 'Culture.jpg' },
    { src: 'images/contact/me.jpg',        label: 'me.jpg'       },
    { src: 'images/contact/culture-3.jpg', label: 'Culture.jpg' },
    { src: 'images/contact/san-diego.jpg', label: 'San Diego.jpg' },
    { src: 'images/contact/culture-4.jpg', label: 'Culture.jpg' },
  ];

  function buildDesktopPhotos() {
    const container = document.getElementById('desktop-photos');
    if (!container) return;

    DESKTOP_PHOTOS.forEach(photo => {
      const div = document.createElement('div');
      div.className = 'desktop-photo';
      div.innerHTML = `
        <div class="desktop-photo-img">
          <img src="${photo.src}" alt="${photo.label}" onerror="this.parentElement.classList.add('placeholder'); this.remove()">
        </div>
        <span class="desktop-photo-label">${photo.label}</span>
      `;
      container.appendChild(div);
    });
  }

  /* ══════════════════════════════
     INIT
  ══════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    buildProjectGrid();
    buildThumbnails();
    initCarousel();
    buildDesktopPhotos();
  });

})();