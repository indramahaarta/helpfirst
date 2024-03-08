package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	db "github.com/indramahaarta/helpfirst/db/sqlc"
	"github.com/indramahaarta/helpfirst/util"
	"github.com/lib/pq"
	"golang.org/x/oauth2"
)

type UserResponse struct {
	ID                string    `json:"id"`
	Email             string    `json:"email"`
	Name              string    `json:"name"`
	Avatar            string    `json:"avatar"`
	Provider          string    `json:"provider"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	PasswordChangedAt time.Time `json:"passwordChangedAt"`
}

func ReturnUserResponse(user *db.Users) *UserResponse {
	return &UserResponse{
		ID:                user.Uid.String(),
		Avatar:            user.Avatar.String,
		Name:              user.Name.String,
		Email:             user.Email,
		Provider:          user.Provider,
		PasswordChangedAt: user.PasswordChangedAt,
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
	}
}

type registerUserRequest struct {
	Password string `json:"password" binding:"required,min=8,alphanum"`
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

type registerUserResponse struct {
	AccessToken string        `json:"accessToken"`
	Message     string        `json:"message"`
	User        *UserResponse `json:"user"`
}

// @Summary Register a new user
// @Description Register a new user with the provided details
// @Tags auth
// @Accept json
// @Produce json
// @Param request body registerUserRequest true "User registration details"
// @Success 200 {object} registerUserResponse "User registration successful"
// @Failure 400 {object} ErrorResponse "Bad Request: Invalid request format or validation failed"
// @Failure 403 {object} ErrorResponse "Forbidden: Email is already registered"
// @Failure 500 {object} ErrorResponse "Internal Server Error: Failed to create user or token generation failed"
// @Router /auth/signup [post]
func (server *Server) signup(ctx *gin.Context) {
	var req registerUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	hashedPassword, err := util.HashedPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("wrong password")))
	}

	arg := db.CreateUserParams{
		Email:    req.Email,
		Password: sql.NullString{String: hashedPassword, Valid: true},
		Name:     sql.NullString{String: req.Name, Valid: true},
		Provider: "credentials",
	}

	user, err := server.store.CreateUser(ctx, arg)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			switch pqErr.Code.Name() {
			case "unique_violation":
				ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("email is already registered")))
				return
			}
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	accessToken, err := server.tokenMaker.CreateToken(user.Uid, server.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	response := &registerUserResponse{
		User:        ReturnUserResponse(&user),
		AccessToken: accessToken,
		Message:     "registration success",
	}
	ctx.JSON(http.StatusOK, response)
}

type loginUserRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,alphanum,min=8"`
}

type loginUserResponse struct {
	AccessToken string       `json:"accessToken"`
	Message     string       `json:"message"`
	User        UserResponse `json:"user"`
}

// @Summary Login user
// @Description Login user with the provided credentials
// @Tags auth
// @Accept json
// @Produce json
// @Param request body loginUserRequest true "User login details"
// @Success 200 {object} loginUserResponse "User login successful"
// @Failure 400 {object} ErrorResponse "Bad Request: Wrong password format or validation failed"
// @Failure 404 {object} ErrorResponse "Not Found: User with email not found"
// @Failure 502 {object} ErrorResponse "Bad Gateway: Please login using associated provider"
// @Failure 500 {object} ErrorResponse "Internal Server Error: Unexpected error during the login process"
// @Router /auth/signin [post]
func (server *Server) signin(ctx *gin.Context) {
	var req loginUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	user, err := server.store.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("user with email %s is not found", user.Email)))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if user.Provider != "credentials" {
		ctx.JSON(http.StatusBadGateway, errorResponse(fmt.Errorf("please login using %s", user.Provider)))
		return
	}

	err = util.CheckPassword(req.Password, user.Password.String)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("wrong password")))
		return
	}

	accessToken, err := server.tokenMaker.CreateToken(user.Uid, server.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	loginUserData := &loginUserResponse{
		AccessToken: accessToken,
		User:        *ReturnUserResponse(&user),
		Message:     "login success",
	}

	ctx.JSON(http.StatusOK, loginUserData)
}

type googleRequest struct {
	Token string `json:"token" binding:"required"`
}

type googleUserInfo struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

type googleResponse struct {
	AccessToken string       `json:"accessToken"`
	Message     string       `json:"message"`
	User        UserResponse `json:"user"`
}

// @Summary Google Auth
// @Description Authenticate user with Google OAuth token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body googleRequest true "Google OAuth token"
// @Success 200 {object} googleResponse "User info from Google"
// @Failure 400 {object} ErrorResponse "Bad Request: Invalid token format or validation failed"
// @Failure 502 {object} ErrorResponse "Bad Gateway: Please login using associated provider if user already exists"
// @Failure 500 {object} ErrorResponse "Internal Server Error: Error during the Google auth process, user creation, or update"
// @Router /auth/google [post]
func (server *Server) google(ctx *gin.Context) {
	var req googleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	tokenSource := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: req.Token})
	httpClient := oauth2.NewClient(ctx, tokenSource)
	resp, err := httpClient.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("failed to read response body: %v", err)))
	}

	var userInfo googleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("failed to unmarshal user info: %v", err)))
		return
	}

	if len(userInfo.Email) == 0 {
		ctx.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("token is not valid")))
		return
	}

	var newUser = false
	user, err := server.store.GetUserByEmail(ctx, userInfo.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			newUser = true
			user, err = server.store.CreateUser(ctx, db.CreateUserParams{
				Email:    userInfo.Email,
				Name:     sql.NullString{Valid: true, String: userInfo.Name},
				Avatar:   sql.NullString{Valid: true, String: userInfo.Picture},
				Provider: "google",
			})
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, errorResponse(err))
				return
			}
		} else {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	if newUser {
		user, err = server.store.UpdateUser(ctx, db.UpdateUserParams{Name: sql.NullString{String: userInfo.Name, Valid: true}, Avatar: sql.NullString{String: userInfo.Picture, Valid: true}, Email: userInfo.Email, Uid: user.Uid})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	if user.Provider != "google" {
		ctx.JSON(http.StatusBadGateway, errorResponse(fmt.Errorf("please login using %s", user.Provider)))
		return
	}

	accessToken, err := server.tokenMaker.CreateToken(user.Uid, server.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := googleResponse{
		AccessToken: accessToken,
		Message:     "user information retrieved successfully",
		User: UserResponse{
			ID:     user.Uid.String(),
			Email:  userInfo.Email,
			Name:   userInfo.Name,
			Avatar: userInfo.Picture,
		},
	}
	ctx.JSON(http.StatusOK, response)
}
