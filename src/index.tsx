import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { UserContextProvider } from './context/user/UserContext';
import { TestContextProvider } from './context/test/TestContext';
import { RowContextProvider } from './context/row/RowContext';
import RequestContextProvider from './context/request/RequestContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RowContextProvider>
      <UserContextProvider>
        <RequestContextProvider>
          <TestContextProvider>
            <App />
          </TestContextProvider>
        </RequestContextProvider>
      </UserContextProvider>
    </RowContextProvider>
  </React.StrictMode>
);
