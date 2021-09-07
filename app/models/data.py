from pydantic import BaseModel
from typing import List, Optional

class PlanetData(BaseModel):
    name: str
    position: str
    position_formatted: Optional[str] = None
    id: int
    sign: str
    deg: int
    phase: Optional[str] = None
    dignity: Optional[str] = None


class HouseData(BaseModel):
    number: int
    position: str
    sign: str
    deg: int


class AscData(BaseModel):
    name: str
    position: str
    position_formatted: str
    sign: str
    houses: List[HouseData]
    deg: int
