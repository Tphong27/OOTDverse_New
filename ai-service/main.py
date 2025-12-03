from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
from openai import OpenAI
import json

from dotenv import load_dotenv # Cần cài đặt: pip install python-dotenv

load_dotenv() # Tải biến từ file .env

# Khởi tạo App
app = FastAPI()

# --- CẤU HÌNH OPENAI ---
# Cách an toàn: Đặt key trong biến môi trường hệ thống
# Hoặc tạm thời paste key MỚI vào đây (không push lên git)
client = OpenAI("OPENAI_API_KEY") 

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
                    "content": "Bạn là một chuyên gia thời trang AI. Nhiệm vụ của bạn là phân tích hình ảnh quần áo và trả về dữ liệu JSON chính xác."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": """Hãy phân tích ảnh này và trả về kết quả dưới dạng JSON (không có markdown) với các trường sau:
                            - category: Loại trang phục (ví dụ: Áo thun, Sơ mi, Quần Jeans, Váy liền, Áo khoác, Giày, Túi xách). Hãy dùng tiếng Việt.
                            - color: Màu sắc chủ đạo (ví dụ: Trắng, Đen, Xanh dương, Be, Đỏ). Hãy dùng tiếng Việt.
                            - tags: Mảng chứa 3-5 từ khóa về phong cách (ví dụ: ["casual", "vintage", "streetwear", "summer"]).
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
            response_format={"type": "json_object"}, # Bắt buộc trả về JSON
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