import { Grid, Stack, Typography } from '@mui/material'
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import ButtonComponent from '../../../components/forms/Button';
import { IDeleteBranch } from './interface';
import { deleteBranchService } from './service';
import { toast } from 'react-toastify';
import BranchUtills from './utills';

const DeleteBranch = ({
    branch,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText
}: IDeleteBranch) => {
    const { removeBranchToStore } = BranchUtills();

    const deleteBranch = async () => {
        setSendingRequest(true)
        const response = await deleteBranchService(branch?.id as string);
        setSendingRequest(false)
        if (response?.status === "success") {
            removeBranchToStore(branch)
            handleClose();
            toast.success(response?.data?.message)
        }
    }

    return (
        <Grid item container spacing={4} xs={12}>
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    Are you sure you want to delete this Branch?
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CameraOutdoorOutlinedIcon color="primary" />
                    <Typography variant="h6" color="primary">
                        {branch.name}
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

export default DeleteBranch