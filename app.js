/* ============================================
   SMLT Website JavaScript
   ============================================ */

// ============================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================

const API_BASE = 'https://api.demonlist.org'; // API Демонлиста
const BACKEND_API = 'http://localhost:8080/api'; // Подтягивание бекенда

// Флаги стран (эмодзи)
const FLAGS = {
    'RU': '🇷🇺', 'US': '🇺🇸', 'DE': '🇩🇪', 'FR': '🇫🇷', 'GB': '🇬🇧',
    'BR': '🇧🇷', 'KR': '🇰🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'PL': '🇵🇱',
    'UA': '🇺🇦', 'CA': '🇨🇦', 'AU': '🇦🇺', 'ES': '🇪🇸', 'IT': '🇮🇹',
    'AR': '🇦🇷', 'CL': '🇨🇱', 'MX': '🇲🇽', 'NL': '🇳🇱', 'SE': '🇸🇪',
    'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰', 'BE': '🇧🇪', 'AT': '🇦🇹',
    'CZ': '🇨🇿', 'SK': '🇸🇰', 'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬',
    'TR': '🇹🇷', 'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'IN': '🇮🇳',
    'ID': '🇮🇩', 'TH': '🇹🇭', 'VN': '🇻🇳', 'MY': '🇲🇾', 'SG': '🇸🇬',
    'PH': '🇵🇭', 'NZ': '🇳🇿', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬',
    'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'EC': '🇪🇨', 'PT': '🇵🇹',
    'GR': '🇬🇷', 'HR': '🇭🇷', 'RS': '🇷🇸', 'SI': '🇸🇮', 'EE': '🇪🇪',
    'LV': '🇱🇻', 'LT': '🇱🇹', 'BY': '🇧🇾', 'KZ': '🇰🇿', 'UZ': '🇺🇿',
    'TW': '🇹🇼', 'HK': '🇭🇰', 'MO': '🇲🇴', 'AM': '🇦🇲', 'MD': '🇲🇩'
};

// Маппинг названий стран к кодам
const COUNTRY_TO_CODE = {
    'russia': 'RU', 'united-states': 'US', 'germany': 'DE', 'france': 'FR',
    'united-kingdom': 'GB', 'brazil': 'BR', 'south-korea': 'KR', 'korea': 'KR',
    'japan': 'JP', 'china': 'CN', 'poland': 'PL', 'ukraine': 'UA',
    'canada': 'CA', 'australia': 'AU', 'spain': 'ES', 'italy': 'IT',
    'argentina': 'AR', 'chile': 'CL', 'mexico': 'MX', 'netherlands': 'NL',
    'sweden': 'SE', 'norway': 'NO', 'finland': 'FI', 'denmark': 'DK',
    'belgium': 'BE', 'austria': 'AT', 'czech-republic': 'CZ', 'czechia': 'CZ',
    'slovakia': 'SK', 'hungary': 'HU', 'romania': 'RO', 'bulgaria': 'BG',
    'turkey': 'TR', 'israel': 'IL', 'saudi-arabia': 'SA', 'united-arab-emirates': 'AE',
    'india': 'IN', 'indonesia': 'ID', 'thailand': 'TH', 'vietnam': 'VN',
    'malaysia': 'MY', 'singapore': 'SG', 'philippines': 'PH', 'new-zealand': 'NZ',
    'south-africa': 'ZA', 'egypt': 'EG', 'nigeria': 'NG', 'colombia': 'CO',
    'peru': 'PE', 'venezuela': 'VE', 'ecuador': 'EC', 'portugal': 'PT',
    'greece': 'GR', 'croatia': 'HR', 'serbia': 'RS', 'slovenia': 'SI',
    'estonia': 'EE', 'latvia': 'LV', 'lithuania': 'LT', 'belarus': 'BY',
    'kazakhstan': 'KZ', 'uzbekistan': 'UZ', 'taiwan': 'TW', 'hong-kong': 'HK',
    'macau': 'MO', 'armenia': 'AM', 'moldova': 'MD'
};

// ============================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================

let authToken = sessionStorage.getItem('smlt_auth_token') || null;
let isHost = !!authToken; // Если есть токен, считаем хостом до проверки

let players = [];
let projects = [];
let allPlayers = [];
let levels = [];

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHostStatus();
    initEventListeners();

    // Загружаем данные с бэкенда в зависимости от страницы
    if (document.getElementById('leaderboardTable')) {
        loadAllPlayers();
    }
    if (document.getElementById('projectsGrid')) {
        loadProjects();
    }
});

function initEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    const hostBtn = document.getElementById('hostBtn');
    if (hostBtn) {
        hostBtn.addEventListener('click', () => {
            if (isHost) logoutHost();
            else showHostModal();
        });
    }

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterPlayers(e.target.value));
    }

    const levelSearchInput = document.getElementById('levelSearchInput');
    if (levelSearchInput) {
        levelSearchInput.addEventListener('input', (e) => filterLevels(e.target.value));
    }

    const hostPassword = document.getElementById('hostPassword');
    if (hostPassword) {
        hostPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyHost(hostPassword.value);
        });
    }   
}

// ============================================
// ТЕМА
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('smlt-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('smlt-theme', newTheme);
    updateThemeIcon(newTheme);
    
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// ============================================
// ХОСТ АВТОРИЗАЦИЯ 
// ============================================

function initHostStatus() {
    updateHostButton();
    updateAdminControls();
}

function showHostModal() {
    const modal = document.getElementById('hostModal');
    const passwordInput = document.getElementById('hostPassword');
    const errorEl = document.getElementById('hostError');

    if (modal) {
        modal.classList.add('active');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
        if (errorEl) errorEl.style.display = 'none';
    }
}

function closeHostModal() {
    const modal = document.getElementById('hostModal');
    if (modal) modal.classList.remove('active');
}

// НОВАЯ: Отправляет пароль на бэкенд и получает токен
async function verifyHost(inputPassword) {
    if (!inputPassword) return;

    try {
        const response = await fetch(`${BACKEND_API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: inputPassword })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            authToken = data.token;
            sessionStorage.setItem('smlt_auth_token', data.token);
            isHost = true;
            
            showToast('Доступ предоставлен сервером!', 'success');
            closeHostModal();
            updateHostButton();
            updateAdminControls();
            
            const authModal = document.getElementById('authModal') || document.getElementById('loginModal');
            if (authModal) authModal.classList.remove('active');

        } else {
            showToast(data.error || 'Неверный пароль хоста!', 'error');
            isHost = false;
        }
    } catch (err) {
        console.error('Ошибка авторизации:', err);
        showToast('Сервер бэкенда недоступен', 'error');
    }
}

function logoutHost() {
    authToken = null;
    isHost = false;
    sessionStorage.removeItem('smlt_auth_token');
    updateHostButton();
    updateAdminControls();
    showToast('Вы вышли из режима хоста', 'info');
}

function updateHostButton() {
    const hostBtn = document.getElementById('hostBtn');
    if (hostBtn) {
        if (isHost) {
            hostBtn.classList.add('is-host');
            hostBtn.innerHTML = '<span>👑 Хост</span>';
        } else {
            hostBtn.classList.remove('is-host');
            hostBtn.innerHTML = '<span>Хост</span>';
        }
    }
}

function updateAdminControls() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        el.style.display = isHost ? '' : 'none';
    });
}

// ============================================
// ДЕМОНЛИСТ И ИГРОКИ 
// ============================================

const DEFAULT_PLAYER_NAMES = [
    "Florned", "SpaceRS", "npoctou_gamer", "Toxik Blaze", "euphoriak8", "CandyCloud22", "samoletik", "Vakum", "linqwq", "SerGio", "H30n41k_GmD", "yeahme", "69liqu69", "Спини", "RossceorpGD", "Tapxyhh", "NopanicGD", "NatrixGMD", "toxaTort", "Marzyiiik", "Daggit", "ParadoXiZ", "itzslxnq", "Clokman", "Filkoty", "Fanim59", "Loran", "prostoymofficial", "DarBeast"
];

// НОВАЯ: Запрашиваем список ников с нашего бэкенда
async function getPlayerNames() {
    try {
        const res = await fetch(`${BACKEND_API}/players`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) return data;
        }
    } catch (e) {
        console.warn('Не удалось загрузить игроков с бэка. Используем дефолт.');
    }
    return DEFAULT_PLAYER_NAMES;
}

// НОВАЯ: Защищенное сохранение ников в БД
async function savePlayerNamesToServer(names) {
    if (!authToken) return false;
    try {
        const res = await fetch(`${BACKEND_API}/admin/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(names)
        });

        if (res.status === 401 || res.status === 403) {
            showToast('Сессия истекла. Войдите снова.', 'error');
            logoutHost();
            return false;
        }
        return res.ok;
    } catch (e) {
        showToast('Ошибка сети при сохранении', 'error');
        return false;
    }
}

