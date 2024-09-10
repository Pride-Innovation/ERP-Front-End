import { Route, Routes } from 'react-router'
import Login from '../../pages/authentication/Login'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
    </Routes>
  )
}

export default AppRoutes