/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Button, alpha } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputFileUpload from "./FileUpload";
import { useContext, useRef } from "react";
import { IFileUploadButton } from "./interface";
import { FileContext } from "../../context/file/FileContext";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";

const toCamelCase = (str: string): string => {
    const cleanStr = str.replace(/[^\w\s]/g, ' ');

    const words = cleanStr.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 0) return '';

    let result = words[0].toLowerCase();

    for (let i = 1; i < words.length; i++) {
        if (words[i]) {
            result += words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
        }
    }

    return result;
};

const FileUploadButton = ({ title, module }: IFileUploadButton) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setFileData } = useContext(FileContext);

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];

        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            ".csv",
            "text/csv"
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid Excel file (.xlsx, .xls)");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!e.target?.result) {
                    console.error("Failed to read file.");
                    return;
                }

                const data = new Uint8Array(e.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                if (workbook.SheetNames.length === 0) {
                    toast.error("Excel file contains no worksheets");
                    return;
                }

                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawJson = XLSX.utils.sheet_to_json(worksheet);

                if (rawJson.length === 0) {
                    toast.warning("No data found in the Excel file");
                    return;
                }

                const transformedJson = rawJson.map(row => {
                    const camelCaseRow: Record<string, any> = {};
                    Object.entries(row as any).forEach(([key, value]) => {
                        const camelCaseKey = toCamelCase(key);
                        camelCaseRow[camelCaseKey] = value;
                    });
                    return camelCaseRow;
                });

                setFileData({
                    file: URL.createObjectURL(file),
                    module,
                    jsonData: transformedJson as Array<{ key: string, value: string | number | object }>
                });

            } catch (error) {
                toast.error("Failed to process the Excel file");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <Button
            sx={{
                textTransform: "capitalize",
                minHeight: "40px",
                width: "100%",
                borderColor: alpha('#BC892C', 0.6),
                '&:hover': {
                    borderColor: '#BC892C',
                    bgcolor: alpha('#BC892C', 0.04)
                }
            }}
            size="medium"
            component="label"
            role={undefined}
            variant="outlined"
            color="secondary"
            tabIndex={-1}
            startIcon={<CloudUploadIcon fontSize="small" sx={{ color: "#BC892C" }} />}
        >
            Import 
            {/* {title} */}
            <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
        </Button>
    );
}

export default FileUploadButton;