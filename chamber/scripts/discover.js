// Load attractions data
async function loadAttractions() {
    try {
        const response = await fetch('data/attractions.json');
        const data = await response.json();
        displayAttractions(data.attractions);
    } catch (error) {
        console.error('Error loading attractions:', error);
    }
}

// Display attractions in the grid
function displayAttractions(attractions) {
    const grid = document.querySelector('.discover-grid');
    grid.innerHTML = '';

    attractions.forEach(attraction => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
            <h2>${attraction.title}</h2>
            <figure>
                <img src="${attraction.image}" alt="${attraction.title}" loading="lazy" width="300" height="200">
            </figure>
            <address>${attraction.address}</address>
            <p>${attraction.description}</p>
            <button class="btn">Learn More</button>
        `;
        grid.appendChild(card);
    });
}

// Handle visit tracking
function trackVisit() {
    const lastVisit = localStorage.getItem('lastVisit');
    const currentTime = Date.now();
    const visitMessage = document.querySelector('.visitor-info');
    
    if (!lastVisit) {
        visitMessage.innerHTML = '<h2>Welcome to Esmeraldas!</h2><p>Welcome! Let us know if you have any questions.</p>';
    } else {
        const daysSinceLastVisit = Math.floor((currentTime - lastVisit) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastVisit < 1) {
            visitMessage.innerHTML = '<h2>Welcome to Esmeraldas!</h2><p>Back so soon! Awesome!</p>';
        } else {
            const dayText = daysSinceLastVisit === 1 ? 'day' : 'days';
            visitMessage.innerHTML = `<h2>Welcome to Esmeraldas!</h2><p>You last visited ${daysSinceLastVisit} ${dayText} ago.</p>`;
        }
    }
    
    localStorage.setItem('lastVisit', currentTime);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadAttractions();
    trackVisit();
}); 