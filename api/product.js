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
    const id = urlParts[urlParts.length - 1]

    if (method === "GET") {
      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      if (id && id !== "product") {
        const product = dbData.product_detail.find((p) => p.id === id)
        if (!product) {
          return res.status(404).json({ message: "Không tìm thấy sản phẩm." })
        }
        return res.status(200).json(product)
      }

      return res.status(200).json(dbData.product_detail || [])
    }

    if (method === "POST") {
      const newProduct = req.body
      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      dbData.product_detail.push(newProduct)
      dbData.products.push({
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        image: newProduct.image,
        description: newProduct.description,
        features: newProduct.features || [],
        stock: newProduct.stock,
      })

      fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

      return res.status(201).json({
        message: "Sản phẩm đã được tạo thành công!",
        product: newProduct,
      })
    }

    if (method === "PUT") {
      const updatedProduct = req.body
      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      const productIndex = dbData.product_detail.findIndex((p) => p.id === id)
      if (productIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." })
      }

      dbData.product_detail[productIndex] = updatedProduct

      const simpleIndex = dbData.products.findIndex((p) => p.id === id)
      if (simpleIndex !== -1) {
        dbData.products[simpleIndex] = {
          id: updatedProduct.id,
          name: updatedProduct.name,
          category: updatedProduct.category,
          price: updatedProduct.price,
          image: updatedProduct.image,
          description: updatedProduct.description,
          features: updatedProduct.features || [],
          stock: updatedProduct.stock,
        }
      }

      fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

      return res.status(200).json({
        message: "Cập nhật sản phẩm thành công!",
        product: updatedProduct,
      })
    }

    if (method === "DELETE") {
      if (!fs.existsSync(databaseFilePath)) {
        return res.status(500).json({ message: "Database không tồn tại" })
      }

      const data = fs.readFileSync(databaseFilePath, "utf-8")
      const dbData = JSON.parse(data)

      const productIndex = dbData.product_detail.findIndex((p) => p.id === id)
      if (productIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm." })
      }

      const deletedProduct = dbData.product_detail.splice(productIndex, 1)

      const simpleIndex = dbData.products.findIndex((p) => p.id === id)
      if (simpleIndex !== -1) {
        dbData.products.splice(simpleIndex, 1)
      }

      fs.writeFileSync(databaseFilePath, JSON.stringify(dbData, null, 2))

      return res.status(200).json({
        message: "Xóa sản phẩm thành công!",
        product: deletedProduct[0],
      })
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"])
    return res.status(405).json({ message: `Method ${method} not allowed` })
  } catch (err) {
    console.error("Product handler error:", err)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
