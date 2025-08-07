/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router';
import { ROUTES } from '../../routes';
import Fleet from '../../../../pages/assets/fleet';
import CreateFleet from '../../../../pages/assets/fleet/CreateFleet';
import UpdateFleet from '../../../../pages/assets/fleet/UpdateFleet';
import { PrivateRoute } from '../../PrivateRoutes';
import { permissionsMock } from '../../../../mocks/settings';


const FleetRoutes = () => {

    return (
        <Route>
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route path={ROUTES.LIST_FLEET} element={<Fleet />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[40]} />}>
                <Route path={ROUTES.CREATE_FLEET} element={<CreateFleet />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[42]} />}>
                <Route path={`${ROUTES.UPDATE_FLEET}/:id`} element={<UpdateFleet />} />
            </Route>
        </Route>
    )
}

export default FleetRoutes