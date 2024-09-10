import { Route, Routes } from 'react-router'
import Login from '../../pages/authentication/Login'
import { ROUTES } from './routes'
import PasswordReset from '../../pages/authentication/PasswordReset'
import Dashboard from '../../pages/dashboard'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<PasswordReset />} />
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
    </Routes>
  )
}

export default AppRoutes