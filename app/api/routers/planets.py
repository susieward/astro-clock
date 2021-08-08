from fastapi import APIRouter, Request, HTTPException, WebSocket
from app.logic.planet_logic import PlanetLogic

router = APIRouter()
planet_logic = PlanetLogic()

def error_handler(func):
    def with_detail(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f'{str(e)}')
    return with_detail


@error_handler
@router.get('/planets')
async def get_planets():
    return planet_logic.get_planets()


@error_handler
@router.post('/planets')
async def get_planets_from_dates(request: Request):
    data = await request.body()
    start = data.get('start')
    end = data.get('end') or None
    return planet_logic.get_planets()


@error_handler
@router.get('/planet/{id}')
async def get_planet(id):
    return planet_logic.get_planet(int(id))
