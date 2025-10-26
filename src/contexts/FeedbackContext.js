import { createContext, useContext, useState, useEffect } from "react";

const FeedbackContext = createContext();

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy tất cả feedback từ API
    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/feedback");
            const data = await res.json();
            setFeedbacks(data);
        } catch (err) {
            setFeedbacks([]);
        } finally {
            setLoading(false);
        }
    };

    // Thêm feedback (mỗi email chỉ 1 lần)
    const addFeedback = async (feedback) => {
        setLoading(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedback),
            });
            const data = await res.json();
            if (res.ok) {
                setFeedbacks((prev) => [data.feedback, ...prev]);
                return { success: true, feedback: data.feedback };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            return { success: false, message: "Không thể gửi feedback." };
        } finally {
            setLoading(false);
        }
    };

    // Sửa feedback (chỉ đúng email mới sửa được)
    const updateFeedback = async (id, feedback) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(feedback),
            });
            const data = await res.json();
            if (res.ok) {
                setFeedbacks((prev) =>
                    prev.map((f) => (String(f.id) === String(id) ? data.feedback : f))
                );
                return { success: true, feedback: data.feedback };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            return { success: false, message: "Không thể cập nhật feedback." };
        } finally {
            setLoading(false);
        }
    };

    // Xóa feedback (chỉ đúng email mới xóa được)
    const deleteFeedback = async (id, userEmail) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                setFeedbacks((prev) => prev.filter((f) => String(f.id) !== String(id)));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (err) {
            return { success: false, message: "Không thể xóa feedback." };
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra email đã gửi feedback chưa
    const checkHasFeedback = async (email) => {
        if (!email) return false;
        try {
            const res = await fetch(`/api/feedback/check/${encodeURIComponent(email)}`);
            if (!res.ok) return false;
            const data = await res.json();
            return !!data.hasFeedback;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <FeedbackContext.Provider
            value={{
                feedbacks,
                loading,
                fetchFeedbacks,
                addFeedback,
                updateFeedback,
                deleteFeedback,
                checkHasFeedback,
            }}
        >
            {children}
        </FeedbackContext.Provider>
    );
};
