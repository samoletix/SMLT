/*
 * Validation Utilities
 * Provides data validation and sanitization functions
 */

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if value is empty
 */
export function isEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'string') {
        return value.trim().length === 0;
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }

    return false;
}

/**
 * Check if value is a valid string
 * @param {any} value - Value to check
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {boolean} True if value is a valid string
 */
export function isValidString(value, minLength = 1, maxLength = 255) {
    if (typeof value !== 'string') {
        return false;
    }

    const trimmed = value.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Check if value is a valid number
 * @param {any} value - Value to check
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {boolean} True if value is a valid number
 */
export function isValidNumber(value, min = -Infinity, max = Infinity) {
    if (typeof value !== 'number' || isNaN(value)) {
        return false;
    }

    return value >= min && value <= max;
}

/**
 * Check if value is a valid integer
 * @param {any} value - Value to check
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {boolean} True if value is a valid integer
 */
export function isValidInteger(value, min = -Infinity, max = Infinity) {
    if (!isValidNumber(value, min, max)) {
        return false;
    }

    return Number.isInteger(value);
}

/**
 * Check if value is a valid email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
    if (!isValidString(email)) {
        return false;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Check if value is a valid username
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid
 */
export function isValidUsername(username) {
    if (!isValidString(username, 3, 50)) {
        return false;
    }

    // Username can contain letters, numbers, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username.trim());
}

/**
 * Check if value is a valid password
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is valid
 */
export function isValidPassword(password) {
    if (!isValidString(password, 8, 100)) {
        return false;
    }

    // Password should have at least one uppercase, one lowercase, one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers;
}

/**
 * Check if value is a valid player ID
 * @param {any} value - Value to check
 * @returns {boolean} True if value is a valid player ID
 */
export function isValidPlayerId(value) {
    // Player ID can be a number or a string that can be parsed as a number
    if (typeof value === 'number') {
        return isValidInteger(value, 1);
    }

    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return !isNaN(parsed) && isValidInteger(parsed, 1);
    }

    return false;
}

/**
 * Check if value is a valid player identifier (ID or username)
 * @param {any} value - Value to check
 * @returns {boolean} True if value is a valid player identifier
 */
export function isValidPlayerIdentifier(value) {
    if (typeof value !== 'string') {
        return false;
    }

    const trimmed = value.trim();

    // Check if it's a valid player ID (numeric)
    if (/^\d+$/.test(trimmed)) {
        return isValidPlayerId(parseInt(trimmed, 10));
    }

    // Check if it's a valid username
    return isValidUsername(trimmed);
}

/**
 * Validate player data object
 * @param {Object} playerData - Player data to validate
 * @returns {Object} Validation result
 */
export function validatePlayerData(playerData) {
    const errors = [];

    if (!playerData || typeof playerData !== 'object') {
        errors.push('Player data must be an object');
        return { isValid: false, errors };
    }

    // Check required fields
    const requiredFields = ['id', 'username', 'position', 'points', 'records'];

    requiredFields.forEach(field => {
        if (!(field in playerData)) {
            errors.push(`Missing required field: ${field}`);
        }
    });

    // Validate field types and values
    if (playerData.id !== undefined && !isValidPlayerId(playerData.id)) {
        errors.push('Invalid player ID');
    }

    if (playerData.username !== undefined && !isValidString(playerData.username, 1, 100)) {
        errors.push('Invalid username');
    }

    if (playerData.position !== undefined && !isValidInteger(playerData.position, 1)) {
        errors.push('Invalid position (must be positive integer)');
    }

    if (playerData.points !== undefined && !isValidNumber(playerData.points, 0)) {
        errors.push('Invalid points (must be non-negative number)');
    }

    if (playerData.records !== undefined && !isValidInteger(playerData.records, 0)) {
        errors.push('Invalid records count (must be non-negative integer)');
    }

    if (playerData.lastUpdated !== undefined && !isValidNumber(playerData.lastUpdated, 0)) {
        errors.push('Invalid lastUpdated timestamp');
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
        validatedData: errors.length === 0 ? playerData : null
    };
}

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/[&<>"']/g, '') // Remove special characters
        .substring(0, 1000); // Limit length
}

