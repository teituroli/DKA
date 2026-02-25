// portfolio-react.jsx
// All content comes from /public/config.json — edit via the admin panel.
// No hardcoded names, projects, CV entries, or photos.

import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG LOADER ───────────────────────────────────────────────────────────
// Reads /public/config.json at runtime.
// In dev:  Vite serves public/ at /
// In prod: GitHub Pages serves public/ at /
function useConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/config.json?" + Date.now())
      .then(r => r.ok ? r.json() : Promise.reject("not found"))
      .then(setConfig)
      .catch(() => setConfig({
        site: {
          name: "Your Name",
          tagline: "Furniture · Space · Material",
          school: "Royal Danish Academy",
          email: "your@email.com",
          cvFile: "",
          manifesto: "Edit your content in the admin panel.\nGo to yoursite.com/#admin to get started.",
          manifestoAccents: [],
        },
        photos: [],
        svgs:   [],
        projects: [],
        cv: { education: [], exhibitions: [], experience: [], tools: [] },
      }));
  }, []);

  return config;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --bone: #F0EBE1;
  --bone2: #E6E0D4;
  --dark: #181714;
  --mid: #5C564E;
  --light: #9B9188;
  --amber: #C4A87A;
  --line: rgba(24,23,20,0.1);
  --serif: 'DM Serif Display', serif;
  --body: 'Cormorant Garamond', serif;
  --mono: 'Courier New', monospace;
}

html { scroll-behavior: smooth; overflow-x: hidden; }
body {
  background: var(--bone); color: var(--dark);
  font-family: var(--body); cursor: none; overflow-x: hidden;
}

/* ── CURSOR ── */
.cur {
  position:fixed; z-index:9999; pointer-events:none;
  width:10px; height:10px; border-radius:50%;
  background:var(--dark); transform:translate(-50%,-50%);
  transition: width .4s cubic-bezier(.4,0,.2,1),
              height .4s cubic-bezier(.4,0,.2,1),
              background .4s ease, border-radius .4s ease;
  mix-blend-mode:multiply;
}
.cur.big   { width:60px; height:60px; background:transparent; border:1px solid var(--dark); border-radius:50%; }
.cur.proj  { width:80px; height:80px; background:rgba(196,168,122,.15); border:1px solid var(--amber); border-radius:0; }
.cur-ring  {
  position:fixed; z-index:9998; pointer-events:none;
  width:44px; height:44px; border-radius:50%;
  border:1px solid rgba(24,23,20,.18); transform:translate(-50%,-50%);
}

/* ── NAV ── */
nav {
  position:fixed; top:0; left:0; right:0; z-index:200;
  padding:28px 48px; display:flex; justify-content:space-between; align-items:center;
}
.nav-logo {
  font-family:var(--mono); font-size:.58rem; letter-spacing:.3em;
  text-transform:uppercase; color:var(--dark);
  opacity:0; animation:fadeUp .8s ease 2.8s forwards;
}
.nav-links { display:flex; gap:36px; list-style:none; }
.nav-links a {
  font-family:var(--mono); font-size:.52rem; letter-spacing:.25em;
  text-transform:uppercase; color:var(--mid); text-decoration:none;
  transition:color .3s; position:relative;
  opacity:0; animation:fadeUp .8s ease 3s forwards;
}
.nav-links a::after {
  content:''; position:absolute; bottom:-3px; left:0;
  width:0; height:1px; background:var(--dark);
  transition:width .4s cubic-bezier(.4,0,.2,1);
}
.nav-links a:hover { color:var(--dark); }
.nav-links a:hover::after { width:100%; }

/* ── LANDING ── */
.landing {
  height:100vh; position:relative; display:flex;
  flex-direction:column; justify-content:center; align-items:center; overflow:hidden;
}
.grid-bg { position:absolute; inset:0; overflow:hidden; z-index:0; }

.hero-obj {
  position:relative; z-index:2; margin-bottom:56px;
  width:200px; height:200px;
  animation:heroFloat 7s ease-in-out infinite;
}
@keyframes heroFloat {
  0%,100% { transform:translateY(0) rotate(.3deg); }
  40%     { transform:translateY(-16px) rotate(-.5deg); }
  70%     { transform:translateY(-8px) rotate(.8deg); }
}

.hero-svg path,.hero-svg line,.hero-svg circle,.hero-svg rect,.hero-svg polyline {
  stroke-dasharray:600; stroke-dashoffset:600;
}
.hero-svg .draw-1 { animation:drawPath 1.8s ease .4s forwards; }
.hero-svg .draw-2 { animation:drawPath 1.4s ease 1s forwards; }
.hero-svg .draw-3 { animation:drawPath 1s ease 1.5s forwards; }
.hero-svg .draw-4 { animation:drawPath 1.2s ease 1.8s forwards; }
.hero-svg .draw-5 { animation:drawPath .8s ease 2.2s forwards; }
@keyframes drawPath { to { stroke-dashoffset:0; } }

