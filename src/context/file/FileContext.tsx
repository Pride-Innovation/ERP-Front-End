import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useState
} from "react";

export interface IImageData {
    image: string;
    module: string;
}

interface IFileContext {
    imageData: IImageData;
    setImageData: Dispatch<SetStateAction<IImageData>>;
}

export const FileContext = createContext<IFileContext>({} as IFileContext);

const FileContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [imageData, setImageData] = useState<IImageData>({} as IImageData);

    return (
        <FileContext.Provider value={{ imageData, setImageData }}>
            {children}
        </FileContext.Provider>
    )
}

export default FileContextProvider;