/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import { ROUTES } from '../routes'
import TransportRequestsManagement from '../../../pages/request/transportRequest'
import TransportRequest from '../../../pages/request/transportRequest/allRequests'
import TransportPendingRequest from '../../../pages/request/transportRequest/pending'
import TransportRejectedRequest from '../../../pages/request/transportRequest/rejected'
import CreateTranportRequest from '../../../pages/request/transportRequest/CreateTranportRequest'
import UpdateTransportRequest from '../../../pages/request/transportRequest/UpdateTransportRequest'
import { PrivateRoute } from '../PrivateRoutes'
import { PERMISSIONS } from '../../permissions/constants'

const TransportRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_TRANSPORT} />}>
                <Route path={ROUTES.TRANSPORT_REQUEST} element={<TransportRequestsManagement />}>
                    <Route index element={<TransportRequest />} />
                    <Route path={ROUTES.LIST_TRANSPORT_PENDING} element={<TransportPendingRequest />} />
                    <Route path={ROUTES.LIST_TRANSPORT_REJECTED} element={<TransportRejectedRequest />} />
                </Route>
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.CREATE_TRANSPORT} />}>
                <Route path={ROUTES.CREATE_TRANSPORT_REQUEST} element={<CreateTranportRequest />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.UPDATE_TRANSPORT} />}>
                <Route path={`${ROUTES.UPDATE_TRANSPORT_REQUEST}/:id`} element={<UpdateTransportRequest />} />
            </Route>
        </Route>
    )
}

export default TransportRoutes
