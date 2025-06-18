// Comparison page JavaScript module
import { ProductAPI } from './api.js';
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';

class ComparisonApp {
    constructor() {
        this.api = new ProductAPI();
        this.storage = new StorageManager();
        this.ui = new UIManager();
        this.comparisonProducts = [];
    }

    // Initialize the comparison page
    async initialize() {
        try {
            console.log('Initializing Comparison App...');
            
            // Initialize UI components
            this.ui.initialize();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load comparison data
            await this.loadComparisonData();
            
            console.log('Comparison App initialized successfully');
        } catch (error) {
            console.error('Error initializing comparison app:', error);
            this.ui.showError('Failed to initialize comparison page.');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Clear comparison button
        const clearComparisonBtn = document.getElementById('clear-comparison');
        if (clearComparisonBtn) {
            clearComparisonBtn.addEventListener('click', () => {
                this.clearComparison();
            });
        }

        // Add products button
        const addProductsBtn = document.getElementById('add-products');
        if (addProductsBtn) {
            addProductsBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Custom events
        document.addEventListener('removeFromComparison', (e) => {
            this.removeFromComparison(e.detail.productId);
        });
    }

    // Load comparison data from localStorage
    async loadComparisonData() {
        try {
            const comparisonList = this.storage.getComparisonList();
            
            if (comparisonList.length === 0) {
                this.showEmptyComparison();
                return;
            }

            // Fetch product data for comparison items
            const data = await this.api.fetchProducts();
            this.comparisonProducts = data.products.filter(product => 
                comparisonList.includes(product.id)
            );

            this.displayComparison();
            this.generateInsights();
            this.updateComparisonCount();
            
            // Load recommendations
            await this.loadRecommendations(data.products);
            
        } catch (error) {
            console.error('Error loading comparison data:', error);
            this.ui.showError('Failed to load comparison data.');
        }
    }

    // Display comparison table
    displayComparison() {
        const container = document.getElementById('comparison-table-container');
        if (!container) return;

        if (this.comparisonProducts.length === 0) {
            this.showEmptyComparison();
            return;
        }

        // Generate comparison table using template literals
        const comparisonTable = `
            <div class="comparison-table">
                <div class="comparison-header">
                    <div class="product-info-header">Product</div>
                    <div class="price-headers">
                        <div class="store-header">Supermaxi</div>
                        <div class="store-header">Mi Comisariato</div>
                        <div class="store-header">Tía</div>
                        <div class="best-price-header">Best Price</div>
                        <div class="actions-header">Actions</div>
                    </div>
                </div>
                ${this.comparisonProducts.map(product => this.generateProductRow(product)).join('')}
            </div>
            <div class="comparison-summary">
                <h3>Comparison Summary</h3>
                <div class="summary-stats">
                    <div class="stat">
                        <label>Products Compared:</label>
                        <span>${this.comparisonProducts.length}</span>
                    </div>
                    <div class="stat">
                        <label>Total Potential Savings:</label>
                        <span>$${this.calculateTotalSavings()}</span>
                    </div>
                    <div class="stat">
                        <label>Best Overall Store:</label>
                        <span>${this.getBestOverallStore()}</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = comparisonTable;
        
        // Add event listeners to remove buttons
        this.attachRemoveEventListeners();
        
        // Show insights section
        const insightsSection = document.getElementById('comparison-insights');
        if (insightsSection) {
            insightsSection.style.display = 'block';
        }
    }

    // Generate product row for comparison table
    generateProductRow(product) {
        const prices = {};
        product.prices.forEach(priceItem => {
            prices[priceItem.supermarket] = priceItem.price;
        });

        const bestPrice = Math.min(...product.prices.map(p => p.price));
        const bestStore = product.prices.find(p => p.price === bestPrice)?.supermarket;

        return `
            <div class="comparison-row" data-product-id="${product.id}">
                <div class="product-info">
                    <img src="${product.image}" alt="${product.name}" class="comparison-product-image">
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <div class="product-meta">
                            <span class="category">${product.category}</span>
                            <span class="brand">${product.brand}</span>
                        </div>
                    </div>
                </div>
                <div class="price-comparisons">
                    <div class="store-price ${prices['Supermaxi'] === bestPrice ? 'best-price' : ''}">
                        $${(prices['Supermaxi'] || 0).toFixed(2)}
                    </div>
                    <div class="store-price ${prices['Mi Comisariato'] === bestPrice ? 'best-price' : ''}">
                        $${(prices['Mi Comisariato'] || 0).toFixed(2)}
                    </div>
                    <div class="store-price ${prices['Tía'] === bestPrice ? 'best-price' : ''}">
                        $${(prices['Tía'] || 0).toFixed(2)}
                    </div>
                    <div class="best-price-indicator">
                        <strong>$${bestPrice.toFixed(2)}</strong>
                        <small>at ${bestStore}</small>
                    </div>
                    <div class="row-actions">
                        <button class="btn btn-small remove-product" 
                                data-product-id="${product.id}"
                                aria-label="Remove from comparison">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach event listeners to remove buttons
    attachRemoveEventListeners() {
        const removeButtons = document.querySelectorAll('.remove-product');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.removeFromComparison(productId);
            });
        });
    }

    // Remove product from comparison
    removeFromComparison(productId) {
        const removed = this.storage.removeFromComparisonList(productId);
        if (removed) {
            this.ui.showSuccess('Product removed from comparison');
            // Reload comparison data
            this.loadComparisonData();
        }
    }

    // Clear all comparison items
    clearComparison() {
        if (confirm('Are you sure you want to clear all comparison items?')) {
            this.storage.clearComparisonList();
            this.ui.showSuccess('Comparison list cleared');
            this.showEmptyComparison();
        }
    }

    // Show empty comparison state
    showEmptyComparison() {
        const container = document.getElementById('comparison-table-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-comparison">
                    <h3>No products selected for comparison</h3>
                    <p>Go to the <a href="index.html">home page</a> to add products to your comparison list.</p>
                    <div class="comparison-instructions">
                        <h4>How to compare products:</h4>
                        <ol>
                            <li>Browse products on the home page</li>
                            <li>Click "View Details" on any product</li>
                            <li>Click "Add to Comparison" in the product modal</li>
                            <li>Return to this page to see the comparison</li>
                        </ol>
                    </div>
                </div>
            `;
        }
        
        this.updateComparisonCount();
        
        // Hide insights section
        const insightsSection = document.getElementById('comparison-insights');
        if (insightsSection) {
            insightsSection.style.display = 'none';
        }
    }

    // Update comparison count display
    updateComparisonCount() {
        const countElement = document.getElementById('comparison-items-count');
        if (countElement) {
            countElement.textContent = this.comparisonProducts.length;
        }
    }

    // Calculate total potential savings
    calculateTotalSavings() {
        return this.comparisonProducts.reduce((total, product) => {
            const prices = product.prices.map(p => p.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            return total + (maxPrice - minPrice);
        }, 0).toFixed(2);
    }

    // Get best overall store
    getBestOverallStore() {
        if (this.comparisonProducts.length === 0) return 'N/A';
        
        const storeScores = {};
        
        this.comparisonProducts.forEach(product => {
            const bestPrice = Math.min(...product.prices.map(p => p.price));
            const bestStore = product.prices.find(p => p.price === bestPrice)?.supermarket;
            
            if (bestStore) {
                storeScores[bestStore] = (storeScores[bestStore] || 0) + 1;
            }
        });
        
        return Object.keys(storeScores).reduce((a, b) => 
            storeScores[a] > storeScores[b] ? a : b
        );
    }

    // Generate insights
    generateInsights() {
        const bestStoreElement = document.getElementById('best-store');
        const totalSavingsElement = document.getElementById('total-savings');
        const shoppingStrategyElement = document.getElementById('shopping-strategy');
        
        if (bestStoreElement) {
            bestStoreElement.textContent = this.getBestOverallStore();
        }
        
        if (totalSavingsElement) {
            totalSavingsElement.textContent = `$${this.calculateTotalSavings()}`;
        }
        
        if (shoppingStrategyElement) {
            const strategy = this.generateShoppingStrategy();
            shoppingStrategyElement.textContent = strategy;
        }
    }

    // Generate shopping strategy recommendation
    generateShoppingStrategy() {
        if (this.comparisonProducts.length === 0) {
            return 'Add products to see recommendations';
        }
        
        const bestStore = this.getBestOverallStore();
        const savingsAmount = this.calculateTotalSavings();
        
        if (parseFloat(savingsAmount) > 5) {
            return `Shop smart! You could save $${savingsAmount} by choosing the best prices from different stores.`;
        } else if (parseFloat(savingsAmount) > 2) {
            return `Consider shopping at ${bestStore} for most items to save time and money.`;
        } else {
            return `Prices are fairly consistent across stores. Choose based on convenience.`;
        }
    }

    // Load product recommendations
    async loadRecommendations(allProducts) {
        try {
            if (this.comparisonProducts.length === 0) return;
            
            // Get categories of compared products
            const comparedCategories = [...new Set(this.comparisonProducts.map(p => p.category))];
            
            // Find similar products (same categories, not in comparison)
            const comparisonIds = this.comparisonProducts.map(p => p.id);
            const recommendations = allProducts
                .filter(product => 
                    comparedCategories.includes(product.category) && 
                    !comparisonIds.includes(product.id)
                )
                .slice(0, 6); // Limit to 6 recommendations
            
            this.displayRecommendations(recommendations);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    }

    // Display recommendations
    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations-grid');
        if (!container) return;
        
        if (recommendations.length === 0) {
            container.innerHTML = '<p>No recommendations available at this time.</p>';
            return;
        }
        
        const recommendationsHTML = recommendations.map(product => {
            const bestPrice = Math.min(...product.prices.map(p => p.price));
            
            return `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-category">${product.category}</div>
                        <div class="product-brand">Brand: ${product.brand}</div>
                        <div class="price-summary">
                            <div class="best-price">Best: $${bestPrice.toFixed(2)}</div>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-primary add-to-comparison-rec" 
                                    data-product-id="${product.id}">
                                Add to Comparison
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = recommendationsHTML;
        
        // Add event listeners
        const addButtons = container.querySelectorAll('.add-to-comparison-rec');
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.addToComparison(productId);
            });
        });
    }

    // Add product to comparison from recommendations
    addToComparison(productId) {
        const added = this.storage.addToComparisonList(productId);
        if (added) {
            this.ui.showSuccess('Product added to comparison');
            // Reload comparison data
            this.loadComparisonData();
        } else {
            const comparisonList = this.storage.getComparisonList();
            if (comparisonList.length >= 5) {
                this.ui.showError('Comparison list is full (maximum 5 items)');
            } else {
                this.ui.showError('Product is already in comparison list');
            }
        }
    }
}

// Initialize the comparison app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.comparisonApp = new ComparisonApp();
    try {
        await window.comparisonApp.initialize();
    } catch (error) {
        console.error('Failed to initialize Comparison App:', error);
    }
});

// Export for use in other modules if needed
export { ComparisonApp }; 