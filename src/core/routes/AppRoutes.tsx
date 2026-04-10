/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route, Routes } from 'react-router'
import Login from '../../pages/authentication/Login'
import { ROUTES } from './routes'
import PasswordReset from '../../pages/authentication/PasswordReset'
import Dashboard from '../../pages/dashboard'
import ApplicationDrawer from '../../components/appBar'
import Settings from '../../pages/settings'
import Profile from '../../pages/profile'
import AuditTrails from '../../pages/trails'
import { PrivateRoute } from './PrivateRoutes'
import ErrorsPage from '../../pages/errors'
import SettingsSubRoutes from './subroutes/settings/SettingsSub'
import Store from '../../pages/store'
import InventoryRoutes from './subroutes/Inventory'
import AssetRoutes from './subroutes/assets'
import RequestRoutes from './subroutes/requests'
import UserRoutes from './subroutes/UserRoutes'
import TransportRoutes from './subroutes/TransportRoutes'
import { permissionsMock } from '../../mocks/settings'
import ResetPassword from '../../pages/authentication/ResetPassword'
import MovementRoutes from './subroutes/movement'
import StoreRoutes from './subroutes/StoreRoutes'

const AppRoutes = () => {

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<PasswordReset />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      <Route element={<PrivateRoute />}>
        <Route path={ROUTES.ASSETS_MANAGEMENT} element={<ApplicationDrawer />} >
          <Route index element={<Dashboard />} />

          {/* Setting Routes */}
          <Route element={<PrivateRoute permission={permissionsMock[27]} />}>
            <Route path={ROUTES.SETTINGS} element={<Settings />} >
              {SettingsSubRoutes()}
            </Route>
          </Route>

          {/* Inventory Routes */}
          {InventoryRoutes()}

          {/* Asset Routes */}
          {AssetRoutes()}

          {/* Request Routes */}
          {RequestRoutes()}

          {/* User Routes */}
          {UserRoutes()}

          {/* Transport Routes */}
          {TransportRoutes()}

          {/* Movement Routes */}
          {MovementRoutes()}

          <Route path={`${ROUTES.PROFILE}/:id`} element={<Profile />} />

          {/* Audit Trails Routes */}
          <Route element={<PrivateRoute permission={permissionsMock[31]} />}>
            <Route path={ROUTES.AUDIT_TRAILS} element={<AuditTrails />} />
          </Route>

          <Route path={ROUTES.ERRORS} element={<ErrorsPage />} />

          {/* Store Routes */}
          <Route element={<PrivateRoute permission={permissionsMock[35]} />}>
            <Route path={ROUTES.STORE} element={<Store />} />
          </Route>

          {/* Store Sub-Routes */}
          {StoreRoutes()}

        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes;