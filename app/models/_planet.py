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
planet_subclasses = [Sun, Moon, Mercury, Mars, Venus, Jupiter, Saturn, Uranus, Neptune, Pluto]

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


def create_metaclass(subclass, base_class):
    return type(f'_{subclass.__name__}', (base_class,), {})

def create_planet_metaclasses():
    return [create_metaclass(p, _Planet) for p in planet_subclasses]
