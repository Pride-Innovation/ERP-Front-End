/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import { IMovement } from '../../pages/movement/interface';
import { IAsset } from '../../pages/assets/interface';

interface IMovementContext {
    count: number;
    setCount: Dispatch<SetStateAction<number>>;
    currentMovement: IMovement;
    setCurrentMovement: Dispatch<SetStateAction<IMovement>>;
    selectedAssets: IAsset[];
    setSelectedAssets: Dispatch<SetStateAction<IAsset[]>>;
}

export const MovementContext = createContext<IMovementContext>({} as IMovementContext);

const MovementContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [count, setCount] = useState<number>(0);
    const [currentMovement, setCurrentMovement] = useState<IMovement>({} as IMovement);
    const [selectedAssets, setSelectedAssets] = useState<IAsset[]>([]);

    return (
        <MovementContext.Provider value={{
            count,
            setCount,
            currentMovement,
            setCurrentMovement,
            selectedAssets,
            setSelectedAssets,
        }}>
            {children}
        </MovementContext.Provider>
    );
};

export default MovementContextProvider;
