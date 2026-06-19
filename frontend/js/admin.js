// Admin চেক
requireAdmin();

let allPayments = [];

// ===== INIT =====
const init = async () => {
  await loadDashboard();
  await loadCourses();
  await loadPayments();
  await loadStudents();
};

// ===== DASHBOARD =====
const loadDashboard = async () => {
  const data = await apiCall('/admin/dashboard');
  if (data.success) {
    document.getElementById('totalStudents').textContent = data.stats.totalStudents;
    document.getElementById('totalCourses').textContent = data.stats.totalCourses;
    document.getElementById('pendingPayments').textContent = data.stats.pendingPayments;
    document.getElementById('totalRevenue').textContent = '৳' + data.stats.totalRevenue;
    document.getElementById('pendingCount').textContent = data.stats.pendingPayments;
  }
};

// ===== COURSES =====
const loadCourses = async () => {
  const data = await apiCall('/admin/courses');
  const container = document.getElementById('coursesList');

  if (!data.success || data.courses.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><p>কোনো কোর্স নেই</p></div>`;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>কোর্সের নাম</th>
            <th>ধরন</th>
            <th>মূল্য</th>
            <th>ভর্তি</th>
            <th>ক্লাস</th>
            <th>প্রকাশিত</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          ${data.courses.map(c => `
            <tr>
              <td><strong>${c.title}</strong><br>
                <small style="color:var(--gray-400)">${c.category || ''}</small>
              </td>
              <td>
                <span class="course-type-badge badge-${c.type}">
                  ${c.type === 'recorded' ? 'রেকর্ড'
                    : c.type === 'live' ? 'লাইভ' : 'ফ্রি'}
                </span>
              </td>
              <td><strong>৳${c.price}</strong></td>
              <td>${c.totalEnrolled} জন</td>
              <td>${c.lessons?.length || 0} টি</td>
              <td>
                <span class="published-badge ${c.isPublished ? 'pub-yes' : 'pub-no'}">
                  ${c.isPublished ? '✅ হ্যাঁ' : '❌ না'}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-primary btn-sm"
                    onclick="openLessonModal('${c._id}', '${c.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-video"></i> ক্লাস
                  </button>
                  <button class="btn btn-outline btn-sm"
                    onclick="togglePublish('${c._id}', ${c.isPublished})">
                    ${c.isPublished ? 'আনপাবলিশ' : 'পাবলিশ'}
                  </button>
                  <button class="btn btn-danger btn-sm"
                    onclick="deleteCourse('${c._id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
};

// Course Type change হলে WhatsApp field দেখান
document.getElementById('courseType').addEventListener('change', function() {
  document.getElementById('whatsappGroup').style.display =
    this.value === 'live' ? 'block' : 'none';
});

// কোর্স যোগ করুন
document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const courseData = {
    title: document.getElementById('courseTitle').value,
    type: document.getElementById('courseType').value,
    price: Number(document.getElementById('coursePrice').value),
    category: document.getElementById('courseCategory').value,
    description: document.getElementById('courseDesc').value,
    whatsappLink: document.getElementById('whatsappLink').value,
    thumbnail: document.getElementById('courseThumbnail').value,
    isPublished: document.getElementById('coursePublished').checked
  };

  const data = await apiCall('/admin/courses', 'POST', courseData);

  if (data.success) {
    showAlert('✅ কোর্স তৈরি হয়েছে!', 'success', 'courseAlertBox');
    document.getElementById('addCourseForm').reset();
    document.getElementById('whatsappGroup').style.display = 'none';
    await loadCourses();
    await loadDashboard();
  } else {
    showAlert(data.message, 'error', 'courseAlertBox');
  }
});

// Publish Toggle
const togglePublish = async (id, current) => {
  const data = await apiCall(`/admin/courses/${id}`, 'PUT', { isPublished: !current });
  if (data.success) await loadCourses();
};

// কোর্স মুছুন
const deleteCourse = async (id) => {
  if (!confirm('এই কোর্সটি মুছে ফেলবেন?')) return;
  const data = await apiCall(`/admin/courses/${id}`, 'DELETE');
  if (data.success) {
    await loadCourses();
    await loadDashboard();
  }
};

// ===== LESSON MODAL =====
const openLessonModal = async (courseId, courseTitle) => {
  document.getElementById('lessonCourseId').value = courseId;
  document.getElementById('modalCourseTitle').textContent = `📹 ${courseTitle}`;
  document.getElementById('lessonModal').classList.add('open');
  await loadLessons(courseId);
};

