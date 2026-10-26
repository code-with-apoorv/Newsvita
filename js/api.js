/**
 * NewsVita — Full-Stack API Client & State Management
 * Connects Frontend UI to Express.js REST APIs & SQLite Database
 */

const API_BASE = ''; // Relative path, same host

// ==========================================
// 1. AUTHENTICATION SERVICE
// ==========================================
const AuthService = {
  getToken() {
    return localStorage.getItem('newsvita_token');
  },

  getUser() {
    const userStr = localStorage.getItem('newsvita_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  setSession(token, user) {
    localStorage.setItem('newsvita_token', token);
    localStorage.setItem('newsvita_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('newsvita_token');
    localStorage.removeItem('newsvita_user');
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.setSession(data.token, data.user);
    return data;
  },

  async register(name, email, password, role = 'student') {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    this.setSession(data.token, data.user);
    return data;
  },

  logout() {
    this.clearSession();
    window.location.reload();
  }
};

// ==========================================
// 2. EVENTS SERVICE
// ==========================================
const EventService = {
  async getAll(category = 'all', search = '') {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);

    const headers = {};
    const token = AuthService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/events?${params.toString()}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
    return data.events || [];
  },

  async create(eventData) {
    const token = AuthService.getToken();
    if (!token) throw new Error('Please login to create an event');

    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create event');
    return data;
  },

  async registerForEvent(eventId) {
    const token = AuthService.getToken();
    if (!token) throw new Error('Please login or register to book a ticket');

    const res = await fetch(`${API_BASE}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async getMyRegistrations() {
    const token = AuthService.getToken();
    if (!token) return [];

    const res = await fetch(`${API_BASE}/api/my-registrations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch registrations');
    return data.registrations || [];
  },

  async cancelRegistration(ticketId) {
    const token = AuthService.getToken();
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(`${API_BASE}/api/registrations/${ticketId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel registration');
    return data;
  }
};

// ==========================================
// 3. UI TOAST NOTIFICATION HELPER
// ==========================================
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = type === 'success' 
    ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50' 
    : 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/50';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 ${bgColors}`;
  
  const icon = type === 'success' ? '✓' : '⚠';
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">${icon}</span>
    <span class="text-xs font-medium leading-relaxed">${message}</span>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

window.AuthService = AuthService;
window.EventService = EventService;
window.showToast = showToast;
