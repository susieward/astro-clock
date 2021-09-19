# cerridwen Copyright (c) 2014 Leslie P. Polzer <leslie.polzer@gmx.net>
# https://github.com/skypher/cerridwen
from typing import List
from cerridwen.planets import Ascendant as AscendantBase, PlanetLongitude
import swisseph as sweph
from app.models.data import HouseData
from app.utils import roman_nums

class Ascendant(AscendantBase):
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
            pos_arr = str(pos).split(' ')
            position = f'{pos_arr[0]}°{pos_arr[2]}'
            deg = int(pos_arr[0])
            house_num = i + 1
            roman_num = roman_nums[i]
            name = f'House {roman_num}'
            data = HouseData(
                name=name,
                number=house_num,
                label=roman_num,
                position=position,
                sign=pos.sign,
                deg=deg
            )
            houses.append(data)
        return houses
