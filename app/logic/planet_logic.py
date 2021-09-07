from typing import Dict, List
from cerridwen.utils import iso2jd

from app.api.exceptions import PlanetLogicException
from app.logic.ascendant_logic import AscendantLogic
from app.models.data import PlanetData


class PlanetLogic:
    def __init__(self, planet_classes, asc_logic: AscendantLogic) -> None:
        self._planet_classes = planet_classes
        self._asc_logic = asc_logic

    def get_planets(self, data: Dict) -> List:
        try:
            date = data.get('date') or None
            long = data.get('long') or None
            lat = data.get('lat') or None

            if date is not None:
                date = iso2jd(date)

            planets = self.init_planets(date)
            results = [self.get_planet_data(planet, jd=date) for planet in planets]

            if long and lat:
                asc = self._asc_logic.get_ascendant(data)
                return [asc, *results]

            return results
        except Exception as e:
            raise PlanetLogicException(message='PlanetLogic error', exc=e)

    def init_planets(self, date) -> List:
        planets = [self._planet_classes[i].__call__(planet_id=i, jd=date) for i, planet in enumerate(self._planet_classes)]
        return planets

    def get_planet_data(self, planet, jd) -> PlanetData:
        name = planet.name()
        position = planet.position_str()
        position_formatted = planet.position_formatted()
        id = planet.id
        sign = planet.sign()
        deg = planet.degrees()
        phase_val = None
        dignity = None

        if 'dignity' in planet.__class__.__dict__.keys():
            dignity = planet.dignity(jd=jd)

        if name == 'Moon':
            current_phase = planet.phase(jd=jd)
            trend, shape, quarter, quarter_english = current_phase
            phase_val = f'{trend} {shape}'

            if quarter_english is not None:
                phase_val = f'{phase_val} {quarter_english}'

        planet_data = PlanetData(
            name=name,
            position=position,
            position_formatted=position_formatted,
            id=id,
            sign=sign,
            deg=deg,
            phase=phase_val,
            dignity=dignity
        )
        return planet_data
