from PIL import Image
import io
import requests
import base64

def download_image(url):
    """Tải ảnh và trả về PIL Image"""
    try:
        response = requests.get(url, timeout=10)
        return Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception as e:
        print(f"[ERROR] Download failed for {url}: {str(e)}")
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

# Example Prompt for Lookbook Generation using Gemini (Text and Image)
def generate_lookbook_prompt_with_gemini(outfit_name, items_description, rationale):
    """
    Sử dụng Gemini để tạo ra một Prompt sinh ảnh thời trang chuyên nghiệp.
    """
    try:
        from services.stylist import model # Reuse the configured model
        
        prompt_request = f"""
        Bạn là một chuyên gia Prompt Engineering cho AI sinh ảnh (DALL-E, Midjourney).
        Hãy tạo 1 Prompt TIẾNG ANH duy nhất để sinh ra ảnh minh họa thời trang cho bộ đồ sau:
        - Tên bộ đồ: {outfit_name}
        - Các món đồ: {items_description}
        - Bối cảnh & Lý do phối: {rationale}

        Yêu cầu Prompt:
        1. Tập trung vào người mẫu (người thật) mặc bộ đồ này.
        2. Phong cách: High-end fashion editorial, cinematic lighting, realistic 8k, professional photography.
        3. Mô tả rõ màu sắc và chất liệu của từng món đồ khớp với mô tả.
        4. Trả về DUY NHẤT đoạn văn prompt tiếng Anh, không thêm giải thích.
        """
        
        response = model.generate_content(prompt_request)
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] Prompt generation failed: {str(e)}")
        # Fallback prompt
        return f"Professional fashion photography of a model wearing {outfit_name}, {items_description}, high quality."

def generate_lookbook_image(outfit_name, items_description, rationale):
    """
    Sinh ảnh Lookbook bằng Pollinations AI (Demo friendly)
    """
    try:
        # 1. Tạo prompt tinh tế hơn bằng Gemini
        detailed_prompt = generate_lookbook_prompt_with_gemini(outfit_name, items_description, rationale)
        
        # 2. Sử dụng Pollinations.ai (không cần API key cho demo)
        # Encode prompt
        encoded_prompt = requests.utils.quote(detailed_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={np.random.randint(1000)}"
        
        return image_url
    except Exception as e:
        print(f"[ERROR] Lookbook generation failed: {str(e)}")
        return None
