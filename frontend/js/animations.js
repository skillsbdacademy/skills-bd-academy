// ===== PAGE LOADER =====
const createPageLoader = () => {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.id = 'pageLoader';
  loader.innerHTML = `
    <div class="loader-content">
      <span class="loader-logo">🎓</span>
      <div class="loader-bar-wrap">
        <div class="loader-bar"></div>
      </div>
      <p class="loader-text">Skills BD Academy লোড হচ্ছে...</p>
    </div>`;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 800);
  });
};

// ===== SCROLL REVEAL =====
const initScrollReveal = () => {
  const elements = document.querySelectorAll(
    '.feature-card, .type-card, .course-card, .testimonial-card, ' +
    '.section-header, .stat-card, .contact-item, .footer-links'
  );

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
};

// ===== BUTTON RIPPLE =====
const initRipple = () => {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
};

// ===== TOAST NOTIFICATION =====
const createToastContainer = () => {
  if (document.getElementById('toastContainer')) return;
  const container = document.createElement('div');
  container.className = 'toast-container';
  container.id = 'toastContainer';
  document.body.appendChild(container);
};

const showToast = (message, type = 'success', title = '') => {
  createToastContainer();
  const container = document.getElementById('toastContainer');

  const icons = {
    success: 'fas fa-check',
    error: 'fas fa-times',
    info: 'fas fa-info',
    warning: 'fas fa-exclamation'
  };

  const titles = {
    success: title || 'সফল হয়েছে',
    error: title || 'সমস্যা হয়েছে',
    info: title || 'তথ্য',
    warning: title || 'সতর্কতা'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="${icons[type]}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.closest('.toast').remove()">
      <i class="fas fa-times"></i>
    </button>
    <div class="toast-progress"></div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.showToast = showToast;

// ===== SCROLL TO TOP =====
const initScrollTop = () => {
  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.title = 'উপরে যান';
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
};

// ===== SMOOTH HOVER FOR CARDS =====
const initCardHover = () => {
  const cards = document.querySelectorAll(
    '.feature-card, .course-card, .type-card, .testimonial-card, .stat-card'
  );

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};

// ===== CURSOR GLOW =====
const initCursorGlow = () => {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const animateCursor = () => {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    cursor.style.left = cursorX - 10 + 'px';
    cursor.style.top = cursorY - 10 + 'px';
    requestAnimationFrame(animateCursor);
  };

  animateCursor();
};

// ===== NAVBAR HIDE ON SCROLL DOWN =====
const initSmartNavbar = () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;

        if (currentScroll > lastScroll && currentScroll > 200) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });

  navbar.style.transition = 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease';
};

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  createPageLoader();
  initScrollReveal();
  initRipple();
  initScrollTop();
  initCursorGlow();

  // Card hover শুধু desktop এ
  if (window.innerWidth > 768) {
    initCardHover();
  }

  // Smart navbar শুধু homepage এ
  if (document.querySelector('.hero')) {
    initSmartNavbar();
  }
});
// ===== GLOBAL HAMBURGER FIX =====
const initHamburger = () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (!hamburger || !navLinks) return;

  // পুরনো listener মুছুন
  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);

  newHamburger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navLinks.classList.toggle('open');

    const icon = newHamburger.querySelector('i');
    if (navLinks.classList.contains('open')) {
      icon?.classList.remove('fa-bars');
      icon?.classList.add('fa-times');
    } else {
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    }
  });

  document.addEventListener('click', (e) => {
    if (!newHamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      const icon = newHamburger.querySelector('i');
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const icon = newHamburger.querySelector('i');
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    });
  });
};

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  createPageLoader();
  initScrollReveal();
  initRipple();
  initScrollTop();
  initCursorGlow();
  initHamburger();

  if (window.innerWidth > 768) {
    initCardHover();
  }

  if (document.querySelector('.hero')) {
    initSmartNavbar();
  }
});

// DOMContentLoaded এ init করুন
document.addEventListener('DOMContentLoaded', initHamburger);