.hero-name {
  font-family:var(--serif); font-size:clamp(2.8rem,7vw,5.6rem);
  font-weight:400; letter-spacing:.04em; text-align:center;
  position:relative; z-index:2; line-height:.95;
  opacity:0; animation:fadeUp 1s ease 1.8s forwards;
}
.hero-sub {
  font-family:var(--mono); font-size:.6rem; letter-spacing:.28em;
  color:var(--light); text-transform:uppercase; margin-top:16px;
  position:relative; z-index:2;
  opacity:0; animation:fadeUp 1s ease 2.1s forwards;
}
.enter-cta {
  margin-top:52px; position:relative; z-index:2;
  background:none; border:none; cursor:none;
  font-family:var(--mono); font-size:.56rem; letter-spacing:.4em;
  text-transform:uppercase; color:var(--dark);
  display:flex; align-items:center; gap:14px;
  opacity:0; animation:fadeUp 1s ease 2.4s forwards; transition:color .3s;
}
.enter-cta .cta-line {
  display:block; width:32px; height:1px; background:var(--dark);
  transition:width .5s cubic-bezier(.4,0,.2,1), background .3s;
}
.enter-cta:hover { color:var(--amber); }
.enter-cta:hover .cta-line { width:70px; background:var(--amber); }

.scroll-prompt {
  position:absolute; bottom:36px; left:50%; transform:translateX(-50%); z-index:2;
  display:flex; flex-direction:column; align-items:center; gap:8px;
  opacity:0; animation:fadeUp 1s ease 3.2s forwards;
}
.scroll-prompt span {
  font-family:var(--mono); font-size:.45rem; letter-spacing:.35em;
  text-transform:uppercase; color:var(--light);
}
.scroll-bar {
  width:1px; height:48px; background:var(--dark); transform-origin:top center;
  animation:scrollDrop 1.8s ease-in-out infinite 3.5s;
}
@keyframes scrollDrop {
  0%   { transform:scaleY(0); opacity:0; }
  30%  { transform:scaleY(1); opacity:1; }
  80%  { transform:scaleY(1); opacity:1; }
  100% { transform:scaleY(0) translateY(48px); opacity:0; }
}

/* ── MANIFESTO ── */
.manifesto {
  background:var(--dark); color:var(--bone);
  padding:130px 10vw; position:relative; overflow:hidden;
}
.manifesto-label {
  font-family:var(--mono); font-size:.5rem; letter-spacing:.35em;
  text-transform:uppercase; color:rgba(240,235,225,.3);
  display:flex; align-items:center; gap:16px; margin-bottom:64px;
}
.manifesto-label::after { content:''; flex:1; max-width:180px; height:1px; background:rgba(240,235,225,.1); }
.manifesto-body {
  font-family:var(--serif); font-size:clamp(1.9rem,3.8vw,3.2rem);
  font-weight:400; font-style:italic; line-height:1.55; max-width:820px;
}
.mani-accent { color:var(--amber); font-style:normal; }
.mani-corner {
  position:absolute; width:60px; height:60px;
  border-top:1px solid rgba(196,168,122,.4); border-left:1px solid rgba(196,168,122,.4);
}
.mani-corner.tr { top:48px; right:48px; border-top:1px solid rgba(196,168,122,.4); border-right:1px solid rgba(196,168,122,.4); border-left:none; }
.mani-corner.bl { bottom:48px; left:48px; border-top:none; border-bottom:1px solid rgba(196,168,122,.4); border-left:1px solid rgba(196,168,122,.4); }

/* ── PROJECTS ── */
.work { padding:100px 0 120px; background:var(--bone); }
.work-header {
  padding:0 8vw; display:flex; justify-content:space-between;
  align-items:flex-end; margin-bottom:56px;
}
.work-label {
  font-family:var(--mono); font-size:.5rem; letter-spacing:.35em;
  text-transform:uppercase; color:var(--light);
  display:flex; align-items:center; gap:16px;
}
.work-label::before { content:''; width:20px; height:1px; background:var(--light); }
.work-hint { font-family:var(--mono); font-size:.48rem; letter-spacing:.2em; text-transform:uppercase; color:var(--light); }

.proj-track {
  display:flex; gap:3px; overflow-x:scroll; scrollbar-width:none;
  padding:0 8vw 20px; scroll-snap-type:x mandatory;
}
.proj-track::-webkit-scrollbar { display:none; }

.proj-card {
  flex-shrink:0; scroll-snap-align:start; width:320px; height:500px;
  position:relative; overflow:hidden; cursor:none;
  transition:width .7s cubic-bezier(.4,0,.2,1);
}
.proj-card:hover { width:430px; }

.proj-bg { position:absolute; inset:0; transition:transform .8s cubic-bezier(.4,0,.2,1); }
.proj-card:hover .proj-bg { transform:scale(1.04); }

/* SVG drawing from file (img tag) */
.proj-svg-wrap {
  position:absolute; inset:0; width:100%; height:60%;
  display:flex; align-items:center; justify-content:center;
  padding:24px;
}
.proj-svg-wrap img {
  width:100%; height:100%; object-fit:contain;
  opacity:0; transition:opacity .7s ease .1s;
}
.proj-card:hover .proj-svg-wrap img { opacity:1; }

