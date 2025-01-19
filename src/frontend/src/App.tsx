import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home.tsx';
import Info from './components/Info.tsx';

function App() {
  return (
    <Router>
      <div className="min-w-80 min-h-80 bg-black text-white">
        <header className="App-header">
          <nav className="flex justify-center space-x-4">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<Info />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
