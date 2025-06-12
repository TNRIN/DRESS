/**
 * Product detail page functionality for Elegance Dress Shop
 */

// Global variables
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;

// Initialize the product page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize system configuration
    initSystemConfig().then(() => {
        console.log('System configuration loaded');
        // Get product ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            // Load products and then display the selected product
            loadProducts().then(() => {
                displayProductDetail(productId);
                loadRelatedProducts(productId);
                updateCartCount();
            }).catch(error => {
                displayError('Failed to load products. ' + error.message);
            });
        } else {
            displayError('Product ID not specified');
        }
    }).catch(error => {
        displayError('Error initializing system: ' + error.message);
    });
});

// Display product detail
function displayProductDetail(productId) {
    const product = getProductById(parseInt(productId));
    
    if (!product) {
        displayError('Product not found');
        return;
    }
    
    currentProduct = product;
    document.title = `${product.name} - Elegance Dress Shop`;
    
    const productDetailContainer = document.getElementById('product-detail');
    
    // Create HTML for product detail
    const productHTML = `
        <div class="row gx-4 gx-lg-5 align-items-center">
            <div class="col-md-6">
                <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${product.images.map((img, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${img}" class="d-block w-100 product-detail-img" alt="${product.name}">
                            </div>
                        `).join('')}
                    </div>
                    ${product.images.length > 1 ? `
                        <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="col-md-6">
                <div class="small mb-1">SKU: DRESS-${product.id.toString().padStart(4, '0')}</div>
                <h1 class="display-5 fw-bolder">${product.name}</h1>
                <div class="fs-5 mb-3">
                    ${product.discountPrice ? `
                        <span class="text-decoration-line-through">${formatCurrency(product.price)}</span>
                        <span class="text-danger ms-2">${formatCurrency(product.discountPrice)}</span>
                    ` : `
                        <span>${formatCurrency(product.price)}</span>
                    `}
                </div>
                <div class="mb-3">
                    <div class="d-flex small text-warning mb-2">
                        ${Array(Math.floor(product.rating)).fill().map(() => `<div class="bi-star-fill"></div>`).join('')}
                        ${product.rating % 1 !== 0 ? `<div class="bi-star-half"></div>` : ''}
                    </div>
                    <span class="small">${product.rating} Stars</span>
                </div>
                <p class="lead">${product.description}</p>
                
                <div class="mb-3">
                    <h6 class="fw-bold">Size:</h6>
                    <div class="btn-group size-selector" role="group" aria-label="Size selector">
                        ${product.sizes.map(size => `
                            <input type="radio" class="btn-check" name="size" id="size-${size}" value="${size}" autocomplete="off">
                            <label class="btn btn-outline-dark" for="size-${size}">${size}</label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mb-4">
                    <h6 class="fw-bold">Color:</h6>
                    <div class="btn-group color-selector" role="group" aria-label="Color selector">
                        ${product.colors.map(color => `
                            <input type="radio" class="btn-check" name="color" id="color-${color.replace(/\s+/g, '-').toLowerCase()}" value="${color}" autocomplete="off">
                            <label class="btn btn-outline-dark" for="color-${color.replace(/\s+/g, '-').toLowerCase()}">${color}</label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="d-flex">
                    <div class="input-group me-3" style="width: 130px;">
                        <button class="btn btn-outline-dark" type="button" id="decrement-quantity">-</button>
                        <input type="number" class="form-control text-center" id="product-quantity" value="1" min="1" max="10">
                        <button class="btn btn-outline-dark" type="button" id="increment-quantity">+</button>
                    </div>
                    <button class="btn btn-dark flex-shrink-0" type="button" id="add-to-cart-btn" disabled>
                        <i class="bi bi-cart-plus me-1"></i>
                        Add to cart
                    </button>
                </div>
                
                <div class="mt-3" id="selection-warning" style="display: none;">
                    <p class="text-danger">Please select both size and color before adding to cart.</p>
                </div>
                
                <div class="mt-4">
                    <h6 class="fw-bold">Category:</h6>
                    <a href="shop.html?category=${product.category}" class="badge bg-secondary text-decoration-none link-light">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</a>
                </div>
            </div>
        </div>
    `;
    
    productDetailContainer.innerHTML = productHTML;
    
    // Setup event listeners
    setupSizeSelectors();
    setupColorSelectors();
    setupQuantityControls();
    setupAddToCartButton();
}

// Setup size selector event listeners
function setupSizeSelectors() {
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    sizeInputs.forEach(input => {
        input.addEventListener('change', function() {
            selectedSize = this.value;
            checkSelections();
        });
    });
}

// Setup color selector event listeners
function setupColorSelectors() {
    const colorInputs = document.querySelectorAll('input[name="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('change', function() {
            selectedColor = this.value;
            checkSelections();
        });
    });
}

