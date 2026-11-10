import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@fontsource/instrument-serif/400.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { WorkspaceProvider } from './context/WorkspaceContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WorkspaceProvider>
    </HelmetProvider>
  </React.StrictMode>
);
