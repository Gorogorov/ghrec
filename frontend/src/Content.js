import React from 'react';

import GroupsList from './GroupsList';
import RepositoriesList from './RepositoriesList';

import './Content.css'

function Content() {
    
    return (
        <>
            <div className="content-container d-flex align-items-center ghrec-layout">
                <div className="groups-container flex-grow-1 d-flex flex-column">
                    <div className="groups-list-container">
                        <GroupsList/>
                    </div>
                </div>                
                <div className="repositories-container">
                    <div className="repositories-list-container">
                        <RepositoriesList/>
                    </div>
                </div>
            </div>
        </>
    );  
}

export default Content;