package main

import (
	"crypto/sha256"
	"fmt"
	"log"
	"net/http"
	"time"

	// Импортируем сам JWT для генерации токенов
	"github.com/golang-jwt/jwt/v5"
	// Нужный пакет для проверки JWT во второй части
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// Секретный ключ для подписи JWT-токенов (смени на свой!)
var jwtSecret = []byte("super-secure-smlt-secret-key-2026")

// Правильный хэш пароля хоста (SHA-256). Хранится ТОЛЬКО здесь, на сервере.
// Для примера тут хэш от строки "password123". Замени на свой хэш.
const CorrectHostPasswordHash = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"

type LoginRequest struct {
	Password string `json:"password"`
}

func main() {
	e := echo.New() // Исправлено: echo с маленькой буквы

	// Настройка CORS, чтобы твой фронтенд мог слать запросы к бэку
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Публичные маршруты (доступны всем игрокам)
	e.POST("/api/auth/login", handleLogin)
	e.GET("/api/projects", getProjects)
	e.GET("/api/players", getPlayers)

	// Защищенная группа маршрутов (только для Хоста)
	adminGroup := e.Group("/api/admin")
	
	// Исправлено: используем современный echojwt.WithConfig
	adminGroup.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: jwtSecret,
	}))

	// Эти действия БД не выполнятся без валидного JWT-токена в заголовке
	adminGroup.POST("/projects", saveProjectsHandler)
	adminGroup.POST("/players", savePlayersHandler)

	log.Fatal(e.Start(":8080"))
}

// Авторизация хоста и выдача токена
func handleLogin(c echo.Context) error {
	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Неверный формат запроса"})
	}

	// Считаем SHA-256 от присланного пароля
	h := sha256.New()
	h.Write([]byte(req.Password))
	inputHash := fmt.Sprintf("%x", h.Sum(nil))

	if inputHash != CorrectHostPasswordHash {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Неверный пароль хоста"})
	}

	// Генерируем JWT-токен на 12 часов
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   time.Now().Add(time.Hour * 12).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Ошибка генерации токена"})
	}

	return c.JSON(http.StatusOK, map[string]string{"token": tokenString})
}

// Заглушки для работы с БД
func getProjects(c echo.Context) error {
	return c.JSON(http.StatusOK, []string{}) 
}

func getPlayers(c echo.Context) error {
	return c.JSON(http.StatusOK, []string{})
}

func saveProjectsHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "Проекты успешно сохранены в БД"})
}

func savePlayersHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "Игроки успешно сохранены в БД"})
}