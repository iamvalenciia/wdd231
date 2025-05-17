// Date functionality
document.addEventListener('DOMContentLoaded', () => {
    // Update current date
    const currentDate = document.getElementById('current-date');
    if (currentDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Update copyright year
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Update last modified date
    const lastModified = document.getElementById('last-modified');
    if (lastModified) {
        lastModified.textContent = document.lastModified;
    }
}); 