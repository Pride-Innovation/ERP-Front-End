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
import AutocompleteContextProvider from './context/autocomplete';
import StoreContextProvider from './context/store';
import AssetContextProvider from './context/asset';
import FormContextProvider from './context/form';

// Suppress the benign "ResizeObserver loop completed with undelivered notifications"
// warning that fires from charting/layout libraries (recharts, MUI, etc.).
window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver loop')) {
        e.stopImmediatePropagation();
    }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={customThemes} >
      <CssBaseline />
      <Provider store={store}>
        <AutocompleteContextProvider>
          <InventoryContextProvider>
            <RowContextProvider>
              <UserContextProvider>
                <RequestContextProvider>
                  <TransportRequestContextProvider>
                    <FileContextProvider>
                      <TestContextProvider>
                        <StoreContextProvider>
                          <AssetContextProvider>
                            <FormContextProvider>
                              <App />
                            </FormContextProvider>
                          </AssetContextProvider>
                        </StoreContextProvider>
                      </TestContextProvider>
                    </FileContextProvider>
                  </TransportRequestContextProvider>
                </RequestContextProvider>
              </UserContextProvider>
            </RowContextProvider>
          </InventoryContextProvider>
        </AutocompleteContextProvider>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
