import { Route, Routes } from 'react-router'
import Login from '../../pages/authentication/Login'
import { ROUTES } from './routes'
import PasswordReset from '../../pages/authentication/PasswordReset'
import Dashboard from '../../pages/dashboard'
import ApplicationDrawer from '../../components/appBar'
import Settings from '../../pages/settings'
import Profile from '../../pages/profile'
import Users from '../../pages/users'

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
      </Route>
    </Routes>
  )
}

export default AppRoutes