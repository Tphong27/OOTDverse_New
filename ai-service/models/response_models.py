from pydantic import BaseModel
from typing import List, Optional

class AnalysisResult(BaseModel):
    category: str
    color: List[str]
    season: List[str]
    notes: str
    tags: List[str]

class AnalysisResponse(BaseModel):
    success: bool
    data: Optional[AnalysisResult] = None
    error: Optional[str] = None

class SuggestedOutfit(BaseModel):
    outfit_name: str
    item_ids: List[str]
    description: str
    rationale: str

class StylistResponse(BaseModel):
    success: bool
    suggestions: List[SuggestedOutfit] = []
    error: Optional[str] = None
