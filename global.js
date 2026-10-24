// Shared navigation: native anchor links work even without JavaScript.
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('nav a').forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'location');
  });
});
