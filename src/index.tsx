import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from "react-router";
import { i18nInitPromise } from './i18n';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

i18nInitPromise.then(() => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
});
