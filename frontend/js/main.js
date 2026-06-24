// ===== API URL =====
const API = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : window.location.origin + '/api';

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.remove('transparent');
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.add('transparent');
    navbar.classList.remove('scrolled');
  }
});

// ===== COUNTER =====
const startCounters = () => {
  const counters = document.querySelectorAll('[data-target]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    if (!target) return;
    counter.textContent = '0';
    let current = 0;
    const increment = Math.ceil(target / 80);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = current;
      }
    }, 20);
  });
};

window.addEventListener('load', () => setTimeout(startCounters, 500));
document.addEventListener('DOMContentLoaded', () => setTimeout(startCounters, 1000));

// ===== LOAD POPULAR COURSES =====
const loadPopularCourses = async () => {
  const container = document.getElementById('popularCourses');
  if (!container) return;

  container.innerHTML = `
    <div class="loading-spinner" style="grid-column:1/-1">
      <i class="fas fa-spinner fa-spin" style="color:var(--primary)"></i>
      <p style="margin-top:16px">লোড হচ্ছে...</p>
    </div>`;

  try {
    const apiUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api/courses'
      : '/api/courses';

    const res = await fetch(apiUrl);

    if (!res.ok) throw new Error(`Status: ${res.status}`);

    const data = await res.json();

    if (data.success && data.courses && data.courses.length > 0) {
      const courses = data.courses.filter(c => c.isPublished).slice(0, 3);

      if (courses.length === 0) {
        container.innerHTML = `
          <div class="loading-spinner" style="grid-column:1/-1">
            <i class="fas fa-book-open" style="color:var(--primary)"></i>
            <p style="margin-top:16px">শীঘ্রই কোর্স যোগ করা হবে</p>
          </div>`;
        return;
      }

      container.innerHTML = courses.map(course => `
        <div class="course-card" style="opacity:1;transform:none">
          <div class="course-thumbnail">
            ${course.thumbnail
              ? `<img src="${course.thumbnail}" alt="${course.title}">`
              : course.type === 'recorded' ? '🎬'
              : course.type === 'live' ? '📡' : '🎁'}
            <div class="course-thumbnail-overlay">
              <div class="play-btn"><i class="fas fa-play"></i></div>
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

    } else {
      container.innerHTML = `
        <div class="loading-spinner" style="grid-column:1/-1">
          <i class="fas fa-book-open" style="color:var(--primary)"></i>
          <p style="margin-top:16px">শীঘ্রই কোর্স যোগ করা হবে</p>
        </div>`;
    }
  } catch (err) {
    console.error('Course load error:', err);
    container.innerHTML = `
      <div class="loading-spinner" style="grid-column:1/-1">
        <i class="fas fa-exclamation-circle" style="color:var(--danger)"></i>
        <p style="margin-top:16px">কোর্স লোড করতে সমস্যা হচ্ছে</p>
        <button onclick="loadPopularCourses()" class="btn btn-outline btn-sm" style="margin-top:12px">
          আবার চেষ্টা করুন
        </button>
      </div>`;
  }
};

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
document.addEventListener('DOMContentLoaded', () => {
  loadPopularCourses();
});