from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
from openai import OpenAI
import json

from dotenv import load_dotenv

# 1. Load biến môi trường
load_dotenv() 

app = FastAPI()

# 2. Lấy key từ biến môi trường
api_key = os.getenv("OPENAI_API_KEY")

# Kiểm tra xem có key chưa (để debug)
if not api_key:
    # Tuyệt đối không dùng tiếng Việt có dấu ở đây
    print("[ERROR] OPENAI_API_KEY not found in .env")
else:
    # Sửa dòng này thành tiếng Anh
    print("[SUCCESS] Found API Key")

# 3. Khởi tạo Client ĐÚNG CÁCH
client = OpenAI(api_key=api_key) 

class ImageRequest(BaseModel):
    image_base64: str

@app.post("/analyze")
async def analyze_wardrobe_item(request: ImageRequest):
    try:
        # 1. Gọi OpenAI GPT-4o
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    # CHỈNH SỬA PROMPT TẠI ĐÂY
                    "content": """Bạn là chuyên gia thời trang. Nhiệm vụ: Phân tích ảnh và trả về JSON chính xác.
                    
                    QUY TẮC BẮT BUỘC (Trùng khớp với Database):
                    1. category (Chọn 1): "Áo", "Quần", "Váy", "Giày", "Phụ kiện". (Nếu là túi xách, mũ, kính... hãy chọn "Phụ kiện").
                    2. color (Chọn 1): "Đen", "Trắng", "Xám", "Xanh dương", "Xanh lá", "Đỏ", "Vàng", "Cam", "Hồng", "Tím", "Nâu", "Be".
                    3. season (Chọn 1): "Mùa Xuân", "Mùa Hạ", "Mùa Thu", "Mùa Đông".
                    4. notes: Viết một câu ngắn gợi ý cách phối đồ (Tiếng Việt).
                    5. tags: 3-5 từ khóa tiếng Anh (VD: casual, vintage).
                    """
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": """Phân tích ảnh này và trả về kết quả dưới dạng JSON (không markdown):
                            {
                                "category": "String",
                                "color": "String",
                                "season": "String",
                                "notes": "String",
                                "tags": ["String"]
                            }
                            """
                        },
                        {
                            "type": "image_url", 
                            "image_url": {
                                "url": f"{request.image_base64}"
                            }
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"}, 
            max_tokens=300,
        )

        # 2. Xử lý kết quả trả về
        content = response.choices[0].message.content
        print("OpenAI Response:", content)
        
        result_json = json.loads(content)

        return {
            "success": True,
            "data": result_json
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    print("AI Service is running on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)