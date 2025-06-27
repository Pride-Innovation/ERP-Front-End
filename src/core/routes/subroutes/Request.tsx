import { Route } from "react-router"
import { ROUTES } from "../routes"
import PendingRequest from "../../../pages/request/assetRequest/pending"
import Request from "../../../pages/request/assetRequest/allrequests"
import RejectedRequest from "../../../pages/request/assetRequest/rejected"
import IssuedRequest from "../../../pages/request/assetRequest/issue"

const RequestSubroutes = () => {
    return (
        <Route >
            <Route index element={<Request />} />
            <Route path={ROUTES.LIST_PENDING} element={<PendingRequest />} />
            <Route path={ROUTES.LIST_REJECTED} element={<RejectedRequest />} />
            <Route path={ROUTES.LIST_ISSUED} element={<IssuedRequest />} />
        </Route>
    )
}

export default RequestSubroutes
