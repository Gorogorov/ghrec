import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import { groupsSelectors, addGroup, addGroups, removeGroup, updateGroup } from './groupsSlice'
import {showCreateGroupForm, hideCreateGroupForm, reverseCreateGroupForm} from './createGroupSlice'
import { useNotification } from './Notifications/useNotification';
import './GroupCreate.css'
import CustomersService from './RecommendationsService';

const customersService = new CustomersService();

function GroupCreate(props) {
    const [groupName, setGroupName] = useState("");
    const {createNotification} = useNotification();
    const dispatch = useDispatch();
    
    function handleAddGroup(event) {
        customersService.createUserGroup({
            "name": groupName,
            "repositories_url": [],
        }).then((result)=>{
            dispatch(addGroup({name: groupName,
                               repositories: [],
                               created_at: result.data.created_at,
                               is_recommendations_calculated: false
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
