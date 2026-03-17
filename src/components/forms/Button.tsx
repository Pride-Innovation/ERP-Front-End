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
      sx={{
        width: "100%",
        minHeight: "40px",
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        borderRadius: '8px',
        letterSpacing: '0.01em',
        ...(variant === 'contained' && {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none',
          },
        }),
        ...(variant === 'outlined' && {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        }),
        transition: 'all 0.2s ease',
      }}
      startIcon={
        sendingRequest ? (
          <CircularProgress size={16} color="inherit" />
        ) : null
      }
      disabled={sendingRequest}
    >
      {sendingRequest ? "Processing..." : buttonText}
    </Button>
  )
}

export default ButtonComponent