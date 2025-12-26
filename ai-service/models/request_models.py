from pydantic import BaseModel
from typing import List, Optional

class ImageRequest(BaseModel):
    image_base64: str

class WardrobeItem(BaseModel):
    id: str
    name: str
    category: str
    color: List[str]
    tags: List[str] = []

class StylistPreferences(BaseModel):
    favorite_styles: List[str] = []
    favorite_colors: List[str] = []
    avoid_colors: List[str] = []
    bio: Optional[str] = ""

class StylistRequest(BaseModel):
    style: str
    occasion: str
    weather: str
    skin_tone: Optional[str] = "tự nhiên"
    custom_context: Optional[str] = None  # Mô tả bổ sung từ người dùng
    preferences: Optional[StylistPreferences] = None # Sở thích cá nhân từ profile
    wardrobe: List[WardrobeItem]
