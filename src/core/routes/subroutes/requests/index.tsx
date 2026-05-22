import { Route } from 'react-router'
import { ROUTES } from '../../routes'
import RequestsManagement from '../../../../pages/request/assetRequest'
import RequestSubroutes from '../Request'
import CreateRequest from '../../../../pages/request/assetRequest/CreateRequest'
import UpdateRequest from '../../../../pages/request/assetRequest/UpdateRequest'
import RequestDetails from '../../../../pages/request/assetRequest/view'
import IssueRequestDetails from '../../../../pages/request/assetRequest/issue/IssueRequestDetails'
import { PrivateRoute } from '../../PrivateRoutes'
import { PERMISSIONS } from '../../../permissions/constants'

const RequestRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_REQUEST} />}>
                <Route path={ROUTES.REQUEST} element={<RequestsManagement />}>
                    {RequestSubroutes()}
                </Route>
                <Route path={`${ROUTES.READ_REQUEST}/:id`} element={<RequestDetails />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.CREATE_REQUEST} />}>
                <Route path={ROUTES.CREATE_REQUEST} element={<CreateRequest />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.UPDATE_REQUEST} />}>
                <Route path={`${ROUTES.UPDATE_REQUEST}/:id`} element={<UpdateRequest />} />
            </Route>
            <Route element={<PrivateRoute permission={PERMISSIONS.ISSUE_ITEMS} />}>
                <Route path={`${ROUTES.ISSUE_REQUEST}/:id`} element={<IssueRequestDetails />} />
            </Route>
        </Route>
    )
}

export default RequestRoutes
