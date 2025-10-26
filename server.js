require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

// Import routes
const { chatHandler } = require('./src/services/chat');
const orderRoutes = require("./src/routes/orderRoutes")
const productRoutes = require("./src/routes/productRoutes")
const userRoutes = require("./src/routes/userRoutes")
const authRoutes = require("./src/routes/authRoutes")
const profileRoutes = require("./src/routes/profileRoutes")
const feedbackRoutes = require("./src/routes/feedbackRoutes")

const app = express()
const PORT = process.env.PORT || 5000

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Cho phép request không có Origin (như Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "http://localhost",
      "http://127.0.0.1",
      "https://blinko.blog",
      "https://www.blinko.blog"
    ];


    // Loại bỏ dấu "/" ở cuối để tránh lệch
    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.warn("CORS blocked request from origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.post('/services/chat', chatHandler);
app.use("/api/orders", orderRoutes)
app.use("/api/products", productRoutes)
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/feedback", feedbackRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" })
})

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

module.exports = app;