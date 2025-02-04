import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { UserContextProvider } from './context/user/UserContext';
import { TestContextProvider } from './context/test/TestContext';
import { RowContextProvider } from './context/row/RowContext';
import RequestContextProvider from './context/request/RequestContext';
import FileContextProvider from './context/file/FileContext';
import TransportRequestContextProvider from './context/request/TransportRequestContext';
import { Provider } from 'react-redux';
import { store } from './store';
import { InventoryContextProvider } from './context/inventory';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <InventoryContextProvider>
        <RowContextProvider>
          <UserContextProvider>
            <RequestContextProvider>
              <TransportRequestContextProvider>
                <FileContextProvider>
                  <TestContextProvider>
                    <App />
                  </TestContextProvider>
                </FileContextProvider>
              </TransportRequestContextProvider>
            </RequestContextProvider>
          </UserContextProvider>
        </RowContextProvider>
      </InventoryContextProvider>
    </Provider>
  </React.StrictMode>
);
