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
