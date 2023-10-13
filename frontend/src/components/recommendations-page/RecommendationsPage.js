import './RecommendationsPage.css'

import React from 'react';

import Layout from 'components/layout/Layout'
import RecommendationsList from './RecommendationsList';


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