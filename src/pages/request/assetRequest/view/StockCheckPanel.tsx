/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { fetchRequestStockCheckService } from '../service';
import { IStockCheck, stockCheckSummary } from './stockCheck';

/**
 * Shown while a request sits at its Issue step: whether the issuing store holds everything on it.
 *
 * A request handled at its branch waits there until the store is restocked. Without this, waiting
 * for stock looks exactly like an issuer who has not acted - the reader would chase the wrong person.
 * When the check cannot be read nothing is shown: an unknown is not a shortfall.
 */
/**
 * @param detailed on the issue page: every line with what the store can still give, not only the
 *                 short ones. "Can still give" is on hand less what other issuances and movements have
 *                 already promised, which is what the issue will be checked against - the shelf count
 *                 alone overstates it whenever something is issued and not yet approved.
 */
const StockCheckPanel = ({ requestId, detailed = false }: { requestId: number; detailed?: boolean }) => {
    const [check, setCheck] = useState<IStockCheck | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const r = (await fetchRequestStockCheckService(requestId)) as { status?: number; data?: IStockCheck };
            if (!cancelled) setCheck(r?.status === 200 ? r.data ?? null : null);
        })();
        return () => { cancelled = true; };
    }, [requestId]);

    const summary = check ? stockCheckSummary(check) : null;
    if (!summary || !check) return null;
    const listed = detailed ? check.lines : summary.shortLines;

    return (
        <Alert severity={summary.waiting ? 'warning' : 'success'} sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>{summary.title}</AlertTitle>
            <Typography variant="body2">{summary.message}</Typography>
            {listed.length > 0 && (
                <Box component="ul" sx={{ m: 0, mt: 0.75, pl: 2.5 }}>
                    {listed.map((l) => (
                        <li key={l.commodityId}>
                            <Typography variant="body2" sx={{ fontWeight: l.available < l.needed ? 700 : 400 }}>
                                {l.commodityName}: need {l.needed}, {l.available} available
                            </Typography>
                        </li>
                    ))}
                </Box>
            )}
            {detailed && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                    Available is what is on the shelf less what other issuances and movements have already been
                    promised. Issued items stay on the shelf until the issuance is approved.
                </Typography>
            )}
        </Alert>
    );
};

export default StockCheckPanel;
