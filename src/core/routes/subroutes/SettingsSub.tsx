import { Route } from "react-router"
import { ROUTES } from "../routes"
import Branches from "../../../pages/settings/branch"
import UnitMeasures from "../../../pages/settings/unitMeasure"
import Roles from "../../../pages/settings/roles"
import Suppliers from "../../../pages/settings/suppliers"
import Statuses from "../../../pages/settings/statuses"
import Departments from "../../../pages/settings/departments"
import Commodities from "../../../pages/settings/commodity"

const SettingsSubRoutes = () => {

    return (
        <Route>
            <Route index element={<Roles />} />
            <Route path={ROUTES.BRANCHES} element={<Branches />} />
            <Route path={ROUTES.COMMODITY} element={<Commodities />} />
            <Route path={ROUTES.UNITS_MEASURE} element={<UnitMeasures />} />
            <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
            <Route path={ROUTES.STATUSES} element={<Statuses />} />
            <Route path={ROUTES.DEPARTMENT} element={<Departments />} />
        </Route>
    )
}

export default SettingsSubRoutes