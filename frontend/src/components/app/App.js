import "./App.css";
import "./custom_bootstrap.scss";

import React, { Component } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import AuthPage from "components/auth-page/AuthPage";
import SigninForm from "components/auth-page/SigninForm";
import SignupForm from "components/auth-page/SignupForm";
import HomePage from "components/home-page/HomePage";
import RecommendationsPage from "components/recommendations-page/RecommendationsPage";
import Logout from "components/logout/Logout";
import RequireAuth from "components/require-auth/RequireAuth";
import Notifications from "components/notifications/Notifications";
import WebSocketClient from "components/web-socket/WebSocketClient";

const BaseLayout = () => (
  <div className="ghrec-app">
    <Routes>
      <Route
        path="/home/"
        element={
          <RequireAuth>
            <HomePage />
            <WebSocketClient />
          </RequireAuth>
        }
      />
      <Route
        path="/home/recommendations/:groupName/"
        element={
          <RequireAuth>
            <RecommendationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/logout/"
        element={
          <RequireAuth>
            <Logout />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth requestAuthPage="true">
            <AuthPage />
          </RequireAuth>
        }
      >
        <Route path="/auth/login/" element={<SigninForm />} />
        <Route path="/auth/register/" element={<SignupForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/home/" replace />} />
    </Routes>
    <Notifications />
  </div>
);

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <BaseLayout />
      </BrowserRouter>
    );
  }
}
export default App;
