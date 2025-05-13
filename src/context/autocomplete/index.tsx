import { createContext, Dispatch, FC, ReactNode, SetStateAction, useState } from "react";
import { IOptions } from "../../components/tables/interface";

interface IAutocompleteContext {
    value: IOptions | null;
    setValue: Dispatch<SetStateAction<IOptions | null>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>
}

export const AutocompleteContext = createContext({} as IAutocompleteContext);

const AutocompleteContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [value, setValue] = useState<IOptions | null>(null);
    const [inputValue, setInputValue] = useState<string>("");

    return <AutocompleteContext.Provider value={{
        value,
        setValue,
        inputValue,
        setInputValue,
    }}>
        {children}
    </AutocompleteContext.Provider>
}

export default AutocompleteContextProvider;