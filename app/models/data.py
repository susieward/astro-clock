from pydantic import BaseModel
from typing import List, Optional

class Data(BaseModel):
    name: str
    position: str
    position_formatted: Optional[str] = None
    sign: str
    deg: int
    label: str
    label_sm: Optional[str] = None


class PlanetData(Data):
    id: int
    phase: Optional[str] = None
    dignity: Optional[str] = None


class HouseData(Data):
    number: int


class AscData(Data):
    houses: List[HouseData]
