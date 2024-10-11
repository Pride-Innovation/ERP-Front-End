import { Grid, Stack, Typography } from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IDispose } from "./interface";

const Dispose = ({
    handleClose,
    sendingRequest,
    buttonText
}: IDispose) => {
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                <Grid item xs={12} md={6}>
                    <Typography> Dispose off</Typography>
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
                        <ButtonComponent
                            handleClick={handleClose}
                            buttonColor='error'
                            type='button'
                            sendingRequest={false}
                            buttonText="Close" />
                        <ButtonComponent
                            buttonColor='success'
                            type='submit'
                            sendingRequest={sendingRequest}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default Dispose;