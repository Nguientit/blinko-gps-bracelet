const productsData = require("../data/database.json");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyC2yx_9LVxRpyP0vw-qHG1aZBNGRZdCAqM"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

if (!GEMINI_API_KEY) {
  console.error("LỖI NGHIÊM TRỌNG: Không tìm thấy GEMINI_API_KEY trong file .env");
} else {
  console.log(`[Config] Đã nạp API Key (bắt đầu bằng: ${GEMINI_API_KEY.substring(0, 4)}...)`);
}

function extractPriceFilter(message) {
  const text = message.toLowerCase()

  const rangeMatch = text.match(
    /từ\s*(\d+(?:[.,]?\d+)?)\s*(k|nghìn|triệu|tr)?\s*(?:đến|tới|-)\s*(\d+(?:[.,]?\d+)?)\s*(k|nghìn|triệu|tr)?/,
  )
  if (rangeMatch) {
    let min = Number.parseFloat(rangeMatch[1])
    let max = Number.parseFloat(rangeMatch[3])
    const u1 = rangeMatch[2] || ""
    const u2 = rangeMatch[4] || ""
    if (u1.includes("k") || u1.includes("nghìn")) min *= 1000
    if (u1.includes("triệu") || u1.includes("tr")) min *= 1000000
    if (u2.includes("k") || u2.includes("nghìn")) max *= 1000
    if (u2.includes("triệu") || u2.includes("tr")) max *= 1000000
    return { min, max }
  }

  // Bắt giá đơn: "dưới 500k", "trên 2 triệu", "khoảng 800k"
  const singleMatch = text.match(/(\d+(?:[.,]?\d+)?)\s*(k|nghìn|triệu|tr)?/)
  if (!singleMatch) return null

  let amount = Number.parseFloat(singleMatch[1])
  const unit = singleMatch[2] || ""
  if (unit.includes("k") || unit.includes("nghìn")) amount *= 1000
  if (unit.includes("triệu") || unit.includes("tr")) amount *= 1000000

  if (text.includes("dưới") || text.includes("ít hơn") || text.includes("<")) return { max: amount }
  if (text.includes("trên") || text.includes("cao hơn") || text.includes(">")) return { min: amount }
  if (text.includes("khoảng") || text.includes("tầm") || text.includes("gần")) return { around: amount }

  return null
}

function buildSystemPrompt(filteredProducts) {
  return `
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
}

function shouldRecommendProducts(userMessage) {
  const lowerMessage = userMessage.toLowerCase()
  const infoKeywords = [
    "tính năng",
    "là gì",
    "hướng dẫn",
    "cách",
    "làm sao",
    "hỗ trợ",
    "bảo hành",
    "cài đặt",
    "hoạt động",
    "ý nghĩa"
  ]
  
  if (infoKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    return false 
  }

  const productKeywords = [
    "sản phẩm",
    "mẫu",
    "xem",
    "mua",
    "giá",
    "đồng hồ",
    "gửi",
    "cho tôi",
    "hiển thị",
    "có những",
    "loại nào",
    "giới thiệu",
    "định vị"
  ]
  
  return productKeywords.some((keyword) => lowerMessage.includes(keyword))
}

async function chatAPI(messages) {
  try {
    const lastUserMessage = messages[messages.length - 1]?.content || ""
    const shouldShowProducts = shouldRecommendProducts(lastUserMessage)
    const priceFilter = extractPriceFilter(lastUserMessage)

    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "Người dùng" : "BlinkoBot"}: ${msg.content}`)
      .join("\n")
      
    let filteredProducts = productsData.products

    // 1. Lọc sản phẩm TRƯỚC
    if (priceFilter) {
      if (priceFilter.min && priceFilter.max) {
        filteredProducts = filteredProducts.filter((p) => p.price >= priceFilter.min && p.price <= priceFilter.max)
      } else if (priceFilter.min) {
        filteredProducts = filteredProducts.filter((p) => p.price >= priceFilter.min)
      } else if (priceFilter.max) {
        filteredProducts = filteredProducts.filter((p) => p.price <= priceFilter.max)
      } else if (priceFilter.around) {
        const range = priceFilter.around * 0.2
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= priceFilter.around - range && p.price <= priceFilter.around + range,
        )
      }
      if (filteredProducts.length === 0) {
        filteredProducts = productsData.products.slice(0, 3)
      }
    }

    // 2. Xây dựng prompt SAU KHI LỌC
    let prompt = `${buildSystemPrompt(filteredProducts)}\n\nLịch sử hội thoại:\n${conversationHistory}\n\nHãy trả lời tin nhắn cuối cùng của người dùng.`

    if (shouldShowProducts) {
      prompt += ` QUAN TRỌNG: Người dùng đang hỏi về sản phẩm. Bạn PHẢI giới thiệu sản phẩm và thêm [PRODUCTS: id1, id2, id3] vào cuối câu trả lời.\n\n`
    }
    if (priceFilter) {
       prompt += ` LƯU Ý: Người dùng đã lọc theo giá. Chỉ giới thiệu các sản phẩm TỪ DANH SÁCH SẢN PHẨM HIỆN CÓ ở trên.\n\n`
    }

    console.log("[v0] Sending prompt to Gemini")
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
      }),
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, mình chưa hiểu ý bạn 😅"
    console.log("[v0] Gemini AI Response:", aiResponse)

    // Extract [PRODUCTS: ...]
    const productMatch = aiResponse.match(/\[PRODUCTS:\s*([^\]]+)\]/)
    let products = []

    if (productMatch) {
      // Tốt: AI trả về sản phẩm
      const productIds = productMatch[1].split(",").map((id) => id.trim())
      products = filteredProducts.filter((p) => productIds.includes(p.id)).slice(0, 3)
      // Xóa tag [PRODUCTS] khỏi câu trả lời
      aiResponse = aiResponse.replace(/\[PRODUCTS:[^\]]+\]/g, "").trim()
    
    } else if (shouldShowProducts) { 
      // *** ĐÂY LÀ PHẦN SỬA ***
      // Xấu: AI không trả về SP, nhưng đáng lẽ phải trả về
      
      // 1. Tự lấy sản phẩm dự phòng
      const recommendedIds = filteredProducts.slice(0, 3).map((p) => p.id)
      products = filteredProducts.filter((p) => recommendedIds.includes(p.id))
      
      // 2. THAY THẾ (overwrite) câu trả lời của AI, không dùng +=
      aiResponse = "Dạ, đây là những sản phẩm tuyệt vời mình muốn giới thiệu cho bạn!"
    }
    
    // Trả về object thuần
    return {
      message: aiResponse,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.description,
        features: p.features,
      })),
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return {
      message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!",
      products: [],
      error: true
    }
  }
}

// Nếu bạn cần endpoint cho Express hoặc fetch, có thể thêm:
async function chatHandler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" })
    return
  }
  try {
    const { messages } = req.body
    const result = await chatAPI(messages)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau!", products: [] })
  }
}

module.exports = { chatHandler, chatAPI };