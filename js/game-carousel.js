document.addEventListener('DOMContentLoaded', () => {
  if (!Array.isArray(games) || !games.length) {
    console.error('Game data is missing or invalid.');
    return;
  }

  let currentIndex = 0;
  const carousel = document.getElementById('carousel');
  const dotsContainer = document.getElementById('dots');
  const prevButton = document.querySelector('.nav-btn.prev');
  const nextButton = document.querySelector('.nav-btn.next');
  const alertBox = document.getElementById('alert');
  let autoPlayInterval;

  // ========================
  // Initialization
  // ========================
  function init() {
    renderCards();
    renderDots();
    bindEvents();
    updateCarousel();
    startAutoPlay();
  }

  // ========================
  // Render Cards
  // ========================
  function renderCards() {
    carousel.innerHTML = '';
    games.forEach((game, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.index = index;
      card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${game.title}</h3>
          <p class="card-name">${game.name}</p>
          <p class="id-label">Player ID</p>
          <div class="id-box">
            <code class="id-text">${game.gameId}</code>
          </div>
          <button class="copy-btn" data-game-id="${game.gameId}">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy ID
          </button>
        </div>`;
      carousel.appendChild(card);
    });
  }

  // ========================
  // Render Dots
  // ========================
  function renderDots() {
    dotsContainer.innerHTML = '';
    games.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.dataset.index = index;
      dotsContainer.appendChild(dot);
    });
  }

  // ========================
  // Update Carousel
  // ========================
  function updateCarousel() {
    const cards = carousel.querySelectorAll('.card');
    const dots = dotsContainer.querySelectorAll('.dot');

    cards.forEach((card, index) => {
      const diff = index - currentIndex;
      const absDiff = Math.abs(diff);
      let transform, zIndex, opacity, filter;

      if (absDiff === 0) {
        transform = 'translate(-50%, -50%) scale(1) rotateY(0deg)';
        zIndex = 30;
        opacity = 1;
        filter = 'brightness(1)';
      } else if (absDiff === 1) {
        const dir = Math.sign(diff);
        transform = `translate(calc(-50% + ${dir * 340}px), -50%) scale(0.85) rotateY(${-dir * 25}deg)`;
        zIndex = 20;
        opacity = 0.7;
        filter = 'brightness(0.6)';
      } else {
        const dir = Math.sign(diff);
        transform = `translate(calc(-50% + ${dir * 680}px), -50%) scale(0.7) rotateY(${-dir * 35}deg)`;
        zIndex = 10;
        opacity = 0.3;
        filter = 'brightness(0.4)';
      }

      card.style.transition = 'transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease';
      card.style.transform = transform;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
      card.style.filter = filter;
    });

    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
  }

  // ========================
  // Navigation
  // ========================
  const nextSlide = () => {
    currentIndex = (currentIndex + 1) % games.length;
    updateCarousel();
  };

  const prevSlide = () => {
    currentIndex = (currentIndex - 1 + games.length) % games.length;
    updateCarousel();
  };

  const goToSlide = (index) => {
    currentIndex = index;
    updateCarousel();
  };

  // ========================
  // Copy to Clipboard
  // ========================
  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = button.innerHTML;
      button.classList.add('copied');
      button.innerHTML = `
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Copied!
      `;
      showAlert('Copied to clipboard!');
      setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = originalHTML;
      }, 2000);
    });
  }

  // ========================
  // Show Alert
  // ========================
  function showAlert(message = '') {
    alertBox.textContent = message;
    alertBox.classList.add('show');
    setTimeout(() => alertBox.classList.remove('show'), 2000);
  }

  // ========================
  // Event Listeners
  // ========================
  function bindEvents() {
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    carousel.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const copyBtn = e.target.closest('.copy-btn');
      if (copyBtn) copyToClipboard(copyBtn.dataset.gameId, copyBtn);
      else if (card) goToSlide(parseInt(card.dataset.index, 10));
    });

    dotsContainer.addEventListener('click', (e) => {
      if (e.target.matches('.dot')) goToSlide(parseInt(e.target.dataset.index, 10));
    });

    let keyThrottle = false;
    document.addEventListener('keydown', (e) => {
      if (keyThrottle) return;
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      keyThrottle = true;
      setTimeout(() => (keyThrottle = false), 200); // throttle
    });
  }

  // ========================
  // Auto-play
  // ========================
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // slide every 5s
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carousel.addEventListener('mouseleave', startAutoPlay);
  }

  init();
});
