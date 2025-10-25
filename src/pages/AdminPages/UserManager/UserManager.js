"use client"

import { useEffect, useState } from "react"
import "./UserManager.css"

export default function UserManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users`)
      if (!response.ok) throw new Error("Lỗi tải người dùng")
      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleBlock = async (id, currentBlocked) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentBlocked }),
      })
      if (!response.ok) throw new Error("Lỗi cập nhật người dùng")
      await fetchUsers()
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    }
  }

  const toggleAdmin = async (id, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin"
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!response.ok) throw new Error("Lỗi cập nhật vai trò")
      await fetchUsers()
    } catch (err) {
      console.error("Lỗi:", err)
      setError(err.message)
    }
  }

  if (loading)
    return (
      <div className="userContainer">
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  if (error)
    return (
      <div className="userContainer">
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      </div>
    )

  return (
    <div className="userContainer">
      <h1>Quản lý tài khoản</h1>
      <p className="desc">Danh sách người dùng & quyền truy cập hệ thống</p>

      <table className="userTable">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={user.blocked ? "blockedRow" : ""}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role === "admin" ? "Quản trị viên" : "Người dùng"}</td>
              <td>
                {user.blocked ? <span className="blocked">Bị chặn</span> : <span className="active">Hoạt động</span>}
              </td>
              <td>
                <button
                  onClick={() => toggleBlock(user.id, user.blocked)}
                  className="btnBlock"
                  disabled={user.email === "admin@blinko.com"}
                >
                  {user.blocked ? "Mở khóa" : "Chặn"}
                </button>
                <button
                  onClick={() => toggleAdmin(user.id, user.role)}
                  className="btnAdmin"
                  disabled={user.email === "admin@blinko.com"}
                >
                  {user.role === "admin" ? "⬇ Hạ cấp" : "⬆ Nâng cấp Admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
