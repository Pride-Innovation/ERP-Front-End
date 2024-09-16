import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { IModalComponent } from './interface';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    p: 4,
};

export default function ModalComponent({
    children,
    open,
    handleClose,
    width = "40%"
}: IModalComponent) {
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ ...style, width }}>
                    {children}
                </Box>
            </Modal>
        </div>
    );
}
