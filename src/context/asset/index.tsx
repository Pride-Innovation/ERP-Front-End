import { IOptions } from '../../components/tables/interface';
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
    officeEquipmentCount: number;
    setOfficeEquipmentCount: Dispatch<SetStateAction<number>>;
    options: Array<IOptions>,
    setOptions: Dispatch<SetStateAction<Array<IOptions>>>
}

export const AssetContext = createContext<IAssetContext>({} as IAssetContext);

const AssetContextProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [itEquipmentCount, setItEquipmentCount] = useState<number>(0);
    const [officeEquipmentCount, setOfficeEquipmentCount] = useState<number>(0);
    const [fieldName, setFieldName] = useState<string>('');
    const [fieldText, setFieldText] = useState<string>('');
    const [options, setOptions] = useState<Array<IOptions>>([] as Array<IOptions>);

    return (
        <AssetContext.Provider value={{
            itEquipmentCount,
            setItEquipmentCount,
            fieldName,
            setFieldName,
            fieldText,
            setFieldText,
            officeEquipmentCount,
            setOfficeEquipmentCount,
            options,
            setOptions
        }}>
            {children}
        </AssetContext.Provider>
    );
}

export default AssetContextProvider;