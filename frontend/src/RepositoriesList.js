import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { groupsSelectors } from './groupsSlice'

import './RepositoriesList.css'
import RecommendationsService from './RecommendationsService';
import RepositoryItem from './RepositoryItem';
import LoadingSpinner from './LoadingSpinner';

const recommendationsService = new RecommendationsService();

const List = ({ list, groupOptions, isPageLoading, handleScroll }) => (
  <div className="repositories-list-scrollable px-2 pt-1 pb-3" onScroll={handleScroll}>
    <h3 className="repositories-list-title ps-1">Repositories</h3>
    <ul className="repositories-list px-0">
      {list.map(rep => (
        <RepositoryItem key={rep.url}
        title={rep.name}
        stars={rep.num_stars}
        description={rep.description}
        url={rep.url}
        // groupOptions={["1", "2", "3"]} />
        groupOptions={groupOptions} />
      ))}
    </ul>
    <div className="repositories-loading-spinner d-flex justify-content-center mb-1">
      {isPageLoading && <LoadingSpinner/>}
    </div>
  </div>
);

function RepositoriesList(props) {
    const [userRepositories, setUserRepositories] = useState([]);
    const [userRepositoriesPage, setUserRepositoriesPage] = useState(1);
    const [userRepositoriesNumPages, setUserRepositoriesNumPages] = useState(NaN);
    const [isPageLoading, setIsPageLoading] = useState(false);

    function onSetResult(result) {
      //setUserRepositories(applySetRepsList(result));
      setIsPageLoading(false);
      setUserRepositoriesNumPages(result["num_pages"])
      setUserRepositories(result["repositories"]);
    }
    
    function onUpdateResult(result) {
      setIsPageLoading(false);
      setUserRepositories([...userRepositories, ...result["repositories"]]);
      setUserRepositoriesPage(userRepositoriesPage+1);
    }
    
    function onPaginatedSearch(e) {
      setIsPageLoading(true);
      recommendationsService.getUserRepositories(userRepositoriesPage+1)
          .then((response) => onUpdateResult(response))
    }

    const handleScroll = (e) => {
      if (userRepositoriesPage < userRepositoriesNumPages && !isPageLoading) {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
          onPaginatedSearch(e);
        }
      }
    }

    useEffect(() => {
        setIsPageLoading(true);
        recommendationsService.getUserRepositories(userRepositoriesPage)
              .then((response) => onSetResult(response))
    }, []);

    const groupOptions = useSelector(groupsSelectors.selectIds);

    return (<List list={userRepositories}
                  groupOptions={groupOptions}
                  isPageLoading={isPageLoading}
                  handleScroll={handleScroll}/>);
}

export default RepositoriesList;
