/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Button,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router';
import { ROUTES } from '../../../core/routes/routes';
import { useEffect, useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ListIcon from '@mui/icons-material/List';
import RoutesUtills from '../../../core/routes/utills';
import { IPermission } from '../../settings/interface';
import { INavigation } from '../interface';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

const RequestsManagement = () => {
  const [path, setPath] = useState<string>("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { routePermission } = RoutesUtills();

  useEffect(() => { setPath(pathname) }, [pathname])

  const navigations: Array<INavigation> = [
    {
      id: 1,
      text: "All Requests",
      path: ROUTES.REQUEST,
      icon: <ListIcon />,
      permission: routePermission(8) as IPermission
    },
    {
      id: 2,
      text: "Pending Requests",
      path: ROUTES.LIST_PENDING,
      icon: <RestartAltIcon color='warning' />,
      permission: routePermission(12) as IPermission
    },
    {
      id: 3,
      text: "Rejected Requests",
      path: ROUTES.LIST_REJECTED,
      icon: <CancelIcon color='error' />,
      permission: routePermission(16) as IPermission
    },
    {
      id: 4,
      text: "Issued Requests",
      path: ROUTES.LIST_ISSUED,
      icon: <ShareOutlinedIcon sx={{ color: "blue" }} />,
      permission: routePermission(16) as IPermission
    }
  ]

  const determineActivePath = (item: INavigation): boolean => {
    if (path === `${item.path}/${id}`) return true;
    return [item.path].includes(path);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Box width={'100%'} sx={{ px: 3, pt: 2, pb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: '1500px',
            mb: 2,
            bgcolor: '#fff',
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            p: 2,
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
            <Grid item xs={12} sm="auto">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(8,121,108,0.1)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InventoryOutlinedIcon fontSize='small' />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
                    Requests
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                    {navigations.find(item => determineActivePath(item))?.text || 'All Requests'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                {navigations.map(item => (
                  <Button
                    key={item.id}
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    variant={determineActivePath(item) ? "contained" : "text"}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: determineActivePath(item) ? 600 : 500,
                      fontSize: '0.8rem',
                      px: 1.5,
                      py: 0.75,
                      boxShadow: determineActivePath(item) ? '0 2px 8px rgba(8,121,108,0.25)' : 'none',
                      bgcolor: determineActivePath(item) ? 'primary.main' : 'transparent',
                      color: determineActivePath(item) ? '#fff' : 'text.secondary',
                      '&:hover': {
                        bgcolor: determineActivePath(item) ? 'primary.dark' : 'rgba(8,121,108,0.06)',
                        color: determineActivePath(item) ? '#fff' : 'primary.main',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Outlet />
    </Box>
  )
}

export default RequestsManagement