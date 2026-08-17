import { useContext, useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    Button,
    Typography,
    alpha,
    Chip,
    Tooltip,
    Stack,
    Card,
    Select,
    MenuItem,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import CommodityUtills from '../../pages/settings/commodity/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { RequestContext } from '../../context/request/RequestContext';
import { RowData } from './interface';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import EighteenMpOutlinedIcon from '@mui/icons-material/EighteenMpOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import FilterEngravedNumbers from './filterEngravedNumbers';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { StatusChip, StatusTone } from '../layout';
import {
    dataHeadCellSx, dataBodyCellSx, dataRowSx, dataSurfaceSx,
} from '../tables/dataTableSx';
import { brand, gold, neutral, border, status as statusTokens } from '../../utils/tokens';

const PRIMARY_COLOR = brand[500];
const SECONDARY_COLOR = gold[500];

/**
 * Live fulfilment state for one line, when this table is filling a request.
 *
 * <p>Supplied by the page rather than derived here: readiness depends on the request being
 * fulfilled, which this component knows nothing about.
 */
export interface IInventoryLineStatus {
    label: string;
    tone: StatusTone;
    /** What the request asked for, shown against the quantity when the two diverge. */
    requestedQuantity?: number;
}

/** Rail colour per readiness tone, so a row can be judged from the margin alone. */
const TONE_RAIL: Partial<Record<StatusTone, string>> = {
    success: statusTokens.success.main,
    danger: statusTokens.danger.main,
    pending: gold[500],
    neutral: neutral[300],
};

const selectSx = {
    fontSize: '0.83rem',
    borderRadius: '7px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(PRIMARY_COLOR, 0.5) },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY_COLOR, borderWidth: 1.5 },
};

const tableHeaders = [
    {
        id: 'assetType',
        name: 'Asset Type',
        icon: <AppRegistrationOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Select the category of asset'
    },
    {
        id: 'name',
        name: 'Name',
        icon: <FeedOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Select the specific item name'
    },
    {
        id: 'uom',
        name: "Unit of Measure",
        icon: <ScaleOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'How the item is measured'
    },
    {
        id: 'quantity',
        name: "Quantity",
        icon: <EighteenMpOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Number of items requested'
    },
    {
        id: 'engraved',
        name: "Engraved Numbers",
        icon: <FeedOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Asset tracking identifiers',
        conditionalRender: 'issue'
    },
    {
        id: 'status',
        name: "Status",
        icon: <TaskAltOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Whether this line is ready to be issued',
        conditionalRender: 'status'
    },
    {
        id: 'remove',
        name: "Actions",
        icon: <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Remove this item from request'
    }
];

const NoItemsPlaceholder = ({ message, onAddItem }: { message: string; onAddItem: () => void }) => (
    <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
            width: 52, height: 52, borderRadius: '12px',
            bgcolor: alpha(PRIMARY_COLOR, 0.08),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <InventoryIcon sx={{ fontSize: 26, color: PRIMARY_COLOR }} />
        </Box>
        <Typography sx={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
            {message}
        </Typography>
        <Button
            variant="outlined"
            startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
            onClick={onAddItem}
            size="small"
            sx={{
                mt: 0.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                height: 32,
                px: 2,
                borderRadius: '8px',
                borderColor: alpha(PRIMARY_COLOR, 0.4),
                color: PRIMARY_COLOR,
                '&:hover': { borderColor: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.05) },
            }}
        >
            Add First Item
        </Button>
    </Box>
);

const InventoryTable = ({ issue, title, lineStatus }: {
    issue?: boolean;
    title: string;
    /**
     * Per-line readiness, when this table is fulfilling a request. Supplying it adds a Status
     * column and a coloured rail on each row, so the issuer sees what is outstanding on the same
     * row they act on — rather than cross-referencing a second table of the same lines.
     */
    lineStatus?: (row: RowData) => IInventoryLineStatus | null;
}) => {
    const { fetchAllCommodities } = CommodityUtills();
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string, assetTypeId: number | string }[]>([]);
    const { rows, setRows, setAssetType } = useContext(RequestContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null);

    const handleInputChange = (id: number, field: keyof RowData, value: any) => {
        if (field === 'quantity' && value < 0) {
            value = 0;
        }

        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updatedRows);
    };

    const handleAssetTypeNameChange = (id: number, value: string) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, assetTypeId: value, name: '', groupName: '' } : row
        );
        setRows(updatedRows);

        const selectedType = assetTypes.find((asstyp) => asstyp.id === value);
        if (selectedType) {
            setAssetType(selectedType);
            fetchAllCommodities({ assetTypeId: selectedType.id });
        }
    };

    const handleNameChange = (id: number, value: string) => {
        const selectedItem = commodities.find(item => item.name === value);

        if (!selectedItem) return;

        const updatedRows = rows.map(row =>
            row.id === id
                ? {
                    ...row,
                    name: value,
                    groupName: selectedItem.groupName,
                    commodityId: selectedItem.id as number,
                }
                : row
        );
        setRows(updatedRows);
    };

    const handleAddRow = () => {
        const newId = Date.now();
        setRows([
            ...rows,
            { id: newId, name: '', groupName: '', quantity: 1, commodityId: undefined },
        ]);
        setRecentlyAdded(newId);

        setTimeout(() => {
            setRecentlyAdded(null);
        }, 2000);
    };

    const handleRemoveRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    useEffect(() => {
        if (commodities && commodities.length > 0) {
            const options = commodities.map((item: any) => ({
                name: item.name,
                groupName: item.groupName,
                assetTypeId: item?.assetType?.id
            }));

            setItemOptions(prev => {
                const merged = [...options, ...prev];
                const uniqueByName = Array.from(new Map(merged.map(item => [item.name, item])).values());
                return uniqueByName;
            });
        }
    }, [commodities]);

    const visibleHeaders = tableHeaders.filter(header => {
        if (header.conditionalRender === 'issue') {
            return issue;
        }
        // The Status column exists only when a caller supplies readiness — on the plain request
        // form there is no request to be ready against.
        if (header.conditionalRender === 'status') {
            return !!lineStatus;
        }
        return true;
    });

    return (
        <Card elevation={0} sx={{ ...dataSurfaceSx, width: '100%' }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    borderBottom: `1px solid ${border.subtle}`,
                    px: { xs: 1.5, sm: 2 },
                    py: 1.25,
                    bgcolor: neutral[50],
                }}
            >
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                        sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            width: 32,
                            height: 32,
                        }}
                    >
                        <InventoryIcon sx={{ color: PRIMARY_COLOR, fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>
                        {title}
                    </Typography>
                    <Chip
                        label={`${rows.length} ${rows.length === 1 ? 'item' : 'items'}`}
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            border: 'none',
                        }}
                    />
                </Stack>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
                    onClick={handleAddRow}
                    size="small"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        height: 30,
                        px: 1.5,
                        borderRadius: '7px',
                        borderColor: alpha(PRIMARY_COLOR, 0.35),
                        color: PRIMARY_COLOR,
                        bgcolor: 'white',
                        '&:hover': {
                            bgcolor: alpha(PRIMARY_COLOR, 0.05),
                            borderColor: PRIMARY_COLOR,
                        },
                    }}
                >
                    Add Item
                </Button>
            </Box>

            <TableContainer
                sx={{
                    maxHeight: rows.length > 5 ? 400 : 'auto',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: alpha('#000', 0.05),
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha('#000', 0.2),
                        borderRadius: '3px',
                        '&:hover': {
                            backgroundColor: alpha('#000', 0.3),
                        }
                    }
                }}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {visibleHeaders.map((header) => (
                                <TableCell
                                    key={header.id}
                                    align={header.id === 'quantity' || header.id === 'remove' ? 'center' : 'left'}
                                    sx={{ ...dataHeadCellSx, px: { xs: 1, sm: 1.5 } }}
                                >
                                    <Tooltip title={header.tooltip} arrow placement="top">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {header.icon}
                                            {header.name}
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={visibleHeaders.length} align="center" sx={{ py: 6 }}>
                                    <NoItemsPlaceholder
                                        message="No items added to request"
                                        onAddItem={handleAddRow}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row, rowIndex) => {
                                const status = lineStatus?.(row) ?? null;
                                return (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        ...dataRowSx(rowIndex),
                                        // A freshly added row keeps its brief highlight, and a line
                                        // being fulfilled carries a rail in its readiness colour so
                                        // the outstanding ones are findable without reading across.
                                        ...(recentlyAdded === row.id ? { bgcolor: alpha(PRIMARY_COLOR, 0.05) } : {}),
                                        ...(status ? { boxShadow: `inset 3px 0 0 ${TONE_RAIL[status.tone] ?? neutral[300]}` } : {}),
                                    }}
                                >
                                    {/* Asset Type */}
                                    <TableCell sx={{ ...dataBodyCellSx, px: { xs: 1, sm: 1.5 } }}>
                                        <Select
                                            fullWidth
                                            value={row.assetTypeId || ''}
                                            onChange={(e) => handleAssetTypeNameChange(row.id, e.target.value as string)}
                                            displayEmpty
                                            size="small"
                                            sx={selectSx}
                                        >
                                            <MenuItem value="" disabled><em>Select Type</em></MenuItem>
                                            {assetTypes.map((assetTyp) => (
                                                <MenuItem key={assetTyp.id} value={assetTyp.id}>{assetTyp.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>

                                    {/* Name */}
                                    <TableCell sx={{ ...dataBodyCellSx, px: { xs: 1, sm: 1.5 } }}>
                                        <Select
                                            fullWidth
                                            value={row.name || ''}
                                            onChange={(e) => handleNameChange(row.id, e.target.value as string)}
                                            displayEmpty
                                            size="small"
                                            disabled={!row.assetTypeId}
                                            sx={{
                                                ...selectSx,
                                                '&.Mui-disabled': { bgcolor: '#F8FAFC' },
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>{row.assetTypeId ? 'Select Item' : 'Select type first'}</em>
                                            </MenuItem>
                                            {itemOptions
                                                .filter((ele) => ele.assetTypeId === row.assetTypeId)
                                                .map((item) => (
                                                    <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
                                                ))}
                                        </Select>
                                    </TableCell>

                                    {/* Unit of Measure */}
                                    <TableCell sx={{ ...dataBodyCellSx, px: { xs: 1, sm: 1.5 } }}>
                                        {row.groupName ? (
                                            <Chip
                                                label={row.groupName}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    bgcolor: alpha(SECONDARY_COLOR, 0.08),
                                                    color: SECONDARY_COLOR,
                                                    border: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`,
                                                }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                                                —
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Quantity */}
                                    <TableCell align="center" sx={{ ...dataBodyCellSx, px: { xs: 1, sm: 1.5 } }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            bgcolor: '#fff',
                                            px: 0.25,
                                            maxWidth: 110,
                                            mx: 'auto',
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleInputChange(row.id, 'quantity', Math.max(0, row.quantity - 1))}
                                                sx={{ p: 0.5 }}
                                                disabled={row.quantity <= 0}
                                            >
                                                <RemoveCircleOutlineIcon fontSize="small" sx={{
                                                    fontSize: 16,
                                                    color: row.quantity <= 0 ? '#CBD5E1' : SECONDARY_COLOR,
                                                }} />
                                            </IconButton>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.quantity}
                                                onChange={(e) => handleInputChange(
                                                    row.id,
                                                    'quantity',
                                                    e.target.value === '' ? 0 : parseInt(e.target.value),
                                                )}
                                                inputProps={{ min: 0, style: { textAlign: 'center', width: 36, padding: '3px 0' } }}
                                                variant="standard"
                                                sx={{
                                                    '& input': { fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' },
                                                    '& .MuiInput-underline:before, & .MuiInput-underline:after': { borderBottom: 'none' },
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleInputChange(row.id, 'quantity', row.quantity + 1)}
                                                sx={{ p: 0.5 }}
                                            >
                                                <AddCircleOutlineOutlinedIcon fontSize="small" sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>

                                    {issue && <FilterEngravedNumbers row={row} />}

                                    {/* Readiness — only when a caller is fulfilling a request. */}
                                    {status && (
                                        <TableCell sx={{ ...dataBodyCellSx, px: { xs: 1, sm: 1.5 } }}>
                                            <StatusChip label={status.label} tone={status.tone} />
                                        </TableCell>
                                    )}

                                    {/* Actions */}
                                    <TableCell align="center" sx={{ ...dataBodyCellSx, px: 1 }}>
                                        <Tooltip title={rows.length <= 1 ? 'At least one item is required' : 'Remove this item'}>
                                            <span>
                                                <IconButton
                                                    onClick={() => handleRemoveRow(row.id)}
                                                    disabled={rows.length <= 1}
                                                    size="small"
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        border: '1px solid #FEE2E2',
                                                        bgcolor: '#FFF5F5',
                                                        '&:disabled': { opacity: 0.35, bgcolor: 'transparent', border: '1px solid #E2E8F0' },
                                                        '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' },
                                                    }}
                                                >
                                                    <DeleteOutlineIcon sx={{ fontSize: 15, color: rows.length <= 1 ? '#CBD5E1' : '#EF4444' }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {rows.length > 0 && (
                <Box sx={{
                    px: 2,
                    py: 1.25,
                    borderTop: '1px solid #F1F5F9',
                    bgcolor: '#FAFBFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {rows.filter(r => r.name && r.quantity > 0).length} of {rows.length} items completed
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={handleAddRow}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            height: 28,
                            px: 1.25,
                            borderRadius: '7px',
                            color: PRIMARY_COLOR,
                            borderColor: alpha(PRIMARY_COLOR, 0.3),
                            borderStyle: 'dashed',
                            '&:hover': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                borderColor: PRIMARY_COLOR,
                                borderStyle: 'solid',
                            },
                        }}
                    >
                        Add Another Item
                    </Button>
                </Box>
            )}
        </Card>
    );
};

export default InventoryTable;