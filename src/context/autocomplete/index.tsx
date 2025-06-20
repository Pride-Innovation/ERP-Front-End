import { createContext, Dispatch, FC, ReactNode, SetStateAction, useState } from "react";
import { IOptions } from "../../components/tables/interface";

interface ISelectedItem {
    item: string;
    id: number | string
}

interface IAutocompleteContext {
    value: IOptions | null;
    setValue: Dispatch<SetStateAction<IOptions | null>>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>>;
    selectedItemDetails: ISelectedItem;
    setSelectedItemDetails: Dispatch<SetStateAction<ISelectedItem>>
    displayDepartment: boolean;
    setDisplayDepartment: Dispatch<SetStateAction<boolean>>
    label: string;
    setLabel: Dispatch<SetStateAction<string>>
}

export const AutocompleteContext = createContext({} as IAutocompleteContext);

const AutocompleteContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [value, setValue] = useState<IOptions | null>(null);
    const [inputValue, setInputValue] = useState<string>("");
    const [selectedItemDetails, setSelectedItemDetails] = useState<ISelectedItem>({} as ISelectedItem);
    const [displayDepartment, setDisplayDepartment] = useState<boolean>(false);
    const [label, setLabel] = useState<string>("")

    return <AutocompleteContext.Provider value={{
        value,
        setValue,
        inputValue,
        setInputValue,
        selectedItemDetails,
        setSelectedItemDetails,
        displayDepartment,
        setDisplayDepartment,
        label,
        setLabel
    }}>
        {children}
    </AutocompleteContext.Provider>
}

export default AutocompleteContextProvider;