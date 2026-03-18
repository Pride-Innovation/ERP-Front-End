/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Button,
  Chip,
  Typography,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
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

const PRIMARY_COLOR = '#08796C';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: 3 }}>
      {/* Branded Asset Management Header + Navigation */}
      <Box
        sx={{
          mb: 2.5,
          bgcolor: '#fff',
          borderRadius: 2,
          border: `1px solid ${alpha('#000', 0.07)}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Branding row */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(PRIMARY_COLOR, 0.08)}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <InventoryOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}>
                Asset Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage and track organizational assets
              </Typography>
            </Box>
          </Stack>

          {navigations.length > 0 && (
            <Chip
              label={navigations.find(item => determineActivePath(item))?.text || 'Assets'}
              size="small"
              sx={{
                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                color: PRIMARY_COLOR,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
              }}
            />
          )}
        </Box>

        {/* Navigation pills row */}
        <Box sx={{ px: 1.5, py: 1, bgcolor: alpha(PRIMARY_COLOR, 0.015) }}>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
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
        </Box>
      </Box>

      <Outlet />
    </Box>
  );
};

export default AssetsManagement;