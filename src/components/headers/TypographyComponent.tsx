import {
  styled,
  Typography,
} from '@mui/material';

interface ITypographyComponent {
  font: number;
  size?: string;
}

export const TypographyComponent = styled(Typography)<ITypographyComponent>(({ theme, font, size='16px' }) => ({
  color: theme.palette.grey[800],
  fontWeight: font,
  fontSize: size,
  lineHeight: '19.07px'
}));
