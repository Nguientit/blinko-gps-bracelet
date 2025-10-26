const productsData = require("../data/database.json");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Đây là URL của PROXY CỦA BẠN (đã deploy ở Bước 1)
const PROXY_URL = process.env.GEMINI_PROXY_URL || "https://gemini-proxy.nguyenpq65.workers.dev";

// Đây là ĐƯỜNG DẪN API của Google mà chúng ta muốn gọi
const API_PATH = "/v1beta/models/gemini-2.5-flash:generateContent";

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

⭐ TIÊU CHÍ TƯ VẤN CHUNG:
- **Tập trung vào an toàn**: Luôn nhấn mạnh các tính năng như định vị GPS.
- **Tập trung vào sở thích của bé**: Gợi ý màu sắc, thiết kế phù hợp.
- **Phong cách**: Giọng vui tươi, thân thiện, chuyên nghiệp (dùng icon ✨😄👍).
- **Định dạng**: Dùng **in đậm** cho từ khóa.

⭐ QUY TẮC KHI GIỚI THIỆU SẢN PHẨM:
0. **CHỦ ĐỘNG GỢI Ý**: Nếu người dùng hỏi chung chung, hãy giới thiệu ngay 2-3 mẫu.
1. Câu dẫn: "Dạ, BlinkoBot có vài gợi ý hay cho mình đây ạ:"
2. Cấu trúc:
    **<Tên sản phẩm>**
    <Mô tả sản phẩm>
3. KHÔNG dùng Markdown, KHÔNG ghi ID trong câu.
4. Cuối câu trả lời phải có [PRODUCTS: id1, id2, id3]
5. Tối đa 3 sản phẩm.

⭐ QUY TẮC KHI TRẢ LỜI CÂU HỎI CHUNG:
1. Trả lời dựa **CHỈ** trên "DỮ LIỆU SẢN PHẨM HIỆN CÓ" bên dưới.
2. Tóm tắt các tính năng chung nhất từ các sản phẩm đó.
3. KHÔNG được trả về [PRODUCTS].

