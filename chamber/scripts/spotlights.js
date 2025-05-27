// Display three random members
// Members must be gold or platinum members
// Randomly load 'spotlights' each time the page is rendered
// Display their company name, logo, phone, address, website, and membership level.

const membersContainer = document.querySelector('.spotlights-container');
const url = './data/members.json';

async function getData() {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error loading members');
        const data = await response.json();
        displayMembers(getRandomMembers(data.companies));
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to get 3 random members
function getRandomMembers(members) {
    // Filter members with Gold or Platinum level
    const eligibleMembers = members.filter(member => 
        member.level === "Platinum"
    );
    
    // Shuffle array and take 3 random members
    const shuffled = [...eligibleMembers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

const displayMembers = (members) => {
    membersContainer.innerHTML = ''; // Clear existing content
    
    members.forEach(member => {
        const card = document.createElement('section');
        card.className = 'member-card';
        card.innerHTML = `
            <h2>${member.name}</h2>
            <img src="${member.image}" alt="${member.name} logo" loading="lazy" width="340" height="440">
            <p>Phone: ${member.phonenumber}</p>
            <p>Address: ${member.address}</p>
            <p>Website: <a href="${member.websiteLink}" target="_blank">${member.websiteName}</a></p>
            <p>Membership Level: ${member.level}</p>
        `;
        
        // Add background color based on membership level
        card.style.backgroundColor = member.level === "Platinum" ? "#ffcf40" : "#C4C4C4";
        
        membersContainer.appendChild(card);
    });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', getData);