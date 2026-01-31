import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Payroll from './components/Payroll';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payroll" element={<Payroll />} />
      </Routes>
    </HashRouter>
  );
}

export default App;