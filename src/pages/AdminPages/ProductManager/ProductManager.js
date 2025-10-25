"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, X} from "lucide-react"
import "./ProductManager.css"

export default function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [error, setError] = useState(null)
  const [editSimple, setEditSimple] = useState({ id: "", name: "", category: "", price: 0, stock: 0 })
  const [editDetail, setEditDetail] = useState({ features: [], variants: [] })
  const [addSimple, setAddSimple] = useState({ id: "", name: "", category: "", price: 0, stock: 0 })
  const [addDetail, setAddDetail] = useState({ features: [], variants: [] })

  const emptyProduct = {
    id: "",
    name: "",
    category: "",
    price: 0,
    image: "",
    description: "",
    features: [],
    stock: 0,
    variants: [],
  }
  const [newProduct, setNewProduct] = useState(emptyProduct)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products`)
      if (!response.ok) throw new Error("Lỗi tải sản phẩm")
      const data = await response.json()
      setProducts(data.product_detail || [])
      setError(null)
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return
    try {
      // Xóa cả product và product_detail qua API
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Lỗi xóa sản phẩm")
      await fetchProducts()
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    }
  }

  const saveEdit = async () => {
    if (!editProduct.name || !editProduct.id) {
      alert("Tên và ID không thể để trống.")
      return
    }
    try {
      // Gửi cả thông tin đơn giản và chi tiết lên API
      const simpleProduct = {
        id: editProduct.id,
        name: editProduct.name,
        category: editProduct.category,
        price: editProduct.price,
        image: editProduct.image,
        description: editProduct.description,
        features: editProduct.features || [],
        stock: editProduct.stock,
      }
      const response = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: simpleProduct,
          product_detail: editProduct,
        }),
      })
      if (!response.ok) throw new Error("Lỗi cập nhật sản phẩm")
      await fetchProducts()
      setEditProduct(null)
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    }
  }

  const addNewProduct = async () => {
    if (!newProduct.name || !newProduct.id) {
      alert("Vui lòng nhập ID và Tên sản phẩm")
      return
    }
    if (products.some((p) => p.id === newProduct.id)) {
      alert("ID đã tồn tại, chọn ID khác.")
      return
    }
    try {
      // Gửi cả thông tin đơn giản và chi tiết lên API
      const simpleProduct = {
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        image: newProduct.image,
        description: newProduct.description,
        features: newProduct.features || [],
        stock: newProduct.stock,
      }
      const response = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: simpleProduct,
          product_detail: newProduct,
        }),
      })
      if (!response.ok) throw new Error("Lỗi tạo sản phẩm")
      await fetchProducts()
      setNewProduct(emptyProduct)
      setShowAdd(false)
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    }
  }

  const addVariantToEdit = () => {
    setEditProduct({
      ...editProduct,
      variants: [...(editProduct.variants || []), { name: "", image: "", price: 0, stock: 0 }],
    })
  }

  const removeVariantFromEdit = (idx) => {
    const variants = [...editProduct.variants]
    variants.splice(idx, 1)
    setEditProduct({ ...editProduct, variants })
  }

  if (loading)
    return (
      <div className="pmx-root">
        <div className="pmx-loading">Đang tải sản phẩm...</div>
      </div>
    )
  if (error)
    return (
      <div className="pmx-root">
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      </div>
    )

  return (
    <div className="pmx-root">
      <header className="pmx-header">
        <div>
          <h1>Admin — Quản lý Sản phẩm</h1>
          <p className="pmx-sub">Quản lý sản phẩm — xem / thêm / sửa / xóa / mẫu mã</p>
        </div>
        <div className="pmx-actions">
          <button className="pmx-btn pmx-primary" onClick={() => setShowAdd(true)}>
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        </div>
      </header>

      <section className="pmx-grid">
        {products.map((p) => (
          <article
            key={p.id}
            className="pmx-card"
            onClick={() => {
              setViewProduct(p)
              setSelectedVariant(null)
            }}
          >
            <div className="pmx-card-media">
              <img src={p.image || "/placeholder.jpg"} alt={p.name} />
            </div>
            <div className="pmx-card-body">
              <div className="pmx-card-top">
                <h3>{p.name}</h3>
                <span className="pmx-badge">{p.category}</span>
              </div>
              <p className="pmx-desc">{p.description}</p>
              <div className="pmx-meta">
                <div className="pmx-price">{(p.price || 0).toLocaleString()}₫</div>
                <div className="pmx-stock">Kho: {p.stock ?? 0}</div>
              </div>
              <div className="pmx-card-footer">
                <button
                  className="pmx-btn pmx-small pmx-edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditProduct(JSON.parse(JSON.stringify(p)))
                  }}
                >
                  <Edit2 size={14} />
                  Sửa
                </button>
                <button
                  className="pmx-btn pmx-small pmx-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(p.id)
                  }}
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ... existing modals ... */}
      {viewProduct && (
        <div
          className="pmx-modal"
          onClick={() => {
            setViewProduct(null)
            setSelectedVariant(null)
          }}
        >
          <div className="pmx-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="pmx-modal-close"
              onClick={() => {
                setViewProduct(null)
                setSelectedVariant(null)
              }}
            >
              <X size={20} />
            </button>
            <div className="pmx-modal-left">
              <img
                src={(selectedVariant && selectedVariant.image) || viewProduct.image || "/placeholder.jpg"}
                alt={selectedVariant?.name || viewProduct.name}
                className="pmx-main-preview"
              />
            </div>
            <div className="pmx-modal-right">
              <h2>{viewProduct.name}</h2>
              <div className="pmx-modal-meta">
                <div className="pmx-price pmx-big">{(viewProduct.price || 0).toLocaleString()}₫</div>
              </div>
              <p className="pmx-modal-desc">{viewProduct.description}</p>
              <div className="pmx-modal-actions">
                <button
                  className="pmx-btn"
                  onClick={() => {
                    setViewProduct(null)
                    setSelectedVariant(null)
                  }}
                >
                  Đóng
                </button>
                <button
                  className="pmx-btn pmx-primary"
                  onClick={() => {
                    setViewProduct(null)
                    setEditProduct(JSON.parse(JSON.stringify(viewProduct)))
                    setSelectedVariant(null)
                  }}
                >
                  <Edit2 size={16} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editProduct && (
        <div
          className="pmx-modal"
          onClick={() => {
            setEditProduct(null)
            setEditSimple(null)
            setEditDetail(null)
          }}
        >
          <div className="pmx-modal-card pmx-edit" onClick={(e) => e.stopPropagation()}>
            <div className="pmx-edit-header">
              <h3>Chỉnh sửa sản phẩm</h3>
              <button
                className="pmx-modal-close"
                onClick={() => {
                  setEditProduct(null)
                  setEditSimple(null)
                  setEditDetail(null)
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="pmx-form-container">
              {/* Basic Product Info */}
              <div className="pmx-form-section">
                <h4>Thông tin cơ bản</h4>
                <div className="pmx-form-grid">
                  <div className="pmx-form-row">
                    <label>ID Sản phẩm *</label>
                    <input
                      value={editSimple?.id || ""}
                      onChange={(e) => setEditSimple({ ...editSimple, id: e.target.value })}
                      placeholder="Ví dụ: SP001"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Tên sản phẩm *</label>
                    <input
                      value={editSimple?.name || ""}
                      onChange={(e) => setEditSimple({ ...editSimple, name: e.target.value })}
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Danh mục</label>
                    <input
                      value={editSimple?.category || ""}
                      onChange={(e) => setEditSimple({ ...editSimple, category: e.target.value })}
                      placeholder="Ví dụ: Đồng hồ, Vòng tay"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Giá gốc (₫)</label>
                    <input
                      type="number"
                      value={editSimple?.price || 0}
                      onChange={(e) => setEditSimple({ ...editSimple, price: +e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Tồn kho</label>
                    <input
                      type="number"
                      value={editSimple?.stock || 0}
                      onChange={(e) => setEditSimple({ ...editSimple, stock: +e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Media & Description */}
              <div className="pmx-form-section">
                <h4>Nội dung & Hình ảnh</h4>
                <div className="pmx-form-grid pmx-full">
                  <div className="pmx-form-row">
                    <label>Ảnh chính (URL)</label>
                    <input
                      value={editSimple?.image || ""}
                      onChange={(e) => setEditSimple({ ...editSimple, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Mô tả sản phẩm</label>
                    <textarea
                      value={editSimple?.description || ""}
                      onChange={(e) => setEditSimple({ ...editSimple, description: e.target.value })}
                      placeholder="Nhập mô tả chi tiết về sản phẩm"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pmx-form-section">
                <h4>Tính năng nổi bật</h4>
                <div className="pmx-form-grid pmx-full">
                  <div className="pmx-form-row">
                    <label>Danh sách tính năng (mỗi dòng 1 tính năng)</label>
                    <textarea
                      value={editDetail?.features?.join("\n") || ""}
                      onChange={(e) =>
                        setEditDetail({ ...editDetail, features: e.target.value.split("\n").filter((f) => f.trim()) })
                      }
                      placeholder="Ví dụ:&#10;- Chống nước IP68&#10;- Pin 7 ngày&#10;- Theo dõi sức khỏe"
                    />
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="pmx-form-section pmx-variants-section">
                <h4>Mẫu mã & Biến thể</h4>
                {(editDetail?.variants || []).length > 0 && (
                  <div className="pmx-variants-list">
                    {(editDetail?.variants || []).map((v, i) => (
                      <div key={i} className="pmx-variant-item">
                        <div className="pmx-variant-item-field">
                          <label>Tên mẫu</label>
                          <input
                            placeholder="Ví dụ: Đen, Đỏ"
                            value={v.name}
                            onChange={(e) => {
                              const variants = [...editDetail.variants]
                              variants[i].name = e.target.value
                              setEditDetail({ ...editDetail, variants })
                            }}
                          />
                        </div>
                        <div className="pmx-variant-item-field">
                          <label>URL ảnh</label>
                          <input
                            placeholder="https://..."
                            value={v.image}
                            onChange={(e) => {
                              const variants = [...editDetail.variants]
                              variants[i].image = e.target.value
                              setEditDetail({ ...editDetail, variants })
                            }}
                          />
                        </div>
                        <div className="pmx-variant-item-field">
                          <label>Giá (₫)</label>
                          <input
                            placeholder="0"
                            type="number"
                            value={v.price}
                            onChange={(e) => {
                              const variants = [...editDetail.variants]
                              variants[i].price = +e.target.value
                              setEditDetail({ ...editDetail, variants })
                            }}
                          />
                        </div>
                        <div className="pmx-variant-item-field">
                          <label>Kho</label>
                          <input
                            placeholder="0"
                            type="number"
                            value={v.stock}
                            onChange={(e) => {
                              const variants = [...editDetail.variants]
                              variants[i].stock = +e.target.value
                              setEditDetail({ ...editDetail, variants })
                            }}
                          />
                        </div>
                        <button
                          className="pmx-variant-remove-btn"
                          onClick={() => {
                            const variants = [...editDetail.variants]
                            variants.splice(i, 1)
                            setEditDetail({ ...editDetail, variants })
                          }}
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="pmx-add-variant-btn"
                  onClick={() =>
                    setEditDetail({
                      ...editDetail,
                      variants: [...(editDetail.variants || []), { name: "", image: "", price: 0, stock: 0 }],
                    })
                  }
                >
                  <Plus size={16} />
                  Thêm mẫu mã
                </button>
              </div>
            </div>

            <div className="pmx-modal-actions">
              <button
                className="pmx-btn"
                onClick={() => {
                  setEditProduct(null)
                  setEditSimple(null)
                  setEditDetail(null)
                }}
              >
                Hủy
              </button>
              <button className="pmx-btn pmx-primary" onClick={saveEdit}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="pmx-modal" onClick={() => setShowAdd(false)}>
          <div className="pmx-modal-card pmx-add" onClick={(e) => e.stopPropagation()}>
            <div className="pmx-edit-header">
              <h3>Thêm sản phẩm mới</h3>
              <button className="pmx-modal-close" onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="pmx-form-container">
              {/* Basic Product Info */}
              <div className="pmx-form-section">
                <h4>Thông tin cơ bản</h4>
                <div className="pmx-form-grid">
                  <div className="pmx-form-row">
                    <label>ID Sản phẩm *</label>
                    <input
                      value={addSimple.id}
                      onChange={(e) => setAddSimple({ ...addSimple, id: e.target.value })}
                      placeholder="Ví dụ: SP001"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Tên sản phẩm *</label>
                    <input
                      value={addSimple.name}
                      onChange={(e) => setAddSimple({ ...addSimple, name: e.target.value })}
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Danh mục</label>
                    <input
                      value={addSimple.category}
                      onChange={(e) => setAddSimple({ ...addSimple, category: e.target.value })}
                      placeholder="Ví dụ: Đồng hồ, Vòng tay"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Giá gốc (₫)</label>
                    <input
                      type="number"
                      value={addSimple.price}
                      onChange={(e) => setAddSimple({ ...addSimple, price: +e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Tồn kho</label>
                    <input
                      type="number"
                      value={addSimple.stock}
                      onChange={(e) => setAddSimple({ ...addSimple, stock: +e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Media & Description */}
              <div className="pmx-form-section">
                <h4>Nội dung & Hình ảnh</h4>
                <div className="pmx-form-grid pmx-full">
                  <div className="pmx-form-row">
                    <label>Ảnh chính (URL)</label>
                    <input
                      value={addSimple.image}
                      onChange={(e) => setAddSimple({ ...addSimple, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="pmx-form-row">
                    <label>Mô tả sản phẩm</label>
                    <textarea
                      value={addSimple.description}
                      onChange={(e) => setAddSimple({ ...addSimple, description: e.target.value })}
                      placeholder="Nhập mô tả chi tiết về sản phẩm"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pmx-form-section">
                <h4>Tính năng nổi bật</h4>
                <div className="pmx-form-grid pmx-full">
                  <div className="pmx-form-row">
                    <label>Danh sách tính năng (mỗi dòng 1 tính năng)</label>
                    <textarea
                      value={addDetail.features?.join("\n") || ""}
                      onChange={(e) =>
                        setAddDetail({ ...addDetail, features: e.target.value.split("\n").filter((f) => f.trim()) })
                      }
                      placeholder="Ví dụ:&#10;- Chống nước IP68&#10;- Pin 7 ngày&#10;- Theo dõi sức khỏe"
                    />
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="pmx-form-section pmx-variants-section">
                <h4>Mẫu mã & Biến thể</h4>
                {(addDetail.variants || []).length > 0 && (
                  <div className="pmx-variants-list">
                    {(addDetail.variants || []).map((v, i) => (
                      <div key={i} className="pmx-variant-item">
                        <div className="pmx-variant-item-field">
                          <label>Tên mẫu</label>
                          <input
                            placeholder="Ví dụ: Đen, Đỏ"
                            value={v.name}
                            onChange={(e) => {
                              const variants = [...addDetail.variants]
                              variants[i].name = e.target.value
                              setAddDetail({ ...addDetail, variants })
                            }}
                          />
                        </div>
                        <div className="pmx-variant-item-field">
                          <label>URL ảnh</label>
                          <input
                            placeholder="https://..."
                            value={v.image}
                            onChange={(e) => {
                              const variants = [...addDetail.variants]
                              variants[i].image = e.target.value
                              setAddDetail({ ...addDetail, variants })
                            }}
                          />
                        </div>
                        <div className="pmx-variant-item-field">
                          <label>Giá (₫)</label>
                          <input
                            placeholder="0"
                            type="number"
                            value={v.price}
                            onChange={(e) => {
                              const variants = [...addDetail.variants]
                              variants[i].price = +e.target.value
                              setAddDetail({ ...addDetail, variants })
                            }}
                          />
                        </div>
                        <div className="pmx-variant-item-field">
                          <label>Kho</label>
                          <input
                            placeholder="0"
                            type="number"
                            value={v.stock}
                            onChange={(e) => {
                              const variants = [...addDetail.variants]
                              variants[i].stock = +e.target.value
                              setAddDetail({ ...addDetail, variants })
                            }}
                          />
                        </div>
                        <button
                          className="pmx-variant-remove-btn"
                          onClick={() => {
                            const variants = [...addDetail.variants]
                            variants.splice(i, 1)
                            setAddDetail({ ...addDetail, variants })
                          }}
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="pmx-add-variant-btn"
                  onClick={() =>
                    setAddDetail({
                      ...addDetail,
                      variants: [...(addDetail.variants || []), { name: "", image: "", price: 0, stock: 0 }],
                    })
                  }
                >
                  <Plus size={16} />
                  Thêm mẫu mã
                </button>
              </div>
            </div>

            <div className="pmx-modal-actions">
              <button className="pmx-btn" onClick={() => setShowAdd(false)}>
                Hủy
              </button>
              <button className="pmx-btn pmx-primary" onClick={addNewProduct}>
                Thêm sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}