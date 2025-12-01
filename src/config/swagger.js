// src/config/swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Car Rental API Documentation",
      version: "1.0.0",
      description: "Official API documentation for the Car Rental System",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    tags: [
      { name: "Users", description: "User authentication & account operations" },
      { name: "Cars", description: "Car listing, filtering & availability" },
      { name: "Common", description: "Shared metadata used for filtering" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        BaseResponse: {
          type: "object",
          properties: {
            EC: { type: "integer", example: 0 },
            EM: { type: "string", example: "Success" },
            DT: { type: "object" },
          },
        },
      },

      responses: {
        UnauthorizedError: {
          description: "Invalid or missing authentication token",
          content: {
            "application/json": {
              example: { EC: 1, EM: "Unauthorized" },
            },
          },
        },
        ServerError: {
          description: "Unexpected server error",
          content: {
            "application/json": {
              example: { EC: -1, EM: "Internal server error", DT: null },
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = { swaggerUi, swaggerSpec };
