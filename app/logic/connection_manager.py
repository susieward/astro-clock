import sys
import traceback
from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from app.api.exceptions import ConnectionException, PlanetLogicException

class ConnectionManager:
    def __init__(self, websocket: WebSocket, on_receive, data_exc):
        self.websocket = websocket
        self._on_receive = on_receive
        self._data_exc = data_exc

    async def __aenter__(self):
        await self.websocket.accept()
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        print('exit called: ', exc_type, exc_value, traceback)
        try:
            await self.websocket.close()
        except Exception as e:
            print(e)
            pass
        finally:
           return True

    async def receive_json(self):
        async for message in self.websocket.iter_json():
            await self.handle_json(message)

    async def handle_json(self, message):
        try:
            response = self._on_receive(message)
            json = jsonable_encoder(response)
            return await self.websocket.send_json(json)
        except PlanetLogicException as e:
            print(e)
            traceback.print_exc()
            exc_type, exc_value, tb = sys.exc_info()
            data = {
                'error': True,
                'exc_type': str(exc_type),
                'exc_value': str(exc_value),
                'traceback': traceback.format_exc()
            }
            err_json = jsonable_encoder(data)
            return await self.websocket.send_json(err_json)
        except Exception as e:
            raise ConnectionException(message='Connection Error', exc=e)
