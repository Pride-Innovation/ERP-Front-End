/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Box,
    TextField,
    InputAdornment,
    useTheme,
    Stack,
    IconButton,
    Typography,
    useMediaQuery
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ChangeEvent } from 'react';
import ButtonComponent from '../forms/Button';

interface HeaderProps {
    handleCreationClicked?: () => void;
    handleSearchChange?: (value: string) => void;
    handleNextPage?: () => void;
    handlePrevPage?: () => void;
    currentPage?: number;
    totalPages?: number;
    title: string
}

const SettingsHeader = ({
    handleCreationClicked,
    handleSearchChange,
    handleNextPage,
    handlePrevPage,
    currentPage,
    totalPages,
    title
}: HeaderProps) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                mb: 3,
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                alignItems: isSmallScreen ? "stretch" : "center",
                justifyContent: "space-between",
                gap: 2,
                bgcolor: '#fff',
                borderRadius: 2,
                border: `1px solid ${alpha('#000', 0.07)}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
        >
            {/* Search */}
            <TextField
                placeholder={`Filter ${title.toLowerCase()}s by name...`}
                size="small"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearchChange?.(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    width: isSmallScreen ? "100%" : "280px",
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: alpha('#000', 0.02),
                        '& fieldset': { borderColor: alpha('#000', 0.1) },
                        '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    }
                }}
            />

            {/* Action + Pagination */}
            <Stack
                direction={isSmallScreen ? "column" : "row"}
                spacing={1.5}
                alignItems="center"
                justifyContent="flex-end"
                width={isSmallScreen ? "100%" : "auto"}
            >
                <ButtonComponent
                    handleClick={handleCreationClicked}
                    sendingRequest={false}
                    buttonText={`+ Create ${title}`}
                    variant="contained"
                    buttonColor="primary"
                    type="button"
                />

                <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                        bgcolor: alpha('#000', 0.03),
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                        border: `1px solid ${alpha('#000', 0.07)}`,
                    }}
                >
                    <IconButton
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                    >
                        <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            minWidth: 70,
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: 'text.secondary',
                        }}
                    >
                        {currentPage} / {totalPages}
                    </Typography>
                    <IconButton
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                    >
                        <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Stack>
            </Stack>
        </Box>
    );
};

export default SettingsHeader;
