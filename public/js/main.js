// main.js - School website interactions

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBackToTop();
  loadAnnouncements();
  loadGallery();
  initStats();
  initContactForm();
  initSmoothScroll();
});

// ── NAVBAR ──────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    // Active link highlighting
    highlightActiveNav();
  });
}

function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.style.background = '';
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.background = 'var(--primary)';
      link.style.color = '#fff';
    }
  });
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
}

// ── BACK TO TOP ───────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
}

// ── ANNOUNCEMENTS ─────────────────────────────────
async function loadAnnouncements() {
  const grid = document.getElementById('newsGrid');
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:#999;padding:30px;">No announcements yet. Check back soon!</p>';
      return;
    }

    const lang = localStorage.getItem('school_lang') || 'en';
    grid.innerHTML = data.data.map(item => {
      const title = item[`title_${lang}`] || item.title_en;
      const content = item[`content_${lang}`] || item.content_en;
      const date = new Date(item.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return `
        <div class="news-card">
          <span class="news-category">${item.category}</span>
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(content)}</p>
          <div class="news-date"><i class="fas fa-calendar-alt"></i> ${date}</div>
        </div>
      `;
    }).join('');
  } catch (e) {
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:30px;">Unable to load announcements.</p>';
  }
}

// ── GALLERY ───────────────────────────────────────
async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  try {
    const res = await fetch('/api/gallery');
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      grid.innerHTML = `
        <div class="gallery-placeholder">
          <i class="fas fa-images"></i>
          <p>Photos will appear here as the admin uploads them</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = data.data.map(item => `
      <div class="gallery-item">
        <img src="/images/gallery/${escapeHtml(item.filename)}" alt="${escapeHtml(item.title)}" loading="lazy">
      </div>
    `).join('');
  } catch (e) {
    console.error('Gallery load error:', e);
  }
}

// ── STATS COUNTER ─────────────────────────────────
function initStats() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 1500;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + '+';
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

// ── CONTACT FORM ───────────────────────────────────
function initContactForm() {
  const form = document.getElementById('inquiryForm');
  const messageDiv = document.getElementById('formMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const original = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      messageDiv.className = result.success
        ? 'form-message success'
        : 'form-message error';
      messageDiv.textContent = result.message;

      if (result.success) form.reset();
    } catch (e) {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Something went wrong. Please call us directly.';
    }

    submitBtn.textContent = original;
    submitBtn.disabled = false;
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// ── SMOOTH SCROLL ─────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── HELPERS ───────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
