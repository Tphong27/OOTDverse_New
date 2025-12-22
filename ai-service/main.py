from fastapi import FastAPI, HTTPException
import uvicorn
from models.request_models import ImageRequest
from models.response_models import AnalysisResponse
from services.analyzer import analyze_image_with_gemini

app = FastAPI(title="OOTDverse AI Service")

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
        result = await analyze_image_with_gemini(request.image_base_base64 if hasattr(request, 'image_base_base64') else request.image_base64)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    print("[INFO] AI Service is running on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
