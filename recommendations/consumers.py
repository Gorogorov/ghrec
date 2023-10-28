import json

from channels.generic.websocket import AsyncWebsocketConsumer
from celery.result import AsyncResult
from celery_progress.backend import Progress
from channels.db import database_sync_to_async

from recommendations.models import GHRepositoryGroup, GHUser


@database_sync_to_async
def get_task_id(user_id, group_name):
    try:
        ghuser = GHUser.objects.get(pk=user_id)
        ghgroup = GHRepositoryGroup.objects.get(user=ghuser,
                                            name=group_name)
    except (GHUser.DoesNotExist, GHRepositoryGroup.DoesNotExist):
        return None
    return ghgroup.get_recs_task_id


class ProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        if not self.scope["user"].is_authenticated:
            await self.send(json.dumps({"error": "Authentication is required."}))
            await self.close(code=4000)
        else:
            self.group_name = self.scope["url_route"]["kwargs"]["group_name"]
            self.user_id = self.scope["user"].id
            self.task_id = await get_task_id(self.user_id, self.group_name)
            if self.task_id is None:
                await self.send(json.dumps({"error": "Requested group does not exist."}))
                await self.close(code=4001)
            else:
                self.task_id = str(self.task_id)
                await self.channel_layer.group_add(
                    self.task_id,
                    self.channel_name
                )

    # async def disconnect(self, close_code):
    #     await self.channel_layer.group_discard(
    #         self.task_id,
    #         self.channel_name
    #     )

    async def receive(self, text_data):
        try:
            msg_json = json.loads(text_data)
            task_type = msg_json["type"]
            if task_type is None:
                raise ValueError
            if task_type == "check_task_completion":
                await self.channel_layer.group_send(
                    self.task_id,
                    {
                        "type": "update_task_progress",
                        "data": Progress(AsyncResult(self.task_id)).get_info()
                    }
                )
        except ValueError:
            await self.send(json.dumps({"error": "Bad request json."}))

    async def update_task_progress(self, event):
        data = event['data']

        await self.send(text_data=json.dumps(data))