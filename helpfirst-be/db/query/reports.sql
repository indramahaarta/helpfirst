-- name: CreateReport :one
INSERT INTO "reports" (
        uid,
        title,
        type,
        level,
        address,
        lat,
        lng
    )
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
-- name: GetReportBetweenLatAndLng :many
SELECT *
FROM "reports"
WHERE lat BETWEEN $1 AND $2
    AND lng BETWEEN $3 AND $4;