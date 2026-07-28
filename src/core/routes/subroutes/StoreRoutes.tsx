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