const closeModal = () => {
  document.getElementById('lessonModal').classList.remove('open');
  document.getElementById('addLessonForm').reset();
};

const loadLessons = async (courseId) => {
  const data = await apiCall(`/admin/courses`);
  if (data.success) {
    const course = data.courses.find(c => c._id === courseId);
    const lessons = course?.lessons || [];
    const container = document.getElementById('existingLessons');

    if (lessons.length === 0) {
      container.innerHTML = `<p style="color:var(--gray-400);text-align:center">এখনো কোনো ক্লাস নেই</p>`;
      return;
    }

    container.innerHTML = `
      <h4 style="font-size:15px;font-weight:700;color:var(--gray-700);margin-bottom:12px">
        যোগ করা ক্লাসসমূহ (${lessons.length}টি)
      </h4>
      ${lessons.sort((a,b) => a.order - b.order).map((l, i) => `
        <div class="lesson-item">
          <div class="lesson-item-info">
            <div class="lesson-num">${i+1}</div>
            <div>
              <h4>${l.title}</h4>
              <p>${l.duration || ''}</p>
            </div>
          </div>
          <button class="btn btn-danger btn-sm"
            onclick="deleteLesson('${courseId}', '${l._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('')}`;
  }
};

// ক্লাস যোগ করুন
document.getElementById('addLessonForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const courseId = document.getElementById('lessonCourseId').value;

  const lessonData = {
    title: document.getElementById('lessonTitle').value,
    videoUrl: document.getElementById('lessonVideo').value,
    duration: document.getElementById('lessonDuration').value,
    order: Number(document.getElementById('lessonOrder').value) || 1,
    description: document.getElementById('lessonDesc').value
  };

  // Course এ lesson push করব
  const courseData = await apiCall(`/admin/courses`);
  if (courseData.success) {
    const course = courseData.courses.find(c => c._id === courseId);
    const updatedLessons = [...(course.lessons || []), lessonData];

    const data = await apiCall(`/admin/courses/${courseId}`, 'PUT', {
      lessons: updatedLessons
    });

    if (data.success) {
      showAlert('✅ ক্লাস যোগ হয়েছে!', 'success', 'lessonAlertBox');
      document.getElementById('addLessonForm').reset();
      await loadLessons(courseId);
      await loadCourses();
    } else {
      showAlert(data.message, 'error', 'lessonAlertBox');
    }
  }
});

// ক্লাস মুছুন
const deleteLesson = async (courseId, lessonId) => {
  if (!confirm('এই ক্লাসটি মুছবেন?')) return;
  const courseData = await apiCall(`/admin/courses`);
  if (courseData.success) {
    const course = courseData.courses.find(c => c._id === courseId);
    const updatedLessons = course.lessons.filter(l => l._id !== lessonId);
    const data = await apiCall(`/admin/courses/${courseId}`, 'PUT', {
      lessons: updatedLessons
    });
    if (data.success) await loadLessons(courseId);
  }
};

// ===== PAYMENTS =====
const loadPayments = async () => {
  const data = await apiCall('/admin/payments');
  if (data.success) {
    allPayments = data.payments;
    renderPayments(allPayments);
    renderDashPending();
  }
};

const renderDashPending = () => {
  const pending = allPayments.filter(p => p.status === 'pending');
  const container = document.getElementById('dashPendingPayments');

  if (pending.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle" style="color:var(--primary)"></i><p>কোনো পেন্ডিং পেমেন্ট নেই</p></div>`;
    return;
  }

  container.innerHTML = renderPaymentCards(pending.slice(0, 3));
};

const filterPayments = (status, btn) => {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = status === 'all'
    ? allPayments
    : allPayments.filter(p => p.status === status);
  renderPayments(filtered);
};

const renderPayments = (payments) => {
  const container = document.getElementById('paymentsList');
  if (payments.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-receipt"></i><p>কোনো পেমেন্ট নেই</p></div>`;
    return;
  }
  container.innerHTML = renderPaymentCards(payments);
};

