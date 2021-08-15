import asyncio

class ConnectionManager:
    def __init__(self, websocket, data_source, client_id):
        self.websocket = websocket
        self._get_data = data_source
        self.client_id = client_id

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

    async def send_data(self):
        async for data in self.get_data():
            await self._send(self.websocket, data)

    async def _send(self, websocket, data):
        return await websocket.send_json(data)

    async def get_data(self):
        try:
            while True:
                yield self._get_data()
                await asyncio.sleep(1)
        except Exception as e:
            print(e)
            pass
