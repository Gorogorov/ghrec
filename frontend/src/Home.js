import React from 'react';

import Layout from './Layout'
import GroupsList from './GroupsList';
import RepositoriesList from './RepositoriesList';
import './Home.css'

function Home() {
    
    return (
        <Layout>
            <div className="home-container d-flex flex-column">
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
            </div>
        </Layout>
    );  
}

export default Home;