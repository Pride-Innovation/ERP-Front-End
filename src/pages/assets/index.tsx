/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Card,
  Button,
  Typography,
  Stack,
  Grid
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
import ListAltIcon from '@mui/icons-material/ListAlt';

const AssetsManagement = () => {
  const [path, setPath] = useState<string>("");
  const [navigations, setNavigations] = useState<INavigation[]>([] as INavigation[]);
  const { id } = useParams<{ id: string }>();
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const { pathname } = useLocation();
  const { determineAssetTypeByAssetName } = AssetUtills();

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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Box width={'100%'} sx={{ px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ p: 3, mb: 2, width: '100%', m: 3, justifyContent: "center", maxWidth: "1500px" }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Stack direction="row" spacing={1} alignItems="center">
                <ListAltIcon fontSize='small' sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="500" color="primary">
                  {navigations.find(item => item.path === path)?.text || ''}
                </Typography>
              </Stack>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1}>
                {navigations.map(item => (
                  <>
                    <Button
                      startIcon={item.icon}
                      onClick={() => navigate(item.path)}
                      key={item.id}
                      variant={determineActivePath(item) ? "contained" : "outlined"}
                    >
                      {item.text}
                    </Button>
                  </>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Box>
      <Outlet />
    </Box>
  );
};

export default AssetsManagement;