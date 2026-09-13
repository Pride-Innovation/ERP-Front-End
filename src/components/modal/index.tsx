/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { IModalComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import { alpha, useTheme } from '@mui/material';

/**
 * The app's dialog shell: a fixed header, a scrolling body, and an optional pinned footer.
 *
 * <p>Every prop past `title` is optional and additive — this component backs ~105 call sites, so a
 * caller that passes nothing new keeps exactly the dialog it had, plus the close button.
 */
export default function ModalComponent({
    children,
    open,
    handleClose,
    width = "40%",
    // No cap by default: existing callers span 34%–100% and a default ceiling would silently
    // resize dialogs that deliberately asked for the room. Opt in per dialog.
    maxWidth = 'none',
    title,
    icon,
    subtitle,
    headerAction,
    footer,
    hideCloseButton = false,
}: IModalComponent) {
    const theme = useTheme();

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
                backdropFilter: 'blur(4px)',
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(17, 24, 39, 0.55)',
                },
            }}
        >
            <Fade in={open} timeout={200}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: width },
                        maxWidth,
                        maxHeight: { xs: '95vh', sm: '90vh' },
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        outline: 'none',
                    }}
                >
                    {/* Header — fixed */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            px: { xs: 2.5, sm: 3.5 },
                            pt: 2.5,
                            pb: 2,
                            flexShrink: 0,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                        }}
                    >
                        {icon && (
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    width: 38,
                                    height: 38,
                                    borderRadius: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: theme.palette.primary.main,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    '& .MuiSvgIcon-root': { fontSize: 20 },
                                }}
                            >
                                {icon}
                            </Box>
                        )}

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <TypographyComponent
                                id="modal-title"
                                size="1rem"
                                weight={700}
                                sx={{
                                    textTransform: 'uppercase',
                                    color: theme.palette.primary.main,
                                    letterSpacing: '0.06em',
                                    lineHeight: 1.3,
                                }}
                            >
                                {title}
                            </TypographyComponent>
                            {subtitle && (
                                <Box
                                    sx={{
                                        mt: 0.5,
                                        fontSize: '0.78rem',
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {subtitle}
                                </Box>
                            )}
                        </Box>

                        {headerAction && (
                            <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', pt: 0.25 }}>
                                {headerAction}
                            </Box>
                        )}

                        {!hideCloseButton && (
                            <Tooltip title="Close" arrow>
                                <IconButton
                                    onClick={handleClose}
                                    size="small"
                                    aria-label="Close dialog"
                                    sx={{
                                        flexShrink: 0,
                                        width: 30,
                                        height: 30,
                                        color: theme.palette.text.secondary,
                                        bgcolor: alpha(theme.palette.common.black, 0.03),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            color: theme.palette.error.main,
                                            borderColor: alpha(theme.palette.error.main, 0.3),
                                        },
                                    }}
                                >
                                    <CloseRoundedIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Scrollable content */}
                    <Box
                        id="modal-description"
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            /*
                             * Deliberately left scrollable rather than hidden. Content that does not
                             * fit should size itself to the body (see ConsignmentDetail, which
                             * reflows instead of laying out a 800px table) — but this shell backs
                             * ~105 dialogs, and clipping a wide one here would silently swallow its
                             * content instead of merely making it ugly.
                             */
                            overflowX: 'auto',
                            px: { xs: 2.5, sm: 3.5 },
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

                    {footer && (
                        <Box
                            sx={{
                                flexShrink: 0,
                                px: { xs: 2.5, sm: 3.5 },
                                py: 2,
                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                bgcolor: alpha(theme.palette.common.black, 0.015),
                            }}
                        >
                            {footer}
                        </Box>
                    )}
                </Box>
            </Fade>
        </Modal>
    );
}
