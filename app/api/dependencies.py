from fastapi import Depends
from app.logic.planet_logic import PlanetLogic

def planet_logic_dependency():
    return PlanetLogic()
