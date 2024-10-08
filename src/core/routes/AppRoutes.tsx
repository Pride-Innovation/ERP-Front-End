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
import CreateAsset from '../../pages/assets/CreateAsset'
import UpdateAsset from '../../pages/assets/UpdateAsset'
import Request from '../../pages/assets/subroutes/request'
import CreateRequest from '../../pages/assets/subroutes/request/CreateRequest'
import UpdateRequest from '../../pages/assets/subroutes/request/UpdateRequest'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<PasswordReset />} />
      <Route path={ROUTES.ASSETS_MANAGEMENT} element={<ApplicationDrawer />} >
        <Route index element={<Dashboard />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={ROUTES.USERS} element={<Users />} />
        <Route path={ROUTES.AUDIT_TRAILS} element={<AuditTrails />} />
        <Route path={ROUTES.TEST} element={<TestComponent />} />
        <Route path={ROUTES.LIST_ASSETS} element={<AssetsManagement />} />
        <Route path={ROUTES.CREATE_ASSET} element={<CreateAsset />} />
        <Route path={`${ROUTES.UPDATE_ASSET}/:id`} element={<UpdateAsset />} />
        <Route path={ROUTES.REQUEST} element={<Request />} />
        <Route path={ROUTES.CREATE_REQUEST} element={<CreateRequest />} />
        <Route path={`${ROUTES.UPDATE_REQUEST}/:id`} element={<UpdateRequest />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes