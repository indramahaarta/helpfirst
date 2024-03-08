-- name: CreateReport :one
INSERT INTO "reports" (
        uid,
        title,
        type,
        level,
        address,
        status,
        lat,
        lng
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
-- name: GetReportById :one
SELECT *
FROM reports
WHERE id = $1
    AND uid = $2
LIMIT 1;
-- name: UpdateReportStatusById :one
UPDATE reports
SET status = $3
WHERE id = $1
    AND uid = $2
RETURNING *;
-- name: GetReportBetweenLatAndLng :many
SELECT r.*,
    u.name
FROM "reports" as r
    LEFT JOIN "users" AS u on r.uid = u.uid
WHERE r.lat BETWEEN $1 AND $2
    AND r.lng BETWEEN $3 AND $4
    AND status = 'opened';