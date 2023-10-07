import React from 'react';

import Header from './Header'
import Content from './Content'

function Home() {
    
    return (
        <>
            <div className="home-container d-flex flex-column">
                <Header/>
                <Content/>
            </div>
        </>
    );  
}

export default Home;