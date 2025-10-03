document.addEventListener('DOMContentLoaded', () => {
  const gameBox = document.getElementById('gameBox');
  const gameImage = document.getElementById('gameImage');
  const gameTitle = document.getElementById('gameTitle');
  const gameName = document.getElementById('gameName');
  const gamePlatform = document.getElementById('gamePlatform');
  const gameBackTitle = document.getElementById('gameBackTitle');
  const gameProfileId = document.getElementById('gameProfileId');
  const gameProfileLink = document.getElementById('gameProfileLink');
  const boxDotsContainer = document.getElementById('boxDots');
  const prevButton = document.querySelector('.box-prev');
  const nextButton = document.querySelector('.box-next');

  let currentIndex = 0;
  let autoPlayInterval;

  function updateContent() {
    const game = games1[currentIndex];

    // Update front face
    gameImage.src = game.image;
    gameImage.alt = `${game.platform} logo`;
    gameTitle.textContent = game.platform;
    gameName.textContent = game.profileName;
    gamePlatform.textContent = game.platform;

    // Update back face
    gameBackTitle.textContent = game.platform;
    gameProfileId.textContent = game.profileId;
    gameProfileLink.href = game.url;

    // Update active dot
    const dots = boxDotsContainer.querySelectorAll('.box-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function renderDots() {
    boxDotsContainer.innerHTML = '';
    games1.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'box-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to profile ${index + 1}`);
      boxDotsContainer.appendChild(dot);
    });
  }

  const goToSlide = (index) => {
    gameBox.classList.remove('is-flipped');
    currentIndex = index;
    updateContent();
    resetAutoPlay();
  };

  const showNextSlide = () => {
    gameBox.classList.remove('is-flipped');
    currentIndex = (currentIndex + 1) % games1.length;
    updateContent();
  };

  const showPrevSlide = () => {
    gameBox.classList.remove('is-flipped');
    currentIndex = (currentIndex - 1 + games1.length) % games1.length;
    updateContent();
  };

  function startAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(showNextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  // Event Listeners
  nextButton.addEventListener('click', () => {
    showNextSlide();
    resetAutoPlay();
  });

  prevButton.addEventListener('click', () => {
    showPrevSlide();
    resetAutoPlay();
  });

  gameBox.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      e.stopPropagation();
      return;
    }
    gameBox.classList.toggle('is-flipped');
  });

  boxDotsContainer.addEventListener('click', (e) => {
    if (e.target.matches('.box-dot')) {
      goToSlide(parseInt(e.target.dataset.index, 10));
    }
  });

  document.querySelector('.box-container').addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
  });

  document.querySelector('.box-container').addEventListener('mouseleave', () => {
    startAutoPlay();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      showPrevSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowRight') {
      showNextSlide();
      resetAutoPlay();
    }
  });

  // Initialize
  renderDots();
  updateContent();
  startAutoPlay();
});