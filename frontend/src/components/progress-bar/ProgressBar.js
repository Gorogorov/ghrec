import './ProgressBar.css';

import React from 'react';


const ProgressBar = (props) => {
    const { bgcolor, completed, text } = props;
  
    return (
        <div className="progress-bar-container-wrapper mt-2 mb-2">
            <div className="progress-bar-container">
                <div className="progress-bar-filter" style={{backgroundColor: bgcolor,
                                                             width: `${completed}%`}}>

                </div>
                <span className="progress-bar-label">
                        {text}
                    </span>
            </div>
        </div>
    );
};
  
export default ProgressBar;
  