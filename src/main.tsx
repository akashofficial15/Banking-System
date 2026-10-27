import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BankProvider } from './context/BankContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BankProvider>
      <App />
    </BankProvider>
  </React.StrictMode>
);
