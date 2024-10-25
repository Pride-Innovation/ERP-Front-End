import {
    configureStore,
    ThunkAction,
    Action
} from '@reduxjs/toolkit';
import ITEquipmentReducer from "../pages/assets/slice/index"

const store = configureStore({
    reducer: {
        ITEquipmentStore: ITEquipmentReducer,
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
