/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { CircularProgress, Stack, Typography } from "@mui/material"

const Loading = ({ items }: { items: string }) => {
    return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <CircularProgress color="info" />
            <Typography variant="body2" mt={2}>
                Loading {items}...
            </Typography>
        </Stack>
    )
}

export default Loading