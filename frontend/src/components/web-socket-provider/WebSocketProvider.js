import React, { useState, useEffect } from 'react';

import { WebSocketContext } from "context/context";
import RecommendationsService from 'axios-services/RecommendationsService';
import { useNotification } from 'hooks/useNotification';

const recommendationsService = new RecommendationsService();


const WebSocketProvider = ({children}) =>{
    const [socket, setSocket] = useState(null);
    const {createNotification} = useNotification();
  
    useEffect(()=>{
        recommendationsService.getWsToken(
        ).then((response)=>{
            console.log(response);
            const URL_QUERY = `?token=${response["token"]}`;
            const URL_WS_HOST = 'localhost:8001';
            const URL_WS_PATH = `/api/ws/`;
            const URL_WS = (window.location.protocol === 
                'https:' ? 'wss' : 'ws') + '://' +
                URL_WS_HOST + URL_WS_PATH + URL_QUERY;
    
            const wSocket = new WebSocket(URL_WS);
            console.log("www");
            console.log(wSocket);
            setSocket(wSocket);
        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
    },[])
    
   const { Provider } = WebSocketContext;
   console.log("ready?");
   console.log(socket);
   setTimeout(()=>{console.log(socket);}, 1000);

   return(
       <Provider value={socket}>
           {children}
       </Provider>
   )
}

export default WebSocketProvider;