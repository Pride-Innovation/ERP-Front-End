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
import MyItems from '../../../pages/store/MyItems'
import StockTake from '../../../pages/store/StockTake'
import StockCountSheet from '../../../pages/store/StockCountSheet'

const StoreRoutes = () => {
    return (
        <>
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_STORE} />}>
                <Route path={ROUTES.STORE_ADMIN} element={<AdminStore />} />
                <Route path={ROUTES.STORE_IT} element={<ITStorePage />} />
                <Route path={ROUTES.STORE_DISPOSAL} element={<DisposalStorePage />} />
            </Route>
            {/*
              * Stock take answers to its own permission, not to READ_STORE.
              *
              * Both its endpoints require READ_STOCK_TAKE. Sitting under READ_STORE, the page opened
              * for anyone who could see a store — a branch BOM among them — and then both calls came
              * back 403, so the screen rendered "Access Denied" over "Could not load stock takes."
              * That reads as a broken page rather than as a boundary.
              *
              * READ_STOCK_TAKE is granted to no role by default, so this route is closed until it is
              * granted in Settings → Roles. That is the intended shape: reading a count is a
              * narrower thing than seeing what a store holds.
              */}
            <Route element={<PrivateRoute permission={PERMISSIONS.READ_STOCK_TAKE} />}>
                {/* Declared before the /:id route so "stock-take" isn't captured as a count id. */}
                <Route path={ROUTES.STOCK_TAKE} element={<StockTake />} />
                <Route path={`${ROUTES.STOCK_TAKE}/:id`} element={<StockCountSheet />} />
            </Route>
            {/* Deliberately outside READ_STORE: this shows only what the signed-in user already
                holds, so it needs no store-visibility permission. */}
            <Route path={ROUTES.MY_ITEMS} element={<MyItems />} />
        </>
    )
}

export default StoreRoutes
