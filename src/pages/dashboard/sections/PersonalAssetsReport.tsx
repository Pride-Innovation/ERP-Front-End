import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Collapse,
    Avatar,
    Chip,
    LinearProgress,
    IconButton,
    Card,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Divider,
    Tooltip
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaptopIcon from '@mui/icons-material/Laptop';
import ChairIcon from '@mui/icons-material/Chair';

// Define TypeScript interfaces
interface SubDomain {
    id: number;
    name: string;
    type: 'Primary' | 'Staging' | 'Add-on';
    quantity: number;
    engravingNumber: string;
    status: 'Active' | string;
}

interface AssetDomain {
    id: number;
    domain: string;
    plan: string;
    totalItems: number;
    inUse: number;
    available: number;
    domains: number;
    domainLimit: number;
    status: 'Active' | string;
    subDomains: SubDomain[];
}

interface ChipColorConfig {
    bg: string;
    color: string;
}

interface StatusColorConfig extends ChipColorConfig {
    icon?: React.ReactNode;
}

const mockData: AssetDomain[] = [
    {
        id: 1,
        domain: 'IT Equipment',
        plan: 'Hardware Assets',
        totalItems: 24,
        inUse: 20,
        available: 4,
        domains: 5,
        domainLimit: 10,
        status: 'Active',
        subDomains: [
            { id: 101, name: 'Laptops', type: 'Primary', quantity: 12, engravingNumber: 'ENG-LP-2025', status: 'Active' },
            { id: 102, name: 'Monitors', type: 'Staging', quantity: 8, engravingNumber: 'ENG-MN-2025', status: 'Active' },
            { id: 103, name: 'Mouse', type: 'Add-on', quantity: 2, engravingNumber: 'ENG-MS-2025', status: 'Active' },
            { id: 104, name: 'Keyboard', type: 'Add-on', quantity: 2, engravingNumber: 'ENG-KB-2025', status: 'Active' },
        ],
    },
    {
        id: 2,
        domain: 'Office Furniture',
        plan: 'Workspace Assets',
        totalItems: 35,
        inUse: 30,
        available: 5,
        domains: 3,
        domainLimit: 5,
        status: 'Active',
        subDomains: [
            { id: 201, name: 'Desks', type: 'Primary', quantity: 15, engravingNumber: 'ENG-DK-2025', status: 'Active' },
            { id: 202, name: 'Chairs', type: 'Primary', quantity: 20, engravingNumber: 'ENG-CH-2025', status: 'Active' },
        ],
    },
];

// Enhanced color functions to match the app's color scheme
const getChipColor = (type: string): ChipColorConfig => {
    switch (type) {
        case 'Primary': return { bg: '#E8F4FF', color: '#3F5FFF' };
        case 'Staging': return { bg: '#FBD1F8', color: '#D44BC9' };
        case 'Add-on': return { bg: '#FFE6C6', color: '#E89C3A' };
        default: return { bg: '#e0e0e0', color: '#757575' };
    }
};

