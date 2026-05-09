/*
 * DOM Helper Utilities
 * Provides common DOM manipulation functions
 */

/**
 * Get DOM element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} DOM element or null
 */
export function getElement(id) {
    return document.getElementById(id);
}

/**
 * Get multiple DOM elements by class name
 * @param {string} className - Class name
 * @param {HTMLElement} parent - Parent element (optional)
 * @returns {Array<HTMLElement>} Array of DOM elements
 */
export function getElementsByClass(className, parent = document) {
    return Array.from(parent.getElementsByClassName(className));
}

/**
 * Create a new DOM element
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|HTMLElement} content - Element content
 * @returns {HTMLElement} Created DOM element
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'htmlFor') {
            element.htmlFor = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    }

    // Set content
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    } else if (Array.isArray(content)) {
        content.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }

    return element;
}

/**
 * Remove all children from a DOM element
 * @param {HTMLElement} element - Parent element
 */
export function removeAllChildren(element) {
    if (!element) return;

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Show an element
 * @param {HTMLElement} element - Element to show
 * @param {string} displayStyle - Display style (default: 'block')
 */
export function showElement(element, displayStyle = 'block') {
    if (element) {
        element.style.display = displayStyle;
    }
}

/**
 * Hide an element
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} force - Force show/hide (optional)
 * @returns {boolean} New visibility state
 */
export function toggleElement(element, force = null) {
    if (!element) return false;

    const isHidden = element.style.display === 'none';
    const shouldShow = force !== null ? force : isHidden;

    element.style.display = shouldShow ? 'block' : 'none';
    return shouldShow;
}

/**
 * Add CSS class to element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to add
 */
export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

/**
 * Remove CSS class from element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to remove
 */
export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

/**
 * Toggle CSS class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to toggle
 * @param {boolean} force - Force add/remove (optional)
 * @returns {boolean} True if class was added
 */
export function toggleClass(element, className, force = null) {
    if (!element || !className) return false;

    if (force !== null) {
        if (force) {
            addClass(element, className);
            return true;
        } else {
            removeClass(element, className);
            return false;
        }
    }

    return element.classList.toggle(className);
}

/**
 * Check if element has CSS class
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to check
 * @returns {boolean} True if element has class
 */
export function hasClass(element, className) {
    return element && element.classList.contains(className);
}

/**
 * Set element text content
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text content
 */
export function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Set element HTML content
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content
 */
export function setHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Safely set element HTML content (sanitized)
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content
 */
export function setSafeHTML(element, html) {
    if (!element) return;

    // Simple HTML sanitization
    const sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '')
        .replace(/javascript:/gi, '');

    element.innerHTML = sanitized;
}

/**
 * Set element attribute
 * @param {HTMLElement} element - Target element
 * @param {string} name - Attribute name
 * @param {string} value - Attribute value
 */
export function setAttribute(element, name, value) {
    if (element) {
        element.setAttribute(name, value);
    }
}

/**
 * Remove element attribute
 * @param {HTMLElement} element - Target element
 * @param {string} name - Attribute name
 */
export function removeAttribute(element, name) {
    if (element) {
        element.removeAttribute(name);
    }
}

/**
 * Get element attribute
 * @param {HTMLElement} element - Target element
 * @param {string} name - Attribute name
 * @returns {string|null} Attribute value or null
 */
export function getAttribute(element, name) {
    return element ? element.getAttribute(name) : null;
}

/**
 * Set element data attribute
 * @param {HTMLElement} element - Target element
 * @param {string} key - Data key (without 'data-' prefix)
 * @param {string} value - Data value
 */
export function setData(element, key, value) {
    if (element) {
        element.dataset[key] = value;
    }
}

/**
 * Get element data attribute
 * @param {HTMLElement} element - Target element
 * @param {string} key - Data key (without 'data-' prefix)
 * @returns {string|undefined} Data value
 */
export function getData(element, key) {
    return element ? element.dataset[key] : undefined;
}

/**
 * Add event listener with error handling
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 * @returns {Function} Cleanup function to remove listener
 */
export function addEventListener(element, event, handler, options = {}) {
    if (!element || !handler) {
        return () => { };
    }

    const wrappedHandler = (e) => {
        try {
            handler(e);
        } catch (error) {
            console.error(`Error in ${event} event handler:`, error);
        }
    };

    element.addEventListener(event, wrappedHandler, options);

    // Return cleanup function
    return () => {
        element.removeEventListener(event, wrappedHandler, options);
    };
}

