import { Box } from "@mui/material"
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import React from "react";
import { toast } from "react-toastify";

const FilterByTagName = () => {
    const [searchText, setSearchText] = React.useState<string>("");

    const handleSeacrh = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!searchText.trim()) {
            toast.error("Please enter a tag name to search.");
            return;
        }
        // Implement search functionality here
        console.log("Searching for tag:", searchText);

    }
    return (
        <Box>
            <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
            >
                <IconButton sx={{ p: '10px' }} aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search By Tag Name"
                    inputProps={{ 'aria-label': 'search google maps' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                />
                <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSeacrh(e)} type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSeacrh(e)} color="primary" sx={{ p: '10px' }} aria-label="directions">
                    <DirectionsIcon />
                </IconButton>
            </Paper>
        </Box>
    )
}

export default FilterByTagName