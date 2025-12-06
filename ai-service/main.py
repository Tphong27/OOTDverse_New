from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import json
import base64
import io
from PIL import Image
from dotenv import load_dotenv
import pathlib
import google.generativeai as genai

# 1. Load biến môi trường
env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# 2. Cấu hình Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("[ERROR] GEMINI_API_KEY not found in .env")
else:
    print("[SUCCESS] Found Gemini API Key")
    genai.configure(api_key=api_key)

# Sử dụng model Gemini 1.5 Flash (Tốc độ nhanh, ổn định và miễn phí/rẻ)
model = genai.GenerativeModel('gemini-1.5-flash')

class ImageRequest(BaseModel):
    image_base64: str

@app.post("/analyze")
async def analyze_wardrobe_item(request: ImageRequest):
    try:
        # --- BƯỚC 1: XỬ LÝ ẢNH ---
        # Frontend có thể gửi kèm header "data:image/jpeg;base64,...", cần loại bỏ nó
        if "," in request.image_base64:
            base64_data = request.image_base64.split(",")[1]
        else:
            base64_data = request.image_base64

        # Chuyển chuỗi Base64 thành đối tượng hình ảnh (PIL Image)
        try:
            image_bytes = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as img_err:
            print(f"Image Decode Error: {img_err}")
            return {"success": False, "error": "Invalid image format"}

        # --- BƯỚC 2: TẠO PROMPT (CÂU LỆNH) ---
        # Prompt này được tinh chỉnh để khớp với Database MongoDB của bạn
        prompt = """
        Bạn là chuyên gia thời trang AI. Hãy phân tích hình ảnh trang phục này và trả về kết quả dưới dạng JSON thuần túy (không dùng markdown, không giải thích).

        🎯 YÊU CẦU DỮ LIỆU ĐẦU RA (BẮT BUỘC KHỚP VỚI DANH SÁCH):

        1. "category" (Chọn 1 cái đúng nhất): 
           - "Áo", "Quần", "Váy", "Giày", "Phụ kiện", "Túi xách"

        2. "color" (Chọn màu chủ đạo):
           - Ưu tiên chọn trong danh sách: ["Đen", "Trắng", "Vàng", "Màu đỏ(Red)", "Xanh dương", "Xanh lá", "Cam", "Hồng", "Tím", "Nâu", "Be", "Xám"]
           - Nếu không khớp, hãy chọn màu gần giống nhất trong danh sách trên.

        3. "season" (Chọn 1 mùa phù hợp nhất):
           - "Mùa Xuân", "Mùa Hạ", "Mùa Thu", "Mùa Đông"

        4. "notes": Viết 1 câu ngắn (tiếng Việt) gợi ý cách phối đồ hoặc dịp phù hợp.

        5. "tags": Một mảng chứa 3-5 từ khóa tiếng Anh mô tả phong cách (VD: ["casual", "vintage", "streetwear"]).

        Ví dụ format JSON trả về:
        {
            "category": "Áo",
            "color": "Trắng",
            "season": "Mùa Hè",
            "notes": "Thích hợp mặc đi làm hoặc dạo phố, phối với quần jean.",
            "tags": ["elegant", "basic", "korean-style"]
        }
        """

        # --- BƯỚC 3: GỌI GEMINI API ---
        print("Đang gửi ảnh tới AI...")
        response = model.generate_content([prompt, image])
        
        # --- BƯỚC 4: XỬ LÝ KẾT QUẢ ---
        raw_text = response.text
        print("Gemini Raw Response:", raw_text)

        # Làm sạch chuỗi JSON (Gemini thường trả về bọc trong ```json ... ```)
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        # Parse chuỗi thành JSON Object
        result_json = json.loads(cleaned_text)

        return {
            "success": True,
            "data": result_json
        }

    except Exception as e:
        print(f"General Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    print("AI Service (Gemini) is running on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)