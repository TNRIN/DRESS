/**
 * Shopping Cart functionality for Elegance Dress Shop
 * Handles cart operations and checkout process
 */

// Cart items array
let cartItems = [];

// Cart storage keys
const CART_STORAGE_KEY = 'elegance_cart';
const CART_EXPIRY_KEY = 'elegance_cart_expiry';

// Initialize cart
function initCart() {
    loadCartFromStorage();
    updateCartDisplay();
    
    // Setup modal cleanup
    setupModalCleanup();
}

// Save cart to storage (localStorage with fallback to cookies)
function saveCartToStorage() {
    const cartJson = JSON.stringify(cartItems);
    
    // Set expiration time to 24 hours from now
    const expiryTime = new Date();
    expiryTime.setTime(expiryTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    
    try {
        // Try to use localStorage first
        localStorage.setItem(CART_STORAGE_KEY, cartJson);
        localStorage.setItem(CART_EXPIRY_KEY, expiryTime.getTime().toString());
    } catch (e) {
        // Fallback to cookies if localStorage is not available
        setCookie(CART_STORAGE_KEY, cartJson, 1); // Save for 1 day (24 hours)
    }
}

// Load cart from storage
function loadCartFromStorage() {
    let cartJson = null;
    let isExpired = true;
    
    try {
        // Try to get from localStorage first
        cartJson = localStorage.getItem(CART_STORAGE_KEY);
        const expiryTime = localStorage.getItem(CART_EXPIRY_KEY);
        
        // Check if cart has expired
        if (expiryTime) {
            isExpired = new Date().getTime() > parseInt(expiryTime);
        }
    } catch (e) {
        // Fallback to cookies
        cartJson = getCookie(CART_STORAGE_KEY);
        // Cookies handle their own expiration
        isExpired = !cartJson;
    }
    
    // If cart exists and is not expired, parse it
    if (cartJson && !isExpired) {
        try {
            cartItems = JSON.parse(cartJson);
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cartItems = [];
        }
    } else {
        // Clear expired cart
        cartItems = [];
        clearCartStorage();
    }
}

// Clear cart storage
function clearCartStorage() {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_EXPIRY_KEY);
    } catch (e) {
        // Fallback to clearing cookies
        setCookie(CART_STORAGE_KEY, '', -1);
    }
}

// Set cookie helper function
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

// Get cookie helper function
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// Add item to cart
function addToCart(item) {
    // Validate required fields
    if (!item.id || !item.name || !item.price || !item.image) {
        console.error('Invalid item data:', item);
        return;
    }

    // Ensure quantity is a valid number
    item.quantity = parseInt(item.quantity) || 1;
    if (item.quantity < 1) item.quantity = 1;

    // Ensure size and color have default values
    item.size = item.size || 'One Size';
    item.color = item.color || 'Default';

    // Check if item already exists in cart (same product, size, and color)
    const existingItemIndex = cartItems.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.size === item.size && 
        cartItem.color === item.color
    );
    
    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += item.quantity;
    } else {
        // Add new item to cart
        cartItems.push(item);
    }
    
    // Save cart and update display
    saveCartToStorage();
    updateCartDisplay();
}

// Remove item from cart
function removeFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        saveCartToStorage();
        updateCartDisplay();
    }
}

// Update item quantity in cart
function updateCartItemQuantity(index, quantity) {
    if (index >= 0 && index < cartItems.length) {
        cartItems[index].quantity = Math.max(1, quantity);
        saveCartToStorage();
        updateCartDisplay();
    }
}

// Clear cart
function clearCart() {
    cartItems = [];
    clearCartStorage();
    updateCartDisplay();
}

// Calculate cart total
function calculateCartTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate shipping cost
function calculateShipping() {
    const subtotal = calculateCartTotal();
    // Free shipping for orders over $100
    return subtotal > 100 ? 0 : 10;
}

// Update cart display
function updateCartDisplay() {
    // Update cart count in navbar
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Update cart page if on cart page
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        renderCartItems(cartItemsContainer);
    }
}

