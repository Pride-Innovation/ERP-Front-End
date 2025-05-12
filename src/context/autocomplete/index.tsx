import { createContext, Dispatch, FC, ReactNode, SetStateAction, useState } from "react";
import { IOptions } from "../../components/tables/interface";

interface IAutocompleteContext {
    value: Array<IOptions>;
    setValue: Dispatch<SetStateAction<Array<IOptions>>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>
}

export const AutocompleteContext = createContext({} as IAutocompleteContext);

const AutocompleteContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [value, setValue] = useState<Array<IOptions>>([]);
    const [inputValue, setInputValue] = useState<string>("");

    return <AutocompleteContext.Provider value={{
        value,
        setValue,
        inputValue,
        setInputValue
    }}>
        {children}
    </AutocompleteContext.Provider>
}

export default AutocompleteContextProvider;