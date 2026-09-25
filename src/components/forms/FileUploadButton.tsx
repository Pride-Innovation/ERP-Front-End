/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, Box, Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InputFileUpload from "./FileUpload";
import { useContext, useRef, useState } from "react";
import { IFileUploadButton } from "./interface";
import { FileContext } from "../../context/file/FileContext";
import * as XLSX from 'xlsx';
import { pickDataSheet } from './pickDataSheet';
import { toast } from "react-toastify";
import { importTemplates } from "./importTemplates";
import { downloadUserImportTemplate } from "../../pages/users/userImportTemplate";
import { downloadAssetImportTemplate } from "../../pages/assets/assetImportTemplate";

/**
 * Rows past which the browser refuses to even map the sheet.
 *
 * Well above any module's stated cap on purpose: this exists so a mistakenly-chosen 200,000-row
 * export fails with a sentence instead of freezing the tab. The real limits are module policy and
 * are checked against the server's own configuration.
 */
const ABSOLUTE_ROW_CEILING = 20_000;

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

const FileUploadButton = ({ title, module, assetTypeId }: IFileUploadButton) => {
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

    const handleDownloadTemplate = async () => {
        handleMenuClose();

        // The user template is dropdown-validated and pulls live reference
        // data; route to the dedicated generator instead of the static headers.
        if (module === 'user') {
            try {
                await downloadUserImportTemplate();
            } catch (e) {
                console.error('Template download failed', e);
                toast.error('Failed to generate the user import template.');
            }
            return;
        }

        // Assets, like users, need a generated template: the columns and which are required come
        // from the category's field configuration, and the dropdowns from live reference data. The
        // static header list below could give neither, and had no 'General Asset' entry at all —
        // so this menu item used to fail with "No template available" on the assets page.
        if (module === 'General Asset') {
            if (!assetTypeId) {
                toast.error('Open an asset category before downloading its import template.');
                return;
            }
            try {
                await downloadAssetImportTemplate(assetTypeId);
            } catch (e) {
                console.error('Template download failed', e);
                toast.error('Failed to generate the asset import template.');
            }
            return;
        }

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

                const sheetName = pickDataSheet(workbook);
                if (!sheetName) {
                    toast.error('Could not find a data sheet in that file.');
                    return;
                }

                const worksheet = workbook.Sheets[sheetName];
                const rawJson = XLSX.utils.sheet_to_json(worksheet);

                if (rawJson.length === 0) {
                    toast.warning("No data found in the Excel file");
                    return;
                }

                /*
                 * A backstop, not the policy limit.
                 *
                 * Each module states its own row cap and enforces it against the server's
                 * configuration — see the asset import handler. This only stops a file so large that
                 * mapping it here would lock the browser before anything could report on it.
                 */
                if (rawJson.length > ABSOLUTE_ROW_CEILING) {
                    toast.error(
                        `This file has ${rawJson.length.toLocaleString()} rows, which is too many to `
                        + 'process in the browser. Please split it into smaller files.'
                    );
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

    const AMBER = '#B45309';
    const AMBER_LIGHT = alpha('#D97706', 0.08);

    return (
        <>
            <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon sx={{ fontSize: '16px !important' }} />}
                onClick={handleButtonClick}
                aria-controls={menuOpen ? 'import-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                sx={{
                    height: 34, px: 1.75, borderRadius: '8px',
                    border: `1px solid ${alpha(AMBER, 0.3)}`,
                    color: AMBER,
                    textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                    bgcolor: 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': {
                        bgcolor: AMBER_LIGHT,
                        borderColor: alpha(AMBER, 0.6),
                        boxShadow: `0 1px 4px ${alpha(AMBER, 0.15)}`,
                    },
                }}
            >
                Import
            </Button>

            <Menu
                id="import-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            mt: 0.75, minWidth: 210,
                            borderRadius: '10px',
                            border: '1px solid #E8EDF3',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.09)',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                {/* Header label */}
                <Box sx={{ px: 2, pt: 1.25, pb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Import options
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9', mx: 1 }} />
                <Box sx={{ p: 0.5 }}>
                    <MenuItem
                        onClick={handleDownloadTemplate}
                        sx={{
                            borderRadius: '7px', py: 1, px: 1.25, gap: 1,
                            '&:hover': { bgcolor: alpha('#08796C', 0.06) },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <FileDownloadOutlinedIcon sx={{ fontSize: 17, color: '#08796C' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Download Template"
                            secondary="Get the import format"
                            primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 600, color: '#1E293B' }}
                            secondaryTypographyProps={{ fontSize: '0.72rem', color: '#94A3B8' }}
                        />
                    </MenuItem>
                    <MenuItem
                        onClick={handleImportFile}
                        sx={{
                            borderRadius: '7px', py: 1, px: 1.25, gap: 1,
                            '&:hover': { bgcolor: AMBER_LIGHT },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <CloudUploadIcon sx={{ fontSize: 17, color: AMBER }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Upload File"
                            secondary=".xlsx or .csv"
                            primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 600, color: '#1E293B' }}
                            secondaryTypographyProps={{ fontSize: '0.72rem', color: '#94A3B8' }}
                        />
                    </MenuItem>
                </Box>
            </Menu>
            <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
        </>
    );
}

export default FileUploadButton;