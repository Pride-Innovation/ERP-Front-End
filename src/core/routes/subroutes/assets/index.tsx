/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import AssetsManagement from '../../../../pages/assets'
import { ROUTES } from '../../routes'
import { PrivateRoute } from '../../PrivateRoutes'
import { PERMISSIONS } from '../../../permissions/constants'
import GeneralAssets from '../../../../pages/assets/general'
import CreateGeneralAsset from '../../../../pages/assets/general/CreateGeneralAsset'
import UpdateGeneralAsset from '../../../../pages/assets/general/UpdateGeneralAsset'
import GeneralAssetDetails from '../../../../pages/assets/general/view'
import AssetsLanding from '../../../../pages/assets/AssetsLanding'

/**
 * Every asset category — including the previously-hardcoded IT Equipment /
 * Office Equipment / Fleet pages — now resolves through the single
 * `/assets-mgt/assets/general/:typeId` route. Adding a new category in
 * Settings → Asset Categories automatically gives it a list/create/update/view
 * page with no code changes.
 */
const AssetRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_ASSET} />}>
                <Route path={ROUTES.LIST_ASSETS} element={<AssetsManagement />}>
                    {/* Landing route — picks the first configured asset type and forwards. */}
                    <Route index element={<AssetsLanding />} />
                    <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId`} element={<GeneralAssets />} />
                </Route>
                <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId/view/:id`} element={<GeneralAssetDetails />} />
            </Route>

            <Route element={<PrivateRoute permission={PERMISSIONS.CREATE_ASSET} />}>
                <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId/create`} element={<CreateGeneralAsset />} />
            </Route>

            <Route element={<PrivateRoute permission={PERMISSIONS.UPDATE_ASSET} />}>
                <Route path={`${ROUTES.LIST_GENERAL_ASSETS}/:typeId/update/:id`} element={<UpdateGeneralAsset />} />
            </Route>
        </Route>
    )
}

export default AssetRoutes
