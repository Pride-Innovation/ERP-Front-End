/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import { ROUTES } from '../routes'
import { PrivateRoute } from '../PrivateRoutes'
import { PERMISSIONS } from '../../permissions/constants'
import AdminStore from '../../../pages/store/AdminStore'
import ITStorePage from '../../../pages/store/ITStorePage'
import DisposalStorePage from '../../../pages/store/DisposalStorePage'

const StoreRoutes = () => {
    return (
        <Route element={<PrivateRoute permission={PERMISSIONS.READ_STORE} />}>
            <Route path={ROUTES.STORE_ADMIN} element={<AdminStore />} />
            <Route path={ROUTES.STORE_IT} element={<ITStorePage />} />
            <Route path={ROUTES.STORE_DISPOSAL} element={<DisposalStorePage />} />
        </Route>
    )
}

export default StoreRoutes
