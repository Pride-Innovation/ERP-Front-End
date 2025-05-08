/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createContext, Dispatch, SetStateAction, useState } from "react";
import { ITest } from "../../mocks/trails";

interface ITestContext {
    tests: ITest[];
    setTests: Dispatch<SetStateAction<ITest[]>>;
}

export const TestContext = createContext<ITestContext>({} as ITestContext);

export const TestContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [tests, setTests] = useState<ITest[]>([] as ITest[])

    return (
        <TestContext.Provider value={{ tests, setTests }}>
            {children}
        </TestContext.Provider>
    )
}

