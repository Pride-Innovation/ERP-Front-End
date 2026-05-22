import { Box } from "@mui/material"
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import React from "react";
import { toast } from "react-toastify";
import { findAssetByTagNameService } from "./service";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../core/routes/routes";
import { IAsset } from "../../pages/assets/interface";

const FilterByTagName = () => {
    const [searchText, setSearchText] = React.useState<string>("");
    const navigate = useNavigate();

    const handleSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!searchText.trim()) {
            toast.error("Please enter a tag name to search.");
            return;
        }
        try {
            const result = await findAssetByTagNameService(searchText) as IAsset;
            if (result && result.id) {
                navigate(`${ROUTES.LIST_ASSETS}/${result.id}`);
            }
        } catch (error) {
            console.error("Error searching for tag:", error);
        }
    };

    return (
        <Box>
            <Paper
                component="form"
                elevation={0}
                sx={{
                    p: '4px 6px 4px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    width: { xs: 200, sm: 280, md: 340 },
                    bgcolor: 'grey.50',
                    border: 1,
                    borderColor: 'border.subtle',
                    borderRadius: '50px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: 'grey.100',
                        borderColor: 'border.default',
                    },
                    '&:focus-within': {
                        bgcolor: 'background.paper',
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 0 0 3px ${theme.palette.brand[100]}`,
                    },
                }}
            >
                <InputBase
                    sx={{
                        ml: 0.5,
                        flex: 1,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        '& input::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                        },
                    }}
                    placeholder="Search by tag name..."
                    inputProps={{ 'aria-label': 'search asset by tag name' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(e as unknown as React.MouseEvent<HTMLButtonElement>);
                        }
                    }}
                />
                <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSearch(e)}
                    type="button"
                    size="small"
                    sx={{
                        p: '6px',
                        bgcolor: 'primary.main',
                        color: '#fff',
                        borderRadius: '50%',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                            color: '#fff',
                        },
                    }}
                    aria-label="search"
                >
                    <SearchIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default FilterByTagName;