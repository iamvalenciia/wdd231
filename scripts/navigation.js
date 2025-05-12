// navigation.js - Handles responsive navigation menu

document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const primaryNav = document.getElementById("primary-nav");
  const header = document.querySelector("header");
  let lastScroll = 0;

  // Toggle the menu when hamburger button is clicked
  hamburgerBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    primaryNav.classList.toggle("open");
    
    // Change hamburger button text and aria-label based on menu state
    const isOpen = primaryNav.classList.contains("open");
    hamburgerBtn.textContent = isOpen ? "✕" : "☰";
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
    hamburgerBtn.setAttribute("aria-label", `${isOpen ? "Close" : "Open"} navigation menu`);
    
    // Prevent body scroll when menu is open on mobile
    document.body.style.overflow = isOpen && window.innerWidth < 768 ? "hidden" : "";
  });

  // Close the menu when clicking outside of it
  document.addEventListener("click", (event) => {
    if (!event.target.closest("nav") && primaryNav.classList.contains("open")) {
      primaryNav.classList.remove("open");
      hamburgerBtn.textContent = "☰";
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.setAttribute("aria-label", "Open navigation menu");
      document.body.style.overflow = "";
    }
  });

  // Handle window resize events
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth >= 768) {
        primaryNav.classList.remove("open");
        hamburgerBtn.textContent = "☰";
        hamburgerBtn.setAttribute("aria-expanded", "false");
        hamburgerBtn.setAttribute("aria-label", "Open navigation menu");
        document.body.style.overflow = "";
      }
    }, 250);
  });

  // Handle scroll events for header
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      header.classList.remove("scroll-up");
      return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains("scroll-down")) {
      // Scrolling down
      header.classList.remove("scroll-up");
      header.classList.add("scroll-down");
    } else if (currentScroll < lastScroll && header.classList.contains("scroll-down")) {
      // Scrolling up
      header.classList.remove("scroll-down");
      header.classList.add("scroll-up");
    }
    
    lastScroll = currentScroll;
  });

  // Add active class to current page link
  const currentPage = window.location.pathname;
  document.querySelectorAll("#primary-nav a").forEach(link => {
    if (link.getAttribute("href") === currentPage || 
        (currentPage === "/" && link.getAttribute("href") === "index.html")) {
      link.classList.add("active");
    }
  });
});
