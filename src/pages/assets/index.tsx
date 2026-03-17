/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Button,
  Typography,
  Stack,
  alpha,
  useTheme,
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

const AssetsManagement = () => {
  const [path, setPath] = useState<string>("");
  const [navigations, setNavigations] = useState<INavigation[]>([] as INavigation[]);
  const { id } = useParams<{ id: string }>();
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const { pathname } = useLocation();
  const { determineAssetTypeByAssetName } = AssetUtills();
  const theme = useTheme();

  const navigate = useNavigate();
  const { fetchAllAssetTypes } = AssetTypeUtills();

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
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Navigation Header */}
      <Box
        sx={{
          mb: 2.5,
          px: 0.5,
          py: 0.5,
          bgcolor: '#fff',
          borderRadius: 2,
          border: `1px solid ${alpha('#000', 0.07)}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, p: 0.5 }}>
          {navigations.map(item => {
            const isActive = determineActivePath(item);
            return (
              <Button
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                key={item.id}
                variant={isActive ? "contained" : "text"}
                sx={{
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.8,
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
                  '&:hover': {
                    boxShadow: isActive ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                  },
                }}
              >
                {item.text}
              </Button>
            );
          })}
        </Stack>

        {navigations.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              px: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {navigations.find(item => determineActivePath(item))?.text || 'Assets'}
          </Typography>
        )}
      </Box>

      <Outlet />
    </Box>
  );
};

export default AssetsManagement;