/**
 * Sanitize number input
 * @param {any} input - Input to sanitize as number
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input, defaultValue = 0) {
    if (typeof input === 'number' && !isNaN(input)) {
        return input;
    }

    if (typeof input === 'string') {
        const parsed = parseFloat(input);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }

    return defaultValue;
}

/**
 * Sanitize integer input
 * @param {any} input - Input to sanitize as integer
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Sanitized integer
 */
export function sanitizeInteger(input, defaultValue = 0) {
    const number = sanitizeNumber(input, defaultValue);
    return Math.floor(number);
}

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result with sanitized data
 */
export function validateFormData(formData, schema) {
    const errors = {};
    const sanitizedData = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = formData[field];
        const fieldErrors = [];

        // Check required
        if (rules.required && isEmpty(value)) {
            fieldErrors.push(`${field} is required`);
        }

        // Skip further validation if value is empty and not required
        if (isEmpty(value) && !rules.required) {
            sanitizedData[field] = rules.default || null;
            continue;
        }

        // Type validation
        if (rules.type === 'string' && typeof value !== 'string') {
            fieldErrors.push(`${field} must be a string`);
        } else if (rules.type === 'number' && typeof value !== 'number' && isNaN(parseFloat(value))) {
            fieldErrors.push(`${field} must be a number`);
        } else if (rules.type === 'integer' && !isValidInteger(value)) {
            fieldErrors.push(`${field} must be an integer`);
        } else if (rules.type === 'email' && !isValidEmail(value)) {
            fieldErrors.push(`${field} must be a valid email address`);
        } else if (rules.type === 'username' && !isValidUsername(value)) {
            fieldErrors.push(`${field} must be a valid username`);
        } else if (rules.type === 'password' && !isValidPassword(value)) {
            fieldErrors.push(`${field} must be a valid password`);
        }

        // Length validation
        if (rules.minLength && isValidString(value) && value.length < rules.minLength) {
            fieldErrors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && isValidString(value) && value.length > rules.maxLength) {
            fieldErrors.push(`${field} must be at most ${rules.maxLength} characters`);
        }

        // Range validation
        if (rules.min !== undefined && isValidNumber(value) && value < rules.min) {
            fieldErrors.push(`${field} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && isValidNumber(value) && value > rules.max) {
            fieldErrors.push(`${field} must be at most ${rules.max}`);
        }

        // Pattern validation
        if (rules.pattern && isValidString(value) && !rules.pattern.test(value)) {
            fieldErrors.push(`${field} must match the required pattern`);
        }

        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
            const customError = rules.validate(value, formData);
            if (customError) {
                fieldErrors.push(customError);
            }
        }

        // If no errors, sanitize and add to sanitized data
        if (fieldErrors.length === 0) {
            if (rules.type === 'string') {
                sanitizedData[field] = sanitizeString(value);
            } else if (rules.type === 'number') {
                sanitizedData[field] = sanitizeNumber(value, rules.default);
            } else if (rules.type === 'integer') {
                sanitizedData[field] = sanitizeInteger(value, rules.default);
            } else {
                sanitizedData[field] = value;
            }
        } else {
            errors[field] = fieldErrors;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : null,
        sanitizedData
    };
}

/**
 * Create validation schema for login form
 * @returns {Object} Login form validation schema
 */
export function createLoginSchema() {
    return {
        username: {
            type: 'string',
            required: true,
            minLength: 3,
            maxLength: 50
        },
        password: {
            type: 'string',
            required: true,
            minLength: 8,
            maxLength: 100
        }
    };
}

/**
 * Create validation schema for add player form
 * @returns {Object} Add player form validation schema
 */
export function createAddPlayerSchema() {
    return {
        identifier: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            validate: (value) => {
                if (!isValidPlayerIdentifier(value)) {
                    return 'Please enter a valid player ID or username';
                }
                return null;
            }
        }
    };
}