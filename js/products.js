/**
 * Products management for Elegance Dress Shop
 * Handles loading, filtering, and displaying products
 */

// Global products array
let allProducts = [];

// Export functions for use in other modules
window.initProducts = initProducts;
window.allProducts = allProducts;
window.createProductCard = createProductCard;

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('./data/products.json');
        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid products data: expected an array');
        }
        allProducts = data;
        console.log(`Loaded ${allProducts.length} products successfully`);
        return allProducts;
    } catch (error) {
        console.error('Error loading products:', error);
        throw error; // Propagate error to caller
    }
}

// Initialize products
async function initProducts() {
    await loadProducts();
    return allProducts;
}

// Get product by ID
function getProductById(productId) {
    return allProducts.find(product => product.id === productId);
}

// Filter products by category
function filterProductsByCategory(category) {
    if (!category || category === 'all') {
        return allProducts;
    }
    return allProducts.filter(product => product.category === category);
}

// Filter products by multiple criteria
function filterProducts(filters) {
    return allProducts.filter(product => {
        // Category filter
        if (filters.categories && filters.categories.length > 0 && !filters.categories.includes('all')) {
            if (!filters.categories.includes(product.category)) {
                return false;
            }
        }
        
        // Size filter
        if (filters.sizes && filters.sizes.length > 0) {
            if (!product.sizes.some(size => filters.sizes.includes(size))) {
                return false;
            }
        }
        
        // Color filter
        if (filters.colors && filters.colors.length > 0) {
            if (!product.colors.some(color => filters.colors.includes(color))) {
                return false;
            }
        }
        
        // Price filter
        if (filters.maxPrice && product.price > filters.maxPrice) {
            return false;
        }
        
        return true;
    });
}

// Sort products
function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'featured':
        default:
            // Featured products first, then by ID
            sortedProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id - b.id;
            });
            break;
    }
    
    return sortedProducts;
}

