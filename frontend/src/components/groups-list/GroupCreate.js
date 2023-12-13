import './GroupCreate.css'

import React, { useState } from 'react';
import { useDispatch } from 'react-redux'

import { addGroup } from 'redux/groupsSlice'
import { hideCreateGroupForm } from 'redux/createGroupSlice'
import { useNotification } from 'hooks/useNotification';
import RecommendationsService from 'axios-services/RecommendationsService';

const recommendationsService = new RecommendationsService();

function GroupCreate(props) {
    const [groupName, setGroupName] = useState("");
    const {createNotification} = useNotification();
    const dispatch = useDispatch();
    
    function handleAddGroup(event) {
        recommendationsService.createUserGroup({
            "name": groupName,
            "repositories_url": [],
        }).then((result)=>{
            dispatch(addGroup({name: groupName,
                               repositories: [],
                               created_at: result.data.created_at,
                               recommendations_status: "N",
                               recs_total: 100,
                               recs_current: 0,
                               recs_perc: 0,
            }));
            dispatch(hideCreateGroupForm());

        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
        event.preventDefault();
    }
    
    return (
        <form className="create-group-form d-flex pb-2 pt-2" onSubmit={handleAddGroup}>
            <div className="create-group-form-name form-floating w-60 ms-3 me-2">
                <input type="text" className="form-control" id="inputGroupName" placeholder="Group name" onChange={event => setGroupName(event.target.value)}/>
                <label htmlFor="inputGroupName">Group name</label>
            </div>
            <input className="btn btn-sm btn-primary btn-dark me-2 "
               type="submit" 
               value="Create"/>
        </form>
    );
}

export default GroupCreate;
