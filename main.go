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

var jwtSecret = []byte("7d8a2f4c9b1e3f5a6c0d8e7b4a2f1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b_SMLT_SECURE_2026")


const CorrectHostPasswordHash = "78cd2252a1bd7e411ea2fe4cd14157cb6d73507d6"

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