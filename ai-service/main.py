from fastapi import FastAPI, HTTPException
import uvicorn
from models.request_models import ImageRequest, StylistRequest
from models.response_models import AnalysisResponse, StylistResponse, VisualizationRequest, VisualizationResponse
from services.analyzer import analyze_image_with_gemini
from services.stylist import generate_outfit_suggestions
from services.visualizer import create_moodboard, pil_to_base64, generate_lookbook_image

app = FastAPI(title="OOTDverse AI Service")

# ... (root and health endpoints)

@app.post("/visualize", response_model=VisualizationResponse)
async def get_outfit_visualization(request: VisualizationRequest):
    try:
        # 1. Tạo moodboard từ ảnh thật
        items_data = [item.dict() for item in request.items]
        moodboard_img = create_moodboard(items_data)
        img_b64 = pil_to_base64(moodboard_img)
        
        # 2. Sinh ảnh Lookbook từ AI (Ảnh minh họa người mẫu)
        lookbook_url = generate_lookbook_image(
            outfit_name=request.outfit_name,
            items_description=request.description,
            rationale=request.rationale
        )
        
        return {
            "success": True,
            "image_base64": img_b64,
            "lookbook_url": lookbook_url
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Service"}

@app.get("/health")
@app.head("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_wardrobe_item(request: ImageRequest):
    try:
        result = await analyze_image_with_gemini(request.image_base64)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/suggest", response_model=StylistResponse)
async def get_outfit_suggestions(request: StylistRequest):
    try:
        suggestions = await generate_outfit_suggestions(
            style=request.style,
            occasion=request.occasion,
            weather=request.weather,
            wardrobe=[item.dict() for item in request.wardrobe],
            skin_tone=request.skin_tone
        )
        return {
            "success": True,
            "suggestions": suggestions
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    print("[INFO] AI Service is running on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
