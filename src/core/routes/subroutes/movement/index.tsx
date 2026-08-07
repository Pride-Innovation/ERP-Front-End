import { Route } from 'react-router'
import { Outlet } from 'react-router-dom'
import { ROUTES } from '../../routes'
import Movement from '../../../../pages/movement'
import AllMovements from '../../../../pages/movement/allMovements'
import CreateMovement from '../../../../pages/movement/CreateMovement'
import MovementDetails from '../../../../pages/movement/view'
import Consignments from '../../../../pages/consignment'
import MovementContextProvider from '../../../../context/movement/MovementContext'
import { PrivateRoute } from '../../PrivateRoutes'
import { PERMISSIONS } from '../../../permissions/constants'

const MovementLayout = () => (
    <MovementContextProvider>
        <Outlet />
    </MovementContextProvider>
)

const MovementRoutes = () => {
    return (
        <Route element={<MovementLayout />}>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_ASSET} />}>
                <Route path={ROUTES.MOVEMENT} element={<Movement />} />
                <Route path={`${ROUTES.MOVEMENT}/all`} element={<AllMovements />} />
                <Route path={ROUTES.CONSIGNMENTS} element={<Consignments />} />
                <Route path={`${ROUTES.READ_MOVEMENT}/:id`} element={<MovementDetails />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.CREATE_ASSET} />}>
                <Route path={ROUTES.CREATE_MOVEMENT} element={<CreateMovement />} />
            </Route>
        </Route>
    )
}

export default MovementRoutes;
