/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { neutral } from '../../utils/tokens';

interface IConfirmDiscardDialogProps {
    open: boolean;
    /** Close the dialog and stay on the form. */
    onKeepEditing: () => void;
    /** Abandon the unsaved changes and continue with the interrupted action. */
    onDiscard: () => void;
}

/**
 * Confirmation shown when the user tries to leave a form (Cancel, Back,
 * breadcrumbs) while it has unsaved changes.
 */
const ConfirmDiscardDialog = ({ open, onKeepEditing, onDiscard }: IConfirmDiscardDialogProps) => (
    <Dialog open={open} onClose={onKeepEditing} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: neutral[900] }}>Discard changes?</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ color: neutral[500], fontSize: '0.9rem' }}>
                You have unsaved changes on this form. If you leave now they will be lost.
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
                onClick={onKeepEditing}
                sx={{ textTransform: 'none', fontWeight: 600, color: neutral[600] }}
            >
                Keep Editing
            </Button>
            <Button
                onClick={onDiscard}
                variant="contained"
                color="error"
                sx={{ textTransform: 'none', fontWeight: 600 }}
            >
                Discard
            </Button>
        </DialogActions>
    </Dialog>
);

export default ConfirmDiscardDialog;
