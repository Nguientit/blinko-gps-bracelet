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
      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      if (!userId || userId === "user") {
        return res.status(200).json(dbData.users || [])
      }

      const user = dbData.users.find((u) => u.id === userId)
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." })
      }

      res.status(200).json(user)
    }

    if (method === "PUT") {
      if (!userId || userId === "user") {
        return res.status(400).json({ message: "Thiếu userId trong URL." })
      }

      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const { blocked, role } = req.body
      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      const userIndex = dbData.users.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." })
      }

      if (blocked !== undefined) dbData.users[userIndex].blocked = blocked
      if (role !== undefined) dbData.users[userIndex].role = role

      fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

      return res.status(200).json({
        message: "Cập nhật người dùng thành công!",
        user: dbData.users[userIndex],
      })
    }

    if (method === "DELETE") {
      if (!userId || userId === "user") {
        return res.status(400).json({ message: "Thiếu userId trong URL." })
      }

      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      const userIndex = dbData.users.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." })
      }

      const deletedUser = dbData.users.splice(userIndex, 1)
      fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

      return res.status(200).json({
        message: "Xóa người dùng thành công!",
        user: deletedUser[0],
      })
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    return res.status(405).json({ message: `Method ${method} not allowed` })
  } catch (err) {
    console.error("User handler error:", err)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