// --- Функции Demonlist API остаются без изменений ---

async function fetchPlayerData(name) {
    try {
        const r = await fetch(`${API_BASE}/leaderboard/user/list?search=${encodeURIComponent(name)}&limit=50`);
        if (!r.ok) return null;
        const d = await r.json();
        if (d.message !== 'success' || !d.data?.users?.length) return null;

        const nl = name.toLowerCase().trim();
        const users = d.data.users;

        let fp = users.find(p => p.username?.toLowerCase().trim() === nl);
        if (!fp && !isNaN(parseInt(name))) {
            fp = users.find(p => p.id.toString() === name.trim());
        }

        if (!fp) return null;
        return fp;
    } catch (e) {
        console.error(`Ошибка для "${name}":`, e);
        return null;
    }
}

async function fetchRecords(id) {
    try {
        const r = await fetch(`${API_BASE}/user/record/list?user_id=${id}&limit=50`);
        if (!r.ok) return [];
        const d = await r.json();
        return d.message === 'success' && d.data?.records ? d.data.records : [];
    } catch {
        return [];
    }
}

async function loadAllPlayers() {
    const table = document.getElementById('leaderboardTable');
    const count = document.getElementById('playersCount');
    
    // Ждем получения списка из БД
    const playerNames = await getPlayerNames();

    if (!table) return;

    if (playerNames.length === 0) {
        table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Список игроков пуст</p></div>';
        if (count) count.textContent = '0 игроков';
        return;
    }

    players = [];
    const loadedIds = new Set();

    const promises = playerNames.map(async (name) => {
        name = name.trim();
        if (!name) return null;

        try {
            const fp = await fetchPlayerData(name);
            if (!fp) return { error: name };

            if (loadedIds.has(fp.id)) return null;
            loadedIds.add(fp.id);

            const rec = await fetchRecords(fp.id);
            let hardest = null;
            if (rec.length > 0) {
                const ar = rec.filter(r => r.status === 'accepted' && r.level);
                if (ar.length > 0) hardest = ar.reduce((m, r) => (!m || r.level.placement < m.level.placement) ? r : m);
            }

            return {
                id: fp.id,
                name: fp.username,
                rank: fp.placement || 0,
                score: parseFloat(fp.points) || 0,
                nationality: fp.country || null,
                records: rec,
                hardest: hardest
            };
        } catch (e) {
            return { error: name };
        }
    });

    const results = await Promise.all(promises);

    const errors = [];
    for (const result of results) {
        if (result && result.error) errors.push(result.error);
        else if (result) players.push(result);
    }

    players.sort((a, b) => (a.rank || 999999) - (b.rank || 999999));
    allPlayers = [...players];
    renderPlayers();
    renderHardestLevels();

    if (errors.length > 0) showToast(`Не найдены: ${errors.join(', ')}`);
    if (players.length === 0) table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Не удалось загрузить данные игроков</p></div>';
}

// --- Отрисовка таблиц и статистики остается без изменений ---

function filterPlayers(query) {
    if (!query) players = [...allPlayers];
    else {
        const q = query.toLowerCase().trim();
        players = allPlayers.filter(p => p.name.toLowerCase().includes(q));
    }
    renderPlayers();
}

function renderPlayers() {
    const table = document.getElementById('leaderboardTable');
    const count = document.getElementById('playersCount');
    if (!table) return;

    if (players.length === 0) {
        table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Игроки не найдены</p></div>';
        return;
    }

    if (count) count.textContent = `${players.length} игроков`;
    let html = '<div class="table-header"><div class="cell cell-position">#</div><div class="cell cell-player">Игрок</div><div class="cell cell-points">Очки</div><div class="cell cell-records">Hardest</div></div>';

    players.forEach((p, i) => {
        const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        const flag = getFlag(p.nationality);
        const name = escapeHtml(p.name);
        const score = p.score ? p.score.toFixed(2) : '—';
        const rank = p.rank || '—';

        let hardestDisplay = '—';
        if (p.hardest && p.hardest.level) hardestDisplay = escapeHtml(p.hardest.level.name || 'Unknown');

        html += `<div class="player-row" onclick="showProfile(${i})">
            <div class="cell cell-position ${rc}">${i + 1}</div>
            <div class="cell cell-player">
                <span class="player-flag">${flag}</span>
                <div class="player-info">
                    <span class="player-name">${name}</span>
                    <span class="player-score">${score} pts · #${rank}</span>
                </div>
            </div>
            <div class="cell cell-points">${score}</div>
            <div class="cell cell-records">${hardestDisplay}</div>
        </div>`;
    });

    table.innerHTML = html;
    renderStats();
}

