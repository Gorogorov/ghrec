import './RepositoryItem.css'

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateGroup } from 'redux/groupsSlice'
import RecommendationsService from 'axios-services/RecommendationsService';
import {useNotification} from 'hooks/useNotification';

const recommendationsService = new RecommendationsService();

function RepositoryItem(props) {
    const [selectedGroupOption, setSelectedGroupOption] = useState('');
    const {createNotification} = useNotification();
    const dispatch = useDispatch();

    const selectedGroupRepositories = useSelector(state => {
                                            if (selectedGroupOption !== "") {
                                                // return groupsSelectors.selectById({id: selectedGroupOption})
                                                return state.groups.entities[selectedGroupOption]["repositories"];
                                            }
                                            else {
                                                return null;
                                            }});
    

    function handleAddRepToGroup(event) {
        if (selectedGroupOption !== "") {
            let newGroupRepository = {"name": props.title, "url": props.url};
            let updatedGroupRepositories = [...selectedGroupRepositories, newGroupRepository];
            let updatedGroupRepositoriesUrl = updatedGroupRepositories.map((rep) => rep["url"]);
            recommendationsService.updateUserGroup(
                selectedGroupOption, {
                    "name": selectedGroupOption,
                    "repositories_url": updatedGroupRepositoriesUrl,
            }
            ).then((result)=>{
                dispatch(updateGroup({id: selectedGroupOption,
                    changes: {repositories: updatedGroupRepositories}
                }));
                setSelectedGroupOption("");
            }).catch((error)=>{
                createNotification(JSON.stringify(error), "error");
            });
        }
        event.preventDefault();
    }

    return (
        <form onSubmit={handleAddRepToGroup}>
        <div className="card mb-1 border border-2 w-100">
            <div className="card-header d-flex justify-content-between">
                <h5 className="card-title">
                    <a href={props.url} className="link-dark" target="_blank">
                        {props.title}
                    </a>
                </h5>
                <div className="card-stars">
                    <svg fill="#e3e30f" aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
                    </svg>
                    <small>{props.stars}</small>
                </div>
            </div>
            <div className="card-body">
                <p className="card-text">{props.description}</p>
            </div>
            <div className="d-flex card-footer">
                <select className="repository-group-form form-control form-control-sm me-3"
                        aria-label="Default select example"
                        value={selectedGroupOption}
                        onChange={e => setSelectedGroupOption(e.target.value)}>
                    <option key="default-hidden" value="" hidden>Add to group</option>
                    {props.groupOptions.map(gOpt => (
                        <option key={gOpt} value={gOpt}>
                        {gOpt}
                        </option>
                    ))}
                </select>
                <input className="btn btn-primary btn-sm btn-dark ml-2" type="submit" value="Add" />
            </div>
        </div>
        </form>
    )
}
export default RepositoryItem;