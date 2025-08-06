/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Paper,
  Grid,
  Typography,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
  Container,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router';
import { useEffect, useState } from 'react';
import { INavigation } from './interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AssetTypeUtills from '../settings/assetTypes/utills';
import AssetUtills from './Utills';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Brand colors
const PRIMARY_COLOR = '#08796C';

const AssetsManagement = () => {
  const [path, setPath] = useState<string>("");
  const [navigations, setNavigations] = useState<INavigation[]>([] as INavigation[]);
  const { id } = useParams<{ id: string }>();
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const { pathname } = useLocation();
  const { determineAssetTypeByAssetName } = AssetUtills();

  const navigate = useNavigate();
  const { fetchAllAssetTypes } = AssetTypeUtills();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchAllAssetTypes();
  }, []);

  useEffect(() => {
    setPath(pathname);
  }, [pathname]);

  const determineNavigation = () => {
    const data = assetTypes
      .map(assetType => determineAssetTypeByAssetName(assetType))
      .filter(item => item != null) as Array<INavigation>;

    setNavigations(data);
  };

  useEffect(() => {
    if (assetTypes.length > 0) {
      determineNavigation();
    }
  }, [assetTypes]);

  const determineActivePath = (item: INavigation): boolean => {
    if (path === `${item.otherRoutes[1]}/${id}`) return true;
    if (path === `${item.path}/${id}`) return true;
    return [item.path, ...item.otherRoutes].includes(path);
  };


  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: alpha('#f8f9fa', 0.8),
          border: `1px solid ${alpha('#000', 0.07)}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            top: -15,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(PRIMARY_COLOR, 0.05)} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />

        <Box sx={{ mb: 1.5, pl: 0.5 }}>
          <Typography
            variant="subtitle2"
            fontWeight={500}
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DashboardIcon fontSize="small" />
            Asset Categories
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          {navigations.length > 0 ? (
            navigations.map((item) => {
              const isActive = determineActivePath(item);

              return (
                <Grid item key={item.id} xs={isMobile ? 6 : isTablet ? 4 : 'auto'}>
                  <Tooltip
                    title={item.text || ''}
                    placement="top"
                    TransitionComponent={Fade}
                    arrow
                    enterDelay={700}
                  >
                    <Chip
                      icon={item.icon}
                      label={item.text}
                      onClick={() => navigate(item.path)}
                      color={isActive ? "primary" : "default"}
                      variant={isActive ? "filled" : "outlined"}
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        borderColor: isActive ? 'transparent' : alpha('#000', 0.15),
                        '& .MuiChip-icon': {
                          fontSize: '1.2rem',
                          color: isActive ? 'inherit' : PRIMARY_COLOR,
                        },
                        '&:hover': {
                          backgroundColor: isActive
                            ? alpha(PRIMARY_COLOR, 0.9)
                            : alpha(PRIMARY_COLOR, 0.1),
                        },
                        transition: 'all 0.2s ease-in-out',
                        ...(isActive ? {
                          boxShadow: `0 2px 6px ${alpha(PRIMARY_COLOR, 0.4)}`,
                        } : {}),
                        width: isMobile ? '100%' : 'auto',
                        height: 'auto'
                      }}
                    />
                  </Tooltip>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 2,
                  color: 'text.secondary'
                }}
              >
                <Typography variant="body2">
                  Loading asset categories...
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box sx={{ position: 'relative' }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default AssetsManagement;