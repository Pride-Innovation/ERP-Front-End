/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
import { ThemeProvider, CssBaseline } from '@mui/material';
import customThemes from './utils/customThemes';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={customThemes} >
      <CssBaseline />
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
    </ThemeProvider>
  </React.StrictMode>
);
