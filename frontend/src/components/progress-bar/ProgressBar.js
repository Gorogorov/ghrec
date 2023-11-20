import './ProgressBar.css';

import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';

import { WebSocketContext } from 'context/context';
import { useNotification } from 'hooks/useNotification';
import RecommendationsService from 'axios-services/RecommendationsService';

const recommendationsService = new RecommendationsService();

const ProgressBar = (props) => {
    const socket = useContext(WebSocketContext);
    console.log("pbar");
    console.log(socket);

    console.log(props);
    const { groupName, completed, text } = props;
    const [wsToken, setWsToken] = useState(null);
    const ProgressSocket = useRef(null);
    const {createNotification} = useNotification();
  
    // const URL_WS_HOST = 'localhost:8001';
    // const URL_PATH = `/api/user/groups/${groupName}/recommendations/progress/`;

    // useEffect(() => {
    //     recommendationsService.getWsToken(
    //     ).then((response)=>{
    //         setWsToken(response["token"]);
    //     }).catch((error)=>{
    //         createNotification(JSON.stringify(error), "error");
    //     });
    // }, []);

    // useEffect(() => {
    //     const URL_QUERY = `?token=${wsToken}`;
    //     ProgressSocket.current = new WebSocket((window.location.protocol === 'https:' ? 'wss' : 'ws') + '://' +
    //         URL_WS_HOST + URL_PATH + URL_QUERY);

    //     ProgressSocket.current.onopen = function (event) {
    //         ProgressSocket.current.send(JSON.stringify({'type': 'check_task_completion'}));
    //     };
    // }, [wsToken]);

    // useEffect(() => {
    //     ProgressSocket.current.onmessage = function (event) {
    //         let data;
    //         try {
    //             data = JSON.parse(event.data);
    //         } catch (parsingError) {
    //             createNotification("Websocket json parsing error.", "error");
    //         }
    
    //         console.log(data);
    //         // const complete = bar.onData(data);
    
    //         // if (complete === true || complete === undefined) {
    //         //     ProgressSocket.close();
    //         // }
    //     };
    // }, []);

    const handleUpdateProgress = useCallback((event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (parsingError) {
            createNotification("Websocket json parsing error.", "error");
        }
        console.log(data);
      }, []);


    useEffect(() => {
        // socket.emit("check_task_completion");

        // socket.on("JOIN_REQUEST_ACCEPTED", handleUpdateProrgess); 
    
        // return () => {
        //   socket.off("JOIN_REQUEST_ACCEPTED", handleUpdateProrgess);
        // };
        console.log(`pbar useeffect ${groupName}`);
        console.log(socket);
        if (socket !== null) {
            console.log(`pbar useeffect notnull ${groupName}`);
            socket.onopen = function(event) {
                console.log(`pbar useeffect onopen ${groupName}`);
                socket.send(JSON.stringify({'type': 'group_task_subscribe',
                                            'group_name': groupName,
                }));
                socket.send(JSON.stringify({'type': 'check_task_completion',
                                            'group_name': groupName,
                }));
            }
            socket.onmessage = function(event) {
                console.log(`[message] Данные получены с сервера: ${event.data}`);
                alert(`[message] Данные получены с сервера: ${event.data}`);
            };
        }

      }, [socket, handleUpdateProgress]);


    return (
        <div className="progress-bar-container-wrapper mt-2 mb-2">
            <div className="progress-bar-container">
                <div className="progress-bar-filter" style={{width: `${completed}%`}}>

                </div>
                <span className="progress-bar-label">
                        {text}
                    </span>
            </div>
        </div>
    );
};
  
export default ProgressBar;
  