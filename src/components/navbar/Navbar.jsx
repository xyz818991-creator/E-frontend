import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = ({ storeName = 'Vwalah' }) => {
  return (
    <header className="nav" id="nav">
      <Link className="brand" to="/" aria-label={`${storeName} home`}>
        <span className="logo"></span>
        <span>
          <b>{storeName}</b>
          <small>Tradition, Beautifully Curated.</small>
        </span>
      </Link>
    </header>
  );
};

export default Navbar;

