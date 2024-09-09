import { Button, CircularProgress } from '@mui/material'
import { IButton } from './interface'

const ButtonComponent = ({ sendingRequest, buttonText, type='button' }: IButton) => {
  return (
    <Button
      type={type}
      variant='contained'
      sx={{ width: "100%", minHeight: "40px", textTransform: 'capitalize' }}
      startIcon={
        sendingRequest ? (
          <CircularProgress />
        ) : ('')
      }
      disabled={sendingRequest}

    >{sendingRequest ? "Loading" : buttonText}</Button>
  )
}

export default ButtonComponent