// Create product card HTML
function createProductCard(product) {
    if (!product || !product.id || !product.name || !product.price) {
        console.error('Invalid product data:', product);
        return null;
    }

    const cardId = `product-card-${product.id}`;
    const productCard = document.createElement('div');
    productCard.className = 'col-md-6 col-lg-4 mb-4';
    productCard.id = cardId;
    
    // Format prices
    const formattedPrice = formatCurrency(product.price);
    const formattedDiscountPrice = product.discountPrice ? formatCurrency(product.discountPrice) : null;
    
    // Create badge HTML if product is featured or has discount
    let badgeHtml = '';
    if (product.featured || formattedDiscountPrice) {
        badgeHtml = `
            <div class="position-absolute top-0 start-0 p-2">
                ${product.featured ? '<span class="badge bg-primary me-1">Featured</span>' : ''}
                ${formattedDiscountPrice ? '<span class="badge bg-danger">Sale</span>' : ''}
            </div>
        `;
    }
    
    // Get image URL with fallback
    const imageUrl = (product.images && product.images.length > 0) ? 
        product.images[0] : 
        (product.image || '/images/products/placeholder.svg');
    
    // Create price display HTML
    const priceHtml = formattedDiscountPrice ? 
        `<p class="card-text mb-2">
            <span class="text-decoration-line-through text-muted">${formattedPrice}</span>
            <span class="text-danger ms-2">${formattedDiscountPrice}</span>
        </p>` : 
        `<p class="card-text mb-2">${formattedPrice}</p>`;
    
    productCard.innerHTML = `
        <div class="card product-card h-100">
            ${badgeHtml}
            <img src="${imageUrl}" 
                 class="card-img-top" 
                 alt="${product.name}" 
                 onerror="this.src='/images/products/placeholder.svg'">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="text-muted small text-capitalize">${product.category}</p>
                ${priceHtml}
                ${product.rating ? `
                <div class="mb-2">
                    <div class="d-flex small text-warning">
                        ${Array(Math.floor(product.rating || 0)).fill().map(() => '<div class="bi-star-fill"></div>').join('')}
                        ${product.rating % 1 !== 0 ? '<div class="bi-star-half"></div>' : ''}
                    </div>
                    <span class="small">${product.rating} Stars</span>
                </div>
                ` : ''}
                <div class="mt-auto d-flex justify-content-between gap-2">
                    <button class="btn btn-sm btn-outline-primary quick-view-btn" 
                            data-product-id="${product.id}">
                        <i class="bi bi-eye"></i> Quick View
                    </button>
                    <button class="btn btn-sm btn-primary add-to-cart-btn" 
                            data-product-id="${product.id}"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus"></i> 
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return productCard;
}

// Display products in grid
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) {
        console.error('Products container not found');
        return;
    }
    
    // Clear existing products
    productsContainer.innerHTML = '';
    
    // Create and append product cards
    products.forEach(product => {
        const productCardHTML = createProductCard(product);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = productCardHTML;
        const productCard = tempContainer.firstElementChild;
        productsContainer.appendChild(productCard);
    });

    // Ensure modal backdrop is removed when modal is closed
    const quickViewModal = document.getElementById('quickViewModal');
    if (quickViewModal) {
        quickViewModal.addEventListener('hidden.bs.modal', function () {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }
}
    
    // Add event listeners to buttons
    addProductButtonListeners();
    
    // Log success
    console.log(`Displayed ${allProducts.length} products`);


// Add event listeners to product buttons
function addProductButtonListeners() {
    // Quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productId = button.getAttribute('data-product-id');
            if (productId) {
                openProductQuickView(productId);
            } else {
                console.error('Product ID not found on quick view button');
            }
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productId = button.getAttribute('data-product-id');
            if (!productId) {
                console.error('Product ID not found on add to cart button');
                return;
            }
            
            const product = getProductById(parseInt(productId));
            if (!product) {
                console.error('Product not found:', productId);
                return;
            }
            
            if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
                // If product has size or color options, open quick view
                openProductQuickView(productId);
            } else {
                // Otherwise, add to cart directly
                addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    quantity: 1
                });
                showToast(`${product.name} added to cart!`);
            }
        });
    });
    
    // Reset filters button
    const resetFiltersButton = document.getElementById('reset-filters');
    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', function() {
            // Reset filter checkboxes
            document.querySelectorAll('.category-filter, .size-filter, .color-filter').forEach(checkbox => {
                checkbox.checked = checkbox.value === 'all';
            });
            
            // Reset price range
            const priceRange = document.getElementById('price-range');
            if (priceRange) {
                priceRange.value = priceRange.max;
                document.getElementById('price-value').textContent = priceRange.max;
            }
            
            // Apply filters
            document.getElementById('apply-filters').click();
        });
    }
}

// Open product quick view modal
function openProductQuickView(productId) {
    const product = getProductById(parseInt(productId));
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    // Get modal element
    const modalElement = document.getElementById('productModal');
    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }
    
    // Set modal content
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-category').textContent = product.category;
    document.getElementById('modal-product-price').textContent = formatCurrency(product.price);
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-product-image').src = product.images[0]; // Use the first image from the images array
    
    // Populate size options
    const sizeSelect = document.getElementById('modal-product-size');
    sizeSelect.innerHTML = '';
    product.sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
    });
    
    // Populate color options
    const colorSelect = document.getElementById('modal-product-color');
    colorSelect.innerHTML = '';
    product.colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        colorSelect.appendChild(option);
    });
    
    // Reset quantity to 1
    const quantityInput = document.getElementById('modal-product-quantity');
    quantityInput.value = '1';
    
    // Set add to cart button action
    const addToCartButton = document.getElementById('modal-add-to-cart');
    addToCartButton.onclick = function() {
        const size = sizeSelect.value;
        const color = colorSelect.value;
        const quantity = parseInt(quantityInput.value) || 1;
        
        if (quantity < 1) {
            showToast('Please enter a valid quantity');
            return;
        }
        
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0], // Use the first image from the images array
            size: size,
            color: color,
            quantity: quantity
        });
        
        // Close modal and show confirmation
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        showToast(`${product.name} added to cart!`);
    };
    
    // Open modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Show toast notification
function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Elegance</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}