const getStatusColor = (status: string): StatusColorConfig => {
    switch (status) {
        case 'Active': return { bg: '#E6F9F4', color: '#4caf50', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
        default: return { bg: '#F5F6FA', color: '#9e9e9e', icon: null };
    }
};

const getCategoryIcon = (domain: string) => {
    switch (domain) {
        case 'IT Equipment': return <LaptopIcon sx={{ color: '#3F5FFF', fontSize: 20 }} />;
        case 'Office Furniture': return <ChairIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
        default: return <LaptopIcon sx={{ color: '#3F5FFF', fontSize: 20 }} />;
    }
};

const TableHeader: React.FC = () => (
    <Box sx={{
        borderBottom: '1px solid #e0e0e0',
        py: 2,
        px: 3,
        backgroundColor: '#F8FAFC',
        borderRadius: '4px 4px 0 0'
    }}>
        <Grid container alignItems="center">
            <Grid item xs={12} sm={3}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">CATEGORY</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">TOTAL ITEMS</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">USAGE</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">AVAILABILITY</Typography>
            </Grid>
            <Grid item xs={4} sm={1}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">STATUS</Typography>
            </Grid>
            <Grid item xs={2} sm={1} textAlign="right">
                <Typography fontWeight={600} fontSize={13} color="#64748B">VIEW</Typography>
            </Grid>
        </Grid>
    </Box>
);

interface DomainRowProps {
    row: AssetDomain;
}

const DomainRow: React.FC<DomainRowProps> = ({ row }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const statusConfig = getStatusColor(row.status);
    const usagePercentage = (row.inUse / row.totalItems) * 100;
    const categoryIcon = getCategoryIcon(row.domain);

    return (
        <Box sx={{
            borderBottom: '1px solid #e0e0e0',
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#f5f8fc'
            }
        }}>
            <Grid container alignItems="center" py={2} px={3}>
                <Grid item xs={12} sm={3}>
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{
                            bgcolor: '#EBF0FF',
                            width: 40,
                            height: 40,
                            mr: 1.5,
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
                        }}>
                            {categoryIcon}
                        </Avatar>
                        <Box>
                            <Typography fontWeight={600} fontSize={14}>{row.domain}</Typography>
                            <Typography fontSize={12} sx={{ color: '#8E9BAE' }}>{row.plan}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                    <Box display="flex" alignItems="center">
                        <Typography fontWeight={600} fontSize={14}>{row.totalItems}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                            <Typography fontWeight={600} fontSize={14}>{row.inUse} / {row.totalItems}</Typography>
                            <Typography variant="caption" color={usagePercentage > 80 ? '#FF4D4D' : '#4caf50'}>
                                {usagePercentage.toFixed(0)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={usagePercentage}
                            sx={{
                                height: 6,
                                borderRadius: 5,
                                backgroundColor: '#E0E0E0',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: usagePercentage > 80 ? '#FF4D4D' : '#4caf50'
                                }
                            }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                    <Typography fontWeight={600} fontSize={14} color={row.available < 5 ? '#FF4D4D' : 'inherit'}>
                        {row.available} units
                    </Typography>
                </Grid>
                <Grid item xs={4} sm={1}>
                    <Chip
                        label={row.status}
                        size="small"
                        sx={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '24px'
                        }}
                    />
                </Grid>
                <Grid item xs={2} sm={1} display="flex" justifyContent="flex-end">
                    <Tooltip title={expanded ? "Hide details" : "Show details"}>
                        <IconButton
                            onClick={() => setExpanded(!expanded)}
                            size="small"
                            sx={{
                                backgroundColor: expanded ? '#F1F5F9' : 'transparent',
                                '&:hover': { backgroundColor: '#F1F5F9' },
                                transition: 'all 0.2s'
                            }}
                        >
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
            <Collapse in={expanded} timeout="auto">
                <Box
                    pb={2}
                    px={3}
                    sx={{
                        backgroundColor: '#FAFBFC',
                        borderTop: '1px dashed #e0e0e0'
                    }}
                >
                    <Table size="small" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ pl: 6, fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #e0e0e0' }}>
                                    NAME
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #e0e0e0' }}>
                                    ENGRAVED NUMBER
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #e0e0e0' }}>
                                    QUANTITY
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #e0e0e0' }}>
                                    TYPE
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #e0e0e0' }}>
                                    STATUS
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {row.subDomains.map((sub) => {
                                const typeColors = getChipColor(sub.type);
                                const subStatusConfig = getStatusColor(sub.status);

                                return (
                                    <TableRow
                                        key={sub.id}
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            '&:hover': { backgroundColor: '#f8fafc' }
                                        }}
                                    >
                                        <TableCell sx={{ pl: 6, py: 1.5 }}>
                                            <Typography fontSize={13} fontWeight={500}>{sub.name}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography
                                                fontSize={13}
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: 500,
                                                    backgroundColor: '#f5f5f5',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {sub.engravingNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography fontSize={13} fontWeight={500}>{sub.quantity}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={sub.type}
                                                size="small"
                                                sx={{
                                                    backgroundColor: typeColors.bg,
                                                    color: typeColors.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: '22px'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={sub.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: subStatusConfig.bg,
                                                    color: subStatusConfig.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                    height: '22px',
                                                    '& .MuiChip-icon': {
                                                        fontSize: '14px',
                                                        marginLeft: '4px'
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            </Collapse>
        </Box>
    );
};

const ExpandableTable: React.FC = () => {
    return (
        <Grid item xs={12} mt={2} >
            <Card
                elevation={3}
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Box
                    p={2.5}
                    sx={{
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h6" color="#888" >
                        Personal Assets Report
                    </Typography>

                    <Chip
                        label={`${mockData.reduce((acc, item) => acc + item.totalItems, 0)} Items`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Box>
                <TableHeader />
                {mockData.map((row) => (
                    <DomainRow key={row.id} row={row} />
                ))}
            </Card>
        </Grid>
    );
};

export default ExpandableTable;