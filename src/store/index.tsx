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
import UserReducer from "../pages/users/slice/index"
import BranchReducer from "../pages/settings/branch/slice"
import SuppliersReducer from "../pages/settings/suppliers/slice"
import TransportRequestReducer from "../pages/request/transportRequest/slice"
import StatusesReducer from "../pages/settings/statuses/slice"
import AssetsRequestsReducer from "../pages/request/assetRequest/slice"
import InventoryReducer from "../pages/inventory/slice"
import DepartmentReducer from "../pages/settings/departments/slice"
import RoleReducer from "../pages/settings/roles/slice"
import RegionReducer from "../pages/settings/regions/slice"
import DistrictReducer from "../pages/settings/districts/slice"
import CommodityReducer from "../pages/settings/commodity/slice"
import AssetTypeReducer from "../pages/settings/assetTypes/slice"
import TitleReducer from "../pages/settings/titles/slice"
import StoreReducer from "../pages/store/slice"
// All asset categories (including the legacy IT Equipment / Office Equipment /
// Fleet) live in GeneralAssetStore now — the per-category slices have been
// retired in favour of the parameterised `/assets/general/:typeId` route.
import AssetReducer from "../pages/assets/slice"
import GeneralAssetReducer from "../pages/assets/general/slice"
import AssetAssignmentHistoryReducer from "../pages/assets/trails/slice"
import MovementReducer from "../pages/movement/slice"
import ApprovalWorkflowReducer from "../pages/approvalWorkflows/slice"


export const store = configureStore({
    reducer: {
        UserStore: UserReducer,
        BranchStore: BranchReducer,
        SuppliersStore: SuppliersReducer,
        TransportRequestStore: TransportRequestReducer,
        StatusesStore: StatusesReducer,
        AssetsRequestsStore: AssetsRequestsReducer,
        InventoryStore: InventoryReducer,
        DepartmentStore: DepartmentReducer,
        RoleStore: RoleReducer,
        RegionStore: RegionReducer,
        DistrictStore: DistrictReducer,
        CommodityStore: CommodityReducer,
        AssetTypeStore: AssetTypeReducer,
        TitleStore: TitleReducer,
        StoreStore: StoreReducer,
        AssetStore: AssetReducer,
        GeneralAssetStore: GeneralAssetReducer,
        AssetAssignmentHistoryStore: AssetAssignmentHistoryReducer,
        MovementStore: MovementReducer,
        ApprovalWorkflowStore: ApprovalWorkflowReducer,
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