/* Inline SVG drawing animation (fallback) */
.proj-drawing path,.proj-drawing line,
.proj-drawing circle,.proj-drawing rect,.proj-drawing ellipse {
  stroke-dasharray:800; stroke-dashoffset:800;
  transition:stroke-dashoffset .9s cubic-bezier(.4,0,.2,1);
}
.proj-card:hover .proj-drawing path,
.proj-card:hover .proj-drawing line,
.proj-card:hover .proj-drawing circle,
.proj-card:hover .proj-drawing rect,
.proj-card:hover .proj-drawing ellipse { stroke-dashoffset:0; }

.proj-info {
  position:absolute; bottom:0; left:0; right:0; padding:28px;
  display:flex; flex-direction:column; justify-content:flex-end;
  background:linear-gradient(transparent 0%, rgba(24,23,20,.55) 100%);
}
.proj-num {
  position:absolute; top:20px; right:20px;
  font-family:var(--mono); font-size:.46rem;
  letter-spacing:.2em; color:rgba(240,235,225,.5);
}
.proj-mat {
  font-family:var(--mono); font-size:.46rem; letter-spacing:.3em;
  text-transform:uppercase; color:var(--amber); margin-bottom:10px;
  opacity:0; transform:translateY(8px);
  transition:opacity .4s ease .1s, transform .4s ease .1s;
}
.proj-card:hover .proj-mat { opacity:1; transform:translateY(0); }
.proj-title { font-family:var(--serif); font-size:1.75rem; font-weight:400; color:var(--bone); line-height:1.05; }
.proj-year { font-family:var(--mono); font-size:.44rem; letter-spacing:.2em; color:rgba(240,235,225,.5); margin-top:8px; text-transform:uppercase; }
.proj-blurb {
  font-size:.88rem; line-height:1.7; color:rgba(240,235,225,.75);
  margin-top:14px; max-width:280px;
  opacity:0; transform:translateY(10px);
  transition:opacity .45s ease .2s, transform .45s ease .2s;
}
.proj-card:hover .proj-blurb { opacity:1; transform:translateY(0); }

/* empty projects state */
.proj-empty {
  padding:0 8vw;
  font-family:var(--mono); font-size:.5rem; letter-spacing:.22em;
  text-transform:uppercase; color:var(--light);
}

/* ── MODAL ── */
.modal-wrap { position:fixed; inset:0; z-index:500; pointer-events:none; overflow:hidden; }
.modal-panel {
  position:absolute; inset:0; background:var(--dark);
  transform:translateX(100%); transition:transform .7s cubic-bezier(.77,0,.18,1);
  display:flex;
}
.modal-wrap.open { pointer-events:all; }
.modal-wrap.open .modal-panel { transform:translateX(0); }

.modal-left {
  width:50%; display:flex; align-items:center; justify-content:center;
  padding:80px; border-right:1px solid rgba(240,235,225,.08);
  position:relative; overflow:hidden;
}
.modal-left img { width:100%; max-width:380px; height:auto; object-fit:contain; }
.modal-left svg { width:100%; max-width:380px; height:auto; }

.modal-right {
  width:50%; padding:100px 80px;
  display:flex; flex-direction:column; justify-content:center;
  color:var(--bone); overflow-y:auto;
}
.modal-close-btn {
  position:absolute; top:32px; right:40px; background:none; border:none; cursor:none;
  font-family:var(--mono); font-size:.52rem; letter-spacing:.3em; text-transform:uppercase;
  color:rgba(240,235,225,.5); display:flex; align-items:center; gap:10px; transition:color .3s;
}
.modal-close-btn:hover { color:var(--amber); }
.modal-counter { font-family:var(--mono); font-size:.46rem; letter-spacing:.25em; color:rgba(240,235,225,.3); margin-bottom:40px; }
.modal-title { font-family:var(--serif); font-size:clamp(2rem,4vw,3.4rem); font-style:italic; line-height:1.05; margin-bottom:10px; }
.modal-mat { font-family:var(--mono); font-size:.5rem; letter-spacing:.3em; text-transform:uppercase; color:var(--amber); margin-bottom:40px; }
.modal-desc { font-size:1rem; line-height:1.9; color:rgba(240,235,225,.65); max-width:400px; margin-bottom:48px; }
.modal-specs { display:grid; grid-template-columns:1fr 1fr; gap:28px; border-top:1px solid rgba(240,235,225,.08); padding-top:40px; }
.spec-label { font-family:var(--mono); font-size:.44rem; letter-spacing:.25em; text-transform:uppercase; color:rgba(240,235,225,.3); margin-bottom:6px; }
.spec-val { font-size:.9rem; color:var(--bone); }

/* ── CV ── */
.cv-section { background:var(--bone2); padding:120px 8vw; }
.cv-label {
  font-family:var(--mono); font-size:.5rem; letter-spacing:.35em;
  text-transform:uppercase; color:var(--light);
  display:flex; align-items:center; gap:16px; margin-bottom:64px;
}
.cv-label::before { content:''; width:20px; height:1px; background:var(--light); }
.cv-drawing { width:100%; margin-bottom:56px; overflow:hidden; }
.cv-drawing line { stroke-dasharray:1000; stroke-dashoffset:1000; transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }
.cv-drawing.visible line { stroke-dashoffset:0; }

