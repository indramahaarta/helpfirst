package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/indramahaarta/helpfirst/db/sqlc"
)

type CreateReportRequest struct {
	Title   string  `json:"title" binding:"required"`
	Type    string  `json:"type" binding:"required"`
	Level   string  `json:"level" binding:"required"`
	Address string  `json:"address" binding:"required"`
	Lat     float64 `json:"lat" binding:"required"`
	Lng     float64 `json:"lng" binding:"required"`
}

type CreateReportResponse struct {
	Message string     `json:"message"`
	Report  db.Reports `json:"report"`
}

// @Summary Create a report
// @Description Create a new report with the provided details
// @Tags reports
// @Accept  json
// @Produce  json
// @Param   request  body      CreateReportRequest  true  "Report creation details"
// @Success 200 {object} CreateReportResponse "report creation successful"
// @Failure 400 {object} ErrorResponse "bad request"
// @Failure 500 {object} ErrorResponse "internal Server Error"
// @Security BearerAuth
// @Router /report [post]
func (server *Server) createReport(ctx *gin.Context) {
	payload, err := getUserPayload(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	var req CreateReportRequest
	if err = ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	report, err := server.store.CreateReport(ctx, db.CreateReportParams{
		Uid:     payload.Uid,
		Title:   req.Title,
		Type:    req.Type,
		Level:   req.Level,
		Address: req.Address,
		Lat:     req.Lat,
		Lng:     req.Lng,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, CreateReportResponse{
		Message: "report creation successful",
		Report:  report,
	})
}

type GetReportRequest struct {
	Lat float64 `form:"lat" binding:"required"`
	Lng float64 `form:"lng" binding:"required"`
}

type GetReportResponse struct {
	Message string       `json:"message"`
	Report  []db.Reports `json:"report"`
}

// @Summary Get reports
// @Description Get reports based on latitude and longitude within a certain range
// @Tags reports
// @Accept  json
// @Produce  json
// @Param   lat   query     float64  true  "Latitude"
// @Param   lng   query     float64  true  "Longitude"
// @Success 200 {object} GetReportResponse "successfully fetched reports"
// @Failure 400 {object} ErrorResponse "bad request"
// @Failure 500 {object} ErrorResponse "internal Server Error"
// @Router /report [get]
func (server *Server) getReport(ctx *gin.Context) {
	var req GetReportRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		fmt.Println(err)
		return
	}

	reports, err := server.store.GetReportBetweenLatAndLng(ctx, db.GetReportBetweenLatAndLngParams{
		Lat:   req.Lat - 1,
		Lat_2: req.Lat + 1,
		Lng:   req.Lng - 1,
		Lng_2: req.Lng + 1,
	})
	if err != nil {
		fmt.Println(err)
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, GetReportResponse{
		Message: "successfully fetched reports",
		Report:  reports,
	})
}
