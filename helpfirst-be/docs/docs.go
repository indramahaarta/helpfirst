// Package docs Code generated by swaggo/swag. DO NOT EDIT
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "contact": {},
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/auth/google": {
            "post": {
                "description": "Authenticate user with Google OAuth token",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "auth"
                ],
                "summary": "Google Auth",
                "parameters": [
                    {
                        "description": "Google OAuth token",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.googleRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User info from Google",
                        "schema": {
                            "$ref": "#/definitions/api.googleResponse"
                        }
                    },
                    "400": {
                        "description": "Bad Request: Invalid token format or validation failed",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: Error during the Google auth process, user creation, or update",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "502": {
                        "description": "Bad Gateway: Please login using associated provider if user already exists",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    }
                }
            }
        },
        "/auth/signin": {
            "post": {
                "description": "Login user with the provided credentials",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "auth"
                ],
                "summary": "Login user",
                "parameters": [
                    {
                        "description": "User login details",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.loginUserRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User login successful",
                        "schema": {
                            "$ref": "#/definitions/api.loginUserResponse"
                        }
                    },
                    "400": {
                        "description": "Bad Request: Wrong password format or validation failed",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "404": {
                        "description": "Not Found: User with email not found",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: Unexpected error during the login process",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "502": {
                        "description": "Bad Gateway: Please login using associated provider",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    }
                }
            }
        },
        "/auth/signup": {
            "post": {
                "description": "Register a new user with the provided details",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "auth"
                ],
                "summary": "Register a new user",
                "parameters": [
                    {
                        "description": "User registration details",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.registerUserRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User registration successful",
                        "schema": {
                            "$ref": "#/definitions/api.registerUserResponse"
                        }
                    },
                    "400": {
                        "description": "Bad Request: Invalid request format or validation failed",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "403": {
                        "description": "Forbidden: Email is already registered",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error: Failed to create user or token generation failed",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    }
                }
            }
        },
        "/report": {
            "get": {
                "description": "Get reports based on latitude and longitude within a certain range",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "reports"
                ],
                "summary": "Get reports",
                "parameters": [
                    {
                        "type": "number",
                        "description": "Latitude",
                        "name": "lat",
                        "in": "query",
                        "required": true
                    },
                    {
                        "type": "number",
                        "description": "Longitude",
                        "name": "lng",
                        "in": "query",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "successfully fetched reports",
                        "schema": {
                            "$ref": "#/definitions/api.GetReportResponse"
                        }
                    },
                    "400": {
                        "description": "bad request",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "500": {
                        "description": "internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    }
                }
            },
            "post": {
                "security": [
                    {
                        "BearerAuth": []
                    }
                ],
                "description": "Create a new report with the provided details",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "reports"
                ],
                "summary": "Create a report",
                "parameters": [
                    {
                        "description": "Report creation details",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.CreateReportRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "report creation successful",
                        "schema": {
                            "$ref": "#/definitions/api.CreateReportResponse"
                        }
                    },
                    "400": {
                        "description": "bad request",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    },
                    "500": {
                        "description": "internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/api.ErrorResponse"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "api.CreateReportRequest": {
            "type": "object",
            "required": [
                "address",
                "lat",
                "level",
                "lng",
                "title",
                "type"
            ],
            "properties": {
                "address": {
                    "type": "string"
                },
                "lat": {
                    "type": "number"
                },
                "level": {
                    "type": "string"
                },
                "lng": {
                    "type": "number"
                },
                "title": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                }
            }
        },
        "api.CreateReportResponse": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string"
                },
                "report": {
                    "$ref": "#/definitions/db.Reports"
                }
            }
        },
        "api.ErrorResponse": {
            "type": "object",
            "properties": {
                "error": {
                    "type": "string"
                }
            }
        },
        "api.GetReportResponse": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string"
                },
                "report": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/db.Reports"
                    }
                }
            }
        },
        "api.UserResponse": {
            "type": "object",
            "properties": {
                "avatar": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "passwordChangedAt": {
                    "type": "string"
                },
                "provider": {
                    "type": "string"
                },
                "updatedAt": {
                    "type": "string"
                }
            }
        },
        "api.googleRequest": {
            "type": "object",
            "required": [
                "token"
            ],
            "properties": {
                "token": {
                    "type": "string"
                }
            }
        },
        "api.googleResponse": {
            "type": "object",
            "properties": {
                "accessToken": {
                    "type": "string"
                },
                "message": {
                    "type": "string"
                },
                "user": {
                    "$ref": "#/definitions/api.UserResponse"
                }
            }
        },
        "api.loginUserRequest": {
            "type": "object",
            "required": [
                "email",
                "password"
            ],
            "properties": {
                "email": {
                    "type": "string"
                },
                "password": {
                    "type": "string",
                    "minLength": 8
                }
            }
        },
        "api.loginUserResponse": {
            "type": "object",
            "properties": {
                "accessToken": {
                    "type": "string"
                },
                "message": {
                    "type": "string"
                },
                "user": {
                    "$ref": "#/definitions/api.UserResponse"
                }
            }
        },
        "api.registerUserRequest": {
            "type": "object",
            "required": [
                "email",
                "name",
                "password"
            ],
            "properties": {
                "email": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "password": {
                    "type": "string",
                    "minLength": 8
                }
            }
        },
        "api.registerUserResponse": {
            "type": "object",
            "properties": {
                "accessToken": {
                    "type": "string"
                },
                "message": {
                    "type": "string"
                },
                "user": {
                    "$ref": "#/definitions/api.UserResponse"
                }
            }
        },
        "db.Reports": {
            "type": "object",
            "properties": {
                "address": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                },
                "id": {
                    "type": "string"
                },
                "lat": {
                    "type": "number"
                },
                "level": {
                    "type": "string"
                },
                "lng": {
                    "type": "number"
                },
                "title": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                },
                "uid": {
                    "type": "string"
                },
                "updatedAt": {
                    "type": "string"
                }
            }
        }
    },
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        }
    }
}`

// SwaggerInfo holds exported Swagger Info so clients can modify it
var SwaggerInfo = &swag.Spec{
	Version:          "1.0",
	Host:             "localhost:8080",
	BasePath:         "/api",
	Schemes:          []string{},
	Title:            "Segment3d App API Documentation",
	Description:      "This is a documentation for Segment3d App API",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
