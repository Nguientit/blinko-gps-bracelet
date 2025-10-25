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

// Middleware
app.use(cors())
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

module.exports = app;