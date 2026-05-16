/* ============================================
   SMLT Website JavaScript
   ============================================ */

// ============================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================

const API_BASE = 'https://api.demonlist.org';

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

let isHost = false;
let players = [];
let projects = [];
let allPlayers = [];

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHostStatus();
    initEventListeners();

    // Загружаем данные в зависимости от страницы
    if (document.getElementById('leaderboardTable')) {
        loadAllPlayers();
    }
    if (document.getElementById('projectsGrid')) {
        loadProjects();
    }
});

function initEventListeners() {
    // Кнопка смены темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Кнопка хоста
    const hostBtn = document.getElementById('hostBtn');
    if (hostBtn) {
        hostBtn.addEventListener('click', () => {
            if (isHost) {
                logoutHost();
            } else {
                showHostModal();
            }
        });
    }

    // Закрытие модалок по клику на оверлей
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Поиск по демонлисту
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterPlayers(e.target.value);
        });
    }

    // Enter для входа хоста
    const hostPassword = document.getElementById('hostPassword');
    if (hostPassword) {
        hostPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyHost(hostPassword.value);
            }
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
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('smlt-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

// ============================================
// ХОСТ АВТОРИЗАЦИЯ
// ============================================

function initHostStatus() {
    isHost = sessionStorage.getItem('smlt-host') === 'true';
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
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
}

function closeHostModal() {
    const modal = document.getElementById('hostModal');
    if (modal) {
        modal.classList.remove('active');
    }
}


const HOST_PASSWORD_HASH = '68065907241f7ace65827881f4142a7f898de23e6a4f72cda44e2c67cad61b9e';

// 2. Полностью заменяем функцию проверки на эту:
function verifyHost(inputPassword) {
    // Превращаем введенный текст в байты для хэширования
    const msgBuffer = new TextEncoder().encode(inputPassword);
    
    // Запускаем встроенное в браузер крипто-хэширование SHA-256
    crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Проверяем совпадение хэшей
        if (inputHash === HOST_PASSWORD_HASH) {
            isHost = true;
            sessionStorage.setItem('smlt-host', 'true');
            
            // Проверяем, есть ли встроенная функция уведомлений (Toast)
            if (typeof showToast === 'function') {
                showToast('Доступ предоставлен! Вы вошли как хост.', 'success');
            } else {
                alert('Доступ предоставлен!');
            }

            // Закрываем модальное окно хоста
            const modal = document.getElementById('hostModal');
            if (modal) modal.classList.remove('active');

            // Обновляем интерфейс
            updateHostButton();
            updateAdminControls();

            // --- АВТОМАТИЧЕСКИЙ ЗАПУСК ИНТЕРФЕЙСА САМОЛЁТИКА ---
            // Включаем отображение админки (вызываем функции, которые есть в app.js)
            if (typeof renderProjects === 'function') renderProjects();
            if (typeof closeAuthModal === 'function') closeAuthModal(); // если есть окно авторизации
            
            // Если у него модалка закрывается как-то иначе, принудительно обновляем интерфейс
            const authModal = document.getElementById('authModal') || document.getElementById('loginModal');
            if (authModal) authModal.classList.remove('active');

        } else {
            if (typeof showToast === 'function') {
                showToast('Неверный пароль хоста!', 'error');
            } else {
                alert('Неверный пароль хоста!');
            }
            isHost = false;
        }
    }).catch(err => {
        console.error('Ошибка безопасности:', err);
    });
}

function logoutHost() {
    isHost = false;
    sessionStorage.removeItem('smlt-host');
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
// ДЕМОНЛИСТ
// ============================================

// Список игроков - редактируется хостом
const DEFAULT_PLAYER_NAMES = [
    "samoletik", "paradoxiz", "clokman", "itzslxnq", "H30n41k_GmD",
    "Filkoty", "DarBeast", "Florned", "Marzyiiik", "euphoriak8",
    "npoctou_gamer", "NopanicGD", "CandyCloud22", "Vakum", "Daggit",
    "Loran", "tapxyhh", "SerGio", "Fanim59", "prostoymofficial",
    "toxik blaze", "NatrixGMD", "toxatort", "SpaceRS", "yeahme",
    "Спини", "Linqwq", "RossceorpGD", "69liqu69"
];

function getPlayerNames() {
    const saved = localStorage.getItem('smlt-players');
    return saved ? JSON.parse(saved) : DEFAULT_PLAYER_NAMES;
}

function savePlayerNames(names) {
    localStorage.setItem('smlt-players', JSON.stringify(names));
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

function escapeHtml(text) {
    if (text == null) return '';
    const str = String(text);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}

function showToast(msg, type = 'error') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 5000);
}

