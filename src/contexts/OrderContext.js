import { createContext, useContext, useState, useEffect, useCallback } from "react";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        setInitialLoading(true);
        const storedOrders = localStorage.getItem("orders");
        if (storedOrders) {
            try {
                setOrders(JSON.parse(storedOrders));
            } catch (e) {
                console.error("Error parsing stored orders:", e);
                localStorage.removeItem("orders");
            }
        }
        setInitialLoading(false);
    }, []);

    // Lấy danh sách đơn hàng theo userId từ API OrderRoutes
    const fetchOrders = useCallback(async (userId) => {
        if (!userId) return;
        try {
            setLoading(true);
            // Nếu chạy local, gọi đúng endpoint backend
            let apiUrl;
            if (
                window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1"
            ) {
                apiUrl = `http://localhost:5000/api/orders?userId=${encodeURIComponent(userId)}`;
            } else {
                apiUrl = `/api/orders?userId=${encodeURIComponent(userId)}`;
            }
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Không thể tải đơn hàng");
            const data = await res.json();
            setOrders(data || []);
            localStorage.setItem("orders", JSON.stringify(data || []));
        } catch (err) {
            if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
                console.error("[OrderContext] Fetch orders error: Backend API không phản hồi hoặc bị chặn CORS.");
            } else {
                console.error("[OrderContext] Fetch orders error:", err);
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading, setOrders]);

    return (
        <OrderContext.Provider
            value={{
                orders,
                loading,
                initialLoading,
                fetchOrders,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};
