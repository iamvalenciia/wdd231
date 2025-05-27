//display two or three members
//member must be gold or silver members
//randomly load 'spotlights' each time the page is rendered
//display their company name, logo, phone, address, website, and membership level.

const membersContainer = document.querySelector('.spotlights-container');
const url = './data/members.json';

async function getData() {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar los miembros');
        const data = await response.json();
        // Access the companies array from the data
        if (data && data.companies) {
            displayMembers(bestMembersRandom(data.companies));
        } else {
            console.error('Invalid data structure:', data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

//Función que filtre los miembros, solo los que tengan membership Gold o Platinum
function bestMembersRandom(members) {
    if (!Array.isArray(members)) {
        console.error('Members data is not an array:', members);
        return [];
    }
    
    // Filtra los miembros con level Gold o Platinum
    const result = members.filter((member) => 
        member.level === "Gold" || member.level === "Platinum"
    );
    
    // Mezcla el array y toma solo 3 al azar
    const shuffled = result.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

const displayMembers = (members) => {
    if (!Array.isArray(members) || members.length === 0) {
        console.error('No members to display');
        return;
    }

    membersContainer.innerHTML = ''; // Clear existing content
    
    members.forEach(member => {
        const card = document.createElement('section');
        card.className = 'member-card';
        card.innerHTML = `
            <h2>${member.name}</h2>
            <img src="${member.image}" alt="${member.name} logo" width="340" height="440" loading="lazy">
            <p>Phone: ${member.phonenumber}</p>
            <p>Address: ${member.address}</p>
            <p>Website: <a href="${member.websiteLink}" target="_blank">${member.websiteName}</a></p>
            <p>Membership Level: ${member.level}</p>
        `;
        
        // Set background color based on membership level
        card.style.backgroundColor = member.level === "Gold" ? "#FFD700" : "#C4C4C4";
        
        membersContainer.appendChild(card);
    });
};

// Wait for DOM to be fully loaded before fetching data
document.addEventListener('DOMContentLoaded', getData);