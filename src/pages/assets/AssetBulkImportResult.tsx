/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, alpha, useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import * as XLSX from 'xlsx';
import { IAssetImportResult } from './interface';

const TEAL = '#08796C';
const RED = '#C0392B';

interface Props {
    result: IAssetImportResult;
    /** Rows as parsed from the spreadsheet, so the failed ones can be handed back for correction. */
    sourceRows: any[];
    /** Ordered template headers, so the correction file matches the template it came from. */
    headers: string[];
    handleClose: () => void;
}

const StatCard = ({ label, value, color, icon }: {
    label: string; value: number; color: string; icon: React.ReactNode;
}) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                flex: 1, p: 2, borderRadius: 2,
                border: `1px solid ${alpha(color, 0.25)}`,
                bgcolor: alpha(color, 0.06),
                display: 'flex', alignItems: 'center', gap: 1.5,
            }}
        >
            <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                bgcolor: alpha(color, 0.15), color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" sx={{
                    color: theme.palette.text.secondary, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                    {value.toLocaleString()}
                </Typography>
            </Box>
        </Paper>
    );
};

const AssetBulkImportResult = ({ result, sourceRows, headers, handleClose }: Props) => {
    const theme = useTheme();
    const { total, inserted, failed, errors } = result;

    /**
     * Hands back only the rows that failed, in the template's own shape plus a Reason column.
     *
     * <p>Without this the user has to find twenty scattered rows in a two-thousand-row file by
     * reading row numbers off a screen. With it they fix a short file and upload that — which is
     * safe precisely because the importer refuses duplicates, so nothing already imported can be
     * created twice.
     */
    const downloadFailedRows = () => {
        // Map by the spreadsheet's own "No." where it exists; the error's row number is the same
        // numbering, so a file whose No. column was deleted still lines up by position.
        const byNumber = new Map<number, any>();
        sourceRows.forEach((row, i) => {
            const n = Number(row?.no);
            byNumber.set(Number.isFinite(n) && n > 0 ? n : i + 1, row);
        });

        const aoa: any[][] = [[...headers, 'Reason']];
        errors.forEach((e) => {
            const source = byNumber.get(e.row) ?? {};
            aoa.push([
                ...headers.map((h) => {
                    // Headers camel-case to the keys the parser produced — the same rule that maps
                    // the template to the backend DTO, applied in reverse.
                    const key = h.replace(/[^\w\s]/g, ' ').trim().split(/\s+/)
                        .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
                        .join('');
                    return source[key] ?? '';
                }),
                e.error,
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = [...headers.map(() => ({ wch: 20 })), { wch: 70 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Assets');
        XLSX.writeFile(wb, `failed_asset_rows_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <StatCard label="Total Rows" value={total} color={theme.palette.primary.main} icon={<InventoryOutlinedIcon />} />
                <StatCard label="Assets Created" value={inserted} color={TEAL} icon={<CheckCircleOutlineIcon />} />
                <StatCard label="Failed" value={failed} color={failed > 0 ? RED : theme.palette.text.disabled} icon={<ErrorOutlineIcon />} />
            </Stack>

            {failed > 0 ? (
                <>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Failed Rows</Typography>
                        <Chip
                            size="small"
                            label={`${failed} ${failed === 1 ? 'row' : 'rows'}`}
                            sx={{ bgcolor: alpha(RED, 0.12), color: RED, fontWeight: 600 }}
                        />
                        <Box sx={{ flex: 1 }} />
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                            onClick={downloadFailedRows}
                            sx={{
                                textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                borderRadius: '8px', borderColor: '#E2E8F0', color: TEAL,
                                '&:hover': { borderColor: TEAL, bgcolor: alpha(TEAL, 0.04) },
                            }}
                        >
                            Download failed rows
                        </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1.5 }}>
                        Everything else was imported. Fix these rows and upload them on their own —
                        assets already created will not be duplicated.
                    </Typography>

                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            borderRadius: 2, maxHeight: 360,
                        }}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, width: 70 }}>Row</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Asset Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Engraved No.</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errors.map((e, idx) => (
                                    <TableRow key={`${e.row}-${idx}`} hover>
                                        <TableCell>{e.row}</TableCell>
                                        <TableCell>{e.assetName || '—'}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                                            {e.engravedNumber || '—'}
                                        </TableCell>
                                        <TableCell sx={{ color: RED }}>{e.error}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3, borderRadius: 2, textAlign: 'center',
                        border: `1px dashed ${alpha(TEAL, 0.4)}`,
                        bgcolor: alpha(TEAL, 0.04),
                    }}
                >
                    <CheckCircleOutlineIcon sx={{ fontSize: 36, color: TEAL, mb: 0.5 }} />
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        All rows were imported successfully.
                    </Typography>
                </Paper>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleClose}
                    sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: '#065F55' }, px: 3 }}
                >
                    Close
                </Button>
            </Box>
        </Box>
    );
};

export default AssetBulkImportResult;
