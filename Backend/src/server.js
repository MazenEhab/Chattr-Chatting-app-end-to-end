require("dotenv").config();
const path = require("path");

const app = require(path.join(__dirname, "app.js"));
const PORT = process.env.PORT;

const connectDB = require(path.join(__dirname, "database", "connection.database.js"));

const startServer = () => {
    try {
        connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }) 
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
}

startServer();