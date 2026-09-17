/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { brand } from '../../../../utils/tokens';

const PRIMARY = brand[500];

const TIPS = [
    'Be specific in your request description',
    'Include accurate quantities needed',
    'Attach supporting documentation when available',
    'Keep all items within one approval route',
];

/** Reference card shown below the request form — moved out of the upload column. */
const ApprovalTipsPanel = () => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(PRIMARY, 0.03),
            border: `1px solid ${alpha(PRIMARY, 0.15)}`,
            height: '100%',
        }}
    >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
            <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 17, color: PRIMARY }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065E54' }}>
                Tips for Faster Approval
            </Typography>
        </Stack>
        <Stack spacing={0.75}>
            {TIPS.map((tip) => (
                <Stack key={tip} direction="row" spacing={1} alignItems="flex-start">
                    <Box
                        sx={{
                            width: 5, height: 5, borderRadius: '50%', bgcolor: PRIMARY,
                            flexShrink: 0, mt: '7px',
                        }}
                    />
                    <Typography variant="body2" sx={{ color: '#08796C', fontSize: '0.82rem', lineHeight: 1.55 }}>
                        {tip}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    </Paper>
);

export default ApprovalTipsPanel;
