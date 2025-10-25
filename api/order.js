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

  const ordersFilePath = path.join("/tmp", "order.json")

  try {
    const { method } = req
    const urlParts = req.url.split("/").filter(Boolean)
    const id = urlParts[urlParts.length - 1]

    if (method === "GET") {
      if (!fs.existsSync(ordersFilePath)) {
        return res.status(500).json({ message: "Orders database không tồn tại" })
      }

      const data = fs.readFileSync(ordersFilePath, "utf-8")
      const ordersData = JSON.parse(data)

      if (id && id !== "order") {
        const order = ordersData.orders.find((o) => o.id === id)
        if (!order) {
          return res.status(404).json({ message: "Không tìm thấy đơn hàng." })
        }
        return res.status(200).json(order)
      }

      return res.status(200).json(ordersData.orders || [])
    }

    if (method === "POST") {
      const newOrder = req.body
      if (!fs.existsSync(ordersFilePath)) {
        return res.status(500).json({ message: "Orders database không tồn tại" })
      }

      const data = fs.readFileSync(ordersFilePath, "utf-8")
      const ordersData = JSON.parse(data)

      ordersData.orders.push(newOrder)
      fs.writeFileSync(ordersFilePath, JSON.stringify(ordersData, null, 2))

      return res.status(201).json({
        message: "Đơn hàng đã được tạo thành công!",
        order: newOrder,
      })
    }

    if (method === "PUT") {
      if (!fs.existsSync(ordersFilePath)) {
        return res.status(500).json({ message: "Orders database không tồn tại" })
      }

      const data = fs.readFileSync(ordersFilePath, "utf-8")
      const ordersData = JSON.parse(data)
      const { status } = req.body

      const orderIndex = ordersData.orders.findIndex((o) => o.id === id)
      if (orderIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng." })
      }

      ordersData.orders[orderIndex].status = status
      fs.writeFileSync(ordersFilePath, JSON.stringify(ordersData, null, 2))

      return res.status(200).json({
        message: "Cập nhật trạng thái thành công!",
        order: ordersData.orders[orderIndex],
      })
    }

    if (method === "DELETE") {
      if (!fs.existsSync(ordersFilePath)) {
        return res.status(500).json({ message: "Orders database không tồn tại" })
      }

      const data = fs.readFileSync(ordersFilePath, "utf-8")
      const ordersData = JSON.parse(data)

      const orderIndex = ordersData.orders.findIndex((o) => o.id === id)
      if (orderIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng." })
      }

      const deletedOrder = ordersData.orders.splice(orderIndex, 1)
      fs.writeFileSync(ordersFilePath, JSON.stringify(ordersData, null, 2))

      return res.status(200).json({
        message: "Xóa đơn hàng thành công!",
        order: deletedOrder[0],
      })
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
    return res.status(405).json({ message: `Method ${method} not allowed` })
  } catch (err) {
    console.error("Order handler error:", err)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
