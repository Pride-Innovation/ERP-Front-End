import {
    configureStore,
    ThunkAction,
    Action
} from '@reduxjs/toolkit';
import EquipmentReducer from "../pages/assets/slice/index"
import UserReducer from "../pages/users/slice/index"
import BranchReducer from "../pages/settings/branch/slice"

export const store = configureStore({
    reducer: {
        EquipmentStore: EquipmentReducer,
        UserStore: UserReducer,
        BranchStore: BranchReducer,
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
