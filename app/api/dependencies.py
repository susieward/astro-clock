from typing import List
from fastapi import Depends
from cerridwen.planets import (Sun, Moon, Mercury, Mars, Venus, Jupiter, Saturn, Uranus, Neptune, Pluto)
from app.logic.planet import PlanetLogic
from app.logic.ascendant import AscendantLogic
from app.models.planet import Planet
from app.utils import create_metaclasses

def get_planet_classes() -> List:
    planet_subclasses = [
        Sun, Moon, Mercury, Mars, Venus, Jupiter,
        Saturn, Uranus, Neptune, Pluto
    ]
    planet_classes = create_metaclasses(Planet, planet_subclasses)
    return planet_classes


def asc_logic_dependency() -> AscendantLogic:
    return AscendantLogic()


def planet_logic_dependency(
    planet_classes = Depends(get_planet_classes),
    asc_logic: AscendantLogic = Depends(asc_logic_dependency)
) -> PlanetLogic:
    return PlanetLogic(planet_classes=planet_classes, asc_logic=asc_logic)
