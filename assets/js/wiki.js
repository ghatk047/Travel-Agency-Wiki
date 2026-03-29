/* ============================================================
   Travel Agency Process Wiki — wiki.js
   Pan + Zoom lightbox, smooth interactions
   ============================================================ */

(function () {
  'use strict';

  // ── Pan + Zoom Lightbox ──────────────────────────────────────────────────
  function initLightbox() {
    // Build overlay
    var overlay = document.createElement('div');
    overlay.id  = 'lbx-overlay';
    overlay.innerHTML = [
      '<div id="lbx-toolbar">',
      '  <button id="lbx-zoom-in"  title="Zoom in">＋</button>',
      '  <button id="lbx-zoom-out" title="Zoom out">－</button>',
      '  <button id="lbx-reset"    title="Reset">⊙</button>',
      '  <span   id="lbx-zoom-pct">100%</span>',
      '  <button id="lbx-close"    title="Close">✕</button>',
      '</div>',
      '<div id="lbx-canvas">',
      '  <img id="lbx-img" draggable="false">',
      '</div>'
    ].join('');

    var style = document.createElement('style');
    style.textContent = [
      '#lbx-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.88);',
      '  z-index:9999;flex-direction:column;}',
      '#lbx-overlay.active{display:flex;}',
      '#lbx-toolbar{display:flex;align-items:center;gap:8px;padding:10px 16px;',
      '  background:rgba(0,0,0,.6);flex-shrink:0;}',
      '#lbx-toolbar button{background:#334155;color:#f1f5f9;border:none;border-radius:6px;',
      '  padding:5px 12px;font-size:16px;cursor:pointer;transition:background .15s;}',
      '#lbx-toolbar button:hover{background:#475569;}',
      '#lbx-zoom-pct{color:#94a3b8;font-size:13px;min-width:46px;}',
      '#lbx-close{margin-left:auto!important;}',
      '#lbx-canvas{flex:1;overflow:hidden;position:relative;cursor:grab;}',
      '#lbx-canvas.dragging{cursor:grabbing;}',
      '#lbx-img{position:absolute;transform-origin:0 0;user-select:none;',
      '  max-width:none;border-radius:4px;}'
    ].join('');
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    var img    = document.getElementById('lbx-img');
    var canvas = document.getElementById('lbx-canvas');
    var pctEl  = document.getElementById('lbx-zoom-pct');

    var scale=1, minScale=0.1, maxScale=8;
    var ox=0, oy=0;           // image offset in canvas px
    var dragging=false, startX=0, startY=0, startOx=0, startOy=0;

    function clampOffset(nx, ny) {
      // allow image to go out of bounds — no clamp needed, feels better for large diagrams
      return [nx, ny];
    }

    function applyTransform() {
      img.style.transform = 'translate('+ox+'px,'+oy+'px) scale('+scale+')';
      pctEl.textContent   = Math.round(scale*100)+'%';
    }

    function fitToCanvas() {
      var cw = canvas.clientWidth, ch = canvas.clientHeight;
      var iw = img.naturalWidth,   ih = img.naturalHeight;
      scale  = Math.min(cw/iw, ch/ih, 1) * 0.92;
      ox     = (cw - iw*scale) / 2;
      oy     = (ch - ih*scale) / 2;
      applyTransform();
    }

    function open(src) {
      img.src = src;
      overlay.classList.add('active');
      img.onload = fitToCanvas;
      if (img.complete) fitToCanvas();
    }

    function close() { overlay.classList.remove('active'); }

    // Zoom around a point (px, py) in canvas coords
    function zoomAround(factor, px, py) {
      var newScale = Math.max(minScale, Math.min(maxScale, scale * factor));
      var ratio    = newScale / scale;
      ox = px - ratio * (px - ox);
      oy = py - ratio * (py - oy);
      scale = newScale;
      applyTransform();
    }

    // Buttons
    document.getElementById('lbx-zoom-in') .addEventListener('click', function(){
      var r=canvas.getBoundingClientRect();
      zoomAround(1.3, r.width/2, r.height/2);
    });
    document.getElementById('lbx-zoom-out').addEventListener('click', function(){
      var r=canvas.getBoundingClientRect();
      zoomAround(1/1.3, r.width/2, r.height/2);
    });
    document.getElementById('lbx-reset')  .addEventListener('click', fitToCanvas);
    document.getElementById('lbx-close')  .addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if(e.target===overlay) close(); });

    // Mouse wheel zoom
    canvas.addEventListener('wheel', function(e){
      e.preventDefault();
      var r   = canvas.getBoundingClientRect();
      var px  = e.clientX - r.left;
      var py  = e.clientY - r.top;
      var fac = e.deltaY < 0 ? 1.12 : 1/1.12;
      zoomAround(fac, px, py);
    }, {passive:false});

    // Drag to pan
    canvas.addEventListener('mousedown', function(e){
      if(e.button!==0) return;
      dragging=true; startX=e.clientX; startY=e.clientY;
      startOx=ox; startOy=oy;
      canvas.classList.add('dragging');
    });
    window.addEventListener('mousemove', function(e){
      if(!dragging) return;
      ox = startOx + (e.clientX - startX);
      oy = startOy + (e.clientY - startY);
      applyTransform();
    });
    window.addEventListener('mouseup', function(){
      dragging=false; canvas.classList.remove('dragging');
    });

    // Touch pinch+pan
    var lastTouchDist=0, lastTouchMid={x:0,y:0};
    canvas.addEventListener('touchstart', function(e){
      if(e.touches.length===2){
        var t0=e.touches[0], t1=e.touches[1];
        lastTouchDist = Math.hypot(t1.clientX-t0.clientX, t1.clientY-t0.clientY);
        var r=canvas.getBoundingClientRect();
        lastTouchMid = {
          x: (t0.clientX+t1.clientX)/2 - r.left,
          y: (t0.clientY+t1.clientY)/2 - r.top
        };
      } else if(e.touches.length===1){
        dragging=true;
        startX=e.touches[0].clientX; startY=e.touches[0].clientY;
        startOx=ox; startOy=oy;
      }
    });
    canvas.addEventListener('touchmove', function(e){
      e.preventDefault();
      if(e.touches.length===2){
        var t0=e.touches[0], t1=e.touches[1];
        var dist=Math.hypot(t1.clientX-t0.clientX, t1.clientY-t0.clientY);
        zoomAround(dist/lastTouchDist, lastTouchMid.x, lastTouchMid.y);
        lastTouchDist=dist;
      } else if(e.touches.length===1 && dragging){
        ox=startOx+(e.touches[0].clientX-startX);
        oy=startOy+(e.touches[0].clientY-startY);
        applyTransform();
      }
    },{passive:false});
    canvas.addEventListener('touchend', function(){ dragging=false; });

    // ESC to close
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape') close();
      if(overlay.classList.contains('active')){
        if(e.key==='+'||e.key==='=') { var r=canvas.getBoundingClientRect(); zoomAround(1.2,r.width/2,r.height/2); }
        if(e.key==='-')              { var r=canvas.getBoundingClientRect(); zoomAround(1/1.2,r.width/2,r.height/2); }
        if(e.key==='0')              fitToCanvas();
      }
    });

    // Attach to all diagram images
    document.querySelectorAll('.diagram-wrapper img').forEach(function(el){
      el.style.cursor='zoom-in';
      el.addEventListener('click', function(){ open(el.src); });
    });
  }

  // ── Breadcrumb highlight ──────────────────────────────────────────────────
  function highlightBreadcrumb() {
    document.querySelectorAll('.wiki-nav .breadcrumb a').forEach(function(a){
      if(a.href===window.location.href){
        a.style.fontWeight='700'; a.style.color='#1e293b';
      }
    });
  }

  // ── Smooth scroll ─────────────────────────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var t=document.querySelector(a.getAttribute('href'));
        if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initLightbox();
    highlightBreadcrumb();
    initSmoothScroll();
  });
})();
