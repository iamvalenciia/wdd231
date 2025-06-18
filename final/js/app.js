// Main application module using ES Modules
import { ProductAPI } from './api.js';
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';

class SmartSupermarketApp {
    constructor() {
        this.api = new ProductAPI();
        this.storage = new StorageManager();
        this.ui = new UIManager();
        this.currentProducts = [];
        this.allProducts = [];
        this.categories = [];
    }

    // Initialize the application
    async initialize() {
        try {
            console.log('Initializing Smart Supermarket App...');
            
            // Check localStorage availability
            if (!this.storage.isAvailable()) {
                console.warn('LocalStorage is not available. Some features may not work.');
            }

            // Initialize UI components
            this.ui.initialize();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadInitialData();

            console.log('Smart Supermarket App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.ui.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.ui.debounceSearch(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Custom events from UI module
        document.addEventListener('showProductModal', (e) => {
            this.handleShowProductModal(e.detail.productId);
        });

        document.addEventListener('toggleFavorite', (e) => {
            this.handleToggleFavorite(e.detail.productId, e.detail.buttonElement);
        });

        document.addEventListener('addToComparison', (e) => {
            this.handleAddToComparison(e.detail.productId);
        });

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    // Load initial data and populate the interface
    async loadInitialData() {
        try {
            this.ui.showLoading('Loading products...');
            
            // Fetch products data using async/await with try-catch
            const data = await this.api.fetchProducts();
            
            this.allProducts = data.products;
            this.currentProducts = [...this.allProducts];

            // Get categories for filter dropdown
            this.categories = await this.api.getCategories();
            this.ui.updateCategoryFilter(this.categories);

            // Display initial products (first 15+ items as required)
            this.ui.displayProducts(this.currentProducts);

            // Update favorites UI based on stored preferences
            this.updateFavoritesUI();

            this.ui.hideLoading();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.ui.hideLoading();
            this.ui.showError('Failed to load product data. Please try again later.');
        }
    }

    // Handle search functionality
    async handleSearch(query) {
        try {
            if (query.trim() === '') {
                this.currentProducts = [...this.allProducts];
            } else {
                // Add to search history
                this.storage.addToSearchHistory(query);
                
                // Filter products using array methods
                this.currentProducts = this.allProducts.filter(product => 
                    product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.brand.toLowerCase().includes(query.toLowerCase()) ||
                    product.category.toLowerCase().includes(query.toLowerCase())
                );
            }

            // Apply current category filter if active
            const activeCategory = document.getElementById('category-filter')?.value;
            if (activeCategory && activeCategory !== 'all') {
                this.currentProducts = this.currentProducts.filter(product =>
                    product.category.toLowerCase() === activeCategory.toLowerCase()
                );
            }

            this.ui.displayProducts(this.currentProducts);
        } catch (error) {
            console.error('Error handling search:', error);
            this.ui.showError('Search failed. Please try again.');
        }
    }

    // Handle category filtering
    async handleCategoryFilter(category) {
        try {
            if (category === 'all') {
                this.currentProducts = [...this.allProducts];
            } else {
                // Use array filter method
                this.currentProducts = this.allProducts.filter(product =>
                    product.category.toLowerCase() === category.toLowerCase()
                );
            }

            // Apply search filter if active
            const searchQuery = document.getElementById('search-input')?.value;
            if (searchQuery && searchQuery.trim() !== '') {
                this.currentProducts = this.currentProducts.filter(product => 
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            this.ui.displayProducts(this.currentProducts);
            
            // Save user preference
            this.storage.setPreference('lastCategory', category);
        } catch (error) {
            console.error('Error handling category filter:', error);
            this.ui.showError('Filter failed. Please try again.');
        }
    }

    // Handle sorting
    handleSort(sortBy) {
        try {
            // Use array sort method with different criteria
            switch (sortBy) {
                case 'name':
                    this.currentProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'price-low':
                    this.currentProducts.sort((a, b) => {
                        const aMinPrice = Math.min(...a.prices.map(p => p.price));
                        const bMinPrice = Math.min(...b.prices.map(p => p.price));
                        return aMinPrice - bMinPrice;
                    });
                    break;
                case 'price-high':
                    this.currentProducts.sort((a, b) => {
                        const aMinPrice = Math.min(...a.prices.map(p => p.price));
                        const bMinPrice = Math.min(...b.prices.map(p => p.price));
                        return bMinPrice - aMinPrice;
                    });
                    break;
                case 'savings':
                    this.currentProducts.sort((a, b) => {
                        const aSavings = Math.max(...a.prices.map(p => p.price)) - Math.min(...a.prices.map(p => p.price));
                        const bSavings = Math.max(...b.prices.map(p => p.price)) - Math.min(...b.prices.map(p => p.price));
                        return bSavings - aSavings;
                    });
                    break;
                case 'category':
                    this.currentProducts.sort((a, b) => a.category.localeCompare(b.category));
                    break;
                default:
                    this.currentProducts.sort((a, b) => a.name.localeCompare(b.name));
            }

            this.ui.displayProducts(this.currentProducts);
            
            // Save user preference
            this.storage.setPreference('sortBy', sortBy);
        } catch (error) {
            console.error('Error handling sort:', error);
            this.ui.showError('Sort failed. Please try again.');
        }
    }

    // Handle showing product modal
    async handleShowProductModal(productId) {
        try {
            // Add to viewed products for localStorage
            this.storage.addToViewedProducts(productId);

            // Find product data
            const product = this.allProducts.find(p => p.id === productId);
            if (product) {
                this.ui.createProductModal(product);
            } else {
                this.ui.showError('Product not found');
            }
        } catch (error) {
            console.error('Error showing product modal:', error);
            this.ui.showError('Failed to load product details');
        }
    }

    // Handle toggle favorite functionality with localStorage
    handleToggleFavorite(productId, buttonElement) {
        try {
            const isFavorite = this.storage.isFavorite(productId);
            
            if (isFavorite) {
                const removed = this.storage.removeFromFavorites(productId);
                if (removed) {
                    this.ui.updateFavoriteButton(buttonElement, false);
                    this.ui.showSuccess('Removed from favorites');
                }
            } else {
                const added = this.storage.addToFavorites(productId);
                if (added) {
                    this.ui.updateFavoriteButton(buttonElement, true);
                    this.ui.showSuccess('Added to favorites');
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.ui.showError('Failed to update favorites');
        }
    }

    // Handle add to comparison functionality
    handleAddToComparison(productId) {
        try {
            const added = this.storage.addToComparisonList(productId);
            if (added) {
                this.ui.showSuccess('Added to comparison list');
                this.updateComparisonUI();
            } else {
                const comparisonList = this.storage.getComparisonList();
                if (comparisonList.length >= 5) {
                    this.ui.showError('Comparison list is full (maximum 5 items)');
                } else {
                    this.ui.showError('Product is already in comparison list');
                }
            }
        } catch (error) {
            console.error('Error adding to comparison:', error);
            this.ui.showError('Failed to add to comparison');
        }
    }

    // Update favorites UI based on localStorage
    updateFavoritesUI() {
        const favorites = this.storage.getFavorites();
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        
        favoriteButtons.forEach(button => {
            const productId = parseInt(button.dataset.productId);
            const isFavorite = favorites.includes(productId);
            this.ui.updateFavoriteButton(button, isFavorite);
        });
    }

    // Update comparison list UI
    updateComparisonUI() {
        const comparisonList = this.storage.getComparisonList();
        const comparisonCount = document.getElementById('comparison-count');
        
        if (comparisonCount) {
            comparisonCount.textContent = comparisonList.length;
            comparisonCount.style.display = comparisonList.length > 0 ? 'inline' : 'none';
        }
    }

    // Clear all filters and reset to initial state
    clearAllFilters() {
        try {
            // Reset search
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
            }

            // Reset category filter
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.value = 'all';
            }

            // Reset sort
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) {
                sortSelect.value = 'name';
            }

            // Reset products display
            this.currentProducts = [...this.allProducts];
            this.ui.displayProducts(this.currentProducts);

            this.ui.showSuccess('Filters cleared');
        } catch (error) {
            console.error('Error clearing filters:', error);
            this.ui.showError('Failed to clear filters');
        }
    }

    // Get app statistics for debugging
    getAppStats() {
        return {
            totalProducts: this.allProducts.length,
            currentProducts: this.currentProducts.length,
            categories: this.categories.length,
            favorites: this.storage.getFavorites().length,
            viewedProducts: this.storage.getViewedProducts().length,
            comparisonList: this.storage.getComparisonList().length,
            storageInfo: this.storage.getStorageInfo()
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Create global app instance
    window.smartSupermarketApp = new SmartSupermarketApp();
    
    try {
        await window.smartSupermarketApp.initialize();
    } catch (error) {
        console.error('Failed to initialize Smart Supermarket App:', error);
    }
});

// Export for use in other modules if needed
export { SmartSupermarketApp }; 