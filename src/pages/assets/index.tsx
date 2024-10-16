import {
  Button,
  Card,
  Grid,
  Stack
} from '@mui/material';
import {
  Outlet,
  useLocation,
  useNavigate
} from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import { useEffect, useState } from 'react';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import BalanceIcon from '@mui/icons-material/Balance';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';

const AssetsManagement = () => {
  const [path, setPath] = useState<string>("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setPath(pathname) }, [pathname])

  const navigations: Array<{ id: number, text: string, path: string, icon: JSX.Element }> = [
    {
      id: 1,
      text: "IT Equipment",
      path: ROUTES.LIST_ASSETS,
      icon: <SettingsBrightnessIcon />
    },
    {
      id: 2,
      text: "Office Equipment",
      path: ROUTES.LIST_OFFICE_EQUIPMENT,
      icon: <BalanceIcon />
    },
    {
      id: 3,
      text: "Fleet",
      path: ROUTES.LIST_FLEET,
      icon: <DirectionsCarFilledIcon />
    }
  ]

  return (
    <>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid xs={12} container>
          <Stack direction="row" spacing={1}>
            {navigations.map(item => (
              <Button
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                key={item.id}
                variant={[path].includes(item.path) ? "contained" : "outlined"}>
                {item.text}
              </Button>
            ))}
          </Stack>
        </Grid>
      </Card>
      <Outlet />
    </>
  )
}

export default AssetsManagement