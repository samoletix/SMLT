# Инструкция по настройке Firebase

Firebase - бесплатный сервис от Google для хранения данных в реальном времени.

## Шаг 1: Создание проекта Firebase

1. Перейдите на https://console.firebase.google.com/
2. Нажмите "Create a project" или "Создать проект"
3. Введите название проекта (например: `gd-leaderboard-smlt`)
4. Отключите Google Analytics (не нужно для этого проекта)
5. Нажмите "Create project"

## Шаг 2: Создание Realtime Database

1. В левом меню выберите "Build" → "Realtime Database"
2. Нажмите "Create Database"
3. Выберите расположение сервера (ближайшее к вам)
4. Выберите "Start in test mode" (для начала, потом изменим правила)
5. Нажмите "Enable"

## Шаг 3: Получение конфигурации

1. Нажмите на значок шестеренки ⚙️ → "Project settings"
2. Прокрутите вниз до "Your apps"
3. Нажмите на иконку `</>` (Web app)
4. Введите название приложения (например: `gd-leaderboard`)
5. Скопируйте `firebaseConfig` - он выглядит так:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef..."
};
```

## Шаг 4: Настройка правил безопасности

В Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "players": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Важно:** Для продакшена лучше настроить правила так, чтобы писать могли только авторизованные пользователи.

## Шаг 5: Установка пароля хоста

1. Откройте консоль браузера (F12)
2. Выполните:

```javascript
// Замените "ВАШ_ПАРОЛЬ" на ваш пароль
async function getHash() {
    const encoder = new TextEncoder();
    const data = encoder.encode("samoletikpo1" + 'smlt_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    console.log('Ваш хэш пароля:', hash);
}
getHash();
```

3. Скопируйте полученный хэш
4. В файле `index.html` найдите строку:
   ```javascript
   const correctHash = 'e8f5a3b2c1d4e6f7';
   ```
5. Замените на ваш хэш

## Шаг 6: Обновление index.html

1. Найдите в файле `index.html`:

```javascript
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_PROJECT.firebaseapp.com",
    databaseURL: "https://ВАШ_PROJECT-default-rtdb.firebaseio.com",
    projectId: "ВАШ_PROJECT",
    storageBucket: "ВАШ_PROJECT.appspot.com",
    messagingSenderId: "ВАШ_SENDER_ID",
    appId: "ВАШ_APP_ID"
};
```

2. Замените на вашу конфигурацию из шага 3

## Как работает защита

1. **Пароль хоста** - хранится в виде хэша SHA-256, в коде виден только хэш
2. **Данные игроков** - хранятся на сервере Firebase, не в коде
3. **API ключ Firebase** - это публичный ключ, он безопасен для публикации

## Ограничения бесплатного плана

- 1 GB хранилища
- 10 GB/месяц скачивания
- 100 одновременных подключений

Для небольшого сайта этого более чем достаточно!

## После настройки

1. Загрузите обновлённый `index.html` на GitHub
2. Откройте сайт
3. Нажмите на значок 👑 "Хост" в правом верхнем углу
4. Введите ваш пароль
5. Добавляйте игроков!
