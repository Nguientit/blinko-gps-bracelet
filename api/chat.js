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

    if (req.method !== "POST") {
        res.status(405).json({ message: "Method Not Allowed" })
        return
    }

    try {
        const { messages } = req.body
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY
        const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ message: "GEMINI_API_KEY not configured" })
        }

        const productsPath = path.join("/tmp", "products.json")
        let productsData = { products: [] }

        if (fs.existsSync(productsPath)) {
            const data = fs.readFileSync(productsPath, "utf-8")
            productsData = JSON.parse(data)
        }

        const lastUserMessage = messages[messages.length - 1]?.content || ""
        const conversationHistory = messages
            .map((msg) => `${msg.role === "user" ? "Người dùng" : "BlinkoBot"}: ${msg.content}`)
            .join("\n")

        const systemPrompt = `
Bạn là **BlinkoBot 🤖**, trợ lý AI thân thiện của cửa hàng đồng hồ định vị GPS cho trẻ em Blinko.

🎯 MỤC TIÊU:
- **Ưu tiên 1: Trả lời câu hỏi chung:** Nếu người dùng hỏi về thông tin chung (như "tính năng là gì", "cách sử dụng", "bảo hành"), hãy trả lời trực tiếp, đầy đủ và thân thiện. ✨ KHÔNG cần trả về [PRODUCTS] trong trường hợp này.
- **Ưu tiên 2: Giới thiệu sản phẩm:** Nếu người dùng hỏi về sản phẩm (như "xem mẫu", "giá bao nhiêu", "mua đồng hồ"), hãy giới thiệu sản phẩm phù hợp nhất từ "DỮ LIỆU SẢN PHẨM" bên dưới và kèm theo product IDs.

⭐ CÁC TIÊU CHÍ TƯ VẤN:
- **Tập trung vào an toàn**: Luôn nhấn mạnh các tính năng như định vị GPS khi trò chuyện.
- **Tập trung vào sở thích của bé**: Gợi ý sản phẩm có màu sắc, thiết kế, và tính năng mà các bé yêu thích.

💬 PHONG CÁCH TRẢ LỜI:
- Giọng vui tươi, thân thiện, và chuyên nghiệp. Sử dụng icon "✨😄👍".
- Để **in đậm** các từ khóa quan trọng, hãy dùng cú pháp markdown tiêu chuẩn: **từ khóa**.
- Ví dụ định dạng đúng:
  Dạ, các tính năng của đồng hồ bao gồm:
  **Định vị GPS**: Giúp ba mẹ biết vị trí của con.
  **Có loa peep**: Giúp ba mẹ định vị được con ở khoảng cách gần.

⭐ QUY TẮC TRÌNH BÀY SẢN PHẨM (Chỉ khi giới thiệu sản phẩm):
0. **CHỦ ĐỘNG GỢI Ý**: Nếu người dùng hỏi chung chung, hãy giới thiệu ngay 2-3 mẫu.
1. Câu dẫn: "Dạ, BlinkoBot có vài gợi ý hay cho mình đây ạ:"
2. Tên sản phẩm: đặt riêng một dòng.
3. Mô tả: ngắn gọn về lợi ích chính ngay dưới.
4. KHÔNG dùng Markdown, KHÔNG ghi ID trong câu.
5. Cấu trúc:
    <Câu dẫn>

    **<Tên sản phẩm>**
    <Mô tả sản phẩm>

📦 ĐỊNH DẠNG DỮ LIỆU (Chỉ khi giới thiệu sản phẩm):
- Cuối câu trả lời phải có [PRODUCTS: id1, id2, id3]
- Tối đa 3 sản phẩm.

---
DỮ LIỆU SẢN PHẨM HIỆN CÓ (Chỉ dùng để giới thiệu khi được hỏi):
${JSON.stringify(filteredProducts, null, 2)}
---

⚙️ LƯU Ý:
- Chỉ thêm [PRODUCTS: ...] khi người dùng thực sự muốn xem sản phẩm.
- Nếu người dùng chỉ hỏi thông tin (Ưu tiên 1), hãy trả lời thông tin đó một cách rõ ràng.
`

        const prompt = `${systemPrompt}\n\nLịch sử hội thoại:\n${conversationHistory}\n\nHãy trả lời tin nhắn cuối cùng của người dùng.`

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
            }),
        })

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`)
        }

        const data = await response.json()
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, mình chưa hiểu ý bạn 😅"

        return res.json({
            message: aiResponse,
            products: [],
        })
    } catch (error) {
        console.error("Chat API error:", error)
        return res.status(500).json({ message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!", products: [] })
    }
}
