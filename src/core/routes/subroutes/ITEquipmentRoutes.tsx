import { Route } from 'react-router'
import { ROUTES } from '../routes'
import CreateITEquipment from '../../../pages/assets/ITEquipment/CreateITEquipment'
import UpdateITEquipment from '../../../pages/assets/ITEquipment/UpdateITEquipment'
import ITEquipment from '../../../pages/assets/ITEquipment'
import ITEquipmentDetails from '../../../pages/assets/ITEquipment/view'

const ITEquipmentRoutes = () => {
    return (
        <Route>
            <Route index element={<ITEquipment />} />
            <Route path={ROUTES.CREATE_ITEQUIPMENT} element={<CreateITEquipment />} />
            <Route path={`${ROUTES.UPDATE_ITEQUIPMENT}/:id`} element={<UpdateITEquipment />} />
            <Route path={`${ROUTES.LIST_ASSETS}/:id`} element={<ITEquipmentDetails />} />
        </Route>
    )
}

export default ITEquipmentRoutes