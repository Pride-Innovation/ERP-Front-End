/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from "react-router"
import { ROUTES } from "../routes"
import PendingRequest from "../../../pages/request/assetRequest/pending"
import Request from "../../../pages/request/assetRequest/allrequests"
import RejectedRequest from "../../../pages/request/assetRequest/rejected"
import IssuedRequest from "../../../pages/request/assetRequest/issue"
import RequestOverview from "../../../pages/request/assetRequest/overview"

const RequestSubroutes = () => {
    return (
        <Route>
            {/* Overview dashboard — shown when landing on /asset-request */}
            <Route index element={<RequestOverview />} />
            {/* All requests table — requires READ_REQUEST */}
            <Route path={ROUTES.LIST_ALL} element={<Request />} />
            {/* Filtered views */}
            <Route path={ROUTES.LIST_PENDING} element={<PendingRequest />} />
            <Route path={ROUTES.LIST_REJECTED} element={<RejectedRequest />} />
            {/* Issued — requires ISSUE_ITEMS permission, enforced in the component */}
            <Route path={ROUTES.LIST_ISSUED} element={<IssuedRequest />} />
        </Route>
    )
}

export default RequestSubroutes
