// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Callback from './components/Callback';
import Stats from './components/Stats';
import Explore from './components/Explore';


const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/home" element={<Home />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/explore" element={<Explore />} />
        </Routes>
    </Router>
);

export default App;

