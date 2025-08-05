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
    Divider
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaptopIcon from '@mui/icons-material/Laptop';

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

const getChipColor = (type: string): ChipColorConfig => {
    switch (type) {
        case 'Primary': return { bg: '#D3D3FC', color: '#5151D3' };
        case 'Staging': return { bg: '#FBD1F8', color: '#D44BC9' };
        case 'Add-on': return { bg: '#FFE6C6', color: '#E89C3A' };
        default: return { bg: '#e0e0e0', color: '#757575' };
    }
};

const getStatusColor = (status: string): StatusColorConfig => {
    switch (status) {
        case 'Active': return { bg: '#E6F9F4', color: '#00C48C', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
        default: return { bg: '#F5F6FA', color: '#8E9BAE', icon: null };
    }
};

const TableHeader: React.FC = () => (
    <Box sx={{ borderBottom: '1px solid #e1e7ef', py: 2, px: 3, backgroundColor: '#F8FAFC' }}>
        <Grid container alignItems="center">
            <Grid item xs={3}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">CATEGORY</Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">TOTAL ITEMS</Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">USAGE</Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">AVAILABILITY</Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">STATUS</Typography>
            </Grid>
            <Grid item xs={1}>
                <Typography fontWeight={600} fontSize={13} color="#64748B">ACTIONS</Typography>
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

    return (
        <Box sx={{ borderBottom: '1px solid #e1e7ef' }}>
            <Grid container alignItems="center" py={2} px={3}>
                <Grid item xs={3}>
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: '#EBF0FF', width: 40, height: 40, mr: 1.5 }}>
                            <LaptopIcon sx={{ color: '#3F5FFF', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography fontWeight={600} fontSize={14}>{row.domain}</Typography>
                            <Typography fontSize={12} sx={{ color: '#8E9BAE' }}>{row.plan}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <Box display="flex" alignItems="center">
                        <Typography fontWeight={600} fontSize={14}>{row.totalItems}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <Box>
                        <Typography fontWeight={600} fontSize={14}>{row.inUse} / {row.totalItems}</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={usagePercentage}
                            sx={{
                                height: 6,
                                borderRadius: 5,
                                mt: 0.5,
                                backgroundColor: '#D8E3F0',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: usagePercentage > 80 ? '#FF4D4D' : '#00C48C'
                                }
                            }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <Typography fontWeight={600} fontSize={14}>{row.available} units</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Chip
                        label={row.status}
                        // icon={statusConfig.icon}
                        sx={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 600,
                            px: 1.5
                        }}
                    />
                </Grid>
                <Grid item xs={1} display="flex" justifyContent="flex-end">
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            backgroundColor: expanded ? '#F1F5F9' : 'transparent',
                            '&:hover': { backgroundColor: '#F1F5F9' }
                        }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Grid>
            </Grid>
            <Collapse in={expanded}>
                <Box pb={2} px={3} sx={{ backgroundColor: '#FAFBFC' }}>
                    <Table size="small" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ pl: 6, fontWeight: 600, color: '#64748B', fontSize: 12 }}>NAME</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12 }}>ENGRAVED NUMBER</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12 }}>QUANTITY</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12 }}>TYPE</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12 }}>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {row.subDomains.map((sub) => {
                                const typeColors = getChipColor(sub.type);
                                const subStatusConfig = getStatusColor(sub.status);

                                return (
                                    <TableRow key={sub.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ pl: 6 }}>
                                            <Typography fontSize={13} fontWeight={500}>{sub.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontSize={13} sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{sub.engravingNumber}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontSize={13} fontWeight={500}>{sub.quantity}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={sub.type}
                                                size="small"
                                                sx={{
                                                    backgroundColor: typeColors.bg,
                                                    color: typeColors.color,
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={sub.status}
                                                size="small"
                                                // icon={subStatusConfig.icon}
                                                sx={{
                                                    backgroundColor: subStatusConfig.bg,
                                                    color: subStatusConfig.color,
                                                    fontWeight: 600
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
        <Grid item xs={12} md={12} mt={2}>
            <Card sx={{ padding: 2 }}>
                <Box p={2}>
                    <Typography variant="h6" color="#888" mb={3}>Asset Categories</Typography>
                    <Divider />
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