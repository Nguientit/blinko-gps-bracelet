const fs = require("fs")
const path = require("path")

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  )

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  const databaseFilePath = path.join("/tmp", "database.json")

  try {
    if (req.method === "POST" && req.url.includes("/login")) {
      const { login, password } = req.body || {}

      if (!login || !password) {
        return res.status(400).json({ message: "Email/tên đăng nhập và mật khẩu là bắt buộc" })
      }

      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      const user = dbData.users.find((u) => u.email === login || u.fullName === login)

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Email/tên đăng nhập hoặc mật khẩu không chính xác" })
      }

      const { password: _, ...userInfo } = user
      return res.status(200).json({
        message: "Đăng nhập thành công",
        user: userInfo,
      })
    }

    if (req.method === "POST" && req.url.includes("/register")) {
      const { username, email, password } = req.body || {}

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Tên đăng nhập, email và mật khẩu là bắt buộc" })
      }

      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

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

      const { password: _, ...userInfo } = newUser
      return res.status(201).json({
        message: "Đăng ký thành công",
        user: userInfo,
      })
    }

    return res.status(405).json({ message: "Method Not Allowed" })
  } catch (err) {
    console.error("Auth error:", err)
    return res.status(500).json({ message: "Lỗi khi xử lý yêu cầu" })
  }
}
