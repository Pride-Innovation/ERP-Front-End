import { toast } from 'react-toastify';
import { IDeleteTitle, ITitleAxiosResponse } from './interface';
import { deleteTitleService } from './service';
import TitleUtills from './utills';
import { Grid, Stack, Typography } from '@mui/material';
import ButtonComponent from '../../../components/forms/Button';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

const DeleteTitle = ({ sendingRequest, setSendingRequest, handleClose, buttonText, title }: IDeleteTitle) => {
    const { removeTitleFromStore } = TitleUtills()

    const deleteBranch = async () => {
        setSendingRequest(true)
        try {
            const response = await deleteTitleService(title?.id as string) as ITitleAxiosResponse;
            if (response.status === 204) {
                toast.success("Commodity deleted successfully")
                removeTitleFromStore(title)
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
        handleClose()
    }

    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this Title?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <WorkOutlineOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {title.name}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor='info'
                        type='button'
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Close"
                    />
                    <ButtonComponent
                        handleClick={deleteBranch}
                        buttonColor='error'
                        type='submit'
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    )
}

export default DeleteTitle