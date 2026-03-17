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
                    bgcolor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '50px',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.4)',
                    },
                    '&:focus-within': {
                        bgcolor: 'rgba(255,255,255,0.22)',
                        border: '1px solid rgba(255,255,255,0.55)',
                        boxShadow: '0 0 0 3px rgba(255,255,255,0.1)',
                    },
                }}
            >
                <InputBase
                    sx={{
                        ml: 0.5,
                        flex: 1,
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: '0.875rem',
                        '& input::placeholder': {
                            color: 'rgba(255,255,255,0.6)',
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
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.28)',
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