const renderPaymentCards = (payments) => payments.map(p => `
  <div class="payment-card" id="payment-${p._id}">
    <div class="payment-card-header">
      <div class="payment-student-info">
        <h4>👤 ${p.user?.name || 'অজানা'}</h4>
        <p>${p.user?.email || ''} | ${p.user?.phone || ''}</p>
      </div>
      <span class="status-badge status-${p.status}">
        ${p.status === 'pending' ? '⏳ অপেক্ষমান'
          : p.status === 'approved' ? '✅ অনুমোদিত'
          : '❌ বাতিল'}
      </span>
    </div>

    <div class="payment-details">
      <div class="payment-detail-item">
        <label>কোর্স</label>
        <span>${p.course?.title || 'অজানা'}</span>
      </div>
      <div class="payment-detail-item">
        <label>পরিমাণ</label>
        <span style="color:var(--primary)">৳${p.amount}</span>
      </div>
      <div class="payment-detail-item">
        <label>মাধ্যম</label>
        <span>${p.method === 'bkash' ? '📱 bKash' : '📱 Nagad'}</span>
      </div>
      <div class="payment-detail-item">
        <label>ট্রানজেকশন ID</label>
        <span><code>${p.transactionId}</code></span>
      </div>
      <div class="payment-detail-item">
        <label>প্রেরকের নম্বর</label>
        <span>${p.senderNumber}</span>
      </div>
      <div class="payment-detail-item">
        <label>তারিখ</label>
        <span>${new Date(p.createdAt).toLocaleDateString('bn-BD')}</span>
      </div>
    </div>

    ${p.status === 'pending' ? `
      <div class="payment-actions">
        <input type="text" id="note-${p._id}" placeholder="নোট লিখুন (ঐচ্ছিক)">
        <button class="btn btn-primary btn-sm" onclick="approvePayment('${p._id}')">
          <i class="fas fa-check"></i> অনুমোদন করুন
        </button>
        <button class="btn btn-danger btn-sm" onclick="rejectPayment('${p._id}')">
          <i class="fas fa-times"></i> বাতিল করুন
        </button>
      </div>` : `
      ${p.adminNote ? `<p style="font-size:13px;color:var(--gray-500)">
        নোট: ${p.adminNote}</p>` : ''}`}
  </div>
`).join('');

const approvePayment = async (id) => {
  const note = document.getElementById(`note-${id}`)?.value || '';
  if (!confirm('এই পেমেন্ট অনুমোদন করবেন?')) return;
  const data = await apiCall(`/admin/payments/${id}/approve`, 'PUT', { note });
  if (data.success) {
    await loadPayments();
    await loadDashboard();
  }
};

const rejectPayment = async (id) => {
  const note = document.getElementById(`note-${id}`)?.value || '';
  if (!confirm('এই পেমেন্ট বাতিল করবেন?')) return;
  const data = await apiCall(`/admin/payments/${id}/reject`, 'PUT', { note });
  if (data.success) await loadPayments();
};

// ===== STUDENTS =====
const loadStudents = async () => {
  const data = await apiCall('/admin/students');
  const container = document.getElementById('studentsList');

  if (!data.success || data.students.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>কোনো স্টুডেন্ট নেই</p></div>`;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>নাম</th>
            <th>ইমেইল</th>
            <th>ফোন</th>
            <th>ভর্তির কোর্স</th>
            <th>যোগদানের তারিখ</th>
            <th>অবস্থা</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          ${data.students.map(s => `
            <tr>
              <td>
                <div class="student-info-cell">
                  <div class="student-avatar">
                    ${s.name.charAt(0).toUpperCase()}
                  </div>
                  <strong>${s.name}</strong>
                </div>
              </td>
              <td>${s.email}</td>
              <td>${s.phone}</td>
              <td>${s.enrolledCourses?.length || 0} টি</td>
              <td>${new Date(s.createdAt).toLocaleDateString('bn-BD')}</td>
              <td>
                <span class="published-badge ${s.isActive ? 'pub-yes' : 'pub-no'}">
                  ${s.isActive ? '✅ সক্রিয়' : '❌ বন্ধ'}
                </span>
              </td>
              <td>
                <button class="btn btn-sm ${s.isActive ? 'btn-danger' : 'btn-primary'}"
                  onclick="toggleStudent('${s._id}')">
                  ${s.isActive ? 'বন্ধ করুন' : 'চালু করুন'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
};

const toggleStudent = async (id) => {
  const data = await apiCall(`/admin/students/${id}/toggle`, 'PUT');
  if (data.success) await loadStudents();
};

// ===== NAVIGATION =====
const switchPage = (pageName) => {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageName}`)?.classList.add('active');
  document.getElementById('topbarTitle').textContent =
    pageName === 'dashboard' ? 'ড্যাশবোর্ড'
    : pageName === 'courses' ? 'কোর্স ম্যানেজমেন্ট'
    : pageName === 'payments' ? 'পেমেন্ট যাচাই'
    : 'স্টুডেন্ট লিস্ট';
};

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.getAttribute('data-page');
    switchPage(page);
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Modal বাইরে ক্লিক করলে বন্ধ
document.getElementById('lessonModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('lessonModal')) closeModal();
});

// ===== START =====
init();