/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import AssetsManagement from '../../../../pages/assets'
import { ROUTES } from '../../routes'
import ITEquipmentRoutes from './ITEquipmentRoutes'
import FleetRoutes from './FleetRoutes'
import OfficeEquipmentRoutes from './OfficeEquipmentRoutes'
import { PrivateRoute } from '../../PrivateRoutes'
import { permissionsMock } from '../../../../mocks/settings'
import ITEquipmentDetails from '../../../../pages/assets/ITEquipment/view'
import CreateITEquipment from '../../../../pages/assets/ITEquipment/CreateITEquipment'
import UpdateITEquipment from '../../../../pages/assets/ITEquipment/UpdateITEquipment'
import OfficeEquipmentDetails from '../../../../pages/assets/officeEquipment/view'
import FleetDetails from '../../../../pages/assets/fleet/view'
import CreateOfficeEquipment from '../../../../pages/assets/officeEquipment/CreateOfficeEquipment'
import UpdateOfficeEquipment from '../../../../pages/assets/officeEquipment/UpdateOfficeEquipment'

const AssetRoutes = () => {
    return (
        <Route>
            <Route path={ROUTES.LIST_ASSETS} element={<AssetsManagement />} >
                {ITEquipmentRoutes()}
                {FleetRoutes()}
                {OfficeEquipmentRoutes()}
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route path={`${ROUTES.LIST_ASSETS}/:id`} element={<ITEquipmentDetails />} />
            </Route>

            {/* IT Equipment Routes */}
            <Route element={<PrivateRoute permission={permissionsMock[40]} />}>
                <Route path={ROUTES.CREATE_ITEQUIPMENT} element={<CreateITEquipment />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[42]} />}>
                <Route path={`${ROUTES.UPDATE_ITEQUIPMENT}/:id`} element={<UpdateITEquipment />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route path={`${ROUTES.LIST_OFFICE_EQUIPMENT}/:id`} element={<OfficeEquipmentDetails />} />
            </Route>

            {/* Fleet Routes */}
            <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
                <Route path={`${ROUTES.LIST_FLEET}/:id`} element={<FleetDetails />} />
            </Route>

            {/* Office Equipment Routes */}
            <Route element={<PrivateRoute permission={permissionsMock[40]} />}>
                <Route path={ROUTES.CREATE_OFFICE_EQUIPMENT} element={<CreateOfficeEquipment />} />
            </Route>
            <Route element={<PrivateRoute permission={permissionsMock[42]} />}>
                <Route path={`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/:id`} element={<UpdateOfficeEquipment />} />
            </Route>
        </Route>
    )
}

export default AssetRoutes