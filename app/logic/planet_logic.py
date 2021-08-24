from app.models._planet import _Planet, planet_subclasses
from app.utils import create_metaclasses
from app.logic.ascendant_logic import AscendantLogic
from cerridwen.utils import iso2jd

class PlanetLogic:
    def __init__(self):
        self.planet_classes = create_metaclasses(_Planet, planet_subclasses)
        self.asc_logic = AscendantLogic()

    def get_planets(self, date = None):
        try:
            planets = self.init_planets(date)
            data = [self.build_planet_data(p) for p in planets]
            return data
        except Exception as e:
            raise e

    def get_planets_and_ascendant(self, data):
        try:
            date = data.get('date')
            asc = self.asc_logic.get_ascendant(data)
            planets = self.init_planets(date)
            results = [self.build_planet_data(p) for p in planets]
            return [asc, *results]
        except Exception as e:
            raise e

    def init_planets(self, date = None):
        if date is not None: date = iso2jd(date)
        return [planet.__call__(planet_id=i, jd=date) for i, planet in enumerate(self.planet_classes)]

    def get_planet(self, id, date = None):
        if date is not None: date = iso2jd(date)
        try:
            planet = self.planet_classes[id].__call__(planet_id=id, jd=date)
            return self.build_planet_data(planet)
        except IndexError:
            return None
        except Exception as e:
            raise e

    def build_planet_data(self, planet):
        return {
            'name': planet.name(),
            'position': planet.pos(),
            'id': planet.id,
            'sign': planet.sign()
        }
