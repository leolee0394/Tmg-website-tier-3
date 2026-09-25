// ---- cursor ----
const cxDot = document.querySelector('.cx-dot');
const cxRing = document.querySelector('.cx-ring');
const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if(cxDot && cxRing && fine && !reduceMotion){
  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    cxDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  }, {passive:true});
  (function ring(){ rx+=(mx-rx)*0.18; ry+=(my-ry)*0.18; cxRing.style.transform=`translate(${rx}px, ${ry}px) translate(-50%,-50%)`; requestAnimationFrame(ring); })();
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cxRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cxRing.classList.remove('hover'));
  });
}

// ---- magnetic buttons ----
if(fine && !reduceMotion){
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.25}px, ${(e.clientY-r.top-r.height/2)*0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform='translate(0,0)'; });
  });
}

// ---- reveal on scroll (also triggers the pen-circle draw-in) ----
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:0.15});
document.querySelectorAll('.reveal, .circle-mark').forEach(el => io.observe(el));

// ---- 3D tilt on cards ----
if(fine && !reduceMotion){
  document.querySelectorAll('.scard, .card-item').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5;
      el.style.transform = `perspective(600px) rotateX(${-py*6}deg) rotateY(${px*6}deg) translateZ(2px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform=''; });
  });
}

// ---- gentle layout parallax on hero + section headers ----
if(fine && !reduceMotion){
  document.querySelectorAll('[data-float]').forEach(el => {
    window.addEventListener('scroll', () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(-1, Math.min(1, (r.top + r.height/2 - vh/2)/(vh/2)));
      el.style.transform = `translateY(${progress * parseFloat(el.dataset.float)}px)`;
    }, {passive:true});
  });
}

// ---- portfolio filter (if present) ----
const pf = document.querySelectorAll('.pfilter button');
const pc = document.querySelectorAll('.card-item[data-c]');
pf.forEach(b => b.addEventListener('click', () => {
  pf.forEach(x=>x.classList.remove('active')); b.classList.add('active');
  const f = b.dataset.f;
  pc.forEach(c => { c.style.display = (f==='all'||c.dataset.c===f) ? '' : 'none'; });
}));

// ---- motion toggle (footer) ----
const onBtn = document.getElementById('motionOn');
const offBtn = document.getElementById('motionOff');
if(onBtn && offBtn){
  onBtn.addEventListener('click', () => {
    onBtn.classList.add('active'); offBtn.classList.remove('active');
    document.documentElement.style.setProperty('scroll-behavior','smooth');
  });
  offBtn.addEventListener('click', () => {
    offBtn.classList.add('active'); onBtn.classList.remove('active');
    document.documentElement.style.setProperty('scroll-behavior','auto');
  });
}
