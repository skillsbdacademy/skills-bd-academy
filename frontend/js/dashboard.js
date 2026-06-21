requireAuth();

const user = getUser();
let userData = null;

// ===== INIT =====
const init = async () => {
  if (user) {
    const initial = user.name.charAt(0).toUpperCase();
    document.getElementById('sidebarAvatar').textContent = initial;
    document.getElementById('sidebarName').textContent = user.name;
    document.getElementById('topAvatar').textContent = initial;
    document.getElementById('topUserName').textContent = user.name;
    document.getElementById('topbarName').textContent = user.name;
    document.getElementById('profileNameInput').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileAvatar').textContent = initial;
  }
  await loadDashboardData();
};

// ===== LOAD DATA =====
const loadDashboardData = async () => {
  try {
    const data = await apiCall('/auth/me');
    if (data.success) {
      userData = data.user;
      renderOverview();
      renderMyCourses();
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
};

// ===== OVERVIEW =====
const renderOverview = () => {
  const courses = userData.enrolledCourses || [];
  const completed = courses.filter(c => c.progress >= 100).length;
  const active = courses.filter(c => c.progress > 0 && c.progress < 100).length;

  document.getElementById('totalCourses').textContent = courses.length;
  document.getElementById('activeCourses').textContent = active;
  document.getElementById('completedCourses').textContent = completed;
  document.getElementById('coursesBadge').textContent = courses.length;

  const container = document.getElementById('enrolledCoursesList');
  if (courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book"></i>
        <p>এখনো কোনো কোর্সে ভর্তি হননি</p>
        <a href="/courses.html" class="btn btn-primary">কোর্স দেখুন</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="courses-grid-dash">
      ${courses.slice(0, 3).map(e => `
        <div class="dash-course-card">
          <div class="dash-course-thumb">
            ${e.course?.thumbnail
              ? `<img src="${e.course.thumbnail}" alt="">`
              : '🎓'}
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${e.progress || 0}%"></div>
            </div>
          </div>
          <div class="dash-course-body">
            <h3>${e.course?.title || 'কোর্স'}</h3>
            <div class="progress-info">
              <span>প্রগ্রেস: ${e.progress || 0}%</span>
              <span class="course-type-badge badge-${e.course?.type}" style="font-size:11px;padding:3px 8px">
                ${e.course?.type === 'recorded' ? 'রেকর্ড'
                  : e.course?.type === 'live' ? 'লাইভ' : 'ফ্রি'}
              </span>
            </div>
            <a href="/learn.html?id=${e.course?._id}"
               class="btn btn-primary btn-full btn-sm">
              <i class="fas fa-play"></i> শেখা শুরু করুন
            </a>
          </div>
        </div>
      `).join('')}
    </div>`;
};

// ===== MY COURSES =====
const renderMyCourses = () => {
  const courses = userData.enrolledCourses || [];
  const container = document.getElementById('myCoursesGrid');

  if (courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <i class="fas fa-graduation-cap"></i>
        <p>এখনো কোনো কোর্সে ভর্তি হননি</p>
        <a href="/courses.html" class="btn btn-primary">কোর্স কিনুন</a>
      </div>`;
    return;
  }

  container.innerHTML = courses.map(e => `
    <div class="dash-course-card">
      <div class="dash-course-thumb">
        ${e.course?.thumbnail
          ? `<img src="${e.course.thumbnail}" alt="">`
          : '🎓'}
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${e.progress || 0}%"></div>
        </div>
      </div>
      <div class="dash-course-body">
        <h3>${e.course?.title || 'কোর্স'}</h3>
        <div class="progress-info">
          <span>প্রগ্রেস: ${e.progress || 0}%</span>
          <span>${new Date(e.enrolledAt).toLocaleDateString('bn-BD')}</span>
        </div>
        <a href="/learn.html?id=${e.course?._id}"
           class="btn btn-primary btn-full btn-sm">
          <i class="fas fa-play"></i> শেখা শুরু করুন
        </a>
      </div>
    </div>
  `).join('');
};

// ===== PAYMENTS =====
const loadPayments = async () => {
  const container = document.getElementById('paymentsList');
  container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> লোড হচ্ছে...</div>';

  const data = await apiCall('/payments/my');

  if (!data.success || data.payments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>কোনো পেমেন্ট নেই</p>
      </div>`;
    document.getElementById('pendingPayments').textContent = '০';

    const recentContainer = document.getElementById('recentPayments');
    if (recentContainer) {
      recentContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>কোনো পেমেন্ট নেই</p>
        </div>`;
    }
    return;
  }

  const pending = data.payments.filter(p => p.status === 'pending').length;
  document.getElementById('pendingPayments').textContent = pending;

  const recentContainer = document.getElementById('recentPayments');
  if (recentContainer) {
    recentContainer.innerHTML = buildPaymentTable(data.payments.slice(0, 3));
  }

  container.innerHTML = buildPaymentTable(data.payments);
};

const buildPaymentTable = (payments) => `
  <div style="overflow-x:auto">
    <table class="payment-table">
      <thead>
        <tr>
          <th>কোর্স</th>
          <th>পরিমাণ</th>
          <th>মাধ্যম</th>
          <th>ট্রানজেকশন</th>
          <th>তারিখ</th>
          <th>অবস্থা</th>
        </tr>
      </thead>
      <tbody>
        ${payments.map(p => `
          <tr>
            <td><strong>${p.course?.title || 'কোর্স'}</strong></td>
            <td style="font-weight:700;color:var(--primary)">৳${p.amount}</td>
            <td>${p.method === 'bkash' ? '📱 bKash' : '📱 Nagad'}</td>
            <td><code style="background:var(--gray-100);padding:2px 8px;border-radius:6px;font-size:12px">${p.transactionId}</code></td>
            <td>${new Date(p.createdAt).toLocaleDateString('bn-BD')}</td>
            <td>
              <span class="status-badge status-${p.status}">
                ${p.status === 'pending' ? '⏳ অপেক্ষমান'
                  : p.status === 'approved' ? '✅ অনুমোদিত'
                  : '❌ বাতিল'}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;

// ===== PROFILE FORM =====
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('profileNameInput').value;
  const phone = document.getElementById('profilePhone').value;

  const data = await apiCall('/auth/update-profile', 'PUT', { name, phone });
  if (data.success) {
    const updatedUser = { ...getUser(), name, phone };
    localStorage.setItem('skillsbd_user', JSON.stringify(updatedUser));
    showAlert('✅ প্রোফাইল আপডেট হয়েছে', 'success', 'profileAlertBox');
    document.getElementById('profileName').textContent = name;
    document.getElementById('topUserName').textContent = name;
    document.getElementById('sidebarName').textContent = name;
  } else {
    showAlert(data.message, 'error', 'profileAlertBox');
  }
});

// ===== PASSWORD FORM =====
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  if (newPassword !== confirmNewPassword) {
    showAlert('নতুন পাসওয়ার্ড মিলছে না', 'error', 'passwordAlertBox');
    return;
  }

  if (newPassword.length < 6) {
    showAlert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে', 'error', 'passwordAlertBox');
    return;
  }

  const data = await apiCall('/auth/change-password', 'PUT', { oldPassword, newPassword });
  if (data.success) {
    showAlert('✅ পাসওয়ার্ড পরিবর্তন হয়েছে', 'success', 'passwordAlertBox');
    document.getElementById('passwordForm').reset();
  } else {
    showAlert(data.message, 'error', 'passwordAlertBox');
  }
});

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.getAttribute('data-page');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    if (page === 'payments') loadPayments();

    // Mobile sidebar বন্ধ
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  });
});

// ===== SIDEBAR TOGGLE =====
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
});

document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
});

// ===== START =====
init();
loadPayments();