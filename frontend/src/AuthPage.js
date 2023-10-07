import React from 'react';
import { Outlet } from 'react-router-dom';

import './AuthPage.css'


function AuthPage(props) {
    
    return (
        <div className="d-flex align-items-center ghrec-auth-layout">
        <div className="d-flex flex-column ghrec-auth-title me-4 ms-3 w-30 text-white">
            <h1 className="display-3"><strong>GitHub Graph</strong></h1>
            <h1 className="display-3"><strong>Recommendations</strong></h1>
        </div>
        <div className="auth-form">
          <Outlet />
        </div>
        </div>
    );  
}

export default AuthPage;