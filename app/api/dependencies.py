from app.logic.planet_logic import PlanetLogic
from app.logic.ascendant_logic import AscendantLogic

def planet_logic_dependency():
    return PlanetLogic()


def asc_logic_dependency():
    return AscendantLogic()
