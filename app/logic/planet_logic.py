from typing import Dict
from cerridwen.utils import iso2jd

from app.api.exceptions import PlanetLogicException
from app.logic.ascendant_logic import AscendantLogic
from app.models.data import PlanetData


class PlanetLogic:
    def __init__(self, planet_classes, asc_logic: AscendantLogic):
        self._planet_classes = planet_classes
        self._asc_logic = asc_logic

    def get_planets(self, data: Dict):
        try:
            date = data.get('date') or None
            long = data.get('long') or None
            lat = data.get('lat') or None
            planets = self.init_planets(date)
            results = [self.build_planet_data(p) for p in planets]

            if long and lat:
                asc = self._asc_logic.get_ascendant(data)
                return [asc, *results]

            return results
        except Exception as e:
            raise PlanetLogicException(message='PlanetLogic error', exc=e)

    def init_planets(self, date = None):
        if date is not None: date = iso2jd(date)
        return [planet.__call__(planet_id=i, jd=date) for i, planet in enumerate(self._planet_classes)]

    def get_planet(self, id, date = None):
        if date is not None: date = iso2jd(date)
        try:
            planet = self._planet_classes[id].__call__(planet_id=id, jd=date)
            return self.build_planet_data(planet)
        except IndexError:
            return None
        except Exception as e:
            raise PlanetLogicException(message='PlanetLogic error', exc=e)

    def build_planet_data(self, planet):
        planet_dict = {
            'name': planet.name(),
            'position': planet.pos(),
            'id': planet.id,
            'sign': planet.sign()
        }
        return PlanetData(**planet_dict)
