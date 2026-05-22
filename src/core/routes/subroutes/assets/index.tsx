/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Navigate, Route } from 'react-router'
import AssetsManagement from '../../../../pages/assets'
import { ROUTES } from '../../routes'
import ITEquipmentRoutes from './ITEquipmentRoutes'
import FleetRoutes from './FleetRoutes'
import OfficeEquipmentRoutes from './OfficeEquipmentRoutes'
import { PrivateRoute } from '../../PrivateRoutes'
import { PERMISSIONS } from '../../../permissions/constants'
import ITEquipmentDetails from '../../../../pages/assets/ITEquipment/view'
import CreateITEquipment from '../../../../pages/assets/ITEquipment/CreateITEquipment'
import UpdateITEquipment from '../../../../pages/assets/ITEquipment/UpdateITEquipment'
import OfficeEquipmentDetails from '../../../../pages/assets/officeEquipment/view'
import FleetDetails from '../../../../pages/assets/fleet/view'
import CreateOfficeEquipment from '../../../../pages/assets/officeEquipment/CreateOfficeEquipment'
import UpdateOfficeEquipment from '../../../../pages/assets/officeEquipment/UpdateOfficeEquipment'
import CreateFleet from '../../../../pages/assets/fleet/CreateFleet'
import UpdateFleet from '../../../../pages/assets/fleet/UpdateFleet'
import GeneralAssets from '../../../../pages/assets/general'
import CreateGeneralAsset from '../../../../pages/assets/general/CreateGeneralAsset'
import UpdateGeneralAsset from '../../../../pages/assets/general/UpdateGeneralAsset'
import GeneralAssetDetails from '../../../../pages/assets/general/view'

const AssetRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_ASSET} />}>
                <Route path={ROUTES.LIST_ASSETS} element={<AssetsManagement />} >
                    {/* Redirect base /assets path to Office Equipment as default */}
                    <Route index element={<Navigate to={ROUTES.LIST_OFFICE_EQUIPMENT} replace />} />
                    {ITEquipmentRoutes()}
                    {FleetRoutes()}
                    {OfficeEquipmentRoutes()}
                    {/* General asset list (parameterized by category typeId) */}
                    <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId`} element={<GeneralAssets />} />
                </Route>
                <Route path={`${ROUTES.LIST_ASSETS}/:id`} element={<ITEquipmentDetails />} />
                <Route path={`${ROUTES.LIST_OFFICE_EQUIPMENT}/:id`} element={<OfficeEquipmentDetails />} />
                <Route path={`${ROUTES.LIST_FLEET}/:id`} element={<FleetDetails />} />
                <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId/view/:id`} element={<GeneralAssetDetails />} />
            </Route>

            {/* IT Equipment Routes */}
            <Route element={<PrivateRoute permission={PERMISSIONS.CREATE_ASSET} />}>
                <Route path={ROUTES.CREATE_ITEQUIPMENT} element={<CreateITEquipment />} />
                <Route path={ROUTES.CREATE_FLEET} element={<CreateFleet />} />
                <Route path={ROUTES.CREATE_OFFICE_EQUIPMENT} element={<CreateOfficeEquipment />} />
                <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId/create`} element={<CreateGeneralAsset />} />
            </Route>

            <Route element={<PrivateRoute permission={PERMISSIONS.UPDATE_ASSET} />}>
                <Route path={`${ROUTES.UPDATE_ITEQUIPMENT}/:id`} element={<UpdateITEquipment />} />
                <Route path={`${ROUTES.UPDATE_FLEET}/:id`} element={<UpdateFleet />} />
                <Route path={`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/:id`} element={<UpdateOfficeEquipment />} />
                <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId/update/:id`} element={<UpdateGeneralAsset />} />
            </Route>
        </Route>
    )
}

export default AssetRoutes
