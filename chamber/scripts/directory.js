// Directory page functionality
document.addEventListener('DOMContentLoaded', () => {
    const directoryContainer = document.getElementById('directory-container');
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');

    // Fetch and display members
    async function getMembers() {
        try {
            const response = await fetch('data/members.json');
            const data = await response.json();
            displayMembers(data.companies);
        } catch (error) {
            console.error('Error loading members:', error);
            directoryContainer.innerHTML = '<p>Error loading directory data. Please try again later.</p>';
        }
    }

    // Display members in the current view
    function displayMembers(members) {
        const isGridView = directoryContainer.classList.contains('grid-view');
        
        if (isGridView) {
            displayGridView(members);
        } else {
            displayListView(members);
        }
    }

    // Display members in grid view
    function displayGridView(members) {
        directoryContainer.innerHTML = members.map(member => `
            <div class="member-card">
                <img src="${member.image}" alt="${member.name}" loading="lazy">
                <h3>${member.name}</h3>
                <p class="address">${member.address}</p>
                <p class="phone">${member.phonenumber}</p>
                <a href="${member.websiteLink}" target="_blank" rel="noopener noreferrer">${member.websiteName}</a>
                <div class="membership-level">
                    ${member.level}
                </div>
            </div>
        `).join('');
    }

    // Display members in list view
    function displayListView(members) {
        directoryContainer.innerHTML = members.map(member => `
            <div class="member-list-item">
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p class="address">${member.address}</p>
                    <p class="phone">${member.phonenumber}</p>
                    <a href="${member.websiteLink}" target="_blank" rel="noopener noreferrer">${member.websiteName}</a>
                </div>
                <div class="membership-level">
                    ${member.level}
                </div>
            </div>
        `).join('');
    }

    // View switching functionality
    gridViewBtn.addEventListener('click', () => {
        directoryContainer.classList.add('grid-view');
        directoryContainer.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        getMembers(); // Refresh display
    });

    listViewBtn.addEventListener('click', () => {
        directoryContainer.classList.add('list-view');
        directoryContainer.classList.remove('grid-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        getMembers(); // Refresh display
    });

    // Initial load
    getMembers();
}); 