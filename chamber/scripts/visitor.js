// Function to format the date for display
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to calculate days between dates
function calculateDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays;
}

// Function to update visitor information
function updateVisitorInfo() {
    try {
        // Get the current date in milliseconds
        const currentDate = Date.now();
        
        // Get the last visit date from localStorage
        let lastVisit = localStorage.getItem('lastVisit');
        
        // Get the visit count from localStorage
        let visitCount = parseInt(localStorage.getItem('visitCount')) || 0;
        
        // Update visit count
        visitCount++;
        localStorage.setItem('visitCount', visitCount);
        
        // Calculate days between visits
        let daysBetweenVisits = 0;
        if (lastVisit) {
            daysBetweenVisits = calculateDaysBetween(currentDate, parseInt(lastVisit));
        }
        
        // Get the visitor info element
        const visitorInfo = document.querySelector('.visitor-info');
        if (!visitorInfo) {
            console.error('Visitor info element not found');
            return;
        }
        
        // Create message based on visit history
        let message = '';
        if (!lastVisit) {
            message = 'Welcome! Let us know if you have any questions.';
        } else if (daysBetweenVisits < 1) {
            message = 'Back so soon! Awesome!';
        } else {
            const dayText = daysBetweenVisits === 1 ? 'day' : 'days';
            message = `You last visited ${daysBetweenVisits} ${dayText} ago.`;
        }
        
        // Update the visitor info section
        visitorInfo.innerHTML = `
            <div class="visitor-message">
                <h2>Welcome to Esmeraldas!</h2>
                <p>${message}</p>
                <p>You have visited this page <span id="visit-count">${visitCount}</span> times.</p>
                ${lastVisit ? `<p>Last visit: ${formatDate(parseInt(lastVisit))}</p>` : ''}
            </div>
        `;
        
        // Store current visit date
        localStorage.setItem('lastVisit', currentDate);
        
    } catch (error) {
        console.error('Error updating visitor information:', error);
        // Fallback content in case of error
        const visitorInfo = document.querySelector('.visitor-info');
        if (visitorInfo) {
            visitorInfo.innerHTML = `
                <div class="visitor-message">
                    <h2>Welcome to Esmeraldas!</h2>
                    <p>Welcome! Let us know if you have any questions.</p>
                </div>
            `;
        }
    }
}

// Initialize visitor information when the page loads
document.addEventListener('DOMContentLoaded', updateVisitorInfo); 