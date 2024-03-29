# credits: https://github.com/czue/celery-progress
import logging
import re
from abc import ABCMeta, abstractmethod
from decimal import Decimal

from celery.result import EagerResult, allow_join_result
from celery.backends.base import DisabledBackend

try:
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer
except ImportError:
    channel_layer = None
else:
    channel_layer = get_channel_layer()


logger = logging.getLogger(__name__)

PROGRESS_STATE = "PROGRESS"


class AbstractProgressRecorder(object):
    __metaclass__ = ABCMeta

    @abstractmethod
    def set_progress(self, current, total, description=""):
        pass


class ConsoleProgressRecorder(AbstractProgressRecorder):
    def set_progress(self, current, total, description=""):
        print("processed {} items of {}. {}".format(current, total, description))


class ProgressRecorder(AbstractProgressRecorder):
    def __init__(self, task, group_name):
        self.task = task
        self.group_name = group_name

    def set_progress(self, current, total, description=""):
        percent = 0
        if total > 0:
            percent = (Decimal(current) / Decimal(total)) * Decimal(100)
            percent = float(round(percent, 2))
        state = PROGRESS_STATE
        meta = {
            "pending": False,
            "current": current,
            "total": total,
            "percent": percent,
            "description": description,
        }
        self.task.update_state(state=state, meta=meta)
        return state, meta


class Progress(object):
    def __init__(self, result):
        """
        result:
            an AsyncResult or an object that mimics it to a degree
        """
        self.result = result

    def get_info(self):
        task_meta = self.result._get_task_meta()
        state = task_meta["status"]
        info = task_meta["result"]
        response = {"state": state}
        if state in ["SUCCESS", "FAILURE"]:
            success = self.result.successful()
            with allow_join_result():
                response.update(
                    {
                        "complete": True,
                        "success": success,
                        "progress": _get_completed_progress(),
                        "result": self.result.get(self.result.id)
                        if success
                        else str(info),
                    }
                )
        elif state in ["RETRY", "REVOKED"]:
            if state == "RETRY":
                # in a retry sceneario, result is the exception, and 'traceback' has the details
                # https://docs.celeryq.dev/en/stable/userguide/tasks.html#retry
                traceback = task_meta.get("traceback")
                seconds_re = re.search("Retry in \d{1,10}s", traceback)
                if seconds_re:
                    next_retry_seconds = int(seconds_re.group()[9:-1])
                else:
                    next_retry_seconds = "Unknown"

                result = {
                    "next_retry_seconds": next_retry_seconds,
                    "message": f"{str(task_meta['result'])[0:50]}...",
                }
            else:
                result = "Task " + str(info)
            response.update(
                {
                    "complete": True,
                    "success": False,
                    "progress": _get_completed_progress(),
                    "result": result,
                }
            )
        elif state == "IGNORED":
            response.update(
                {
                    "complete": True,
                    "success": None,
                    "progress": _get_completed_progress(),
                    "result": str(info),
                }
            )
        elif state == PROGRESS_STATE:
            response.update(
                {
                    "complete": False,
                    "success": None,
                    "progress": info,
                }
            )
        elif state in ["PENDING", "STARTED"]:
            response.update(
                {
                    "complete": False,
                    "success": None,
                    "progress": _get_unknown_progress(state),
                }
            )
        else:
            logger.error(
                "Task %s has unknown state %s with metadata %s",
                self.result.id,
                state,
                info,
            )
            response.update(
                {
                    "complete": True,
                    "success": False,
                    "progress": _get_unknown_progress(state),
                    "result": "Unknown state {}".format(state),
                }
            )
        return response


class KnownResult(EagerResult):
    """Like EagerResult but supports non-ready states."""

    def __init__(self, id, ret_value, state, traceback=None):
        """
        ret_value:
            result, exception, or progress metadata
        """
        # set backend to get state groups (like READY_STATES in ready())
        self.backend = DisabledBackend
        super().__init__(id, ret_value, state, traceback)

    def ready(self):
        return super(EagerResult, self).ready()

    def __del__(self):
        # throws an exception if not overridden
        pass


def _get_completed_progress():
    return {
        "state": "completed",
        "current": 100,
        "total": 100,
        "percent": 100,
    }


def _get_unknown_progress(state):
    return {
        "pending": state == "PENDING",
        "current": 0,
        "total": 100,
        "percent": 0,
    }


async def closing_group_send(channel_layer, channel, message):
    await channel_layer.group_send(channel, message)
    await channel_layer.close_pools()


class WebSocketProgressRecorder(ProgressRecorder):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if not channel_layer:
            logger.warning(
                "Tried to use websocket progress bar, but dependencies were not installed / configured. "
                "Use pip install celery-progress[websockets] and set up channels to enable this feature. "
                "See: https://channels.readthedocs.io/en/latest/ for more details."
            )

    @staticmethod
    def push_update(task_id, data, final=False):
        try:
            async_to_sync(closing_group_send)(
                channel_layer, task_id, {"type": "update_task_progress", "data": data}
            )
        except AttributeError:  # No channel layer to send to, so ignore it
            pass
        except (
            RuntimeError
        ) as e:  # We're sending messages too fast for asgiref to handle, drop it
            if (
                final and channel_layer
            ):  # Send error back to post-run handler for a retry
                raise e

    def set_progress(self, current, total, description=""):
        state, meta = super().set_progress(current, total, description)
        result = KnownResult(self.task.request.id, meta, state)
        data = Progress(result).get_info()
        data["group_name"] = self.group_name
        self.push_update(self.task.request.id, data)
