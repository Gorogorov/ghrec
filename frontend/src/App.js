import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './custom_bootstrap.scss';
import AuthPage from './AuthPage';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import Home from './Home'
import Logout from './Logout'
import RequireAuth from './RequireAuth'
import './App.css';
import Notifications from './Notifications/Notifications';


const BaseLayout = () => (
  <div className="ghrec-app">
    <Routes>
      <Route path="/home/" element={
              <RequireAuth>
                <Home/>
              </RequireAuth>}>
        {/* <Route path="/customer/:pk" element={<CustomerCreateUpdate/>}/>
        <Route path="/customer/" exact element={<CustomerCreateUpdate/>}/> */}
      </Route>
      <Route path="/logout/" element={
                              <RequireAuth>
                                <Logout/>
                              </RequireAuth>}/>
      <Route element={
              <RequireAuth requestAuthPage="true" >
                <AuthPage/>
              </RequireAuth>}>
        <Route path="/auth/login/" element={<SigninForm/>}/>
        <Route path="/auth/register/" element={<SignupForm/>}/>
      </Route>
      {/* <Route path="*" element={<NoMatch/>}/> */}
    </Routes>
    <Notifications/>
  </div>
)

class App extends Component{
  render() {
    return (
      <BrowserRouter>
        <BaseLayout/>
      </BrowserRouter>
    );
  }
}
export  default  App;
