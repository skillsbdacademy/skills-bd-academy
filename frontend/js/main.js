const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.remove('transparent');
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.add('transparent');
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ===== COUNTER ANIMATION =====
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    if (!target) return;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 16);
  });
};

// Counter - সরাসরি চালু করুন
setTimeout(() => {
  animateCounters();
}, 1000);
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(heroStats);
}

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = () => {
  const elements = document.querySelectorAll(
    '.feature-card, .type-card, .course-card, .testimonial-card'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
};

// ===== LOAD POPULAR COURSES =====
const loadPopularCourses = async () => {
  const container = document.getElementById('popularCourses');
  if (!container) return;

  try {
    const res = await fetch(`${API}/courses`);
    const data = await res.json();

    if (data.success && data.courses.length > 0) {
      const courses = data.courses.slice(0, 3);
      container.innerHTML = courses.map(course => `
        <div class="course-card">
          <div class="course-thumbnail">
            ${course.thumbnail
              ? `<img src="${course.thumbnail}" alt="${course.title}">`
              : getCourseEmoji(course.type)}
            <div class="course-thumbnail-overlay">
              <div class="play-btn">
                <i class="fas fa-play"></i>
              </div>
            </div>
          </div>
          <div class="course-body">
            <span class="course-type-badge badge-${course.type}">
              ${course.type === 'recorded' ? '📹 রেকর্ড কোর্স'
                : course.type === 'live' ? '🔴 লাইভ কোর্স'
                : '✨ ফ্রি'}
            </span>
            <h3 class="course-title">${course.title}</h3>
            <p class="course-instructor">
              <i class="fas fa-chalkboard-teacher"></i>
              ${course.instructor || 'Skills BD Academy'}
            </p>
            <div style="font-size:13px;color:var(--gray-400);display:flex;gap:16px;margin-bottom:4px">
              <span><i class="fas fa-video"></i> ${course.lessons?.length || 0} ক্লাস</span>
              <span><i class="fas fa-tag"></i> ${course.category || 'General'}</span>
            </div>
            <div class="course-meta">
              <span class="course-price ${course.price === 0 ? 'free' : ''}">
                ${course.price === 0 ? '✨ ফ্রি' : '৳' + course.price}
              </span>
              <span class="course-enrolled">
                <i class="fas fa-users"></i> ${course.totalEnrolled} জন
              </span>
            </div>
            <a href="/course-details.html?id=${course._id}"
               class="btn btn-primary btn-full" style="margin-top:16px">
              বিস্তারিত দেখুন <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `).join('');

      // Reveal animation
      setTimeout(revealElements, 100);
    } else {
      container.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-book-open" style="color:var(--primary)"></i>
          <p style="margin-top:16px">শীঘ্রই কোর্স যোগ করা হবে</p>
        </div>`;
    }
  } catch (err) {
    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-exclamation-circle" style="color:var(--danger)"></i>
        <p style="margin-top:16px">কোর্স লোড করতে সমস্যা হচ্ছে</p>
      </div>`;
  }
};

const getCourseEmoji = (type) => {
  if (type === 'recorded') return '🎬';
  if (type === 'live') return '📡';
  return '🎁';
};

// ===== SHOW ALERT =====
const showAlert = (message, type = 'success', containerId = 'alertBox') => {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      ${message}
    </div>`;
  setTimeout(() => { box.innerHTML = ''; }, 4000);
};

window.showAlert = showAlert;

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== INIT =====
loadPopularCourses();
setTimeout(revealElements, 500);