import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { UserContextProvider } from './context/user/UserContext';
import { TestContextProvider } from './context/test/TestContext';
import { RowContextProvider } from './context/row/RowContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RowContextProvider>
      <UserContextProvider>
        <TestContextProvider>
          <App />
        </TestContextProvider>
      </UserContextProvider>
    </RowContextProvider>
  </React.StrictMode>
);
