/**
 * Main JavaScript for Elegance Dress Shop Home Page
 */

// Import required functions from products.js
window.createProductCard = window.createProductCard || function() {
    console.error('createProductCard function not loaded');
    return '';
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize system configuration
    initSystemConfig().then(() => {
        console.log('System configuration loaded');
        
        // Load and display featured products
        loadFeaturedProducts();
    }).catch(error => {
        console.error('Error initializing system:', error);
    });
});

// Load and display featured products
async function loadFeaturedProducts() {
    try {
        // Initialize products
        await initProducts();
        
        // Get featured products
        const featuredProducts = window.allProducts.filter(product => product.featured);
        
        // Display featured products in the container
        const container = document.getElementById('featured-items');
        if (!container) {
            console.error('Featured items container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create row for grid
        const row = document.createElement('div');
        row.className = 'row g-4';

        // Display up to 6 featured products
        featuredProducts.slice(0, 6).forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = createProductCard(product);
            row.appendChild(col);
        });

        container.appendChild(row);
        console.log(`Displayed ${Math.min(featuredProducts.length, 6)} featured products`);
    } catch (error) {
        console.error('Error loading featured products:', error);
        displayErrorMessage('featured-items');
    }
}

// Display error message in container
function displayErrorMessage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12 text-center py-4">
            <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
            <p class="mt-3">Sorry, we couldn't load the products at this time.</p>
            <button onclick="location.reload()" class="btn btn-outline-primary">Try Again</button>
        </div>
    `;
}

// Add event listeners for category links
function setupCategoryLinks() {
    document.querySelectorAll('[href^="shop.html?category="]').forEach(link => {
        link.addEventListener('click', function(event) {
            const category = this.href.split('=')[1];
            localStorage.setItem('selected_category', category);
        });
    });
}

// Setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (email) {
            // In a real application, you would send this to a server
            console.log('Newsletter subscription:', email);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success mt-3';
            successMessage.textContent = 'Thank you for subscribing to our newsletter!';
            
            this.appendChild(successMessage);
            emailInput.value = '';
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }
    });
}

// Setup category links and newsletter form
document.addEventListener('DOMContentLoaded', function() {
    setupCategoryLinks();
    setupNewsletterForm();
});