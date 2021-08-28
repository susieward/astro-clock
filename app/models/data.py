from pydantic import BaseModel


class PlanetData(BaseModel):
    name: str
    position: str
    id: int
    sign: str


class AscData(BaseModel):
    name: str
    position: str
    sign: str
    houses: list
