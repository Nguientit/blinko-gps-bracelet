const express = require("express");
const fs = require("fs").promises; // 1. Chuyển sang dùng 'promises'
const path = require("path");

const router = express.Router();
const databaseFilePath = path.join(__dirname, "../data/database.json");

// --- Hàm trợ giúp để ĐỌC file (bất đồng bộ) ---
const readDB = async () => {
  try {
    const data = await fs.readFile(databaseFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Lỗi đọc database:", err);
    // Trả về cấu trúc mặc định nếu file lỗi hoặc không tồn tại
    return { users: [], products: [], product_detail: [], orders: [] };
  }
};

// --- Hàm trợ giúp để GHI file (bất đồng bộ) ---
const writeDB = async (data) => {
  await fs.writeFile(databaseFilePath, JSON.stringify(data, null, 2));
};

// GET all products (SỬA LỖI LOGIC Ở ĐÂY)
router.get("/", async (req, res) => {
  try {
    const dbData = await readDB();
    
    // 2. Trả về cả hai mảng, đúng như ProductContext mong đợi
    res.json({
      products: dbData.products || [],
      product_detail: dbData.product_detail || [],
    });

  } catch (err) {
    console.error("Lỗi đọc sản phẩm:", err);
    res.status(500).json({ message: "Không thể đọc dữ liệu sản phẩm." });
  }
});

// GET product by ID (Dùng async)
router.get("/:id", async (req, res) => {
  try {
    const dbData = await readDB();
    const product = dbData.product_detail.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm." });
  }
});

// POST create new product (Dùng async)
router.post("/", async (req, res) => {
  try {
    // Nhận cả product và product_detail từ body
    const { product, product_detail } = req.body;
    const dbData = await readDB();

    if (!dbData.product_detail) dbData.product_detail = [];
    if (!dbData.products) dbData.products = [];

    dbData.product_detail.push(product_detail);
    dbData.products.push(product);

    await writeDB(dbData);

    res.status(201).json({
      message: "Sản phẩm đã được tạo thành công!",
      product: product,
      product_detail: product_detail,
    });
  } catch (err) {
    console.error("Lỗi tạo sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi tạo sản phẩm." });
  }
});

// PUT update product (Dùng async)
router.put("/:id", async (req, res) => {
  try {
    // Nhận cả product và product_detail từ body
    const { product, product_detail } = req.body;
    const dbData = await readDB();

    // Update product_detail
    const detailIndex = dbData.product_detail.findIndex(
      (p) => p.id === req.params.id
    );
    if (detailIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
    dbData.product_detail[detailIndex] = product_detail;

    // Update products
    const simpleIndex = dbData.products.findIndex(
      (p) => p.id === req.params.id
    );
    if (simpleIndex !== -1) {
      dbData.products[simpleIndex] = product;
    }

    await writeDB(dbData);

    res.json({
      message: "Cập nhật sản phẩm thành công!",
      product: product,
      product_detail: product_detail,
    });
  } catch (err) {
    console.error("Lỗi cập nhật sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm." });
  }
});

// DELETE product (Dùng async)
router.delete("/:id", async (req, res) => {
  try {
    const dbData = await readDB();

    // Xóa product_detail
    const detailIndex = dbData.product_detail.findIndex(
      (p) => p.id === req.params.id
    );
    if (detailIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
    const deletedDetail = dbData.product_detail.splice(detailIndex, 1);

    // Xóa products
    const simpleIndex = dbData.products.findIndex(
      (p) => p.id === req.params.id
    );
    let deletedProduct = null;
    if (simpleIndex !== -1) {
      deletedProduct = dbData.products.splice(simpleIndex, 1);
    }

    await writeDB(dbData);

    res.json({
      message: "Xóa sản phẩm thành công!",
      product: deletedProduct ? deletedProduct[0] : null,
      product_detail: deletedDetail[0],
    });
  } catch (err) {
    console.error("Lỗi xóa sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm." });
  }
});

module.exports = router;