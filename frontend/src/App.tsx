import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home.tsx';
import Info from './components/Info.tsx';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="flex justify-between items-center pt-8 bg-slate-900 text-white font-semibold text-md shadow-md h-16 px-6 md:px-10">
          <Link to="/">
            <img
              className="h-16 active:brightness-50"
              src="/images/accessBuddy1.png"
              alt="Home"
            />
          </Link>
          <div className="flex space-x-6">
            <Link to="/info">
              <img
                className="h-8 w-8 rounded-full bg-slate-800 hover:brightness-150 hover:ring active:bg-slate-900"
                src="/images/infoIcon.png"
                alt="About"
              />
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<Info />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
