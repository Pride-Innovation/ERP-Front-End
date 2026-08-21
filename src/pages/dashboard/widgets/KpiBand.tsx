/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Skeleton } from '@mui/material';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { StatTile } from '../../../components/layout';
import { IAssetTypeStats } from '../interface';
import { IAsyncData } from '../useDashboardData';

interface IKpiBandProps {
    stats: IAsyncData<IAssetTypeStats[]>;
    /** What these figures cover — branch name, or "All branches". */
    scope: string;
}

const sum = (rows: IAssetTypeStats[], pick: (row: IAssetTypeStats) => number): number =>
    rows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);

/**
 * The four headline asset numbers.
 *
 * A KPI row of stat tiles rather than a chart — these are single current values, and a
 * one-bar bar chart is the wrong form for a single number. No count-up animation: the
 * figures are read, not performed, and the previous implementation re-ran the animation
 * on every render.
 */
const KpiBand = ({ stats, scope }: IKpiBandProps) => {
    const { data, loading, failed } = stats;

    const total = sum(data, (row) => row.total);
    const assigned = sum(data, (row) => row.assigned);
    const unassigned = sum(data, (row) => row.unassigned);
    const inMaintenance = sum(data, (row) => row.inMaintenance);

    // A failed fetch must not render as zeros — an outage would be indistinguishable from a
    // branch that genuinely holds no assets.
    const display = (value: number): string => (failed ? '—' : value.toLocaleString());
    const helper = failed ? 'Unavailable' : scope;

    const tiles = [
        {
            label: 'Total Assets',
            value: display(total),
            helper,
            icon: <DevicesOutlinedIcon />,
            accent: 'brand' as const,
            tooltip: 'Every asset on the register, including those written off.',
        },
        {
            label: 'In Use',
            value: display(assigned),
            helper: failed ? 'Unavailable' : 'Assigned to a holder',
            icon: <CheckCircleOutlineIcon />,
            accent: 'success' as const,
            tooltip: 'Assets assigned to a person or location and still in service. Disposed assets '
                + 'used to be counted here; they no longer are.',
        },
        {
            label: 'In Store',
            value: display(unassigned),
            helper: failed ? 'Unavailable' : 'Awaiting assignment',
            icon: <Inventory2OutlinedIcon />,
            accent: 'info' as const,
            tooltip: 'Assets on the register that are not assigned to anyone yet.',
        },
        {
            label: 'In Repair',
            value: display(inMaintenance),
            helper: failed ? 'Unavailable' : 'Under maintenance',
            icon: <BuildOutlinedIcon />,
            accent: 'warning' as const,
            tooltip: 'Assets currently out of service for repair or maintenance.',
        },
    ];

    return (
        <Grid container spacing={2.5}>
            {tiles.map((tile) => (
                <Grid item xs={12} sm={6} lg={3} key={tile.label}>
                    {loading ? (
                        <Skeleton variant="rounded" height={116} />
                    ) : (
                        <StatTile
                            label={tile.label}
                            value={tile.value}
                            helper={tile.helper}
                            tooltip={tile.tooltip}
                            icon={tile.icon}
                            accent={tile.accent}
                        />
                    )}
                </Grid>
            ))}
        </Grid>
    );
};

export default KpiBand;
