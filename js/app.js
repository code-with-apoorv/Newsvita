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
});
