# cerridwen Copyright (c) 2014 Leslie P. Polzer <leslie.polzer@gmx.net>
# https://github.com/skypher/cerridwen
from cerridwen.planets import Ascendant, PlanetLongitude
import swisseph as sweph

class _Ascendant(Ascendant):
    def pos(self):
        return str(self.position())

    def houses(self, jd=None):
        if jd is None: jd = self.jd
        results = sweph.houses(jd, self.lat, self.long)[0]
        houses = []
        for i, result in enumerate(results):
            pos = PlanetLongitude(result)
            house_num = i + 1
            data = {
                'house': house_num,
                'position': str(pos),
                'sign': pos.sign
            }
            houses.append(data)
        return houses
