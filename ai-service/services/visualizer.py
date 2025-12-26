from PIL import Image
import io
import requests
import base64
import numpy as np

def auto_crop(img):
    """
    Cắt sát ảnh dựa trên alpha channel (vùng không trong suốt)
    """
    if img.mode != 'RGBA':
        return img
    
    # Chuyển sang numpy array để tìm bounding box
    np_img = np.array(img)
    alpha = np_img[:, :, 3]
    
    # Tìm các pixel có alpha > 0
    bg_coords = np.argwhere(alpha > 0)
    if bg_coords.size == 0:
        return img
        
    y_min, x_min = bg_coords.min(axis=0)
    y_max, x_max = bg_coords.max(axis=0)
    
    # Cắt ảnh
    return img.crop((x_min, y_min, x_max + 1, y_max + 1))

def download_image(url, remove_bg=False):
    """Tải ảnh và trả về PIL Image, tùy chọn tách nền và auto-crop"""
    try:
        response = requests.get(url, timeout=10)
        img = Image.open(io.BytesIO(response.content))
        
        if remove_bg:
            from rembg import remove
            img = remove(img)
            img = auto_crop(img)
            
        return img.convert("RGBA") if remove_bg else img.convert("RGB")
    except Exception as e:
        # print(f"[ERROR] Process failed for {url}: {str(e)}")
        # Trả về ảnh dummy nếu lỗi
        return Image.new("RGB", (400, 400), (240, 240, 240))

def create_moodboard(items, width=800, height=1000):
    """
    Tạo moodboard dạng lưới (Grid/Frames) giữ nguyên ảnh gốc.
    """
    # Nền xám nhạt trung tính
    canvas = Image.new("RGB", (width, height), (255, 255, 255))
    
    # Chia khung dựa trên số lượng item (thường là 2-4 món)
    num_items = len(items)
    if num_items <= 2:
        cols, rows = 1, num_items
    elif num_items <= 4:
        cols, rows = 2, 2
    else:
        cols, rows = 2, (num_items + 1) // 2

    # Kích thước mỗi cell
    padding = 20
    cell_w = (width - (cols + 1) * padding) // cols
    cell_h = (height - (rows + 1) * padding) // rows

    for idx, item in enumerate(items):
        r, c = idx // cols, idx % cols
        
        # Tải ảnh
        img = download_image(item["image_url"])
        
        # Resize ảnh khớp vào cell (thêm padding nhỏ trong cell)
        inner_padding = 10
        target_w = cell_w - inner_padding * 2
        target_h = cell_h - inner_padding * 2
        
        # Thumbnail giữ aspect ratio
        img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Tính toán vị trí x, y để căn giữa trong cell
        x = padding + c * (cell_w + padding) + (cell_w - img.width) // 2
        y = padding + r * (cell_h + padding) + (cell_h - img.height) // 2
        
        # Vẽ một khung viền nhẹ (Optional)
        # Bằng cách paste ảnh lên một frame trắng lớn hơn chút
        frame = Image.new("RGB", (img.width + 4, img.height + 4), (220, 220, 220))
        frame.paste(img, (2, 2))
        
        canvas.paste(frame, (x-2, y-2))
    
    return canvas

def pil_to_base64(pil_img):
    buffered = io.BytesIO()
    pil_img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def analyze_item_vision(img, category="món đồ"):
    """
    Sử dụng Gemini Vision để phân tích chi tiết ảnh món đồ đã được cô lập.
    """
    try:
        from services.config import model 
        
        # Chuyển đổi RGB để Gemini dễ xử lý (loại bỏ alpha if needed)
        analysis_img = img.convert("RGB")
        
        prompt = f"""
        Đây là ảnh thực tế của một {category} trong tủ đồ. 
        Hãy mô tả cực kỳ chi tiết các đặc điểm sau của nó để sinh ảnh AI:
        1. Màu sắc chính xác (ví dụ: xanh navy, denim sáng, trắng kem).
        2. Chất liệu (ví dụ: cotton, len, da, lụa).
        3. Họa tiết/Họa tiết in (ví dụ: trơn, kẻ sọc, có hình in graphic ở ngực, thêu hoa).
        4. Kiểu dáng/Form (ví dụ: cổ tròn, form rộng oversize, tay dài, quần suông).
        5. Các chi tiết đặc biệt (ví dụ: rách gối, cút vàng, túi hộp).

        Chỉ trả về đoạn mô tả ngắn gọn chi tiết bằng tiếng Anh. Không chào hỏi.
        """
        
        response = model.generate_content([prompt, analysis_img])
        if not response or not response.text:
            return f"a high quality {category}"
        return response.text.strip()
    except Exception as e:
        return f"a high quality {category}"

