import { createContext, Dispatch, SetStateAction, useState } from "react";

interface IFormContext {
    tableStartDate: Date | null;
    tableEndDate: Date | null;
    setTableStartDate: Dispatch<SetStateAction<Date | null>>;
    setTableEndDate: Dispatch<SetStateAction<Date | null>>;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

const FormContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [tableStartDate, setTableStartDate] = useState<Date | null>(null);
    const [tableEndDate, setTableEndDate] = useState<Date | null>(null);


    return (
        <FormContext.Provider value={{
            tableStartDate,
            tableEndDate,
            setTableStartDate,
            setTableEndDate
        }}>
            {children}
        </FormContext.Provider>
    );
};
export default FormContextProvider;