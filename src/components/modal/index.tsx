/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { IModalComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import { alpha, Divider, useTheme } from '@mui/material';

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
            sx={{
                backdropFilter: 'blur(4px)',
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(17, 24, 39, 0.55)',
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95%', sm: width },
                    maxHeight: { xs: '95vh', sm: '90vh' },
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 3,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    animation: 'modalIn 0.25s ease-out',
                    '@keyframes modalIn': {
                        from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.97)' },
                        to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                    },
                }}
            >
                {/* Header — fixed */}
                <Box
                    sx={{
                        px: { xs: 3, sm: 4 },
                        pt: 3,
                        pb: 2,
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    }}
                >
                    <TypographyComponent
                        id="modal-title"
                        size="1rem"
                        weight={700}
                        sx={{
                            textTransform: 'uppercase',
                            color: theme.palette.primary.main,
                            letterSpacing: '0.06em',
                        }}
                    >
                        {title}
                    </TypographyComponent>
                </Box>

                {/* Scrollable content */}
                <Box
                    id="modal-description"
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        px: { xs: 3, sm: 4 },
                        py: 3,
                        '&::-webkit-scrollbar': { width: '5px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                        '&::-webkit-scrollbar-thumb': {
                            background: alpha(theme.palette.primary.main, 0.3),
                            borderRadius: '3px',
                        },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Modal>
    );
}
