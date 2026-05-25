/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

export interface IBulkImportRowError {
    row: number;
    name?: string | null;
    staffNumber?: string | null;
    email?: string | null;
    error: string;
}

export interface IBulkImportResult {
    success: boolean;
    total: number;
    inserted: number;
    failed: number;
    errors: IBulkImportRowError[];
}

interface Props {
    result: IBulkImportResult;
    handleClose: () => void;
}

const StatCard = ({
    label,
    value,
    color,
    icon,
}: {
    label: string;
    value: number;
    color: string;
    icon: React.ReactNode;
}) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(color, 0.25)}`,
                bgcolor: alpha(color, 0.06),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: alpha(color, 0.15),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                    {value.toLocaleString()}
                </Typography>
            </Box>
        </Paper>
    );
};

const BulkImportResult = ({ result, handleClose }: Props) => {
    const theme = useTheme();
    const { total, inserted, failed, errors } = result;

    return (
        <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <StatCard
                    label="Total Records"
                    value={total}
                    color={theme.palette.primary.main}
                    icon={<InventoryOutlinedIcon />}
                />
                <StatCard
                    label="Successfully Created"
                    value={inserted}
                    color="#08796C"
                    icon={<CheckCircleOutlineIcon />}
                />
                <StatCard
                    label="Failed"
                    value={failed}
                    color={failed > 0 ? '#C0392B' : theme.palette.text.disabled}
                    icon={<ErrorOutlineIcon />}
                />
            </Stack>

            {failed > 0 ? (
                <>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Failed Records
                        </Typography>
                        <Chip
                            size="small"
                            label={`${failed} ${failed === 1 ? 'row' : 'rows'}`}
                            sx={{
                                bgcolor: alpha('#C0392B', 0.12),
                                color: '#C0392B',
                                fontWeight: 600,
                            }}
                        />
                    </Stack>
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            borderRadius: 2,
                            maxHeight: 360,
                        }}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, width: 70 }}>Row</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Staff Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errors.map((e, idx) => (
                                    <TableRow key={`${e.row}-${idx}`} hover>
                                        <TableCell>{e.row}</TableCell>
                                        <TableCell>{e.staffNumber || '—'}</TableCell>
                                        <TableCell sx={{ wordBreak: 'break-all' }}>{e.email || '—'}</TableCell>
                                        <TableCell sx={{ color: '#C0392B' }}>{e.error}</TableCell>
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
                        p: 3,
                        borderRadius: 2,
                        textAlign: 'center',
                        border: `1px dashed ${alpha('#08796C', 0.4)}`,
                        bgcolor: alpha('#08796C', 0.04),
                    }}
                >
                    <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#08796C', mb: 0.5 }} />
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        All records were imported successfully.
                    </Typography>
                </Paper>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleClose}
                    sx={{
                        textTransform: 'none',
                        bgcolor: '#08796C',
                        '&:hover': { bgcolor: '#065F55' },
                        px: 3,
                    }}
                >
                    Close
                </Button>
            </Box>
        </Box>
    );
};

export default BulkImportResult;
