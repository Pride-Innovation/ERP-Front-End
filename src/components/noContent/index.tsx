/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { Stack, Typography } from "@mui/material";
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';


const NoContent = ({ item, items }: { item: string, items: string }) => {
    return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <FolderOffOutlinedIcon sx={{ fontSize: 60, color: "#835F1E" }} />
            <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
                No {items} available
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Create your first {item} to get started.
            </Typography>
        </Stack>
    )
}

export default NoContent