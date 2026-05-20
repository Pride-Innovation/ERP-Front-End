import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Collapse,
    Avatar,
    Chip,
    IconButton,
    Card,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Tooltip,
    alpha
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaptopIcon from '@mui/icons-material/Laptop';
import ChairIcon from '@mui/icons-material/Chair';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import {
    AssetDomain,
    StatusColorConfig
} from '../../request/interface';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const getStatusColor = (status: string): StatusColorConfig => {
    switch (status) {
        case 'Active': return { bg: '#E6F9F4', color: '#4caf50', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
        case 'Available': return { bg: '#E6F9F4', color: '#4caf50', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
        default: return { bg: '#F5F6FA', color: '#9e9e9e', icon: null };
    }
};

const getCategoryIcon = (domain: string) => {
    const t = domain.toLowerCase();
    if (t.includes('it') || t.includes('tech') || t.includes('computer'))
        return <LaptopIcon sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />;
    if (t.includes('office') || t.includes('furniture') || t.includes('chair'))
        return <ChairIcon sx={{ color: SECONDARY_COLOR, fontSize: 20 }} />;
    return <FolderSpecialOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />;
};

const TableHeader: React.FC = () => (
    <Box sx={{
        borderBottom: `1px solid ${alpha('#000', 0.06)}`,
        py: 1.5,
        px: 3,
        backgroundColor: alpha(PRIMARY_COLOR, 0.03),
    }}>
        <Grid container alignItems="center">
            <Grid item xs={12} sm={4}>
                <Typography fontWeight={600} fontSize={12} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
                <Typography fontWeight={600} fontSize={12} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Items</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
                <Typography fontWeight={600} fontSize={12} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Available</Typography>
            </Grid>
            <Grid item xs={4} sm={2}>
                <Typography fontWeight={600} fontSize={12} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</Typography>
            </Grid>
            <Grid item xs={2} sm={1} textAlign="right">
                <Typography fontWeight={600} fontSize={12} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>View</Typography>
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
    const categoryIcon = getCategoryIcon(row.domain);

    return (
        <Box sx={{
            borderBottom: `1px solid ${alpha('#000', 0.06)}`,
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: alpha(PRIMARY_COLOR, 0.02)
            }
        }}>
            <Grid container alignItems="center" py={2} px={3}>
                <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
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
                <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                        <Typography fontWeight={600} fontSize={14}>{row.totalItems}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={2}>
                    <Typography fontWeight={600} fontSize={14} color={row.available < 5 ? '#FF4D4D' : 'inherit'}>
                        {row.available} units
                    </Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
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
                        backgroundColor: alpha(PRIMARY_COLOR, 0.01),
                        borderTop: `1px dashed ${alpha('#000', 0.08)}`
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
                                    SERIAL
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #e0e0e0' }}>
                                    STATUS
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {row.subDomains.map((sub) => {
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
                                            {sub.serial ? <Typography fontSize={12} fontWeight={500}>{sub.serial}</Typography>
                                                : <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                                    Not Specified
                                                </Typography>}
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
    const { assetDomain } = useContext(DashboardContext);
    const {
        fetchPersonalAssetReport
    } = SectionUtills();

    useEffect(() => { fetchPersonalAssetReport() }, [])

    return (
        <Grid item xs={12} mt={2}>
            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    boxShadow: `0 1px 4px ${alpha('#000', 0.06)}, 0 4px 16px ${alpha('#000', 0.04)}`
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: alpha(PRIMARY_COLOR, 0.03)
                    }}
                >
                    <Box display="flex" alignItems="center">
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                color: PRIMARY_COLOR,
                                mr: 2
                            }}
                        >
                            <FolderSpecialOutlinedIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                Personal Assets Report
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Assets currently assigned to you
                            </Typography>
                        </Box>
                    </Box>
                    {assetDomain.length > 0 && (
                        <Chip
                            label={`${assetDomain?.reduce((acc, item) => acc + item.totalItems, 0)} Items`}
                            size="small"
                            sx={{
                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                color: PRIMARY_COLOR,
                                fontWeight: 600,
                                borderRadius: 1
                            }}
                        />
                    )}
                </Box>
                <TableHeader />
                {assetDomain.length > 0 && assetDomain?.map((row) => (
                    <DomainRow key={row.id} row={row} />
                ))}
            </Card>
        </Grid>
    );
};

export default ExpandableTable;