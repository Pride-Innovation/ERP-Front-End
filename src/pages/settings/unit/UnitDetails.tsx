/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { IUnitDetails } from './interface'
import { grey } from '@mui/material/colors'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
// import ScaleIcon from '@mui/icons-material/Scale';
import BedroomBabyOutlinedIcon from '@mui/icons-material/BedroomBabyOutlined';


const UnitDetails = ({
    unit,
    deleteUnit,
    updateUnit
}: IUnitDetails) => {
    return (
        <Card sx={{
            boxShadow: 0,
            p: 2,
            border: `2px solid ${grey[200]}`,
        }}>
            <Box
                sx={{ width: "100%", alignItems: "center" }}
                py={1.5}
            >
                <Typography noWrap variant="body2" sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <BedroomBabyOutlinedIcon fontSize="small" color="info" sx={{ mr: "4px", fontSize: "16px" }} />
                    {unit.name}
                </Typography>
            </Box>
            <Stack
                direction="column"
                spacing={2}
                sx={{
                    pt: 3,
                    borderTop: `2px solid ${grey[200]}`,
                    alignItems: "center",
                    height: "100%"
                }} >
                <Typography variant="caption" sx={{ fontWeight: 400, textAlign: "center" }}>
                    Department: <b> {unit.department?.name}</b>
                </Typography>
                <Button
                    onClick={() => updateUnit(unit)}
                    sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                <Button
                    onClick={() => deleteUnit(unit)}
                    sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>
            </Stack>
        </Card >
    )
}

export default UnitDetails