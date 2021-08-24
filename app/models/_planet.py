# cerridwen Copyright (c) 2014 Leslie P. Polzer <leslie.polzer@gmx.net>
# https://github.com/skypher/cerridwen

from cerridwen.planets import (
    Planet,
    Sun,
    Moon,
    Mercury,
    Mars,
    Venus,
    Jupiter,
    Saturn,
    Uranus,
    Neptune,
    Pluto
)
planet_subclasses = [
    Sun, Moon, Mercury, Mars, Venus, Jupiter,
    Saturn, Uranus, Neptune, Pluto
]

class _Planet(Planet):
    def longitude(self, jd=None):
        if jd is None: jd = self.jd
        long = super().longitude(jd)
        return long[0]

    def latitude(self, jd=None):
        if jd is None: jd = self.jd
        lat = super().latitude(jd)
        return lat[1]

    def pos(self):
        return str(self.position())
