/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from "react-router"
import { ROUTES } from "../../routes"
import Branches from "../../../../pages/settings/branch"
import Roles from "../../../../pages/settings/roles"
import Suppliers from "../../../../pages/settings/suppliers"
import Departments from "../../../../pages/settings/departments"
import Commodities from "../../../../pages/settings/commodity"
import Titles from "../../../../pages/settings/titles"
import Regions from "../../../../pages/settings/regions"
import AssetTypes from "../../../../pages/settings/assetTypes"
import Units from "../../../../pages/settings/units"
import Consultants from "../../../../pages/settings/consultants"
import Couriers from "../../../../pages/settings/couriers"
import ExportColumns from "../../../../pages/settings/exportColumns"

const SettingsSubRoutes = () => {
    return (
        <Route>
            <Route index element={<Roles />} />
            <Route path={ROUTES.BRANCHES} element={<Branches />} />
            <Route path={ROUTES.COMMODITY} element={<Commodities />} />
            <Route path={ROUTES.TITLES} element={<Titles />} />
            <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
            <Route path={ROUTES.REGIONS} element={<Regions />} />
            <Route path={ROUTES.DEPARTMENT} element={<Departments />} />
            <Route path={ROUTES.UNITS} element={<Units />} />
            <Route path={ROUTES.ASSET_TYPES} element={<AssetTypes />} />
            <Route path={ROUTES.CONSULTANTS} element={<Consultants />} />
            <Route path={ROUTES.COURIERS} element={<Couriers />} />
            <Route path={ROUTES.EXPORT_COLUMNS} element={<ExportColumns />} />
        </Route>
    )
}

export default SettingsSubRoutes