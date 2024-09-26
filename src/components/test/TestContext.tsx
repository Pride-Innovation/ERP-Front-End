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