def generate_lookbook_prompt_with_vision(outfit_name, analyzed_items, rationale):
    try:
        from services.config import model
        
        items_detail = "\n".join([f"- {item['category']}: {item['vision_desc']}" for item in analyzed_items])
        
        prompt_request = f"""
        Bạn là chuyên gia Prompt Engineering cho AI sinh ảnh.
        Hãy tạo 1 Prompt TIẾNG ANH duy nhất để sinh ảnh thời trang:
        - Tên bộ đồ: {outfit_name}
        - Chi tiết món đồ (từ Vision analysis):
        {items_detail}
        - Lý do phối: {rationale}

        Yêu cầu Lookbook:
        1. Người mẫu thật mặc chính xác những món đồ với chi tiết như mô tả trên.
        2. Bối cảnh phối đồ tự nhiên, chuyên nghiệp (studio hoặc đường phố).
        3. Cinematic lighting, photorealistic, 8k, professional fashion photography.
        4. Trả về DUY NHẤT prompt tiếng Anh.
        """
        
        response = model.generate_content(prompt_request)
        if not response or not response.text:
            return f"Professional fashion photography of a model wearing {outfit_name}"
        return response.text.strip()
    except Exception as e:
        return f"Professional fashion photography of a model wearing {outfit_name}"

def generate_lookbook_image_v2(outfit_name, items, rationale):
    """
    Sinh ảnh Lookbook phiên bản Precision (Vision-Driven)
    Bao gồm retry và fallback để tránh rate limit
    """
    import time
    
    try:
        analyzed_items = []
        
        # Giới hạn chỉ phân tích 2 món đồ quan trọng nhất (Áo + Quần/Váy)
        priority_categories = ["Áo", "Quần", "Váy", "Quần/Váy"]
        priority_items = [item for item in items if any(cat in item.get("category", "") for cat in priority_categories)][:2]
        other_items = [item for item in items if item not in priority_items]
        
        for idx, item in enumerate(priority_items):
            try:
                # 1. Tải, tách nền và cắt sát món đồ
                isolated_img = download_image(item["image_url"], remove_bg=True)
                
                # 2. Phân tích Vision (với delay để tránh rate limit)
                if idx > 0:
                    time.sleep(1)  # Delay 1s giữa các lần gọi
                    
                vision_desc = analyze_item_vision(isolated_img, item.get("category", "món đồ"))
                
                analyzed_items.append({
                    "category": item.get("category", "món đồ"),
                    "vision_desc": vision_desc
                })
            except Exception as item_error:
                # print(f"[WARN] Item analysis failed, using fallback: {str(item_error)}")
                analyzed_items.append({
                    "category": item.get("category", "món đồ"),
                    "vision_desc": f"a stylish {item.get('category', 'item')}"
                })
        
        # Thêm các item khác với mô tả đơn giản (không chạy Vision)
        for item in other_items:
            analyzed_items.append({
                "category": item.get("category", "phụ kiện"),
                "vision_desc": f"matching {item.get('category', 'accessory')}"
            })
        
        # 3. Tạo prompt tổng hợp từ Vision results
        final_prompt = generate_lookbook_prompt_with_vision(outfit_name, analyzed_items, rationale)
        
        # 4. Sinh ảnh
        encoded_prompt = requests.utils.quote(final_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={np.random.randint(1000)}"
        
        return image_url
    except Exception as e:
        # print(f"[ERROR] Precision Lookbook failed: {str(e)}")
        # Fallback: Tạo prompt đơn giản
        try:
            simple_prompt = f"Professional fashion photography of a model wearing {outfit_name}, stylish outfit, 8k, cinematic"
            encoded = requests.utils.quote(simple_prompt)
            return f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&nologo=true"
        except:
            return None
