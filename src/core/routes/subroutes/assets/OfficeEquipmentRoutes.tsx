/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router';
import { ROUTES } from '../../routes';
import OfficeEquipment from '../../../../pages/assets/officeEquipment';
import { PrivateRoute } from '../../PrivateRoutes';
import { permissionsMock } from '../../../../mocks/settings';


const OfficeEquipmentRoutes = () => {
  return (
    <Route>
      <Route element={<PrivateRoute permission={permissionsMock[39]} />}>
        <Route path={ROUTES.LIST_OFFICE_EQUIPMENT} element={<OfficeEquipment />} />
      </Route>
    </Route>
  )
}

export default OfficeEquipmentRoutes