import asyncio

class AsyncTaskManager:
    def __init__(self):
        self.tasks = set()

    def create_task(self, task):
        _task = asyncio.create_task(task)
        self.tasks.add(_task)

    async def cancel_tasks(tasks):
        for task in tasks:
            if task.done():
                continue
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
