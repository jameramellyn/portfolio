// global.js — shared logic loaded on every page
// Handles: active nav link highlighting via IntersectionObserver

(function () {
  'use strict';

  /* ══════════════════════════════
     ACTIVE NAV HIGHLIGHT
     Watches each section and marks the matching nav link
     as .active when it's the one in view.
  ══════════════════════════════ */
  function initNavHighlight() {
    const sections = document.querySelectorAll('header[id], section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => observer.observe(s));
  }

  document.addEventListener('DOMContentLoaded', initNavHighlight);

})();