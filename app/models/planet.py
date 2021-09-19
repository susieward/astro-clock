# cerridwen Copyright (c) 2014 Leslie P. Polzer <leslie.polzer@gmx.net>
# https://github.com/skypher/cerridwen
from cerridwen.planets import Planet as PlanetBase
from app.utils import glyphs

class Planet(PlanetBase):
    def longitude(self, jd = None):
        if jd is None: jd = self.jd
        long = super().longitude(jd)
        return long[0]

    def latitude(self, jd = None):
        if jd is None: jd = self.jd
        lat = super().latitude(jd)
        return lat[1]

    def angle(self, planet, jd = None):
        if jd is None: jd = self.jd
        planet_long = planet.longitude(jd)
        angle = (self.longitude(jd) - planet_long[0]) % 360
        return round(angle)

    def position_str(self):
        return str(self.position())

    def position_formatted(self):
        values = self.position_str().split(' ')
        degrees = values[0]
        #sign = self.sign()
        formatted = f'{degrees}° {values[1]} {values[2]} {values[3]}'
        return formatted

    def degrees(self):
        values = self.position_str().split(' ')
        return int(values[0])
