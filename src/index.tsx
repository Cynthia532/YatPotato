import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/layout/Sidebar';

console.log(document.getElementById('root'));
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Sidebar />
  </React.StrictMode>
);