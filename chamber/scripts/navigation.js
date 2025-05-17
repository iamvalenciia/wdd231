// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const primaryNav = document.getElementById('primary-nav');

    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', () => {
        primaryNav.classList.toggle('open');
        const isExpanded = primaryNav.classList.contains('open');
        hamburgerBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInside = primaryNav.contains(event.target) || hamburgerBtn.contains(event.target);
        
        if (!isClickInside && primaryNav.classList.contains('open')) {
            primaryNav.classList.remove('open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });
}); 