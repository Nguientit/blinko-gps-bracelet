const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const databaseFilePath = path.join(__dirname, "../data/database.json");

// Helper to read DB
const readDB = async () => {
    try {
        const data = await fs.readFile(databaseFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return { feedback: [] };
    }
};

// Helper to write DB
const writeDB = async (data) => {
    await fs.writeFile(databaseFilePath, JSON.stringify(data, null, 2));
};

// GET all feedback
router.get("/", async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.feedback || []);
    } catch (err) {
        res.status(500).json({ message: "Không thể lấy feedback." });
    }
});

// POST add feedback (mỗi email chỉ 1 feedback)
router.post("/", async (req, res) => {
    try {
        const { userName, userEmail, rating, comment } = req.body;
        if (!userName || !userEmail || !rating || !comment) {
            return res.status(400).json({ message: "Thiếu thông tin đánh giá." });
        }
        const db = await readDB();
        const exists = (db.feedback || []).find(
            (f) => f.userEmail === userEmail
        );
        if (exists) {
            return res.status(400).json({ message: "Bạn đã gửi đánh giá rồi." });
        }
        const newFeedback = {
            id: Date.now(),
            userName,
            userEmail,
            rating,
            comment,
            date: new Date().toISOString().slice(0, 10),
        };
        db.feedback = db.feedback || [];
        db.feedback.push(newFeedback);
        await writeDB(db);
        res.status(201).json({ message: "Đã gửi đánh giá!", feedback: newFeedback });
    } catch (err) {
        res.status(500).json({ message: "Không thể gửi feedback." });
    }
});

// PUT update feedback (theo id, chỉ cho phép nếu đúng email)
router.put("/:id", async (req, res) => {
    try {
        const { userEmail, rating, comment } = req.body;
        const db = await readDB();
        const idx = (db.feedback || []).findIndex(
            (f) => String(f.id) === req.params.id
        );
        if (idx === -1) {
            return res.status(404).json({ message: "Không tìm thấy feedback." });
        }
        if (db.feedback[idx].userEmail !== userEmail) {
            return res.status(403).json({ message: "Không có quyền sửa feedback này." });
        }
        db.feedback[idx].rating = rating;
        db.feedback[idx].comment = comment;
        db.feedback[idx].date = new Date().toISOString().slice(0, 10);
        await writeDB(db);
        res.json({ message: "Đã cập nhật feedback.", feedback: db.feedback[idx] });
    } catch (err) {
        res.status(500).json({ message: "Không thể cập nhật feedback." });
    }
});

// DELETE feedback (theo id, chỉ cho phép nếu đúng email)
router.delete("/:id", async (req, res) => {
    try {
        const { userEmail } = req.body;
        const db = await readDB();
        const idx = (db.feedback || []).findIndex(
            (f) => String(f.id) === req.params.id
        );
        if (idx === -1) {
            return res.status(404).json({ message: "Không tìm thấy feedback." });
        }
        if (db.feedback[idx].userEmail !== userEmail) {
            return res.status(403).json({ message: "Không có quyền xóa feedback này." });
        }
        const deleted = db.feedback.splice(idx, 1);
        await writeDB(db);
        res.json({ message: "Đã xóa feedback.", feedback: deleted[0] });
    } catch (err) {
        res.status(500).json({ message: "Không thể xóa feedback." });
    }
});

router.get("/check/:email", async (req, res) => {
    try {
        const { email } = req.params
        const db = await readDB(); // Dùng helper
        const feedbacks = db.feedback || []

        const userFeedback = feedbacks.find((f) => f.userEmail === email)
        res.json({ hasFeedback: !!userFeedback })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Không thể kiểm tra đánh giá." })
    }
})

module.exports = router;
