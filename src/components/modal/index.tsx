import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { IModalComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import { Divider } from '@mui/material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    py: 4,
    borderRadius: "4px"
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
                    <TypographyComponent sx={{ mb: 3, px: 4, textTransform: "uppercase" }} size='17px' weight={600} >
                        {title}
                    </TypographyComponent>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ width: "100%", px: 4 }}>
                        {children}
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
