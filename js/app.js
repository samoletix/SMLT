/*
 * Geometry Dash Leaderboard - SMLT Community Edition
 * Main Application Entry Point
 */

import { authManager } from './services/auth.js';

// Application State
const AppState = {
    isAuthenticated: false,
    players: [],
    isLoading: false,
    error: null,
    lastUpdate: null
};

// DOM Elements
const DOM = {
    playerRows: document.getElementById('player-rows'),
    refreshBtn: document.getElementById('refresh-btn'),
    loadingIndicator: document.getElementById('loading-indicator'),
    managementSection: document.getElementById('management-section'),
    playerIdentifier: document.getElementById('player-identifier'),
    addPlayerBtn: document.getElementById('add-player-btn'),
    addPlayerError: document.getElementById('add-player-error'),
    totalPlayers: document.getElementById('total-players'),
    lastUpdated: document.getElementById('last-updated'),
    apiStatus: document.getElementById('api-status'),
    apiStatusDetail: document.getElementById('api-status-detail'),
    apiDot: document.getElementById('api-dot'),
    errorDisplay: document.getElementById('error-display'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    modalUsername: document.getElementById('modal-username'),
    modalPassword: document.getElementById('modal-password'),
    modalLoginBtn: document.getElementById('modal-login-btn'),
    modalAuthError: document.getElementById('modal-auth-error')
};

/**
 * Initialize Application
 */
async function initApp() {
    console.log('GD Leaderboard initializing...');

    // Restore authentication state
    const authRestored = authManager.restoreSession();
    AppState.isAuthenticated = authRestored;

    // Update host UI
    if (typeof window.updateHostUI === 'function') {
        const session = authManager.getSession();
        window.updateHostUI(authRestored, session?.username || '');
    }

    // Set up event listeners
    setupEventListeners();

    // Update UI
    updateUI();

    console.log('Application initialized successfully.');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Player Management
    if (DOM.addPlayerBtn) {
        DOM.addPlayerBtn.addEventListener('click', handleAddPlayer);
    }

    if (DOM.refreshBtn) {
        DOM.refreshBtn.addEventListener('click', handleRefreshData);
    }

    if (DOM.retryBtn) {
        DOM.retryBtn.addEventListener('click', handleRetry);
    }

    // Form submission on Enter key
    if (DOM.playerIdentifier) {
        DOM.playerIdentifier.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddPlayer();
            }
        });
    }

    // Modal login - THIS IS THE KEY LISTENER
    if (DOM.modalLoginBtn) {
        DOM.modalLoginBtn.onclick = handleModalLogin;
        console.log('Login button listener attached');
    }

    // Modal password Enter key
    if (DOM.modalPassword) {
        DOM.modalPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleModalLogin();
            }
        });
    }

    console.log('Event listeners set up.');
}

/**
 * Handle modal login
 */
