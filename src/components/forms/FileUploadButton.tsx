import { Button } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputFileUpload from "./FileUpload";
import { useContext, useRef } from "react";
import { IFileUploadButton } from "./interface";
import { FileContext } from "../../context/file/FileContext";
import * as XLSX from 'xlsx';

const FileUploadButton = ({ title, module }: IFileUploadButton) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setFileData } = useContext(FileContext);

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];

        if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
            file.type !== "application/vnd.ms-excel") {
            alert("Please upload a valid Excel file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) {
                console.error("Failed to read file.");
                return;
            }

            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(worksheet);

            setFileData({
                file: URL.createObjectURL(file),
                module,
                jsonData: json as Array<{ key: string, value: string | number | object }>

            });
        };

        reader.readAsArrayBuffer(file);
    };

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
    );
}

export default FileUploadButton;