const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express()

// Routes
const authRoutes = require("./modules/auth/auth.route.js");
const otpRoutes = require("./modules/otp/otp.route.js");

const errorHandler = require("./middleware/error.middleware.js");

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
    res.status.json({message: "Api is healthy"});
})

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

app.use(errorHandler);

module.exports = app;
