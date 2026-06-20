const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ===== NUMBER COUNTER ANIMATION =====
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
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

// Intersection Observer for counter
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  });
  observer.observe(heroStats);
}

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
              : '🎓'}
          </div>
          <div class="course-body">
            <span class="course-type-badge badge-${course.type}">
              ${course.type === 'recorded' ? 'রেকর্ড কোর্স'
                : course.type === 'live' ? '🔴 লাইভ কোর্স'
                : '✨ ফ্রি'}
            </span>
            <h3 class="course-title">${course.title}</h3>
            <p style="font-size:13px;color:var(--gray-500);margin-top:6px;">
              ${course.description.substring(0, 80)}...
            </p>
            <div class="course-meta">
              <span class="course-price ${course.price === 0 ? 'free' : ''}">
                ${course.price === 0 ? 'ফ্রি' : '৳' + course.price}
              </span>
              <span class="course-enrolled">
                ${course.totalEnrolled} জন শিক্ষার্থী
              </span>
            </div>
            <a href="course-details.html?id=${course._id}"
               class="btn btn-primary btn-full" style="margin-top:16px;">
              বিস্তারিত দেখুন
            </a>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `
        <div class="loading-spinner">
          <p>এখনো কোনো কোর্স যোগ করা হয়নি।</p>
        </div>`;
    }
  } catch (err) {
    container.innerHTML = `
      <div class="loading-spinner">
        <p>কোর্স লোড করতে সমস্যা হচ্ছে।</p>
      </div>`;
  }
};

loadPopularCourses();

// ===== SHOW ALERT =====
const showAlert = (message, type = 'success', containerId = 'alertBox') => {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = `
    <div class="alert alert-${type}">
      ${type === 'success' ? '✅' : '❌'} ${message}
    </div>`;
  setTimeout(() => { box.innerHTML = ''; }, 4000);
};

window.showAlert = showAlert;