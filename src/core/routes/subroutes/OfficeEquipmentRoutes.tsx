import { Route } from 'react-router'
import { ROUTES } from '../routes'
import OfficeEquipment from '../../../pages/assets/officeEquipment'
import CreateOfficeEquipment from '../../../pages/assets/officeEquipment/CreateOfficeEquipment'
import UpdateOfficeEquipment from '../../../pages/assets/officeEquipment/UpdateOfficeEquipment'

const OfficeEquipmentRoutes = () => {
  return (
    <Route>

      <Route path={ROUTES.LIST_OFFICE_EQUIPMENT} element={<OfficeEquipment />} />
      <Route path={ROUTES.CREATE_OFFICE_EQUIPMENT} element={<CreateOfficeEquipment />} />
      <Route path={`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/:id`} element={<UpdateOfficeEquipment />} />
    </Route>
  )
}

export default OfficeEquipmentRoutes