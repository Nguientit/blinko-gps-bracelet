import { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // 2. Start initial loading (optional, as it defaults to true)
    setInitialLoading(true);
    const storedProfile = localStorage.getItem("user");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error("Error parsing stored profile:", e);
        localStorage.removeItem("user"); // Clear corrupted data
      }
    }

    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (e) {
        console.error("Error parsing stored orders:", e);
        localStorage.removeItem("orders"); // Clear corrupted data
      }
    }
    setInitialLoading(false);
  }, []);

  // ⚙️ 2️⃣ Lấy thông tin profile từ API `/api/profile/:userId`
  const fetchProfile = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/profile/${userId}`);
      if (!res.ok) throw new Error("Không thể tải dữ liệu profile");
      const data = await res.json();
      setProfile(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("[ProfileContext] Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📝 3️⃣ Cập nhật profile qua API `/api/profile/:userId`
  const updateProfile = async (updatedData) => {
    if (!profile || !profile.id) {
      console.error("[ProfileContext] Không có thông tin user để cập nhật.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Không thể cập nhật profile.");

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      localStorage.setItem("user", JSON.stringify(updatedProfile));
      console.log("[ProfileContext] Profile updated:", updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error("[ProfileContext] Update profile error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addOrder = (order) => {
    // Đảm bảo order có userId (đồng bộ với backend)
    if (!order.userId && profile?.id) {
      order.userId = profile.id;
    }
    const updatedOrders = [...orders, order];
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        initialLoading,
        fetchProfile,
        updateProfile,
        orders,
        addOrder,
        loading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
