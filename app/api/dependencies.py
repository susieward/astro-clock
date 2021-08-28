from fastapi import Depends
from app.logic.planet_logic import PlanetLogic
from app.logic.ascendant_logic import AscendantLogic
from app.models._planet import _Planet, planet_subclasses
from app.utils import create_metaclasses


def get_planet_classes():
    planet_classes = create_metaclasses(_Planet, planet_subclasses)
    return planet_classes


def asc_logic_dependency() -> AscendantLogic:
    return AscendantLogic()


def planet_logic_dependency(
    planet_classes = Depends(get_planet_classes),
    asc_logic: AscendantLogic = Depends(asc_logic_dependency)
) -> PlanetLogic:
    return PlanetLogic(planet_classes=planet_classes, asc_logic=asc_logic)
