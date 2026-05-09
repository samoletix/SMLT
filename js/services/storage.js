/*
 * Storage Service
 * Handles data persistence using localStorage with error handling
 */

/**
 * PersistenceService class for localStorage operations
 */
export class PersistenceService {
    constructor() {
        this.available = this.checkAvailability();
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    checkAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Check if storage is available
     * @returns {boolean} True if storage is available
     */
    isAvailable() {
        return this.available;
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @returns {boolean} True if saved successfully
     */
    save(key, data) {
        if (!this.available) {
            console.warn('Storage not available, cannot save:', key);
            return false;
        }

        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Error saving data for key "${key}":`, error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                this.handleQuotaExceeded(key, data);
            }

            return false;
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {any|null} Loaded data or null
     */
    load(key) {
        if (!this.available) {
            console.warn('Storage not available, cannot load:', key);
            return null;
        }

        try {
            const serialized = localStorage.getItem(key);
            if (serialized === null) {
                return null;
            }

            return JSON.parse(serialized);
        } catch (error) {
            console.error(`Error loading data for key "${key}":`, error);

            // Clear corrupted data
            this.remove(key);
            return null;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if removed successfully
     */
    remove(key) {
        if (!this.available) {
            console.warn('Storage not available, cannot remove:', key);
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing data for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all application data from localStorage
     * @returns {boolean} True if cleared successfully
     */
    clear() {
        if (!this.available) {
            console.warn('Storage not available, cannot clear');
            return false;
        }

        try {
            // Only remove our application's keys
            const keys = Object.keys(localStorage);
            const appKeys = keys.filter(key => key.startsWith('gd_leaderboard_'));

            appKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object|null} Storage usage info or null
     */
    getUsageInfo() {
        if (!this.available) {
            return null;
        }

        try {
            let totalSize = 0;
            const keys = Object.keys(localStorage);

            keys.forEach(key => {
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
            });

            return {
                totalKeys: keys.length,
                totalSize: totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting storage usage:', error);
            return null;
        }
    }

    /**
     * Handle quota exceeded error
     * @param {string} key - Key that caused the error
     * @param {any} data - Data that was being saved
     */
    handleQuotaExceeded(key, data) {
        console.warn('Storage quota exceeded, attempting cleanup');

        // Try to clear old or non-essential data first
        this.clearOldData();

        // If still failing, try to save with compression
        this.tryCompressedSave(key, data);
    }

    /**
     * Clear old data to free up space
     */
    clearOldData() {
        // Implementation for LRU eviction or clearing old sessions
        // For now, just clear non-essential data
        const nonEssentialKeys = [
            'gd_leaderboard_debug',
            'gd_leaderboard_temp'
        ];

        nonEssentialKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Try to save data with compression
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    tryCompressedSave(key, data) {
        try {
            // Simple compression: remove whitespace from JSON
            const compressed = JSON.stringify(data).replace(/\s+/g, '');
            localStorage.setItem(key, compressed);
            console.log('Saved with compression');
        } catch (error) {
            console.error('Failed to save even with compression:', error);
        }
    }

    /**
     * Validate data structure on load
     * @param {any} data - Loaded data
     * @param {Function} validator - Validation function
     * @returns {boolean} True if data is valid
     */
    validateData(data, validator) {
        if (!data) {
            return false;
        }

        try {
            return validator(data);
        } catch (error) {
            console.error('Data validation failed:', error);
            return false;
        }
    }

    /**
     * Save data with validation
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @param {Function} validator - Validation function
     * @returns {boolean} True if saved successfully
     */
    saveWithValidation(key, data, validator) {
        if (!validator(data)) {
            console.error('Data validation failed before save');
            return false;
        }

        return this.save(key, data);
    }

    /**
     * Load data with validation
     * @param {string} key - Storage key
     * @param {Function} validator - Validation function
     * @returns {any|null} Validated data or null
     */
    loadWithValidation(key, validator) {
        const data = this.load(key);

        if (data && validator(data)) {
            return data;
        }

        return null;
    }
}

// Create default instance
export const persistenceService = new PersistenceService();