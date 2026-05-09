/*
 * Error Handler Utilities
 * Provides consistent error handling and display
 */

/**
 * Error classification types
 */
export const ErrorType = {
    USER: 'user',           // User input errors
    API: 'api',             // API communication errors
    NETWORK: 'network',     // Network connectivity errors
    STORAGE: 'storage',     // Storage operation errors
    AUTH: 'auth',           // Authentication errors
    VALIDATION: 'validation', // Data validation errors
    UNKNOWN: 'unknown'      // Unknown/unexpected errors
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
    INFO: 'info',       // Informational, no action needed
    WARNING: 'warning', // Warning, user should be aware
    ERROR: 'error',     // Error, functionality affected
    CRITICAL: 'critical' // Critical, application may not work
};

/**
 * Classify an error based on its properties
 * @param {Error} error - The error to classify
 * @returns {string} Error type
 */
export function classifyError(error) {
    if (!error) {
        return ErrorType.UNKNOWN;
    }

    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';

    // Check for network errors
    if (name.includes('network') || message.includes('network') ||
        message.includes('fetch') || message.includes('http')) {
        return ErrorType.NETWORK;
    }

    // Check for API errors
    if (message.includes('api') || message.includes('rate limit') ||
        message.includes('endpoint')) {
        return ErrorType.API;
    }

    // Check for storage errors
    if (name.includes('quota') || message.includes('storage') ||
        message.includes('localstorage')) {
        return ErrorType.STORAGE;
    }

    // Check for authentication errors
    if (message.includes('auth') || message.includes('login') ||
        message.includes('password') || message.includes('credentials')) {
        return ErrorType.AUTH;
    }

    // Check for validation errors
    if (message.includes('valid') || message.includes('invalid') ||
        message.includes('required') || message.includes('missing')) {
        return ErrorType.VALIDATION;
    }

    // Check for user errors
    if (message.includes('user') || message.includes('input') ||
        message.includes('enter') || message.includes('please')) {
        return ErrorType.USER;
    }

    return ErrorType.UNKNOWN;
}

/**
 * Determine error severity
 * @param {string} errorType - The classified error type
 * @param {Error} error - The original error
 * @returns {string} Error severity
 */
export function determineSeverity(errorType, error) {
    switch (errorType) {
        case ErrorType.USER:
        case ErrorType.VALIDATION:
            return ErrorSeverity.INFO;

        case ErrorType.API:
        case ErrorType.STORAGE:
            return ErrorSeverity.WARNING;

        case ErrorType.NETWORK:
        case ErrorType.AUTH:
            return ErrorSeverity.ERROR;

        case ErrorType.UNKNOWN:
        default:
            return ErrorSeverity.CRITICAL;
    }
}

/**
 * Get user-friendly error message
 * @param {string} errorType - The classified error type
 * @param {Error} error - The original error
 * @returns {string} User-friendly error message
 */
export function getUserErrorMessage(errorType, error) {
    const defaultMessage = 'An unexpected error occurred. Please try again.';

    switch (errorType) {
        case ErrorType.USER:
            return error.message || 'Please check your input and try again.';

        case ErrorType.VALIDATION:
            return error.message || 'The provided data is invalid. Please check and try again.';

        case ErrorType.API:
            return 'Unable to connect to the server. Please try again later.';

        case ErrorType.NETWORK:
            return 'Network connection lost. Please check your internet connection.';

        case ErrorType.STORAGE:
            return 'Unable to save data. Your browser storage may be full.';

        case ErrorType.AUTH:
            return error.message || 'Authentication failed. Please check your credentials.';

        case ErrorType.UNKNOWN:
        default:
            return defaultMessage;
    }
}

/**
 * Get recovery action for an error
 * @param {string} errorType - The classified error type
 * @returns {string|null} Recovery action or null
 */
export function getRecoveryAction(errorType) {
    switch (errorType) {
        case ErrorType.USER:
        case ErrorType.VALIDATION:
            return 'Please correct the input and try again.';

        case ErrorType.API:
        case ErrorType.NETWORK:
            return 'Please check your connection and try again.';

        case ErrorType.STORAGE:
            return 'Try clearing some browser data or use a different browser.';

        case ErrorType.AUTH:
            return 'Please check your credentials and try again.';

        case ErrorType.UNKNOWN:
        default:
            return 'Please refresh the page and try again.';
    }
}

/**
 * Log error details for debugging
 * @param {Error} error - The error to log
 * @param {string} context - Additional context information
 */
export function logErrorDetails(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorType = classifyError(error);
    const severity = determineSeverity(errorType, error);

    const logEntry = {
        timestamp,
        severity,
        type: errorType,
        name: error.name,
        message: error.message,
        stack: error.stack,
        context
    };

    console.error(`[${timestamp}] ${severity.toUpperCase()}: ${errorType} error`, logEntry);

    // In a production app, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: { context } });
}

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {any} data - Additional error data
 * @returns {Object} Standardized error object
 */
export function createError(message, type = ErrorType.UNKNOWN, data = null) {
    const error = new Error(message);
    error.type = type;
    error.severity = determineSeverity(type, error);
    error.timestamp = Date.now();

    if (data) {
        error.data = data;
    }

    return error;
}

/**
 * Handle error and display to user
 * @param {Error} error - The error to handle
 * @param {HTMLElement} displayElement - Element to display error in
 * @param {string} context - Additional context
 */
export function handleAndDisplayError(error, displayElement, context = '') {
    if (!displayElement) {
        console.warn('No display element provided for error:', error);
        return;
    }

    // Log error details
    logErrorDetails(error, context);

    // Classify error
    const errorType = classifyError(error);

    // Get user-friendly message
    const userMessage = getUserErrorMessage(errorType, error);

    // Get recovery action
    const recoveryAction = getRecoveryAction(errorType);

    // Display error
    displayElement.textContent = userMessage;
    displayElement.style.display = 'block';

    // Add recovery action if available
    if (recoveryAction && displayElement.dataset) {
        displayElement.dataset.recoveryAction = recoveryAction;
    }

    // Set appropriate CSS class based on severity
    const severity = determineSeverity(errorType, error);
    displayElement.className = `error-message error-${severity}`;
}

/**
 * Clear error display
 * @param {HTMLElement} displayElement - Element to clear
 */
export function clearErrorDisplay(displayElement) {
    if (displayElement) {
        displayElement.textContent = '';
        displayElement.style.display = 'none';
        displayElement.className = 'error-message';

        if (displayElement.dataset) {
            delete displayElement.dataset.recoveryAction;
        }
    }
}

/**
 * Check if error is recoverable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error is recoverable
 */
export function isRecoverableError(error) {
    const errorType = classifyError(error);

    // Most errors are recoverable except critical unknown errors
    return errorType !== ErrorType.UNKNOWN ||
        determineSeverity(errorType, error) !== ErrorSeverity.CRITICAL;
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise<any>} Function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if error is recoverable
            if (!isRecoverableError(error)) {
                break;
            }

            // Don't retry on last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}