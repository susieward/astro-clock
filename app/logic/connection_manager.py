from fastapi import WebSocket

class ConnectionManager:
    def __init__(self, websocket: WebSocket, on_receive, client_id):
        self.websocket = websocket
        self._on_receive = on_receive
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

    async def receive_json(self):
        async for message in self.websocket.iter_json():
            await self.handle_json(message)

    async def handle_json(self, message):
        try:
            response = self._on_receive(message)
            return await self.websocket.send_json(response)
        except Exception as e:
            raise e

    async def receive_messages(self):
        async for message in self.websocket.iter_text():
            await self.handle_messages(message)

    async def handle_messages(self, message):
        try:
            payload = None
            if message != 'requesting data':
                payload = message
            response = self._on_receive(payload)
            return await self.websocket.send_json(response)
        except Exception as e:
            raise e
