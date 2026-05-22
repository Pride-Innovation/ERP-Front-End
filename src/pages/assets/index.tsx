/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Tab, Tabs } from '@mui/material';
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
import { ROUTES } from '../../core/routes/routes';
import { PageHero } from '../../components/layout';

const AssetsManagement = () => {
  const [navigations, setNavigations] = useState<INavigation[]>([] as INavigation[]);
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const { itAssets } = useSelector((state: RootState) => state.ITAssetStore);
  const { officeAsset } = useSelector((state: RootState) => state.OfficeAssetStore);
  const { fleetAssets } = useSelector((state: RootState) => state.FleetStore);
  const { pathname } = useLocation();
  const { determineAssetTypeByAssetName } = AssetUtills();

  const navigate = useNavigate();
  const { fetchAllAssetTypes } = AssetTypeUtills();

  const activeCount = useMemo(() => {
    if (pathname.startsWith(ROUTES.LIST_IT_EQUIPMENT)) return itAssets.length;
    if (pathname.startsWith(ROUTES.LIST_OFFICE_EQUIPMENT)) return officeAsset.length;
    if (pathname.startsWith(ROUTES.LIST_FLEET)) return fleetAssets.length;
    return 0;
  }, [pathname, itAssets.length, officeAsset.length, fleetAssets.length]);

  const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

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
    const idx = navigations.findIndex(nav =>
      pathname === nav.path || pathname.startsWith(nav.path + '/')
    );
    return idx >= 0 ? idx : false;
  }, [pathname, navigations]);

  const activeNavLabel = navigations.find(nav =>
    pathname === nav.path || pathname.startsWith(nav.path + '/')
  )?.text;

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <PageHero
        title="Asset Management"
        subtitle={`${activeNavLabel ? `${activeNavLabel} · ` : ''}Manage and track organizational assets`}
        icon={<InventoryOutlinedIcon />}
        stat={{
          value: activeCount.toLocaleString(),
          label: 'records',
          helper: todayLabel,
        }}
        tabs={
          navigations.length > 0 ? (
            <Tabs
              value={activeTabIndex}
              onChange={(_, idx) => navigate(navigations[idx].path)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  fontSize: '0.82rem',
                  minHeight: 44,
                  textTransform: 'none',
                  px: 1.75,
                  py: 0,
                  gap: 0.75,
                },
              }}
            >
              {navigations.map((nav) => (
                <Tab
                  key={nav.id}
                  label={nav.text}
                  icon={nav.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          ) : undefined
        }
      />

      <Box sx={{ px: { xs: 0, md: 0 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AssetsManagement;