async function handleModalLogin() {
    console.log('handleModalLogin called');

    const username = DOM.modalUsername?.value?.trim() || '';
    const password = DOM.modalPassword?.value || '';

    console.log('Username:', username, 'Password length:', password.length);

    // Clear previous errors
    clearModalError();

    // Basic validation
    if (!username || !password) {
        showModalError('Введите логин и пароль');
        return;
    }

    // Set loading state
    DOM.modalLoginBtn.disabled = true;
    DOM.modalLoginBtn.textContent = 'Вход...';

    try {
        // Attempt login
        const success = await authManager.login(username, password);
        console.log('Login result:', success);

        if (success) {
            AppState.isAuthenticated = true;

            // Update host UI
            if (typeof window.updateHostUI === 'function') {
                window.updateHostUI(true, username);
            }

            // Hide modal
            hideModal();

            // Clear form
            if (DOM.modalUsername) DOM.modalUsername.value = '';
            if (DOM.modalPassword) DOM.modalPassword.value = '';

            // Show success
            showToast(`Добро пожаловать, ${username}!`, 'success');

            updateUI();
        } else {
            showModalError('Неверный логин или пароль');
        }
    } catch (error) {
        console.error('Login error:', error);
        showModalError(error.message || 'Ошибка входа');
    } finally {
        DOM.modalLoginBtn.disabled = false;
        DOM.modalLoginBtn.textContent = 'Войти';
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    authManager.logout();
    AppState.isAuthenticated = false;

    if (typeof window.updateHostUI === 'function') {
        window.updateHostUI(false);
    }

    showToast('Выход выполнен', 'info');
    updateUI();
}

/**
 * Handle adding a player
 */
async function handleAddPlayer() {
    const identifier = DOM.playerIdentifier?.value?.trim() || '';
    clearAddPlayerError();

    if (!identifier) {
        showAddPlayerError('Введите ID или никнейм игрока');
        return;
    }

    if (!AppState.isAuthenticated) {
        showAddPlayerError('Войдите в систему, чтобы добавлять игроков');
        return;
    }

    showAddPlayerError('Управление игроками будет реализовано в Фазе 2');

    if (DOM.playerIdentifier) {
        DOM.playerIdentifier.value = '';
    }
}

/**
 * Handle refreshing data
 */
async function handleRefreshData() {
    if (!AppState.isAuthenticated) {
        showError('Войдите в систему для обновления данных');
        return;
    }

    setLoading(true);

    setTimeout(() => {
        setLoading(false);
        showError('Обновление данных будет реализовано в Фазе 2');
    }, 1000);
}

/**
 * Handle retry
 */
function handleRetry() {
    hideError();
}

/**
 * Update UI
 */
function updateUI() {
    // Management section visibility
    if (DOM.managementSection) {
        DOM.managementSection.style.display = AppState.isAuthenticated ? 'block' : 'none';
    }

    // Refresh button state
    if (DOM.refreshBtn) {
        DOM.refreshBtn.disabled = !AppState.isAuthenticated;
    }

    // Stats
    if (DOM.totalPlayers) {
        DOM.totalPlayers.textContent = AppState.players.length;
    }

    if (DOM.lastUpdated) {
        DOM.lastUpdated.textContent = AppState.lastUpdate
            ? new Date(AppState.lastUpdate).toLocaleString('ru-RU')
            : 'Никогда';
    }

    if (DOM.apiStatus) {
        DOM.apiStatus.textContent = AppState.isLoading ? 'Загрузка...' : 'Готов';
    }

    if (DOM.apiDot) {
        DOM.apiDot.className = 'status-dot ' + (AppState.isLoading ? 'loading' : 'online');
    }

    if (DOM.apiStatusDetail) {
        const dot = `<span class="status-dot ${AppState.isLoading ? 'loading' : 'online'}"></span>`;
        DOM.apiStatusDetail.innerHTML = dot + (AppState.isLoading ? 'Загрузка...' : 'Готов');
    }

    // Player rows
    if (DOM.playerRows) {
        if (AppState.players.length === 0) {
            DOM.playerRows.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <p>${AppState.isAuthenticated
                    ? 'Список пуст. Используйте раздел управления, чтобы добавить игроков.'
                    : 'Список пуст. Войдите как хост, чтобы добавить игроков.'
                }</p>
                </div>
            `;
        }
    }
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    AppState.isLoading = isLoading;

    if (DOM.loadingIndicator) {
        DOM.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }

    if (DOM.refreshBtn) {
        DOM.refreshBtn.disabled = isLoading || !AppState.isAuthenticated;
    }

    updateUI();
}

/**
 * Show error message
 */
function showError(message) {
    if (DOM.errorMessage) {
        DOM.errorMessage.textContent = message;
    }

    if (DOM.errorDisplay) {
        DOM.errorDisplay.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideError() {
    if (DOM.errorDisplay) {
        DOM.errorDisplay.style.display = 'none';
    }
}

/**
 * Show add player error
 */
function showAddPlayerError(message) {
    if (DOM.addPlayerError) {
        DOM.addPlayerError.textContent = message;
        DOM.addPlayerError.style.display = 'block';
    }
}

/**
 * Clear add player error
 */
function clearAddPlayerError() {
    if (DOM.addPlayerError) {
        DOM.addPlayerError.textContent = '';
        DOM.addPlayerError.style.display = 'none';
    }
}

/**
 * Show modal error
 */
function showModalError(message) {
    if (DOM.modalAuthError) {
        DOM.modalAuthError.textContent = message;
        DOM.modalAuthError.style.display = 'block';
    }
}

/**
 * Clear modal error
 */
function clearModalError() {
    if (DOM.modalAuthError) {
        DOM.modalAuthError.textContent = '';
        DOM.modalAuthError.style.display = 'none';
    }
}

/**
 * Hide modal
 */
function hideModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--color-success)' :
            type === 'error' ? 'var(--color-error)' :
                'var(--color-secondary)'};
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: toast-in 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes toast-in {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes toast-out {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', initApp);

// Add logout to host badge
document.addEventListener('DOMContentLoaded', () => {
    const hostBadge = document.getElementById('host-badge');
    if (hostBadge) {
        hostBadge.style.cursor = 'pointer';
        hostBadge.title = 'Нажмите для выхода';
        hostBadge.onclick = handleLogout;
    }
});

console.log('app.js loaded');