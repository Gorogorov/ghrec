import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from celery.result import AsyncResult
from celery_progress.backend import Progress
from channels.db import database_sync_to_async

from recommendations.models import GHRepositoryGroup, GHUser


logger = logging.getLogger(__name__)


@database_sync_to_async
def get_task_id(user_id, group_name):
    if group_name is None:
        raise ValueError("Specify group name.")

    try:
        ghuser = GHUser.objects.get(pk=user_id)
        ghgroup = GHRepositoryGroup.objects.get(user=ghuser,
                                            name=group_name)
    except GHRepositoryGroup.DoesNotExist:
        raise ValueError("Requested group does not exist.")
    except GHUser.DoesNotExist:
        raise ValueError("Requested user does not exist")

    return ghgroup.get_recs_task_id


class ProgressConsumer(AsyncWebsocketConsumer):
    # async def connect(self):
    #     await self.accept()
    #     if not self.scope["user"].is_authenticated:
    #         await self.send(json.dumps({"error": "Authentication is required."}))
    #         await self.close(code=4000)
    #     else:
    #         self.group_name = self.scope["url_route"]["kwargs"]["group_name"]
    #         self.user_id = self.scope["user"].id
    #         self.task_id = await get_task_id(self.user_id, self.group_name)
    #         if self.task_id is None:
    #             await self.send(json.dumps({"error": "Requested group does not exist."}))
    #             await self.close(code=4001)
    #         else:
    #             self.task_id = str(self.task_id)
    #             await self.channel_layer.group_add(
    #                 self.task_id,
    #                 self.channel_name
    #             )

    async def connect(self):
        await self.accept()
        if not self.scope["user"].is_authenticated:
            print("alllo blyat")
            await self.send(json.dumps({"error": "Authentication is required."}))
            await self.close(code=4000)
        # else:
            # self.group_name = self.scope["url_route"]["kwargs"]["group_name"]
            # self.user_id = self.scope["user"].id
            # self.task_id = await get_task_id(self.user_id, self.group_name)
            # if self.task_id is None:
            #     await self.send(json.dumps({"error": "Requested group does not exist."}))
            #     await self.close(code=4001)
            # else:
            #     self.task_id = str(self.task_id)
            #     await self.channel_layer.group_add(
            #         self.task_id,
            #         self.channel_name
            #     )

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
                raise ValueError("Specify message type.")

            if task_type == "group_task_subscribe":
                task_id = await get_task_id(self.scope["user"].id, msg_json["group_name"])
                task_id = str(task_id)

                await self.channel_layer.group_add(
                    task_id,
                    self.channel_name
                )

            if task_type == "check_task_completion":
                task_id = await get_task_id(self.scope["user"].id, msg_json["group_name"])
                task_id = str(task_id)
                group_task_data = Progress(AsyncResult(task_id)).get_info()
                group_task_data["group_name"] = msg_json["group_name"]
                group_task_data["type"] = "update_task_progress"

                await self.channel_layer.group_send(
                    task_id,
                    {
                        "type": "update_task_progress",
                        "data": group_task_data
                    }
                )

        except ValueError as err:
            await self.send(json.dumps({"error": err}))

    async def update_task_progress(self, event):
        data = event['data']
        data["type"] = "update_task_progress"

        await self.send(text_data=json.dumps(data))