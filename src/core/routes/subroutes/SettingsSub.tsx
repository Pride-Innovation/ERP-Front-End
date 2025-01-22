import { Route } from "react-router"
import Settings from "../../../pages/settings"
import { ROUTES } from "../routes"
import Branches from "../../../pages/settings/branch"
import Units from "../../../pages/settings/unit"

const SettingsSubRoutes = () => {

    return (
        <Route>
            <Route index element={<Settings />} />
            <Route path={ROUTES.BRANCHES} element={<Branches />} />
            <Route path={ROUTES.UNITS} element={<Units />} />
        </Route>
    )
}

export default SettingsSubRoutes