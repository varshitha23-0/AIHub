from pydantic import BaseModel
from typing import List, Optional


class ToolCreate(BaseModel):

    tool_name: str
    category: str
    description: str
    website: str

    company: Optional[str] = ""
    logo: Optional[str] = ""

    keywords: List[str] = []

    primary_task: Optional[str] = ""

    country: Optional[str] = ""

    industry: Optional[str] = ""

    year_founded: Optional[int] = None

    release_year: Optional[int] = None

    open_source: bool = False

    api_available: bool = False

    stars: float = 0

    featured: bool = False