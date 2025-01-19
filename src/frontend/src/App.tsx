import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link} from 'react-router-dom';
import './App.css';
import Home from './components/Home.tsx';
import Info from './components/Info.tsx';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="flex py-4 justify-center space-x-40 bg-slate-900 text-white font-semibold text-md shadow-md">
            <Link className = "shadow-md" to="/">Home</Link>
            <Link className = "shadow-md" to="/about">About</Link>
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
