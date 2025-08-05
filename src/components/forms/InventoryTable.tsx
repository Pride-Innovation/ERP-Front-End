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
    useTheme,
    useMediaQuery,
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

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

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
        id: 'remove',
        name: "Actions",
        icon: <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: "14px", mr: "5px" }} />,
        tooltip: 'Remove this item from request'
    }
];

const NoItemsPlaceholder = ({ message, onAddItem }: { message: string; onAddItem: () => void }) => {
    return (
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <InventoryIcon sx={{ fontSize: 40, color: PRIMARY_COLOR, mb: 2, opacity: 0.7 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
                {message}
            </Typography>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAddItem}
                sx={{
                    mt: 2,
                    textTransform: 'none',
                    borderColor: PRIMARY_COLOR,
                    color: PRIMARY_COLOR,
                    '&:hover': {
                        borderColor: PRIMARY_COLOR,
                        backgroundColor: alpha(PRIMARY_COLOR, 0.04),
                    }
                }}
            >
                Add First Item
            </Button>
        </Box>
    );
};

const InventoryTable = ({ issue, title }: { issue?: boolean, title: string }) => {
    const { fetchAllCommodities } = CommodityUtills();
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string, assetTypeId: number | string }[]>([]);
    const { rows, setRows, setAssetType } = useContext(RequestContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        return true;
    });

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 1,
                border: `1px solid ${alpha('#000', 0.12)}`,
                overflow: 'hidden',
                width: '100%'
            }}
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    borderBottom: `1px solid ${alpha('#000', 0.12)}`,
                    p: { xs: 1.5, sm: 2 },
                    background: `linear-gradient(to right, ${alpha(PRIMARY_COLOR, 0.9)}, ${alpha(PRIMARY_COLOR, 0.7)})`,
                    color: 'white',
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                        sx={{
                            bgcolor: 'white',
                            color: PRIMARY_COLOR,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                        }}
                    >
                        <InventoryIcon sx={{ color: PRIMARY_COLOR }} />
                    </Box>
                    <Typography
                        sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                        }}
                    >
                        {title}
                    </Typography>
                    <Chip
                        label={`${rows.length} ${rows.length === 1 ? 'item' : 'items'}`}
                        size="small"
                        variant="outlined"
                        color='secondary'
                        sx={{
                            borderColor: "white",
                            color: "white",
                            fontWeight: 500,
                            height: 24,
                        }}
                    />
                </Stack>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    size="small"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        bgcolor: 'white',
                        color: PRIMARY_COLOR,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                            bgcolor: "white",
                        },
                        py: 1,
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
                <Table stickyHeader size={isMobile ? "small" : "medium"}>
                    <TableHead>
                        <TableRow>
                            {visibleHeaders.map((header) => (
                                <TableCell
                                    key={header.id}
                                    align={header.id === 'quantity' ? 'center' : header.id === 'remove' ? 'center' : 'left'}
                                    sx={{
                                        bgcolor: '#fff',
                                        color: '#555',
                                        fontWeight: 600,
                                        fontSize: { xs: 12, sm: 13 },
                                        py: 1.5,
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        whiteSpace: 'normal',
                                        px: { xs: 1, sm: 2 },
                                    }}
                                >
                                    <Tooltip title={header.tooltip} arrow placement="top">
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
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
                            rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        backgroundColor: recentlyAdded === row.id
                                            ? alpha(PRIMARY_COLOR, 0.04)
                                            : '#fff',
                                        transition: 'background-color 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: alpha('#000', 0.02),
                                        },
                                    }}
                                >
                                    <TableCell sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        px: { xs: 1, sm: 2 },
                                        py: 1.5,
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word'
                                    }}>
                                        <Select
                                            fullWidth
                                            value={row.assetTypeId || ""}
                                            onChange={(e) => handleAssetTypeNameChange(row.id, e.target.value as string)}
                                            displayEmpty
                                            size="small"
                                            sx={{
                                                fontSize: 14,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha('#000', 0.2),
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                    borderWidth: 1,
                                                },
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>Select Type</em>
                                            </MenuItem>
                                            {assetTypes.map((assetTyp) => (
                                                <MenuItem key={assetTyp.id} value={assetTyp.id}>
                                                    {assetTyp.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        px: { xs: 1, sm: 2 },
                                        py: 1.5,
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word'
                                    }}>
                                        <Select
                                            fullWidth
                                            value={row.name || ""}
                                            onChange={(e) => handleNameChange(row.id, e.target.value as string)}
                                            displayEmpty
                                            size="small"
                                            disabled={!row.assetTypeId}
                                            sx={{
                                                fontSize: 14,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha('#000', 0.2),
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                    borderWidth: 1,
                                                },
                                                '&.Mui-disabled': {
                                                    backgroundColor: alpha('#000', 0.03),
                                                }
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>{row.assetTypeId ? 'Select Item' : 'Select Asset Type first'}</em>
                                            </MenuItem>
                                            {itemOptions
                                                .filter(ele => ele.assetTypeId === row.assetTypeId)
                                                .map((item) => (
                                                    <MenuItem key={item.name} value={item.name}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        px: { xs: 1, sm: 2 },
                                        py: 1.5,
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word'
                                    }}>
                                        {row.groupName ? (
                                            <Chip
                                                label={row.groupName}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: alpha(SECONDARY_COLOR, 0.3),
                                                    color: SECONDARY_COLOR,
                                                    fontWeight: 500,
                                                    fontSize: 13
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Not specified
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center" sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        px: { xs: 1, sm: 2 },
                                        py: 1.5
                                    }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                                borderRadius: 1,
                                                px: 0.5,
                                                maxWidth: 120,
                                                mx: 'auto'
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() => handleInputChange(row.id, 'quantity', Math.max(0, row.quantity - 1))}
                                                sx={{ p: 0.5 }}
                                                disabled={row.quantity <= 0}
                                            >
                                                <RemoveCircleOutlineIcon fontSize="small" sx={{
                                                    color: row.quantity <= 0 ? alpha('#000', 0.2) : SECONDARY_COLOR
                                                }} />
                                            </IconButton>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.quantity}
                                                onChange={(e) => handleInputChange(
                                                    row.id,
                                                    'quantity',
                                                    e.target.value === '' ? 0 : parseInt(e.target.value)
                                                )}
                                                inputProps={{
                                                    min: 0,
                                                    style: { textAlign: 'center', width: '40px', padding: '4px 0' }
                                                }}
                                                variant="standard"
                                                sx={{
                                                    '& input': {
                                                        fontWeight: 600,
                                                        fontSize: 15
                                                    },
                                                    '& .MuiInput-underline:before, & .MuiInput-underline:after': {
                                                        borderBottom: 'none',
                                                    }
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleInputChange(row.id, 'quantity', row.quantity + 1)}
                                                sx={{ p: 0.5 }}
                                            >
                                                <AddCircleOutlineOutlinedIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
                                            </IconButton>
                                        </Box>
                                    </TableCell>

                                    {issue && <FilterEngravedNumbers row={row} />}

                                    <TableCell align="center" sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                        px: { xs: 1, sm: 2 },
                                        py: 1.5
                                    }}>
                                        <Tooltip title={rows.length <= 1 ? "At least one item is required" : "Remove this item"}>
                                            <span>
                                                <IconButton
                                                    onClick={() => handleRemoveRow(row.id)}
                                                    disabled={rows.length <= 1}
                                                    size="small"
                                                    sx={{
                                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                                        '&:disabled': { opacity: 0.3 },
                                                        '&:hover': {
                                                            backgroundColor: alpha('#f44336', 0.04),
                                                            borderColor: alpha('#f44336', 0.5),
                                                        }
                                                    }}
                                                >
                                                    <DeleteOutlineIcon
                                                        fontSize="small"
                                                        sx={{ color: rows.length <= 1 ? alpha('#f44336', 0.4) : '#f44336' }}
                                                    />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {rows.length > 0 && (
                <Box sx={{
                    p: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <InfoOutlinedIcon
                            fontSize="small"
                            sx={{ color: '#666', mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {rows.filter(r => r.name && r.quantity > 0).length} of {rows.length} items completed
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddRow}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            color: PRIMARY_COLOR,
                            borderColor: alpha(PRIMARY_COLOR, 0.3),
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            '&:hover': {
                                backgroundColor: alpha(PRIMARY_COLOR, 0.04),
                                borderColor: PRIMARY_COLOR,
                            }
                        }}
                        variant="outlined"
                    >
                        Add Another Item
                    </Button>
                </Box>
            )}
        </Card>
    );
};

export default InventoryTable;