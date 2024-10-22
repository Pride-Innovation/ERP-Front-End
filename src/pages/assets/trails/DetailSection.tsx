import { Box, IconButton, Typography } from "@mui/material";
import TableUtills from "../../../components/tables/utills";
import TimeLineDot from "../../../components/timeLineDots";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';


const DetailSection = ({
    text, label, icon
}: { text: string; label: string; icon?: JSX.Element }) => {
    const { determineTimeLineDotColor } = TableUtills();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {icon && <IconButton color='info' sx={{ mr: 1, bgcolor: '#FFF', borderRadius: "4px" }}>{icon}</IconButton>}
            <Typography
                variant="body2"
                sx={{
                    bgcolor: "#FFF",
                    p: 1.2,
                    borderRadius: 1,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                <strong>{label}:</strong>
                <span style={{ display: "flex", alignItems: "center" }}>
                    {
                        label === "Status" &&
                        <TimeLineDot color={determineTimeLineDotColor(text.toLocaleLowerCase())} />

                    }
                    {text}
                    {
                        label === "Serial Number" &&
                        <ContentPasteIcon fontSize='small' color='info' sx={{ ml: "5px" }} />
                    }
                    {
                        label === "Purchase Cost" && <span style={{ marginLeft: "5px" }}>UGX</span>
                    }
                </span>
            </Typography>
        </Box>
    );
}

export default DetailSection;