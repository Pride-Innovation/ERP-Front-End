import {
  Link,
  styled,
  Typography,
} from '@mui/material';

interface ITypographyComponent {
  weight: number;
  size?: string;
  color?: string
}


interface ILinkComponent {
  weight: number;
  size?: string;
  text?: string;
  href: string
}

export const TypographyComponent = styled(Typography)<ITypographyComponent>(({
  theme,
  weight,
  size = '16px',
  color = theme.palette.grey[800]
}) => ({
  color: color,
  fontWeight: weight,
  fontSize: size,
  lineHeight: '19px'
}));

export const LinkComponent = ({
  weight,
  size = '16px',
  text,
  href="#"
}: ILinkComponent) => (
  <Link href={href} underline='hover' fontSize={size} sx={{ cursor: "pointer" }} fontWeight={weight}>{text}</Link>
)
