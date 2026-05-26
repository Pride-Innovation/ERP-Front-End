/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import { alpha, Box, Button, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TableUtills from './utills';
import { OnExportHandler } from './interface';

const PRIMARY = '#08796C';
const GREEN   = '#15803d';

interface CustomGridToolbarExportProps {
    module?: string;
    rows?: any[];
    onExport?: OnExportHandler;
}

const CustomGridToolbarExport = ({ module, rows = [], onExport }: CustomGridToolbarExportProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [busy, setBusy] = useState(false);
    const open = Boolean(anchorEl);
    const { generatePDFFromRows, generateExcelFromRows } = TableUtills({ moduleName: module });

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const runExport = async (format: 'pdf' | 'excel') => {
        handleClose();
        if (onExport) {
            try { setBusy(true); await onExport(format); }
            finally { setBusy(false); }
            return;
        }
        if (format === 'excel') generateExcelFromRows(rows);
        else generatePDFFromRows(rows);
    };

    return (
        <Box>
            <Button
                variant="outlined"
                size="small"
                onClick={handleOpen}
                disabled={busy}
                startIcon={busy
                    ? <CircularProgress size={13} sx={{ color: GREEN }} />
                    : <FileDownloadOutlinedIcon sx={{ fontSize: '16px !important' }} />
                }
                endIcon={<KeyboardArrowDownOutlinedIcon sx={{
                    fontSize: '15px !important',
                    transition: 'transform 0.2s',
                    transform: open ? 'rotate(180deg)' : 'none',
                }} />}
                sx={{
                    height: 34, px: 1.75, borderRadius: '8px',
                    border: `1px solid ${alpha(GREEN, 0.3)}`,
                    color: GREEN,
                    textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                    bgcolor: 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': {
                        bgcolor: alpha(GREEN, 0.06),
                        borderColor: alpha(GREEN, 0.6),
                        boxShadow: `0 1px 4px ${alpha(GREEN, 0.15)}`,
                    },
                    '&.Mui-disabled': { opacity: 0.6 },
                }}
            >
                {busy ? 'Exporting…' : 'Export'}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 0.75,
                        minWidth: 200,
                        borderRadius: '10px',
                        border: '1px solid #E8EDF3',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.09)',
                        overflow: 'hidden',
                    },
                }}
            >
                {/* Header label */}
                <Box sx={{ px: 2, pt: 1.25, pb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Download as
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9', mx: 1 }} />
                <Box sx={{ p: 0.5 }}>
                    <MenuItem
                        onClick={() => runExport('excel')}
                        sx={{
                            borderRadius: '7px', py: 1, px: 1.25, gap: 1,
                            '&:hover': { bgcolor: alpha(GREEN, 0.06) },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <TableChartOutlinedIcon sx={{ fontSize: 17, color: GREEN }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Excel Spreadsheet"
                            secondary=".xlsx format"
                            primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 600, color: '#1E293B' }}
                            secondaryTypographyProps={{ fontSize: '0.72rem', color: '#94A3B8' }}
                        />
                    </MenuItem>
                    <MenuItem
                        onClick={() => runExport('pdf')}
                        sx={{
                            borderRadius: '7px', py: 1, px: 1.25, gap: 1,
                            '&:hover': { bgcolor: alpha('#DC2626', 0.05) },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                            <PictureAsPdfOutlinedIcon sx={{ fontSize: 17, color: '#DC2626' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="PDF Document"
                            secondary=".pdf format"
                            primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: 600, color: '#1E293B' }}
                            secondaryTypographyProps={{ fontSize: '0.72rem', color: '#94A3B8' }}
                        />
                    </MenuItem>
                </Box>
            </Menu>
        </Box>
    );
};

export default CustomGridToolbarExport;
