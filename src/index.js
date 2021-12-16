import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainLayout from './layouts/MainLayout';
// import App from './App';
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
    <BrowserRouter>
        <MainLayout />
    </BrowserRouter>,
    document.getElementById('root')
);