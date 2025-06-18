// UI module for DOM manipulation and user interface components
export class UIManager {
    constructor() {
        this.currentModal = null;
        this.debounceTimer = null;
    }

    // Initialize UI components and event listeners
    initialize() {
        this.setupNavigation();
        this.setupModals();
        this.setupScrollToTop();
        console.log('UI Manager initialized');
    }

    // Setup responsive navigation with hamburger menu
    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('nav ul');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                
                // Update aria-expanded for accessibility
                const isExpanded = navMenu.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Add active class to current page navigation link
        this.updateActiveNavLink();
    }

    // Update active navigation link based on current page
    updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage || 
                (currentPage === '' && linkHref === 'index.html') ||
                (currentPage === 'index.html' && linkHref === './')) {
                link.classList.add('active');
            }
        });
    }

    // Generate product cards using template literals and array methods
    generateProductCards(products) {
        if (!products || products.length === 0) {
            return '<div class="no-results">No products found matching your criteria.</div>';
        }

        // Use map() array method to transform products into HTML
        const productCards = products.map(product => {
            const priceStats = this.calculatePriceStats(product);
            const bestPrice = priceStats ? priceStats.min : 'N/A';
            const worstPrice = priceStats ? priceStats.max : 'N/A';
            const savings = priceStats ? priceStats.savings : '0.00';

            // Use template literals for dynamic HTML generation
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-category">${product.category}</div>
                        <div class="product-brand">Brand: ${product.brand}</div>
                        <div class="price-summary">
                            <div class="best-price">Best: $${bestPrice}</div>
                            <div class="savings">Save: $${savings}</div>
                        </div>
                        <div class="price-comparison">
                            ${this.generatePriceComparison(product.prices)}
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-primary view-details" 
                                    data-product-id="${product.id}">
                                View Details
                            </button>
                            <button class="btn favorite-btn" 
                                    data-product-id="${product.id}"
                                    aria-label="Add to favorites">
                                ♡
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join(''); // Join array elements into single string

        return productCards;
    }

    // Generate price comparison section using template literals
    generatePriceComparison(prices) {
        if (!prices || prices.length === 0) {
            return '<div class="no-prices">No prices available</div>';
        }

        // Sort prices to identify best and worst
        const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
        const bestPrice = sortedPrices[0].price;
        const worstPrice = sortedPrices[sortedPrices.length - 1].price;

        // Use map() to generate price items
        return prices.map(priceItem => {
            let cssClass = 'price-item';
            if (priceItem.price === bestPrice) {
                cssClass += ' best-price';
            } else if (priceItem.price === worstPrice && prices.length > 1) {
                cssClass += ' highest-price';
            }

            // Template literal for price item HTML
            return `
                <div class="${cssClass}">
                    <span class="store-name">${priceItem.supermarket}</span>
                    <span class="price">$${priceItem.price.toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    // Display products in the grid with event listeners
    displayProducts(products, containerId = 'products-grid') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }

        // Generate and insert HTML
        container.innerHTML = this.generateProductCards(products);

        // Add event listeners to product cards
        this.attachProductEventListeners(container);

        // Update products count
        this.updateProductsCount(products.length);
    }

    // Attach event listeners to product cards
    attachProductEventListeners(container) {
        // View details buttons
        const viewDetailsBtns = container.querySelectorAll('.view-details');
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.showProductModal(productId);
            });
        });

        // Favorite buttons
        const favoriteBtns = container.querySelectorAll('.favorite-btn');
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.target.dataset.productId);
                this.toggleFavorite(productId, e.target);
            });
        });

        // Product card clicks
        const productCards = container.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (!e.target.closest('button')) {
                    const productId = parseInt(card.dataset.productId);
                    this.showProductModal(productId);
                }
            });
        });
    }

    // Modal dialog management
    setupModals() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    // Show product details modal
    async showProductModal(productId) {
        try {
            // This will be called from the main app with product data
            const event = new CustomEvent('showProductModal', { 
                detail: { productId } 
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error showing product modal:', error);
            this.showError('Failed to load product details');
        }
    }

    // Create and show modal with product details
    createProductModal(product) {
        if (!product) {
            this.showError('Product not found');
            return;
        }

        const priceStats = this.calculatePriceStats(product);
        
        // Template literal for modal content
        const modalContent = `
            <div class="modal" id="product-modal">
                <div class="modal-content">
                    <span class="close" aria-label="Close modal">&times;</span>
                    <div class="modal-header">
                        <h2>${product.name}</h2>
                        <div class="product-meta">
                            <span class="category">${product.category}</span>
                            <span class="brand">${product.brand}</span>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="product-image-container">
                            <img src="${product.image}" alt="${product.name}" class="modal-product-image">
                        </div>
                        <div class="price-analysis">
                            <h3>Price Analysis</h3>
                            ${priceStats ? `
                                <div class="price-stats">
                                    <div class="stat-item">
                                        <label>Best Price:</label>
                                        <span class="best-price">$${priceStats.min} at ${priceStats.bestStore}</span>
                                    </div>
                                    <div class="stat-item">
                                        <label>Highest Price:</label>
                                        <span class="worst-price">$${priceStats.max} at ${priceStats.worstStore}</span>
                                    </div>
                                    <div class="stat-item">
                                        <label>Average Price:</label>
                                        <span>$${priceStats.average}</span>
                                    </div>
                                    <div class="stat-item savings">
                                        <label>Maximum Savings:</label>
                                        <span>$${priceStats.savings}</span>
                                    </div>
                                </div>
                            ` : '<p>No price data available</p>'}
                            <div class="detailed-prices">
                                <h4>All Prices:</h4>
                                ${this.generateDetailedPriceList(product.prices)}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary add-to-comparison" data-product-id="${product.id}">
                            Add to Comparison
                        </button>
                        <button class="btn favorite-btn-modal" data-product-id="${product.id}">
                            Add to Favorites
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        this.closeModal();

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);
        this.currentModal = document.getElementById('product-modal');

        // Add event listeners
        this.setupModalEventListeners();

        // Show modal with animation
        setTimeout(() => {
            this.currentModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Check if modal content is taller than viewport and adjust alignment
            const modalContent = this.currentModal.querySelector('.modal-content');
            if (modalContent && modalContent.scrollHeight > window.innerHeight - 100) {
                this.currentModal.classList.add('tall-content');
            }
        }, 10);
    }

    // Setup modal event listeners
    setupModalEventListeners() {
        if (!this.currentModal) return;

        const closeBtn = this.currentModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        this.currentModal.addEventListener('click', (e) => {
            if (e.target === this.currentModal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);

        const addToComparisonBtn = this.currentModal.querySelector('.add-to-comparison');
        if (addToComparisonBtn) {
            addToComparisonBtn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const event = new CustomEvent('addToComparison', { 
                    detail: { productId } 
                });
                document.dispatchEvent(event);
            });
        }

        const favoriteBtn = this.currentModal.querySelector('.favorite-btn-modal');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.toggleFavorite(productId, e.target);
            });
        }
    }

    // Close modal
    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    // Generate detailed price list for modal
    generateDetailedPriceList(prices) {
        if (!prices || prices.length === 0) {
            return '<p>No prices available</p>';
        }

        const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
        
        return `
            <div class="detailed-price-list">
                ${sortedPrices.map((price, index) => `
                    <div class="detailed-price-item ${index === 0 ? 'best-price' : ''}">
                        <div class="store-info">
                            <span class="store-name">${price.supermarket}</span>
                            <span class="update-date">Updated: ${price.lastUpdated}</span>
                        </div>
                        <div class="price-value">$${price.price.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Toggle favorite status
    toggleFavorite(productId, buttonElement) {
        const event = new CustomEvent('toggleFavorite', { 
            detail: { productId, buttonElement } 
        });
        document.dispatchEvent(event);
    }

    // Update favorite button appearance
    updateFavoriteButton(buttonElement, isFavorite) {
        if (buttonElement) {
            buttonElement.textContent = isFavorite ? '♥' : '♡';
            buttonElement.classList.toggle('favorited', isFavorite);
            buttonElement.setAttribute('aria-label', 
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
            );
        }
    }

    // Calculate price statistics
    calculatePriceStats(product) {
        if (!product || !product.prices || product.prices.length === 0) {
            return null;
        }

        const prices = product.prices.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

        return {
            min: minPrice.toFixed(2),
            max: maxPrice.toFixed(2),
            average: avgPrice.toFixed(2),
            savings: (maxPrice - minPrice).toFixed(2),
            bestStore: product.prices.find(p => p.price === minPrice)?.supermarket,
            worstStore: product.prices.find(p => p.price === maxPrice)?.supermarket
        };
    }

    // Update products count display
    updateProductsCount(count) {
        const countElement = document.getElementById('products-count');
        if (countElement) {
            countElement.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
        }
    }

    // Setup scroll to top functionality
    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.style.display = 'block';
                } else {
                    scrollToTopBtn.style.display = 'none';
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // Show loading state
    showLoading(message = 'Loading...') {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.innerHTML = `<div class="loading">${message}</div>`;
            loadingElement.style.display = 'block';
        }
    }

    // Hide loading state
    hideLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Show error message
    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `<div class="error">${message}</div>`;
            errorContainer.style.display = 'block';
        }
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    // Hide error message
    hideError() {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }

    // Show success message
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(successDiv, main.firstChild);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    }

    // Debounced search function
    debounceSearch(callback, delay = 300) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }

    // Generate category filter options
    generateCategoryOptions(categories) {
        const defaultOption = '<option value="all">All Categories</option>';
        const categoryOptions = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
        
        return defaultOption + categoryOptions;
    }

    // Update category filter dropdown
    updateCategoryFilter(categories) {
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.innerHTML = this.generateCategoryOptions(categories);
        }
    }
} 