// Setup quantity control buttons
function setupQuantityControls() {
    const quantityInput = document.getElementById('product-quantity');
    const decrementBtn = document.getElementById('decrement-quantity');
    const incrementBtn = document.getElementById('increment-quantity');
    
    decrementBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    incrementBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    // Ensure quantity is always valid
    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > 10) {
            this.value = 10;
        }
    });
}

// Setup add to cart button
function setupAddToCartButton() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    addToCartBtn.addEventListener('click', function() {
        if (!selectedSize || !selectedColor) {
            document.getElementById('selection-warning').style.display = 'block';
            return;
        }
        
        const quantity = parseInt(document.getElementById('product-quantity').value);
        
        // Add to cart
        addToCart({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.discountPrice || currentProduct.price,
            image: currentProduct.images[0], // Use the first image from the images array
            size: selectedSize,
            color: selectedColor,
            quantity: quantity
        });
        
        // Show success message
        showToast(`${currentProduct.name} added to cart!`);
        
        // Update cart count
        updateCartCount();
    });
}

// Check if both size and color are selected
function checkSelections() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const warningElement = document.getElementById('selection-warning');
    
    if (selectedSize && selectedColor) {
        addToCartBtn.disabled = false;
        warningElement.style.display = 'none';
    } else {
        addToCartBtn.disabled = true;
    }
}

// Load related products (same category, excluding current product)
function loadRelatedProducts(currentProductId) {
    const product = getProductById(parseInt(currentProductId));
    if (!product) return;
    
    // Get products in the same category
    const relatedProducts = filterProductsByCategory(product.category)
        .filter(p => p.id !== product.id)
        .slice(0, 4); // Limit to 4 related products
    
    const relatedProductsContainer = document.getElementById('related-products');
    
    if (relatedProducts.length === 0) {
        relatedProductsContainer.innerHTML = '<p class="text-center w-100">No related products found.</p>';
        return;
    }
    
    // Create HTML for related products
    relatedProductsContainer.innerHTML = relatedProducts.map(product => {
        return `
            <div class="col mb-5">
                <div class="card h-100 product-card">
                    ${product.discountPrice ? `<div class="badge bg-danger text-white position-absolute" style="top: 0.5rem; right: 0.5rem">Sale</div>` : ''}
                    <img class="card-img-top" src="${product.image}" alt="${product.name}">
                    <div class="card-body p-4">
                        <div class="text-center">
                            <h5 class="fw-bolder">${product.name}</h5>
                            <div class="d-flex justify-content-center small text-warning mb-2">
                                ${Array(Math.floor(product.rating)).fill().map(() => `<div class="bi-star-fill"></div>`).join('')}
                                ${product.rating % 1 !== 0 ? `<div class="bi-star-half"></div>` : ''}
                            </div>
                            ${product.discountPrice ? `
                                <span class="text-muted text-decoration-line-through">${formatCurrency(product.price)}</span>
                                <span class="text-danger ms-2">${formatCurrency(product.discountPrice)}</span>
                            ` : `
                                <span>${formatCurrency(product.price)}</span>
                            `}
                        </div>
                    </div>
                    <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                        <div class="text-center">
                            <a class="btn btn-outline-dark mt-auto" href="product.html?id=${product.id}">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display error message
function displayError(message) {
    const productDetailContainer = document.getElementById('product-detail');
    productDetailContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${message}
        </div>
        <div class="text-center mt-4">
            <a href="shop.html" class="btn btn-primary">Return to Shop</a>
        </div>
    `;
}

// Show toast notification
function showToast(message) {
    const toastElement = document.getElementById('toast');
    const toastMessageElement = document.getElementById('toast-message');
    
    toastMessageElement.textContent = message;
    
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}