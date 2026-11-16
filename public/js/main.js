// main.js - School website interactions

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initBackToTop();
  loadAnnouncements();
  loadGallery();
  initStats();
  initContactForm();
  initSmoothScroll();
  initFacilityModal();
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

// ── FACILITY POPUP MODAL ──────────────────────────
const facilityData = {
  'library': {
    icon: 'fas fa-book-reader',
    img: '/images/facilities/library.jpg',
    title_en: 'Well-Equipped Library',
    title_kn: 'ಸಮೃದ್ಧ ಗ್ರಂಥಾಲಯ',
    title_hi: 'सुसज्जित पुस्तकालय',
    desc_en: 'Our modern school library houses thousands of curriculum books, storybooks, periodicals, and reference guides, fostering reading habits and intellectual curiosity in students.',
    desc_kn: 'ವಿದ್ಯಾರ್ಥಿಗಳಲ್ಲಿ ಓದುವ ಅಭಿರುಚಿ ಮತ್ತು ಜ್ಞಾನದಾಹವನ್ನು ಹೆಚ್ಚಿಸಲು ಕಥಾಪುಸ್ತಕಗಳು, ಉಲ್ಲೇಖ ಗ್ರಂಥಗಳು ಮತ್ತು ನಿಯತಕಾಲಿಕೆಗಳನ್ನೊಳಗೊಂಡ ಸಮೃದ್ಧ ಗ್ರಂಥಾಲಯ.',
    desc_hi: 'छात्रों में अध्ययन की आदत और जिज्ञासा बढ़ाने के लिए विविध ज्ञानवर्धक पुस्तकों, संदर्भ ग्रंथों और पत्रिकाओं से युक्त पुस्तकालय।'
  },
  'science-lab': {
    icon: 'fas fa-flask',
    img: '/images/facilities/science-lab.jpg',
    title_en: 'Science Laboratory',
    title_kn: 'ವಿಜ್ಞಾನ ಪ್ರಯೋಗಾಲಯ',
    title_hi: 'विज्ञान प्रयोगशाला',
    desc_en: 'Fully equipped science lab with hands-on experiment stations, microscopes, and apparatus to cultivate scientific temper and experiential learning.',
    desc_kn: 'ವೈಜ್ಞಾನಿಕ ಚಿಂತನೆ, ಪ್ರಯೋಗಶೀಲತೆ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಕಲಿಕೆಗೆ ಪೂರಕವಾದ ಆಧುನಿಕ ಮತ್ತು ಸುರಕ್ಷಿತ ವಿಜ್ಞಾನ ಪ್ರಯೋಗಾಲಯ.',
    desc_hi: 'प्रायोगिक और अनुभवात्मक अधिगम को प्रोत्साहित करने वाली सभी आवश्यक उपकरणों से सुसज्जित विज्ञान प्रयोगशाला।'
  },
  'computer-lab': {
    icon: 'fas fa-desktop',
    img: '/images/facilities/computer-lab.jpg',
    title_en: 'Computer Laboratory',
    title_kn: 'ಕಂಪ್ಯೂಟರ್ ಪ್ರಯೋಗಾಲಯ',
    title_hi: 'कंप्यूटर प्रयोगशाला',
    desc_en: 'Air-conditioned modern computer lab with updated computers and guided learning, providing digital literacy and IT skills from an early age.',
    desc_kn: 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಡಿಜಿಟಲ್ ಯುಗದ ಶಿಕ್ಷಣ, ಕಂಪ್ಯೂಟರ್ ಕೌಶಲ್ಯ ಮತ್ತು ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ ಕಲಿಸಲು ಸುಸಜ್ಜಿತ ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್.',
    desc_hi: 'विद्यार्थियों को डिजिटल साक्षरता और कंप्यूटर दक्षता प्रदान करने हेतु आधुनिक तकनीकों से युक्त कंप्यूटर लैब।'
  },
  'yoga-room': {
    icon: 'fas fa-spa',
    img: '/images/facilities/yoga-room.jpg',
    title_en: 'Yoga & Meditation Hall',
    title_kn: 'ಯೋಗ ಮತ್ತು ಧ್ಯಾನ ಕೊಠಡಿ',
    title_hi: 'योग एवं ध्यान कक्ष',
    desc_en: 'A serene and tranquil hall dedicated to daily Yoga, Pranayama, and Sharana Sanskriti value-based meditation for mental concentration and physical wellness.',
    desc_kn: 'ವಿದ್ಯಾರ್ಥಿಗಳ ಮಾನಸಿಕ ಶಾಂತಿ, ಏಕಾಗ್ರತೆ ಮತ್ತು ದೈಹಿಕ ಸದೃಢತೆಗಾಗಿ ಶರಣ ಸಂಸ್ಕೃತಿ ಆಧಾರಿತ ಪ್ರಶಾಂತ ಯೋಗ ಮತ್ತು ಧ್ಯಾನ ಕೇಂದ್ರ.',
    desc_hi: 'छात्रों की एकाग्रता, मानसिक शांति और समग्र शारीरिक विकास के लिए समर्पित शांत योग और ध्यान केंद्र।'
  },
  'playground': {
    icon: 'fas fa-running',
    img: '/images/facilities/playground.jpg',
    title_en: 'Spacious Playground & Sports',
    title_kn: 'ಆಟದ ಮೈದಾನ & ಕ್ರೀಡೆ',
    title_hi: 'खेल का मैदान एवं क्रीड़ा',
    desc_en: 'Spacious outdoor playground and sports facilities promoting physical fitness, team spirit, discipline, and healthy extracurricular engagement.',
    desc_kn: 'ಮಕ್ಕಳ ದೈಹಿಕ ಬೆಳವಣಿಗೆ, ಕ್ರೀಡಾ ಸ್ಫೂರ್ತಿ, ಶಿಸ್ತು ಮತ್ತು ಉತ್ಸಾಹಭರಿತ ಆಟಗಳಿಗಾಗಿ ವಿಶಾಲವಾದ ಆಟದ ಮೈದಾನ.',
    desc_hi: 'छात्रों के शारीरिक स्वास्थ्य, खेल भावना और अनुशासन को निखारने के लिए विशाल खेल का मैदान।'
  },
  'review-room': {
    icon: 'fas fa-chart-line',
    img: '/images/facilities/review-room.jpg',
    title_en: 'Periodical Review & Mentorship',
    title_kn: 'ನಿಯತಕಾಲಿಕ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಸಮಾಲೋಚನೆ',
    title_hi: 'नियमित समीक्षा एवं मार्गदर्शन कक्ष',
    desc_en: 'Dedicated center for continuous evaluation, individualized student mentorship, and constructive parent-teacher developmental reviews.',
    desc_kn: 'ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿಯ ಸಮಗ್ರ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿಯ ನಿರಂತರ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಶಿಕ್ಷಕ-ಪಾಲಕರ ನಿಯಮಿತ ಮಾರ್ಗದರ್ಶನ ಸಮಾಲೋಚನೆ.',
    desc_hi: 'हर बच्चे की शैक्षणिक प्रगति की नियमित निगरानी तथा शिक्षक-अभिभावक परामर्श के लिए विशेष केंद्र।'
  }
};

