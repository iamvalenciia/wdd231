// Local Storage management module
export class StorageManager {
    constructor() {
        this.prefix = 'smartSupermarket_';
        this.keys = {
            favorites: 'favorites',
            searchHistory: 'searchHistory',
            userPreferences: 'userPreferences',
            viewedProducts: 'viewedProducts',
            comparisonList: 'comparisonList'
        };
    }

    // Generic method to save data to localStorage
    save(key, data) {
        try {
            const prefixedKey = this.prefix + key;
            const jsonData = JSON.stringify(data);
            localStorage.setItem(prefixedKey, jsonData);
            console.log(`Data saved to localStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Generic method to load data from localStorage
    load(key, defaultValue = null) {
        try {
            const prefixedKey = this.prefix + key;
            const data = localStorage.getItem(prefixedKey);
            if (data === null) {
                return defaultValue;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    // Remove specific key from localStorage
    remove(key) {
        try {
            const prefixedKey = this.prefix + key;
            localStorage.removeItem(prefixedKey);
            console.log(`Data removed from localStorage: ${key}`);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Clear all app data from localStorage
    clearAll() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('All app data cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Favorite products management
    getFavorites() {
        return this.load(this.keys.favorites, []);
    }

    addToFavorites(productId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(productId)) {
            favorites.push(productId);
            this.save(this.keys.favorites, favorites);
            return true;
        }
        return false;
    }

    removeFromFavorites(productId) {
        const favorites = this.getFavorites();
        const updatedFavorites = favorites.filter(id => id !== productId);
        this.save(this.keys.favorites, updatedFavorites);
        return favorites.length !== updatedFavorites.length;
    }

    isFavorite(productId) {
        const favorites = this.getFavorites();
        return favorites.includes(productId);
    }

    // Search history management
    getSearchHistory() {
        return this.load(this.keys.searchHistory, []);
    }

    addToSearchHistory(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') return;
        
        const history = this.getSearchHistory();
        const trimmedTerm = searchTerm.trim().toLowerCase();
        
        // Remove if already exists
        const updatedHistory = history.filter(term => term !== trimmedTerm);
        
        // Add to beginning
        updatedHistory.unshift(trimmedTerm);
        
        // Keep only last 10 searches
        const limitedHistory = updatedHistory.slice(0, 10);
        
        this.save(this.keys.searchHistory, limitedHistory);
    }

    clearSearchHistory() {
        this.save(this.keys.searchHistory, []);
    }

    // User preferences management
    getUserPreferences() {
        return this.load(this.keys.userPreferences, {
            preferredSupermarket: '',
            sortBy: 'name',
            viewMode: 'grid',
            currency: 'USD',
            notifications: true
        });
    }

    updateUserPreferences(preferences) {
        const currentPrefs = this.getUserPreferences();
        const updatedPrefs = { ...currentPrefs, ...preferences };
        this.save(this.keys.userPreferences, updatedPrefs);
    }

    getPreference(key) {
        const preferences = this.getUserPreferences();
        return preferences[key];
    }

    setPreference(key, value) {
        const preferences = this.getUserPreferences();
        preferences[key] = value;
        this.save(this.keys.userPreferences, preferences);
    }

    // Recently viewed products
    getViewedProducts() {
        return this.load(this.keys.viewedProducts, []);
    }

    addToViewedProducts(productId) {
        const viewed = this.getViewedProducts();
        
        // Remove if already exists
        const updatedViewed = viewed.filter(item => item.id !== productId);
        
        // Add to beginning with timestamp
        updatedViewed.unshift({
            id: productId,
            timestamp: Date.now()
        });
        
        // Keep only last 20 viewed products
        const limitedViewed = updatedViewed.slice(0, 20);
        
        this.save(this.keys.viewedProducts, limitedViewed);
    }

    // Comparison list management
    getComparisonList() {
        return this.load(this.keys.comparisonList, []);
    }

    addToComparisonList(productId) {
        const comparisonList = this.getComparisonList();
        if (!comparisonList.includes(productId) && comparisonList.length < 5) {
            comparisonList.push(productId);
            this.save(this.keys.comparisonList, comparisonList);
            return true;
        }
        return false;
    }

    removeFromComparisonList(productId) {
        const comparisonList = this.getComparisonList();
        const updatedList = comparisonList.filter(id => id !== productId);
        this.save(this.keys.comparisonList, updatedList);
        return comparisonList.length !== updatedList.length;
    }

    isInComparisonList(productId) {
        const comparisonList = this.getComparisonList();
        return comparisonList.includes(productId);
    }

    clearComparisonList() {
        this.save(this.keys.comparisonList, []);
    }

    // Storage usage information
    getStorageInfo() {
        try {
            let totalSize = 0;
            const info = {};
            
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const size = localStorage.getItem(key).length;
                    totalSize += size;
                    const cleanKey = key.replace(this.prefix, '');
                    info[cleanKey] = {
                        size: size,
                        sizeKB: (size / 1024).toFixed(2)
                    };
                }
            });
            
            return {
                items: info,
                totalSize: totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }

    // Check if localStorage is available
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage is not available:', error);
            return false;
        }
    }

    // Export data for backup
    exportData() {
        try {
            const data = {};
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.replace(this.prefix, '');
                    data[cleanKey] = JSON.parse(localStorage.getItem(key));
                }
            });
            return data;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    // Import data from backup
    importData(data) {
        try {
            Object.keys(data).forEach(key => {
                this.save(key, data[key]);
            });
            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
} 