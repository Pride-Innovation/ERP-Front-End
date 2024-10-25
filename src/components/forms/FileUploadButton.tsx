import { Button } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputFileUpload from "./FileUpload";
import { useContext, useRef } from "react";
import { IFileUploadButton } from "./interface";
import { FileContext } from "../../context/file/FileContext";

const FileUploadButton = ({ title, module }: IFileUploadButton) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setImageData } = useContext(FileContext);

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];

        setImageData({
            image: URL.createObjectURL(file),
            module
        });
    }

    return (
        <Button
            sx={{ textTransform: "capitalize", minHeight: "40px", width: "100%" }}
            size="medium"
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<CloudUploadIcon fontSize="large" />}
        >
            Import {title}
            <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
        </Button>
    )
}

export default FileUploadButton;