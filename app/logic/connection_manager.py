import asyncio

class ConnectionManager:
    def __init__(self, websocket, get_data, client_id):
        self.websocket = websocket
        self._get_data = get_data
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

    async def receive_data(self):
        async for message in self.websocket.iter_text():
            await self.handle_messages(message)

    async def handle_messages(self, message):
        try:
            if message == 'requesting data':
                data = self._get_data()
                return await self.websocket.send_json(data)
        except Exception as e:
            raise e
