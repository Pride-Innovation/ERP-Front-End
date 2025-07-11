/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Route } from "react-router"
import { PrivateRoute } from "../PrivateRoutes"
import { ROUTES } from "../routes"
import Users from "../../../pages/users"
import { permissionsMock } from "../../../mocks/settings"

const UserRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute permission={permissionsMock[9]} />}>
                <Route path={ROUTES.USERS} element={<Users />} />
            </Route>
        </Route>
    )
}

export default UserRoutes