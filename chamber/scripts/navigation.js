// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const primaryNav = document.getElementById('primary-nav');

    if (!hamburgerBtn || !primaryNav) {
        console.warn('Navigation elements not found');
        return;
    }

    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
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

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            primaryNav.classList.remove('open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Set active link based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = primaryNav.querySelectorAll('a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}); 