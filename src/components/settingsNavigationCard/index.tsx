import {
    Card,
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
        <Card
            elevation={2}
            sx={{
                p: 3,
                mb: 4,
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                alignItems: isSmallScreen ? "stretch" : "center",
                justifyContent: "space-between",
                gap: 2,
            }}
        >
            {/* Search */}
            <TextField
                placeholder="Filter by name"
                size="small"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearchChange?.(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchOutlinedIcon color="info" />
                        </InputAdornment>
                    ),
                }}
                sx={{ width: isSmallScreen ? "100%" : "300px" }}
            />

            {/* Action + Pagination */}
            <Stack
                direction={isSmallScreen ? "column" : "row"}
                spacing={2}
                alignItems="center"
                justifyContent="flex-end"
                width={isSmallScreen ? "100%" : "auto"}
            >
                <ButtonComponent
                    handleClick={handleCreationClicked}
                    sendingRequest={false}
                    buttonText={`Create ${title}`}
                    variant="contained"
                    buttonColor="info"
                    type="button"
                />

                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        color="primary"
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 60, textAlign: 'center' }}>
                        Page {currentPage} of {totalPages}
                    </Typography>
                    <IconButton
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        color="primary"
                    >
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>
        </Card>
    );
};

export default SettingsHeader;
