/* ============================================================
   Travel Agency Process Wiki — wiki.js  v3 (pan+zoom lightbox)
   ============================================================ */

(function () {
  'use strict';

  /* ── Pan + Zoom Lightbox ───────────────────────────────────────────────── */
  function initLightbox() {

    /* Build overlay DOM */
    var ov = document.createElement('div');
    ov.id  = 'lbx';
    ov.innerHTML =
      '<div id="lbx-bar">' +
        '<button id="lbx-zi"  title="Zoom in (+ key)">＋</button>' +
        '<button id="lbx-zo"  title="Zoom out (- key)">－</button>' +
        '<button id="lbx-fit" title="Fit (0 key)">⊙ Fit</button>' +
        '<span   id="lbx-pct">100%</span>' +
        '<span   id="lbx-hint">Scroll=zoom · Drag=pan · ESC=close</span>' +
        '<button id="lbx-x"   title="Close (ESC)">✕</button>' +
      '</div>' +
      '<div id="lbx-stage"><img id="lbx-img" draggable="false"></div>';

    /* Inline styles — self-contained, no dependency on wiki.css */
    var st = document.createElement('style');
    st.textContent =
      '#lbx{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);' +
        'z-index:99999;flex-direction:column;font-family:-apple-system,sans-serif;}' +
      '#lbx.on{display:flex;}' +
      '#lbx-bar{display:flex;align-items:center;gap:8px;padding:8px 14px;' +
        'background:rgba(15,23,42,.85);flex-shrink:0;border-bottom:1px solid #1e293b;}' +
      '#lbx-bar button{background:#334155;color:#e2e8f0;border:none;border-radius:5px;' +
        'padding:4px 11px;font-size:15px;cursor:pointer;line-height:1.4;}' +
      '#lbx-bar button:hover{background:#475569;}' +
      '#lbx-x{margin-left:auto!important;font-size:18px;padding:2px 10px;}' +
      '#lbx-pct{color:#94a3b8;font-size:12px;min-width:42px;text-align:right;}' +
      '#lbx-hint{color:#475569;font-size:11px;flex:1;}' +
      '#lbx-stage{flex:1;overflow:hidden;position:relative;cursor:grab;}' +
      '#lbx-stage.drag{cursor:grabbing;}' +
      '#lbx-img{position:absolute;transform-origin:0 0;user-select:none;' +
        'max-width:none;max-height:none;border-radius:4px;pointer-events:none;}';
    document.head.appendChild(st);
    document.body.appendChild(ov);

    var img   = document.getElementById('lbx-img');
    var stage = document.getElementById('lbx-stage');
    var pctEl = document.getElementById('lbx-pct');

    var sc=1, ox=0, oy=0;
    var MIN=0.05, MAX=10;
    var dragging=false, sx=0, sy=0, sox=0, soy=0;

    function setPct(){ pctEl.textContent = Math.round(sc*100)+'%'; }

    function apply(){
      img.style.transform = 'translate('+ox+'px,'+oy+'px) scale('+sc+')';
      setPct();
    }

    function fit(){
      var cw=stage.clientWidth, ch=stage.clientHeight;
      var iw=img.naturalWidth,  ih=img.naturalHeight;
      if(!iw||!ih) return;
      sc = Math.min(cw/iw, ch/ih) * 0.94;
      ox = (cw - iw*sc)/2;
      oy = (ch - ih*sc)/2;
      apply();
    }

    function zoom(factor, px, py){
      var ns = Math.max(MIN, Math.min(MAX, sc*factor));
      var r  = ns/sc;
      ox = px - r*(px-ox);
      oy = py - r*(py-oy);
      sc = ns;
      apply();
    }

    function open(src){
      img.src='';
      ov.classList.add('on');
      img.onload = fit;
      img.src = src;
      if(img.complete && img.naturalWidth) fit();
    }

    function close(){ ov.classList.remove('on'); }

    /* Toolbar buttons */
    document.getElementById('lbx-zi') .onclick = function(){
      var r=stage.getBoundingClientRect();
      zoom(1.3, r.width/2, r.height/2);
    };
    document.getElementById('lbx-zo') .onclick = function(){
      var r=stage.getBoundingClientRect();
      zoom(1/1.3, r.width/2, r.height/2);
    };
    document.getElementById('lbx-fit').onclick = fit;
    document.getElementById('lbx-x')  .onclick = close;

    /* Click outside image (on overlay itself) closes */
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });

    /* Mouse wheel zoom */
    stage.addEventListener('wheel', function(e){
      e.preventDefault();
      var r  = stage.getBoundingClientRect();
      var px = e.clientX - r.left;
      var py = e.clientY - r.top;
      zoom(e.deltaY < 0 ? 1.12 : 1/1.12, px, py);
    }, {passive:false});

    /* Mouse drag */
    stage.addEventListener('mousedown', function(e){
      if(e.button!==0) return;
      dragging=true; sx=e.clientX; sy=e.clientY; sox=ox; soy=oy;
      stage.classList.add('drag');
    });
    window.addEventListener('mousemove', function(e){
      if(!dragging) return;
      ox=sox+(e.clientX-sx); oy=soy+(e.clientY-sy); apply();
    });
    window.addEventListener('mouseup',   function(){ dragging=false; stage.classList.remove('drag'); });

    /* Touch: one finger = pan, two fingers = pinch zoom */
    var tDist=0, tMid={x:0,y:0};
    stage.addEventListener('touchstart',function(e){
      if(e.touches.length===2){
        var t0=e.touches[0],t1=e.touches[1];
        tDist=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
        var r=stage.getBoundingClientRect();
        tMid={x:(t0.clientX+t1.clientX)/2-r.left,y:(t0.clientY+t1.clientY)/2-r.top};
      } else if(e.touches.length===1){
        dragging=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; sox=ox; soy=oy;
      }
    },{passive:true});
    stage.addEventListener('touchmove',function(e){
      e.preventDefault();
      if(e.touches.length===2){
        var t0=e.touches[0],t1=e.touches[1];
        var d=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
        zoom(d/tDist,tMid.x,tMid.y); tDist=d;
      } else if(e.touches.length===1&&dragging){
        ox=sox+(e.touches[0].clientX-sx); oy=soy+(e.touches[0].clientY-sy); apply();
      }
    },{passive:false});
    stage.addEventListener('touchend',function(){ dragging=false; });

    /* Keyboard shortcuts */
    document.addEventListener('keydown',function(e){
      if(!ov.classList.contains('on')) return;
      var r=stage.getBoundingClientRect();
      var cx=r.width/2, cy=r.height/2;
      if(e.key==='Escape')          close();
      else if(e.key==='+'||e.key==='=') zoom(1.2,cx,cy);
      else if(e.key==='-')          zoom(1/1.2,cx,cy);
      else if(e.key==='0')          fit();
    });

    /* Attach to all diagram images on the page */
    function attachImages(){
      document.querySelectorAll('.diagram-wrapper img').forEach(function(el){
        if(el.dataset.lbxBound) return;
        el.dataset.lbxBound = '1';
        el.style.cursor = 'zoom-in';
        el.addEventListener('click', function(){ open(el.src); });
      });
    }

    attachImages();

    /* Also catch dynamically added images */
    if(window.MutationObserver){
      new MutationObserver(attachImages).observe(document.body,{childList:true,subtree:true});
    }
  }

  /* ── Breadcrumb highlight ─────────────────────────────────────────────── */
  function highlightBreadcrumb(){
    document.querySelectorAll('.wiki-nav .breadcrumb a').forEach(function(a){
      if(a.href===window.location.href){
        a.style.fontWeight='700'; a.style.color='#1e293b';
      }
    });
  }

  /* ── Smooth anchor scroll ─────────────────────────────────────────────── */
  function initSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var t=document.querySelector(a.getAttribute('href'));
        if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    initLightbox();
    highlightBreadcrumb();
    initSmoothScroll();
  });

})();
