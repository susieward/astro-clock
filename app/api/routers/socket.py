from fastapi import APIRouter, WebSocket
from app.logic.planet_logic import PlanetLogic
from app.logic.connection_manager import ConnectionManager

router = APIRouter()
planet_logic = PlanetLogic()

def get_planets():
    return planet_logic.get_planets()

@router.websocket("/ws/{client_id}")
async def socket(websocket: WebSocket, client_id):
    async with ConnectionManager(websocket, get_planets, client_id) as connection:
        await connection.send_data()
