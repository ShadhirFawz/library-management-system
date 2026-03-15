const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      version: "1.0.0"
    }
  },
  apis: ["./src/routes/*.js"]
};

const specs = swaggerJsdoc(options);

module.exports = specs;