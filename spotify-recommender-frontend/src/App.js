// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import './styles.css';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" component={Login} />
            <Route path="/home" component={Home} />
        </Routes>
    </Router>
);

export default App;

