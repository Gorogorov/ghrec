import './GroupsList.css'

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import { groupsSelectors, addGroups } from 'redux/groupsSlice'
import { reverseCreateGroupForm} from 'redux/createGroupSlice'
import RecommendationsService from 'axios-services/RecommendationsService';
import GroupItem from './GroupItem';
import GroupCreate from './GroupCreate';
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner';

const recommendationsService = new RecommendationsService();

function GroupsList(props) {
    const [userGroupsPage, setUserGroupsPage] = useState(1);
    const [userGroupsNumPages, setUserGroupsNumPages] = useState(NaN);
    const [isPageLoading, setIsPageLoading] = useState(false);
    const showCreateGroupForm = useSelector((state) => state.createGroup.showCreateGroupForm);
    const dispatch = useDispatch();

    function onSetResult(result) {
      setIsPageLoading(false);
      setUserGroupsNumPages(result["num_pages"]);
      dispatch(addGroups(result["groups"]));
    }
    
    function onUpdateResult(result) {
      setIsPageLoading(false);
      dispatch(addGroups(result["groups"]));
      setUserGroupsPage(userGroupsPage+1);
    }
    
    function onPaginatedSearch(e) {
      setIsPageLoading(true);
      recommendationsService.getUserGroups(userGroupsPage+1)
          .then((response) => onUpdateResult(response))
    }

    const handleScroll = (e) => {
      if (userGroupsPage < userGroupsNumPages && !isPageLoading) {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
          onPaginatedSearch(e);
        }
      }
    }

    const handleAddGroup = (e) => {
      dispatch(reverseCreateGroupForm());
    }

    useEffect(() => {
        setIsPageLoading(true);
        recommendationsService.getUserGroups(userGroupsPage)
              .then((response) => onSetResult(response))
    }, []);

    const userGroups = useSelector(groupsSelectors.selectAll);

    return (
        <div className="groups-list-scrollable px-2 pt-1 pb-3" onScroll={handleScroll}>
          <div className="groups-list-header pb-2 d-flex justify-content-between align-items-center">
            <h3 className="groups-list-title ms-1 mb-0">Groups</h3>
            <svg className="icon-add-group me-2" xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="0 0 512 512" onClick={handleAddGroup}>
              <title>Create group</title>
              <path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
            </svg>
          </div>
          {showCreateGroupForm && <GroupCreate/>}
          <ul className="groups-list px-0">
            {userGroups.map(group => (
              <GroupItem key={group.name}
              groupName={group.name}
              groupRepositories={group.repositories}/>
            ))}
          </ul>
          <div className="groups-loading-spinner d-flex justify-content-center mb-1">
            {isPageLoading && <LoadingSpinner/>}
          </div>
        </div>
    );
}

export default GroupsList;
