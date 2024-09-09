import { Typography } from '@mui/material'
import { ITypographyComponent } from './interface'

const TypographyComponent = ({ text, fontWeight, fontSize }: ITypographyComponent) => {
  return (
    <Typography
      sx={(theme) => ({
        color: theme.palette.grey[700],
        fontWeight: fontWeight,
        fontSize: fontSize
      })}
    >{text}</Typography>
  )
}

export default TypographyComponent