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

const AssetRoutes = () => {
    return (
        <Route path={ROUTES.LIST_ASSETS} element={<AssetsManagement />} >
            {ITEquipmentRoutes()}
            {FleetRoutes()}
            {OfficeEquipmentRoutes()}
        </Route>
    )
}

export default AssetRoutes