.cv-blocks { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--line); border:1px solid var(--line); }
.cv-blk { background:var(--bone2); padding:44px 36px; }
.cv-blk-label {
  font-family:var(--mono); font-size:.46rem; letter-spacing:.35em;
  text-transform:uppercase; color:var(--light); margin-bottom:32px;
  display:flex; align-items:center; gap:10px;
}
.cv-blk-label::before { content:''; display:block; width:14px; height:1px; background:var(--light); }
.cv-entry { margin-bottom:26px; padding-bottom:26px; border-bottom:1px solid var(--line); }
.cv-entry:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }
.cv-yr { font-family:var(--mono); font-size:.46rem; letter-spacing:.18em; color:var(--amber); margin-bottom:5px; }
.cv-tt { font-family:var(--serif); font-size:1rem; line-height:1.2; }
.cv-sb { font-size:.82rem; color:var(--mid); font-style:italic; margin-top:3px; }
.tools-wrap { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
.tool {
  font-family:var(--mono); font-size:.44rem; letter-spacing:.18em;
  text-transform:uppercase; padding:6px 11px; border:1px solid var(--line);
  color:var(--mid); transition:all .35s ease; cursor:none;
}
.tool:hover { border-color:var(--dark); color:var(--dark); }

/* ── CONTACT ── */
.contact {
  background:var(--dark); color:var(--bone);
  padding:120px 8vw 80px; position:relative; overflow:hidden;
  min-height:65vh; display:flex; flex-direction:column; justify-content:space-between;
}
.contact::before {
  content:''; position:absolute; inset:0;
  background-image: linear-gradient(rgba(240,235,225,.035) 1px,transparent 1px),
                    linear-gradient(90deg,rgba(240,235,225,.035) 1px,transparent 1px);
  background-size:72px 72px;
}
.contact-label {
  font-family:var(--mono); font-size:.5rem; letter-spacing:.35em;
  text-transform:uppercase; color:rgba(240,235,225,.3);
  display:flex; align-items:center; gap:16px; margin-bottom:56px; position:relative;
}
.contact-label::after { content:''; flex:1; max-width:180px; height:1px; background:rgba(240,235,225,.1); }
.contact-big {
  font-family:var(--serif); font-size:clamp(3rem,8vw,8.5rem);
  font-weight:400; font-style:italic; line-height:.92; position:relative;
}
.contact-big em { font-style:normal; color:var(--amber); }
.contact-email {
  display:inline-flex; align-items:center; gap:16px; margin-top:52px; position:relative;
  font-family:var(--mono); font-size:.62rem; letter-spacing:.28em;
  text-transform:uppercase; color:var(--light); text-decoration:none; transition:color .3s;
}
.contact-email::before { content:''; width:28px; height:1px; background:var(--light); transition:width .4s ease, background .3s; }
.contact-email:hover { color:var(--amber); }
.contact-email:hover::before { width:56px; background:var(--amber); }
.contact-foot {
  display:flex; justify-content:space-between; align-items:flex-end;
  position:relative; margin-top:80px;
}
.contact-foot p { font-family:var(--mono); font-size:.44rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(240,235,225,.22); line-height:2; }
.dl-cv {
  font-family:var(--mono); font-size:.52rem; letter-spacing:.28em;
  text-transform:uppercase; color:var(--bone); text-decoration:none;
  display:flex; align-items:center; gap:14px; transition:color .3s;
}
.dl-cv::after { content:''; width:28px; height:1px; background:var(--bone); transition:width .4s ease, background .3s; }
.dl-cv:hover { color:var(--amber); }
.dl-cv:hover::after { width:56px; background:var(--amber); }

/* ── PHOTOS PAGE ── */
.photo-filter-btn {
  font-family:var(--mono); font-size:.46rem; letter-spacing:.22em;
  text-transform:uppercase; padding:7px 14px; cursor:none;
  transition:all .3s ease;
}
.photo-tile-caption {
  position:absolute; bottom:0; left:0; right:0;
  padding:24px 20px 16px;
  background:linear-gradient(transparent,rgba(24,23,20,.55));
  opacity:0; transition:opacity .35s ease; pointer-events:none;
}
.photo-tile:hover .photo-tile-caption { opacity:1; }
.photo-placeholder {
  width:100%; height:100%; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:10px;
}

/* ── SCROLL REVEAL ── */
.reveal { opacity:0; transform:translateY(28px); transition:opacity .9s ease, transform .9s ease; }
.reveal.vis { opacity:1; transform:translateY(0); }

/* ── SHARED ANIMATIONS ── */
@keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

/* ── LOADING ── */
.loading-screen {
  position:fixed; inset:0; background:var(--bone); z-index:9999;
  display:flex; align-items:center; justify-content:center;
}
.loading-screen span {
  font-family:var(--mono); font-size:.5rem; letter-spacing:.4em;
  text-transform:uppercase; color:var(--light);
  animation:pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }

/* ── RESPONSIVE ── */
@media(max-width:900px) {
  .cv-blocks { grid-template-columns:1fr 1fr; }
  .modal-left { display:none; }
  .modal-right { width:100%; padding:80px 40px; }
  nav .nav-links { display:none; }
}
@media(max-width:600px) {
  .cv-blocks { grid-template-columns:1fr; }
  nav { padding:20px 24px; }
  .contact-foot { flex-direction:column; gap:24px; align-items:flex-start; }
}
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useMousePos() {
  const [dot, setDot]   = useState({ x: -200, y: -200 });
  const [ring, setRing] = useState({ x: -200, y: -200 });
  const raw = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = e => { raw.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let id;
    const rp = { x: -200, y: -200 };
    const tick = () => {
      const { x, y } = raw.current;
      setDot({ x, y });
      rp.x += (x - rp.x) * 0.1;
      rp.y += (y - rp.y) * 0.1;
      setRing({ x: rp.x, y: rp.y });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return { dot, ring };
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function GridBg() {
  const rows = [15, 30, 50, 70, 85];
  const cols = [15, 30, 50, 70, 85];
  return (
    <div className="grid-bg">
      <svg width="100%" height="100%">
        {rows.map((r, i) => (
          <line key={`h${i}`} x1="0" y1={`${r}%`} x2="100%" y2={`${r}%`}
            stroke="rgba(24,23,20,0.08)" strokeWidth="1"
            strokeDasharray="1200" strokeDashoffset="1200"
            style={{ animation: `drawPath 1.6s ease ${0.2 + i * 0.15}s forwards` }} />
        ))}
        {cols.map((c, i) => (
          <line key={`v${i}`} x1={`${c}%`} y1="0" x2={`${c}%`} y2="100%"
            stroke="rgba(24,23,20,0.08)" strokeWidth="1"
            strokeDasharray="1200" strokeDashoffset="1200"
            style={{ animation: `drawPath 1.6s ease ${0.4 + i * 0.15}s forwards` }} />
        ))}
      </svg>
    </div>
  );
}

function MagneticText({ children, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = e => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const d  = Math.sqrt(dx * dx + dy * dy);
      el.style.transform = d < 0.8
        ? `translate(${dx * (1 - d) * 12}px,${dy * (1 - d) * 12}px)`
        : "translate(0,0)";
    };
    el.style.transition = "transform .6s cubic-bezier(.4,0,.2,1)";
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <span ref={ref} className={className}>{children}</span>;
}

function SVGRuler() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`cv-drawing ${vis ? "visible" : ""}`} style={{ marginBottom: 48 }}>
      <svg viewBox="0 0 1000 60" fill="none">
        <line x1="0" y1="30" x2="1000" y2="30" stroke="#1C1C1A" strokeWidth="1"
          strokeDasharray="1200" strokeDashoffset={vis ? "0" : "1200"}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }} />
        {Array.from({ length: 21 }).map((_, i) => (
          <g key={i}>
            <line x1={i * 50} y1={i % 4 === 0 ? 10 : i % 2 === 0 ? 18 : 22} x2={i * 50} y2={30}
              stroke="#1C1C1A" strokeWidth={i % 4 === 0 ? .8 : .5}
              strokeDasharray="60" strokeDashoffset={vis ? "0" : "60"}
              style={{ transition: `stroke-dashoffset .6s ease ${.05 * i}s` }} />
            {i % 4 === 0 && (
              <text x={i * 50} y={8} textAnchor="middle" fontFamily="Courier New" fontSize="7" fill="#9B9188">
                {i * 50}
              </text>
            )}
          </g>
        ))}
        {[120, 380, 640, 860].map(x => (
          <line key={x} x1={x} y1="30" x2={x} y2="48"
            stroke="#C4A87A" strokeWidth="1.2"
            strokeDasharray="30" strokeDashoffset={vis ? "0" : "30"}
            style={{ transition: "stroke-dashoffset .5s ease .6s" }} />
        ))}
        <text x="1000" y="48" textAnchor="end" fontFamily="Courier New" fontSize="7" fill="#9B9188">mm</text>
      </svg>
    </div>
  );
}

