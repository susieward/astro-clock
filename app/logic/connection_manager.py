
class ConnectionManager:
    def __init__(self, websocket, on_receive, client_id):
        self.websocket = websocket
        self.on_receive = on_receive
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
            await self.on_receive(self.websocket)
