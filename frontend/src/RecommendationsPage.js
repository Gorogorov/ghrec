import React from 'react';

import Layout from './Layout'
import RecommendationsList from './RecommendationsList';
import './RecommendationsPage.css'

function RecommendationsPage() {
    
    return (
        <Layout>
            <div className="recommendations-list-container">
                <RecommendationsList/>
            </div>
        </Layout>
    );  
}

export default RecommendationsPage;