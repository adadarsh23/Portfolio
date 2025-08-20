// ...existing code...
document.addEventListener('DOMContentLoaded', function () {
  const avatarFigure = document.getElementById('avatar-3d-container');
  const avatarImg = document.getElementById('randomPhoto');
  const modal = document.getElementById('avatarFullModal');
  const modalImg = document.getElementById('avatarFullImg');
  const closeBtn = document.getElementById('closeAvatarFullModal');

  // Ensure avatar image loads before opening modal
  avatarFigure.addEventListener('click', function () {
    if (avatarImg && avatarImg.src) {
      modal.classList.add('active');
      modalImg.src = avatarImg.src;
      modalImg.alt = avatarImg.alt || 'Avatar Full';
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
  });

  // Close modal on cross button click
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    modal.classList.remove('active');
    modalImg.src = '';
    document.body.style.overflow = ''; // Restore scroll
  });

  // Close modal when clicking outside the image
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      modalImg.src = '';
      document.body.style.overflow = '';
    }
  });

  // Optional: Close modal with ESC key
  document.addEventListener('keydown', function (e) {
    if (modal.classList.contains('active') && e.key === 'Escape') {
      modal.classList.remove('active');
      modalImg.src = '';
      document.body.style.overflow = '';
    }
  });
});
// ...existing code...