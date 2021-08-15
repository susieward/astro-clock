from app.models._planet import _Planet, planet_subclasses
from app.utils import create_metaclasses

class PlanetLogic:
    def __init__(self):
        self.planet_classes = create_planet_metaclasses()

    def get_planets(self):
        try:
            planets = self.init_planets()
            data = [self.build_planet_data(p) for p in planets]
            return data
        except Exception as e:
            raise e

    def init_planets(self):
        return [planet.__call__(planet_id=i) for i, planet in enumerate(self.planet_classes)]

    def get_planet(self, id):
        try:
            planet = self.planet_classes[id].__call__(planet_id=id)
            return self.build_planet_data(planet)
        except IndexError:
            return None

    def build_planet_data(self, planet):
        return {
            'name': planet.name(),
            'position': planet.pos(),
            'id': getattr(planet, 'id'),
            'sign': planet.sign()
        }

def create_planet_metaclasses():
    return create_metaclasses(_Planet, planet_subclasses)
