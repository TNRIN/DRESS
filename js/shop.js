/**
 * Shop page functionality for Elegance Dress Shop
 * Handles product filtering, sorting, and pagination
 */

// Global variables
let currentProducts = [];
let currentPage = 1;
const productsPerPage = 9;

// Initialize the shop page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize system configuration
    initSystemConfig().then(() => {
        console.log('System configuration loaded');
        
        // Load products and initialize shop
        return initializeShop();
    }).then(() => {
        console.log('Shop initialized successfully');
        // Ensure event listeners are attached after products are displayed
        addProductButtonListeners();
        
        // Setup modal cleanup
        setupModalCleanup();
    }).catch(error => {
        console.error('Error initializing system:', error);
        displayErrorMessage('products-container', 'Failed to load products. Please try refreshing the page.');
    });
});

// Initialize shop functionality
async function initializeShop() {
    try {
        // Initialize products
        await initProducts();
        
        // Set initial products
        currentProducts = [...allProducts];
        
        // Check for category parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        // Check for stored category from home page
        const storedCategory = localStorage.getItem('selected_category');
        if (storedCategory) {
            localStorage.removeItem('selected_category');
        }
        
        // Apply category filter if present
        if (categoryParam || storedCategory) {
            const category = categoryParam || storedCategory;
            document.querySelectorAll('.category-filter').forEach(checkbox => {
                checkbox.checked = checkbox.value === category;
                if (checkbox.value === 'all') {
                    checkbox.checked = false;
                }
            });
            
            // Apply the filter
            applyFilters();
        } else {
            // Display all products
            displayProductsWithPagination();
        }
        
        // Setup event listeners
        setupFilterListeners();
        setupSortListeners();
        setupPaginationListeners();
    } catch (error) {
        console.error('Error initializing shop:', error);
        displayErrorMessage('products-container');
    }
}

// Apply filters to products
function applyFilters() {
    // Get selected categories
    const selectedCategories = [];
    document.querySelectorAll('.category-filter:checked').forEach(checkbox => {
        if (checkbox.value !== 'all') {
            selectedCategories.push(checkbox.value);
        }
    });
    
    // Get selected sizes
    const selectedSizes = [];
    document.querySelectorAll('.size-filter:checked').forEach(checkbox => {
        selectedSizes.push(checkbox.value);
    });
    
    // Get selected colors
    const selectedColors = [];
    document.querySelectorAll('.color-filter:checked').forEach(checkbox => {
        selectedColors.push(checkbox.value);
    });
    
    // Get price range
    const maxPrice = parseInt(document.getElementById('price-range').value);
    
    // Create filters object
    const filters = {
        categories: selectedCategories.length > 0 ? selectedCategories : ['all'],
        sizes: selectedSizes,
        colors: selectedColors,
        maxPrice: maxPrice
    };
    
    // Apply filters
    currentProducts = filterProducts(filters);
    
    // Sort products
    const sortBy = document.getElementById('sort-products').value;
    currentProducts = sortProducts(currentProducts, sortBy);
    
    // Reset to first page
    currentPage = 1;
    
    // Display filtered products
    displayProductsWithPagination();
}

// Display products with pagination
function displayProductsWithPagination() {
    try {
        const container = document.getElementById('products-container');
        if (!container) {
            console.error('Products container not found');
            return;
        }

        // Show loading state
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading products...</p>
            </div>
        `;

        // Ensure we have products to display
        if (!Array.isArray(currentProducts)) {
            throw new Error('Products data is invalid');
        }

        // Calculate pagination
        const totalPages = Math.ceil(currentProducts.length / productsPerPage);
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = currentProducts.slice(startIndex, endIndex);
        
        // Display products or show empty state
        if (currentProducts.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search" style="font-size: 3rem;"></i>
                    <p class="mt-3">No products found matching your criteria.</p>
                    <button onclick="resetFilters()" class="btn btn-primary">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filters
                    </button>
                </div>
            `;
        } else {
            // Clear container
            container.innerHTML = '';
            
            // Create row for products
            const row = document.createElement('div');
            row.className = 'row';
            
            // Add product cards
            productsToDisplay.forEach(product => {
                const productCard = createProductCard(product);
                if (productCard) {
                    row.appendChild(productCard);
                }
            });
            
            container.appendChild(row);
            
            // Ensure event listeners are attached
            addProductButtonListeners();
        }
        
        // Generate pagination
        generatePagination(totalPages);
        
        // Update product count
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = currentProducts.length;
        }

        console.log(`Displayed ${productsToDisplay.length} of ${currentProducts.length} products`);
    } catch (error) {
        console.error('Error displaying products:', error);
        displayErrorMessage('products-container', 'Error displaying products. Please try again.');
    }
}

