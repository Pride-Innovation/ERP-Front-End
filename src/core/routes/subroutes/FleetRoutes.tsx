import { Route } from 'react-router'
import { ROUTES } from '../routes'
import Fleet from '../../../pages/assets/fleet'
import CreateFleet from '../../../pages/assets/fleet/CreateFleet'
import UpdateFleet from '../../../pages/assets/fleet/UpdateFleet'
import FleetDetails from '../../../pages/assets/fleet/view'

const FleetRoutes = () => {
    return (
        <Route>
            <Route path={ROUTES.LIST_FLEET} element={<Fleet />} />
            <Route path={ROUTES.CREATE_FLEET} element={<CreateFleet />} />
            <Route path={`${ROUTES.UPDATE_FLEET}/:id`} element={<UpdateFleet />} />
            <Route path={`${ROUTES.LIST_FLEET}/:id`} element={<FleetDetails />} />
        </Route>
    )
}

export default FleetRoutes