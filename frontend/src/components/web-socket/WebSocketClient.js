import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import RecommendationsService from 'axios-services/RecommendationsService';
import { useNotification } from 'hooks/useNotification';
import { wsGroupsSelectors,
         addOrUpdateGroupProgress } from 'redux/webSocketInfoSlice'
import { updateGroup, selectProcessingIds } from 'redux/groupsSlice'

const recommendationsService = new RecommendationsService();


function WebSocketClient(props){
    let socket = useRef(null);
    let socketIsOpen = useRef(false);
    const [socketRerender, setSocketRerender] = useState(0);
    const {createNotification} = useNotification();
    const dispatch = useDispatch();

    const wsInfoIds = useSelector(wsGroupsSelectors.selectIds);
    const processingIds = useSelector(selectProcessingIds);

    useEffect(()=>{
        recommendationsService.getWsToken(
        ).then((response)=>{
            const URL_QUERY = `?token=${response["token"]}`;
            const URL_WS_HOST = 'localhost:8001';
            const URL_WS_PATH = `/api/ws/`;
            const URL_WS = (window.location.protocol === 
                'https:' ? 'wss' : 'ws') + '://' +
                URL_WS_HOST + URL_WS_PATH + URL_QUERY;

            socket.current = new WebSocket(URL_WS);

            socket.current.onopen = function(event) {
                // add group progress to web socket info
                socketIsOpen.current = true;
                setSocketRerender(1);
            };

            socket.current.onmessage = function(event) {
                const eventData = JSON.parse(event.data);
                if (eventData === null) {
                    createNotification(JSON.stringify({"error": 
                                                    "WebSocket message is none"}), 
                                        "error"
                    );
                }
                if (eventData.type === null) {
                    createNotification(JSON.stringify({"error": 
                                                    "WebSocket message does not have type"}), 
                                        "error"
                    );
                }
                else if (eventData.type === "update_task_progress") {
                    const groupName = eventData.group_name;
                    const { complete, success } = eventData;
                    const { total, current, percent } = eventData.progress;
                    const taskState = { name: groupName,
                                    taskComplete: complete,
                                    taskSuccess: success,
                                    taskTotal: total,
                                    taskCurrent: current,
                                    taskPercent: percent,
                    };
                    dispatch(addOrUpdateGroupProgress(taskState));
                    if (percent === 100) {
                        dispatch(updateGroup({id: groupName,
                            changes: {recommendations_status: "C"}
                        }));
                    }
                }
            };

        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
    }, [])

    useEffect(()=> {
        if (socketIsOpen.current === true) {
            for (var i = 0; i < processingIds.length; i++) {
                const groupName = processingIds[i];
                if (wsInfoIds.includes(groupName)) {
                    continue;
                }

                socket.current.send(JSON.stringify({'type': 'group_task_subscribe',
                                            'group_name': groupName,
                }));
                socket.current.send(JSON.stringify({'type': 'check_task_completion',
                                            'group_name': groupName,
                }));
            }
        }
    }, [socketIsOpen, socketRerender, processingIds])

    return(
        <>
        </>
    )
};

export default WebSocketClient;