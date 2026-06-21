// ===== DARK/LIGHT MODE =====

const THEME_KEY = 'skillsbd_theme';

// থিম সেট করুন
const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
};

// থিম পড়ুন
const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'light';
};

// থিম টগল
const toggleTheme = () => {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);

  // Button tooltip
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.title = next === 'dark' ? 'Light Mode এ যান' : 'Dark Mode এ যান';
  }
};

// Page load এ থিম প্রয়োগ করুন
const initTheme = () => {
  const savedTheme = getTheme();
  setTheme(savedTheme);
};

// Toggle button তৈরি করুন
const createThemeToggle = () => {
  const btn = document.createElement('button');
  btn.id = 'themeToggle';
  btn.className = 'theme-toggle';
  btn.title = getTheme() === 'dark' ? 'Light Mode এ যান' : 'Dark Mode এ যান';
  btn.innerHTML = `
    <i class="fas fa-sun sun"></i>
    <i class="fas fa-moon moon"></i>
  `;
  btn.addEventListener('click', toggleTheme);
  document.body.appendChild(btn);
};

// System theme detect করুন
const detectSystemTheme = () => {
  if (!localStorage.getItem(THEME_KEY)) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }
};

// Init
detectSystemTheme();
initTheme();
document.addEventListener('DOMContentLoaded', createThemeToggle);

window.toggleTheme = toggleTheme;