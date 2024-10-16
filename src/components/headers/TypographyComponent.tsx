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
}));

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