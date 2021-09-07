from cerridwen.utils import iso2jd
from app.models._ascendant import _Ascendant
from app.models.data import AscData
from app.api.exceptions import AscendantLogicException

class AscendantLogic:
    ascendant_class = _Ascendant

    def get_ascendant(self, data) -> AscData:
        try:
            long = data.get('long')
            lat = data.get('lat')
            date = data.get('date') or None

            asc = self.init_asc(long, lat, date)
            data = self.build_asc_data(asc)
            return data
        except Exception as e:
            raise AscendantLogicException(message='AscLogic error', exc=e)

    def init_asc(self, long, lat, date = None) -> _Ascendant:
        if date is not None: date = iso2jd(date)
        return self.ascendant_class.__call__(long=long, lat=lat, jd=date)

    def build_asc_data(self, asc) -> AscData:
        asc_dict = {
            'name': asc.name(),
            'position': asc.position_str(),
            'position_formatted': asc.position_formatted(),
            'sign': asc.sign(),
            'houses': asc.houses(),
            'deg': asc.degrees()
        }
        return AscData(**asc_dict)
