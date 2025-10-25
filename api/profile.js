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
    const { method } = req
    const urlParts = req.url.split("/").filter(Boolean)
    const userId = urlParts[urlParts.length - 1]

    if (method === "GET") {
      if (!userId || userId === "profile") {
        return res.status(400).json({ message: "Thiếu userId" })
      }

      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const database = JSON.parse(data)
      const user = database.users.find((u) => u.id === userId)

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" })
      }

      const { password, ...profileData } = user
      res.status(200).json(profileData)
    }

    if (method === "PUT") {
      if (!userId || userId === "profile") {
        return res.status(400).json({ message: "Thiếu userId" })
      }

      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const database = JSON.parse(data)
      const userIndex = database.users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        return res.status(404).json({ message: "Người dùng không tồn tại" })
      }

      const currentUser = database.users[userIndex]
      const updatedUser = {
        ...currentUser,
        fullName: req.body.fullName || currentUser.fullName,
        phone: req.body.phone || currentUser.phone,
        address: req.body.address || currentUser.address,
      }

      database.users[userIndex] = updatedUser
      fs.writeFileSync(databaseFilePath, JSON.stringify(database, null, 2))

      const { password, ...profileData } = updatedUser
      res.status(200).json(profileData)
    }

    res.setHeader("Allow", ["GET", "PUT"])
    return res.status(405).json({ message: `Method ${method} not allowed` })
  } catch (err) {
    console.error("Profile handler error:", err)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
