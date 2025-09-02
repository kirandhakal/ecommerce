const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
require("dotenv").config();
const router = require("./routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:3000
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", router);

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Backend server is running");
});

// Port (use .env first, then fallback)
const PORT = process.env.PORT || 8080;

// Connect DB + start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("connected to db");
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
  });
