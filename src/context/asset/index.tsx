import {
    createContext,
    Dispatch,
    FC,
    SetStateAction,
    useState
} from "react";

interface IAssetContext {
    itEquipmentCount: number;
    setItEquipmentCount: Dispatch<SetStateAction<number>>;
    fieldName: string;
    setFieldName: Dispatch<SetStateAction<string>>;
    fieldText: string;
    setFieldText: Dispatch<SetStateAction<string>>;
}

export const AssetContext = createContext<IAssetContext>({} as IAssetContext);

const AssetContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [itEquipmentCount, setItEquipmentCount] = useState<number>(0);
    const [fieldName, setFieldName] = useState<string>('');
    const [fieldText, setFieldText] = useState<string>('');

    return (
        <AssetContext.Provider value={{
            itEquipmentCount,
            setItEquipmentCount,
            fieldName,
            setFieldName,
            fieldText,
            setFieldText
        }}>
            {children}
        </AssetContext.Provider>
    );
}

export default AssetContextProvider;