import {
  Button,
  Card,
  Grid,
  Stack
} from '@mui/material';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import { useEffect, useState } from 'react';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import BalanceIcon from '@mui/icons-material/Balance';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import RoutesUtills from '../../core/routes/utills';
import { IPermission } from '../settings/interface';
import { INavigation } from './interface';

const RequestsManagement = () => {
  const [path, setPath] = useState<string>("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { routePermission, determinePermission } = RoutesUtills();


  useEffect(() => { setPath(pathname) }, [pathname])

  const navigations: Array<INavigation> = [
    {
      id: 1,
      text: "All Requests",
      path: ROUTES.REQUEST,
      icon: <SettingsBrightnessIcon />,
      permission: routePermission(8) as IPermission
    },
    {
      id: 2,
      text: "Pending Requests",
      path: ROUTES.LIST_PENDING,
      icon: <BalanceIcon />,
      permission: routePermission(12) as IPermission
    },
    {
      id: 3,
      text: "Rejected Requests",
      path: ROUTES.LIST_REJECTED,
      icon: <DirectionsCarFilledIcon />,
      permission: routePermission(16) as IPermission
    }
  ]

  const determineActivePath = (item: INavigation): boolean => {
    if (path === `${item.path}/${id}`) return true;
    return [item.path].includes(path);
  }

  return (
    <>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid xs={12} container>
          <Stack direction="row" spacing={1}>
            {navigations.map(item => (
              <>
                {determinePermission(item.permission) && <Button
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  key={item.id}
                  variant={determineActivePath(item) ? "contained" : "outlined"}
                >
                  {item.text}
                </Button>}
              </>
            ))}
          </Stack>
        </Grid>
      </Card>
      <Outlet />
    </>
  )
}

export default RequestsManagement