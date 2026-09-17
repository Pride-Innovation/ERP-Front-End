/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import { createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import RouteError from '../../pages/errors/RouteError'
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
import ResetPassword from '../../pages/authentication/ResetPassword'
import MovementRoutes from './subroutes/movement'
import StoreRoutes from './subroutes/StoreRoutes'
import ReportsPage from '../../pages/reports'
import ApprovalWorkflows from '../../pages/approvalWorkflows'
import Notifications from '../../pages/notifications'
import { NotificationContextProvider } from '../../context/notification/NotificationContext'
import { PERMISSIONS } from '../permissions/constants'

/**
 * Route tree as JSX. Rendered through a data router (createBrowserRouter) so
 * navigation-blocking hooks like useBlocker work — plain <BrowserRouter>
 * does not support them.
 */
const routeElements = (
    /*
     * One pathless boundary around the whole tree.
     *
     * `errorElement` catches what the catch-all `*` route cannot: a page that throws while rendering,
     * a loader that fails, a lazy chunk that will not load. Both are needed - one is about addresses
     * that do not exist, the other about pages that break - and neither existed, so every one of
     * those cases reached React Router's own developer page ("Unexpected Application Error! ...
     * Hey developer"), which is a message written for whoever built the application and shown to
     * whoever is using it.
     *
     * A pathless route rather than one `errorElement` per branch: the tree is assembled from six
     * sub-route functions, and putting it on each would be six places to forget one.
     */
    <Route errorElement={<RouteError />}>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<PasswordReset />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      <Route element={<PrivateRoute />}>
        <Route path={ROUTES.ASSETS_MANAGEMENT} element={<NotificationContextProvider><ApplicationDrawer /></NotificationContextProvider>} >
          <Route index element={<Dashboard />} />

          {/* Setting Routes */}
          <Route element={<PrivateRoute permission={PERMISSIONS.READ_SETTING} />}>
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

          {/* Approval Workflows Route */}
          <Route element={<PrivateRoute permission={PERMISSIONS.READ_SETTING} />}>
            <Route path={ROUTES.APPROVAL_WORKFLOWS} element={<ApprovalWorkflows />} />
          </Route>

          {/* Full-page notifications list (the navbar bell is the popover).
              Pending-completion lives inside each per-category assets page as
              a row action — filter by `requireUpdate` status to see them. */}
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />

          {/* Audit Trails Routes */}
          <Route element={<PrivateRoute permission={PERMISSIONS.READ_AUDIT} />}>
            <Route path={ROUTES.AUDIT_TRAILS} element={<AuditTrails />} />
          </Route>

          <Route path={ROUTES.ERRORS} element={<ErrorsPage />} />

          {/* Store Routes */}
          <Route element={<PrivateRoute permission={PERMISSIONS.READ_STORE} />}>
            <Route path={ROUTES.STORE} element={<Store />} />
          </Route>

          {/* Store Sub-Routes */}
          {StoreRoutes()}

          {/*
            * Reports — gated on what the six tabs actually read.
            *
            * This was READ_AUDIT, which no tab touches: the page reads stocks, assets, requests,
            * movements and repairs. Measured when it was found, **4 of 27 accounts could open it and
            * 23 who could read every report on it were refused outright** — the sidebar hid the link
            * and this guard turned the URL away, so there was no route in at all.
            *
            * `anyOf`, because the page hides the tabs a viewer cannot load: holding one of these
            * means there is something here worth opening.
            */}
          <Route element={<PrivateRoute anyOf={[
            PERMISSIONS.READ_ASSET,
            PERMISSIONS.READ_REQUEST,
            PERMISSIONS.READ_MOVEMENT,
            PERMISSIONS.READ_INVENTORY,
          ]} />}>
            <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          </Route>

        </Route>
      </Route>

      {/*
        * Anything that matches nothing else.
        *
        * Without it React Router answered a mistyped URL, a stale bookmark or a bad `navigate()` with
        * its own developer page — "Unexpected Application Error! 404 Not Found / 💿 Hey developer 👋"
        * — a message written for whoever built the application, shown to whoever is using it, with no
        * navigation and no way back.
        *
        * Outside `PrivateRoute` on purpose: a signed-out user typing a bad address should be told the
        * page does not exist, not bounced to a login screen that then sends them somewhere they did
        * not ask for.
        */}
      <Route path="*" element={<RouteError />} />
    </Route>
)

export const router = createBrowserRouter(createRoutesFromElements(routeElements));

export default router;
