import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom';

import { groupsSelectors } from './groupsSlice'
import RecommendationsService from './RecommendationsService';
import RecommendationItem from './RecommendationItem';
import LoadingSpinner from './LoadingSpinner';
import './RecommendationsList.css'

const recommendationsService = new RecommendationsService();

const List = ({ list, isPageLoading, handleScroll }) => (
  <div className="recommendations-list-scrollable px-2 pt-3 pb-3" onScroll={handleScroll}>
    <div className="recommendations-list-header mb-3 d-flex align-items-center">
      <Link to="/home/" className="me-2">
        <div className="home-btn-arrow p-1">
          <svg width="32" height="24" viewBox="0 0 35 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <title>Home</title>
            <path fill="#000" d="M34.468 7.59a1.257 1.257 0 00-.875-.34H4.786l4.938-4.938A1.248 1.248 0 009.723.518a1.25 1.25 0 00-1.767.026L1.014 7.487a1.27 1.27 0 00-.289.288L0 8.5l.722.722c.08.112.18.21.292.292l6.942 6.942c.315.325.777.453 1.214.337.437-.112.779-.454.891-.89.116-.438-.012-.9-.337-1.215L4.786 9.75h28.807c.515.007.983-.302 1.178-.78a1.255 1.255 0 00-.303-1.38z"/>
          </svg>
        </div>
      </Link>
      <h3 className="recommendations-list-title m-0">Recommendations</h3>
    </div>
    <ul className="recommendations-list px-0">
      {list.map(rep => (
        <RecommendationItem key={rep.repository.url}
        title={rep.repository.name}
        stars={rep.repository.num_stars}
        description={rep.repository.description}
        url={rep.repository.url}
        matches={rep.num_of_hits}/>
      ))}
    </ul>
    <div className="recommendations-loading-spinner d-flex justify-content-center mb-1">
      {isPageLoading && <LoadingSpinner/>}
    </div>
  </div>
);

function RecommendationsList(props) {
    const [groupRecs, setGroupRecs] = useState([]);
    const [groupRecsPage, setGroupRecsPage] = useState(1);
    const [groupRecsNumPages, setGroupRecsNumPages] = useState(NaN);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const { groupName } = useParams();

    function onSetResult(result) {
      setIsPageLoading(false);
      setGroupRecsNumPages(result["num_pages"]);
      setGroupRecs(result["repositories"]);
    }
    
    function onUpdateResult(result) {
      setIsPageLoading(false);
      setGroupRecs([...groupRecs, ...result["repositories"]]);
      setGroupRecsPage(groupRecsPage+1);
    }
    
    function onPaginatedSearch(e) {
      setIsPageLoading(true);
      recommendationsService.getGroupRecommendations(groupName, groupRecsPage+1)
          .then((response) => onUpdateResult(response))
    }

    const handleScroll = (e) => {
      if (groupRecsPage < groupRecsNumPages && !isPageLoading) {
        console.log(groupRecsNumPages);
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
          onPaginatedSearch(e);
        }
      }
    }

    useEffect(() => {
        setIsPageLoading(true);
        recommendationsService.getGroupRecommendations(groupName, groupRecsPage)
              .then((response) => onSetResult(response))
    }, []);

    // const groupOptions = useSelector(groupsSelectors.selectIds);

    return (<List list={groupRecs}
                  isPageLoading={isPageLoading}
                  handleScroll={handleScroll}/>);
}

export default RecommendationsList;
