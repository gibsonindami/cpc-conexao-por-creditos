document.addEventListener('DOMContentLoaded', function () {
    const btnMenu = document.getElementById('hamburger');
    const menu = document.querySelector('.side-menu');
    const overlay = document.querySelector('.overlay');

    btnMenu.addEventListener('click', () => {
      menu.classList.add('open');
      overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
      menu.classList.remove('open');
      overlay.style.display = 'none';
    });
  });