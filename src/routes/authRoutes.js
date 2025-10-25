const express = require("express")
const fs = require("fs")
const path = require("path")

const router = express.Router()
const databaseFilePath = path.join(__dirname, "../data/database.json")

// POST login
router.post("/login", (req, res) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({ message: "Email/tên đăng nhập và mật khẩu là bắt buộc" })
    }

    const data = fs.readFileSync(databaseFilePath, "utf-8")
    const dbData = JSON.parse(data)

    // Tìm user theo email hoặc fullName
    const user = dbData.users.find((u) => u.email === login || u.fullName === login)

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Email/tên đăng nhập hoặc mật khẩu không chính xác" })
    }

    // Trả về user info (không trả password)
    const { password: _, ...userInfo } = user
    res.json({
      message: "Đăng nhập thành công",
      user: userInfo,
    })
  } catch (err) {
    console.error("[v0] Login error:", err)
    res.status(500).json({ message: "Lỗi khi đăng nhập" })
  }
})

// POST register
router.post("/register", (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tên đăng nhập, email và mật khẩu là bắt buộc" })
    }

    const data = fs.readFileSync(databaseFilePath, "utf-8")
    const dbData = JSON.parse(data)

    // Kiểm tra email đã tồn tại
    const existingUser = dbData.users.find((u) => u.email === email)
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký" })
    }

    const newUser = {
      id: "user-" + Date.now(),
      email: email,
      password: password,
      fullName: username,
      phone: "",
      role: "customer",
      address: {
        street: "",
        ward: "",
        district: "",
        city: "",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dbData.users.push(newUser)
    fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

    // Trả về user info (không trả password)
    const { password: _, ...userInfo } = newUser
    res.status(201).json({
      message: "Đăng ký thành công",
      user: userInfo,
    })
  } catch (err) {
    console.error("[v0] Register error:", err)
    res.status(500).json({ message: "Lỗi khi đăng ký" })
  }
})

module.exports = router
