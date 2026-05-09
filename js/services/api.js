/*
 * API Service
 * Handles communication with Demonlist.org API
 * Note: Actual API integration will be implemented in Phase 2
 */

/**
 * APIClient class for Demonlist.org API communication
 */
export class APIClient {
    constructor(baseURL = 'https://api.demonlist.org') {
        this.baseURL = baseURL;
        this.rateLimit = {
            remaining: 60, // Default rate limit
            reset: Date.now() + 60000 // Reset in 1 minute
        };
    }

    /**
     * Fetch player data by ID
     * @param {number} id - Player ID
     * @returns {Promise<Object>} Player data
     */
    async fetchPlayerById(id) {
        console.log(`[API] Fetching player by ID: ${id}`);

        // Placeholder implementation for Phase 1
        // Actual API integration will be in Phase 2
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('API integration will be implemented in Phase 2'));
            }, 1000);
        });
    }

    /**
     * Fetch player data by username
     * @param {string} username - Player username
     * @returns {Promise<Object>} Player data
     */
    async fetchPlayerByUsername(username) {
        console.log(`[API] Fetching player by username: ${username}`);

        // Placeholder implementation for Phase 1
        // Actual API integration will be in Phase 2
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('API integration will be implemented in Phase 2'));
            }, 1000);
        });
    }

    /**
     * Fetch list of players
     * @param {number} limit - Maximum number of players to fetch
     * @returns {Promise<Array>} List of players
     */
    async fetchPlayerList(limit = 100) {
        console.log(`[API] Fetching player list, limit: ${limit}`);

        // Placeholder implementation for Phase 1
        // Actual API integration will be in Phase 2
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('API integration will be implemented in Phase 2'));
            }, 1000);
        });
    }

    /**
     * Get current rate limit information
     * @returns {Object} Rate limit info
     */
    getRateLimitInfo() {
        return { ...this.rateLimit };
    }

    /**
     * Update rate limit from response headers
     * @param {Headers} headers - Response headers
     */
    updateRateLimit(headers) {
        // Parse rate limit headers when API is implemented
        // For now, use placeholder logic
        const remaining = headers.get('X-RateLimit-Remaining');
        const reset = headers.get('X-RateLimit-Reset');

        if (remaining !== null) {
            this.rateLimit.remaining = parseInt(remaining, 10);
        }

        if (reset !== null) {
            this.rateLimit.reset = parseInt(reset, 10) * 1000; // Convert to milliseconds
        }
    }

    /**
     * Check if rate limit is exceeded
     * @returns {boolean} True if rate limit exceeded
     */
    isRateLimited() {
        const now = Date.now();
        if (now >= this.rateLimit.reset) {
            // Reset time has passed, reset rate limit
            this.rateLimit.remaining = 60;
            this.rateLimit.reset = now + 60000;
            return false;
        }

        return this.rateLimit.remaining <= 0;
    }

    /**
     * Get time until rate limit resets
     * @returns {number} Milliseconds until reset
     */
    getTimeUntilReset() {
        const now = Date.now();
        return Math.max(0, this.rateLimit.reset - now);
    }

    /**
     * Wait for rate limit reset
     * @returns {Promise<void>} Resolves when rate limit is reset
     */
    async waitForRateLimitReset() {
        const waitTime = this.getTimeUntilReset();

        if (waitTime > 0) {
            console.log(`[API] Waiting ${waitTime}ms for rate limit reset`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    /**
     * Make API request with rate limiting and retry logic
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} API response
     */
    async makeRequest(endpoint, options = {}) {
        // Check rate limit
        if (this.isRateLimited()) {
            await this.waitForRateLimitReset();
        }

        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, options);

            // Update rate limit from response headers
            this.updateRateLimit(response.headers);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return response;
        } catch (error) {
            console.error(`[API] Request failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Make API request with exponential backoff retry
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @param {number} maxRetries - Maximum number of retries
     * @returns {Promise<Response>} API response
     */
    async makeRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    // Exponential backoff: 1s, 2s, 4s, etc.
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    console.log(`[API] Retry attempt ${attempt} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                return await this.makeRequest(endpoint, options);
            } catch (error) {
                lastError = error;

                // Don't retry on 4xx errors (client errors)
                if (error.message.includes('4')) {
                    break;
                }

                // Check if we should retry
                if (attempt === maxRetries) {
                    break;
                }
            }
        }

        throw lastError;
    }
}

// Create default instance
export const apiClient = new APIClient();