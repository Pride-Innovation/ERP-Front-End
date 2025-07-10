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