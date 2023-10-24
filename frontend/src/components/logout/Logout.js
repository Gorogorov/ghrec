import { Navigate, useLocation } from 'react-router-dom';

import RecommendationsService from 'axios-services/RecommendationsService';
import { useNotification } from 'hooks/useNotification';

const recommendationsService = new RecommendationsService();

function Logout() {
  const location = useLocation();
  const {createNotification} = useNotification();

  if (localStorage.getItem("isAuthenticated") === "true") {
    // let logout_response = recommendationsService.logout();
    // if (logout_response.error) {
    //   alert('There was a logout error! Please re-check your form.');
    //   return;
    // }
    recommendationsService.logout(
    ).then(
    ).catch((error)=>{
      createNotification(JSON.stringify(error), "error");
    });
    localStorage.clear();
  }
  return (
    <Navigate to="/auth/login" state={{ from: location }} />
  );
}

export default Logout;