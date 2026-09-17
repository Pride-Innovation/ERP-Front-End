/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from 'react-router'
import { ROUTES } from '../routes'
import TransportComingSoon from '../../../pages/request/transportRequest/ComingSoon'

/**
 * The Transport Requests backend is not implemented yet, so every transport
 * route renders the Coming Soon page instead of the data-driven screens
 * (which would only surface failed-request errors). The original pages still
 * live in pages/request/transportRequest — restore the previous route
 * elements here once the backend ships.
 *
 * No permission gate on purpose: the module's permissions may not exist yet
 * on the backend, and this page is purely informational. Authentication is
 * still enforced by the parent PrivateRoute layout in AppRoutes.
 */
const TransportRoutes = () => {
    return (
        <Route>
            <Route path={ROUTES.TRANSPORT_REQUEST} element={<TransportComingSoon />} />
            <Route path={ROUTES.LIST_TRANSPORT_PENDING} element={<TransportComingSoon />} />
            <Route path={ROUTES.LIST_TRANSPORT_REJECTED} element={<TransportComingSoon />} />
            <Route path={ROUTES.CREATE_TRANSPORT_REQUEST} element={<TransportComingSoon />} />
            <Route path={`${ROUTES.UPDATE_TRANSPORT_REQUEST}/:id`} element={<TransportComingSoon />} />
        </Route>
    )
}

export default TransportRoutes
