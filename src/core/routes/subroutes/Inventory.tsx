/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import { ROUTES } from '../routes'
import Inventory from '../../../pages/inventory'
import InventoryDetails from '../../../pages/inventory/view/InventoryDetails'
import { PrivateRoute } from '../PrivateRoutes'
import { PERMISSIONS } from '../../permissions/constants'
import CreateInventory from '../../../pages/inventory/CreateInventory'
import UpdateInventory from '../../../pages/inventory/UpdateInventory'

const InventoryRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_INVENTORY} />}>
                <Route path={ROUTES.INVENTORY} index element={<Inventory />} />
                <Route path={`${ROUTES.INVENTORY}/:id`} element={<InventoryDetails />} />
                <Route path={`${ROUTES.READ_INVENTORY}/:id`} element={<InventoryDetails />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.CREATE_INVENTORY} />}>
                <Route path={ROUTES.CREATE_INVENTORY} element={<CreateInventory />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.UPDATE_INVENTORY} />}>
                <Route path={`${ROUTES.UPDATE_INVENTORY}/:id`} element={<UpdateInventory />} />
            </Route>
        </Route>
    )
}

export default InventoryRoutes
