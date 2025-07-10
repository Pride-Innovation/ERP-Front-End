import { Route } from 'react-router'
import { ROUTES } from '../routes'
import Inventory from '../../../pages/inventory'
import InventoryDetails from '../../../pages/inventory/view/InventoryDetails'
import { PrivateRoute } from '../PrivateRoutes'
import { permissionsMock } from '../../../mocks/settings'
import CreateInventory from '../../../pages/inventory/CreateInventory'
import UpdateInventory from '../../../pages/inventory/UpdateInventory'

const InventoryRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={permissionsMock[23]} />}>
                <Route path={ROUTES.INVENTORY} index element={<Inventory />} />
            </Route>
            <Route path={`${ROUTES.INVENTORY}/:id`} element={<InventoryDetails />} />
            <Route path={`${ROUTES.READ_INVENTORY}/:id`} element={<InventoryDetails />} />
            <Route path={ROUTES.CREATE_INVENTORY} element={<CreateInventory />} />
            <Route path={`${ROUTES.UPDATE_INVENTORY}/:id`} element={<UpdateInventory />} />
        </Route>
    )
}

export default InventoryRoutes