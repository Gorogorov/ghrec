import './GroupItem.css'

import React, { memo } from 'react';
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';

import { removeGroup, updateGroup } from 'redux/groupsSlice'
import {useNotification} from 'hooks/useNotification';
import RecommendationsService from 'axios-services/RecommendationsService';

const recommendationsService = new RecommendationsService();

const groupRepColorPalette = ["rgba(22, 114, 136, 0.3)", "rgba(140, 218, 236, 0.3)",
                              "rgba(180, 82, 72, 0.3)", "rgba(212, 140, 132, 0.3)",
                              "rgba(168, 154, 73, 0.3)", "rgba(214, 207, 162, 0.3)",
                              "rgba(60, 180, 100, 0.3)", "rgba(155, 221, 177, 0.3)",
                              "rgba(88, 12, 31, 0.3)", "rgba(131, 99, 148, 0.3)"];

const GroupItem = memo(function GroupItem(props) {
    const {createNotification} = useNotification();
    const dispatch = useDispatch();

    function handleRunRecommendations(event) {
        recommendationsService.computeRecommendations(props.groupName      
        ).then(()=>{
            createNotification(`Group ${props.groupName} in processing`, "success");
            dispatch(updateGroup({id: props.groupName,
                changes: {recommendations_status: "P"}
            }));
        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
        event.preventDefault();
    }

    function handleRemoveGroup(event) {
        recommendationsService.deleteUserGroup(
            props.groupName
        ).then((result)=>{
            dispatch(removeGroup(props.groupName));
        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
    }

    function handleRemoveGroupRepository(event, repository) {
        let updatedGroupRepositories = [...props.groupRepositories];
        const indexForRemove = updatedGroupRepositories.indexOf(repository);
        if (indexForRemove > -1) {
            updatedGroupRepositories.splice(indexForRemove, 1);
        }
        let updatedGroupRepositoriesUrl = updatedGroupRepositories.map((rep) => rep["url"]);
        recommendationsService.updateUserGroup(
            props.groupName, {
                "name": props.groupName,
                "repositories_url": updatedGroupRepositoriesUrl,
        }
        ).then((result)=>{
            dispatch(updateGroup({id: props.groupName,
                                  changes: {repositories: updatedGroupRepositories}
            }));
        }).catch((error)=>{
            createNotification(JSON.stringify(error), "error");
        });
    }

    return (
        <form onSubmit={handleRunRecommendations}>
        <div className="card group-item mb-1 border border-2 w-100">
            <div className="card-header group-item-header d-flex justify-content-between">
                <h5 className="group-item-title">
                    {props.groupName}
                </h5>
                <div className="group-item-remove">
                    <button type="button"
                            className="group-remove-btn btn btn-close shadow-none"
                            aria-label="Close"
                            onClick={handleRemoveGroup}>        
                    </button>
                </div>
            </div>
            <div className="card-body group-item-repositories d-flex flex-wrap">
                {props.groupRepositories.map((rep, repIndex) => (
                    <div key={props.groupName + rep.url} className="group-item-repository mb-1 mx-1">
                        <div className="group-item-repository-fitted px-1" 
                             style={{backgroundColor: groupRepColorPalette[repIndex % groupRepColorPalette.length]}}>
                            <a href={rep.url} className="link-dark group-rep-link" target="_blank">
                                {rep.name}
                            </a>
                            <button type="button"
                                    className="rep-remove-btn btn btn-close shadow-none ms-1"
                                    aria-label="Close"
                                    onClick={(event) => handleRemoveGroupRepository(event, rep)}></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="d-flex card-footer group-item-actions">
                {props.recStatus === "N" ?
                    <input className="run-recs-btn btn btn-primary btn-sm btn-dark"
                           type="submit" 
                           value="Compute recommendations"/>
                : null}
                {props.recStatus === "P" ?
                    <span className="proc-rec-container">Processing</span>
                : null}
                {props.recStatus === "C" ?
                    <Link to={"/home/recommendations/"+props.groupName+"/"} 
                          className="show-recs-link btn btn-primary btn-sm btn-dark">
                        Show recommendations
                    </Link>
                : null}
            </div>
        </div>
        </form>
    )
})

export default GroupItem;