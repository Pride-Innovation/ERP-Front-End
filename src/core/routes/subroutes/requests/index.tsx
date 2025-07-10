import { Route } from 'react-router'
import { ROUTES } from '../../routes'
import RequestsManagement from '../../../../pages/request/assetRequest'
import RequestSubroutes from '../Request'
import CreateRequest from '../../../../pages/request/assetRequest/CreateRequest'
import UpdateRequest from '../../../../pages/request/assetRequest/UpdateRequest'
import RequestDetails from '../../../../pages/request/assetRequest/view'
import IssueRequestDetails from '../../../../pages/request/assetRequest/issue/IssueRequestDetails'

const RequestRoutes = () => {
    return (
        <Route>
            <Route path={ROUTES.REQUEST} element={<RequestsManagement />}>
                {RequestSubroutes()}
            </Route>
            <Route path={ROUTES.CREATE_REQUEST} element={<CreateRequest />} />
            <Route path={`${ROUTES.UPDATE_REQUEST}/:id`} element={<UpdateRequest />} />
            <Route path={`${ROUTES.READ_REQUEST}/:id`} element={<RequestDetails />} />
            <Route path={`${ROUTES.ISSUE_REQUEST}/:id`} element={<IssueRequestDetails />} />
        </Route>
    )
}

export default RequestRoutes