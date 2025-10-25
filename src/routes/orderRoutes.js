const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const ordersFilePath = path.join(__dirname, "../data/order.json");

const readDB = async () => {
  try {
    const data = await fs.readFile(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { orders: [] }; // Trả về mảng rỗng nếu file không tồn tại
    }
    console.error("Lỗi đọc database (orders):", err);
    throw new Error("Không thể đọc dữ liệu đơn hàng.");
  }
};

// --- Hàm trợ giúp để GHI file (bất đồng bộ) ---
const writeDB = async (data) => {
  await fs.writeFile(ordersFilePath, JSON.stringify(data, null, 2));
};

// GET all orders, hỗ trợ lọc theo userId (query param)
router.get("/", async (req, res) => {
  try {
    const ordersData = await readDB();
    let orders = ordersData.orders || [];
    const { userId } = req.query;
    if (userId) {
      orders = orders.filter((o) => o.userId === userId);
    }
    res.json(orders);
  } catch (err) {
    console.error("Lỗi đọc đơn hàng:", err);
    res.status(500).json({ message: err.message || "Không thể đọc dữ liệu đơn hàng." });
  }
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const ordersData = await readDB();
    const order = ordersData.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng." });
  }
});

// POST create new order
router.post("/", async (req, res) => {
  try {
    const newOrder = req.body;
    const ordersData = await readDB();

    if (!ordersData.orders) {
        ordersData.orders = [];
    }

    // Đảm bảo có userId trong order
    if (!newOrder.userId) {
      return res.status(400).json({ message: "Thiếu userId trong đơn hàng." });
    }

    ordersData.orders.push(newOrder);
    await writeDB(ordersData);

    res.status(201).json({
      message: "Đơn hàng đã được tạo thành công!",
      order: newOrder,
    });
  } catch (err) {
    console.error("Lỗi tạo đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng." });
  }
});

// PUT update order status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const ordersData = await readDB();

    const orderIndex = ordersData.orders.findIndex((o) => o.id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    ordersData.orders[orderIndex].status = status;
    await writeDB(ordersData); // Ghi file (bất đồng bộ)

    res.json({
      message: "Cập nhật trạng thái thành công!",
      order: ordersData.orders[orderIndex],
    });
  } catch (err) {
    console.error("Lỗi cập nhật đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng." });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const ordersData = await readDB();

    const orderIndex = ordersData.orders.findIndex((o) => o.id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const deletedOrder = ordersData.orders.splice(orderIndex, 1);
    await writeDB(ordersData); // Ghi file (bất đồng bộ)

    res.json({
      message: "Xóa đơn hàng thành công!",
      order: deletedOrder[0],
    });
  } catch (err) {
    console.error("Lỗi xóa đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng." });
  }
});

module.exports = router;