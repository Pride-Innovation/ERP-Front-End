/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Button, CircularProgress } from '@mui/material'
import { IButton } from './interface'

const ButtonComponent = ({
  sendingRequest,
  buttonText,
  type = 'button',
  buttonColor = "primary",
  variant = 'contained',
  handleClick
}: IButton) => {
  return (
    <Button
      color={buttonColor}
      type={type}
      onClick={handleClick}
      variant={variant}
      sx={{ width: "100%", minHeight: "40px", textTransform: 'capitalize' }}
      startIcon={
        sendingRequest ? (
          <CircularProgress size="small" />
        ) : ('')
      }
      disabled={sendingRequest}

    >{sendingRequest ? "Loading!!" : buttonText}</Button>
  )
}

export default ButtonComponent