const mongoose = require("mongoose");
const dns = require("dns");

const connectDb = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment variables.");
        }

        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        process.exit(1);
    }
}

module.exports = connectDb