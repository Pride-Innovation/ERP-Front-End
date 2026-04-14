/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import TableUtills from './utills';

interface CustomGridToolbarExportProps {
    module?: string;
    rows?: any[];
}

// const PRIMARY = '#08796C';

const CustomGridToolbarExport = ({ module, rows = [] }: CustomGridToolbarExportProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { generatePDFFromRows, generateExcelFromRows } = TableUtills({ moduleName: module });

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <Box>
            <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDownOutlinedIcon />}
                startIcon={<TableChartOutlinedIcon />}
                onClick={handleOpen}
                sx={{
                    height: 38, px: 2, borderRadius: "8px",
                    border: `1px solid #86EFAC`, color: '#15803D',
                    textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                    '&:hover': { bgcolor: '#F0FDF4', borderColor: '#15803D' },
                    transition: 'all 0.2s',
                }}
            >
                Export
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        borderRadius: "8px", mt: 0.75,
                        border: '1px solid #EEF2F7',
                        minWidth: 180,
                        '& .MuiMenuItem-root': { fontSize: '0.85rem', gap: 1.5, py: 1 },
                    },
                }}
            >
                <MenuItem onClick={() => { generateExcelFromRows(rows); handleClose(); }}>
                    <TableChartOutlinedIcon sx={{ fontSize: 18, color: '#15803D' }} />
                    Download as Excel
                </MenuItem>
                <MenuItem onClick={() => { generatePDFFromRows(rows); handleClose(); }}>
                    <PictureAsPdfOutlinedIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                    Download as PDF
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default CustomGridToolbarExport;
