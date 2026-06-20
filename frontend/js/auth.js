const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

// ===== TOKEN ম্যানেজমেন্ট =====
const getToken = () => localStorage.getItem('skillsbd_token');

const getUser = () => {
  const user = localStorage.getItem('skillsbd_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const saveAuth = (token, user) => {
  localStorage.setItem('skillsbd_token', token);
  localStorage.setItem('skillsbd_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('skillsbd_token');
  localStorage.removeItem('skillsbd_user');
};

// ===== API CALL =====
const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: 'সার্ভারে সংযোগ হচ্ছে না' };
  }
};

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

// ===== NAVBAR UPDATE =====
const updateNavbar = () => {
  const user = getUser();
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  const userAvatarText = document.getElementById('userAvatarText');
  const userAvatarBox = document.getElementById('userAvatarBox');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName) userName.textContent = user.name;

    // Avatar এ নামের প্রথম অক্ষর দেখান
    if (userAvatarText) {
      userAvatarText.textContent = user.name.charAt(0).toUpperCase();
    }

    // Admin link
    if (user.role === 'admin') {
      const dropdown = document.getElementById('dropdown');
      if (dropdown && !dropdown.querySelector('.admin-link')) {
        const adminLink = document.createElement('a');
        adminLink.href = '/admin/index.html';
        adminLink.className = 'admin-link';
        adminLink.innerHTML = '<i class="fas fa-cog"></i> Admin Panel';
        dropdown.insertBefore(adminLink, dropdown.querySelector('a'));
      }
    }

    // Dropdown toggle
    if (userAvatarBox) {
      userAvatarBox.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('dropdown');
        dropdown.classList.toggle('open');
      });
    }

    // বাইরে ক্লিক করলে বন্ধ হবে
    document.addEventListener('click', () => {
      const dropdown = document.getElementById('dropdown');
      if (dropdown) dropdown.classList.remove('open');
    });

  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (registerBtn) registerBtn.style.display = 'inline-flex';
    if (userMenu) userMenu.style.display = 'none';
  }
};
// ===== LOGOUT =====
const logout = () => {
  clearAuth();
  window.location.href = '/index.html';
};

// ===== AUTH GUARD =====
const requireAuth = () => {
  if (!getToken()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
};

const requireAdmin = () => {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '/index.html';
    return false;
  }
  return true;
};

// Global exports
window.getToken = getToken;
window.getUser = getUser;
window.saveAuth = saveAuth;
window.clearAuth = clearAuth;
window.apiCall = apiCall;
window.showAlert = showAlert;
window.logout = logout;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;

// Navbar আপডেট
updateNavbar();