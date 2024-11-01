import { Route, Routes } from 'react-router'
import Login from '../../pages/authentication/Login'
import { ROUTES } from './routes'
import PasswordReset from '../../pages/authentication/PasswordReset'
import Dashboard from '../../pages/dashboard'
import ApplicationDrawer from '../../components/appBar'
import Settings from '../../pages/settings'
import Profile from '../../pages/profile'
import Users from '../../pages/users'
import AuditTrails from '../../pages/trails'
import TestComponent from '../../pages/test'
import AssetsManagement from '../../pages/assets'
import Request from '../../pages/request'
import CreateRequest from '../../pages/request/CreateRequest'
import UpdateRequest from '../../pages/request/UpdateRequest'
import ITEquipmentRoutes from './subroutes/ITEquipmentRoutes'
import FleetRoutes from './subroutes/FleetRoutes'
import OfficeEquipmentRoutes from './subroutes/OfficeEquipmentRoutes'
import { PrivateRoute } from './PrivateRoutes'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<PasswordReset />} />
      <Route path={ROUTES.ASSETS_MANAGEMENT} element={<ApplicationDrawer />} >
        <Route element={<PrivateRoute />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={`${ROUTES.PROFILE}/:id`} element={<Profile />} />
        <Route path={ROUTES.USERS} element={<Users />} />
        <Route path={ROUTES.AUDIT_TRAILS} element={<AuditTrails />} />
        <Route path={ROUTES.TEST} element={<TestComponent />} />
        <Route path={ROUTES.LIST_ASSETS} element={<AssetsManagement />} >
          {ITEquipmentRoutes()}
          {FleetRoutes()}
          {OfficeEquipmentRoutes()}
        </Route>
        <Route path={ROUTES.REQUEST} element={<Request />} />
        <Route path={ROUTES.CREATE_REQUEST} element={<CreateRequest />} />
        <Route path={`${ROUTES.UPDATE_REQUEST}/:id`} element={<UpdateRequest />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes;