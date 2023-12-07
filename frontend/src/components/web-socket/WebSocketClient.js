import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import RecommendationsService from 'axios-services/RecommendationsService';
import { useNotification } from 'hooks/useNotification';
import { wsGroupsSelectors,
         addOrUpdateGroupProgress } from 'redux/webSocketInfoSlice'
import { groupsSelectors } from 'redux/groupsSlice'

const recommendationsService = new RecommendationsService();


function WebSocketClient(props){
    let socket = useRef(null);
    let socketIsOpen = useRef(false);
    const [socketRerender, setSocketRerender] = useState(0);
    const {createNotification} = useNotification();
    const dispatch = useDispatch();

    const userGroups = useSelector(groupsSelectors.selectAll);
    const wsInfo = useSelector(wsGroupsSelectors.selectAll);
    console.log("INFO");
    console.log(wsInfo);


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
                console.log("WebSocket is open");
            };

            socket.current.onmessage = function(event) {
                console.log(wsInfo);
                const eventData = JSON.parse(event.data);
                console.log(event);
                console.log(eventData.type);
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
                    console.log("dispatch update");
                    const groupName = eventData.group_name;
                    const { complete, success } = eventData;
                    const { total, current, percent } = eventData.progress;
                    console.log(eventData);
                    console.log(groupName, total, current, percent);
                    const taskState = { name: groupName,
                                    taskComplete: complete,
                                    taskSuccess: success,
                                    taskTotal: total,
                                    taskCurrent: current,
                                    taskPercent: percent,
                    };
                    dispatch(addOrUpdateGroupProgress(taskState));
                    // if (percent === 100) dispatch rec_status
                    console.log("updddd");
                    console.log(wsInfo);
                }
                // add group progress to web socket info
                console.log(`[message] Данные получены с сервера: ${event.data}`);
            };

        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
    }, [])

    useEffect(()=> {
        if (socketIsOpen.current == true) {
            for (var i = 0; i < userGroups.length; i++) {
                const group = userGroups[i];
                console.log("subscribe ", group.name)
                socket.current.send(JSON.stringify({'type': 'group_task_subscribe',
                                            'group_name': group.name,
                }));
                socket.current.send(JSON.stringify({'type': 'check_task_completion',
                                            'group_name': group.name,
                }));
            }
        }
    }, [socketIsOpen, socketRerender, userGroups])

    return(
        <>
        </>
    )
};

export default WebSocketClient;