// Generate pagination controls
function generatePagination(totalPages) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;
    
    paginationElement.innerHTML = '';
    
    // Don't show pagination if only one page
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                            <span aria-hidden="true">&laquo;</span>
                        </a>`;
    paginationElement.appendChild(prevLi);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if end page is at maximum
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page if not visible
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
        paginationElement.appendChild(firstLi);
        
        // Ellipsis if needed
        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `<a class="page-link" href="#">...</a>`;
            paginationElement.appendChild(ellipsisLi);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        paginationElement.appendChild(pageLi);
    }
    
    // Last page if not visible
    if (endPage < totalPages) {
        // Ellipsis if needed
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `<a class="page-link" href="#">...</a>`;
            paginationElement.appendChild(ellipsisLi);
        }
        
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
        paginationElement.appendChild(lastLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                            <span aria-hidden="true">&raquo;</span>
                        </a>`;
    paginationElement.appendChild(nextLi);
    
    // Add event listeners to pagination links
    document.querySelectorAll('.page-link[data-page]').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            if (page !== currentPage && page >= 1 && page <= totalPages) {
                currentPage = page;
                displayProductsWithPagination();
                // Scroll to top of products
                document.getElementById('shop-content').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Setup filter event listeners
function setupFilterListeners() {
    // Category filter checkboxes
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // If 'All' is checked, uncheck others
            if (this.value === 'all' && this.checked) {
                document.querySelectorAll('.category-filter:not([value="all"])').forEach(cb => {
                    cb.checked = false;
                });
            } 
            // If specific category is checked, uncheck 'All'
            else if (this.value !== 'all' && this.checked) {
                document.querySelector('.category-filter[value="all"]').checked = false;
            }
            
            // If no categories are checked, check 'All'
            const anyChecked = Array.from(document.querySelectorAll('.category-filter')).some(cb => cb.checked);
            if (!anyChecked) {
                document.querySelector('.category-filter[value="all"]').checked = true;
            }
        });
    });
    
    // Price range slider
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = this.value;
        });
    }
    
    // Apply filters button
    const applyFiltersButton = document.getElementById('apply-filters');
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', function() {
            applyFilters();
        });
    }
}

// Setup sort event listeners
function setupSortListeners() {
    const sortSelect = document.getElementById('sort-products');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            currentProducts = sortProducts(currentProducts, sortBy);
            displayProductsWithPagination();
        });
    }
}

// Setup pagination event listeners
function setupPaginationListeners() {
    // This is handled in the generatePagination function
}

// Display error message
function displayErrorMessage(containerId, message = 'Sorry, there was an error loading the products.') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
                <p class="mt-3">${message}</p>
                <div class="mt-3">
                    <button onclick="location.reload()" class="btn btn-primary me-2">
                        <i class="bi bi-arrow-clockwise me-1"></i>Refresh Page
                    </button>
                    <button onclick="window.location.href='/'" class="btn btn-outline-primary">
                        <i class="bi bi-house me-1"></i>Go to Home
                    </button>
                </div>
            </div>
        `;
    } else {
        console.error('Error container not found:', containerId);
    }
}

// Reset all filters
function resetFilters() {
    try {
        // Reset category filters
        document.querySelectorAll('.category-filter').forEach(checkbox => {
            checkbox.checked = checkbox.value === 'all';
        });
        
        // Reset size filters
        document.querySelectorAll('.size-filter').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset color filters
        document.querySelectorAll('.color-filter').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset price range
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.value = priceRange.max;
            // Update price display
            const priceDisplay = document.getElementById('price-display');
            if (priceDisplay) {
                priceDisplay.textContent = formatCurrency(priceRange.value);
            }
        }
        
        // Reset sort selection
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = 'default';
        }
        
        // Reset to first page
        currentPage = 1;
        
        // Reset current products to all products
        currentProducts = [...allProducts];
        
        // Apply filters and update display
        applyFilters();
        
        // Show success message
        showToast('Filters have been reset');
    } catch (error) {
        console.error('Error resetting filters:', error);
        showToast('Error resetting filters. Please try again.');
    }
}