/**
 * Remove event listener
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
export function removeEventListener(element, event, handler, options = {}) {
    if (element && handler) {
        element.removeEventListener(event, handler, options);
    }
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Create loading spinner element
 * @param {string} size - Spinner size ('sm', 'md', 'lg')
 * @param {string} color - Spinner color
 * @returns {HTMLElement} Loading spinner element
 */
export function createLoadingSpinner(size = 'md', color = 'var(--color-secondary)') {
    const sizes = {
        sm: '16px',
        md: '24px',
        lg: '32px'
    };

    const spinnerSize = sizes[size] || sizes.md;

    const spinner = createElement('div', {
        className: 'loading-spinner',
        style: {
            width: spinnerSize,
            height: spinnerSize,
            border: `2px solid var(--color-border)`,
            borderTopColor: color,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    });

    return spinner;
}

/**
 * Create loading overlay
 * @param {string} message - Loading message
 * @returns {HTMLElement} Loading overlay element
 */
export function createLoadingOverlay(message = 'Loading...') {
    const overlay = createElement('div', {
        className: 'loading-overlay',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }
    });

    const spinner = createLoadingSpinner('lg');
    const text = createElement('p', {
        style: {
            color: 'white',
            marginTop: '16px',
            fontSize: '18px'
        }
    }, message);

    overlay.appendChild(spinner);
    overlay.appendChild(text);

    return overlay;
}

/**
 * Create toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds
 * @returns {HTMLElement} Toast element
 */
export function createToast(message, type = 'info', duration = 3000) {
    const colors = {
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-secondary)'
    };

    const toast = createElement('div', {
        className: `toast toast-${type}`,
        style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: colors[type] || colors.info,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease'
        }
    }, message);

    // Add to document
    document.body.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, duration);

    return toast;
}

/**
 * Create modal dialog
 * @param {string} title - Modal title
 * @param {string|HTMLElement} content - Modal content
 * @param {Array<Object>} buttons - Array of button configurations
 * @returns {HTMLElement} Modal element
 */
export function createModal(title, content, buttons = []) {
    const modal = createElement('div', {
        className: 'modal',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
        }
    });

    const modalContent = createElement('div', {
        className: 'modal-content',
        style: {
            backgroundColor: 'var(--color-surface)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
        }
    });

    const titleElement = createElement('h3', {
        style: {
            marginTop: 0,
            marginBottom: '16px',
            color: 'var(--color-text-primary)'
        }
    }, title);

    modalContent.appendChild(titleElement);

    if (typeof content === 'string') {
        const contentElement = createElement('div', {
            style: {
                marginBottom: '24px',
                color: 'var(--color-text-secondary)'
            }
        }, content);
        modalContent.appendChild(contentElement);
    } else if (content instanceof HTMLElement) {
        modalContent.appendChild(content);
    }

    if (buttons.length > 0) {
        const buttonContainer = createElement('div', {
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '16px'
            }
        });

        buttons.forEach(buttonConfig => {
            const button = createElement('button', {
                className: `btn ${buttonConfig.type === 'primary' ? 'btn-primary' : 'btn-secondary'}`,
                style: {
                    padding: '8px 16px'
                }
            }, buttonConfig.text);

            if (buttonConfig.onClick) {
                button.addEventListener('click', (e) => {
                    buttonConfig.onClick(e);
                    if (buttonConfig.closeModal !== false) {
                        modal.remove();
                    }
                });
            } else {
                button.addEventListener('click', () => modal.remove());
            }

            buttonContainer.appendChild(button);
        });

        modalContent.appendChild(buttonContainer);
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    return modal;
}

/**
 * Add CSS animation keyframes
 * @param {string} name - Animation name
 * @param {string} keyframes - Keyframes CSS
 */
export function addAnimation(name, keyframes) {
    const style = document.createElement('style');
    style.textContent = `@keyframes ${name} { ${keyframes} }`;
    document.head.appendChild(style);
}

// Add default animations
if (typeof document !== 'undefined') {
    addAnimation('spin', `
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    `);

    addAnimation('slideIn', `
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
    `);

    addAnimation('slideOut', `
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
    `);
}