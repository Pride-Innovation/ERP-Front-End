/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router';
import { ROUTES } from '../../routes';
import CreateITEquipment from '../../../../pages/assets/ITEquipment/CreateITEquipment';
import UpdateITEquipment from '../../../../pages/assets/ITEquipment/UpdateITEquipment';
import ITEquipment from '../../../../pages/assets/ITEquipment';
import ITEquipmentDetails from '../../../../pages/assets/ITEquipment/view';
import { PrivateRoute } from '../../PrivateRoutes';
import { permissionsMock } from '../../../../mocks/settings';

const ITEquipmentRoutes = () => {

    return (
        <Route>
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route index element={<ITEquipment />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[40]} />}>
                <Route path={ROUTES.CREATE_ITEQUIPMENT} element={<CreateITEquipment />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[42]} />}>
                <Route path={`${ROUTES.UPDATE_ITEQUIPMENT}/:id`} element={<UpdateITEquipment />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route path={`${ROUTES.LIST_ASSETS}/:id`} element={<ITEquipmentDetails />} />
            </Route>
        </Route>
    )
}

export default ITEquipmentRoutes