/*
 * Base Component Class
 * Provides common functionality for all UI components
 */

export class BaseComponent {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.options = options;
        this.eventListeners = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the component
     * @returns {boolean} True if initialization successful
     */
    init() {
        if (!this.element) {
            console.error(`Component element not found: ${this.elementId}`);
            return false;
        }

        if (this.isInitialized) {
            console.warn(`Component already initialized: ${this.elementId}`);
            return true;
        }

        try {
            this.setup();
            this.bindEvents();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error(`Failed to initialize component ${this.elementId}:`, error);
            return false;
        }
    }

    /**
     * Component setup (to be overridden by subclasses)
     */
    setup() {
        // Base setup logic
        this.element.classList.add('component-initialized');
    }

    /**
     * Bind event listeners (to be overridden by subclasses)
     */
    bindEvents() {
        // Base event binding logic
    }

    /**
     * Add event listener with automatic cleanup
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event listener options
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element || !handler) return;

        const wrappedHandler = (e) => {
            try {
                handler.call(this, e);
            } catch (error) {
                console.error(`Error in ${event} event handler:`, error);
                this.handleError(error);
            }
        };

        element.addEventListener(event, wrappedHandler, options);

        // Store for cleanup
        this.eventListeners.push({
            element,
            event,
            handler: wrappedHandler,
            options
        });
    }

    /**
     * Remove all event listeners
     */
    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });

        this.eventListeners = [];
    }

    /**
     * Show the component
     * @param {string} displayStyle - Display style (default: 'block')
     */
    show(displayStyle = 'block') {
        if (this.element) {
            this.element.style.display = displayStyle;
        }
    }

    /**
     * Hide the component
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * Toggle component visibility
     * @param {boolean} force - Force show/hide (optional)
     * @returns {boolean} New visibility state
     */
    toggle(force = null) {
        if (!this.element) return false;

        const isHidden = this.element.style.display === 'none';
        const shouldShow = force !== null ? force : isHidden;

        this.element.style.display = shouldShow ? 'block' : 'none';
        return shouldShow;
    }

    /**
     * Enable the component
     */
    enable() {
        if (this.element) {
            this.element.disabled = false;
            this.element.classList.remove('disabled');
        }
    }

    /**
     * Disable the component
     */
    disable() {
        if (this.element) {
            this.element.disabled = true;
            this.element.classList.add('disabled');
        }
    }

    /**
     * Set component content
     * @param {string|HTMLElement} content - Content to set
     */
    setContent(content) {
        if (!this.element) return;

        if (typeof content === 'string') {
            this.element.textContent = content;
        } else if (content instanceof HTMLElement) {
            this.element.innerHTML = '';
            this.element.appendChild(content);
        } else if (Array.isArray(content)) {
            this.element.innerHTML = '';
            content.forEach(child => {
                if (child instanceof HTMLElement) {
                    this.element.appendChild(child);
                }
            });
        }
    }

    /**
     * Add CSS class to component
     * @param {string} className - Class to add
     */
    addClass(className) {
        if (this.element && className) {
            this.element.classList.add(className);
        }
    }

    /**
     * Remove CSS class from component
     * @param {string} className - Class to remove
     */
    removeClass(className) {
        if (this.element && className) {
            this.element.classList.remove(className);
        }
    }

    /**
     * Toggle CSS class on component
     * @param {string} className - Class to toggle
     * @param {boolean} force - Force add/remove (optional)
     * @returns {boolean} True if class was added
     */
    toggleClass(className, force = null) {
        if (!this.element || !className) return false;

        if (force !== null) {
            if (force) {
                this.addClass(className);
                return true;
            } else {
                this.removeClass(className);
                return false;
            }
        }

        return this.element.classList.toggle(className);
    }

    /**
     * Check if component has CSS class
     * @param {string} className - Class to check
     * @returns {boolean} True if component has class
     */
    hasClass(className) {
        return this.element && this.element.classList.contains(className);
    }

    /**
     * Set component data attribute
     * @param {string} key - Data key (without 'data-' prefix)
     * @param {string} value - Data value
     */
    setData(key, value) {
        if (this.element) {
            this.element.dataset[key] = value;
        }
    }

    /**
     * Get component data attribute
     * @param {string} key - Data key (without 'data-' prefix)
     * @returns {string|undefined} Data value
     */
    getData(key) {
        return this.element ? this.element.dataset[key] : undefined;
    }

    /**
     * Handle component error
     * @param {Error} error - Error to handle
     */
    handleError(error) {
        console.error(`Component ${this.elementId} error:`, error);

        // Show error in component if possible
        if (this.element) {
            const errorElement = this.element.querySelector('.component-error') ||
                this.createErrorElement();

            if (errorElement) {
                errorElement.textContent = error.message || 'An error occurred';
                errorElement.style.display = 'block';
            }
        }
    }

    /**
     * Create error element for component
     * @returns {HTMLElement} Error element
     */
    createErrorElement() {
        if (!this.element) return null;

        const errorElement = document.createElement('div');
        errorElement.className = 'component-error';
        errorElement.style.display = 'none';
        errorElement.style.color = 'var(--color-error)';
        errorElement.style.padding = '8px';
        errorElement.style.marginTop = '8px';
        errorElement.style.backgroundColor = 'rgba(204, 51, 51, 0.1)';
        errorElement.style.borderRadius = '4px';

        this.element.appendChild(errorElement);
        return errorElement;
    }

    /**
     * Clear component error
     */
    clearError() {
        if (this.element) {
            const errorElement = this.element.querySelector('.component-error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.element) {
            this.addClass('loading');

            // Add spinner if not already present
            if (!this.element.querySelector('.component-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'component-spinner';
                spinner.style.cssText = `
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--color-border);
                    border-top-color: var(--color-secondary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                `;

                this.element.appendChild(spinner);
            }
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.element) {
            this.removeClass('loading');

            // Remove spinner
            const spinner = this.element.querySelector('.component-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    /**
     * Update component state
     * @param {Object} state - New state
     */
    updateState(state) {
        this.state = { ...this.state, ...state };
        this.render();
    }

    /**
     * Render component (to be overridden by subclasses)
     */
    render() {
        // Base render logic
    }

    /**
     * Destroy component and clean up resources
     */
    destroy() {
        this.removeAllEventListeners();

        if (this.element) {
            this.element.classList.remove('component-initialized');
        }

        this.isInitialized = false;
    }

    /**
     * Get component element
     * @returns {HTMLElement} Component element
     */
    getElement() {
        return this.element;
    }

    /**
     * Check if component is initialized
     * @returns {boolean} True if initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Emit custom event from component
     * @param {string} eventName - Event name
     * @param {any} detail - Event detail data
     */
    emit(eventName, detail = {}) {
        if (!this.element) return;

        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                component: this,
                ...detail
            }
        });

        this.element.dispatchEvent(event);
    }

    /**
     * Subscribe to component events
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     */
    on(eventName, handler) {
        if (!this.element || !handler) return;

        const wrappedHandler = (e) => {
            try {
                handler.call(this, e.detail, e);
            } catch (error) {
                console.error(`Error in ${eventName} event handler:`, error);
            }
        };

        this.element.addEventListener(eventName, wrappedHandler);

        // Store for cleanup
        this.eventListeners.push({
            element: this.element,
            event: eventName,
            handler: wrappedHandler
        });
    }
}