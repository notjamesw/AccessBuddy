import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link} from 'react-router-dom';
import './App.css';
import Home from './components/Home.tsx';
import Info from './components/Info.tsx';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="flex pt-4 justify-center space-x-32 bg-slate-900 text-white font-semibold text-md shadow-md">
          <Link className = "ml-2 shadow-xl" to="/">
            <img className = "active:brightness-50" src="/images/accessBuddy1.png" alt="Home" />
          </Link>
          <Link style={{ marginRight: '0.5rem' }} to="/about">
            <img className = "rounded-full bg-slate-800 hover:brightness-150 hover:ring active:bg-slate-900" src="/images/infoIcon.png" alt="About" />
          </Link>
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
