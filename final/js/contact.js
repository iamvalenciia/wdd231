// Contact page JavaScript module
import { UIManager } from './ui.js';

class ContactApp {
    constructor() {
        this.ui = new UIManager();
    }

    // Initialize the contact page
    initialize() {
        try {
            console.log('Initializing Contact App...');
            
            // Initialize UI components
            this.ui.initialize();
            
            // Setup form functionality
            this.setupForm();
            
            console.log('Contact App initialized successfully');
        } catch (error) {
            console.error('Error initializing contact app:', error);
        }
    }

    // Setup form functionality
    setupForm() {
        const form = document.getElementById('contact-form');
        const messageTextarea = document.getElementById('message');
        const charCountElement = document.getElementById('char-count');

        // Character counter for message field
        if (messageTextarea && charCountElement) {
            messageTextarea.addEventListener('input', (e) => {
                const currentLength = e.target.value.length;
                charCountElement.textContent = currentLength;
                
                // Update styling based on character count
                if (currentLength > 450) {
                    charCountElement.style.color = '#f44336'; // Red when near limit
                } else if (currentLength > 400) {
                    charCountElement.style.color = '#ff9800'; // Orange when getting close
                } else {
                    charCountElement.style.color = '#666'; // Default gray
                }
            });
        }

        // Form validation and submission
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmission(e);
            });
        }

        // Real-time validation for email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }

        // Real-time validation for name
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.addEventListener('blur', () => {
                this.validateName(nameInput);
            });
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }

    // Handle form submission
    handleFormSubmission(event) {
        // Don't prevent default - let the form submit normally to form-action.html
        // But we can still do client-side validation
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Basic validation
        let isValid = true;
        const errors = [];

        // Validate required fields
        const requiredFields = ['name', 'email', 'subject', 'message', 'privacy'];
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.isFieldValid(field)) {
                isValid = false;
                errors.push(`${this.getFieldLabel(fieldName)} is required`);
                this.showFieldError(field);
            } else {
                this.clearFieldError(field);
            }
        });

        // Validate email format
        const email = formData.get('email');
        if (email && !this.isValidEmail(email)) {
            isValid = false;
            errors.push('Please enter a valid email address');
            this.showFieldError(form.querySelector('[name="email"]'));
        }

        // Validate message length
        const message = formData.get('message');
        if (message && (message.length < 10 || message.length > 500)) {
            isValid = false;
            errors.push('Message must be between 10 and 500 characters');
            this.showFieldError(form.querySelector('[name="message"]'));
        }

        if (!isValid) {
            event.preventDefault(); // Prevent submission if validation fails
            this.showValidationErrors(errors);
            return false;
        }

        // If validation passes, show success message briefly before redirect
        this.showSubmissionMessage();
        
        // Store form data in localStorage for reference
        this.storeFormSubmission(formData);
        
        return true; // Allow form submission
    }

    // Check if field is valid
    isFieldValid(field) {
        if (!field) return false;
        
        if (field.type === 'checkbox') {
            return field.checked;
        }
        
        return field.value.trim() !== '';
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate name field
    validateName(nameInput) {
        const name = nameInput.value.trim();
        if (name.length < 2) {
            this.showFieldError(nameInput, 'Name must be at least 2 characters long');
            return false;
        }
        if (name.length > 50) {
            this.showFieldError(nameInput, 'Name must be less than 50 characters');
            return false;
        }
        this.clearFieldError(nameInput);
        return true;
    }

    // Validate email field
    validateEmail(emailInput) {
        const email = emailInput.value.trim();
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
            return false;
        }
        this.clearFieldError(emailInput);
        return true;
    }

    // Format phone number as user types
    formatPhoneNumber(phoneInput) {
        let value = phoneInput.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length > 10) {
            value = value.slice(0, 10); // Limit to 10 digits
        }
        
        // Format as XXX-XXX-XXXX
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{3})/, '$1-$2');
        }
        
        phoneInput.value = value;
    }

    // Show field error
    showFieldError(field, message = 'This field is required') {
        if (!field) return;
        
        field.style.borderColor = '#f44336';
        
        // Remove existing error message
        this.clearFieldError(field);
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#f44336';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }

    // Clear field error
    clearFieldError(field) {
        if (!field) return;
        
        field.style.borderColor = '';
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Show validation errors
    showValidationErrors(errors) {
        const errorMessage = `Please fix the following errors:\n${errors.join('\n')}`;
        alert(errorMessage); // Simple alert for now
    }

    // Get field label for error messages
    getFieldLabel(fieldName) {
        const labels = {
            'name': 'Name',
            'email': 'Email',
            'phone': 'Phone',
            'subject': 'Subject',
            'message': 'Message',
            'privacy': 'Privacy Policy agreement'
        };
        return labels[fieldName] || fieldName;
    }

    // Show submission message
    showSubmissionMessage() {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'submission-success';
        successDiv.innerHTML = `
            <div style="background: #e8f5e8; color: #2e7d32; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                <h3>✅ Sending your message...</h3>
                <p>Please wait while we process your submission.</p>
            </div>
        `;
        
        const form = document.getElementById('contact-form');
        if (form) {
            form.parentNode.insertBefore(successDiv, form);
            
            // Remove after 2 seconds
            setTimeout(() => {
                successDiv.remove();
            }, 2000);
        }
    }

    // Store form submission in localStorage for reference
    storeFormSubmission(formData) {
        try {
            const submission = {
                timestamp: new Date().toISOString(),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'yes',
                privacy: formData.get('privacy') === 'accepted'
            };
            
            // Store in localStorage
            const submissions = JSON.parse(localStorage.getItem('smartSupermarket_formSubmissions') || '[]');
            submissions.push(submission);
            
            // Keep only last 10 submissions
            if (submissions.length > 10) {
                submissions.splice(0, submissions.length - 10);
            }
            
            localStorage.setItem('smartSupermarket_formSubmissions', JSON.stringify(submissions));
            
        } catch (error) {
            console.error('Error storing form submission:', error);
        }
    }

    // Get previous submissions (for debugging/admin purposes)
    getPreviousSubmissions() {
        try {
            return JSON.parse(localStorage.getItem('smartSupermarket_formSubmissions') || '[]');
        } catch (error) {
            console.error('Error retrieving submissions:', error);
            return [];
        }
    }
}

// Initialize the contact app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactApp = new ContactApp();
    try {
        window.contactApp.initialize();
    } catch (error) {
        console.error('Failed to initialize Contact App:', error);
    }
});

// Export for use in other modules if needed
export { ContactApp }; 