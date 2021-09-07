# cerridwen Copyright (c) 2014 Leslie P. Polzer <leslie.polzer@gmx.net>
# https://github.com/skypher/cerridwen
from typing import List
from cerridwen.planets import Ascendant, PlanetLongitude
import swisseph as sweph
from app.models.data import HouseData

class _Ascendant(Ascendant):
    def position_str(self) -> str:
        return str(self.position())

    def position_formatted(self):
        values = self.position_str().split(' ')
        degrees = values[0]
        sign = self.sign()
        formatted = f'{degrees}° {sign} {values[2]} {values[3]}'
        return formatted

    def degrees(self):
        pos_list = self.position_str().split(' ')
        return int(pos_list[0])

    def houses(self, jd = None) -> List:
        if jd is None: jd = self.jd
        results = sweph.houses(jd, self.lat, self.long)[0]
        houses = []
        for i, result in enumerate(results):
            pos = PlanetLongitude(result)
            deg = str(pos).split(' ')[0]
            house_num = i + 1
            data = HouseData(number=house_num, position=str(pos), sign=pos.sign, deg=int(deg))
            houses.append(data)
        return houses
