import os
import base64
import io
import json
import pathlib
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

# 1. Load environment variables
from services.config import model

async def analyze_image_with_gemini(image_base64: str):
    try:
        # --- STEP 1: IMAGE PROCESSING ---
        if "," in image_base64:
            base64_data = image_base64.split(",")[1]
        else:
            base64_data = image_base64

        image_bytes = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_bytes))

        # --- STEP 2: PROMPT ---
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
            "season": ["Mùa Hạ", "Mùa Thu"],
            "notes": "Phù hợp mặc đi chơi, phối với quần jean.",
            "tags": ["casual", "streetwear"]
        }
        """

        # --- STEP 3: CALL GEMINI API ---
        response = model.generate_content([prompt, image])
        
        # --- STEP 4: PROCESS RESULTS ---
        raw_text = response.text
        cleaned_text = raw_text.strip()
        
        # Clean markdown if present
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        result_json = json.loads(cleaned_text.strip())

        # Ensure color and season are always lists
        if isinstance(result_json.get("color"), str):
            result_json["color"] = [result_json["color"]]
            
        if isinstance(result_json.get("season"), str):
            result_json["season"] = [result_json["season"]]

        return result_json

    except Exception as e:
        print(f"[ERROR] Service Analysis Error: {str(e)}")
        raise e
