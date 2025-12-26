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
    custom_context: str = None
):
    try:
        # --- STEP 1: PREPARE DATA ---
        wardrobe_description = json.dumps(wardrobe, ensure_ascii=False, indent=2)
        
        # Build custom context section if provided
        custom_context_section = ""
        if custom_context and custom_context.strip():
            custom_context_section = f"\n        - Mô tả bổ sung từ người dùng: {custom_context}"

        # --- STEP 2: PROMPT ---
        prompt = f"""
        Bạn là một chuyên gia tư vấn thời trang AI chuyên nghiệp (AI Stylist). 
        Nhiệm vụ của bạn là dựa trên tủ đồ hiện có của người dùng và bối cảnh được cung cấp để gợi ý ra 3 bộ trang phục phù hợp nhất.

        BỐI CẢNH NGƯỜI DÙNG:
        - Phong cách yêu cầu: {style}
        - Dịp mặc: {occasion}
        - Thời tiết: {weather}
        - Tông da: {skin_tone}{custom_context_section}

        DANH SÁCH TỦ ĐỒ (WARDROBE):
        {wardrobe_description}

        YÊU CẦU:
        1. Gợi ý đúng 3 bộ trang phục khác nhau.
        2. Mỗi bộ trang phục phải bao gồm các món đồ có thật trong DANH SÁCH TỦ ĐỒ (sử dụng đúng 'id' của món đồ).
        3. Chọn đồ phối hợp hài hòa về màu sắc, thể loại (ví dụ: áo phối với quần/váy, giày phù hợp).
        4. Nếu người dùng có mô tả bổ sung, hãy ưu tiên hiểu đúng ngữ cảnh của họ để gợi ý outfit phù hợp nhất.
        5. Trả về kết quả dưới dạng JSON thuần túy (không dùng markdown ```json) với cấu trúc sau:
           [
             {{
               "outfit_name": "Tên bộ đồ (ví dụ: Năng động ngày hè)",
               "item_ids": ["id1", "id2", "id3"],
               "description": "Mô tả ngắn về các món đồ đã chọn",
               "rationale": "Giải thích tại sao bộ đồ này phù hợp với bối cảnh và tông da của người dùng"
             }},
             ... (đủ 3 bộ)
           ]

        LƯU Ý: 
        - Nếu tủ đồ quá ít đồ để phối đủ 3 bộ hoàn chỉnh, hãy cố gắng phối những bộ tốt nhất có thể.
        - Chỉ sử dụng item_id có trong danh sách được cung cấp.
        - Phản hồi bằng tiếng Việt.
        """

        # --- STEP 3: CALL GEMINI API ---
        response = model.generate_content(prompt)
        
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
        
        suggestions = json.loads(cleaned_text.strip())
        
        # Ensure it's a list
        if not isinstance(suggestions, list):
            suggestions = [suggestions]

        return suggestions

    except Exception as e:
        print(f"[ERROR] Stylist Service Error: {str(e)}")
        raise e
