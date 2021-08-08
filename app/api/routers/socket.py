from fastapi import APIRouter, WebSocket
from app.logic.planet_logic import PlanetLogic
from app.logic.connection_manager import ConnectionManager

router = APIRouter()
planet_logic = PlanetLogic()

async def send_data(websocket):
    data = planet_logic.get_planets()
    return await websocket.send_json(data)


@router.websocket("/ws/{client_id}")
async def socket(websocket: WebSocket, client_id):
    async with ConnectionManager(websocket, send_data, client_id) as connection:
        await connection.receive_data()
