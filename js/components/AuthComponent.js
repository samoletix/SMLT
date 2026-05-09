/*
 * Auth Component
 * Handles authentication UI and interactions
 */

import { BaseComponent } from './BaseComponent.js';
import { authManager } from '../services/auth.js';
import { createLoginSchema, validateFormData } from '../utils/validation.js';
import { handleAndDisplayError, clearErrorDisplay } from '../utils/errorHandler.js';

export class AuthComponent extends BaseComponent {
    constructor(elementId = 'auth-section', options = {}) {
        super(elementId, options);

        // DOM elements
        this.loginForm = null;
        this.logoutSection = null;
        this.usernameInput = null;
        this.passwordInput = null;
        this.loginBtn = null;
        this.logoutBtn = null;
        this.currentUser = null;
        this.authError = null;

        // State
        this.state = {
            isAuthenticated: false,
            isLoading: false,
            error: null
        };
    }

    /**
     * Component setup
     */
    setup() {
        // Get DOM elements
        this.loginForm = this.element.querySelector('#login-form');
        this.logoutSection = this.element.querySelector('#logout-section');
        this.usernameInput = this.element.querySelector('#username');
        this.passwordInput = this.element.querySelector('#password');
        this.loginBtn = this.element.querySelector('#login-btn');
        this.logoutBtn = this.element.querySelector('#logout-btn');
        this.currentUser = this.element.querySelector('#current-user');
        this.authError = this.element.querySelector('#auth-error');

        // Check initial authentication state
        this.state.isAuthenticated = authManager.isAuthenticated();

        // Update UI based on initial state
        this.updateUI();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Login button click
        if (this.loginBtn) {
            this.addEventListener(this.loginBtn, 'click', this.handleLogin);
        }

        // Logout button click
        if (this.logoutBtn) {
            this.addEventListener(this.logoutBtn, 'click', this.handleLogout);
        }

        // Form submission on Enter key
        if (this.passwordInput) {
            this.addEventListener(this.passwordInput, 'keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }

        // Listen for authentication state changes
        this.on('auth:stateChanged', this.handleAuthStateChange);
    }

    /**
     * Handle login
     */
    async handleLogin() {
        // Clear previous errors
        this.clearError();

        // Get form values
        const username = this.usernameInput?.value?.trim() || '';
        const password = this.passwordInput?.value || '';

        // Validate form data
        const schema = createLoginSchema();
        const validation = validateFormData({ username, password }, schema);

        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors || {}).flat().join(', ');
            this.showError(errorMessage);
            return;
        }

        // Set loading state
        this.setState({ isLoading: true, error: null });

        try {
            // Attempt login
            const success = await authManager.login(username, password);

            if (success) {
                // Login successful
                this.setState({
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                // Clear form
                if (this.usernameInput) this.usernameInput.value = '';
                if (this.passwordInput) this.passwordInput.value = '';

                // Emit event
                this.emit('auth:loginSuccess', { username });

                // Show success message
                this.showSuccess('Вход выполнен успешно!');
            } else {
                // Login failed
                this.setState({
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Invalid username or password'
                });

                this.showError('Неверный логин или пароль');
            }
        } catch (error) {
            // Handle login error
            this.setState({
                isLoading: false,
                error: error.message
            });

            handleAndDisplayError(error, this.authError, 'login');
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        // Clear any errors
        this.clearError();

        // Perform logout
        authManager.logout();

        // Update state
        this.setState({
            isAuthenticated: false,
            error: null
        });

        // Emit event
        this.emit('auth:logout');

        // Show message
        this.showInfo('Выход выполнен успешно');
    }

    /**
     * Handle authentication state change
     * @param {Object} detail - Event detail
     */
    handleAuthStateChange(detail) {
        if (detail.isAuthenticated !== undefined) {
            this.setState({ isAuthenticated: detail.isAuthenticated });
        }
    }

    /**
     * Set component state
     * @param {Object} newState - New state values
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUI();
        this.emit('auth:stateChanged', this.state);
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        // Update authentication state
        if (this.state.isAuthenticated) {
            this.showAuthenticatedState();
        } else {
            this.showUnauthenticatedState();
        }

        // Update loading state
        if (this.state.isLoading) {
            this.showLoading();
        } else {
            this.hideLoading();
        }

        // Update error display
        if (this.state.error && this.authError) {
            this.authError.textContent = this.state.error;
            this.authError.style.display = 'block';
        }
    }

    /**
     * Show authenticated state UI
     */
    showAuthenticatedState() {
        if (this.loginForm) {
            this.loginForm.style.display = 'none';
        }

        if (this.logoutSection) {
            this.logoutSection.style.display = 'block';
        }

        if (this.currentUser) {
            const session = authManager.getSession();
            const username = session?.username || 'host';
            this.currentUser.textContent = username;

            // Update avatar letter
            const avatar = document.getElementById('session-avatar');
            if (avatar) {
                avatar.textContent = username.charAt(0).toUpperCase();
            }
        }

        // Disable login inputs
        if (this.usernameInput) this.usernameInput.disabled = true;
        if (this.passwordInput) this.passwordInput.disabled = true;
        if (this.loginBtn) this.loginBtn.disabled = true;
    }

    /**
     * Show unauthenticated state UI
     */
    showUnauthenticatedState() {
        if (this.loginForm) {
            this.loginForm.style.display = 'block';
        }

        if (this.logoutSection) {
            this.logoutSection.style.display = 'none';
        }

        // Enable login inputs
        if (this.usernameInput) this.usernameInput.disabled = false;
        if (this.passwordInput) this.passwordInput.disabled = false;
        if (this.loginBtn) this.loginBtn.disabled = false;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.authError) {
            this.authError.textContent = message;
            this.authError.style.display = 'block';
            this.authError.className = 'error-message error-error';
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        if (this.authError) {
            this.authError.textContent = message;
            this.authError.style.display = 'block';
            this.authError.className = 'error-message error-success';

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                this.clearError();
            }, 3000);
        }
    }

    /**
     * Show info message
     * @param {string} message - Info message
     */
    showInfo(message) {
        if (this.authError) {
            this.authError.textContent = message;
            this.authError.style.display = 'block';
            this.authError.className = 'error-message error-info';

            // Auto-hide info message after 3 seconds
            setTimeout(() => {
                this.clearError();
            }, 3000);
        }
    }

    /**
     * Clear error display
     */
    clearError() {
        if (this.authError) {
            clearErrorDisplay(this.authError);
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.loginBtn) {
            this.loginBtn.disabled = true;
            this.loginBtn.textContent = 'Logging in...';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.loginBtn) {
            this.loginBtn.disabled = false;
            this.loginBtn.textContent = 'Login';
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.state.isAuthenticated;
    }

    /**
     * Get current user info
     * @returns {Object|null} User info or null
     */
    getUserInfo() {
        if (!this.state.isAuthenticated) {
            return null;
        }

        return authManager.getSession();
    }

    /**
     * Get time remaining until session expires
     * @returns {string} Formatted time remaining
     */
    getTimeRemaining() {
        return authManager.getFormattedTimeRemaining();
    }

    /**
     * Restore session from storage
     * @returns {boolean} True if session restored
     */
    restoreSession() {
        const restored = authManager.restoreSession();

        if (restored) {
            this.setState({ isAuthenticated: true });
            return true;
        }

        return false;
    }

    /**
     * Cleanup expired sessions
     */
    cleanupSessions() {
        authManager.cleanupExpiredSessions();
    }

    /**
     * Render component
     */
    render() {
        // Update UI based on current state
        this.updateUI();
    }

    /**
     * Destroy component
     */
    destroy() {
        // Cleanup session management
        this.cleanupSessions();

        // Call parent destroy
        super.destroy();
    }
}