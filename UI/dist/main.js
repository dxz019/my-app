import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import './tokens.css'; // Design tokens - color palette
import 'primereact/resources/themes/lara-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import PrimeReact from 'primereact/api';
PrimeReact.ripple = true;
// Create toast container programmatically for both dev and production
const toastDiv = document.createElement('div');
toastDiv.id = 'toast';
toastDiv.className = 'toast';
document.body.appendChild(toastDiv);
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>);
