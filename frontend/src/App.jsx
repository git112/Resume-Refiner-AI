import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
          </Routes>
        </main>
       
      </div>
    </Router>
  );
}

export default App;
