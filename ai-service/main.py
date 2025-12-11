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
    
    # --- DEBUG: KIỂM TRA MODEL KHẢ DỤNG ---
    print("--- Available Models ---")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"[WARNING] Could not list models: {e}")
    print("------------------------")

# [FIX] Đổi tên model sang phiên bản cụ thể nếu tên ngắn gọn bị lỗi
# Bạn có thể thử lần lượt: 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'
MODEL_NAME = 'gemini-flash-latest' 
model = genai.GenerativeModel(MODEL_NAME)

class ImageRequest(BaseModel):
    image_base64: str

@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Service"}

@app.get("/health")
@app.head("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_wardrobe_item(request: ImageRequest):
    try:
        # --- BƯỚC 1: XỬ LÝ ẢNH ---
        if "," in request.image_base64:
            base64_data = request.image_base64.split(",")[1]
        else:
            base64_data = request.image_base64

        try:
            image_bytes = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as img_err:
            print(f"[ERROR] Image Decode Error: {img_err}")
            return {"success": False, "error": "Invalid image format"}

        # --- BƯỚC 2: TẠO PROMPT ---
        prompt = """
        Bạn là chuyên gia thời trang AI. Hãy phân tích hình ảnh trang phục này và trả về kết quả dưới dạng JSON thuần túy (không dùng markdown ```json).
        
        YÊU CẦU DỮ LIỆU ĐẦU RA (BẮT BUỘC KHỚP VỚI DANH SÁCH):
        1. "category": Chọn 1 trong ["Áo", "Quần", "Váy", "Giày", "Túi xách", "Phụ kiện"].
        2. "color": Chọn danh sách các màu phù hợp từ ["Đen", "Trắng", "Vàng", "Đỏ(Red)", "Xanh dương", "Xanh lá", "Cam", "Hồng", "Tím", "Nâu", "Be", "Xám"].
        3. "season": Chọn danh sách các mùa phù hợp từ ["Mùa Xuân", "Mùa Hạ", "Mùa Thu", "Mùa Đông"].
        4. "notes": Viết 1 câu ngắn (tiếng Việt) gợi ý phối đồ.
        5. "tags": Danh sách 3-5 từ khóa tiếng Anh.

        Ví dụ format JSON trả về (CHÚ Ý DẠNG MẢNG CHO COLOR VÀ SEASON):
        {
            "category": "Áo",
            "color": ["Trắng", "Xanh dương"],
            "season": ["Mùa Hè", "Mùa Thu"],
            "notes": "Phù hợp mặc đi chơi, phối với quần jean.",
            "tags": ["casual", "streetwear"]
        }
        """

        # --- BƯỚC 3: GỌI GEMINI API ---
        print(f"[INFO] Sending image to Gemini using model: {MODEL_NAME}...") 
        response = model.generate_content([prompt, image])
        
        # --- BƯỚC 4: XỬ LÝ KẾT QUẢ ---
        raw_text = response.text
        print(f"[INFO] Response received (len={len(raw_text)})")

        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        result_json = json.loads(cleaned_text)

        # Đảm bảo color và season luôn là list ngay cả khi AI trả về string
        if isinstance(result_json.get("color"), str):
            result_json["color"] = [result_json["color"]]
            
        if isinstance(result_json.get("season"), str):
            result_json["season"] = [result_json["season"]]

        return {
            "success": True,
            "data": result_json
        }

    except Exception as e:
        print(f"[ERROR] General Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    print("[INFO] AI Service is running on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)