/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Fragment, useState } from 'react';
import {
    alpha,
    Box,
    Collapse,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../core/routes/routes';
import { border, brand, neutral, surface } from '../../../utils/tokens';
import { StatusChip } from '../../../components/layout';
import { StatusTone } from '../../../components/layout/StatusChip';
import { IPersonalAssetReport } from '../../request/interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IMyAssetsProps {
    assets: IAsyncData<IPersonalAssetReport[]>;
}

const statusTone = (status?: string | null): StatusTone => {
    const value = (status || '').toLowerCase();
    if (value.includes('maintenance') || value.includes('repair')) return 'pending';
    if (value.includes('dispos') || value.includes('faulty')) return 'danger';
    if (value.includes('require')) return 'info';
    return 'success';
};

/**
 * What the signed-in user is personally accountable for, grouped by category.
 *
 * Collapsed by category so someone holding twenty items sees a short summary first and opens
 * only the group they care about. Category names come straight from the payload — no mapping
 * table, so a newly configured category needs no code change here.
 */
const MyAssets = ({ assets }: IMyAssetsProps) => {
    const { data, loading, failed, reload } = assets;
    const [expanded, setExpanded] = useState<string | null>(null);
    const navigate = useNavigate();

    /**
     * Opens an asset's detail page.
     *
     * The route is per-category, which is why the payload had to start carrying the category id:
     * without it there is no URL to build and the row cannot be a link at all.
     */
    const openAsset = (typeId: number | null, assetId: number) => {
        if (typeId == null) return;
        navigate(ROUTES.LIST_GENERAL_ASSETS + "/" + typeId + "/view/" + assetId);
    };

    const total = data.reduce((sum, group) => sum + (Number(group.totalItems) || 0), 0);

    return (
        <WidgetCard
            title="My Assets"
            subtitle={`${total} ${total === 1 ? 'item' : 'items'} assigned to you`}
            icon={<DevicesOutlinedIcon />}
            helpText="Assets currently assigned to you. You are accountable for these until they are formally transferred or returned."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={data.length === 0}
            emptyTitle="Nothing assigned to you"
            emptyDescription="Assets issued to you will be listed here, grouped by category."
        >
            <Box sx={{ overflowX: 'auto', mx: -2.5, mb: -2.5 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: surface.muted }}>
                            {['', 'Category', 'Items', 'Available'].map((header, index) => (
                                <TableCell
                                    key={header || `expand-${index}`}
                                    align={index > 1 ? 'right' : 'left'}
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.68rem',
                                        color: neutral[500],
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        borderBottom: `1px solid ${border.subtle}`,
                                        py: 1.25,
                                        width: index === 0 ? 44 : undefined,
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((group) => {
                            const isOpen = expanded === group.type;
                            const available = group.assets.filter(
                                (asset) => !(asset.status || '').toLowerCase().includes('maintenance'),
                            ).length;

                            return (
                                <Fragment key={group.type}>
                                    <TableRow
                                        hover
                                        onClick={() => setExpanded(isOpen ? null : group.type)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell sx={{ borderBottom: `1px solid ${border.subtle}`, py: 0.5 }}>
                                            <IconButton size="small" sx={{ color: neutral[500] }}>
                                                {isOpen ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${border.subtle}` }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[900] }}>
                                                {group.type}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: `1px solid ${border.subtle}` }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 700, color: neutral[900], fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {group.totalItems}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: `1px solid ${border.subtle}` }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: neutral[600], fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {available}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ p: 0, borderBottom: isOpen ? `1px solid ${border.subtle}` : 'none' }}>
                                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                {/*
                                                  * A striped listing, matching the reports tables.
                                                  *
                                                  * It was a flat stack with no separation and no way
                                                  * in — the tag was printed but the item could not be
                                                  * opened, which is the first thing anyone wants from
                                                  * a list of what they are accountable for.
                                                  */}
                                                <Box sx={{ bgcolor: surface.muted, px: 1.25, py: 1 }}>
                                                    {group.assets.map((asset, index) => {
                                                        const canOpen = group.typeId != null;
                                                        return (
                                                            <Stack
                                                                key={asset.id}
                                                                direction="row"
                                                                alignItems="center"
                                                                spacing={1.5}
                                                                onClick={canOpen ? () => openAsset(group.typeId, asset.id) : undefined}
                                                                sx={{
                                                                    py: 0.9,
                                                                    px: 1.25,
                                                                    borderRadius: "7px",
                                                                    cursor: canOpen ? "pointer" : "default",
                                                                    bgcolor: index % 2 === 1 ? alpha(neutral[300], 0.14) : "transparent",
                                                                    transition: "background-color 0.12s",
                                                                    "&:hover": canOpen ? { bgcolor: alpha(brand[500], 0.07) } : undefined,
                                                                    "&:hover .row-chevron": { opacity: 1 },
                                                                }}
                                                            >
                                                                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                                                    <Typography variant="body2" sx={{ color: neutral[800] }} noWrap>
                                                                        {asset.name}
                                                                    </Typography>
                                                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                                                        <Typography variant="caption" sx={{ color: neutral[500], fontFamily: "monospace" }}>
                                                                            {asset.engravingNumber || asset.serialNumber || "No tag recorded"}
                                                                        </Typography>
                                                                        {asset.location && (
                                                                            <>
                                                                                <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: neutral[300] }} />
                                                                                <Typography variant="caption" sx={{ color: neutral[400] }}>
                                                                                    {asset.location}
                                                                                </Typography>
                                                                            </>
                                                                        )}
                                                                    </Stack>
                                                                </Box>
                                                                <StatusChip label={asset.status || "Unknown"} tone={statusTone(asset.status)} />
                                                                {canOpen && (
                                                                    <ChevronRightIcon
                                                                        className="row-chevron"
                                                                        sx={{ fontSize: 17, color: neutral[400], opacity: 0, transition: "opacity 0.12s", flexShrink: 0 }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        );
                                                    })}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
        </WidgetCard>
    );
};

export default MyAssets;
