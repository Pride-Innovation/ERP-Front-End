import { Route } from 'react-router';
import { ROUTES } from '../routes';
import Fleet from '../../../pages/assets/fleet';
import CreateFleet from '../../../pages/assets/fleet/CreateFleet';
import UpdateFleet from '../../../pages/assets/fleet/UpdateFleet';
import FleetDetails from '../../../pages/assets/fleet/view';
import RoutesUtills from '../utills';
import { PrivateRoute } from '../PrivateRoutes';

const FleetRoutes = () => {
    const { routePermission } = RoutesUtills();

    return (
        <Route>
            <Route element={<PrivateRoute permission={routePermission(16)} />}>
                <Route path={ROUTES.LIST_FLEET} element={<Fleet />} />
            </Route>
            <Route path={ROUTES.CREATE_FLEET} element={<CreateFleet />} />
            <Route path={`${ROUTES.UPDATE_FLEET}/:id`} element={<UpdateFleet />} />
            <Route path={`${ROUTES.LIST_FLEET}/:id`} element={<FleetDetails />} />
        </Route>
    )
}

export default FleetRoutes