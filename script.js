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

// ---- round 2 ----

// inertial (eased) scroll via Lenis — a proper rAF-driven smoother instead of
// a hand-rolled scrollTo loop, which fought the browser's own scroll handling
// and read as stuttery. Falls back to plain native scroll if Lenis didn't load
// (e.g. offline) or on touch / reduced-motion, where native scroll is correct anyway.
if(fine && !reduceMotionCX && window.Lenis){
  const lenis = new window.Lenis({
    duration: 0.9,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true
  });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

// hero parallax — headline and particle field drift at different rates on scroll
const heroInner = document.querySelector('.hero-inner');
const heroCanvas = document.getElementById('particles');
if((heroInner || heroCanvas) && !reduceMotionCX){
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if(y < window.innerHeight){
      if(heroInner) heroInner.style.transform = `translateY(${y * 0.25}px)`;
      if(heroCanvas) heroCanvas.style.transform = `translateY(${y * 0.12}px)`;
    }
  }, {passive:true});
}

// 3D tilt on portfolio cards / bento tiles
if(fine && !reduceMotionCX){
  document.querySelectorAll('.pcard, .b-tile').forEach(el => {
    el.classList.add('tilt');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(600px) rotateX(${-py*8}deg) rotateY(${px*8}deg) translateZ(4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// cursor hover label (e.g. "View") on elements with data-cursor
if(cxRing && fine && !reduceMotionCX){
  const label = document.createElement('span');
  label.className = 'cx-label';
  cxRing.appendChild(label);
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; cxRing.classList.add('label'); });
    el.addEventListener('mouseleave', () => { cxRing.classList.remove('label'); });
  });
}

// text scramble on hover — nav links, dropdown buttons, portfolio card titles
if(fine && !reduceMotionCX){
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(el){
    if(el.dataset.scrambling) return;
    el.dataset.scrambling = '1';
    const original = el.textContent;
    const len = original.length;
    let frame = 0;
    const totalFrames = 14;
    const iv = setInterval(() => {
      frame++;
      el.textContent = original.split('').map((ch, i) => {
        if(ch === ' ') return ' ';
        const reveal = frame / totalFrames * len;
        return i < reveal ? original[i] : CHARS[Math.floor(Math.random()*CHARS.length)];
      }).join('');
      if(frame >= totalFrames){ clearInterval(iv); el.textContent = original; delete el.dataset.scrambling; }
    }, 28);
  }
  document.querySelectorAll('.navlinks > a, .navdrop-btn .lbl, .pcard h4').forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el));
  });
}

// preloader
const preloader = document.getElementById('preloader');
if(preloader){
  const numEl = preloader.querySelector('.pl-num span');
  let n = 0;
  const iv = setInterval(() => {
    n = Math.min(100, n + Math.ceil(Math.random()*18));
    if(numEl) numEl.textContent = n;
    if(n >= 100){ clearInterval(iv); setTimeout(() => preloader.classList.add('done'), 250); }
  }, 90);
}