function renderStats() {
    const statPlayers = document.getElementById('statPlayers');
    const statPoints = document.getElementById('statPoints');
    const statHardest = document.getElementById('statHardest');

    if (statPlayers) statPlayers.textContent = players.length;

    const totalPoints = players.reduce((sum, p) => sum + (p.score || 0), 0);
    if (statPoints) statPoints.textContent = totalPoints.toFixed(2);

    let hardestLevel = null;
    let hardestPlayer = null;
    players.forEach(p => {
        if (p.hardest && p.hardest.level) {
            if (!hardestLevel || p.hardest.level.placement < hardestLevel.placement) {
                hardestLevel = p.hardest.level;
                hardestPlayer = p;
            }
        }
    });

    const hardestEl = document.getElementById('statHardest');
    if (hardestLevel) {
        const levelName = hardestLevel.name || '—';
        hardestEl.textContent = levelName;
        hardestEl.title = `${levelName} #${hardestLevel.placement} — ${hardestPlayer ? hardestPlayer.name : '—'}`;
    } else {
        hardestEl.textContent = '—';
    }

    renderCountryStats();
}

function renderCountryStats() {
    const countryList = document.getElementById('countryList');
    if (!countryList) return;

    const countryCounts = {};
    players.forEach(p => {
        const country = p.nationality;
        if (country) {
            const key = country.toLowerCase().trim();
            if (!countryCounts[key]) countryCounts[key] = { name: country, count: 0, players: [] };
            countryCounts[key].count++;
            countryCounts[key].players.push(p);
        }
    });

    const sorted = Object.values(countryCounts).sort((a, b) => b.count - a.count);

    if (sorted.length === 0) {
        countryList.innerHTML = '<div style="color: var(--color-text-muted); font-size: var(--font-size-sm);">Нет данных</div>';
        return;
    }

    let html = '';
    sorted.forEach(c => {
        const flag = getFlag(c.name);
        const countryName = escapeHtml(c.name);
        html += `<div class="country-item" onclick="showCountryTop('${escapeHtml(c.name)}')" style="cursor: pointer;" title="Топ игроков ${countryName}">
            <div class="country-info">
                <span class="country-flag">${flag}</span>
                <span class="country-name">${countryName}</span>
            </div>
            <span class="country-count">${c.count}</span>
        </div>`;
    });

    countryList.innerHTML = html;
}

function showCountryTop(country) {
    const countryPlayers = allPlayers.filter(p => {
        const pCountry = p.nationality?.toLowerCase().trim();
        return pCountry === country.toLowerCase().trim();
    }).sort((a, b) => (a.rank || 999999) - (b.rank || 999999));

    const modal = document.getElementById('countryModal');
    const title = document.getElementById('countryTitle');
    const body = document.getElementById('countryBody');

    if (!modal || !title || !body) return;

    title.textContent = `${getFlag(country)} Топ игроков: ${country}`;

    if (countryPlayers.length === 0) {
        body.innerHTML = '<p style="color: var(--color-text-muted);">Нет данных</p>';
    } else {
        let html = '<div class="country-top-list">';
        countryPlayers.forEach((p, idx) => {
            const name = escapeHtml(p.name);
            const score = p.score ? p.score.toFixed(2) : '—';
            const rank = p.rank || '—';
            html += `<div class="country-top-item" style="display: flex; justify-content: space-between; padding: var(--spacing-sm); border-bottom: 1px solid var(--color-border);">
                <span><strong>#${idx + 1}</strong> ${name}</span>
                <span style="color: var(--color-text-muted);">${score} pts · #${rank}</span>
            </div>`;
        });
        html += '</div>';
        body.innerHTML = html;
    }

    modal.classList.add('active');
}

function closeCountryModal() {
    const modal = document.getElementById('countryModal');
    if (modal) modal.classList.remove('active');
}

