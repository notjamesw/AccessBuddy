import React, { useState } from 'react';
import logo from '../../assets/img/logo.svg';
import 'index.css';
import Homepage from './homepage';
import Info from './info';

const Popup = () => {
  const [currentPage, setCurrentPage] = useState('homepage');

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className='text-purple-700'>hello</h1>
      {currentPage === 'homepage' && <Homepage navigate={navigate} />}
      {currentPage === 'info' && <Info navigate={navigate} />}
    </div>
  );
};

export default Popup;
