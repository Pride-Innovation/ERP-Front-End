/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Tab,
  Tabs,
  Typography,
  Stack,
  alpha,
} from '@mui/material';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { INavigation } from './interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AssetTypeUtills from '../settings/assetTypes/utills';
import AssetUtills from './Utills';

const PRIMARY_COLOR = '#08796C';

const AssetsManagement = () => {
  const [navigations, setNavigations] = useState<INavigation[]>([] as INavigation[]);
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const { pathname } = useLocation();
  const { determineAssetTypeByAssetName } = AssetUtills();

  const navigate = useNavigate();
  const { fetchAllAssetTypes } = AssetTypeUtills();

  useEffect(() => {
    fetchAllAssetTypes();
  }, []);

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

  const activeTabIndex = useMemo(() => {
    const idx = navigations.findIndex(nav => pathname.startsWith(nav.path));
    return idx >= 0 ? idx : false;
  }, [pathname, navigations]);

  const activeNavLabel = navigations.find(nav => pathname.startsWith(nav.path))?.text;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5FB', pb: 4 }}>

      {/* ── Gradient Header ───────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #065E53 60%, #044a42 100%)`,
          px: { xs: 2, md: 4 },
          pt: 3,
          pb: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.04), pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 140, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.03), pointerEvents: 'none' }} />

        {/* Title row */}
        <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2.5 }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: 2,
            bgcolor: alpha('#fff', 0.15),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            flexShrink: 0,
          }}>
            <InventoryOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
              Asset Management
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.70), mt: 0.25 }}>
              {activeNavLabel ? `${activeNavLabel} · ` : ''}Manage and track organizational assets
            </Typography>
          </Box>
        </Stack>

        {/* Navigation Tabs */}
        {navigations.length > 0 && (
          <Tabs
            value={activeTabIndex}
            onChange={(_, idx) => navigate(navigations[idx].path)}
            TabIndicatorProps={{ style: { backgroundColor: '#fff', height: 3, borderRadius: '2px 2px 0 0' } }}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                color: alpha('#fff', 0.62),
                fontWeight: 500,
                fontSize: '0.82rem',
                minHeight: 44,
                textTransform: 'none',
                px: 1.75,
                py: 0,
                gap: 0.75,
                '&.Mui-selected': { color: '#fff', fontWeight: 700 },
                '&:hover': { color: alpha('#fff', 0.9) },
              },
            }}
          >
            {navigations.map(nav => (
              <Tab
                key={nav.id}
                label={nav.text}
                icon={nav.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        )}
      </Box>

      {/* ── Page content (sub-route outlet) ───────────────────── */}
      <Box sx={{ px: { xs: 1, md: 3 }, pt: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AssetsManagement;