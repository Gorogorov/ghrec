import './ProgressBar.css';

import React, { memo } from 'react';


function ProgressBar(props) {
    const { completed, text, bgcolor } = props;

    return (
        <div className="progress-bar-container-wrapper mt-2 mb-2">
            <div className="progress-bar-container">
                <div className="progress-bar-filter" style={{width: `${completed}%`,
                                                             backgroundColor: bgcolor}}>
                </div>
                <span className="progress-bar-label">
                    {text}
                </span>
            </div>
        </div>
    );
};
  
export default ProgressBar;
  