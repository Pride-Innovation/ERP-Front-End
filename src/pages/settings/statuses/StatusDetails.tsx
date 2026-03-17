/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Card, Stack, Typography, alpha, useTheme } from '@mui/material'
import { IStatusDetails } from './interface'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadingOutlinedIcon from '@mui/icons-material/DownloadingOutlined';

const PRIMARY_COLOR = '#08796C';

const StatusDetails = ({
    status,
    deleteStatus,
    updateStatus
}: IStatusDetails) => {
    const theme = useTheme();
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'all 0.25s ease-in-out',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                    transform: 'translateY(-3px)',
                    borderColor: alpha(PRIMARY_COLOR, 0.3)
                }
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: alpha(PRIMARY_COLOR, 0.04),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}
            >
                <DownloadingOutlinedIcon fontSize="small" color="info" sx={{ fontSize: "16px" }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Status
                </Typography>
            </Box>
            <Stack
                direction="column"
                spacing={2}
                sx={{
                    p: 2.5,
                    alignItems: "center",
                    flex: 1,
                    justifyContent: 'center'
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: PRIMARY_COLOR
                    }}
                >
                    <DownloadingOutlinedIcon />
                </Box>
                <Typography variant="body2" fontWeight={600} textAlign="center">
                    {status.name}
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        onClick={() => updateStatus(status)}
                        sx={{ textTransform: "none", borderRadius: 1.5 }}
                        startIcon={<EditOutlinedIcon />}
                        variant="outlined"
                        color="primary"
                        size="small"
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={() => deleteStatus(status)}
                        sx={{ textTransform: "none", borderRadius: 1.5 }}
                        startIcon={<DeleteOutlineOutlinedIcon />}
                        variant="outlined"
                        color="error"
                        size="small"
                    >
                        Delete
                    </Button>
                </Stack>
            </Stack>
        </Card>
    )
}

export default StatusDetails