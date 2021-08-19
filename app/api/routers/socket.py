from fastapi import APIRouter, WebSocket, Depends
from app.api.dependencies import planet_logic_dependency
from app.logic.connection_manager import ConnectionManager

router = APIRouter()

@router.websocket("/ws/{client_id}")
async def socket(websocket: WebSocket, client_id, planet_logic=Depends(planet_logic_dependency)):
    async with ConnectionManager(websocket, planet_logic.get_planets, client_id) as connection:
        await connection.receive_data()