function updateProgress(current, total) {
    const progressFill = document.getElementById('progressFill');
    const loadingText = document.getElementById('loadingText');
    if (progressFill) progressFill.style.width = Math.round((current / total) * 100) + '%';
    if (loadingText) loadingText.textContent = `Загрузка ${current}/${total} игроков...`;
}

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
    const playerNames = getPlayerNames();

    if (playerNames.length === 0) {
        table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Список игроков пуст</p></div>';
        count.textContent = '0 игроков';
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
        if (result && result.error) {
            errors.push(result.error);
        } else if (result) {
            players.push(result);
        }
    }

    // Сортировка по рангу (с меньшей стороны - лучшие первые)
    players.sort((a, b) => (a.rank || 999999) - (b.rank || 999999));
    allPlayers = [...players];
    renderPlayers();

    if (errors.length > 0) {
        showToast(`Не найдены: ${errors.join(', ')}`);
    }

    if (players.length === 0) {
        table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Не удалось загрузить данные игроков</p></div>';
    }
}

function filterPlayers(query) {
    if (!query) {
        players = [...allPlayers];
    } else {
        const q = query.toLowerCase().trim();
        players = allPlayers.filter(p => p.name.toLowerCase().includes(q));
    }
    renderPlayers();
}

function renderPlayers() {
    const table = document.getElementById('leaderboardTable');
    const count = document.getElementById('playersCount');

    if (players.length === 0) {
        table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Игроки не найдены</p></div>';
        return;
    }

    count.textContent = `${players.length} игроков`;
    let html = '<div class="table-header"><div class="cell cell-position">#</div><div class="cell cell-player">Игрок</div><div class="cell cell-points">Очки</div><div class="cell cell-records">Hardest</div></div>';

    players.forEach((p, i) => {
        const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
        const flag = getFlag(p.nationality);
        const name = escapeHtml(p.name);
        const score = p.score ? p.score.toFixed(2) : '—';
        const rank = p.rank || '—';

        // Самый сложный уровень
        let hardestDisplay = '—';
        if (p.hardest && p.hardest.level) {
            hardestDisplay = escapeHtml(p.hardest.level.name || 'Unknown');
        }

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
    document.getElementById('statPlayers').textContent = players.length;

    const totalPoints = players.reduce((sum, p) => sum + (p.score || 0), 0);
    document.getElementById('statPoints').textContent = totalPoints.toFixed(2);

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
            if (!countryCounts[key]) {
                countryCounts[key] = { name: country, count: 0, players: [] };
            }
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
    sorted.forEach((c, idx) => {
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
            const flag = getFlag(p.nationality);
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
        <div class="profile-stat">
            <div class="profile-stat-value">${score}</div>
            <div class="profile-stat-label">Очки</div>
        </div>
        <div class="profile-stat">
            <div class="profile-stat-value">#${rank}</div>
            <div class="profile-stat-label">Глобальный топ</div>
        </div>
        <div class="profile-stat">
            <div class="profile-stat-value">${rec.length}</div>
            <div class="profile-stat-label">Уровней</div>
        </div>
    </div>`;

    if (p.hardest) {
        const hardestName = escapeHtml(p.hardest.level?.name || p.hardest);
        html += `<div class="profile-info-row">
            <span class="profile-info-label">Hardest:</span>
            <span class="profile-info-value">${hardestName}</span>
        </div>`;
    }

    const countryDisplay = escapeHtml(p.nationality || 'Не указана');
    html += `<div class="profile-info-row">
        <span class="profile-info-label">Страна:</span>
        <span class="profile-info-value">${flag} ${countryDisplay}</span>
    </div>`;

    html += `<div class="profile-records-section">
        <h4>Пройденные уровни (${rec.length})</h4>
        <div class="profile-records-list">`;

    if (rec.length > 0) {
        rec.forEach(r => {
            const levelName = escapeHtml(r.level?.name || 'Unknown');
            const placement = r.level?.placement || '?';
            const progress = r.progress || 100;
            html += `<div class="record-item">
                <span class="record-demon">${levelName}<span class="record-placement">#${placement}</span></span>
                <span class="record-progress ${progress >= 100 ? 'progress-100' : ''}">${progress}%</span>
            </div>`;
        });
    } else {
        html += '<div class="no-records">Нет записей</div>';
    }

    html += '</div></div>';
    html += `<div class="profile-link">
        <a href="https://demonlist.org/profile/${p.id}/" target="_blank" rel="noopener noreferrer">🔗 Показать аккаунт в Global Demonlist →</a>
    </div>`;

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
    if (!isHost) {
        showToast('Только хост может добавлять игроков', 'error');
        return;
    }

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

function addPlayer() {
    const nameInput = document.getElementById('newPlayerName');
    const name = nameInput.value.trim();

    if (!name) {
        showToast('Введите имя игрока', 'error');
        return;
    }

    const playerNames = getPlayerNames();
    if (playerNames.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        showToast('Игрок уже есть в списке', 'error');
        return;
    }

    playerNames.push(name);
    savePlayerNames(playerNames);
    closeAddPlayerModal();
    loadAllPlayers();
    showToast(`Игрок "${name}" добавлен!`, 'success');
}

function removePlayer(name) {
    if (!isHost) {
        showToast('Только хост может удалять игроков', 'error');
        return;
    }

    if (!confirm(`Удалить игрока "${name}"?`)) return;

    let playerNames = getPlayerNames();
    playerNames = playerNames.filter(n => n.toLowerCase() !== name.toLowerCase());
    savePlayerNames(playerNames);
    loadAllPlayers();
    showToast(`Игрок "${name}" удалён`, 'success');
}

// ============================================
// ПРОЕКТЫ
// ============================================

const DEFAULT_PROJECTS = [];

function getProjects() {
    const saved = localStorage.getItem('smlt-projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
}

function saveProjects(data) {
    localStorage.setItem('smlt-projects', JSON.stringify(data));
}

function loadProjects() {
    projects = getProjects();
    renderProjects();
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (projects.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">📁</div>
            <p>Проектов пока нет</p>
        </div>`;
        return;
    }

    let html = '';
    projects.forEach((project, idx) => {
        const statusClass = getStatusClass(project.status);

        html += `<div class="project-card">
            ${project.videoId
                ? `<div class="project-video">
                    <iframe src="https://www.youtube.com/embed/${escapeHtml(project.videoId)}?rel=0" frameborder="0" allowfullscreen allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"></iframe>
                </div>
                <div style="padding: var(--spacing-xs) var(--spacing-md); background: var(--color-surface-2); text-align: center;">
                    <a href="https://www.youtube.com/watch?v=${escapeHtml(project.videoId)}" target="_blank" rel="noopener noreferrer" style="font-size: var(--font-size-xs); color: var(--color-secondary);">🔗 Открыть на YouTube</a>
                </div>`
                : `<div class="project-video"><div class="project-video-placeholder">🎬</div></div>`}
            </div>
            <div class="project-content">
                <h3 class="project-title">${escapeHtml(project.name || `Проект #${idx + 1}`)}</h3>
                <div class="project-info">
                    <div class="project-info-item">
                        <span class="project-info-label">ID:</span>
                        <span class="project-info-value">${escapeHtml(project.id || '—')}</span>
                    </div>
                    <div class="project-info-item">
                        <span class="project-info-label">Статус:</span>
                        <span class="project-status ${statusClass}">${escapeHtml(project.status || 'планируется')}</span>
                    </div>
                    <div class="project-info-item">
                        <span class="project-info-label">Верифнут:</span>
                        <span class="project-info-value">${escapeHtml(project.verifier || '—')}</span>
                    </div>
                    ${project.comment ? `<div class="project-info-item">
                        <span class="project-info-label">Коммент:</span>
                        <span class="project-info-value">${escapeHtml(project.comment)}</span>
                    </div>` : ''}
                </div>
                <div class="project-participants">
                    <div class="project-participants-title">Участники:</div>
                    <div class="project-participants-list">
                        ${(project.participants || []).map(p => {
                    const match = p.match(/^(.+?)\s*\((.+?)\)$/);
                    if (match) {
                        const name = match[1].trim();
                        const roles = match[2].split(',').map(r => r.trim());
                        const rolesHtml = roles.map(role => {
                            const roleClass = getRoleClass(role);
                            return `<span class="role ${roleClass}">${role}</span>`;
                        }).join(', ');
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
    const classes = {
        'готов': 'status-ready',
        'в процессе верифа': 'status-verifying',
        'в процессе постройки': 'status-building',
        'планируется': 'status-planned',
        'заморожен': 'status-frozen',
        'мёртв': 'status-dead'
    };
    return classes[status?.toLowerCase()] || 'status-planned';
}

function getRoleClass(role) {
    const roleMap = {
        'HOST': 'role-host',
        'DECO': 'role-deco',
        'GP': 'role-gp',
        'PLAYTEST': 'role-playtest',
        'VERIFER': 'role-verifer',
        'MERGER': 'role-merger',
        'TRANSITION': 'role-transition'
    };
    return roleMap[role.toUpperCase()] || '';
}

function showAddProjectModal() {
    if (!isHost) {
        showToast('Только хост может добавлять проекты', 'error');
        return;
    }

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
    if (!isHost) {
        showToast('Только хост может редактировать проекты', 'error');
        return;
    }

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

function saveProject() {
    const idx = parseInt(document.getElementById('projectIndex').value);

    const project = {
        name: document.getElementById('projectName').value.trim(),
        videoId: extractVideoId(document.getElementById('projectVideo').value.trim()),
        id: document.getElementById('projectId').value.trim(),
        comment: document.getElementById('projectComment').value.trim(),
        status: document.getElementById('projectStatus').value,
        verifier: document.getElementById('projectVerifier').value.trim(),
        participants: document.getElementById('projectParticipants').value
            .split(',')
            .map(p => p.trim())
            .filter(p => p)
    };

    if (idx === -1) {
        projects.push(project);
        showToast('Проект добавлен!', 'success');
    } else {
        projects[idx] = project;
        showToast('Проект обновлён!', 'success');
    }

    saveProjects(projects);
    closeProjectModal();
    renderProjects();
}

function deleteProject(idx) {
    if (!isHost) {
        showToast('Только хост может удалять проекты', 'error');
        return;
    }

    if (!confirm('Удалить этот проект?')) return;

    projects.splice(idx, 1);
    saveProjects(projects);
    renderProjects();
    showToast('Проект удалён', 'success');
}

function extractVideoId(url) {
    if (!url) return '';

    // YouTube URL patterns
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return url;
}

// ============================================
// ИНФОРМАЦИЯ
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
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