---
DỮ LIỆU SẢN PHẨM HIỆN CÓ (Dùng để trả lời mọi câu hỏi):
${JSON.stringify(filteredProducts, null, 2)}
---
`;
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
    const lowerMessage = lastUserMessage.toLowerCase()

    let didUserFilter = false;
    // Kiểm tra xem người dùng có hỏi "định vị" không
    const isAskingForLocator = lowerMessage.includes("định vị") || lowerMessage.includes("gps")

    if (isAskingForLocator && shouldShowProducts) {
      // Nếu ĐÚNG, lọc danh sách sản phẩm
      // CHỈ giữ lại những sản phẩm có "GPS" trong 'features'
      console.log("[Filter] Lọc sản phẩm: Người dùng hỏi 'định vị'. Chỉ lấy sản phẩm có GPS.");

      const locatorProducts = filteredProducts.filter(p =>
        p.features && p.features.some(f => f.toLowerCase().includes("gps"))
      );

      if (locatorProducts.length > 0) {
        filteredProducts = locatorProducts;
      } else {
        // Trường hợp không tìm thấy SP nào có GPS, giữ nguyên list
        console.warn("[Filter] Không tìm thấy sản phẩm có 'GPS' trong features. Giữ nguyên list.");
      }
    } else if (shouldShowProducts) {
      // Người dùng hỏi "dây" (nhưng không hỏi "định vị")
      const isAskingForStrapOnly = lowerMessage.includes("dây") || lowerMessage.includes("phụ kiện");
      if (isAskingForStrapOnly) {
        console.log("[Filter] Lọc sản phẩm: Chỉ lấy DÂY ĐEO (accessories).");
        filteredProducts = filteredProducts.filter(p => p.category === 'accessories');
      }
    }
    // Logic này sẽ chạy trên danh sách 'filteredProducts' đã "sạch"
    if (priceFilter) {
      didUserFilter = true; // Đánh dấu người dùng có lọc
      console.log("[Filter] Đang lọc theo giá:", priceFilter);
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
    }

    const isAskingForCheapest = lowerMessage.includes("rẻ nhất");
    const isAskingForMostExpensive = lowerMessage.includes("đắt nhất");

    if (isAskingForCheapest && filteredProducts.length > 0) {
      didUserFilter = true; // Đánh dấu người dùng có lọc
      console.log("[Filter] Người dùng hỏi 'rẻ nhất'. Sắp xếp và lấy 1 sản phẩm.");
      filteredProducts.sort((a, b) => a.price - b.price);
      filteredProducts = filteredProducts.slice(0, 1);
    } else if (isAskingForMostExpensive && filteredProducts.length > 0) {
      didUserFilter = true; // Đánh dấu người dùng có lọc
      console.log("[Filter] Người dùng hỏi 'đắt nhất'. Sắp xếp và lấy 1 sản phẩm.");
      filteredProducts.sort((a, b) => b.price - a.price);
      filteredProducts = filteredProducts.slice(0, 1);
    }

    // BƯỚC 4: KIỂM TRA LỌC RỖNG (Logic "mới")
    if (didUserFilter && filteredProducts.length === 0) {
      console.warn("[Filter] Lọc không có kết quả. Gửi mảng rỗng cho AI.");
    }

    // 3. Xây dựng prompt SAU KHI LỌC
    // Biến 'filteredProducts' lúc này đã "sạch"
    let prompt = `${buildSystemPrompt(filteredProducts)}\n\nLịch sử hội thoại:\n${conversationHistory}\n\nNgười dùng: ${lastUserMessage}\nBlinkoBot:`;

    // Thêm hướng dẫn tác vụ
    if (shouldShowProducts) {
      prompt += `\n\n[HƯỚNG DẪN]: Người dùng đang muốn xem sản phẩm. Hãy thực hiện "QUY TẮC KHI GIỚI THIỆU SẢN PHẨM". Bạn PHẢI giới thiệu sản phẩm từ "DỮ LIỆU SẢN PHẨM" và thêm tag [PRODUCTS: id1, id2, id3] vào cuối câu trả lời.`;
      if (priceFilter) {
        prompt += ` (Lưu ý: Chỉ giới thiệu các sản phẩm đã được lọc sẵn trong DỮ LIỆU SẢN PHẨM).`;
      }
      if (isAskingForLocator) {
        prompt += ` (Lưu ý: Người dùng hỏi về "định vị", hãy tập trung vào các sản phẩm có GPS).`;
      }
    } else {
      prompt += `\n\n[HƯỚNG DẪN]: Người dùng đang hỏi thông tin chung. Hãy thực hiện "QUY TẮC KHI TRẢ LỜI CÂU HỎI CHUNG". KHÔNG được thêm tag [PRODUCTS].`;
    }

    console.log("--- PROMPT BEING SENT ---");
    console.log(prompt);
    console.log("-------------------------");

    console.log("[v1] Sending prompt to Gemini (via proxy)");

    if (!GEMINI_API_KEY) {
      console.error("LỖI NGHIÊM TRỌNG: GEMINI_API_KEY không được tìm thấy trong môi trường.");
      throw new Error("Missing GEMINI_API_KEY");
    }

    // Xây dựng URL cuối cùng: PROXY + PATH + KEY
    // Nó sẽ có dạng: https://gemini-proxy.../v1beta/models/gemini-pro:generateContent?key=AIza...
    const fullApiUrl = `${PROXY_URL}${API_PATH}?key=${GEMINI_API_KEY}`;

    console.log("[v1] Sending prompt via MY Proxy");
    console.log(`[v1] Target URL: ${fullApiUrl}`); // Thêm log để kiểm tra

    const response = await fetch(fullApiUrl, { // <--- Sửa thành fullApiUrl
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    console.log("[v0] Gemini AI Response:", aiResponse);

    // Nếu Gemini không trả gì hoặc chỉ nói "Xin lỗi..."
    const isBadAIResponse =
      !aiResponse ||
      aiResponse.toLowerCase().includes("xin lỗi") ||
      aiResponse.length < 10;

    // Tạo fallback message nếu AI fail
    if (isBadAIResponse && filteredProducts.length > 0) {
      const fallbackList = filteredProducts.slice(0, 3);
      aiResponse = `Dạ, BlinkoBot có vài mẫu giá tốt nhất cho mình nè 😄:
${fallbackList
          .map(
            (p) =>
              `**${p.name}** – chỉ khoảng **${p.price.toLocaleString("vi-VN")}đ**. ${p.description}`
          )
          .join("\n\n")}
[PRODUCTS: ${fallbackList.map((p) => p.id).join(", ")}]`;
      console.log("[Fallback] AI không hiểu, tự sinh phản hồi từ danh sách lọc.");
    }


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
      // Xấu: AI không trả về SP, nhưng đáng lẽ phải trả về
      const recommendedIds = filteredProducts.slice(0, 3).map((p) => p.id)
      products = filteredProducts.filter((p) => recommendedIds.includes(p.id))
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