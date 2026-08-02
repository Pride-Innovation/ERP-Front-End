/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { border, neutral } from '../../../utils/tokens';
import { StatusChip } from '../../../components/layout';
import { StatusTone } from '../../../components/layout/StatusChip';
import { ROUTES } from '../../../core/routes/routes';
import { IRequest } from '../../request/interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IMyRequestsProps {
    requests: IAsyncData<IRequest[]>;
    /** Signed-in user's id — used to pick their own requests out of the open queue. */
    currentUserId: number | string | null;
}

const statusTone = (status?: string | null): StatusTone => {
    const value = (status || '').toLowerCase();
    if (value.includes('reject') || value.includes('cancel')) return 'danger';
    if (value.includes('approv') || value.includes('issued') || value.includes('deliver') || value.includes('complete')) return 'success';
    if (value.includes('pending') || value.includes('submit') || value.includes('await')) return 'pending';
    return 'neutral';
};

const personName = (person?: { firstName?: string; lastName?: string } | null): string =>
    [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();

/**
 * The signed-in user's own open requests, and — critically — who each one is sitting with.
 *
 * "Where has my request got to" is the single most common question this dashboard should
 * answer for an ordinary member of staff, and nothing on the previous personal dashboard
 * answered it: it listed requests without ever naming the current approver.
 *
 * Filtered client-side from the open queue because there is no "my requests" endpoint yet;
 * when one lands this switches to it without changing the component.
 */
const MyRequests = ({ requests, currentUserId }: IMyRequestsProps) => {
    const { data, loading, failed, reload } = requests;
    const navigate = useNavigate();

    const mine = useMemo(() => {
        if (currentUserId == null) return [];
        const asString = String(currentUserId);
        return data.filter((request) => {
            const requesterId = request.requester?.id ?? request.createdBy;
            return requesterId != null && String(requesterId) === asString;
        });
    }, [data, currentUserId]);

    return (
        <WidgetCard
            title="My Open Requests"
            subtitle={`${mine.length} ${mine.length === 1 ? 'request' : 'requests'} in progress`}
            icon={<ReceiptLongOutlinedIcon />}
            helpText="Requests you raised that have not been closed out, and the person each one is currently waiting on."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={mine.length === 0}
            emptyTitle="No open requests"
            emptyDescription="Requests you raise will appear here until they are issued or closed."
            actions={
                <Button
                    size="small"
                    onClick={() => navigate(ROUTES.REQUEST)}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                >
                    All requests
                </Button>
            }
        >
            <Stack divider={<Box sx={{ borderBottom: `1px solid ${border.subtle}` }} />}>
                {mine.map((request) => {
                    const approver = personName(request.currentApprover);
                    return (
                        <Stack
                            key={request.id}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            onClick={() => navigate(`${ROUTES.READ_REQUEST}/${request.id}`)}
                            sx={{
                                py: 1.5,
                                cursor: 'pointer',
                                '&:hover .request-name': { color: neutral[900] },
                            }}
                        >
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography
                                    variant="body2"
                                    className="request-name"
                                    sx={{ fontWeight: 600, color: neutral[800], transition: 'color 0.15s' }}
                                    noWrap
                                >
                                    {request.name || 'Untitled request'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: neutral[500] }} noWrap display="block">
                                    {approver ? `Waiting on ${approver}` : 'Not yet assigned to an approver'}
                                    {request.createDate && ` · raised ${new Date(request.createDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                                </Typography>
                            </Box>
                            <StatusChip
                                label={request.status?.name || 'Open'}
                                tone={statusTone(request.status?.name)}
                            />
                            <ChevronRightIcon sx={{ fontSize: 18, color: neutral[400], flexShrink: 0 }} />
                        </Stack>
                    );
                })}
            </Stack>
        </WidgetCard>
    );
};

export default MyRequests;
