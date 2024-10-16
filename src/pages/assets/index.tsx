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

const AssetsManagement = () => {
  const [path, setPath] = useState<string>("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setPath(pathname) }, [pathname])

  const navigations: Array<{ id: number, text: string, path: string }> = [
    {
      id: 1,
      text: "IT Equipment",
      path: ROUTES.LIST_ASSETS
    },
    {
      id: 2,
      text: "Office Equipment",
      path: ROUTES.LIST_OFFICE_EQUIPMENT
    },
    {
      id: 3,
      text: "Fleet",
      path: ROUTES.LIST_FLEET
    }
  ]

  return (
    <>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid xs={12} container>
          <Stack direction="row" spacing={4}>
            {navigations.map(item => (
              <Button
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