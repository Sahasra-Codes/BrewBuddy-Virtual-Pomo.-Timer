import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './Home';
import Cradles from "./server-cafes/cradles/Cradles";
import Mae from "./server-cafes/mae/Mae";
import Skye from "./server-cafes/skye/Skye";
import Prince from "./server-cafes/prince/Prince";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cradles" element={<Cradles />} />
        <Route path="/mae" element={<Mae />} />
        <Route path="/skye" element={<Skye />} />
        <Route path="/prince" element={<Prince />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();

