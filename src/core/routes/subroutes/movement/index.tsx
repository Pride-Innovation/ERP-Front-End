import { Route } from 'react-router'
import { Outlet } from 'react-router-dom'
import { ROUTES } from '../../routes'
import Movement from '../../../../pages/movement'
import AllMovements from '../../../../pages/movement/allMovements'
import CreateMovement from '../../../../pages/movement/CreateMovement'
import UpdateMovement from '../../../../pages/movement/UpdateMovement'
import MovementDetails from '../../../../pages/movement/view'
import MovementContextProvider from '../../../../context/movement/MovementContext'

const MovementLayout = () => (
    <MovementContextProvider>
        <Outlet />
    </MovementContextProvider>
)

const MovementRoutes = () => {
    return (
        <Route element={<MovementLayout />}>
            <Route path={ROUTES.MOVEMENT} element={<Movement />} />
            <Route path={`${ROUTES.MOVEMENT}/all`} element={<AllMovements />} />
            <Route path={ROUTES.CREATE_MOVEMENT} element={<CreateMovement />} />
            <Route path={`${ROUTES.UPDATE_MOVEMENT}/:id`} element={<UpdateMovement />} />
            <Route path={`${ROUTES.READ_MOVEMENT}/:id`} element={<MovementDetails />} />
        </Route>
    )
}

export default MovementRoutes;