// API module for fetching product data
export class ProductAPI {
    constructor() {
        this.baseUrl = './data/products.json';
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    // Async function to fetch all product data with try-catch error handling
    async fetchProducts() {
        try {
            // Check if we have valid cached data
            if (this.cache && this.cacheTimestamp && 
                (Date.now() - this.cacheTimestamp) < this.cacheExpiry) {
                console.log('Returning cached product data');
                return this.cache;
            }

            // Show loading indicator
            this.showLoadingState();

            console.log('Fetching product data from:', this.baseUrl);
            
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate the data structure
            if (!data.products || !Array.isArray(data.products)) {
                throw new Error('Invalid data structure: products array not found');
            }

            // Cache the data
            this.cache = data;
            this.cacheTimestamp = Date.now();

            console.log(`Successfully fetched ${data.products.length} products`);
            this.hideLoadingState();
            
            return data;

        } catch (error) {
            console.error('Error fetching products:', error);
            this.hideLoadingState();
            this.showError('Failed to load product data. Please try again later.');
            throw error;
        }
    }

    // Get products filtered by category
    async getProductsByCategory(category) {
        try {
            const data = await this.fetchProducts();
            if (category === 'all' || !category) {
                return data.products;
            }
            return data.products.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        } catch (error) {
            console.error('Error filtering products by category:', error);
            throw error;
        }
    }

    // Search products by name or brand
    async searchProducts(query) {
        try {
            const data = await this.fetchProducts();
            if (!query || query.trim() === '') {
                return data.products;
            }
            
            const searchTerm = query.toLowerCase().trim();
            return data.products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.brand.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // Get unique categories for filter dropdown
    async getCategories() {
        try {
            const data = await this.fetchProducts();
            const categories = [...new Set(data.products.map(product => product.category))];
            return categories.sort();
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Get supermarket information
    async getSupermarkets() {
        try {
            const data = await this.fetchProducts();
            return data.supermarkets || [];
        } catch (error) {
            console.error('Error getting supermarkets:', error);
            throw error;
        }
    }

    // Get product by ID
    async getProductById(id) {
        try {
            const data = await this.fetchProducts();
            return data.products.find(product => product.id === parseInt(id));
        } catch (error) {
            console.error('Error getting product by ID:', error);
            throw error;
        }
    }

    // Calculate price statistics for a product
    calculatePriceStats(product) {
        if (!product || !product.prices || product.prices.length === 0) {
            return null;
        }

        const prices = product.prices.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

        return {
            min: minPrice,
            max: maxPrice,
            average: avgPrice.toFixed(2),
            savings: (maxPrice - minPrice).toFixed(2),
            bestStore: product.prices.find(p => p.price === minPrice)?.supermarket,
            worstStore: product.prices.find(p => p.price === maxPrice)?.supermarket
        };
    }

    // Show loading state
    showLoadingState() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    // Hide loading state
    hideLoadingState() {
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
        } else {
            // Fallback: create error element
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            
            const main = document.querySelector('main');
            if (main) {
                main.insertBefore(errorDiv, main.firstChild);
            }
        }
    }

    // Clear error messages
    clearError() {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = '';
            errorContainer.style.display = 'none';
        }
    }
} 