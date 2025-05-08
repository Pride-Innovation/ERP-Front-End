/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Link,
  styled,
  Typography,
  TypographyProps,
} from '@mui/material';

interface ITypographyComponent {
  weight?: number;
  size?: string;
  color?: string;
}


interface ILinkComponent {
  weight: number;
  size?: string;
  text?: string;
  href: string
}


const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'weight' && prop !== 'size' && prop !== 'color'
})<ITypographyComponent>(({ theme, weight = 400, size = '16px', color }) => ({
  fontWeight: weight,
  fontSize: size,
  color: color || theme.palette.text.primary,
}));


export const TypographyComponent = ({
  weight,
  size,
  color,
  ...rest
}: ITypographyComponent & TypographyProps) => {
  return <StyledTypography weight={weight} size={size} color={color} {...rest} />;
};

export const LinkComponent = ({
  weight,
  size = '16px',
  text,
  href = "#"
}: ILinkComponent) => (
  <Link href={href} underline='hover' fontSize={size} sx={{ cursor: "pointer" }} fontWeight={weight}>{text}</Link>
)

export const FormHeader = ({ header }: { header: string }) => (
  <Typography sx={{ mb: 4, fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>{header}</Typography>
)