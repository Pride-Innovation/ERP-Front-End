/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    configureStore,
    ThunkAction,
    Action
} from '@reduxjs/toolkit';
import EquipmentReducer from "../pages/assets/slice/index"
import UserReducer from "../pages/users/slice/index"
import BranchReducer from "../pages/settings/branch/slice"
import UnitsOfMeasureReducer from "../pages/settings/unitMeasure/slice"
import SuppliersReducer from "../pages/settings/suppliers/slice"
import TransportRequestReducer from "../pages/request/transportRequest/slice"
import StatusesReducer from "../pages/settings/statuses/slice"
import AssetsRequestsReducer from "../pages/request/assetRequest/slice"
import InventoryReducer from "../pages/inventory/slice"
import UnitReducer from "../pages/settings/unit/slice"
import DepartmentReducer from "../pages/settings/departments/slice"

export const store = configureStore({
    reducer: {
        EquipmentStore: EquipmentReducer,
        UserStore: UserReducer,
        BranchStore: BranchReducer,
        UnitsOfMeasureStore: UnitsOfMeasureReducer,
        SuppliersStore: SuppliersReducer,
        TransportRequestStore: TransportRequestReducer,
        StatusesStore: StatusesReducer,
        AssetsRequestsStore: AssetsRequestsReducer,
        InventoryStore: InventoryReducer,
        UnitStore: UnitReducer,
        DepartmentStore: DepartmentReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
