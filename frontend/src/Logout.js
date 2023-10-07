import { Navigate, useLocation } from 'react-router-dom';

import CustomersService from './RecommendationsService';

const customersService = new CustomersService();

function Logout() {
  const location = useLocation();
  if (localStorage.getItem("isAuthenticated") === "true") {
    let logout_response = customersService.logout();
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