const express = require("express")
const fs = require("fs").promises;
const path = require("path")
const router = express.Router()

const databaseFilePath = path.join(__dirname, "../data/database.json")

const readDB = async () => {
  try {
    const data = await fs.readFile(databaseFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return { users: [], products: [], orders: [] };
  }
};

router.get("/:userId", async (req, res) => {
  try {
    const database = await readDB();
    const user = database.users.find((u) => u.id === req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" })
    }

    // Return profile data (exclude password)
    const { password, ...profileData } = user
    res.json(profileData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Không thể lấy dữ liệu profile" })
  }
})

// PUT update profile
router.put("/:userId", async (req, res) => {
  try {
    const database = await readDB();
    const userIndex = database.users.findIndex(
      (u) => u.id === req.params.userId
    );

    if (userIndex === -1) {
      return res.status(404).json({ message: "Người dùng không tồn tại" })
    }

    const updatedAddress = {
      // Lấy địa chỉ cũ (nếu nó là object) hoặc tạo object rỗng
      ...(typeof currentUser.address === 'object' && currentUser.address !== null
        ? currentUser.address
        : {}),
      // Lấy địa chỉ mới (nếu nó là object) và ghi đè
      ...(typeof req.body.address === 'object' && req.body.address !== null
        ? req.body.address
        : {}),
    };

    // Update user profile
    const updatedUser = {
      ...database.users[userIndex],
      name: req.body.name || database.users[userIndex].name,
      phone: req.body.phone || database.users[userIndex].phone,
      address: updatedAddress
    }

    database.users[userIndex] = updatedUser

    // Write updated data back to file
    await writeDB(database);

    // Return updated profile (exclude password)
    const { password, ...profileData } = updatedUser
    res.json(profileData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Không thể cập nhật profile" })
  }
})

module.exports = router