function renderHardestLevels() {
    const levelsTable = document.getElementById('levelsTable');
    const levelsCount = document.getElementById('levelsCount');
    const expandContainer = document.getElementById('expandLevelsContainer');

    if (!levelsTable) return;

    const levelMap = new Map();
    players.forEach(player => {
        if (player.records) {
            player.records.forEach(record => {
                if (record.status === 'accepted' && record.level) {
                    const levelId = record.level.id;
                    if (!levelMap.has(levelId)) {
                        levelMap.set(levelId, { id: levelId, name: record.level.name, placement: record.level.placement, victors: [] });
                    }
                    const levelData = levelMap.get(levelId);
                    if (!levelData.victors.find(v => v.id === player.id)) {
                        levelData.victors.push({ id: player.id, name: player.name, nationality: player.nationality });
                    }
                }
            });
        }
    });

    const sortedLevels = Array.from(levelMap.values())
        .filter(level => level.placement !== undefined && level.placement !== null)
        .sort((a, b) => a.placement - b.placement);

    if (sortedLevels.length === 0) {
        levelsTable.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Нет данных об уровнях</p></div>';
        if (levelsCount) levelsCount.textContent = '0 уровней';
        if (expandContainer) expandContainer.style.display = 'none';
        return;
    }

    if (levelsCount) levelsCount.textContent = `${sortedLevels.length} уровней`;

    window.allLevels = sortedLevels;
    window.isLevelsExpanded = false;
    
    renderLevelsList(sortedLevels.slice(0, 39));
    
    if (expandContainer) {
        expandContainer.style.display = sortedLevels.length > 39 ? 'block' : 'none';
    }
    window.levelData = levelMap;
}

function renderLevelsList(levels) {
    const levelsTable = document.getElementById('levelsTable');
    if (!levelsTable) return;

    let html = '<div class="table-header"><div class="cell cell-position">#</div><div class="cell cell-player">Уровень</div><div class="cell cell-points">Позиция</div><div class="cell cell-records">Викторов</div></div>';

    levels.forEach((level, i) => {
        const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        html += `<div class="player-row" onclick="showLevelVictors('${escapeHtml(level.id)}')">
            <div class="cell cell-position ${rc}">${i + 1}</div>
            <div class="cell cell-player">
                <div class="player-info"><span class="player-name">${escapeHtml(level.name)}</span></div>
            </div>
            <div class="cell cell-points">#${level.placement}</div>
            <div class="cell cell-records">${level.victors.length}</div>
        </div>`;
    });
    levelsTable.innerHTML = html;
}

function expandLevels() {
    const expandContainer = document.getElementById('expandLevelsContainer');
    const expandButton = expandContainer?.querySelector('button');
    if (!window.allLevels) return;
    
    if (window.isLevelsExpanded) {
        window.isLevelsExpanded = false;
        renderLevelsList(window.allLevels.slice(0, 39));
        if (expandButton) expandButton.textContent = 'Показать ещё';
    } else {
        window.isLevelsExpanded = true;
        renderLevelsList(window.allLevels);
        if (expandButton) expandButton.textContent = 'Свернуть';
    }
}

function filterLevels(query) {
    if (!window.allLevels) return;
    
    if (!query) {
        window.isLevelsExpanded = false;
        renderLevelsList(window.allLevels.slice(0, 39));
        const expandContainer = document.getElementById('expandLevelsContainer');
        const expandButton = expandContainer?.querySelector('button');
        if (expandContainer) expandContainer.style.display = window.allLevels.length > 39 ? 'block' : 'none';
        if (expandButton) expandButton.textContent = 'Показать ещё';
        return;
    }
    
    const q = query.toLowerCase().trim();
    const filtered = window.allLevels.filter(level => level.name.toLowerCase().includes(q));
    renderLevelsList(filtered);
    
    const expandContainer = document.getElementById('expandLevelsContainer');
    if (expandContainer) expandContainer.style.display = 'none';
}

