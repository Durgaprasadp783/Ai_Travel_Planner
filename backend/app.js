const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");

const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const aiRoutes = require("./routes/aiRoutes");
const mapsRoutes = require("./routes/mapsRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const smartRoutes = require("./routes/smartPromptRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const errorHandler = require("./middleware/errorMiddleware");

require("./db");

const app = express();

// 1. Middleware
app.use(cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true
}));
app.use(express.json());

// 2. Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "AI Travel Planner API",
            version: "1.0.0",
            description: "API Documentation for travel planning and AI generation",
        },
        servers: [{ url: "http://localhost:5000" }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: [path.join(__dirname, "routes", "*.js")],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.get("/", (req, res) => res.send("Travel Planner API is running..."));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 3. Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/ai", aiRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api", smartRoutes);
app.use("/api/flights", require("./routes/flightRoutes"));

// Error Handler
app.use(errorHandler);

// Health Check
app.get("/", (req, res) => res.send("Travel Planner API is running..."));

// 4. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});