function initFacilityModal() {
  const modal = document.getElementById('facilityModal');
  const backdrop = document.getElementById('facilityModalBackdrop');
  const closeBtn = document.getElementById('facilityModalClose');

  if (!modal) return;

  // Bind clicks on all facility cards
  document.querySelectorAll('.facility-card[data-facility]').forEach(card => {
    card.addEventListener('click', () => {
      const facilityKey = card.getAttribute('data-facility');
      openFacilityModal(facilityKey);
    });

    // Keyboard accessibility (Enter or Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const facilityKey = card.getAttribute('data-facility');
        openFacilityModal(facilityKey);
      }
    });
  });

  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', closeFacilityModal);
  if (backdrop) backdrop.addEventListener('click', closeFacilityModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeFacilityModal();
    }
  });
}

function openFacilityModal(facilityKey) {
  const data = facilityData[facilityKey];
  if (!data) return;

  const lang = localStorage.getItem('school_lang') || 'en';
  const modal = document.getElementById('facilityModal');
  const titleEl = document.getElementById('facilityModalTitle');
  const iconEl = document.getElementById('facilityModalIcon');
  const imgEl = document.getElementById('facilityModalImg');
  const spinner = document.getElementById('facilityModalSpinner');
  const descEl = document.getElementById('facilityModalDesc');

  if (!modal || !titleEl || !imgEl) return;

  titleEl.textContent = data[`title_${lang}`] || data.title_en;
  if (iconEl) iconEl.innerHTML = `<i class="${data.icon}"></i>`;
  if (descEl) descEl.textContent = data[`desc_${lang}`] || data.desc_en;

  if (spinner) spinner.classList.add('active');
  imgEl.style.opacity = '0';

  imgEl.onload = () => {
    if (spinner) spinner.classList.remove('active');
    imgEl.style.opacity = '1';
  };

  imgEl.onerror = () => {
    if (spinner) spinner.classList.remove('active');
    imgEl.src = '/images/school-building.jpg';
    imgEl.style.opacity = '1';
  };

  imgEl.src = data.img;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFacilityModal() {
  const modal = document.getElementById('facilityModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ── HELPERS ───────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
