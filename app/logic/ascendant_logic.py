from app.models._ascendant import _Ascendant
from cerridwen.utils import iso2jd

class AscendantLogic:
    ascendant_class = _Ascendant

    def get_ascendant(self, data):
        try:
            long = data.get('long')
            lat = data.get('lat')
            date = data.get('date') or None

            asc = self.init_asc(long, lat, date)
            data = self.build_asc_data(asc)
            return data
        except Exception as e:
            raise e

    def init_asc(self, long, lat, date = None):
        if date is not None: date = iso2jd(date)
        return self.ascendant_class.__call__(long=long, lat=lat, jd=date)

    def build_asc_data(self, asc):
        return {
            'name': asc.name(),
            'position': asc.pos(),
            'sign': asc.sign(),
            'houses': asc.houses()
        }
