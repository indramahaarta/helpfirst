package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	db "github.com/indramahaarta/helpfirst/db/sqlc"
)

type ReportData struct {
	ID        uuid.UUID     `json:"id"`
	Uid       uuid.UUID     `json:"uid"`
	Title     string        `json:"title"`
	Type      string        `json:"type"`
	Level     string        `json:"level"`
	Address   string        `json:"address"`
	Lat       float64       `json:"lat"`
	Lng       float64       `json:"lng"`
	Status    string        `json:"status"`
	CreatedAt time.Time     `json:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt"`
	User      *UserResponse `json:"user"`
}

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
	Report  ReportData `json:"report"`
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

	user, err := server.store.GetUserById(ctx, payload.Uid)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
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
		Status:  "opened",
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, CreateReportResponse{
		Message: "report creation successful",
		Report: ReportData{
			ID:        report.ID,
			Uid:       report.Uid,
			Title:     report.Title,
			Type:      report.Type,
			Level:     report.Level,
			Address:   report.Address,
			Status:    report.Status,
			Lat:       report.Lat,
			Lng:       report.Lng,
			CreatedAt: report.CreatedAt,
			UpdatedAt: report.UpdatedAt,
			User:      ReturnUserResponse(&user),
		},
	})
}

type GetReportRequest struct {
	Lat float64 `form:"lat" binding:"required"`
	Lng float64 `form:"lng" binding:"required"`
}

type GetReportResponse struct {
	Message string       `json:"message"`
	Report  []ReportData `json:"report"`
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
		return
	}

	reports, err := server.store.GetReportBetweenLatAndLng(ctx, db.GetReportBetweenLatAndLngParams{
		Lat:   req.Lat - 0.5,
		Lat_2: req.Lat + 0.5,
		Lng:   req.Lng - 0.5,
		Lng_2: req.Lng + 0.5,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	var res []ReportData

	for _, report := range reports {
		user, err := server.store.GetUserById(ctx, report.Uid)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		res = append(res, ReportData{
			ID:        report.ID,
			Uid:       report.Uid,
			Title:     report.Title,
			Type:      report.Type,
			Level:     report.Level,
			Address:   report.Address,
			Status:    report.Status,
			Lat:       report.Lat,
			Lng:       report.Lng,
			CreatedAt: report.CreatedAt,
			UpdatedAt: report.UpdatedAt,
			User:      ReturnUserResponse(&user),
		})
	}

	ctx.JSON(http.StatusOK, GetReportResponse{
		Message: "successfully fetched reports",
		Report:  res,
	})
}

type UpdateReportStatusParam struct {
	Id string `uri:"id"`
}

type UpdateReportStatusRequest struct {
	Status string `json:"status"`
}

type UpdateReportStatusResponse struct {
	Message string     `json:"message"`
	Report  ReportData `json:"report"`
}

// UpdateReportStatus updates the status of a report
// @Summary Update report status
// @Description Update the status of a report by its ID
// @Tags reports
// @Accept json
// @Produce json
// @Param id path string true "Report ID"
// @Param request body UpdateReportStatusRequest true "Update report status information"
// @Success 200 {object} UpdateReportStatusResponse "Successfully updated report status"
// @Failure 400 {object} ErrorResponse "Bad Request: Invalid request parameters"
// @Failure 401 {object} ErrorResponse "Unauthorized: Invalid or missing token"
// @Failure 403 {object} ErrorResponse "Forbidden: User not allowed to update this report"
// @Failure 404 {object} ErrorResponse "Not Found: Report not found"
// @Failure 500 {object} ErrorResponse "Internal Server Error"
// @Router /report/{id}/status [patch]
func (server *Server) updateReportStatus(ctx *gin.Context) {
	payload, err := getUserPayload(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	user, err := server.store.GetUserById(ctx, payload.Uid)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	var param UpdateReportStatusParam
	if err := ctx.ShouldBindUri(&param); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var req UpdateReportStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	report, err := server.store.UpdateReportStatusById(ctx, db.UpdateReportStatusByIdParams{
		Uid:    payload.Uid,
		ID:     uuid.MustParse(param.Id),
		Status: req.Status,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, UpdateReportStatusResponse{
		Message: "successfully fetched reports",
		Report: ReportData{
			ID:        report.ID,
			Uid:       report.Uid,
			Title:     report.Title,
			Type:      report.Type,
			Level:     report.Level,
			Address:   report.Address,
			Status:    report.Status,
			Lat:       report.Lat,
			Lng:       report.Lng,
			CreatedAt: report.CreatedAt,
			UpdatedAt: report.UpdatedAt,
			User:      ReturnUserResponse(&user),
		},
	})
}