function showLevelVictors(levelId) {
    const levelData = window.levelData?.get(levelId);
    if (!levelData) return;

    const modal = document.getElementById('levelModal');
    const title = document.getElementById('levelTitle');
    const body = document.getElementById('levelBody');

    if (!modal || !title || !body) return;

    title.textContent = `🏆 ${escapeHtml(levelData.name)} #${levelData.placement}`;

    if (levelData.victors.length === 0) {
        body.innerHTML = '<p style="color: var(--color-text-muted);">Нет викторов</p>';
    } else {
        let html = '<div class="level-victors-list">';
        levelData.victors.forEach((victor, idx) => {
            html += `<div class="level-victor-item" style="display: flex; justify-content: space-between; padding: var(--spacing-sm); border-bottom: 1px solid var(--color-border);">
                <span><strong>#${idx + 1}</strong> ${getFlag(victor.nationality)} ${escapeHtml(victor.name)}</span>
            </div>`;
        });
        html += '</div>';
        body.innerHTML = html;
    }
    modal.classList.add('active');
}

function closeLevelModal() {
    const modal = document.getElementById('levelModal');
    if (modal) modal.classList.remove('active');
}

function showProfile(idx) {
    const p = players[idx];
    if (!p) return;

    const rec = p.records ? p.records.filter(r => r.status === 'accepted' && r.level) : [];
    const flag = getFlag(p.nationality);
    const name = escapeHtml(p.name);

    document.getElementById('profileTitle').textContent = `${flag} ${name}`;

    const score = p.score ? p.score.toFixed(2) : '—';
    const rank = p.rank || '—';

    let html = `<div class="profile-stats">
        <div class="profile-stat"><div class="profile-stat-value">${score}</div><div class="profile-stat-label">Очки</div></div>
        <div class="profile-stat"><div class="profile-stat-value">#${rank}</div><div class="profile-stat-label">Глобальный топ</div></div>
        <div class="profile-stat"><div class="profile-stat-value">${rec.length}</div><div class="profile-stat-label">Уровней</div></div>
    </div>`;

    if (p.hardest) {
        html += `<div class="profile-info-row"><span class="profile-info-label">Hardest:</span><span class="profile-info-value">${escapeHtml(p.hardest.level?.name || p.hardest)}</span></div>`;
    }

    html += `<div class="profile-info-row"><span class="profile-info-label">Страна:</span><span class="profile-info-value">${flag} ${escapeHtml(p.nationality || 'Не указана')}</span></div>`;

    html += `<div class="profile-records-section"><h4>Пройденные уровни (${rec.length})</h4><div class="profile-records-list">`;

    if (rec.length > 0) {
        rec.forEach(r => {
            html += `<div class="record-item">
                <span class="record-demon">${escapeHtml(r.level?.name || 'Unknown')}<span class="record-placement">#${r.level?.placement || '?'}</span></span>
                <span class="record-progress ${r.progress >= 100 ? 'progress-100' : ''}">${r.progress || 100}%</span>
            </div>`;
        });
    } else {
        html += '<div class="no-records">Нет записей</div>';
    }

    html += '</div></div>';
    html += `<div class="profile-link"><a href="https://demonlist.org/profile/${p.id}/" target="_blank" rel="noopener noreferrer">🔗 Показать аккаунт в Global Demonlist →</a></div>`;

    document.getElementById('profileBody').innerHTML = html;
    document.getElementById('profileModal').classList.add('active');
}

function closeProfileModal(e) {
    if (!e || e.target === e.currentTarget) {
        document.getElementById('profileModal').classList.remove('active');
    }
}

// ============================================
// УПРАВЛЕНИЕ ИГРОКАМИ (ХОСТ)
// ============================================

function showAddPlayerModal() {
    if (!isHost) return showToast('Только хост может добавлять игроков', 'error');
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        document.getElementById('newPlayerName').value = '';
        modal.classList.add('active');
    }
}

function closeAddPlayerModal() {
    const modal = document.getElementById('addPlayerModal');
    if (modal) modal.classList.remove('active');
}

// Изменено на async + работа с сервером
async function addPlayer() {
    const nameInput = document.getElementById('newPlayerName');
    const name = nameInput.value.trim();

    if (!name) return showToast('Введите имя игрока', 'error');

    const playerNames = await getPlayerNames();
    if (playerNames.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        return showToast('Игрок уже есть в списке', 'error');
    }

    playerNames.push(name);
    const success = await savePlayerNamesToServer(playerNames);
    
    if (success) {
        closeAddPlayerModal();
        showToast(`Игрок "${name}" добавлен! Загружаем...`, 'info');
        loadAllPlayers(); // Перезагружаем UI
    }
}

