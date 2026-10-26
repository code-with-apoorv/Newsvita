/**
 * NewsVita — Campus Media & Event Intelligence Portal
 * Core Client-side Interactivity, Filtering, Lightbox, and Search Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const mediaItems = document.querySelectorAll('.media-item');
  const searchInput = document.getElementById('search-input');
  
  // Lightbox Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  // Stats Counters
  let currentFilter = 'all';
  let visibleImages = [];
  let currentImageIndex = 0;

  // --- Filtering Functionality ---
  const applyFilter = (category) => {
    currentFilter = category;
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Update active tab button styling
    filterButtons.forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('active');
        btn.classList.remove('text-slate-300', 'bg-slate-800/80', 'border-slate-700/80');
      } else {
        btn.classList.remove('active');
        btn.classList.add('text-slate-300', 'bg-slate-800/80', 'border-slate-700/80');
      }
    });

    // Filter media items
    let visibleCount = 0;
    visibleImages = [];

    mediaItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      const itemType = item.getAttribute('data-type'); // 'image' or 'video'
      const itemTitle = (item.getAttribute('data-title') || '').toLowerCase();
      const itemDesc = (item.getAttribute('data-desc') || '').toLowerCase();

      const matchesCategory = (category === 'all') || 
                              (category === 'videos' && itemType === 'video') ||
                              (category === itemCategory);

      const matchesSearch = !searchTerm || itemTitle.includes(searchTerm) || itemDesc.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        item.style.display = '';
        item.classList.add('animate-fadeIn');
        visibleCount++;

        // Collect image items for lightbox navigation
        if (itemType === 'image') {
          visibleImages.push(item);
        }
      } else {
        item.style.display = 'none';
      }
    });

    // Empty state handling
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  // Event Listeners for Tab Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');
      applyFilter(filterValue);
    });
  });

  // Search input live filtering
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilter(currentFilter);
    });
  }

  // --- Lightbox Image Modal ---
  const openLightbox = (imageSrc, title, category, date, index) => {
    lightboxImage.src = imageSrc;
    lightboxTitle.textContent = title || 'Event Highlight';
    lightboxCategory.textContent = category ? category.toUpperCase() : 'CAMPUS EVENT';
    lightboxDate.textContent = date || 'Campus Archive';
    currentImageIndex = index;

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeLightbox = () => {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showNextImage = () => {
    if (visibleImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
    const targetItem = visibleImages[currentImageIndex];
    const imgElem = targetItem.querySelector('img');
    openLightbox(
      imgElem.src,
      targetItem.getAttribute('data-title'),
      targetItem.getAttribute('data-category'),
      targetItem.getAttribute('data-date'),
      currentImageIndex
    );
  };

  const showPrevImage = () => {
    if (visibleImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
    const targetItem = visibleImages[currentImageIndex];
    const imgElem = targetItem.querySelector('img');
    openLightbox(
      imgElem.src,
      targetItem.getAttribute('data-title'),
      targetItem.getAttribute('data-category'),
      targetItem.getAttribute('data-date'),
      currentImageIndex
    );
  };

  // Attach Lightbox triggers to Image Cards
  mediaItems.forEach(item => {
    if (item.getAttribute('data-type') === 'image') {
      const clickArea = item.querySelector('.image-preview-trigger');
      if (clickArea) {
        clickArea.addEventListener('click', (e) => {
          e.preventDefault();
          const imgElem = item.querySelector('img');
          const index = visibleImages.indexOf(item);
          openLightbox(
            imgElem.src,
            item.getAttribute('data-title'),
            item.getAttribute('data-category'),
            item.getAttribute('data-date'),
            index >= 0 ? index : 0
          );
        });
      }
    }
  });

  // Modal Controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  // Close modal when clicking backdrop
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for accessibility
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  // Mobile navigation drawer toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Initialize view
  applyFilter('all');

  // =========================================================================
  // FULL-STACK EXTENSIONS: AUTHENTICATION, DYNAMIC EVENTS & TICKET PASSES
  // =========================================================================

  // DOM Elements for Modals
  const authModal = document.getElementById('auth-modal');
  const closeAuthModal = document.getElementById('close-auth-modal');
  const authForm = document.getElementById('auth-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authNameGroup = document.getElementById('auth-name-group');
  const authRoleGroup = document.getElementById('auth-role-group');
  const authTitle = document.getElementById('auth-modal-title');
  const authDesc = document.getElementById('auth-modal-desc');
  const authBtnText = document.getElementById('auth-btn-text');
  const authErrorBanner = document.getElementById('auth-error-banner');

  const ticketModal = document.getElementById('ticket-modal');
  const closeTicketModal = document.getElementById('close-ticket-modal');
  const printTicketBtn = document.getElementById('print-ticket-btn');

  const myTicketsModal = document.getElementById('my-tickets-modal');
  const closeMyTicketsModal = document.getElementById('close-my-tickets-modal');
  const myTicketsList = document.getElementById('my-tickets-list');

  const createEventModal = document.getElementById('create-event-modal');
  const closeCreateEventModal = document.getElementById('close-create-event-modal');
  const createEventForm = document.getElementById('create-event-form');
  const openCreateEventBtn = document.getElementById('open-create-event-btn');

  const navAuthContainer = document.getElementById('nav-auth-container');
  const mobileAuthContainer = document.getElementById('mobile-auth-container');
  const upcomingEventsGrid = document.getElementById('upcoming-events-grid');
  const eventCatBtns = document.querySelectorAll('.event-cat-btn');

  let authMode = 'login'; // 'login' or 'register'
  let currentEventCategory = 'all';

  // --- 1. Update Navigation Bar Auth State ---
  const updateNavAuthUI = () => {
    const user = window.AuthService.getUser();

    if (user) {
      const isOrganizer = user.role === 'organizer' || user.role === 'admin';
      if (openCreateEventBtn) {
        openCreateEventBtn.classList.toggle('hidden', !isOrganizer);
      }

      const userBadgeHtml = `
        <button id="nav-my-tickets-btn" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all">
          <i data-lucide="ticket" class="w-3.5 h-3.5 text-orange-400"></i>
          <span>My Tickets</span>
        </button>

        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            ${user.name.charAt(0)}
          </div>
          <span class="font-semibold text-slate-200 hidden lg:inline">${user.name.split(' ')[0]}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">${user.role}</span>
        </div>

        <button id="nav-logout-btn" title="Log Out" class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
        </button>
      `;

      if (navAuthContainer) navAuthContainer.innerHTML = userBadgeHtml;
      if (mobileAuthContainer) {
        mobileAuthContainer.innerHTML = `
          <div class="flex items-center justify-between py-2 text-xs">
            <span class="text-slate-300 font-semibold">${user.name} (${user.role})</span>
            <button id="mobile-logout-btn" class="text-rose-400 hover:underline">Log Out</button>
          </div>
          <button id="mobile-my-tickets-btn" class="w-full mt-2 py-2 text-center text-xs font-semibold rounded-xl bg-slate-800 text-white">View My Tickets</button>
        `;
      }

      // Attach dynamic listeners
      const myTicketsBtn = document.getElementById('nav-my-tickets-btn');
      const mobileMyTicketsBtn = document.getElementById('mobile-my-tickets-btn');
      const logoutBtn = document.getElementById('nav-logout-btn');
      const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

      if (myTicketsBtn) myTicketsBtn.addEventListener('click', openMyTickets);
      if (mobileMyTicketsBtn) mobileMyTicketsBtn.addEventListener('click', openMyTickets);
      if (logoutBtn) logoutBtn.addEventListener('click', () => window.AuthService.logout());
      if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', () => window.AuthService.logout());

    } else {
      if (openCreateEventBtn) openCreateEventBtn.classList.add('hidden');

      const loginBtnHtml = `
        <button id="open-auth-btn" class="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-lg shadow-orange-500/25 transition-all">
          <i data-lucide="user" class="w-3.5 h-3.5"></i>
          <span>Sign In / RSVP</span>
        </button>
      `;

      if (navAuthContainer) navAuthContainer.innerHTML = loginBtnHtml;
      if (mobileAuthContainer) {
        mobileAuthContainer.innerHTML = `
          <button id="mobile-open-auth-btn" class="w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white">
            Sign In / Register
          </button>
        `;
      }

      const openAuth = document.getElementById('open-auth-btn');
      const mobileOpenAuth = document.getElementById('mobile-open-auth-btn');
      if (openAuth) openAuth.addEventListener('click', () => openAuthModalHandler('login'));
      if (mobileOpenAuth) mobileOpenAuth.addEventListener('click', () => openAuthModalHandler('login'));
    }

    if (window.lucide) window.lucide.createIcons();
  };

  // --- 2. Dynamic Event Cards Renderer ---
  const loadUpcomingEvents = async (category = 'all') => {
    currentEventCategory = category;
    if (!upcomingEventsGrid) return;

    try {
      const events = await window.EventService.getAll(category);

      if (events.length === 0) {
        upcomingEventsGrid.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-500 text-sm glass-card rounded-2xl p-8">
            <i data-lucide="calendar-x" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
            <p>No upcoming campus events listed in this category.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      upcomingEventsGrid.innerHTML = events.map(event => {
        const dateParts = event.event_date.split('•');
        const dateStr = dateParts[0].trim();
        const timeStr = dateParts[1] ? dateParts[1].trim() : '';

        // Extract Month & Day for the visual badge
        const [month, day] = dateStr.split(' ');

        const percentLeft = Math.round((event.seats_left / event.total_seats) * 100);
        const isHousefull = event.seats_left <= 0;
        const isRegistered = event.is_registered;

        let badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        if (event.category === 'Technical') badgeColor = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
        if (event.category === 'Flagship') badgeColor = 'bg-pink-500/20 text-pink-400 border-pink-500/30';
        if (event.category === 'Workshop') badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

        let buttonHtml = '';
        if (isRegistered) {
          buttonHtml = `
            <button class="view-pass-btn w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
                    data-ticket-id="${event.ticket_id}" 
                    data-title="${event.title}" 
                    data-venue="${event.venue}" 
                    data-date="${event.event_date}" 
                    data-cat="${event.category}">
              <i data-lucide="ticket-check" class="w-3.5 h-3.5"></i>
              <span>✓ Pass Confirmed (View Ticket)</span>
            </button>
          `;
        } else if (isHousefull) {
          buttonHtml = `
            <button disabled class="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed">
              Housefull (0 Seats Left)
            </button>
          `;
        } else {
          buttonHtml = `
            <button class="rsvp-event-btn w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
                    data-event-id="${event.id}">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
              <span>Instant RSVP (Free Entry)</span>
            </button>
          `;
        }

        return `
          <div class="glass-card p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex flex-col items-center justify-center shrink-0">
                  <span class="text-[10px] uppercase font-bold tracking-wider">${month || 'OCT'}</span>
                  <span class="text-lg font-extrabold font-heading leading-tight">${day || '18'}</span>
                </div>
                <div class="flex-1">
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}">
                    ${event.category}
                  </span>
                  <h4 class="text-base font-bold text-white font-heading mt-2 group-hover:text-orange-400 transition-colors leading-snug">
                    ${event.title}
                  </h4>
                </div>
              </div>

              <p class="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                ${event.description || 'Join fellow students and campus clubs for this university event.'}
              </p>

              <div class="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                <span class="flex items-center gap-1 truncate">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-500 shrink-0"></i>
                  <span class="truncate">${event.venue}</span>
                </span>
                <span class="shrink-0 text-slate-500">${timeStr || 'Campus'}</span>
              </div>

              <!-- Seat Availability Meter -->
              <div class="mt-4">
                <div class="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                  <span>Seats Available</span>
                  <span class="${event.seats_left < 15 ? 'text-amber-400' : 'text-slate-300'}">${event.seats_left} / ${event.total_seats}</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div class="h-full rounded-full ${percentLeft < 25 ? 'bg-amber-500' : 'bg-gradient-to-r from-orange-500 to-pink-500'}" style="width: ${percentLeft}%"></div>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-2">
              ${buttonHtml}
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide) window.lucide.createIcons();

      // Attach RSVP Event Handlers
      document.querySelectorAll('.rsvp-event-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const eventId = btn.getAttribute('data-event-id');

          if (!window.AuthService.isLoggedIn()) {
            window.showToast('Please sign in or create an account to RSVP for campus events.', 'info');
            openAuthModalHandler('login');
            return;
          }

          btn.disabled = true;
          btn.innerHTML = `<span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Reserving...`;

          try {
            const res = await window.EventService.registerForEvent(eventId);
            window.showToast(res.message, 'success');
            showTicketModal(res.ticket);
            loadUpcomingEvents(currentEventCategory);
            updateNavAuthUI();
          } catch (err) {
            window.showToast(err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = `Instant RSVP (Free Entry)`;
          }
        });
      });

      // Attach View Pass Handlers
      document.querySelectorAll('.view-pass-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const user = window.AuthService.getUser();
          showTicketModal({
            ticket_id: btn.getAttribute('data-ticket-id'),
            event_title: btn.getAttribute('data-title'),
            venue: btn.getAttribute('data-venue'),
            event_date: btn.getAttribute('data-date'),
            category: btn.getAttribute('data-cat'),
            student_name: user ? user.name : 'Student Attendee',
            student_email: user ? user.email : 'student@vitbhopal.ac.in'
          });
        });
      });

    } catch (err) {
      upcomingEventsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-rose-400 text-xs">
          Failed to load campus events. Please make sure the backend server is running.
        </div>
      `;
    }
  };

  // Event category filter tabs
  eventCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      eventCatBtns.forEach(b => {
        b.classList.remove('bg-gradient-to-r', 'from-orange-500', 'to-pink-600', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-gradient-to-r', 'from-orange-500', 'to-pink-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-400');
      loadUpcomingEvents(cat);
    });
  });

  // --- 3. Auth Modal Handler ---
  const openAuthModalHandler = (mode = 'login') => {
    authMode = mode;
    authErrorBanner.classList.add('hidden');
    authForm.reset();

    if (mode === 'login') {
      tabLogin.classList.add('bg-gradient-to-r', 'from-orange-500', 'to-pink-600', 'text-white', 'shadow-sm');
      tabLogin.classList.remove('text-slate-400');
      tabRegister.classList.remove('bg-gradient-to-r', 'from-orange-500', 'to-pink-600', 'text-white', 'shadow-sm');
      tabRegister.classList.add('text-slate-400');

      authNameGroup.classList.add('hidden');
      authRoleGroup.classList.add('hidden');
      authTitle.textContent = 'Welcome Back to NewsVita';
      authDesc.textContent = 'Sign in with your university account to access registered passes.';
      authBtnText.textContent = 'Sign In';
    } else {
      tabRegister.classList.add('bg-gradient-to-r', 'from-orange-500', 'to-pink-600', 'text-white', 'shadow-sm');
      tabRegister.classList.remove('text-slate-400');
      tabLogin.classList.remove('bg-gradient-to-r', 'from-orange-500', 'to-pink-600', 'text-white', 'shadow-sm');
      tabLogin.classList.add('text-slate-400');

      authNameGroup.classList.remove('hidden');
      authRoleGroup.classList.remove('hidden');
      authTitle.textContent = 'Create Campus Account';
      authDesc.textContent = 'Register to reserve workshop seats or publish student club events.';
      authBtnText.textContent = 'Create Account';
    }

    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
  };

  const closeAuthModalHandler = () => {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
  };

  if (tabLogin) tabLogin.addEventListener('click', () => openAuthModalHandler('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => openAuthModalHandler('register'));
  if (closeAuthModal) closeAuthModal.addEventListener('click', closeAuthModalHandler);
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModalHandler();
    });
  }

  // Auth Form Submit
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      authErrorBanner.classList.add('hidden');

      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name').value;
      const role = document.querySelector('input[name="auth-role"]:checked')?.value || 'student';

      const submitBtn = document.getElementById('auth-submit-btn');
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75');

      try {
        if (authMode === 'login') {
          const res = await window.AuthService.login(email, password);
          window.showToast(`Welcome back, ${res.user.name}!`, 'success');
        } else {
          const res = await window.AuthService.register(name, email, password, role);
          window.showToast(`Account created successfully! Welcome, ${res.user.name}.`, 'success');
        }

        closeAuthModalHandler();
        updateNavAuthUI();
        loadUpcomingEvents(currentEventCategory);

      } catch (err) {
        authErrorBanner.textContent = err.message;
        authErrorBanner.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');
      }
    });
  }

  // --- 4. Digital Ticket Pass Modal Handler ---
  const showTicketModal = (ticket) => {
    document.getElementById('ticket-event-title').textContent = ticket.event_title || 'Campus Event';
    document.getElementById('ticket-category').textContent = ticket.category || 'EVENT';
    document.getElementById('ticket-date').textContent = ticket.event_date || 'TBA';
    document.getElementById('ticket-venue').textContent = ticket.venue || 'Campus Auditorium';
    document.getElementById('ticket-student-name').textContent = ticket.student_name || 'Student Attendee';
    document.getElementById('ticket-student-email').textContent = ticket.student_email || 'student@vitbhopal.ac.in';
    document.getElementById('ticket-token').textContent = ticket.ticket_id || 'NV-2026-PASS';

    ticketModal.classList.remove('hidden');
    ticketModal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  };

  const closeTicketModalHandler = () => {
    ticketModal.classList.add('hidden');
    ticketModal.classList.remove('flex');
  };

  if (closeTicketModal) closeTicketModal.addEventListener('click', closeTicketModalHandler);
  if (ticketModal) {
    ticketModal.addEventListener('click', (e) => {
      if (e.target === ticketModal) closeTicketModalHandler();
    });
  }

  if (printTicketBtn) {
    printTicketBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // --- 5. My Tickets Modal Handler ---
  const openMyTickets = async () => {
    myTicketsList.innerHTML = `
      <div class="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div class="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Retrieving your registered passes...</span>
      </div>
    `;
    myTicketsModal.classList.remove('hidden');
    myTicketsModal.classList.add('flex');

    try {
      const tickets = await window.EventService.getMyRegistrations();

      if (tickets.length === 0) {
        myTicketsList.innerHTML = `
          <div class="py-12 text-center text-slate-500 text-xs">
            <i data-lucide="ticket" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
            <p>You have not registered for any campus events yet.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      myTicketsList.innerHTML = tickets.map(t => `
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">${t.category}</span>
              <span class="text-xs font-bold text-white font-heading">${t.title}</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">${t.event_date} • ${t.venue}</p>
            <p class="text-[10px] font-mono text-orange-400/90 mt-1">Ticket: ${t.ticket_id}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button class="view-single-pass-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                    data-ticket='${JSON.stringify(t).replace(/'/g, "&apos;")}'>
              Pass
            </button>
            <button class="cancel-pass-btn p-1.5 rounded-lg text-xs text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Cancel Registration"
                    data-ticket-id="${t.ticket_id}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();

      // Handlers inside My Tickets
      document.querySelectorAll('.view-single-pass-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = JSON.parse(btn.getAttribute('data-ticket'));
          const user = window.AuthService.getUser();
          myTicketsModal.classList.add('hidden');
          myTicketsModal.classList.remove('flex');
          showTicketModal({
            ticket_id: t.ticket_id,
            event_title: t.title,
            category: t.category,
            venue: t.venue,
            event_date: t.event_date,
            student_name: user ? user.name : 'Student Attendee',
            student_email: user ? user.email : 'student@vitbhopal.ac.in'
          });
        });
      });

      document.querySelectorAll('.cancel-pass-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ticketId = btn.getAttribute('data-ticket-id');
          if (confirm(`Are you sure you want to cancel ticket ${ticketId}? Your seat will be released.`)) {
            try {
              const res = await window.EventService.cancelRegistration(ticketId);
              window.showToast(res.message, 'success');
              openMyTickets();
              loadUpcomingEvents(currentEventCategory);
            } catch (err) {
              window.showToast(err.message, 'error');
            }
          }
        });
      });

    } catch (err) {
      myTicketsList.innerHTML = `<div class="py-8 text-center text-rose-400 text-xs">${err.message}</div>`;
    }
  };

  const closeMyTicketsModalHandler = () => {
    myTicketsModal.classList.add('hidden');
    myTicketsModal.classList.remove('flex');
  };

  if (closeMyTicketsModal) closeMyTicketsModal.addEventListener('click', closeMyTicketsModalHandler);
  if (myTicketsModal) {
    myTicketsModal.addEventListener('click', (e) => {
      if (e.target === myTicketsModal) closeMyTicketsModalHandler();
    });
  }

  // --- 6. Create Event Modal Handler (Organizer) ---
  if (openCreateEventBtn) {
    openCreateEventBtn.addEventListener('click', () => {
      createEventModal.classList.remove('hidden');
      createEventModal.classList.add('flex');
    });
  }

  const closeCreateEventModalHandler = () => {
    createEventModal.classList.add('hidden');
    createEventModal.classList.remove('flex');
  };

  if (closeCreateEventModal) closeCreateEventModal.addEventListener('click', closeCreateEventModalHandler);
  if (createEventModal) {
    createEventModal.addEventListener('click', (e) => {
      if (e.target === createEventModal) closeCreateEventModalHandler();
    });
  }

  if (createEventForm) {
    createEventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('new-event-title').value;
      const category = document.getElementById('new-event-category').value;
      const total_seats = document.getElementById('new-event-seats').value;
      const event_date = document.getElementById('new-event-date').value;
      const venue = document.getElementById('new-event-venue').value;
      const description = document.getElementById('new-event-desc').value;

      try {
        const res = await window.EventService.create({
          title, category, total_seats, event_date, venue, description
        });
        window.showToast(res.message, 'success');
        createEventForm.reset();
        closeCreateEventModalHandler();
        loadUpcomingEvents(currentEventCategory);
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  // Initial Load of Auth and Live Events
  updateNavAuthUI();
  loadUpcomingEvents('all');
});

