/*
 * Auth Service
 * Handles host authentication and session management
 */

// Predefined Host Account
export const HOST_ACCOUNT = {
    username: 'samoletik',
    password: 'samoletikpot'
};

// Session expiration time (24 hours)
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * AuthManager class for handling authentication operations
 */
export class AuthManager {
    constructor(storageKey = 'gd_leaderboard_auth') {
        this.storageKey = storageKey;
        this.session = null;
    }

    /**
     * Attempt to login with credentials
     * @param {string} username - Host username
     * @param {string} password - Host password
     * @returns {Promise<boolean>} True if login successful
     */
    async login(username, password) {
        // Validate inputs
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Check credentials against predefined account
        if (username === HOST_ACCOUNT.username && password === HOST_ACCOUNT.password) {
            // Create session data
            this.session = {
                username: username,
                timestamp: Date.now(),
                expires: Date.now() + SESSION_EXPIRY_MS
            };

            // Save session to localStorage
            this.persistSession();

            return true;
        }

        return false;
    }

    /**
     * Logout the current user
     */
    logout() {
        this.session = null;
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        if (!this.session) {
            return false;
        }

        // Check if session is still valid
        const now = Date.now();
        return this.session.expires > now;
    }

    /**
     * Get current session information
     * @returns {Object|null} Session object or null
     */
    getSession() {
        return this.session ? { ...this.session } : null;
    }

    /**
     * Save session to localStorage
     * @returns {boolean} True if saved successfully
     */
    persistSession() {
        if (!this.session) {
            return false;
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.session));
            return true;
        } catch (error) {
            console.error('Error saving session:', error);
            return false;
        }
    }

    /**
     * Restore session from localStorage
     * @returns {boolean} True if session restored successfully
     */
    restoreSession() {
        try {
            const sessionData = localStorage.getItem(this.storageKey);
            if (!sessionData) {
                return false;
            }

            const session = JSON.parse(sessionData);

            // Validate session structure
            if (!session.username || !session.timestamp || !session.expires) {
                throw new Error('Invalid session structure');
            }

            // Check if session is still valid
            const now = Date.now();
            if (session.expires > now) {
                this.session = session;
                return true;
            } else {
                // Session expired, clear it
                localStorage.removeItem(this.storageKey);
                return false;
            }
        } catch (error) {
            console.error('Error restoring session:', error);
            // Clear potentially corrupted data
            localStorage.removeItem(this.storageKey);
            return false;
        }
    }

    /**
     * Clear any expired sessions from storage
     */
    cleanupExpiredSessions() {
        try {
            const sessionData = localStorage.getItem(this.storageKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const now = Date.now();

                if (session.expires <= now) {
                    localStorage.removeItem(this.storageKey);
                }
            }
        } catch (error) {
            // Ignore errors during cleanup
            console.warn('Error during session cleanup:', error);
        }
    }

    /**
     * Get time remaining until session expires
     * @returns {number|null} Milliseconds remaining or null if no session
     */
    getTimeRemaining() {
        if (!this.session) {
            return null;
        }

        const now = Date.now();
        return Math.max(0, this.session.expires - now);
    }

    /**
     * Format time remaining as human-readable string
     * @returns {string} Formatted time remaining
     */
    getFormattedTimeRemaining() {
        const ms = this.getTimeRemaining();
        if (ms === null) {
            return 'No active session';
        }

        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
}

// Create default instance
export const authManager = new AuthManager();