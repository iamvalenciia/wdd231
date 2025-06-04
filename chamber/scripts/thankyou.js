document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get the application info container
    const applicationInfo = document.getElementById('application-info');
    
    // Create a list to display the information
    const infoList = document.createElement('ul');
    
    // Add each required field to the list
    const requiredFields = [
        { param: 'firstName', label: 'First Name' },
        { param: 'lastName', label: 'Last Name' },
        { param: 'email', label: 'Email' },
        { param: 'phone', label: 'Phone Number' },
        { param: 'businessName', label: 'Business Name' },
        { param: 'timestamp', label: 'Application Date' }
    ];
    
    requiredFields.forEach(field => {
        const value = urlParams.get(field.param);
        if (value) {
            const listItem = document.createElement('li');
            let displayValue = value;
            
            // Format the timestamp if it's the timestamp field
            if (field.param === 'timestamp') {
                const date = new Date(value);
                displayValue = date.toLocaleString();
            }
            
            listItem.innerHTML = `<strong>${field.label}:</strong> ${displayValue}`;
            infoList.appendChild(listItem);
        }
    });
    
    // Add the list to the container
    applicationInfo.appendChild(infoList);
}); 