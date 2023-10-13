import { Navigate, useLocation } from 'react-router-dom';

import RecommendationsService from './RecommendationsService';

const recommendationsService = new RecommendationsService();

function Logout() {
  const location = useLocation();
  if (localStorage.getItem("isAuthenticated") === "true") {
    let logout_response = recommendationsService.logout();
    if (logout_response.error) {
      alert('There was a logout error! Please re-check your form.');
      return;
    }
    localStorage.clear();
  }
  return (
    <Navigate to="/auth/login" state={{ from: location }} />
  );
}

export default Logout;