/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Box, alpha, useTheme, Alert, Divider } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ButtonComponent from '../../../components/forms/Button';
import { IBranchAxiosResponse, IDeleteBranch } from './interface';
import { deleteBranchService } from './service';
import { toast } from 'react-toastify';
import BranchUtills from './utills';

const DeleteBranch = ({
    branch,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText
}: IDeleteBranch) => {
    const { removeBranchToStore } = BranchUtills();
    const theme = useTheme();

    const deleteBranch = async () => {
        setSendingRequest(true)
        try {
            const response = await deleteBranchService(branch?.id as string) as IBranchAxiosResponse;
            if (response.status === 204) {
                toast.success("Branch deleted successfully", { position: 'bottom-right' })
                removeBranchToStore(branch)
            }
        } catch (error) {
            console.error("Error deleting branch:", error)
            toast.error("Failed to delete branch. Please try again.", { position: 'bottom-right' })
        }
        setSendingRequest(false)
        handleClose()
    }

    return (
        <Grid item container spacing={3} xs={12} sx={{ mt: 0 }}>
            {/* Header */}
            <Grid item xs={12}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.error.main, 0.1)
                        }}
                    >
                        <WarningAmberIcon color="error" />
                    </Box>
                    <Typography variant="h6" fontWeight={500} color="error">
                        Confirm Deletion
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    This action cannot be undone. All data associated with this branch will be permanently removed.
                </Typography>
                <Divider sx={{ my: 2, opacity: 0.6 }} />
            </Grid>

            {/* Warning alert */}
            <Grid item xs={12}>
                <Alert
                    severity="warning"
                    icon={<WarningAmberIcon />}
                    sx={{
                        mb: 3,
                        borderRadius: 1.5,
                        '& .MuiAlert-icon': {
                            alignItems: 'center'
                        }
                    }}
                >
                    <Typography variant="body2">
                        Deleting this branch may affect users and assets assigned to it.
                    </Typography>
                </Alert>

                {/* Branch details */}
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        mb: 3
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <AccountBalanceOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {branch.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {branch.id} • {branch.district?.name}, {branch.region?.name}
                            </Typography>
                        </Box>
                    </Stack>

                    {branch.email && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Email:</strong> {branch.email}
                        </Typography>
                    )}

                    {branch.telephone && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Phone:</strong> {branch.telephone}
                        </Typography>
                    )}
                </Box>
            </Grid>

            {/* Action buttons */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                    variant="body2"
                    color="error"
                    fontWeight={500}
                    sx={{ alignSelf: 'center' }}
                >
                    Are you sure you want to delete this branch?
                </Typography>

                <Stack direction="row" spacing={2}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="inherit"
                        type="button"
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Cancel"
                    // sx={{ px: 3 }}
                    />
                    <ButtonComponent
                        buttonColor="error"
                        type="button"
                        handleClick={deleteBranch}
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    // sx={{ px: 3 }}
                    />
                </Stack>
            </Grid>
        </Grid>
    )
}

export default DeleteBranch;