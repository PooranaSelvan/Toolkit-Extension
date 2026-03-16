import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Copy, Check, Trash2, Download, Upload,
  Maximize2, RotateCcw, Eye, EyeOff,
  Smartphone, Monitor, Tablet, Sparkles,
  Palette, Braces, Code,
  Zap, ExternalLink, X, Columns, Rows,
  ChevronDown, AlertTriangle, Info, FileCode,
  Terminal, Eraser, SquareCode, WrapText, AlignLeft,
  Keyboard, Search, Replace, Undo2, Redo2,
  ZoomIn, ZoomOut, Sun, Moon, Library,
  Gauge, Save, BookOpen,
  Image, Share2, Camera,
  Type, Settings2, LayoutGrid, PanelTop,
} from 'lucide-react';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useLocalStorage from '../../hooks/useLocalStorage';
import CodeMirrorEditor from './CodeMirrorEditor';
import './FrontendPlayground.css';



/* ═══════════════════════════════════════════════════════════
   CDN LIBRARIES
   ═══════════════════════════════════════════════════════════ */
const CDN_LIBRARIES = [
  { name: 'Tailwind CSS', type: 'js', url: 'https://cdn.tailwindcss.com', icon: '🌊' },
  { name: 'Bootstrap 5', type: 'css', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', icon: '🅱️' },
  { name: 'Animate.css', type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css', icon: '🎬' },
  { name: 'Font Awesome', type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', icon: '🎨' },
  { name: 'Normalize.css', type: 'css', url: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css', icon: '📐' },
  { name: 'GSAP', type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', icon: '🚀' },
  { name: 'Lodash', type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js', icon: '🔧' },
  { name: 'Axios', type: 'js', url: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js', icon: '📡' },
  { name: 'Chart.js', type: 'js', url: 'https://cdn.jsdelivr.net/npm/chart.js', icon: '📊' },
  { name: 'Three.js', type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', icon: '🧊' },
  { name: 'Anime.js', type: 'js', url: 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js', icon: '✨' },
  { name: 'Alpine.js', type: 'js', url: 'https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js', icon: '⛰️' },
];

/* ═══════════════════════════════════════════════════════════
   SNIPPET LIBRARY
   ═══════════════════════════════════════════════════════════ */
const SNIPPET_LIBRARY = {
  html: [
    { name: 'Nav Bar', emoji: '🧭', code: '<nav class="navbar">\n  <div class="logo">Logo</div>\n  <ul class="nav-links">\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>' },
    { name: 'Card Grid', emoji: '🃏', code: '<div class="grid">\n  <div class="card">\n    <img src="https://picsum.photos/300/200" alt="Card">\n    <div class="card-body">\n      <h3>Card Title</h3>\n      <p>Card description goes here.</p>\n      <button>Learn More</button>\n    </div>\n  </div>\n</div>' },
    { name: 'Hero Section', emoji: '🦸', code: '<section class="hero">\n  <div class="hero-content">\n    <h1>Welcome to My Site</h1>\n    <p>A beautiful hero section with a call to action.</p>\n    <button class="btn-primary">Get Started</button>\n  </div>\n</section>' },
    { name: 'Modal Dialog', emoji: '💬', code: '<div class="modal-overlay" id="modal">\n  <div class="modal">\n    <div class="modal-header">\n      <h3>Modal Title</h3>\n      <button class="modal-close">&times;</button>\n    </div>\n    <div class="modal-body">\n      <p>Modal content goes here.</p>\n    </div>\n  </div>\n</div>' },
  ],
  css: [
    { name: 'Flex Center', emoji: '🎯', code: 'display: flex;\nalign-items: center;\njustify-content: center;\nmin-height: 100vh;' },
    { name: 'CSS Grid', emoji: '📐', code: 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\ngap: 1.5rem;\npadding: 2rem;' },
    { name: 'Glass Card', emoji: '🔮', code: 'background: rgba(255, 255, 255, 0.05);\nbackdrop-filter: blur(20px);\nborder: 1px solid rgba(255, 255, 255, 0.1);\nborder-radius: 1rem;\npadding: 2rem;\nbox-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);' },
    { name: 'Gradient Text', emoji: '🌈', code: 'background: linear-gradient(135deg, #667eea, #764ba2);\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;\nbackground-clip: text;' },
    { name: 'Smooth Shadow', emoji: '🌑', code: 'box-shadow:\n  0 1px 1px rgba(0,0,0,0.04),\n  0 2px 2px rgba(0,0,0,0.04),\n  0 4px 4px rgba(0,0,0,0.04),\n  0 8px 8px rgba(0,0,0,0.04),\n  0 16px 16px rgba(0,0,0,0.04);' },
    { name: 'Keyframe Spin', emoji: '🔄', code: '@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n.spinner { animation: spin 1s linear infinite; }' },
    { name: 'Media Queries', emoji: '📱', code: '@media (min-width: 640px) { /* sm */ }\n@media (min-width: 768px) { /* md */ }\n@media (min-width: 1024px) { /* lg */ }\n@media (min-width: 1280px) { /* xl */ }' },
  ],
  js: [
    { name: 'DOM Ready', emoji: '📋', code: "document.addEventListener('DOMContentLoaded', () => {\n  console.log('DOM loaded');\n});" },
    { name: 'Fetch API', emoji: '📡', code: "async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const data = await res.json();\n    console.log(data);\n    return data;\n  } catch (err) {\n    console.error('Fetch error:', err);\n  }\n}" },
    { name: 'Debounce', emoji: '⏱️', code: "function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}" },
    { name: 'Observer', emoji: '👁️', code: "const observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      entry.target.classList.add('visible');\n    }\n  });\n}, { threshold: 0.1 });\n\ndocument.querySelectorAll('.animate').forEach(el => observer.observe(el));" },
    { name: 'Local Storage', emoji: '💾', code: "function save(key, data) {\n  localStorage.setItem(key, JSON.stringify(data));\n}\nfunction load(key, fallback = null) {\n  const d = localStorage.getItem(key);\n  return d ? JSON.parse(d) : fallback;\n}" },
    { name: 'Dark Mode', emoji: '🌓', code: "function setTheme(dark) {\n  document.documentElement.classList.toggle('dark', dark);\n  localStorage.setItem('theme', dark ? 'dark' : 'light');\n}\nconst saved = localStorage.getItem('theme');\nsetTheme(saved ? saved === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches);" },
  ],
};

/* ═══════════════════════════════════════════════════════════
   LAYOUT TEMPLATES (pre-built starter layouts)
   ═══════════════════════════════════════════════════════════ */
const LAYOUT_TEMPLATES = [
  { name: 'Holy Grail', emoji: '🏛️',
    html: '<div class="holy-grail">\n  <header class="hg-header">Header</header>\n  <div class="hg-body">\n    <aside class="hg-sidebar-left">Sidebar</aside>\n    <main class="hg-main">Main Content</main>\n    <aside class="hg-sidebar-right">Aside</aside>\n  </div>\n  <footer class="hg-footer">Footer</footer>\n</div>',
    css: "body{margin:0;font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}.holy-grail{display:flex;flex-direction:column;min-height:100vh}.hg-header{padding:1rem 2rem;background:rgba(45,121,255,.15);border-bottom:1px solid rgba(45,121,255,.2);font-weight:700;font-size:1.1rem;color:#60a5fa}.hg-body{display:flex;flex:1;gap:0}.hg-sidebar-left,.hg-sidebar-right{width:220px;padding:1.5rem;background:rgba(255,255,255,.02);border-right:1px solid rgba(255,255,255,.06);font-size:.85rem;color:rgba(255,255,255,.5)}.hg-sidebar-right{border-right:none;border-left:1px solid rgba(255,255,255,.06)}.hg-main{flex:1;padding:2rem;font-size:.9rem;line-height:1.7;color:rgba(255,255,255,.6)}.hg-footer{padding:1rem 2rem;text-align:center;font-size:.75rem;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);color:rgba(255,255,255,.3)}@media(max-width:768px){.hg-body{flex-direction:column}.hg-sidebar-left,.hg-sidebar-right{width:100%}}",
    js: "" },
  { name: 'Sidebar Layout', emoji: '📑',
    html: '<div class="sidebar-layout">\n  <nav class="sidebar">\n    <div class="sidebar-logo">⚡ App</div>\n    <a class="sidebar-link active" href="#">🏠 Dashboard</a>\n    <a class="sidebar-link" href="#">📊 Analytics</a>\n    <a class="sidebar-link" href="#">👥 Users</a>\n    <a class="sidebar-link" href="#">⚙️ Settings</a>\n  </nav>\n  <main class="main-content">\n    <h1>Dashboard</h1>\n    <p>Your main content goes here.</p>\n  </main>\n</div>',
    css: "body{margin:0;font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0}.sidebar-layout{display:flex;min-height:100vh}.sidebar{width:240px;background:rgba(255,255,255,.03);border-right:1px solid rgba(255,255,255,.06);padding:1.5rem 1rem;display:flex;flex-direction:column;gap:.25rem;flex-shrink:0}.sidebar-logo{font-size:1.25rem;font-weight:800;padding:.5rem .75rem;margin-bottom:1rem;color:#fff}.sidebar-link{display:block;padding:.65rem .75rem;border-radius:.5rem;font-size:.85rem;color:rgba(255,255,255,.5);text-decoration:none;transition:all .2s}.sidebar-link:hover{background:rgba(255,255,255,.05);color:#fff}.sidebar-link.active{background:rgba(45,121,255,.12);color:#60a5fa;font-weight:600}.main-content{flex:1;padding:2rem}h1{font-size:1.5rem;margin:0 0 .5rem}p{color:rgba(255,255,255,.5);font-size:.9rem}",
    js: "document.querySelectorAll('.sidebar-link').forEach(link=>{\n  link.addEventListener('click', e=>{\n    e.preventDefault();\n    document.querySelectorAll('.sidebar-link').forEach(l=>l.classList.remove('active'));\n    link.classList.add('active');\n  });\n});" },
  { name: 'Card Grid Dashboard', emoji: '📊',
    html: '<div class="dashboard-grid">\n  <div class="card stat-card">\n    <div class="stat-emoji">👥</div>\n    <div class="stat-value">12,847</div>\n    <div class="stat-label">Total Users</div>\n  </div>\n  <div class="card stat-card">\n    <div class="stat-emoji">💰</div>\n    <div class="stat-value">$48,293</div>\n    <div class="stat-label">Revenue</div>\n  </div>\n  <div class="card stat-card">\n    <div class="stat-emoji">📦</div>\n    <div class="stat-value">3,842</div>\n    <div class="stat-label">Orders</div>\n  </div>\n  <div class="card stat-card">\n    <div class="stat-emoji">📈</div>\n    <div class="stat-value">+24.5%</div>\n    <div class="stat-label">Growth</div>\n  </div>\n  <div class="card wide-card">\n    <h3>Recent Activity</h3>\n    <div class="activity-list">\n      <div class="activity-item">✅ New user signed up</div>\n      <div class="activity-item">💳 Payment processed — $249</div>\n      <div class="activity-item">📤 Report exported</div>\n    </div>\n  </div>\n  <div class="card">\n    <h3>Quick Actions</h3>\n    <button class="action-btn">+ Add User</button>\n    <button class="action-btn secondary">Generate Report</button>\n  </div>\n</div>',
    css: "body{margin:0;padding:2rem;font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0}.dashboard-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;max-width:900px;margin:0 auto}.card{padding:1.5rem;border-radius:1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);transition:transform .2s}.card:hover{transform:translateY(-2px)}.wide-card{grid-column:1/-1}.stat-card{text-align:center}.stat-emoji{font-size:1.75rem;margin-bottom:.5rem}.stat-value{font-size:1.5rem;font-weight:800;color:#fff}.stat-label{font-size:.75rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.05em;margin-top:.25rem}h3{margin:0 0 1rem;font-size:.9rem;color:rgba(255,255,255,.7)}.activity-list{display:flex;flex-direction:column;gap:.5rem}.activity-item{padding:.5rem .75rem;border-radius:.5rem;font-size:.8rem;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)}.action-btn{width:100%;padding:.6rem;border:none;border-radius:.5rem;margin-bottom:.5rem;font-size:.8rem;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;transition:all .2s}.action-btn:hover{transform:scale(1.02);box-shadow:0 4px 16px rgba(45,121,255,.3)}.action-btn.secondary{background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.08)}.action-btn.secondary:hover{background:rgba(255,255,255,.08);color:#fff}",
    js: "" },
  { name: 'Landing Page', emoji: '🚀',
    html: '<header class="landing-header">\n  <nav class="landing-nav">\n    <div class="nav-logo">🚀 Brand</div>\n    <div class="nav-links">\n      <a href="#">Features</a>\n      <a href="#">Pricing</a>\n      <a href="#">About</a>\n      <button class="cta-btn-sm">Get Started</button>\n    </div>\n  </nav>\n</header>\n<section class="hero-section">\n  <h1 class="hero-title">Build something <span class="gradient-text">amazing</span></h1>\n  <p class="hero-desc">The fastest way to ship beautiful products. Start building today.</p>\n  <div class="hero-actions">\n    <button class="cta-btn">Get Started Free</button>\n    <button class="cta-btn outline">Live Demo ▸</button>\n  </div>\n</section>\n<section class="features-section">\n  <div class="feature-card">\n    <div class="feature-icon">⚡</div>\n    <h3>Lightning Fast</h3>\n    <p>Sub-second load times with edge computing.</p>\n  </div>\n  <div class="feature-card">\n    <div class="feature-icon">🔒</div>\n    <h3>Secure by Default</h3>\n    <p>Enterprise-grade security built-in.</p>\n  </div>\n  <div class="feature-card">\n    <div class="feature-icon">🎨</div>\n    <h3>Beautiful UI</h3>\n    <p>Stunning components ready to use.</p>\n  </div>\n</section>',
    css: "body{margin:0;font-family:'Segoe UI',sans-serif;background:#0a0a1a;color:#e2e8f0}.landing-header{position:sticky;top:0;backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06);z-index:10}.landing-nav{display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto;padding:.75rem 2rem}.nav-logo{font-size:1.1rem;font-weight:800;color:#fff}.nav-links{display:flex;align-items:center;gap:1.5rem}.nav-links a{color:rgba(255,255,255,.5);text-decoration:none;font-size:.85rem;transition:color .2s}.nav-links a:hover{color:#fff}.cta-btn-sm{padding:.4rem 1rem;border:none;border-radius:.5rem;background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;font-size:.8rem;font-weight:600;cursor:pointer}.hero-section{text-align:center;padding:6rem 2rem 4rem;max-width:700px;margin:0 auto}.hero-title{font-size:3rem;font-weight:900;line-height:1.1;margin:0 0 1rem;color:#fff}.gradient-text{background:linear-gradient(135deg,#2D79FF,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.hero-desc{font-size:1.1rem;color:rgba(255,255,255,.5);margin:0 0 2rem;line-height:1.6}.hero-actions{display:flex;gap:.75rem;justify-content:center}.cta-btn{padding:.75rem 2rem;border:none;border-radius:.75rem;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .2s;background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;box-shadow:0 4px 20px rgba(45,121,255,.25)}.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(45,121,255,.35)}.cta-btn.outline{background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);box-shadow:none}.cta-btn.outline:hover{border-color:rgba(255,255,255,.3);color:#fff}.features-section{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;max-width:900px;margin:0 auto;padding:2rem}.feature-card{padding:2rem;border-radius:1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);text-align:center;transition:transform .2s}.feature-card:hover{transform:translateY(-4px)}.feature-icon{font-size:2rem;margin-bottom:.75rem}h3{font-size:1rem;margin:0 0 .5rem;color:#fff}.feature-card p{font-size:.8rem;color:rgba(255,255,255,.45);margin:0;line-height:1.5}",
    js: "" },
  { name: 'Masonry Gallery', emoji: '🖼️',
    html: '<h2 class="gallery-title">Photo Gallery</h2>\n<div class="masonry">\n  <div class="masonry-item tall"><img src="https://picsum.photos/400/600?random=1" alt="" /></div>\n  <div class="masonry-item"><img src="https://picsum.photos/400/300?random=2" alt="" /></div>\n  <div class="masonry-item"><img src="https://picsum.photos/400/350?random=3" alt="" /></div>\n  <div class="masonry-item tall"><img src="https://picsum.photos/400/500?random=4" alt="" /></div>\n  <div class="masonry-item"><img src="https://picsum.photos/400/300?random=5" alt="" /></div>\n  <div class="masonry-item"><img src="https://picsum.photos/400/400?random=6" alt="" /></div>\n  <div class="masonry-item tall"><img src="https://picsum.photos/400/550?random=7" alt="" /></div>\n  <div class="masonry-item"><img src="https://picsum.photos/400/350?random=8" alt="" /></div>\n</div>',
    css: "body{margin:0;padding:2rem;font-family:'Segoe UI',sans-serif;background:#0a0a1a;color:#e2e8f0}.gallery-title{text-align:center;font-size:1.5rem;margin:0 0 2rem;color:#fff}.masonry{columns:3;column-gap:1rem;max-width:900px;margin:0 auto}.masonry-item{break-inside:avoid;margin-bottom:1rem;border-radius:.75rem;overflow:hidden;position:relative;cursor:pointer;transition:transform .3s}.masonry-item:hover{transform:scale(1.02)}.masonry-item img{width:100%;display:block;transition:filter .3s}.masonry-item:hover img{filter:brightness(1.1)}@media(max-width:768px){.masonry{columns:2}}@media(max-width:480px){.masonry{columns:1}}",
    js: "document.querySelectorAll('.masonry-item').forEach(item=>{\n  item.addEventListener('click',()=>{\n    item.style.transform='scale(0.95)';\n    setTimeout(()=>item.style.transform='',300);\n  });\n});" },
  { name: 'Pricing Table', emoji: '💎',
    html: '<div class="pricing-container">\n  <h2>Choose Your Plan</h2>\n  <div class="pricing-grid">\n    <div class="pricing-card">\n      <div class="plan-name">Starter</div>\n      <div class="plan-price">$9<span>/mo</span></div>\n      <ul class="plan-features">\n        <li>✓ 5 Projects</li>\n        <li>✓ 10GB Storage</li>\n        <li>✓ Email Support</li>\n        <li class="disabled">✗ Analytics</li>\n      </ul>\n      <button class="plan-btn">Get Started</button>\n    </div>\n    <div class="pricing-card featured">\n      <div class="plan-badge">Popular</div>\n      <div class="plan-name">Pro</div>\n      <div class="plan-price">$29<span>/mo</span></div>\n      <ul class="plan-features">\n        <li>✓ Unlimited Projects</li>\n        <li>✓ 100GB Storage</li>\n        <li>✓ Priority Support</li>\n        <li>✓ Advanced Analytics</li>\n      </ul>\n      <button class="plan-btn featured">Get Started</button>\n    </div>\n    <div class="pricing-card">\n      <div class="plan-name">Enterprise</div>\n      <div class="plan-price">$99<span>/mo</span></div>\n      <ul class="plan-features">\n        <li>✓ Everything in Pro</li>\n        <li>✓ 1TB Storage</li>\n        <li>✓ 24/7 Phone Support</li>\n        <li>✓ Custom Integrations</li>\n      </ul>\n      <button class="plan-btn">Contact Sales</button>\n    </div>\n  </div>\n</div>',
    css: "body{margin:0;padding:3rem 1.5rem;font-family:'Segoe UI',sans-serif;background:#0a0a1a;color:#e2e8f0}.pricing-container{max-width:900px;margin:0 auto;text-align:center}h2{font-size:1.75rem;margin:0 0 2.5rem;color:#fff}.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;align-items:start}.pricing-card{padding:2rem;border-radius:1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);position:relative;transition:transform .3s}.pricing-card:hover{transform:translateY(-4px)}.pricing-card.featured{background:rgba(45,121,255,.06);border-color:rgba(45,121,255,.2);box-shadow:0 8px 32px rgba(45,121,255,.1)}.plan-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);padding:.25rem 1rem;border-radius:9999px;font-size:.65rem;font-weight:700;background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;text-transform:uppercase;letter-spacing:.05em}.plan-name{font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.5);margin-bottom:.5rem}.plan-price{font-size:2.5rem;font-weight:900;color:#fff;margin-bottom:1.5rem}.plan-price span{font-size:.9rem;font-weight:400;color:rgba(255,255,255,.35)}.plan-features{list-style:none;padding:0;margin:0 0 1.5rem;text-align:left}.plan-features li{padding:.5rem 0;font-size:.8rem;color:rgba(255,255,255,.6);border-bottom:1px solid rgba(255,255,255,.04)}.plan-features li.disabled{color:rgba(255,255,255,.2)}.plan-btn{width:100%;padding:.7rem;border:1px solid rgba(255,255,255,.1);border-radius:.6rem;background:transparent;color:rgba(255,255,255,.6);font-weight:600;font-size:.85rem;cursor:pointer;transition:all .2s}.plan-btn:hover{background:rgba(255,255,255,.05);color:#fff}.plan-btn.featured{background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;border:none;box-shadow:0 4px 16px rgba(45,121,255,.25)}.plan-btn.featured:hover{box-shadow:0 8px 24px rgba(45,121,255,.35)}",
    js: "document.querySelectorAll('.plan-btn').forEach(btn=>{\n  btn.addEventListener('click',function(){\n    this.textContent='✓ Selected!';\n    this.style.background='linear-gradient(135deg,#22c55e,#16a34a)';\n    setTimeout(()=>{this.textContent=this.classList.contains('featured')?'Get Started':'Contact Sales';this.style.background='';},1500);\n  });\n});" },
];

/* ═══════════════════════════════════════════════════════════
   ASSETS PANEL — Quick image/font/icon insertion
   ═══════════════════════════════════════════════════════════ */
const ASSET_CATEGORIES = {
  images: [
    { name: '300×200', code: '<img src="https://picsum.photos/300/200" alt="Placeholder" />', emoji: '🖼️' },
    { name: '400×300', code: '<img src="https://picsum.photos/400/300" alt="Placeholder" />', emoji: '📷' },
    { name: '800×400 Banner', code: '<img src="https://picsum.photos/800/400" alt="Banner" />', emoji: '🏞️' },
    { name: '150×150 Avatar', code: '<img src="https://picsum.photos/150/150" alt="Avatar" style="border-radius:50%;" />', emoji: '👤' },
    { name: 'SVG Pattern', code: '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">\n      <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.15)" />\n    </pattern>\n  </defs>\n  <rect width="100%" height="100%" fill="url(#dots)" />\n</svg>', emoji: '🔵' },
  ],
  fonts: [
    { name: 'Inter', code: '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");\nbody { font-family: "Inter", sans-serif; }', emoji: '🔤', type: 'css' },
    { name: 'Poppins', code: '@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap");\nbody { font-family: "Poppins", sans-serif; }', emoji: '🔡', type: 'css' },
    { name: 'JetBrains Mono', code: '@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap");\ncode, pre { font-family: "JetBrains Mono", monospace; }', emoji: '💻', type: 'css' },
    { name: 'Playfair Display', code: '@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap");\nh1, h2, h3 { font-family: "Playfair Display", serif; }', emoji: '✍️', type: 'css' },
    { name: 'Space Grotesk', code: '@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap");\nbody { font-family: "Space Grotesk", sans-serif; }', emoji: '🚀', type: 'css' },
  ],
  colors: [
    { name: 'Blue Gradient', code: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);', emoji: '🔵', type: 'css' },
    { name: 'Sunset Gradient', code: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);', emoji: '🌅', type: 'css' },
    { name: 'Ocean Gradient', code: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);', emoji: '🌊', type: 'css' },
    { name: 'Emerald Gradient', code: 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);', emoji: '💚', type: 'css' },
    { name: 'Dark Theme BG', code: 'background: #0f172a;\ncolor: #e2e8f0;', emoji: '🌙', type: 'css' },
    { name: 'Glassmorphism BG', code: 'background: rgba(255, 255, 255, 0.05);\nbackdrop-filter: blur(20px);\nborder: 1px solid rgba(255, 255, 255, 0.1);', emoji: '🔮', type: 'css' },
  ],
};

/* ═══════════════════════════════════════════════════════════
   EMMET-LIKE ABBREVIATION EXPANSIONS
   ═══════════════════════════════════════════════════════════ */
function expandEmmetAbbreviation(abbr) {
  if (!abbr || !abbr.trim()) return null;
  const s = abbr.trim();

  // Tag with id: div#main → <div id="main"></div>
  const idMatch = s.match(/^(\w+)#([\w-]+)$/);
  if (idMatch) return `<${idMatch[1]} id="${idMatch[2]}">\n  \n</${idMatch[1]}>`;

  // Tag with class: div.container → <div class="container"></div>
  const classMatch = s.match(/^(\w+)\.([\w.-]+)$/);
  if (classMatch) {
    const classes = classMatch[2].replace(/\./g, ' ');
    return `<${classMatch[1]} class="${classes}">\n  \n</${classMatch[1]}>`;
  }

  // Multiplication: li*5 → 5 <li></li>
  const mulMatch = s.match(/^(\w+)\*(\d+)$/);
  if (mulMatch) {
    const tag = mulMatch[1];
    const count = Math.min(parseInt(mulMatch[2], 10), 20);
    return Array.from({ length: count }, (_, i) => `<${tag}>Item ${i + 1}</${tag}>`).join('\n');
  }

  // Child combinator: ul>li*3 → <ul><li></li>×3</ul>
  const childMulMatch = s.match(/^(\w+)>(\w+)\*(\d+)$/);
  if (childMulMatch) {
    const parent = childMulMatch[1];
    const child = childMulMatch[2];
    const count = Math.min(parseInt(childMulMatch[3], 10), 20);
    const children = Array.from({ length: count }, (_, i) => `  <${child}>Item ${i + 1}</${child}>`).join('\n');
    return `<${parent}>\n${children}\n</${parent}>`;
  }

  // Simple child combinator: div>p → <div><p></p></div>
  const childMatch = s.match(/^(\w+)>(\w+)$/);
  if (childMatch) return `<${childMatch[1]}>\n  <${childMatch[2]}></${childMatch[2]}>\n</${childMatch[1]}>`;

  // Sibling combinator: h1+p+p → <h1></h1>\n<p></p>\n<p></p>
  if (s.includes('+') && /^[\w+]+$/.test(s)) {
    return s.split('+').map(tag => `<${tag}></${tag}>`).join('\n');
  }

  // Tag with class and multiplication: div.card*3
  const classMulMatch = s.match(/^(\w+)\.([\w.-]+)\*(\d+)$/);
  if (classMulMatch) {
    const tag = classMulMatch[1];
    const classes = classMulMatch[2].replace(/\./g, ' ');
    const count = Math.min(parseInt(classMulMatch[3], 10), 20);
    return Array.from({ length: count }, () => `<${tag} class="${classes}"></${tag}>`).join('\n');
  }

  // Common abbreviations
  const COMMON = {
    '!': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>',
    'lorem': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'lorem:short': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'link:css': '<link rel="stylesheet" href="style.css" />',
    'script:js': '<script src="script.js"></script>',
    'viewport': '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    'img:placeholder': '<img src="https://picsum.photos/400/300" alt="Placeholder" />',
    'btn': '<button type="button">Click me</button>',
    'input:text': '<input type="text" name="" placeholder="" />',
    'input:email': '<input type="email" name="email" placeholder="Email" />',
    'input:password': '<input type="password" name="password" placeholder="Password" />',
  };
  if (COMMON[s]) return COMMON[s];

  return null;
}

/* ═══════════════════════════════════════════════════════════
   HEAD CONFIGURATION DEFAULTS
   ═══════════════════════════════════════════════════════════ */
const GOOGLE_FONTS_LIST = [
  'Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Lato',
  'Oswald', 'Raleway', 'Nunito', 'Playfair Display', 'JetBrains Mono',
  'Space Grotesk', 'DM Sans', 'Outfit', 'Plus Jakarta Sans',
];

/* ═══════════════════════════════════════════════════════════
   SAMPLES
   ═══════════════════════════════════════════════════════════ */
const SAMPLES = [
  { name: 'Animated Card', emoji: '✨',
    html: '<div class="card">\n  <div class="card-glow"></div>\n  <h2>✨ Hover Me</h2>\n  <p>A beautiful glassmorphic card with smooth hover animations.</p>\n  <button class="btn">Explore</button>\n</div>',
    css: "body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);font-family:'Segoe UI',sans-serif}.card{position:relative;padding:2.5rem;border-radius:1.25rem;background:rgba(255,255,255,.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);color:#fff;text-align:center;max-width:320px;transition:transform .4s,box-shadow .4s;overflow:hidden}.card:hover{transform:translateY(-8px);box-shadow:0 20px 60px rgba(45,121,255,.3)}.card-glow{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(45,121,255,.15),transparent 60%);opacity:0;transition:opacity .4s;pointer-events:none}.card:hover .card-glow{opacity:1}h2{font-size:1.5rem;margin:0 0 .75rem}p{font-size:.9rem;opacity:.7;line-height:1.6;margin:0 0 1.5rem}.btn{padding:.6rem 1.8rem;border:none;border-radius:.75rem;background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .3s}.btn:hover{transform:scale(1.05);box-shadow:0 8px 24px rgba(45,121,255,.4)}",
    js: "const card=document.querySelector('.card');card.addEventListener('mousemove',(e)=>{const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;card.style.transform=`perspective(1000px) rotateX(${(y-r.height/2)/15}deg) rotateY(${(r.width/2-x)/15}deg) translateY(-8px)`});card.addEventListener('mouseleave',()=>{card.style.transform=''});" },
  { name: 'Flex Layout', emoji: '📐',
    html: '<div class="container">\n  <div class="box box-1">1</div>\n  <div class="box box-2">2</div>\n  <div class="box box-3">3</div>\n  <div class="box box-4">4</div>\n</div>',
    css: "body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#1a1a2e;font-family:sans-serif}.container{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;padding:2rem}.box{width:100px;height:100px;border-radius:1rem;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;color:#fff;transition:transform .3s}.box:hover{transform:scale(1.1) rotate(5deg)}.box-1{background:linear-gradient(135deg,#667eea,#764ba2)}.box-2{background:linear-gradient(135deg,#f093fb,#f5576c)}.box-3{background:linear-gradient(135deg,#4facfe,#00f2fe)}.box-4{background:linear-gradient(135deg,#43e97b,#38f9d7)}",
    js: "document.querySelectorAll('.box').forEach(b=>{b.addEventListener('click',()=>{b.style.transform='scale(1.2) rotate(360deg)';setTimeout(()=>b.style.transform='',600)})});" },
  { name: 'CSS Animation', emoji: '🎭',
    html: '<div class="scene">\n  <div class="loader"><span></span><span></span><span></span><span></span><span></span></div>\n  <p class="text">Loading...</p>\n</div>',
    css: "body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a}.scene{text-align:center}.loader{display:flex;gap:6px;justify-content:center;margin-bottom:1.5rem}.loader span{width:12px;height:12px;border-radius:50%;background:#2D79FF;animation:bounce 1.4s ease-in-out infinite}.loader span:nth-child(1){animation-delay:0s}.loader span:nth-child(2){animation-delay:.1s}.loader span:nth-child(3){animation-delay:.2s}.loader span:nth-child(4){animation-delay:.3s}.loader span:nth-child(5){animation-delay:.4s}@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1.2);opacity:1}}.text{color:rgba(255,255,255,.5);font-family:'Segoe UI',sans-serif;font-size:.85rem;letter-spacing:.15em;text-transform:uppercase}",
    js: "const colors=['#2D79FF','#ec4899','#3b82f6','#f59e0b','#06b6d4'];let idx=0;document.addEventListener('click',()=>{idx=(idx+1)%colors.length;document.querySelectorAll('.loader span').forEach(s=>{s.style.background=colors[idx]})});" },
  { name: 'Form UI', emoji: '🚀',
    html: '<form class="form" onsubmit="return false">\n  <h2>🚀 Sign Up</h2>\n  <div class="field"><label>Username</label><input type="text" placeholder="Enter username" /></div>\n  <div class="field"><label>Email</label><input type="email" placeholder="Enter email" /></div>\n  <div class="field"><label>Password</label><input type="password" placeholder="Enter password" id="password" /><div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div></div>\n  <button type="submit" class="submit-btn">Create Account</button>\n</form>',
    css: "body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;font-family:'Segoe UI',sans-serif}.form{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:1.25rem;padding:2.5rem;width:340px;backdrop-filter:blur(12px)}h2{color:#fff;text-align:center;margin:0 0 1.75rem;font-size:1.4rem}.field{margin-bottom:1.25rem}label{display:block;color:rgba(255,255,255,.6);font-size:.8rem;margin-bottom:.4rem;font-weight:500}input{width:100%;padding:.7rem .9rem;border:1px solid rgba(255,255,255,.1);border-radius:.6rem;background:rgba(255,255,255,.04);color:#fff;font-size:.85rem;outline:none;transition:border-color .3s,box-shadow .3s;box-sizing:border-box}input:focus{border-color:#2D79FF;box-shadow:0 0 0 3px rgba(45,121,255,.15)}.strength-bar{height:3px;background:rgba(255,255,255,.06);border-radius:4px;margin-top:.5rem;overflow:hidden}.strength-fill{height:100%;width:0;border-radius:4px;transition:width .4s,background .4s}.submit-btn{width:100%;padding:.75rem;border:none;border-radius:.7rem;background:linear-gradient(135deg,#2D79FF,#5B9BFF);color:#fff;font-weight:600;font-size:.9rem;cursor:pointer;transition:transform .2s,box-shadow .2s;margin-top:.5rem}.submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,121,255,.3)}",
    js: "const pw=document.getElementById('password'),fill=document.getElementById('strengthFill');pw.addEventListener('input',()=>{const v=pw.value;let s=0;if(v.length>=6)s++;if(v.length>=10)s++;if(/[A-Z]/.test(v))s++;if(/[0-9]/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;fill.style.width=(s/5)*100+'%';fill.style.background=['#ef4444','#f97316','#eab308','#3b82f6','#2D79FF'][s-1]||'#333'});document.querySelector('.submit-btn').addEventListener('click',function(){this.textContent='✓ Created!';this.style.background='linear-gradient(135deg,#2D79FF,#1D68E5)';setTimeout(()=>{this.textContent='Create Account';this.style.background=''},2000)});" },
  { name: 'Dashboard', emoji: '📊',
    html: '<div class="dashboard">\n  <header class="dash-header"><h1>📊 Dashboard</h1><span class="badge">Live</span></header>\n  <div class="stats-grid">\n    <div class="stat-card"><span class="stat-icon">👥</span><div><span class="stat-value" id="users">0</span><span class="stat-label">Users</span></div></div>\n    <div class="stat-card"><span class="stat-icon">💰</span><div><span class="stat-value" id="revenue">$0</span><span class="stat-label">Revenue</span></div></div>\n    <div class="stat-card"><span class="stat-icon">📦</span><div><span class="stat-value" id="orders">0</span><span class="stat-label">Orders</span></div></div>\n  </div>\n  <div class="chart-area"><h3>Activity</h3><div class="bars" id="chart"></div></div>\n</div>',
    css: "body{margin:0;background:#0f172a;font-family:'Segoe UI',sans-serif;color:#e2e8f0;padding:2rem}.dashboard{max-width:700px;margin:0 auto}.dash-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem}.dash-header h1{font-size:1.5rem;margin:0}.badge{padding:.25rem .75rem;border-radius:9999px;font-size:.7rem;font-weight:700;background:rgba(45,121,255,.15);color:#2D79FF;animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem}.stat-card{display:flex;align-items:center;gap:1rem;padding:1.25rem;border-radius:1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);transition:transform .3s}.stat-card:hover{transform:translateY(-2px)}.stat-icon{font-size:1.75rem}.stat-value{font-size:1.375rem;font-weight:800;color:#fff;display:block}.stat-label{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.05em}.chart-area{padding:1.5rem;border-radius:1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}.chart-area h3{font-size:.9rem;margin:0 0 1.25rem;color:rgba(255,255,255,.6)}.bars{display:flex;align-items:flex-end;gap:6px;height:120px}.bar{flex:1;border-radius:4px 4px 0 0;background:linear-gradient(to top,#2D79FF,#5B9BFF);transition:height .6s cubic-bezier(.34,1.56,.64,1);min-width:8px}",
    js: "function anim(id,end,pre='',dur=1500){const el=document.getElementById(id);let s=0;const step=()=>{s+=end/(dur/16);if(s>=end){el.textContent=pre+end.toLocaleString();return}el.textContent=pre+Math.floor(s).toLocaleString();requestAnimationFrame(step)};requestAnimationFrame(step)}anim('users',12847);anim('revenue',48293,'$');anim('orders',3842);const ch=document.getElementById('chart');[40,65,45,80,55,90,60,75,50,85,70,95].forEach((v,i)=>{const b=document.createElement('div');b.className='bar';b.style.height='0%';ch.appendChild(b);setTimeout(()=>b.style.height=v+'%',100+i*80)});" },
  { name: 'Responsive Grid', emoji: '🔲',
    html: '<div class="grid-container">\n  <div class="grid-item item-1">01</div>\n  <div class="grid-item item-2">02</div>\n  <div class="grid-item item-3">03</div>\n  <div class="grid-item item-4">04</div>\n  <div class="grid-item item-5">05</div>\n  <div class="grid-item item-6">06</div>\n</div>',
    css: "body{margin:0;min-height:100vh;background:#0a0a1a;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:'Segoe UI',sans-serif}.grid-container{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;width:100%;max-width:600px;aspect-ratio:3/2}.grid-item{border-radius:1rem;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;cursor:pointer;transition:transform .3s,box-shadow .3s}.grid-item:hover{transform:scale(1.05);box-shadow:0 8px 32px rgba(0,0,0,.3)}.item-1{background:linear-gradient(135deg,#2D79FF,#5B9BFF)}.item-2{background:linear-gradient(135deg,#ec4899,#f43f5e)}.item-3{background:linear-gradient(135deg,#14b8a6,#06b6d4)}.item-4{background:linear-gradient(135deg,#f59e0b,#ef4444)}.item-5{background:linear-gradient(135deg,#3b82f6,#60a5fa)}.item-6{background:linear-gradient(135deg,#8b5cf6,#a78bfa)}@media(max-width:480px){.grid-container{grid-template-columns:repeat(2,1fr)}}",
    js: "document.querySelectorAll('.grid-item').forEach(item=>{item.addEventListener('click',()=>{item.style.transform='scale(0.9) rotate(5deg)';setTimeout(()=>item.style.transform='',300)});item.addEventListener('mousemove',(e)=>{const r=item.getBoundingClientRect();item.style.transform=`perspective(600px) rotateY(${((e.clientX-r.left)/r.width-.5)*10}deg) rotateX(${(.5-(e.clientY-r.top)/r.height)*10}deg) scale(1.05)`});item.addEventListener('mouseleave',()=>item.style.transform='')});" },
];



/* ═══════════════════════════════════════════════════════════
   FIND & REPLACE PANEL
   ═══════════════════════════════════════════════════════════ */
function FindReplacePanel({ code, onReplace, onClose }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const matchCount = useMemo(() => { if (!findText) return 0; try { const flags = caseSensitive ? 'g' : 'gi'; const pattern = useRegex ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags); return (code.match(pattern) || []).length; } catch { return 0; } }, [code, findText, caseSensitive, useRegex]);
  const doReplace = useCallback((all) => { if (!findText) return; try { const flags = caseSensitive ? (all ? 'g' : '') : (all ? 'gi' : 'i'); const pattern = useRegex ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags); onReplace(code.replace(pattern, replaceText)); } catch {} }, [code, findText, replaceText, caseSensitive, useRegex, onReplace]);
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="playground-find-replace">
      <div className="playground-find-replace-inner">
        <div className="playground-find-row">
          <div className="playground-find-input-wrap"><Search size={11} className="playground-find-icon" /><input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="playground-find-input" autoFocus />{findText && <span className="playground-find-count">{matchCount} {matchCount === 1 ? 'match' : 'matches'}</span>}</div>
          <div className="playground-find-input-wrap"><Replace size={11} className="playground-find-icon" /><input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace..." className="playground-find-input" /></div>
        </div>
        <div className="playground-find-actions">
          <button onClick={() => setCaseSensitive(!caseSensitive)} className={`playground-find-toggle ${caseSensitive ? 'active' : ''}`} title="Case sensitive">Aa</button>
          <button onClick={() => setUseRegex(!useRegex)} className={`playground-find-toggle ${useRegex ? 'active' : ''}`} title="Use regex">.*</button>
          <div className="playground-find-sep" />
          <button onClick={() => doReplace(false)} className="playground-find-btn" disabled={!findText || matchCount === 0}>Replace</button>
          <button onClick={() => doReplace(true)} className="playground-find-btn" disabled={!findText || matchCount === 0}>All</button>
          <button onClick={onClose} className="playground-find-close"><X size={12} /></button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BEAUTIFIER / FORMATTER
   ═══════════════════════════════════════════════════════════ */
function formatHTML(html) { let indent = 0; const sc = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']); return html.replace(/>\s*</g, '>\n<').split('\n').map(line => { line = line.trim(); if (!line) return ''; if (line.startsWith('</')) indent = Math.max(0, indent - 1); const result = '  '.repeat(indent) + line; const m = line.match(/^<(\w+)/); if (m && !sc.has(m[1].toLowerCase()) && !line.startsWith('</') && !line.endsWith('/>')) indent++; return result; }).filter(Boolean).join('\n'); }
function formatCSS(css) { return css.replace(/\s*{\s*/g, ' {\n  ').replace(/;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n').replace(/  \n}/g, '\n}').replace(/\n{3,}/g, '\n\n').trim(); }
function formatJS(js) { let indent = 0; return js.split('\n').map(line => { const t = line.trim(); if (!t) return ''; if (t.startsWith('}') || t.startsWith(']') || t.startsWith(')')) indent = Math.max(0, indent - 1); const r = '  '.repeat(indent) + t; indent = Math.max(0, indent + (t.match(/[{(\[]/g) || []).length - (t.match(/[})\]]/g) || []).length); return r; }).filter(l => l !== '').join('\n'); }

const VIEWPORTS = [
  { id: 'full', icon: Maximize2, label: 'Full', width: '100%' },
  { id: 'desktop', icon: Monitor, label: '1280', width: '1280px' },
  { id: 'tablet', icon: Tablet, label: '768', width: '768px' },
  { id: 'mobile', icon: Smartphone, label: '375', width: '375px' },
];

/* ═══════════════════════════════════════════════════════════
   CONSOLE PANEL
   ═══════════════════════════════════════════════════════════ */
function ConsolePanel({ entries, onClear, onClose }) {
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [entries.length]);
  const cfg = { error: { cls: 'playground-console-error', icon: <AlertTriangle size={10} /> }, warn: { cls: 'playground-console-warn', icon: <AlertTriangle size={10} /> }, info: { cls: 'playground-console-info', icon: <Info size={10} /> }, log: { cls: 'playground-console-log', icon: <ChevronDown size={10} /> } };
  return (
    <div className="playground-console">
      <div className="playground-console-header">
        <div className="flex items-center gap-2"><Terminal size={12} className="opacity-40" /><span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Console</span>{entries.length > 0 && <span className="playground-console-count">{entries.length}</span>}</div>
        <div className="flex items-center gap-1"><button onClick={onClear} className="playground-console-btn"><Eraser size={10} /> Clear</button><button onClick={onClose} className="playground-console-btn-close"><X size={12} /></button></div>
      </div>
      <div ref={scrollRef} className="playground-console-body scrollbar-thin">
        {entries.length === 0 ? <div className="playground-console-empty">No output — use console.log() in JS</div> : entries.map((entry, i) => { const c = cfg[entry.level] || cfg.log; return (<div key={i} className={`playground-console-entry ${c.cls}`}><span className="playground-console-icon">{c.icon}</span><span className="playground-console-time">{entry.time}</span><pre className="playground-console-msg">{entry.args.join(' ')}</pre></div>); })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function FrontendPlayground() {
  const [html, setHtml] = useLocalStorage('playground-html', '');
  const [css, setCss] = useLocalStorage('playground-css', '');
  const [js, setJs] = useLocalStorage('playground-js', '');
  const [activeTab, setActiveTab] = useState('html');
  const [viewport, setViewport] = useState('full');
  const [layout, setLayout] = useLocalStorage('playground-layout', 'horizontal');
  const [showPreview, setShowPreview] = useState(true);
  const [autoRun, setAutoRun] = useLocalStorage('playground-autorun', true);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showSamples, setShowSamples] = useState(false);
  const [wordWrap, setWordWrap] = useLocalStorage('playground-wordwrap', false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isFormatting, setIsFormatting] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showCdnPanel, setShowCdnPanel] = useState(false);
  const [editorFontSize, setEditorFontSize] = useLocalStorage('playground-fontsize', 13);
  const [previewTheme, setPreviewTheme] = useLocalStorage('playground-preview-theme', 'light');
  const [enabledCdns, setEnabledCdns] = useLocalStorage('playground-cdns', []);
  const [lastSaved, setLastSaved] = useState(null);
  const [undoStack, setUndoStack] = useState({ html: [], css: [], js: [] });
  const [redoStack, setRedoStack] = useState({ html: [], css: [], js: [] });
  const [showLayoutTemplates, setShowLayoutTemplates] = useState(false);
  const [showAssetsPanel, setShowAssetsPanel] = useState(false);
  const [assetCategory, setAssetCategory] = useState('images');
  const [showEmmetBar, setShowEmmetBar] = useState(false);
  const [emmetInput, setEmmetInput] = useState('');
  const [emmetPreview, setEmmetPreview] = useState('');
  const [splitView, setSplitView] = useLocalStorage('playground-splitview', false);
  const [showHeadConfig, setShowHeadConfig] = useState(false);
  const [headConfig, setHeadConfig] = useLocalStorage('playground-head', { googleFonts: [], customMeta: '', favicon: '' });
  const [screenshotting, setScreenshotting] = useState(false);
  const lastPushRef = useRef(0);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const iframeRef = useRef(null), debounceRef = useRef(null), fileInputRef = useRef(null), samplesButtonRef = useRef(null);
  const layoutButtonRef = useRef(null);

  const samplesDropdownPos = useMemo(() => {
    if (!showSamples || !samplesButtonRef.current) return {};
    const rect = samplesButtonRef.current.getBoundingClientRect();
    const dropdownWidth = 224;
    let left = rect.right - dropdownWidth;
    if (left < 8) left = 8;
    const maxTop = window.innerHeight - 320;
    let top = rect.bottom + 6;
    if (top > maxTop) top = maxTop;
    return { position: 'fixed', top, left, zIndex: 9999 };
  }, [showSamples]);

  const layoutDropdownPos = useMemo(() => {
    if (!showLayoutTemplates || !layoutButtonRef.current) return {};
    const rect = layoutButtonRef.current.getBoundingClientRect();
    const dropdownWidth = 256;
    let left = rect.right - dropdownWidth;
    if (left < 8) left = 8;
    const maxTop = window.innerHeight - 400;
    let top = rect.bottom + 6;
    if (top > maxTop) top = maxTop;
    return { position: 'fixed', top, left, zIndex: 9999 };
  }, [showLayoutTemplates]);

  const htmlRef = useRef(html);
  const cssRef = useRef(css);
  const jsRef = useRef(js);
  useEffect(() => { htmlRef.current = html; }, [html]);
  useEffect(() => { cssRef.current = css; }, [css]);
  useEffect(() => { jsRef.current = js; }, [js]);

  const pushUndo = useCallback((tab, oldVal) => { const now = Date.now(); if (now - lastPushRef.current < 500) return; lastPushRef.current = now; setUndoStack(prev => ({ ...prev, [tab]: [...prev[tab].slice(-50), oldVal] })); setRedoStack(prev => ({ ...prev, [tab]: [] })); }, []);
  const handleUndo = useCallback(() => { const tab = activeTab, stack = undoStack[tab]; if (!stack.length) return; const cur = tab === 'html' ? html : tab === 'css' ? css : js; setUndoStack(s => ({ ...s, [tab]: s[tab].slice(0, -1) })); setRedoStack(s => ({ ...s, [tab]: [...s[tab], cur] })); const prev = stack[stack.length - 1]; if (tab === 'html') setHtml(prev); else if (tab === 'css') setCss(prev); else setJs(prev); }, [activeTab, undoStack, html, css, js, setHtml, setCss, setJs]);
  const handleRedo = useCallback(() => { const tab = activeTab, stack = redoStack[tab]; if (!stack.length) return; const cur = tab === 'html' ? html : tab === 'css' ? css : js; setRedoStack(s => ({ ...s, [tab]: s[tab].slice(0, -1) })); setUndoStack(s => ({ ...s, [tab]: [...s[tab], cur] })); const next = stack[stack.length - 1]; if (tab === 'html') setHtml(next); else if (tab === 'css') setCss(next); else setJs(next); }, [activeTab, redoStack, html, css, js, setHtml, setCss, setJs]);
  // Tracked setters use refs to avoid stale closure → prevents re-creating
  // callbacks on every keystroke which was causing cascading re-renders
  const setHtmlTracked = useCallback((val) => { pushUndo('html', htmlRef.current); setHtml(val); }, [pushUndo, setHtml]);
  const setCssTracked = useCallback((val) => { pushUndo('css', cssRef.current); setCss(val); }, [pushUndo, setCss]);
  const setJsTracked = useCallback((val) => { pushUndo('js', jsRef.current); setJs(val); }, [pushUndo, setJs]);

  useEffect(() => { const t = setTimeout(() => setLastSaved(new Date()), 2000); return () => clearTimeout(t); }, [html, css, js]);

  const cdnLinks = useMemo(() => {
    const cssL = enabledCdns.filter(n => CDN_LIBRARIES.find(l => l.name === n && l.type === 'css')).map(n => CDN_LIBRARIES.find(l => l.name === n)).map(l => `<link rel="stylesheet" href="${l.url}">`).join('\n    ');
    const jsL = enabledCdns.filter(n => CDN_LIBRARIES.find(l => l.name === n && l.type === 'js')).map(n => CDN_LIBRARIES.find(l => l.name === n)).map(l => `<script src="${l.url}"><\/script>`).join('\n    ');
    return { cssLinks: cssL, jsLinks: jsL };
  }, [enabledCdns]);

  const headExtras = useMemo(() => {
    let extra = '';
    if (headConfig.googleFonts && headConfig.googleFonts.length > 0) {
      const families = headConfig.googleFonts.map(f => f.replace(/ /g, '+')).join('&family=');
      extra += `\n  <link rel="preconnect" href="https://fonts.googleapis.com">`;
      extra += `\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;
      extra += `\n  <link href="https://fonts.googleapis.com/css2?family=${families}:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`;
    }
    if (headConfig.favicon) {
      extra += `\n  <link rel="icon" href="${headConfig.favicon}">`;
    }
    if (headConfig.customMeta) {
      extra += '\n  ' + headConfig.customMeta;
    }
    return extra;
  }, [headConfig]);

  const previewBg = previewTheme === 'dark' ? '#1a1a2e' : '#fff';
  const previewHTML = useMemo(() => {
    const bodyBg = previewTheme === 'dark' ? 'background:#1a1a2e;color:#e2e8f0;' : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>${headExtras}${cdnLinks.cssLinks ? '\n  ' + cdnLinks.cssLinks : ''}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { height: 100%; }
    body { min-height: 100%; margin: 0; ${bodyBg} }
    ${css}
  </style>
</head>
<body>
  ${html}
  ${cdnLinks.jsLinks ? cdnLinks.jsLinks + '\n  ' : ''}<script>
  (function(){
    var _l=console.log,_w=console.warn,_e=console.error,_i=console.info;
    function s(t,a){try{parent.postMessage({type:'console',level:t,args:Array.from(a).map(function(x){try{return typeof x==='object'?JSON.stringify(x,null,2):String(x)}catch(e){return String(x)}})},'*')}catch(e){}}
    console.log=function(){s('log',arguments);_l.apply(console,arguments)};
    console.warn=function(){s('warn',arguments);_w.apply(console,arguments)};
    console.error=function(){s('error',arguments);_e.apply(console,arguments)};
    console.info=function(){s('info',arguments);_i.apply(console,arguments)};
    window.onerror=function(m,u,l){s('error',[m+(l?' (line '+l+')':'')])};
    window.onunhandledrejection=function(e){s('error',['Unhandled: '+(e.reason&&e.reason.message||e.reason||'Unknown')])};
  })();
  try { ${js} } catch(e) { console.error(e.message); }
  <\/script>
</body>
</html>`;
  }, [html, css, js, cdnLinks, previewTheme, headExtras]);

  const prevBlobUrlRef = useRef(null);
  const previewBlobUrl = useMemo(() => {
    try {
      // Revoke the previous blob URL immediately when creating a new one
      // to prevent memory leaks from accumulating blob URLs
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
      }
      const blob = new Blob([previewHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      prevBlobUrlRef.current = url;
      return url;
    } catch {
      return null;
    }
  }, [previewHTML]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  useEffect(() => { const h = (e) => { if (e.data?.type === 'console') { setConsoleOutput(prev => [...prev, { level: e.data.level, args: e.data.args, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }].slice(-200)); if (e.data.level === 'error') setShowConsole(true); } }; window.addEventListener('message', h); return () => window.removeEventListener('message', h); }, []);
  useEffect(() => { if (!autoRun) return; if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => { debounceRef.current = null; setPreviewKey(k => k + 1); }, 800); return () => { if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; } }; }, [html, css, js, autoRun]);

  // Load shared URL on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#playground=')) {
        const encoded = hash.slice('#playground='.length);
        const data = JSON.parse(decodeURIComponent(atob(encoded)));
        if (data.h !== undefined) setHtml(data.h);
        if (data.c !== undefined) setCss(data.c);
        if (data.j !== undefined) setJs(data.j);
        if (data.cdn) setEnabledCdns(data.cdn);
        if (data.head) setHeadConfig(data.head);
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) { /* ignore invalid hash */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runPreview = useCallback(() => { setConsoleOutput([]); setPreviewKey(k => k + 1); }, []);
  const handleReset = useCallback(() => { setHtml(''); setCss(''); setJs(''); setConsoleOutput([]); setPreviewKey(k => k + 1); setUndoStack({ html: [], css: [], js: [] }); setRedoStack({ html: [], css: [], js: [] }); }, [setHtml, setCss, setJs]);
  const handleLoadSample = useCallback((sample) => { setHtml(sample.html); setCss(sample.css); setJs(sample.js); setConsoleOutput([]); setShowSamples(false); }, [setHtml, setCss, setJs]);
  const getFullCode = useCallback(() => {
    const cc = enabledCdns
      .filter(n => CDN_LIBRARIES.find(l => l.name === n && l.type === 'css'))
      .map(n => CDN_LIBRARIES.find(l => l.name === n))
      .map(l => `  <link rel="stylesheet" href="${l.url}">`)
      .join('\n');
    const cj = enabledCdns
      .filter(n => CDN_LIBRARIES.find(l => l.name === n && l.type === 'js'))
      .map(n => CDN_LIBRARIES.find(l => l.name === n))
      .map(l => `  <script src="${l.url}"><\/script>`)
      .join('\n');
    let headLines = [];
    if (headConfig.googleFonts?.length > 0) {
      const families = headConfig.googleFonts.map(f => f.replace(/ /g, '+')).join('&family=');
      headLines.push(`  <link rel="preconnect" href="https://fonts.googleapis.com">`);
      headLines.push(`  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
      headLines.push(`  <link href="https://fonts.googleapis.com/css2?family=${families}:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`);
    }
    if (headConfig.favicon) headLines.push(`  <link rel="icon" href="${headConfig.favicon}">`);
    if (headConfig.customMeta) headLines.push('  ' + headConfig.customMeta);
    return [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>Playground</title>',
      ...headLines,
      cc || null,
      '  <style>',
      css.split('\n').map(l => '    ' + l).join('\n'),
      '  </style>',
      '</head>',
      '<body>',
      html.split('\n').map(l => '  ' + l).join('\n'),
      cj || null,
      '  <script>',
      js.split('\n').map(l => '    ' + l).join('\n'),
      '  </script>',
      '</body>',
      '</html>',
    ].filter(Boolean).join('\n');
  }, [html, css, js, enabledCdns, headConfig]);
  const handleExport = useCallback(() => { try { const blob = new Blob([getFullCode()], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `playground-${Date.now()}.html`; a.click(); URL.revokeObjectURL(url); } catch (err) { console.error('Export failed:', err); } }, [getFullCode]);
  const handleFileUpload = useCallback((e) => { const file = e.target.files[0]; if (!file) return; try { const reader = new FileReader(); reader.onload = (ev) => { try { const c = ev.target.result || ''; const sm = c.match(/<style[^>]*>([\s\S]*?)<\/style>/i); const scm = c.match(/<script[^>]*>([\s\S]*?)<\/script>/i); const bm = c.match(/<body[^>]*>([\s\S]*?)<\/body>/i); if (bm) setHtml(bm[1].replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim()); else setHtml(c.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!DOCTYPE[^>]*>/i, '').replace(/<html[^>]*>/i, '').replace(/<\/html>/i, '').replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>/i, '').replace(/<\/body>/i, '').trim()); if (sm) setCss(sm[1].trim()); if (scm) setJs(scm[1].trim()); setConsoleOutput([]); } catch (err) { console.error('Failed to parse uploaded HTML file:', err); } }; reader.onerror = () => { console.error('Failed to read file:', reader.error?.message || 'Unknown error'); }; reader.readAsText(file); } catch (err) { console.error('File upload failed:', err); } e.target.value = ''; }, [setHtml, setCss, setJs]);
  const handleFormat = useCallback(() => { setIsFormatting(true); setTimeout(() => { try { if (activeTab === 'html') setHtmlTracked(formatHTML(html)); else if (activeTab === 'css') setCssTracked(formatCSS(css)); else setJsTracked(formatJS(js)); } catch (err) { console.error('Code formatting failed:', err); } setIsFormatting(false); }, 150); }, [activeTab, html, css, js, setHtmlTracked, setCssTracked, setJsTracked]);
  const handleInsertSnippet = useCallback((code) => { if (activeTab === 'html') setHtmlTracked(html ? html + '\n' + code : code); else if (activeTab === 'css') setCssTracked(css ? css + '\n\n' + code : code); else setJsTracked(js ? js + '\n\n' + code : code); setShowSnippets(false); }, [activeTab, html, css, js, setHtmlTracked, setCssTracked, setJsTracked]);
  const toggleCdn = useCallback((name) => { setEnabledCdns(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]); }, [setEnabledCdns]);

  const handleLoadLayout = useCallback((template) => { setHtml(template.html); setCss(template.css); setJs(template.js); setConsoleOutput([]); setShowLayoutTemplates(false); }, [setHtml, setCss, setJs]);

  const handleInsertAsset = useCallback((asset) => {
    const target = asset.type === 'css' ? 'css' : 'html';
    if (target === 'css') {
      setCssTracked(css ? css + '\n\n' + asset.code : asset.code);
      setActiveTab('css');
    } else {
      setHtmlTracked(html ? html + '\n' + asset.code : asset.code);
      setActiveTab('html');
    }
  }, [html, css, setHtmlTracked, setCssTracked]);

  const handleEmmetExpand = useCallback(() => {
    const result = expandEmmetAbbreviation(emmetInput);
    if (result) {
      setHtmlTracked(html ? html + '\n' + result : result);
      setActiveTab('html');
      setEmmetInput('');
      setEmmetPreview('');
    }
  }, [emmetInput, html, setHtmlTracked]);

  const handleEmmetInputChange = useCallback((val) => {
    setEmmetInput(val);
    const preview = expandEmmetAbbreviation(val);
    setEmmetPreview(preview || '');
  }, []);

  const handleScreenshot = useCallback(async () => {
    if (!iframeRef.current || screenshotting) return;
    setScreenshotting(true);
    try {
      const iframe = iframeRef.current;
      const rect = iframe.getBoundingClientRect();
      // Open print-ready window with preview content
      const w = window.open('', '_blank', `width=${Math.round(rect.width)},height=${Math.round(rect.height)}`);
      if (w) {
        w.document.write(previewHTML);
        w.document.close();
        w.focus();
        setTimeout(() => {
          try { w.print(); } catch (e) { console.log('Print dialog opened'); }
        }, 500);
      }
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
    setScreenshotting(false);
  }, [screenshotting, previewHTML]);

  const handleShareUrl = useCallback(() => {
    try {
      const data = JSON.stringify({ h: html, c: css, j: js, cdn: enabledCdns, head: headConfig });
      const compressed = btoa(encodeURIComponent(data));
      const url = `${window.location.origin}${window.location.pathname}#playground=${compressed}`;
      copyToClipboard(url);
    } catch (err) {
      console.error('Share URL generation failed:', err);
    }
  }, [html, css, js, enabledCdns, headConfig, copyToClipboard]);

  const toggleGoogleFont = useCallback((fontName) => {
    setHeadConfig(prev => {
      const fonts = prev.googleFonts || [];
      return { ...prev, googleFonts: fonts.includes(fontName) ? fonts.filter(f => f !== fontName) : [...fonts, fontName] };
    });
  }, [setHeadConfig]);

  const TABS = useMemo(() => [{ id: 'html', label: 'HTML', icon: Code, color: '#e34c26', lines: html.split('\n').filter(Boolean).length }, { id: 'css', label: 'CSS', icon: Palette, color: '#2965f1', lines: css.split('\n').filter(Boolean).length }, { id: 'js', label: 'JS', icon: Braces, color: '#f0db4f', lines: js.split('\n').filter(Boolean).length }], [html, css, js]);
  const currentCode = activeTab === 'html' ? html : activeTab === 'css' ? css : js;
  const setCurrentCode = activeTab === 'html' ? setHtmlTracked : activeTab === 'css' ? setCssTracked : setJsTracked;
  const viewportWidth = VIEWPORTS.find(v => v.id === viewport)?.width || '100%';
  const isVertical = layout === 'vertical';
  const errorCount = consoleOutput.filter(e => e.level === 'error').length;
  const warnCount = consoleOutput.filter(e => e.level === 'warn').length;
  const codeStats = useMemo(() => { const total = html.length + css.length + js.length; const totalLines = html.split('\n').length + css.split('\n').length + js.split('\n').length; const words = (html + ' ' + css + ' ' + js).split(/\s+/).filter(Boolean).length; return { chars: total, lines: totalLines, words }; }, [html, css, js]);
  const handleFindReplace = useCallback((newCode) => { setCurrentCode(newCode); }, [setCurrentCode]);

  return (
    <div className="playground-root">
      {/* ── Top Bar ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="playground-header">
        <div className="flex items-center gap-3">
          <div className="playground-header-icon"><SquareCode size={22} /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Frontend Playground</h1>
            <p className="playground-subtitle">
              Write HTML, CSS & JS with live preview
              <span className="playground-badge-intellisense"><Zap size={8} /> CodeMirror</span>
              {enabledCdns.length > 0 && <span className="playground-badge-cdn"><Library size={8} /> {enabledCdns.length} CDN</span>}
              {headConfig.googleFonts?.length > 0 && <span className="playground-badge-cdn"><Type size={8} /> {headConfig.googleFonts.length} Font{headConfig.googleFonts.length > 1 ? 's' : ''}</span>}
              {splitView && <span className="playground-badge-intellisense"><LayoutGrid size={8} /> Split</span>}
            </p>
          </div>
        </div>
        <div className="playground-actions">
          <label className={`playground-auto-toggle ${autoRun ? 'active' : ''}`}>
            <input type="checkbox" className="toggle toggle-xs toggle-success" checked={autoRun} onChange={e => setAutoRun(e.target.checked)} />
            <span>Auto</span>
          </label>
          <div className="playground-divider-v" />
          <button onClick={runPreview} className="btn btn-sm btn-primary gap-1.5 playground-run-btn">
            <Play size={13} fill="currentColor" /> Run
          </button>
          <input type="file" ref={fileInputRef} accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-sm btn-ghost gap-1">
            <Upload size={13} /><span className="hidden sm:inline">Import</span>
          </button>
          <div className="relative" ref={samplesButtonRef}>
            <button onClick={() => setShowSamples(!showSamples)} className="btn btn-sm btn-ghost gap-1">
              <Sparkles size={13} /><span className="hidden sm:inline">Samples</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${showSamples ? 'rotate-180' : ''}`} />
            </button>
            {showSamples && createPortal(
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0"
                  style={{ zIndex: 9998 }}
                  onClick={() => setShowSamples(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="playground-dropdown-fixed"
                  style={samplesDropdownPos}
                >
                  <div className="playground-dropdown-header">Quick Start Templates</div>
                  {SAMPLES.map(s => (
                    <button key={s.name} onClick={() => handleLoadSample(s)} className="playground-dropdown-item">
                      <span>{s.emoji}</span><span>{s.name}</span>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
          </div>
          <div className="relative" ref={layoutButtonRef}>
            <button onClick={() => setShowLayoutTemplates(!showLayoutTemplates)} className="btn btn-sm btn-ghost gap-1">
              <PanelTop size={13} /><span className="hidden sm:inline">Layouts</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${showLayoutTemplates ? 'rotate-180' : ''}`} />
            </button>
            {showLayoutTemplates && createPortal(
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowLayoutTemplates(false)} />
                <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }} transition={{ duration: 0.15 }} className="playground-dropdown-fixed" style={layoutDropdownPos}>
                  <div className="playground-dropdown-header">Layout Templates</div>
                  {LAYOUT_TEMPLATES.map(t => (
                    <button key={t.name} onClick={() => handleLoadLayout(t)} className="playground-dropdown-item">
                      <span>{t.emoji}</span><span>{t.name}</span>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
          </div>
          <button onClick={() => copyToClipboard(getFullCode())} className="btn btn-sm btn-ghost gap-1">
            {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button onClick={handleShareUrl} className="btn btn-sm btn-ghost gap-1" title="Copy shareable URL">
            <Share2 size={13} /><span className="hidden sm:inline">Share</span>
          </button>
          <button onClick={handleExport} className="btn btn-sm btn-ghost gap-1">
            <Download size={13} /><span className="hidden sm:inline">Export</span>
          </button>
          {(html || css || js) && (
            <button onClick={handleReset} className="btn btn-sm btn-ghost text-error/60 hover:text-error gap-1">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="playground-toolbar">
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => setLayout(isVertical ? 'horizontal' : 'vertical')} className="playground-tool-btn">
            {isVertical ? <Rows size={12} /> : <Columns size={12} />}
            <span>{isVertical ? 'Stacked' : 'Side by side'}</span>
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="playground-tool-btn">
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            <span>{showPreview ? 'Hide' : 'Show'} preview</span>
          </button>
          <button onClick={() => setShowConsole(!showConsole)} className="playground-tool-btn relative">
            <Terminal size={12} /><span>Console</span>
            {errorCount > 0 && <span className="playground-error-badge">{errorCount > 9 ? '9+' : errorCount}</span>}
            {warnCount > 0 && errorCount === 0 && <span className="playground-warn-badge">{warnCount > 9 ? '9+' : warnCount}</span>}
          </button>
          <button onClick={() => setWordWrap(w => !w)} className={`playground-tool-btn ${wordWrap ? 'text-primary' : ''}`} title="Toggle word wrap">
            <WrapText size={12} /><span className="hidden sm:inline">Wrap</span>
          </button>
          <button onClick={handleFormat} className={`playground-tool-btn ${isFormatting ? 'playground-formatting' : ''}`} title="Format / Beautify code">
            <AlignLeft size={12} /><span className="hidden sm:inline">Format</span>
          </button>
          <div className="playground-divider-v-sm" />
          <button onClick={() => setShowFindReplace(!showFindReplace)} className={`playground-tool-btn ${showFindReplace ? 'text-primary' : ''}`} title="Find & Replace">
            <Search size={12} /><span className="hidden sm:inline">Find</span>
          </button>
          <button onClick={handleUndo} className="playground-tool-btn" title="Undo" disabled={undoStack[activeTab]?.length === 0}><Undo2 size={12} /></button>
          <button onClick={handleRedo} className="playground-tool-btn" title="Redo" disabled={redoStack[activeTab]?.length === 0}><Redo2 size={12} /></button>
          <div className="playground-divider-v-sm" />
          <button onClick={() => setEditorFontSize(s => Math.min(s + 1, 22))} className="playground-tool-btn" title="Zoom in"><ZoomIn size={12} /></button>
          <span className="playground-font-size-label">{editorFontSize}px</span>
          <button onClick={() => setEditorFontSize(s => Math.max(s - 1, 9))} className="playground-tool-btn" title="Zoom out"><ZoomOut size={12} /></button>
          <div className="playground-divider-v-sm" />
          <button onClick={() => setShowSnippets(!showSnippets)} className={`playground-tool-btn ${showSnippets ? 'text-primary' : ''}`} title="Snippet library">
            <BookOpen size={12} /><span className="hidden sm:inline">Snippets</span>
          </button>
          <button onClick={() => setShowCdnPanel(!showCdnPanel)} className={`playground-tool-btn ${showCdnPanel ? 'text-primary' : ''}`} title="CDN libraries">
            <Library size={12} /><span className="hidden sm:inline">CDN</span>
            {enabledCdns.length > 0 && <span className="playground-cdn-count">{enabledCdns.length}</span>}
          </button>
          <button onClick={() => setShowAssetsPanel(!showAssetsPanel)} className={`playground-tool-btn ${showAssetsPanel ? 'text-primary' : ''}`} title="Quick asset insertion">
            <Image size={12} /><span className="hidden sm:inline">Assets</span>
          </button>
          <div className="playground-divider-v-sm" />
          <button onClick={() => setShowEmmetBar(!showEmmetBar)} className={`playground-tool-btn ${showEmmetBar ? 'text-primary' : ''}`} title="Emmet abbreviation expander">
            <Zap size={12} /><span className="hidden sm:inline">Emmet</span>
          </button>
          <button onClick={() => setShowHeadConfig(!showHeadConfig)} className={`playground-tool-btn ${showHeadConfig ? 'text-primary' : ''}`} title="Configure head: fonts, meta tags">
            <Settings2 size={12} /><span className="hidden sm:inline">Head</span>
            {(headConfig.googleFonts?.length > 0 || headConfig.customMeta) && <span className="playground-cdn-count">{(headConfig.googleFonts?.length || 0) + (headConfig.customMeta ? 1 : 0)}</span>}
          </button>
          <button onClick={() => setSplitView(!splitView)} className={`playground-tool-btn ${splitView ? 'text-primary' : ''}`} title="Split editor: show all 3 panes">
            <LayoutGrid size={12} /><span className="hidden sm:inline">Split</span>
          </button>
          <div className="playground-divider-v-sm" />
          <button onClick={() => setShowShortcuts(true)} className="playground-tool-btn" title="Keyboard shortcuts">
            <Keyboard size={12} /><span className="hidden sm:inline">Keys</span>
          </button>
        </div>
        {showPreview && (
          <div className="flex items-center gap-2">
            <div className="playground-preview-theme-switcher">
              <button onClick={() => setPreviewTheme('light')} className={`playground-preview-theme-btn ${previewTheme === 'light' ? 'active' : ''}`} title="Light background"><Sun size={10} /></button>
              <button onClick={() => setPreviewTheme('dark')} className={`playground-preview-theme-btn ${previewTheme === 'dark' ? 'active' : ''}`} title="Dark background"><Moon size={10} /></button>
            </div>
            <div className="playground-viewport-switcher">
              {VIEWPORTS.map(v => (
                <button key={v.id} onClick={() => setViewport(v.id)} className={`playground-viewport-btn ${viewport === v.id ? 'active' : ''}`}>
                  <v.icon size={11} /><span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── CDN Panel ── */}
      <AnimatePresence>
        {showCdnPanel && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="playground-cdn-panel">
              <div className="playground-cdn-panel-header">
                <div className="flex items-center gap-2">
                  <Library size={13} className="text-primary" />
                  <span className="text-xs font-bold">CDN Libraries</span>
                  <span className="playground-cdn-hint">Toggle to inject into preview</span>
                </div>
                <button onClick={() => setShowCdnPanel(false)} className="playground-find-close"><X size={12} /></button>
              </div>
              <div className="playground-cdn-grid">
                {CDN_LIBRARIES.map(lib => {
                  const isEnabled = enabledCdns.includes(lib.name);
                  return (
                    <button key={lib.name} onClick={() => toggleCdn(lib.name)} className={`playground-cdn-item ${isEnabled ? 'active' : ''}`}>
                      <span className="playground-cdn-item-icon">{lib.icon}</span>
                      <span className="playground-cdn-item-name">{lib.name}</span>
                      <span className={`playground-cdn-item-type ${lib.type}`}>{lib.type.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Snippet Library ── */}
      <AnimatePresence>
        {showSnippets && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="playground-snippet-panel">
              <div className="playground-snippet-panel-header">
                <div className="flex items-center gap-2">
                  <BookOpen size={13} className="text-primary" />
                  <span className="text-xs font-bold">Snippet Library</span>
                  <span className="playground-cdn-hint">for {activeTab.toUpperCase()}</span>
                </div>
                <button onClick={() => setShowSnippets(false)} className="playground-find-close"><X size={12} /></button>
              </div>
              <div className="playground-snippet-grid">
                {(SNIPPET_LIBRARY[activeTab] || []).map(snippet => (
                  <button key={snippet.name} onClick={() => handleInsertSnippet(snippet.code)} className="playground-snippet-item">
                    <span className="playground-snippet-item-icon">{snippet.emoji}</span>
                    <span className="playground-snippet-item-name">{snippet.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Assets Panel ── */}
      <AnimatePresence>
        {showAssetsPanel && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="playground-cdn-panel">
              <div className="playground-cdn-panel-header">
                <div className="flex items-center gap-2">
                  <Image size={13} className="text-primary" />
                  <span className="text-xs font-bold">Quick Assets</span>
                  <div className="playground-asset-tabs">
                    {[{ id: 'images', label: '🖼️ Images' }, { id: 'fonts', label: '🔤 Fonts' }, { id: 'colors', label: '🎨 Colors' }].map(cat => (
                      <button key={cat.id} onClick={() => setAssetCategory(cat.id)} className={`playground-asset-tab ${assetCategory === cat.id ? 'active' : ''}`}>{cat.label}</button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowAssetsPanel(false)} className="playground-find-close"><X size={12} /></button>
              </div>
              <div className="playground-snippet-grid">
                {(ASSET_CATEGORIES[assetCategory] || []).map(asset => (
                  <button key={asset.name} onClick={() => handleInsertAsset(asset)} className="playground-snippet-item" title={`Insert into ${asset.type === 'css' ? 'CSS' : 'HTML'}`}>
                    <span className="playground-snippet-item-icon">{asset.emoji}</span>
                    <span className="playground-snippet-item-name">{asset.name}</span>
                    {asset.type === 'css' && <span className="playground-cdn-item-type css">CSS</span>}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Emmet Abbreviation Bar ── */}
      <AnimatePresence>
        {showEmmetBar && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="playground-emmet-bar">
              <div className="playground-emmet-bar-inner">
                <Zap size={12} className="text-primary flex-shrink-0" />
                <input
                  value={emmetInput}
                  onChange={e => handleEmmetInputChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && emmetPreview) handleEmmetExpand(); if (e.key === 'Escape') setShowEmmetBar(false); }}
                  placeholder="Type Emmet abbreviation... (e.g. ul>li*5, div.card*3, .container)"
                  className="playground-emmet-input"
                  autoFocus
                />
                <button onClick={handleEmmetExpand} disabled={!emmetPreview} className="playground-find-btn">Expand</button>
                <button onClick={() => setShowEmmetBar(false)} className="playground-find-close"><X size={12} /></button>
              </div>
              {emmetPreview && (
                <div className="playground-emmet-preview">
                  <pre>{emmetPreview}</pre>
                </div>
              )}
              <div className="playground-emmet-hints">
                <span><kbd>div.cls</kbd> div with class</span>
                <span><kbd>ul&gt;li*5</kbd> list with 5 items</span>
                <span><kbd>div#app</kbd> div with id</span>
                <span><kbd>h1+p+p</kbd> siblings</span>
                <span><kbd>!</kbd> HTML boilerplate</span>
                <span><kbd>lorem</kbd> placeholder text</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Head Configuration Panel ── */}
      <AnimatePresence>
        {showHeadConfig && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
            <div className="playground-cdn-panel">
              <div className="playground-cdn-panel-header">
                <div className="flex items-center gap-2">
                  <Settings2 size={13} className="text-primary" />
                  <span className="text-xs font-bold">Head Configuration</span>
                  <span className="playground-cdn-hint">Fonts, meta tags, favicon</span>
                </div>
                <button onClick={() => setShowHeadConfig(false)} className="playground-find-close"><X size={12} /></button>
              </div>
              <div className="playground-head-config">
                <div className="playground-head-section">
                  <div className="playground-head-section-title"><Type size={11} /> Google Fonts</div>
                  <div className="playground-cdn-grid">
                    {GOOGLE_FONTS_LIST.map(font => {
                      const isEnabled = headConfig.googleFonts?.includes(font);
                      return (
                        <button key={font} onClick={() => toggleGoogleFont(font)} className={`playground-cdn-item ${isEnabled ? 'active' : ''}`}>
                          <span className="playground-cdn-item-name" style={{ fontFamily: isEnabled ? `"${font}", sans-serif` : undefined }}>{font}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="playground-head-section">
                  <div className="playground-head-section-title"><Code size={11} /> Custom Meta Tags</div>
                  <textarea
                    value={headConfig.customMeta || ''}
                    onChange={e => setHeadConfig(prev => ({ ...prev, customMeta: e.target.value }))}
                    placeholder={'<meta name="description" content="...">\n<meta name="author" content="...">'}
                    className="playground-head-textarea"
                    rows={3}
                  />
                </div>
                <div className="playground-head-section">
                  <div className="playground-head-section-title"><Image size={11} /> Favicon URL</div>
                  <input
                    value={headConfig.favicon || ''}
                    onChange={e => setHeadConfig(prev => ({ ...prev, favicon: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                    className="playground-find-input"
                    style={{ padding: '0.375rem 0.625rem', borderRadius: '0.375rem', background: 'color-mix(in oklch, var(--color-base-content) 4%, transparent)', border: '1px solid color-mix(in oklch, var(--color-base-content) 7%, transparent)', width: '100%', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Workspace ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className={`playground-workspace ${isVertical ? 'vertical' : ''}`}>
        {/* Editor panel */}
        <div className={`playground-panel-editor ${showPreview ? '' : 'full'}`}>
          {/* Tab bar */}
          <div className="playground-tabbar">
            <div className="flex items-center flex-1">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`playground-tab ${isActive ? 'active' : ''}`}>
                    <span className="playground-tab-dot" style={{ background: tab.color, boxShadow: isActive ? `0 0 8px ${tab.color}60` : 'none', opacity: isActive ? 1 : 0.3 }} />
                    {tab.label}
                    {tab.lines > 0 && <span className={`playground-tab-count ${isActive ? 'active' : ''}`}>{tab.lines}</span>}
                    {isActive && (
                      <motion.div layoutId="playground-tab-indicator" className="playground-tab-line" style={{ background: tab.color }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="playground-tabbar-right">
              <button onClick={() => copyToClipboard(currentCode)} className="playground-tabbar-action" title="Copy code">
                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              </button>
              {currentCode.length > 0 && <span className="playground-tabbar-meta">{currentCode.split('\n').length} ln</span>}
            </div>
          </div>

          {/* Find & Replace */}
          <AnimatePresence>
            {showFindReplace && <FindReplacePanel code={currentCode} onReplace={handleFindReplace} onClose={() => setShowFindReplace(false)} />}
          </AnimatePresence>

          {/* Editor area */}
          {splitView ? (
            <div className="playground-split-editor">
              <div className="playground-split-pane">
                <div className="playground-split-pane-header">
                  <span className="playground-split-pane-dot" style={{ background: '#e34c26' }} />
                  <span className="playground-split-pane-label">HTML</span>
                  <span className="playground-split-pane-lines">{html.split('\n').filter(Boolean).length} ln</span>
                </div>
                <div className="playground-split-pane-body">
                  <CodeMirrorEditor value={html} onChange={setHtmlTracked} language="html" placeholder="HTML..." wordWrap={wordWrap} onCursorChange={activeTab === 'html' ? setCursorPos : undefined} fontSize={editorFontSize} />
                </div>
              </div>
              <div className="playground-split-pane">
                <div className="playground-split-pane-header">
                  <span className="playground-split-pane-dot" style={{ background: '#2965f1' }} />
                  <span className="playground-split-pane-label">CSS</span>
                  <span className="playground-split-pane-lines">{css.split('\n').filter(Boolean).length} ln</span>
                </div>
                <div className="playground-split-pane-body">
                  <CodeMirrorEditor value={css} onChange={setCssTracked} language="css" placeholder="CSS..." wordWrap={wordWrap} onCursorChange={activeTab === 'css' ? setCursorPos : undefined} fontSize={editorFontSize} />
                </div>
              </div>
              <div className="playground-split-pane">
                <div className="playground-split-pane-header">
                  <span className="playground-split-pane-dot" style={{ background: '#f0db4f' }} />
                  <span className="playground-split-pane-label">JS</span>
                  <span className="playground-split-pane-lines">{js.split('\n').filter(Boolean).length} ln</span>
                </div>
                <div className="playground-split-pane-body">
                  <CodeMirrorEditor value={js} onChange={setJsTracked} language="js" placeholder="JavaScript..." wordWrap={wordWrap} onCursorChange={activeTab === 'js' ? setCursorPos : undefined} fontSize={editorFontSize} />
                </div>
              </div>
            </div>
          ) : (
            <div className={`playground-editor-body ${isVertical ? 'stacked' : ''}`}>
              <CodeMirrorEditor
                value={currentCode}
                onChange={setCurrentCode}
                language={activeTab}
                placeholder={activeTab === 'html' ? 'Start typing HTML... (try typing < for tag suggestions)' : activeTab === 'css' ? 'Start typing CSS... (try typing a property name)' : 'Start typing JavaScript... (try clg → console.log)'}
                wordWrap={wordWrap}
                onCursorChange={setCursorPos}
                fontSize={editorFontSize}
              />
            </div>
          )}

          {/* Status bar */}
          <div className="playground-statusbar">
            <div className="flex items-center gap-3">
              <span className="playground-statusbar-item">
                <span className="playground-statusbar-lang" style={{ '--lang-color': activeTab === 'html' ? '#e34c26' : activeTab === 'css' ? '#2965f1' : '#f0db4f' }}>
                  {activeTab.toUpperCase()}
                </span>
              </span>
              <span className="playground-statusbar-item">Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span className="playground-statusbar-item">{currentCode.length} chars</span>
              {wordWrap && <span className="playground-statusbar-item playground-statusbar-active">Wrap</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className="playground-statusbar-item playground-statusbar-stats">
                <Gauge size={9} />
                {codeStats.lines} lines · {codeStats.words} words · {codeStats.chars > 1024 ? (codeStats.chars / 1024).toFixed(1) + ' KB' : codeStats.chars + ' B'}
              </span>
              {lastSaved && (
                <span className="playground-statusbar-item playground-statusbar-saved">
                  <Save size={9} />{lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <span className="playground-statusbar-item">
                {autoRun
                  ? <span className="playground-statusbar-active">● Auto</span>
                  : <span style={{ opacity: 0.35 }}>○ Manual</span>}
              </span>
              <span className="playground-statusbar-item">UTF-8</span>
              <span className="playground-statusbar-item">Spaces: 2</span>
            </div>
          </div>

          {/* Console */}
          <AnimatePresence>
            {showConsole && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
                <ConsolePanel entries={consoleOutput} onClear={() => setConsoleOutput([])} onClose={() => setShowConsole(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className={`playground-panel-preview ${isVertical ? 'stacked' : ''}`}>
            <div className="playground-preview-header">
              <div className="flex items-center gap-2.5">
                <div className="playground-traffic-lights">
                  <span className="playground-tl-red" />
                  <span className="playground-tl-yellow" />
                  <span className="playground-tl-green" />
                </div>
                <div className="playground-url-bar">
                  <FileCode size={10} className="flex-shrink-0 opacity-50" />
                  <span>playground://preview</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {enabledCdns.length > 0 && (
                  <span className="playground-preview-cdn-badge" title={enabledCdns.join(', ')}>
                    <Library size={9} /> {enabledCdns.length}
                  </span>
                )}
                <button onClick={handleScreenshot} className={`playground-preview-btn ${screenshotting ? 'playground-formatting' : ''}`} title="Print / Screenshot preview"><Camera size={12} /></button>
                <button onClick={runPreview} className="playground-preview-btn" title="Refresh"><RotateCcw size={12} /></button>
                <button onClick={() => { const w = window.open('', '_blank'); w.document.write(previewHTML); w.document.close(); }} className="playground-preview-btn" title="Open in new window"><ExternalLink size={12} /></button>
              </div>
            </div>
            <div className="playground-preview-body" style={{ background: previewBg }}>
              {!html && !css && !js ? (
                <div className="playground-empty">
                  <div className="playground-empty-icon"><SquareCode size={26} /></div>
                  <p className="playground-empty-title">Start coding or pick a template</p>
                  <p className="playground-empty-desc">
                    Powered by CodeMirror 6 — syntax highlighting, autocomplete, bracket matching,
                    code folding, snippets, CDN injection, Emmet expansion, split editor, shareable URLs,
                    Google Fonts, layout templates & live preview
                  </p>
                  <div className="playground-empty-hints">
                    <span><kbd>Tab</kbd> Accept suggestion</span>
                    <span><kbd>Ctrl+Space</kbd> Force autocomplete</span>
                    <span><kbd>Ctrl /</kbd> Toggle comment</span>
                    <span><kbd>Ctrl F</kbd> Find & Replace</span>
                    <span><kbd>div.</kbd> div with class</span>
                    <span><kbd>clg</kbd> console.log</span>
                    <span><kbd>Emmet</kbd> ul&gt;li*5</span>
                    <span><kbd>Split</kbd> 3-pane editor</span>
                  </div>
                </div>
              ) : !html && !css && js ? (
                /* JS-only mode: hidden iframe for execution + visible inline console for output */
                <div style={{ width: viewportWidth, maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} className="transition-all duration-300 mx-auto">
                  <iframe
                    ref={iframeRef}
                    key={previewKey}
                    src={previewBlobUrl}
                    className="w-full border-0"
                    style={{ height: 0, minHeight: 0, flex: 'none' }}
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    title="Preview"
                  />
                  <div className="playground-js-console-inline">
                    <div className="playground-js-console-inline-header">
                      <Terminal size={11} className="opacity-50" />
                      <span>Console Output</span>
                      {consoleOutput.length > 0 && <span className="playground-console-count">{consoleOutput.length}</span>}
                      {consoleOutput.length > 0 && (
                        <button onClick={() => setConsoleOutput([])} className="playground-console-btn ml-auto"><Eraser size={10} /> Clear</button>
                      )}
                    </div>
                    <div className="playground-js-console-inline-body scrollbar-thin">
                      {consoleOutput.length === 0 ? (
                        <div className="playground-console-empty">Waiting for output… use console.log() in your JS</div>
                      ) : (
                        consoleOutput.map((entry, i) => {
                          const cfg = { error: { cls: 'playground-console-error', icon: <AlertTriangle size={10} /> }, warn: { cls: 'playground-console-warn', icon: <AlertTriangle size={10} /> }, info: { cls: 'playground-console-info', icon: <Info size={10} /> }, log: { cls: 'playground-console-log', icon: <ChevronDown size={10} /> } };
                          const c = cfg[entry.level] || cfg.log;
                          return (
                            <div key={i} className={`playground-console-entry ${c.cls}`}>
                              <span className="playground-console-icon">{c.icon}</span>
                              <span className="playground-console-time">{entry.time}</span>
                              <pre className="playground-console-msg">{entry.args.join(' ')}</pre>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ width: viewportWidth, maxWidth: '100%', height: '100%' }} className="transition-all duration-300 mx-auto">
                  <iframe
                    ref={iframeRef}
                    key={previewKey}
                    src={previewBlobUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    title="Preview"
                  />
                </div>
              )}
            </div>
            {viewport !== 'full' && (
              <div className="playground-preview-footer">
                <Monitor size={9} className="opacity-40" />
                {viewportWidth} × 100%
              </div>
            )}
          </div>
        )}
      </motion.div>

      

      {/* ── Keyboard Shortcuts Modal ── */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowShortcuts(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-md mx-4 playground-shortcuts-modal">
                <div className="playground-shortcuts-modal-header">
                  <div className="flex items-center gap-2.5">
                    <Keyboard size={16} className="text-primary" />
                    <span className="font-bold text-sm">Keyboard Shortcuts</span>
                  </div>
                  <button onClick={() => setShowShortcuts(false)} className="playground-preview-btn"><X size={14} /></button>
                </div>
                <div className="playground-shortcuts-modal-body">
                  {[
                    { category: 'Editor (CodeMirror)', shortcuts: [
                      { key: 'Tab', desc: 'Indent / Accept autocomplete' },
                      { key: 'Shift+Tab', desc: 'Outdent selection' },
                      { key: 'Ctrl+/', desc: 'Toggle line comment' },
                      { key: 'Ctrl+F', desc: 'Find & Replace (built-in)' },
                      { key: 'Ctrl+H', desc: 'Find & Replace with replace' },
                      { key: 'Ctrl+Z', desc: 'Undo' },
                      { key: 'Ctrl+Shift+Z / Ctrl+Y', desc: 'Redo' },
                      { key: '↑↓', desc: 'Navigate autocomplete' },
                      { key: 'Ctrl+D', desc: 'Select next occurrence' },
                      { key: 'Esc', desc: 'Close panels / autocomplete' },
                    ]},
                    { category: 'Code Intelligence', shortcuts: [
                      { key: 'Type to trigger', desc: 'Context-aware autocomplete' },
                      { key: '< (in HTML)', desc: 'HTML tag suggestions' },
                      { key: '. (after object)', desc: 'Property/method suggestions' },
                      { key: 'Snippets: clg, qs, ael', desc: 'JS shorthand snippets' },
                      { key: 'div. / div#', desc: 'Div with class / id' },
                      { key: 'Ctrl+Space', desc: 'Force autocomplete menu' },
                    ]},
                    { category: 'Brackets & Folding', shortcuts: [
                      { key: '( [ { " \'', desc: 'Auto-close brackets & quotes' },
                      { key: 'Select + bracket', desc: 'Wrap selection in brackets' },
                      { key: 'Click ▸ in gutter', desc: 'Fold / unfold code block' },
                      { key: 'Bracket highlight', desc: 'Matching brackets glow' },
                    ]},
                    { category: 'Playground', shortcuts: [
                      { key: 'Run button', desc: 'Execute & refresh preview' },
                      { key: 'Auto toggle', desc: 'Live preview on keystroke' },
                      { key: '+/- buttons', desc: 'Editor font size' },
                      { key: 'Split button', desc: 'Toggle 3-pane split editor' },
                      { key: 'Emmet bar', desc: 'Expand Emmet abbreviations' },
                      { key: 'Share button', desc: 'Copy shareable URL' },
                      { key: 'Layouts menu', desc: 'Pre-built layout templates' },
                      { key: 'Assets panel', desc: 'Quick image/font/color insertion' },
                      { key: 'Head config', desc: 'Google Fonts, meta, favicon' },
                    ]},
                  ].map(group => (
                    <div key={group.category} className="playground-shortcuts-group">
                      <div className="playground-shortcuts-category">{group.category}</div>
                      {group.shortcuts.map(s => (
                        <div key={s.key} className="playground-shortcuts-row">
                          <span className="playground-shortcuts-desc">{s.desc}</span>
                          <kbd className="playground-shortcuts-key">{s.key}</kbd>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
