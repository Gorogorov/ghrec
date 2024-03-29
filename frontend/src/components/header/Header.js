import './Header.css'

import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark">
        <Link to="/home" className="navbar-brand-link">
          <span className="navbar-brand ms-2">GHREC</span>
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav d-flex w-100 ps-2 pe-3">
            <a className="nav-item nav-link p-2 ms-auto" href="/logout">Logout</a>
          </div>
        </div>
      </nav>
    );  
}

export default Header;
