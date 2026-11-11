const express = require('express');
const cors = require("cors");
const path = require("path");

const app = express()

// Routes
const authRoutes = require(path.join(__dirname, "modules", "auth", "auth.route.js"));

const errorHandler = require(path.join(__dirname, "middleware", "error.middleware.js"));

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status.json({message: "Api is healthy"});
})

app.use("/api/auth", authRoutes);

app.use(errorHandler);

module.exports = app;