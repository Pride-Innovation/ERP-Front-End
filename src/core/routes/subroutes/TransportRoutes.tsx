import { Route } from 'react-router'
import { ROUTES } from '../routes'
import TransportRequestsManagement from '../../../pages/request/transportRequest'
import TransportRequest from '../../../pages/request/transportRequest/allRequests'
import TransportPendingRequest from '../../../pages/request/transportRequest/pending'
import TransportRejectedRequest from '../../../pages/request/transportRequest/rejected'
import CreateTranportRequest from '../../../pages/request/transportRequest/CreateTranportRequest'
import UpdateTransportRequest from '../../../pages/request/transportRequest/UpdateTransportRequest'

const TransportRoutes = () => {
    return (
        <Route>
            <Route path={ROUTES.TRANSPORT_REQUEST} element={<TransportRequestsManagement />}>
                <Route index element={<TransportRequest />} />
                <Route path={ROUTES.LIST_TRANSPORT_PENDING} element={<TransportPendingRequest />} />
                <Route path={ROUTES.LIST_TRANSPORT_REJECTED} element={<TransportRejectedRequest />} />
            </Route>
            <Route path={ROUTES.CREATE_TRANSPORT_REQUEST} element={<CreateTranportRequest />} />
            <Route path={`${ROUTES.UPDATE_TRANSPORT_REQUEST}/:id`} element={<UpdateTransportRequest />} />
        </Route>
    )
}

export default TransportRoutes