const express = require("express")
const fs = require("fs")
const path = require("path")

const router = express.Router()
const databaseFilePath = path.join(__dirname, "../data/database.json")

// GET all users
router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(databaseFilePath, "utf-8")
    const dbData = JSON.parse(data)
    res.json(dbData.users || [])
  } catch (err) {
    console.error("Lỗi đọc người dùng:", err)
    res.status(500).json({ message: "Không thể đọc dữ liệu người dùng." })
  }
})

// GET user by ID
router.get("/:id", (req, res) => {
  try {
    const data = fs.readFileSync(databaseFilePath, "utf-8")
    const dbData = JSON.parse(data)
    const user = dbData.users.find((u) => u.id === req.params.id)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." })
    }
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Lỗi khi lấy người dùng." })
  }
})

// PUT update user (block/unblock, promote/demote)
router.put("/:id", (req, res) => {
  try {
    const { blocked, role } = req.body
    const data = fs.readFileSync(databaseFilePath, "utf-8")
    const dbData = JSON.parse(data)

    const userIndex = dbData.users.findIndex((u) => u.id === req.params.id)
    if (userIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." })
    }

    if (blocked !== undefined) {
      dbData.users[userIndex].blocked = blocked
    }
    if (role !== undefined) {
      dbData.users[userIndex].role = role
    }

    fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

    res.json({
      message: "Cập nhật người dùng thành công!",
      user: dbData.users[userIndex],
    })
  } catch (err) {
    console.error("Lỗi cập nhật người dùng:", err)
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng." })
  }
})

// DELETE user
router.delete("/:id", (req, res) => {
  try {
    const data = fs.readFileSync(databaseFilePath, "utf-8")
    const dbData = JSON.parse(data)

    const userIndex = dbData.users.findIndex((u) => u.id === req.params.id)
    if (userIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." })
    }

    const deletedUser = dbData.users.splice(userIndex, 1)
    fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

    res.json({
      message: "Xóa người dùng thành công!",
      user: deletedUser[0],
    })
  } catch (err) {
    console.error("Lỗi xóa người dùng:", err)
    res.status(500).json({ message: "Lỗi khi xóa người dùng." })
  }
})

module.exports = router