// ─── MANIFESTO ───────────────────────────────────────────────────────────────
// Renders manifesto text from config, highlighting accent words in amber.
// Line breaks in the config text (\n) become <br/> elements.
function ManifestoBody({ text, accents }) {
  if (!text) return null;
  const accentSet = new Set((accents || []).map(a => a.toLowerCase()));

  return (
    <p className="manifesto-body reveal">
      {text.split("\n").map((line, li) => (
        <span key={li}>
          {line.split(" ").map((word, wi) => {
            const clean = word.replace(/[.,—\-]/g, "").toLowerCase();
            return accentSet.has(clean)
              ? <span key={wi} className="mani-accent">{word} </span>
              : <span key={wi}>{word} </span>;
          })}
          {li < text.split("\n").length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
// Renders an SVG from /public/svgs/ if cardSvg is set,
// otherwise shows nothing in the drawing area (clean card with just colour).
function ProjectCard({ project, index, total, onOpen, projIn, projOut }) {
  const svgSrc = project.cardSvg ? `/svgs/${project.cardSvg}` : null;

  return (
    <div
      className="proj-card"
      style={{ background: project.cardBg || "#D6C9AF" }}
      onMouseEnter={projIn}
      onMouseLeave={projOut}
      onClick={() => onOpen(project)}
    >
      <div className="proj-bg">
        {svgSrc && (
          <div className="proj-svg-wrap">
            <img src={svgSrc} alt={`${project.title} drawing`} />
          </div>
        )}
      </div>
      <div className="proj-num">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className="proj-info">
        <div className="proj-mat">{project.material}</div>
        <h3 className="proj-title">{project.title}</h3>
        <p className="proj-year">{project.year}</p>
        <p className="proj-blurb">{project.blurb}</p>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
// Shows full project detail. modalSvg is loaded from /public/svgs/.
function ProjectModal({ project, index, total, onClose, big, small }) {
  const modalSvgSrc = project?.modalSvg ? `/svgs/${project.modalSvg}` : null;

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = project ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  return (
    <div className={`modal-wrap ${project ? "open" : ""}`}>
      <div className="modal-panel">
        {project && (
          <>
            <button className="modal-close-btn" onMouseEnter={big} onMouseLeave={small} onClick={onClose}>
              × Close
            </button>

            {/* Left — SVG or colour block */}
            <div className="modal-left" style={{ background: project.cardBg || "#D6C9AF" }}>
              {modalSvgSrc
                ? <img src={modalSvgSrc} alt={`${project.title} drawing`} />
                : (
                  /* Fallback: decorative geometric placeholder */
                  <svg viewBox="0 0 300 300" fill="none" opacity=".25">
                    <rect x="40" y="40" width="220" height="220" stroke="rgba(240,235,225,.6)" strokeWidth="1"/>
                    <rect x="80" y="80" width="140" height="140" stroke="#C4A87A" strokeWidth=".7" transform="rotate(45 150 150)"/>
                    <circle cx="150" cy="150" r="50" stroke="rgba(240,235,225,.6)" strokeWidth="1.2"/>
                    <line x1="150" y1="40" x2="150" y2="260" stroke="rgba(240,235,225,.3)" strokeWidth=".5"/>
                    <line x1="40" y1="150" x2="260" y2="150" stroke="rgba(240,235,225,.3)" strokeWidth=".5"/>
                  </svg>
                )
              }
            </div>

            {/* Right — text */}
            <div className="modal-right">
              <div className="modal-counter">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </div>
              <h2 className="modal-title">{project.title}</h2>
              <div className="modal-mat">{project.material}</div>
              <p className="modal-desc">{project.description}</p>
              {project.specs && Object.keys(project.specs).length > 0 && (
                <dl className="modal-specs">
                  {Object.entries(project.specs).map(([k, v]) => (
                    <div key={k}>
                      <dt className="spec-label">{k}</dt>
                      <dd className="spec-val">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PHOTOS PAGE ──────────────────────────────────────────────────────────────
// Reads photos from config.photos.
// Each entry: { filename, displayName, year, category, caption, order }
// Images are served from /public/photos/ → /photos/filename.jpg
function PhotoPage({ photos, big, small }) {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const sorted  = [...photos].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const cats    = ["All", ...Array.from(new Set(sorted.map(p => p.category).filter(Boolean)))];
  const visible = filter === "All" ? sorted : sorted.filter(p => p.category === filter);

  const palettes = ["#D6C9AF", "#C2CDD4", "#CEC6B5", "#C8BFB2", "#D4CEC4", "#C9C0B5"];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "0 8vw", marginBottom: 48 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".5rem", letterSpacing: ".35em", textTransform: "uppercase", color: "var(--light)", display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <span style={{ width: 20, height: 1, background: "var(--light)", display: "block" }} />
          04 — Photography
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 400, fontStyle: "italic", lineHeight: .95 }}>
          Work in progress.
        </h2>
      </div>

      {/* Filters */}
      {cats.length > 1 && (
        <div style={{ padding: "0 8vw", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {cats.map(cat => (
            <button key={cat} className="photo-filter-btn"
              onMouseEnter={big} onMouseLeave={small}
              onClick={() => setFilter(cat)}
              style={{
                border: `1px solid ${filter === cat ? "var(--dark)" : "var(--line)"}`,
                background: filter === cat ? "var(--dark)" : "transparent",
                color: filter === cat ? "var(--bone)" : "var(--mid)",
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {visible.length === 0
        ? (
          <div style={{ padding: "0 8vw", fontFamily: "var(--mono)", fontSize: ".46rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--light)" }}>
            No photos yet — upload images in the admin panel.
          </div>
        )
        : (
          <div style={{ padding: "0 8vw", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 3 }}>
            {visible.map((photo, i) => {
              const src = `/photos/${photo.filename}`;
              return (
                <div key={photo.filename} className="photo-tile"
                  style={{ aspectRatio: "4/3", position: "relative", overflow: "hidden", background: palettes[i % palettes.length], cursor: "none" }}
                  onMouseEnter={big} onMouseLeave={small}
                  onClick={() => setLightbox(photo)}>
                  <img
                    src={src}
                    alt={photo.displayName || photo.filename}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .7s cubic-bezier(.4,0,.2,1)" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="photo-tile-caption">
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "var(--bone)", lineHeight: 1.1 }}>
                      {photo.displayName || photo.filename}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".42rem", letterSpacing: ".18em", color: "rgba(240,235,225,.5)", marginTop: 4, textTransform: "uppercase" }}>
                      {[photo.year, photo.category].filter(Boolean).join(" · ")}
                    </div>
                    {photo.caption && (
                      <div style={{ fontFamily: "var(--body)", fontSize: ".78rem", color: "rgba(240,235,225,.6)", marginTop: 4, fontStyle: "italic" }}>
                        {photo.caption}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(24,23,20,.92)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "none" }}>
          <img
            src={`/photos/${lightbox.filename}`}
            alt={lightbox.displayName}
            style={{ maxWidth: "88vw", maxHeight: "88vh", objectFit: "contain", display: "block" }}
          />
          <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontStyle: "italic", color: "var(--bone)" }}>
              {lightbox.displayName || lightbox.filename}
            </div>
            {(lightbox.year || lightbox.category) && (
              <div style={{ fontFamily: "var(--mono)", fontSize: ".44rem", letterSpacing: ".22em", color: "rgba(240,235,225,.4)", marginTop: 6, textTransform: "uppercase" }}>
                {[lightbox.year, lightbox.category].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          <button onMouseEnter={big} onMouseLeave={small} onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 32, right: 40, background: "none", border: "none", fontFamily: "var(--mono)", fontSize: ".52rem", letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(240,235,225,.4)", cursor: "none", transition: "color .3s" }}>
            × Close
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function Portfolio() {
  const config = useConfig();
  const { dot, ring } = useMousePos();
  const [curBig,  setCurBig]  = useState(false);
  const [curProj, setCurProj] = useState(false);
  const [modal,   setModal]   = useState(null);
  const [page,    setPage]    = useState("main"); // "main" | "photos"
  useScrollReveal();

  const big     = useCallback(() => setCurBig(true), []);
  const small   = useCallback(() => setCurBig(false), []);
  const projIn  = useCallback(() => { setCurProj(true);  setCurBig(false); }, []);
  const projOut = useCallback(() => { setCurProj(false); }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const goPhotos = useCallback(e => {
    e.preventDefault();
    setPage(p => p === "photos" ? "main" : "photos");
    window.scrollTo(0, 0);
  }, []);

  const goHome = useCallback(() => {
    setPage("main");
    window.scrollTo(0, 0);
  }, []);

  // Loading screen while config fetches
  if (!config) {
    return (
      <>
        <style>{css}</style>
        <div className="loading-screen"><span>Loading…</span></div>
      </>
    );
  }

  const { site, photos = [], projects = [], cv = {} } = config;
  const sortedProjects = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const modalIndex     = modal ? sortedProjects.findIndex(p => p.id === modal.id) : -1;

  return (
    <>
      <style>{css}</style>

      {/* ── CURSORS ── */}
      <div className={`cur ${curBig ? "big" : ""} ${curProj ? "proj" : ""}`}
        style={{ left: dot.x, top: dot.y }} />
      <div className="cur-ring" style={{ left: ring.x, top: ring.y }} />

      {/* ── NAV ── */}
      <nav>
        <div className="nav-logo" style={{ cursor: "none" }}
          onClick={goHome} onMouseEnter={big} onMouseLeave={small}>
          {site.name}
        </div>
        <ul className="nav-links">
          {page === "main" && [["Work","projects"],["CV","cv"],["About","about"],["Contact","contact"]].map(([label, id]) => (
            <li key={id}>
              <a href={`#${id}`} onMouseEnter={big} onMouseLeave={small}
                onClick={e => { e.preventDefault(); scrollTo(id); }}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#photos" onMouseEnter={big} onMouseLeave={small}
              style={page === "photos" ? { color: "var(--dark)" } : {}}
              onClick={goPhotos}>
              {page === "photos" ? "← Back" : "Photos"}
            </a>
          </li>
        </ul>
      </nav>

      {/* ── PHOTOS PAGE ── */}
      {page === "photos" && (
        <PhotoPage photos={photos} big={big} small={small} />
      )}

      {/* ── MAIN SITE ── */}
      {page === "main" && (
        <>
          {/* LANDING */}
          <section className="landing" id="home">
            <GridBg />
            <div className="hero-obj">
              <svg className="hero-svg" viewBox="0 0 200 200" fill="none">
                <rect className="draw-1" x="20" y="20" width="160" height="160" stroke="#1C1C1A" strokeWidth="1"/>
                <rect className="draw-2" x="58" y="58" width="84" height="84" stroke="#C4A87A" strokeWidth=".7" transform="rotate(45 100 100)"/>
                <line className="draw-3" x1="100" y1="20" x2="100" y2="180" stroke="#9B9188" strokeWidth=".5"/>
                <line className="draw-3" x1="20" y1="100" x2="180" y2="100" stroke="#9B9188" strokeWidth=".5"/>
                <circle className="draw-4" cx="100" cy="100" r="35" stroke="#1C1C1A" strokeWidth="1.2"/>
                <circle className="draw-5" cx="100" cy="100" r="4" stroke="#C4A87A" strokeWidth="1.5"/>
                <polyline className="draw-3" points="20,20 30,20 30,30" stroke="#C4A87A" strokeWidth="1" fill="none"/>
                <polyline className="draw-3" points="180,20 170,20 170,30" stroke="#C4A87A" strokeWidth="1" fill="none"/>
                <polyline className="draw-3" points="20,180 30,180 30,170" stroke="#C4A87A" strokeWidth="1" fill="none"/>
                <polyline className="draw-3" points="180,180 170,180 170,170" stroke="#C4A87A" strokeWidth="1" fill="none"/>
              </svg>
            </div>
            <MagneticText className="hero-name">{site.name}</MagneticText>
            <p className="hero-sub">{site.tagline} — {site.school}</p>
            <button className="enter-cta" onMouseEnter={big} onMouseLeave={small}
              onClick={() => scrollTo("about")}>
              <span className="cta-line" />Enter
            </button>
            <div className="scroll-prompt">
              <span>Scroll</span>
              <div className="scroll-bar" />
            </div>
          </section>

          {/* MANIFESTO */}
          <section className="manifesto" id="about">
            <div className="mani-corner" style={{ top: 48, left: 48 }} />
            <div className="mani-corner tr" />
            <div className="mani-corner bl" />
            <div className="manifesto-label">00 — Manifesto</div>
            <ManifestoBody text={site.manifesto} accents={site.manifestoAccents} />
          </section>

          {/* PROJECTS */}
          <section className="work" id="projects">
            <div className="work-header reveal">
              <div className="work-label">01 — Selected Work</div>
              <span className="work-hint">drag to explore</span>
            </div>
            {sortedProjects.length === 0
              ? (
                <div className="proj-empty">
                  No projects yet — add them in the admin panel.
                </div>
              )
              : (
                <div className="proj-track">
                  {sortedProjects.map((p, i) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      index={i}
                      total={sortedProjects.length}
                      onOpen={setModal}
                      projIn={projIn}
                      projOut={projOut}
                    />
                  ))}
                </div>
              )
            }
          </section>

          {/* CV */}
          <section className="cv-section" id="cv">
            <div className="cv-label reveal">02 — Curriculum Vitæ</div>
            <SVGRuler />
            <div className="cv-blocks reveal">
              {/* Education */}
              <div className="cv-blk">
                <div className="cv-blk-label">01 Education</div>
                {(cv.education || []).map((e, i) => (
                  <div className="cv-entry" key={i}>
                    <div className="cv-yr">{e.year}</div>
                    <div className="cv-tt">{e.title}</div>
                    <div className="cv-sb">{e.institution}</div>
                  </div>
                ))}
              </div>
              {/* Exhibitions */}
              <div className="cv-blk">
                <div className="cv-blk-label">02 Exhibitions</div>
                {(cv.exhibitions || []).map((e, i) => (
                  <div className="cv-entry" key={i}>
                    <div className="cv-yr">{e.year}</div>
                    <div className="cv-tt">{e.title}</div>
                    <div className="cv-sb">{e.institution}</div>
                  </div>
                ))}
              </div>
              {/* Experience */}
              <div className="cv-blk">
                <div className="cv-blk-label">03 Experience</div>
                {(cv.experience || []).map((e, i) => (
                  <div className="cv-entry" key={i}>
                    <div className="cv-yr">{e.year}</div>
                    <div className="cv-tt">{e.title}</div>
                    <div className="cv-sb">{e.institution}</div>
                  </div>
                ))}
              </div>
              {/* Tools */}
              <div className="cv-blk">
                <div className="cv-blk-label">04 Tools</div>
                <div className="tools-wrap">
                  {(cv.tools || []).map(t => (
                    <span key={t} className="tool" onMouseEnter={big} onMouseLeave={small}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section className="contact" id="contact">
            <div className="contact-label">03 — Contact</div>
            <div>
              <h2 className="contact-big reveal">
                Let's build<br /><em>something</em><br />together.
              </h2>
              <a className="contact-email" href={`mailto:${site.email}`}
                onMouseEnter={big} onMouseLeave={small}>
                {site.email}
              </a>
            </div>
            <div className="contact-foot">
              <p>
                {site.school}<br />
                {site.tagline}<br />
                Copenhagen, Denmark · © {new Date().getFullYear()}
              </p>
              {site.cvFile && (
                <a className="dl-cv" href={site.cvFile} target="_blank" rel="noreferrer"
                  onMouseEnter={big} onMouseLeave={small}>
                  Download CV
                </a>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── PROJECT MODAL ── */}
      <ProjectModal
        project={modal}
        index={modalIndex}
        total={sortedProjects.length}
        onClose={() => setModal(null)}
        big={big}
        small={small}
      />
    </>
  );
}