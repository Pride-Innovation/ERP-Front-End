/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useState
} from "react";

export interface IFileData {
    file: string;
    module: string;
    jsonData: Array<{ key: string, value: string | object | number }>
}

interface IFileContext {
    fileData: IFileData;
    setFileData: Dispatch<SetStateAction<IFileData>>;
    fileName: string;
    setFileName: Dispatch<SetStateAction<string>>
}

export const FileContext = createContext<IFileContext>({} as IFileContext);

const FileContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fileData, setFileData] = useState<IFileData>({} as IFileData);
    const [fileName, setFileName] = useState<string>("");

    return (
        <FileContext.Provider value={{ fileData, setFileData, fileName, setFileName }}>
            {children}
        </FileContext.Provider>
    )
};

export default FileContextProvider;