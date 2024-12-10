import { Route } from 'react-router';
import { ROUTES } from '../routes';
import OfficeEquipment from '../../../pages/assets/officeEquipment';
import CreateOfficeEquipment from '../../../pages/assets/officeEquipment/CreateOfficeEquipment';
import UpdateOfficeEquipment from '../../../pages/assets/officeEquipment/UpdateOfficeEquipment';
import OfficeEquipmentDetails from '../../../pages/assets/officeEquipment/view';
// import RoutesUtills from '../utills';
import { PrivateRoute } from '../PrivateRoutes';

const OfficeEquipmentRoutes = () => {
  // const { routePermission } = RoutesUtills();

  return (
    <Route>
      <Route element={<PrivateRoute
      // permission={routePermission(12)} 
      />}>
        <Route path={ROUTES.LIST_OFFICE_EQUIPMENT} element={<OfficeEquipment />} />
      </Route>
      <Route path={ROUTES.CREATE_OFFICE_EQUIPMENT} element={<CreateOfficeEquipment />} />
      <Route path={`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/:id`} element={<UpdateOfficeEquipment />} />
      <Route path={`${ROUTES.LIST_OFFICE_EQUIPMENT}/:id`} element={<OfficeEquipmentDetails />} />
    </Route>
  )
}

export default OfficeEquipmentRoutes