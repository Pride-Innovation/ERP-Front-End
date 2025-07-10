import { Route } from "react-router"
import { PrivateRoute } from "../PrivateRoutes"
import { ROUTES } from "../routes"
import Users from "../../../pages/users"

const UserRoutes = () => {
    return (
        <Route>
            <Route element={<PrivateRoute />}>
                <Route path={ROUTES.USERS} element={<Users />} />
            </Route>
        </Route>
    )
}

export default UserRoutes