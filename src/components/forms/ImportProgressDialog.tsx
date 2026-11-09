/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react';
import { alpha, Box, LinearProgress, Stack, Typography } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ModalComponent from '../modal';

const PRIMARY = '#08796C';

export interface IImportProgress {
    total: number;
    /** Rows finished so far. Omitted when the upload is one request and nothing is known until it returns. */
    done?: number;
    /** Reading whatever the import needs before anything is sent. */
    preparing?: boolean;
    /** The batch on the wire, 1-based - for an import sent in batches. */
    inFlight?: { from: number; to: number };
}

interface IImportProgressDialog {
    title: string;
    subtitle?: string;
    /** Plural noun for the rows: "assets", "users". */
    noun: string;
    progress: IImportProgress;
    /** What survives if the upload stops part-way - differs between batched and single-request imports. */
    footnote: string;
}

/**
 * Shown for the whole of an import, from the moment the file is accepted.
 *
 * <p>Never a bar parked at 0%: where nothing is known until the request returns the bar is
 * indeterminate, and where rows go up in batches it is a buffer bar - solid for what has finished,
 * moving for the batch on the wire. No close button, because nothing can be cancelled mid-request;
 * and while it is mounted, closing or reloading the tab asks first.
 */
const ImportProgressDialog = ({ title, subtitle, noun, progress, footnote }: IImportProgressDialog) => {
    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, []);

    const { total, done, preparing, inFlight } = progress;
    const count = (n: number) => n.toLocaleString();
    const rows = `${count(total)} ${total === 1 ? noun.replace(/s$/, '') : noun}`;

    const headline = preparing
        ? `Preparing ${rows}…`
        : inFlight && !(inFlight.from === 1 && inFlight.to === total)
            ? `Uploading ${noun} ${count(inFlight.from)}–${count(inFlight.to)} of ${count(total)}…`
            : `Uploading ${rows}…`;

    const determinate = !preparing && done !== undefined;

    return (
        <ModalComponent
            width="34%"
            title={title}
            subtitle={subtitle}
            icon={<CloudUploadOutlinedIcon />}
            open
            hideCloseButton
            handleClose={() => { }}
        >
            <Box sx={{ pt: 0.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.25 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E293B' }}>
                        {headline}
                    </Typography>
                    {determinate && (
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: PRIMARY, fontVariantNumeric: 'tabular-nums' }}>
                            {count(done!)} / {count(total)} done
                        </Typography>
                    )}
                </Stack>
                <LinearProgress
                    variant={determinate ? 'buffer' : 'indeterminate'}
                    value={determinate && total ? (done! / total) * 100 : 0}
                    valueBuffer={determinate && total && inFlight ? (inFlight.to / total) * 100 : 0}
                    sx={{
                        height: 8, borderRadius: 4, bgcolor: alpha(PRIMARY, 0.12),
                        '& .MuiLinearProgress-bar': { bgcolor: PRIMARY, borderRadius: 4 },
                        '& .MuiLinearProgress-bar2Buffer': { bgcolor: alpha(PRIMARY, 0.3) },
                        '& .MuiLinearProgress-dashed': {
                            backgroundImage: `radial-gradient(${alpha(PRIMARY, 0.35)} 0%, ${alpha(PRIMARY, 0.35)} 16%, transparent 42%)`,
                        },
                    }}
                />
                <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', mt: 1.5, lineHeight: 1.5 }}>
                    Please keep this page open until it finishes. {footnote}
                </Typography>
            </Box>
        </ModalComponent>
    );
};

export default ImportProgressDialog;
