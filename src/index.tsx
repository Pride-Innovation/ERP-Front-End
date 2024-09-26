import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { UserContextProvider } from './context/UserContext';
import { TestContextProvider } from './components/test/TestContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <UserContextProvider>
      <TestContextProvider>
        <App />
      </TestContextProvider>
    </UserContextProvider>
  </React.StrictMode>
);
