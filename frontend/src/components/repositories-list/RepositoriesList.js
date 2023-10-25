import './RepositoriesList.css'

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectNotStartedIds } from 'redux/groupsSlice';
import RecommendationsService from 'axios-services/RecommendationsService';
import RepositoryItem from './RepositoryItem';
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner';
import {useNotification} from 'hooks/useNotification';

const recommendationsService = new RecommendationsService();

function RepositoriesList(props) {
    const [userRepositories, setUserRepositories] = useState([]);
    const [userRepositoriesPage, setUserRepositoriesPage] = useState(1);
    const [userRepositoriesNumPages, setUserRepositoriesNumPages] = useState(NaN);
    const [isPageLoading, setIsPageLoading] = useState(false);
    const {createNotification} = useNotification();

    function onSetResult(result) {
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
      recommendationsService.getUserRepositories(userRepositoriesPage+1
      ).then((response)=>{
        onUpdateResult(response);
      }).catch((error)=>{
        createNotification(JSON.stringify(error), "error");
      });
    }

    const handleScroll = (e) => {
      if (userRepositoriesPage < userRepositoriesNumPages && !isPageLoading) {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
          onPaginatedSearch(e);
        }
      }
    }

    const handleReloadReps = (e) => {
      recommendationsService.reloadUserRepositories(
      ).then(()=>{
        setUserRepositories([]);
        setUserRepositoriesPage(1);
        setIsPageLoading(true);
        recommendationsService.getUserRepositories(userRepositoriesPage
        ).then((response)=>{
          onSetResult(response);
        }).catch((error)=>{
          createNotification(JSON.stringify(error), "error");
        });
      }).catch((error)=>{
        createNotification(JSON.stringify(error), "error");
      });

    }

    useEffect(() => {
        setIsPageLoading(true);
        recommendationsService.getUserRepositories(userRepositoriesPage
        ).then((response)=>{
          onSetResult(response);
        }).catch((error)=>{
          createNotification(JSON.stringify(error), "error");
        });
    }, []);

    const groupOptions = useSelector(selectNotStartedIds);

    return (
      <div className="repositories-list-scrollable px-2 pt-1 pb-3" onScroll={handleScroll}>
        <div className="repositories-list-header d-flex align-items-center justify-content-between mb-2">
          <h3 className="repositories-list-title ps-1 m-0">Repositories</h3>
          <Link to="/home/" className="me-2">
            <div className="reps-btn-reload" onClick={handleReloadReps}>
              <svg xmlns="http://www.w3.org/2000/svg" height="22px" width="22px" viewBox="0 0 512 512">
                <title>Reload repositories</title>
                <path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/>
              </svg>
            </div>
          </Link>
        </div>
    
        <ul className="repositories-list px-0">
          {userRepositories.map(rep => (
            <RepositoryItem key={rep.url}
            title={rep.name}
            stars={rep.num_stars}
            description={rep.description}
            url={rep.url}
            groupOptions={groupOptions} />
          ))}
        </ul>
        <div className="repositories-loading-spinner d-flex justify-content-center mb-1">
          {isPageLoading && <LoadingSpinner/>}
        </div>
      </div>
    );
}

export default RepositoriesList;
