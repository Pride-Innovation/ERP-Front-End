/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router';
import ITEquipment from '../../../../pages/assets/ITEquipment';
import { PrivateRoute } from '../../PrivateRoutes';
import { permissionsMock } from '../../../../mocks/settings';

const ITEquipmentRoutes = () => {

    return (
        <Route>
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route index element={<ITEquipment />} />
            </Route>
        </Route>
    )
}

export default ITEquipmentRoutes