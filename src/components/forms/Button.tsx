import { Button, CircularProgress } from '@mui/material'
import { IButton } from './interface'

const ButtonComponent = ({
  sendingRequest,
  buttonText,
  type = 'button',
  buttonColor = "primary",
  variant = 'contained'
}: IButton) => {
  return (
    <Button
      color={buttonColor}
      type={type}
      variant={variant}
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