// Изменено на async + работа с сервером
async function removePlayer(name) {
    if (!isHost) return showToast('Только хост может удалять игроков', 'error');
    if (!confirm(`Удалить игрока "${name}"?`)) return;

    let playerNames = await getPlayerNames();
    playerNames = playerNames.filter(n => n.toLowerCase() !== name.toLowerCase());
    
    const success = await savePlayerNamesToServer(playerNames);
    if (success) {
        showToast(`Игрок "${name}" удалён`, 'success');
        loadAllPlayers(); // Перезагружаем UI
    }
}

// ============================================
// ПРОЕКТЫ
// ============================================

const DEFAULT_PROJECTS = [];

// НОВАЯ: Грузим проекты с сервера
async function loadProjects() {
    try {
        const res = await fetch(`${BACKEND_API}/projects`);
        if (res.ok) {
            projects = await res.json();
        } else {
            projects = DEFAULT_PROJECTS;
        }
    } catch (e) {
        console.warn('Сервер недоступен, берем пустые проекты');
        projects = DEFAULT_PROJECTS;
    }
    renderProjects();
}

// НОВАЯ: Сохраняем проекты на сервер
async function saveProjectsToServer() {
    if (!authToken) {
        showToast('Только хост может менять проекты', 'error');
        return false;
    }
    try {
        const res = await fetch(`${BACKEND_API}/admin/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(projects)
        });

        if (res.status === 401 || res.status === 403) {
            showToast('Сессия истекла', 'error');
            logoutHost();
            return false;
        }
        return res.ok;
    } catch (e) {
        showToast('Ошибка сохранения', 'error');
        return false;
    }
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (!projects || projects.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-icon">📁</div><p>Проектов пока нет</p></div>`;
        return;
    }

    let html = '';
    projects.forEach((project, idx) => {
        const statusClass = getStatusClass(project.status);
        html += `<div class="project-card">
            ${project.videoId
                ? `<div class="project-video"><iframe src="https://www.youtube.com/embed/${escapeHtml(project.videoId)}?rel=0" frameborder="0" allowfullscreen></iframe></div>
                <div style="padding: var(--spacing-xs) var(--spacing-md); background: var(--color-surface-2); text-align: center;">
                    <a href="https://www.youtube.com/watch?v=${escapeHtml(project.videoId)}" target="_blank" style="font-size: var(--font-size-xs); color: var(--color-secondary);">🔗 Открыть на YouTube</a>
                </div>`
                : `<div class="project-video"><div class="project-video-placeholder">🎬</div></div>`}
            
            <div class="project-content">
                <h3 class="project-title">${escapeHtml(project.name || `Проект #${idx + 1}`)}</h3>
                <div class="project-info">
                    <div class="project-info-item"><span class="project-info-label">ID:</span><span class="project-info-value">${escapeHtml(project.id || '—')}</span></div>
                    <div class="project-info-item"><span class="project-info-label">Статус:</span><span class="project-status ${statusClass}">${escapeHtml(project.status || 'планируется')}</span></div>
                    <div class="project-info-item"><span class="project-info-label">Верифнут:</span><span class="project-info-value">${escapeHtml(project.verifier || '—')}</span></div>
                    ${project.comment ? `<div class="project-info-item"><span class="project-info-label">Коммент:</span><span class="project-info-value">${escapeHtml(project.comment)}</span></div>` : ''}
                </div>
                <div class="project-participants">
                    <div class="project-participants-title">Участники:</div>
                    <div class="project-participants-list">
                        ${(project.participants || []).map(p => {
                            const match = p.match(/^(.+?)\s*\((.+?)\)$/);
                            if (match) {
                                const name = match[1].trim();
                                const rolesHtml = match[2].split(',').map(r => `<span class="role ${getRoleClass(r.trim())}">${escapeHtml(r.trim())}</span>`).join(', ');
                                return `<span class="participant-tag">${escapeHtml(name)} - (${rolesHtml})</span>`;
                            }
                            return `<span class="participant-tag">${escapeHtml(p)}</span>`;
                        }).join('')}
                    </div>
                </div>
                ${isHost ? `<div class="project-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editProject(${idx})">✏️ Редактировать</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject(${idx})">🗑️ Удалить</button>
                </div>` : ''}
            </div>
        </div>`;
    });
    grid.innerHTML = html;
}

function getStatusClass(status) {
    const classes = { 'готов': 'status-ready', 'в процессе верифа': 'status-verifying', 'в процессе постройки': 'status-building', 'планируется': 'status-planned', 'заморожен': 'status-frozen', 'мёртв': 'status-dead' };
    return classes[status?.toLowerCase()] || 'status-planned';
}

function getRoleClass(role) {
    const roleMap = { 'HOST': 'role-host', 'DECO': 'role-deco', 'GP': 'role-gp', 'PLAYTEST': 'role-playtest', 'VERIFER': 'role-verifer', 'MERGER': 'role-merger', 'TRANSITION': 'role-transition' };
    return roleMap[role.toUpperCase()] || '';
}

function showAddProjectModal() {
    if (!isHost) return showToast('Только хост может добавлять проекты', 'error');
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    if (modal && form) {
        form.reset();
        document.getElementById('projectIndex').value = '-1';
        document.getElementById('projectModalTitle').textContent = 'Добавить проект';
        modal.classList.add('active');
    }
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) modal.classList.remove('active');
}

function editProject(idx) {
    if (!isHost) return showToast('Только хост может редактировать проекты', 'error');
    const project = projects[idx];
    if (!project) return;

    document.getElementById('projectIndex').value = idx;
    document.getElementById('projectModalTitle').textContent = 'Редактировать проект';
    document.getElementById('projectName').value = project.name || '';
    document.getElementById('projectVideo').value = project.videoId || '';
    document.getElementById('projectId').value = project.id || '';
    document.getElementById('projectComment').value = project.comment || '';
    document.getElementById('projectStatus').value = project.status || 'планируется';
    document.getElementById('projectVerifier').value = project.verifier || '';
    document.getElementById('projectParticipants').value = (project.participants || []).join(', ');
    document.getElementById('projectModal').classList.add('active');
}

// Изменено на async + работа с сервером
async function saveProject() {
    const idx = parseInt(document.getElementById('projectIndex').value);

    const project = {
        name: document.getElementById('projectName').value.trim(),
        videoId: extractVideoId(document.getElementById('projectVideo').value.trim()),
        id: document.getElementById('projectId').value.trim(),
        comment: document.getElementById('projectComment').value.trim(),
        status: document.getElementById('projectStatus').value,
        verifier: document.getElementById('projectVerifier').value.trim(),
        participants: document.getElementById('projectParticipants').value.split(',').map(p => p.trim()).filter(p => p)
    };

    if (idx === -1) projects.push(project);
    else projects[idx] = project;

    const success = await saveProjectsToServer();
    if (success) {
        showToast(idx === -1 ? 'Проект добавлен!' : 'Проект обновлён!', 'success');
        closeProjectModal();
        renderProjects();
    } else {
        // Если ошибка на бэке, откатываем изменения локально (просто перезагружаем проекты)
        loadProjects();
    }
}

// Изменено на async + работа с сервером
async function deleteProject(idx) {
    if (!isHost) return showToast('Только хост может удалять проекты', 'error');
    if (!confirm('Удалить этот проект?')) return;

    const removedProject = projects.splice(idx, 1)[0];
    const success = await saveProjectsToServer();
    
    if (success) {
        renderProjects();
        showToast('Проект удалён', 'success');
    } else {
        projects.splice(idx, 0, removedProject); // Откат если ошибка
        renderProjects();
    }
}

function extractVideoId(url) {
    if (!url) return '';
    const patterns = [ /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/ ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return url;
}

// ============================================
// ИНФОРМАЦИЯ И УТИЛИТЫ
// ============================================

function showInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.classList.add('active');
}

function closeInfoModal(e) {
    if (!e || e.target === e.currentTarget) {
        const modal = document.getElementById('infoModal');
        if (modal) modal.classList.remove('active');
    }
}

function getFlag(c) {
    if (!c) return '';
    const upper = c.toUpperCase();
    if (FLAGS[upper]) return FLAGS[upper];
    const lower = c.toLowerCase().trim();
    const code = COUNTRY_TO_CODE[lower];
    if (code && FLAGS[code]) return FLAGS[code];
    return '';
}

function showToast(msg, type = 'error') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    const container = document.getElementById('toastContainer');
    if (container) container.appendChild(t);
    setTimeout(() => t.remove(), 5000);
}

function updateProgress(current, total) {
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    if (progressFill) progressFill.style.width = Math.round((current / total) * 100) + '%';
    if (loadingText) loadingText.textContent = `Загрузка ${current}/${total} игроков...`;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}