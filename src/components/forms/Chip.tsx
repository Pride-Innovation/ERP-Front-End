/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Chip } from '@mui/material'
import { IChip } from './interface'
import { useTheme, alpha } from '@mui/material/styles'

const ChipComponent = ({
    label,
    icon,
    variant = 'outlined',
    size = 'medium',
    color = 'success',
    ...rest
}: IChip) => {
    const theme = useTheme()

    const mainColor = theme.palette[color]?.main || theme.palette.success.main

    return (
        <Chip
            color={color}
            size={size}
            label={label}
            icon={icon}
            variant={variant}
            sx={{
                backgroundColor: variant === 'filled' ? alpha(mainColor, 0.1) : undefined,
                color: variant === 'filled' ? mainColor : undefined,
                fontWeight: 500
            }}
            {...rest}
        />
    )
}

export default ChipComponent