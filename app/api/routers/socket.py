from fastapi import APIRouter, WebSocket, Depends

from app.api.dependencies import planet_logic_dependency, asc_logic_dependency
from app.logic.connection_manager import ConnectionManager
from app.logic.planet_logic import PlanetLogic
from app.api.exceptions import PlanetLogicException

router = APIRouter()

@router.websocket("/ws/{client_id}")
async def socket(
    websocket: WebSocket,
    client_id: str,
    planet_logic: PlanetLogic = Depends(planet_logic_dependency)
):
    on_receive = planet_logic.get_planets
    data_exc = PlanetLogicException

    async with ConnectionManager(websocket, on_receive, data_exc) as connection:
        await connection.receive_json()
