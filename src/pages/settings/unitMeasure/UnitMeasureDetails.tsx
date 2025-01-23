import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IUnitOfMeasureDetails } from './interface';
import ScaleIcon from '@mui/icons-material/Scale';

const UnitMeasureDetails = ({
    unitOfMeasure,
    deleteUnitOfMeasure,
    updateUnitOfMeasure
}: IUnitOfMeasureDetails) => {
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
                    <ScaleIcon fontSize="small" color="info" sx={{ mr: "4px", fontSize: "16px" }} />
                    {unitOfMeasure.name}
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
                    {unitOfMeasure.symbol}
                </Typography>
                <Button
                    onClick={() => updateUnitOfMeasure(unitOfMeasure)}
                    sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                <Button
                    onClick={() => deleteUnitOfMeasure(unitOfMeasure)}
                    sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>
            </Stack>
        </Card >
    )
}

export default UnitMeasureDetails