/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router';
import { ROUTES } from '../../routes';
import Fleet from '../../../../pages/assets/fleet';
import { PrivateRoute } from '../../PrivateRoutes';
import { PERMISSIONS } from '../../../permissions/constants';

const FleetRoutes = () => {
    return (
        <Route element={<PrivateRoute permission={PERMISSIONS.READ_ASSET} />}>
            <Route path={ROUTES.LIST_FLEET} element={<Fleet />} />
        </Route>
    )
}

export default FleetRoutes
