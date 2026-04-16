/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Button, Menu, MenuItem, ListItemIcon, ListItemText, alpha, Divider } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InputFileUpload from "./FileUpload";
import { useContext, useRef, useState } from "react";
import { IFileUploadButton } from "./interface";
import { FileContext } from "../../context/file/FileContext";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { importTemplates } from "./importTemplates";

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDownloadTemplate = () => {
        handleMenuClose();
        const headers = importTemplates[module];
        if (!headers) {
            toast.error(`No template available for module: ${module}`);
            return;
        }
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, `${module.replace(/\s+/g, '_')}_import_template.xlsx`);
    };

    const handleImportFile = () => {
        handleMenuClose();
        inputRef.current?.click();
    };

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
        <>
            <Button
                sx={{
                    textTransform: 'none',
                    height: 40,
                    px: 2,
                    borderRadius: '8px',
                    borderColor: alpha('#BC892C', 0.5),
                    color: '#BC892C',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                        borderColor: '#BC892C',
                        bgcolor: alpha('#BC892C', 0.06),
                        boxShadow: `0 2px 8px ${alpha('#BC892C', 0.2)}`,
                    },
                    transition: 'all 0.2s ease',
                }}
                variant="outlined"
                color="secondary"
                startIcon={<CloudUploadIcon sx={{ fontSize: '17px !important', color: '#BC892C' }} />}
                onClick={handleButtonClick}
                aria-controls={menuOpen ? 'import-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
            >
                Import
            </Button>
            <Menu
                id="import-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        elevation: 3,
                        sx: { borderRadius: '8px', minWidth: 200, mt: 0.5 },
                    },
                }}
            >
                <MenuItem onClick={handleDownloadTemplate}>
                    <ListItemIcon>
                        <FileDownloadOutlinedIcon fontSize="small" sx={{ color: '#08796C' }} />
                    </ListItemIcon>
                    <ListItemText primary="Download Template" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleImportFile}>
                    <ListItemIcon>
                        <CloudUploadIcon fontSize="small" sx={{ color: '#BC892C' }} />
                    </ListItemIcon>
                    <ListItemText primary="Import File" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </MenuItem>
            </Menu>
            <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
        </>
    );
}

export default FileUploadButton;