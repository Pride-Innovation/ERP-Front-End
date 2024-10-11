import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { IModalComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';

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
    width = "40%",
    title
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
                    <TypographyComponent sx={{ mb: 3, textTransform: "uppercase" }} size='17px' weight={600} >
                        {title}
                    </TypographyComponent>
                    {children}
                </Box>
            </Modal>
        </div>
    );
}
