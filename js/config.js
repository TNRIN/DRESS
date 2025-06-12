/**
 * System configuration and utilities for Elegance Dress Shop
 */

// Setup modal cleanup
function setupModalCleanup() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function () {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    });
}

// Export utility functions
window.setupModalCleanup = setupModalCleanup;

// Load system configuration from JSON file
async function loadSystemConfig() {
    try {
        const response = await fetch('/data/system.json');
        if (!response.ok) {
            throw new Error('Failed to load system configuration');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading system configuration:', error);
        // Fallback configuration in case the JSON file can't be loaded
        return {
            adminWhatsapp: '1234567890',
            lastOrderNumber: 1000,
            storeName: 'Elegance',
            currency: 'LKR',
            shippingFee: 10
        };
    }
}

// Global system configuration object
let systemConfig = null;

// Initialize system configuration
async function initSystemConfig() {
    systemConfig = await loadSystemConfig();
    return systemConfig;
}

// Get the next order number and update it
function getNextOrderNumber() {
    if (!systemConfig) {
        console.error('System configuration not initialized');
        return 'ERR-' + Math.floor(Math.random() * 1000);
    }
    
    systemConfig.lastOrderNumber += 1;
    return 'ORD-' + systemConfig.lastOrderNumber;
}

// Format currency
function formatCurrency(amount) {
    if (!systemConfig) {
        return 'LKR ' + amount.toFixed(2);
    }
    return systemConfig.currency + ' ' + amount.toFixed(2);
}

// Get admin WhatsApp number
function getAdminWhatsapp() {
    if (!systemConfig) {
        console.error('System configuration not initialized');
        return '1234567890';
    }
    return systemConfig.adminWhatsapp;
}

// Generate WhatsApp order URL
function generateWhatsAppOrderUrl(orderDetails) {
    const whatsappNumber = getAdminWhatsapp();
    const orderText = encodeURIComponent(orderDetails);
    return `https://wa.me/${whatsappNumber}?text=${orderText}`;
}