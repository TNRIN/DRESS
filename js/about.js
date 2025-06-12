/**
 * About page functionality for Elegance Dress Shop
 */

// Initialize the about page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize system configuration
    initSystemConfig().then(() => {
        console.log('System configuration loaded');
    }).catch(error => {
        console.error('Error initializing system:', error);
    });
    
    // Setup contact form
    setupContactForm();
});

// Setup contact form submission
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form data
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;
        
        // In a real application, you would send this data to a server
        console.log('Contact form submission:', { name, email, subject, message });
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('contactSuccessModal'));
        successModal.show();
        
        // Reset form
        contactForm.reset();
    });
}

// Animate elements when they come into view
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Setup team member social links
function setupTeamSocialLinks() {
    document.querySelectorAll('.social-icons a').forEach(link => {
        link.addEventListener('click', function(event) {
            // Prevent default only for demo purposes
            // In a real application, these would link to actual social profiles
            event.preventDefault();
            
            const platform = this.querySelector('i').className.includes('linkedin') ? 'LinkedIn' :
                           this.querySelector('i').className.includes('instagram') ? 'Instagram' : 'Email';
            
            alert(`This would link to the team member's ${platform} profile in a real application.`);
        });
    });
}

// Initialize animations and social links
document.addEventListener('DOMContentLoaded', function() {
    setupScrollAnimations();
    setupTeamSocialLinks();
});