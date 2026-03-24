/* ============================================================
   Travel Agency Process Wiki — wiki.js
   Lightbox + smooth interactions
   ============================================================ */

(function () {
  'use strict';

  // ── Lightbox for BPMN / EA diagram images ──
  function initLightbox() {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    var img = document.createElement('img');
    overlay.appendChild(img);
    document.body.appendChild(overlay);

    document.querySelectorAll('.diagram-wrapper img').forEach(function (el) {
      el.addEventListener('click', function () {
        img.src = el.src;
        img.alt = el.alt;
        overlay.classList.add('active');
      });
    });

    overlay.addEventListener('click', function () {
      overlay.classList.remove('active');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.classList.remove('active');
    });
  }

  // ── Highlight current nav breadcrumb ──
  function highlightBreadcrumb() {
    var links = document.querySelectorAll('.wiki-nav .breadcrumb a');
    links.forEach(function (a) {
      if (a.href === window.location.href) {
        a.style.fontWeight = '700';
        a.style.color = '#1e293b';
      }
    });
  }

  // ── Smooth anchor scroll ──
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLightbox();
    highlightBreadcrumb();
    initSmoothScroll();
  });
})();
