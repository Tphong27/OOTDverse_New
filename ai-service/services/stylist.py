import os
import json
import pathlib
import google.generativeai as genai
from typing import List, Dict
from dotenv import load_dotenv

# 1. Load environment variables
from services.config import model

async def generate_outfit_suggestions(
    style: str, 
    occasion: str, 
    weather: str, 
    wardrobe: List[Dict],
    skin_tone: str = "tự nhiên",
    custom_context: str = None,
    preferences: Dict = None
):
    try:
        # --- STEP 1: PREPARE DATA ---
        wardrobe_description = json.dumps(wardrobe, ensure_ascii=False, indent=2)
        
        # Build preferences section if provided
        preference_section = ""
        if preferences:
            fav_styles = ", ".join(preferences.get('favorite_styles', []))
            fav_colors = ", ".join(preferences.get('favorite_colors', []))
            avoid_colors = ", ".join(preferences.get('avoid_colors', []))
            bio = preferences.get('bio', "")
            
            preference_section = "\n        SỞ THÍCH CÁ NHÂN (PROFILE):"
            if fav_styles: preference_section += f"\n        - Phong cách yêu thích: {fav_styles}"
            if fav_colors: preference_section += f"\n        - Màu sắc yêu thích: {fav_colors}"
            if avoid_colors: preference_section += f"\n        - Màu sắc cần tránh: {avoid_colors}"
            if bio: preference_section += f"\n        - Giới thiệu bản thân: {bio}"

        # Build custom context section if provided
        custom_context_section = ""
        if custom_context and custom_context.strip():
            custom_context_section = f"\n        - Mô tả bổ sung từ người dùng: {custom_context}"

        # --- STEP 2: PROMPT ---
        prompt = f"""
        Bạn là một chuyên gia tư vấn thời trang AI chuyên nghiệp (AI Stylist) có kiến thức sâu rộng về:
        - Xu hướng thời trang hiện tại trên toàn cầu và các nền tảng mạng xã hội (TikTok, Instagram).
        - Cách phối hợp màu sắc và chất liệu theo từng tông da và thời tiết.
        - Các quy tắc trang phục (dress code) cho từng dịp cụ thể.

        Nhiệm vụ của bạn là dựa trên tủ đồ của người dùng và bối cảnh được cung cấp để gợi ý ra 3 bộ trang phục hoàn hảo nhất.

        BỐI CẢNH NGƯỜI DÙNG:
        - Phong cách cá nhân ưu tiên: {style}
        - Dịp mặc (Occasion): {occasion}
        - Thời tiết hiện tại: {weather}
        - Tông da người mặc: {skin_tone}{preference_section}{custom_context_section}

        DANH SÁCH TỦ ĐỒ (WARDROBE):
        {wardrobe_description}

        YÊU CẦU PHÂN TÍCH:
        1. Gợi ý đúng 3 bộ trang phục khác nhau, đảm bảo tính thẩm mỹ cao và chuẩn xu hướng.
        2. Mỗi bộ trang phục phải là một outfit HOÀN CHỈNH: ưu tiên phối hợp Áo + Quần/Váy + Giày + Túi/Phụ kiện. Cố gắng phối từ 3-5 món để bộ đồ nhìn chuyên nghiệp và có "gu".
        3. RÀNG BUỘC CHẶT CHẼ: Nếu bối cảnh yêu cầu sự trang trọng (ví dụ: Wedding, Event, Work), hãy lựa chọn các món đồ lịch sự, sang trọng. Nếu là dạo phố (Streetwear, Casual), hãy ưu tiên sự thoải mái và phá cách.
        4. TÍNH TOÁN XU HƯỚNG: Sử dụng kiến thức về xu hướng TikTok/Instagram hiện nay để tạo nên các bản phối "trendy".
        5. Mỗi bộ trang phục phải sử dụng đúng 'id' của các món đồ có thật trong DANH SÁCH TỦ ĐỒ.
        6. Trả về kết quả dưới dạng JSON thuần túy (không dùng markdown ```json) với cấu trúc sau:
           [
             {{
               "outfit_name": "Tên bộ đồ (ví dụ: Minimalist Office Style)",
               "item_ids": ["id1", "id2", "id3", "id4"],
               "description": "Mô tả ngắn gọn về các món đồ đã chọn",
               "rationale": "Giải thích chi tiết tại sao bộ đồ này phù hợp với bối cảnh, thời tiết, tông da và nó đang bắt kịp xu hướng nào"
             }},
             ... (đủ 3 bộ)
           ]

        LƯU Ý QUAN TRỌNG: 
        - Luôn ưu tiên phối thêm GIÀY và PHỤ KIỆN để hoàn thiện outfit.
        - Phản hồi hoàn toàn bằng tiếng Việt.
        """

        # --- STEP 3: CALL GEMINI API ---
        response = model.generate_content(prompt)
        
        # --- STEP 4: PROCESS RESULTS ---
        if not response or not response.text:
            raise ValueError("Gemini API return an empty response")

        raw_text = response.text
        cleaned_text = raw_text.strip()
        
        # Find the first '[' and last ']' to extract JSON if there's surrounding text
        start_idx = cleaned_text.find('[')
        end_idx = cleaned_text.rfind(']')
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            cleaned_text = cleaned_text[start_idx:end_idx + 1]
        else:
            # Fallback to markdown cleaning if brackets not found
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
        
        cleaned_text = cleaned_text.strip()
        if not cleaned_text:
            raise ValueError("Cleaned response text is empty")

        try:
            suggestions = json.loads(cleaned_text)
        except json.JSONDecodeError:
            # If standard loading fails, try a more aggressive clean
            # (Sometimes Gemini adds leading/trailing garbage)
            raise ValueError(f"Failed to parse JSON from AI response: {cleaned_text[:100]}...")
        
        # Ensure it's a list
        if not isinstance(suggestions, list):
            suggestions = [suggestions]

        return suggestions

    except Exception as e:
        # print(f"[ERROR] Stylist Service Error: {str(e)}") # Removed due to encoding issues on Windows
        raise e
