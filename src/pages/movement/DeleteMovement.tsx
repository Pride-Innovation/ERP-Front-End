/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, Box, Button, Chip, Divider, Fade, Paper,
    Stack, Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { toast } from 'react-toastify';
import { IMovementAction } from './interface';
import { deleteMovementService } from './service';
import MovementUtills from './utills';
import ButtonComponent from '../../components/forms/Button';

const PRIMARY = '#08796C';
const ERROR_COLOR = '#d32f2f';

const DeleteMovement = ({
    movement,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = 'Delete Movement',
}: IMovementAction) => {
    const { removeMovementFromStore } = MovementUtills();

    const handleDelete = async () => {
        if (!movement?.id) return;
        setSendingRequest(true);
        try {
            const response = await deleteMovementService(movement.id) as any;
            if (response?.status === 200 || response?.status === 204) {
                removeMovementFromStore(movement);
                toast.success(response?.data?.message ?? 'Movement deleted successfully');
                handleClose();
            } else {
                toast.error(response?.data?.message ?? 'Failed to delete movement');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Fade in timeout={300}>
            <Box>
                {/* Warning header */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2.5, borderBottom: `1px solid ${alpha(ERROR_COLOR, 0.12)}`, bgcolor: alpha(ERROR_COLOR, 0.04) }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha(ERROR_COLOR, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <WarningAmberIcon sx={{ color: ERROR_COLOR, fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ERROR_COLOR }}>
                            Confirm Deletion
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This action cannot be undone.
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ p: 2.5 }}>
                    {/* Movement summary */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, mb: 2.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <SwapHorizOutlinedIcon sx={{ color: PRIMARY, fontSize: 17 }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {movement.referenceNo ?? 'Movement'}
                                </Typography>
                                {movement.destination && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        To: {movement.destination}
                                    </Typography>
                                )}
                                {movement.status?.name && (
                                    <Box mt={0.5}>
                                        <Chip label={movement.status.name} size="small" sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600 }} />
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Paper>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                        Are you sure you want to permanently delete this movement record? All associated data including approval history and attached assets will also be removed.
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                        <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
                            Cancel
                        </Button>
                        <ButtonComponent
                            sendingRequest={sendingRequest}
                            buttonText={buttonText}
                            buttonColor="error"
                            variant="contained"
                            type="button"
                            handleClick={handleDelete}
                        />
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default DeleteMovement;
