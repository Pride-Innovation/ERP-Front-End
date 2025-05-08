import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { IModalComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import { Divider, useTheme } from '@mui/material';

export default function ModalComponent({
    children,
    open,
    handleClose,
    width = "40%",
    title
}: IModalComponent) {
    const theme = useTheme();

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: width },
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 24,
                    px: { xs: 3, sm: 4 },
                    py: 4,
                }}
            >
                <TypographyComponent
                    id="modal-title"
                    size="18px"
                    weight={700}
                    sx={{
                        mb: 1,
                        textTransform: 'uppercase',
                        color: theme.palette.secondary.main,
                        letterSpacing: 0.5,
                    }}
                >
                    {title}
                </TypographyComponent>

                <Divider sx={{ mb: 3, borderColor: theme.palette.grey[300] }} />

                <Box id="modal-description">
                    {children}
                </Box>
            </Box>
        </Modal>
    );
}
