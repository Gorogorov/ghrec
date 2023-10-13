import React from 'react';

import './RecommendationItem.css'

function RecommendationItem(props) {
    return (
        <div className="card mb-1 border border-2 w-100">
            <div className="card-header d-flex justify-content-between">
                <h5 className="card-title">
                    <a href={props.url} className="link-dark" target="_blank">
                        {props.title}
                    </a>
                </h5>

                <div className="card-matches-stars-container d-flex">
                    <div className="card-matches me-2">
                        <svg className="icon-num-matches me-1" xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 640 512">
                            <title>Number of matches</title>
                            <path fill="#b00000" d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/>
                        </svg>
                        <small>{props.matches}</small>
                    </div>
                    <div className="card-stars">
                        <svg fill="#e3e30f" aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
                            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
                        </svg>
                        <small>{props.stars}</small>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <p className="card-text">{props.description}</p>
            </div>
        </div>
    )
}
export default RecommendationItem;