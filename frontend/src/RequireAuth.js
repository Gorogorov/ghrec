import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// import CustomersService from './RecommendationsService';

// const customersService = new CustomersService();
 
function RequireAuth ({ children, requestAuthPage="false" }) {
    // function isUserAuthenticated() {
    //     let isAuthenticatedFlag = localStorage.getItem("isAuthenticated");
    //     if (isAuthenticatedFlag === null) {
    //         customersService.refreshToken().then((result)=>{
    //             localStorage.setItem("isAuthenticated", "true");
    //         }).catch((error)=>{
    //             if (error.status === 401) {
    //                 localStorage.setItem("isAuthenticated", "false");
    //             }
    //         });
    //     }
    //     return isAuthenticatedFlag === "true" ? true : false;
    // }
    const isAuthenticatedFlag = localStorage.getItem("isAuthenticated");
    const isUserAuthenticated = isAuthenticatedFlag === "true" ? true : false;

    const location = useLocation();
    // if (!isUserAuthenticated() && requestAuthPage === "false"){
    //     return <Navigate to="/auth/login" state={{ from: location }} />;
    // }
    // if (isUserAuthenticated() && requestAuthPage === "true"){
    //     return <Navigate to="/home" state={{ from: location }} />;
    // }
    if (!isUserAuthenticated && requestAuthPage === "false"){
        return <Navigate to="/auth/login" state={{ from: location }} />;
    }
    if (isUserAuthenticated && requestAuthPage === "true"){
        return <Navigate to="/home" state={{ from: location }} />;
    }

    return children;
};
 
export default RequireAuth;