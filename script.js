// header scroll state + right-edge scroll rail
const header = document.getElementById('siteHeader');
const rail = document.getElementById('scrollRail');
const railFill = document.getElementById('railFill');
const railMarker = document.getElementById('railMarker');
let railHideTimer;
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  if(!rail) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
  railFill.style.height = pct + '%';
  railMarker.style.top = pct + '%';
  rail.classList.toggle('show', window.scrollY > 20);
  clearTimeout(railHideTimer);
  railHideTimer = setTimeout(() => { if(window.scrollY <= 20) rail.classList.remove('show'); }, 1200);
}, {passive:true});

// nav dropdowns (click to support touch; CSS handles hover)
document.querySelectorAll('.navdrop-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = btn.closest('.navdrop');
    document.querySelectorAll('.navdrop.open').forEach(o => { if(o !== d) o.classList.remove('open'); });
    d.classList.toggle('open');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.navdrop.open').forEach(o => o.classList.remove('open'));
});

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// portfolio filter (only present on portfolio.html)
const buttons = document.querySelectorAll('.pfilter button');
const cards = document.querySelectorAll('.pcard');
buttons.forEach(b => b.addEventListener('click', () => {
  buttons.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const f = b.dataset.f;
  cards.forEach(c => { c.style.display = (f==='all' || c.dataset.c===f) ? '' : 'none'; });
}));

// particle canvas — only present on index.html hero
const canvas = document.getElementById('particles');
if(canvas){
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PCOUNT = reduceMotion ? 0 : (window.innerWidth < 700 ? 45 : 90);

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function init(){
    resize();
    particles = Array.from({length:PCOUNT}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35,
      r: Math.random()*1.6+0.6
    }));
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
    });
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(240,146,58,0.6)';
      ctx.fill();
      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx=p.x-q.x, dy=p.y-q.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<130){
          ctx.beginPath();
          ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = `rgba(247,178,103,${0.18*(1-dist/130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize, {passive:true});
  if(!reduceMotion){ init(); tick(); } else { resize(); }
}

// ---- custom cursor + magnetic buttons + word reveal ----
const cxDot = document.querySelector('.cx-dot');
const cxRing = document.querySelector('.cx-ring');
const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduceMotionCX = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if(cxDot && cxRing && fine && !reduceMotionCX){
  let mx=0, my=0, rx=0, ry=0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cxDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  }, {passive:true});
  function ringLoop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    cxRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(ringLoop);
  }
  ringLoop();
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cxRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cxRing.classList.remove('hover'));
  });
}

// magnetic buttons
if(fine && !reduceMotionCX){
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width/2;
      const relY = e.clientY - r.top - r.height/2;
      el.style.transform = `translate(${relX*0.25}px, ${relY*0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
  });
}

// staggered reveal for pre-split hero words (markup already wraps each word
// in <span class="reveal-word"><span>Word</span></span> so <br> / gradient
// spans inside the headline survive untouched)
document.querySelectorAll('.reveal-word').forEach((w, i) => {
  setTimeout(() => w.classList.add('in'), 120 + i * 65);
});