// Render cart items in container
function renderCartItems(container) {
    // Show empty cart message if cart is empty
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (cartItems.length === 0) {
        container.innerHTML = '';
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        return;
    }
    
    // Hide empty cart message
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Add each cart item
    cartItems.forEach((item, index) => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        cartItemElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-2 col-3">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded cart-item-image">
                </div>
                <div class="col-md-4 col-9 cart-item-details">
                    <h5>${item.name}</h5>
                    <p>Size: ${item.size} | Color: ${item.color}</p>
                    <p class="cart-item-price">${formatCurrency(item.price)}</p>
                </div>
                <div class="col-md-3 col-6 mt-2 mt-md-0">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary decrease-quantity" type="button" data-index="${index}">-</button>
                        <input type="number" class="form-control text-center item-quantity" value="${item.quantity}" min="1" data-index="${index}">
                        <button class="btn btn-outline-secondary increase-quantity" type="button" data-index="${index}">+</button>
                    </div>
                </div>
                <div class="col-md-2 col-3 text-end mt-2 mt-md-0">
                    <span class="fw-bold">${formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div class="col-md-1 col-3 text-end mt-2 mt-md-0">
                    <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(cartItemElement);
    });
    
    // Add event listeners to cart item buttons
    addCartItemEventListeners();
    
    // Update order summary
    updateOrderSummary();
}

// Add event listeners to cart item elements
function addCartItemEventListeners() {
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
    
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const currentQuantity = cartItems[index].quantity;
            if (currentQuantity > 1) {
                updateCartItemQuantity(index, currentQuantity - 1);
            }
        });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const currentQuantity = cartItems[index].quantity;
            updateCartItemQuantity(index, currentQuantity + 1);
        });
    });
    
    // Quantity input fields
    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const quantity = parseInt(this.value);
            if (!isNaN(quantity) && quantity > 0) {
                updateCartItemQuantity(index, quantity);
            } else {
                this.value = cartItems[index].quantity;
            }
        });
    });
    
    // Clear cart button
    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
            }
        });
    }
}

// Update order summary
function updateOrderSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement && shippingElement && totalElement) {
        const subtotal = calculateCartTotal();
        const shipping = calculateShipping();
        const total = subtotal + shipping;
        
        subtotalElement.textContent = formatCurrency(subtotal);
        shippingElement.textContent = shipping === 0 ? 'Free' : formatCurrency(shipping);
        totalElement.textContent = formatCurrency(total);
    }
}

// Handle checkout form submission
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;
    
    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (cartItems.length === 0) {
            alert('Your cart is empty. Please add items before checking out.');
            return;
        }
        
        // Get customer information
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerEmail = document.getElementById('customer-email').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerNotes = document.getElementById('customer-notes').value;
        
        // Generate order number
        const orderNumber = getNextOrderNumber();
        
        // Create order details text for WhatsApp
        let orderText = `*New Order: ${orderNumber}*\n\n`;
        orderText += `*Customer Information:*\n`;
        orderText += `Name: ${customerName}\n`;
        orderText += `Phone: ${customerPhone}\n`;
        orderText += `Email: ${customerEmail}\n`;
        orderText += `Address: ${customerAddress}\n`;
        if (customerNotes) {
            orderText += `Notes: ${customerNotes}\n`;
        }
        
        orderText += `\n*Order Items:*\n`;
        cartItems.forEach((item, index) => {
            orderText += `${index + 1}. ${item.name} - ${item.size}, ${item.color}\n`;
            orderText += `   Quantity: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}\n`;
        });
        
        const subtotal = calculateCartTotal();
        const shipping = calculateShipping();
        const total = subtotal + shipping;
        
        orderText += `\n*Order Summary:*\n`;
        orderText += `Subtotal: ${formatCurrency(subtotal)}\n`;
        orderText += `Shipping: ${shipping === 0 ? 'Free' : formatCurrency(shipping)}\n`;
        orderText += `Total: ${formatCurrency(total)}\n`;
        
        // Generate WhatsApp URL
        const whatsappUrl = generateWhatsAppOrderUrl(orderText);
        
        // Set WhatsApp link in confirmation modal
        document.getElementById('whatsapp-order-link').href = whatsappUrl;
        
        // Show confirmation modal
        const confirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
        confirmationModal.show();
        
        // Clear cart after successful order
        document.getElementById('whatsapp-order-link').addEventListener('click', function() {
            clearCart();
            confirmationModal.hide();
        });
    });
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCart();
    
    // Setup checkout form if on cart page
    setupCheckoutForm();
});