import "./LoadingSpinner.css";

import React from 'react';

function LoadingSpinner(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="loading-spinner-svg" viewBox="25 25 50 50">
      <circle className="loading-spinner-circle" cx="50" cy="50" r="12"></circle>
    </svg>
  );
}

export default LoadingSpinner;