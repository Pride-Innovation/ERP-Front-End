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

export const store = configureStore({
    reducer: {
        EquipmentStore: EquipmentReducer,
        UserStore: UserReducer,
        BranchStore: BranchReducer,
        UnitsOfMeasureStore: UnitsOfMeasureReducer,
        SuppliersStore: SuppliersReducer,
        TransportRequestStore: TransportRequestReducer
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
