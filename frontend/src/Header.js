import React from 'react';

import './Header.css'

function Header() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark">
        <a className="navbar-brand ms-2" href="#">GitHub Graph Recs</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav d-flex w-100 ps-2 pe-3">
            <a className="nav-item nav-link p-2" href="/">CUSTOMERS</a>
            <a className="nav-item nav-link p-2" href="/customer">CREATE CUSTOMER</a>
            <a className="nav-item nav-link p-2 ms-auto" href="/logout">Logout</a>
          </div>
        </div>
      </nav>
    );  
}

export default Header;
